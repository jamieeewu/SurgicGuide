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

sitemap = ET.parse(ROOT / 'sitemap.xml').getroot()
ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9', 'image':'http://www.google.com/schemas/sitemap-image/1.1'}
urls = [el.text for el in sitemap.findall('s:url/s:loc', ns)]
assert len(urls) == len(set(urls)) == 20, 'Expected 20 unique public URLs'
assert (ROOT / 'CNAME').read_text().strip() == urlsplit(ORIGIN).netloc
robots = (ROOT / 'robots.txt').read_text()
assert '\\n' not in robots, 'robots.txt has escaped newlines'
assert f'Sitemap: {ORIGIN}/sitemap.xml' in robots
assert 'Disallow: /\n' not in robots
assert 'Disallow: /assets/' not in robots

titles, descriptions = set(), set()
for url in urls:
    path = local(url)
    assert path.is_file(), url
    page = Page(path.read_text())
    assert page.links['canonical'] == url
    assert 'noindex' not in page.meta['robots'] and 'nofollow' not in page.meta['robots'], url
    assert page.title_text not in titles and page.title_text.strip(), url
    titles.add(page.title_text)
    description = page.meta['description']
    assert 60 <= len(description) <= 180, (url, len(description))
    assert description not in descriptions, 'Duplicate description'
    descriptions.add(description)
    assert page.meta['og:url'] == url
    assert page.meta['og:title'] == page.meta['twitter:title'] == page.title_text
    assert page.meta['og:description'] == page.meta['twitter:description'] == description
    assert local(page.meta['og:image']).is_file()
    assert page.meta['twitter:image'] == page.meta['og:image']
    assert int(page.meta['og:image:width']) > 0 and int(page.meta['og:image:height']) > 0
    assert len(page.schemas) == 1
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
        assert 'hypothetical' in article['creativeWorkStatus']
for image in sitemap.findall('s:url/image:image/image:loc', ns):
    assert local(image.text).is_file()
for path in ROOT.glob('**/index.html'):
    if '.git' in path.parts or 'mobile-app' in path.parts: continue
    text = path.read_text()
    if 'http-equiv="refresh"' not in text: continue
    page = Page(text)
    assert 'noindex' in page.meta['robots']
    assert local(page.links['canonical']).is_file()
assert 'noindex' in Page((ROOT/'404.html').read_text()).meta['robots']
print('SEO checks passed: 20 indexable pages, unique metadata, canonical URLs, sitemap/images, robots directives, JSON-LD and redirect exclusions.')
