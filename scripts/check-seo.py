"""Validate generated search metadata without third-party dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'content/seo.json').read_text())
ORIGIN = CONFIG['siteUrl']

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta, self.links, self.schemas = {}, {}, []
        self.title, self.script, self.parts = False, False, []
        self.title_text = ''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            assert 'canonical' not in self.links, 'Duplicate canonical link'
            self.links['canonical'] = attrs.get('href')
        if tag == 'title': self.title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script, self.parts = True, []
    def handle_data(self, text):
        if self.title: self.title_text += text
        if self.script: self.parts.append(text)
    def handle_endtag(self, tag):
        if tag == 'title': self.title = False
        if tag == 'script' and self.script:
            self.schemas.append(json.loads(''.join(self.parts)))
            self.script = False

def local(url):
    parsed = urlsplit(url)
    assert parsed.scheme == 'https' and parsed.netloc == urlsplit(ORIGIN).netloc, url
    assert not parsed.query and not parsed.fragment, url
    return ROOT / (unquote(parsed.path).lstrip('/') or 'index.html')

INDEXABLE = CONFIG.get('indexable', True)
sitemap = ET.parse(ROOT / 'sitemap.xml').getroot() if INDEXABLE else None
ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9', 'image':'http://www.google.com/schemas/sitemap-image/1.1'}
posts = [json.loads(p.read_text()) | {'slug':p.stem} for p in (ROOT/'content/posts').glob('*.json') if json.loads(p.read_text()).get('published') is True]
expected = {ORIGIN+'/' if name == 'home' else ORIGIN+'/'+('references' if name == 'references' else name)+'.html' for name in CONFIG['pages']} | {ORIGIN+'/post/'+p['slug']+'.html' for p in posts}
urls = [el.text for el in sitemap.findall('s:url/s:loc', ns)] if INDEXABLE else list(expected)
assert len(urls) == len(set(urls)) and set(urls) == expected, 'Sitemap must contain exactly the published pages'
assert (ROOT / 'CNAME').read_text().strip() == urlsplit(ORIGIN).netloc
robots = (ROOT / 'robots.txt').read_text()
assert '\\n' not in robots, 'robots.txt has escaped newlines'
assert (f'Sitemap: {ORIGIN}/sitemap.xml' in robots) == INDEXABLE
if not INDEXABLE: assert not (ROOT/'sitemap.xml').exists()
assert 'Disallow: /\n' not in robots
assert 'Disallow: /assets/' not in robots

titles, descriptions = set(), set()
for url in urls:
    path = local(url)
    assert path.is_file(), url
    page = Page(path.read_text())
    assert page.links['canonical'] == url
    assert ('noindex' not in page.meta['robots']) == INDEXABLE, url
    assert 'nofollow' not in page.meta['robots'], url
    assert page.title_text not in titles and page.title_text.strip(), url
    titles.add(page.title_text)
    description = page.meta['description']
    assert 1 <= len(description) <= 180, (url, len(description))
    assert description not in descriptions, 'Duplicate description'
    descriptions.add(description)
    assert page.meta['og:url'] == url
    assert page.meta['og:title'] == page.meta['twitter:title'] == page.title_text
    assert page.meta['og:description'] == page.meta['twitter:description'] == description
    assert local(page.meta['og:image']).is_file()
    assert page.meta['twitter:image'] == page.meta['og:image']
    assert int(page.meta['og:image:width']) > 0 and int(page.meta['og:image:height']) > 0
    assert len(page.schemas) == (1 if INDEXABLE else 0)
    if not INDEXABLE: continue
    graph = page.schemas[0]['@graph']
    assert page.schemas[0]['@context'] == 'https://schema.org'
    webpage = next(node for node in graph if node.get('@id') == url + '#webpage')
    assert webpage['name'] == page.title_text and webpage['description'] == description
    assert not any(node['@type'] in ['MedicalOrganization','MedicalBusiness','Review','AggregateRating'] for node in graph)
    if url != ORIGIN + '/':
        breadcrumb = next(node for node in graph if node['@type'] == 'BreadcrumbList')
        assert breadcrumb['itemListElement'][-1]['item'] == url
        assert [b['position'] for b in breadcrumb['itemListElement']] == list(range(1,len(breadcrumb['itemListElement'])+1))
    if '/post/' in url:
        article = next(node for node in graph if node['@type'] == 'BlogPosting')
        assert article['datePublished'] == page.meta['article:published_time']
        assert article['author']['name'].strip()
        if 'dateModified' in article: assert article['dateModified'] == page.meta['article:modified_time']
        assert 'hypothetical' in article['creativeWorkStatus']
for image in (sitemap.findall('s:url/image:image/image:loc', ns) if INDEXABLE else []):
    assert local(image.text).is_file()
for path in ROOT.glob('**/index.html'):
    if '.git' in path.parts or 'mobile-app' in path.parts: continue
    text = path.read_text()
    if 'http-equiv="refresh"' not in text: continue
    page = Page(text)
    assert 'noindex' in page.meta['robots']
    assert local(page.links['canonical']).is_file()
assert 'noindex' in Page((ROOT/'404.html').read_text()).meta['robots']
print(f'SEO checks passed: {len(urls)} pages in {"indexable" if INDEXABLE else "noindex staging"} mode, unique metadata, canonical URLs and correct crawler directives.')

feed = ET.parse(ROOT/'feed.xml').getroot()
assert {i.findtext('link') for i in feed.findall('channel/item')} == {ORIGIN+'/post/'+p['slug']+'.html' for p in posts}
for el in (sitemap.findall('s:url', ns) if INDEXABLE else []):
    if el.find('s:lastmod',ns) is not None:
        from datetime import datetime
        datetime.fromisoformat(el.findtext('s:lastmod',namespaces=ns).replace('Z','+00:00'))
print('Article author, update dates and RSS checks passed.')

career_url=ORIGIN+'/careers.html'
career=Page((ROOT/'careers.html').read_text())
if INDEXABLE:
    graph=career.schemas[0]['@graph']
    page_node=next(n for n in graph if n.get('@id')==career_url+'#webpage')
    assert page_node['@type']=='CollectionPage'
    roles=json.loads((ROOT/'content/careers.json').read_text())['roles']
    listing=next(n for n in graph if n.get('@id')==career_url+'#opportunities')
    assert listing['numberOfItems']==len(roles)
    assert [n['url'] for n in listing['itemListElement']]==[career_url+'#'+r['id'] for r in roles]
    assert not any(n['@type']=='JobPosting' for n in graph)
    html=(ROOT/'careers.html').read_text()
    for role in roles: assert 'id="'+role['id']+'"' in html
print('Careers collection, role anchors and schema verified.')
