import fs from 'node:fs';
import { loadPosts } from './posts.mjs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const assetVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'styles.css'))).update(fs.readFileSync(path.join(root, 'site.js'))).digest('hex').slice(0, 10);
const site = JSON.parse(fs.readFileSync(path.join(root, 'content/site.json'), 'utf8'));
site.posts = loadPosts(root);
const seo = JSON.parse(fs.readFileSync(path.join(root, 'content/seo.json'), 'utf8'));
const publicPages = [];
const buildSeoPath = path.join(root, '.build-seo.json');
const buildSeo = fs.existsSync(buildSeoPath) ? JSON.parse(fs.readFileSync(buildSeoPath, 'utf8')) : {};

const media = {...JSON.parse(fs.readFileSync(path.join(root, 'content/media.json'), 'utf8')), ...buildSeo.images};
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const plain = html => html.replace(/<[^>]*>/g, '').replace(/&nbsp;|[\u00a0\u200b\u200c\ufeff]/g, ' ').replace(/\s+/g, ' ').trim();

// Keep the words and semantic emphasis, without fixed presentation styles.
function clean(html = '') {
  return html.replace(/\sclass="[^"]*"/g, '').replace(/\sstyle="([^"]*)"/g, (_, style) => {
    const classes = [];
    if (/font-weight:\s*(bold|[7-9]00)/i.test(style)) classes.push('strong');
    if (/font-style:\s*italic/i.test(style)) classes.push('italic');
    return classes.length ? ` class="${classes.join(' ')}"` : '';
  }).replace(/<p\b[^>]*>[\s\S]*?<\/p>/g, p => plain(p) ? p : '')
    .replace(/<span\b[^>]*>\s*<\/span>/g, '').replace(/[\u200b\ufeff]/g, '');
}
const rich = (page, id) => clean(site[page].rich[id] || '');
const button = (label, url, secondary = false) => `<a class="button${secondary ? ' button-secondary' : ''}" href="${url}">${label}<span aria-hidden="true">↗︎</span></a>`;
function image(im, {className = '', alt, eager = false} = {}) {
  const dimensions = media[im.src];
  const responsive = dimensions?.sources?.length ? ` srcset="${dimensions.sources.map(s => `${s.src} ${s.width}w`).join(', ')}" sizes="(max-width: 680px) 100vw, 60vw"` : '';
  return `<img class="${className}" src="${im.src}"${responsive} alt="${esc(alt ?? im.alt ?? '')}"${dimensions ? ` width="${dimensions.width}" height="${dimensions.height}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
}
const pages = [['Home', 'index.html'], ['Blog', 'blog.html'], ['Product', 'product.html'], ['Team', 'team.html'], ['Contact', 'contact.html'], ['References', 'references.html']];
function nav(current, footer = false) {
  const active = url => url === (current === 'home' ? 'index' : current) + '.html' ? ' aria-current="page"' : '';
  return `<nav class="nav-links" aria-label="${footer ? 'Footer' : 'Main'} navigation">${pages.map(([label, url], i) => `${i === 2 ? (footer ? '<a href="specialist.html">Specialist science</a><a href="nonspecialist.html">Science explained</a>' : `<details class="science-menu"><summary${['specialist','nonspecialist'].includes(current) ? ' class="active"' : ''}>Science <span aria-hidden="true">⌄</span></summary><div><a href="specialist.html"${active('specialist.html')}>For specialists<span>The science behind FLIM</span></a><a href="nonspecialist.html"${active('nonspecialist.html')}>For non-specialists<span>A guide to the fundamentals</span></a></div></details>`) : ''}<a href="${url}"${active(url)}>${label}</a>`).join('')}</nav>`;
}
function social() {
  return '<a class="linkedin-link" href="https://www.linkedin.com/in/jamie-wu-975118244" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗︎</span></a>';
}
function footer(current) {
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><a class="brand" href="index.html">${site.logo}<span>SurgicGuide<span class="brand-subtitle">Precision through insight</span></span></a>${nav(current, true)}</div><div class="footer-bottom"><p>© SurgicGuide 2025 · <a href="editor.html">Editor login</a></p>${social()}</div><details class="disclaimer"><summary><span>Academic project</span> SurgicGuide is a hypothetical company. <span class="disclaimer-more">Read the full disclaimer <span aria-hidden="true">＋</span></span></summary><div>${clean(site.footer[1])}</div></details></div></footer>`;
}
function pageIntro({title, eyebrow, description = '', photo, extra = ''}) {
  return `<section class="page-intro"><div class="container intro-grid"><div class="intro-copy"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${description ? `<div class="intro-description">${description}</div>` : ''}${extra}</div>${photo ? `<div class="intro-image">${image(photo, {eager:true, alt:''})}</div>` : ''}</div></section>`;
}
function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Hong_Kong'}) : '';
}
function postCards(posts, home = false) {
  return `<div class="${home ? 'news-grid' : 'blog-grid'}">${posts.map(p => `<article class="post-card"><a class="post-card-image" href="post/${p.slug}.html" tabindex="-1" aria-hidden="true">${image({src:p.image}, {alt:''})}</a><div class="post-card-copy"><p class="post-meta">${esc(formatDate(p.date))}</p><h${home ? '3' : '2'}><a href="post/${p.slug}.html">${esc(p.title)}</a></h${home ? '3' : '2'}>${home ? '' : `<p class="post-excerpt">${esc(p.excerpt)}</p>`}<a class="text-link" href="post/${p.slug}.html" aria-label="Read ${esc(p.title)}">Read article <span aria-hidden="true">↗︎</span></a></div></article>`).join('')}</div>`;
}
function home() {
  const d = site.home;
  return `<section class="home-hero"><div class="hero-copy"><p class="eyebrow">Precision cancer surgery</p><h1>Real-Time Surgical Guidance with AI-integrated FLIM System</h1><p class="hero-description">Exploring the intersection of fluorescence lifetime imaging and artificial intelligence.</p><div class="button-row">${button('Explore the system', 'product.html')}${button('Our science', 'specialist.html', true)}</div><div class="hero-footnote"><span>FLIM</span><span class="hero-divider"></span><span>Artificial intelligence</span><span class="hero-divider"></span><span>Surgical guidance</span></div></div><div class="hero-image">${image(d.images[0], {eager:true, alt:'Concept of a SurgicGuide imaging system in an operating room'})}<span class="image-note">AI-integrated FLIM System · concept visual</span></div></section>
<section class="section"><div class="container split-section about"><div class="editorial-image">${image(d.images[1], {alt:'Stethoscope and research materials on a medical desk'})}</div><div class="split-copy"><p class="eyebrow">About SurgicGuide</p><h2>Technology with a clear purpose.</h2><div class="prose">${rich('home','comp-mjk1dkp9')}</div><a class="text-link" href="team.html">Meet our team <span aria-hidden="true">↗︎</span></a></div></div></section>
<section class="section section-tint"><div class="container split-section vision"><div class="split-copy"><p class="eyebrow">Our vision</p><h2>Better tools. More informed decisions.</h2><div class="prose">${rich('home','comp-mjst9e7t')}</div></div><div class="editorial-image">${image(d.images[2], {alt:'Hong Kong skyline and Victoria Harbour'})}</div></div></section>
<section class="section"><div class="container"><div class="section-header"><div><p class="eyebrow">Explore the science</p><h2>From cell metabolism<br>to surgical insight.</h2></div><p class="section-description">${plain(rich('home','comp-mjk2z9kk2'))}</p></div><div class="science-grid"><a class="science-card" href="specialist.html"><span class="card-index">01 / For specialists</span><h3>The science behind FLIM</h3><p>NAD(P)H, cancer metabolism and fluorescence lifetime imaging.</p><span class="text-link">Explore the research <span aria-hidden="true">↗︎</span></span></a><a class="science-card" href="nonspecialist.html"><span class="card-index">02 / For non-specialists</span><h3>A clearer starting point</h3><p>A guide to fluorescence, cellular metabolism and the principles of FLIM.</p><span class="text-link">Learn the fundamentals <span aria-hidden="true">↗︎</span></span></a></div></div></section>
<section class="product-callout"><div class="container callout-grid"><div><p class="eyebrow">Our product</p><h2>AI-integrated<br>FLIM System</h2><p>Learn about the proposed system, its operating principles and the research behind it.</p>${button('Explore the system','product.html')}</div><div class="callout-art" aria-hidden="true">${image(d.images.at(-1), {alt:''})}</div></div></section>
<section class="section"><div class="container"><div class="section-header"><div><p class="eyebrow">News & perspectives</p><h2>Inside SurgicGuide.</h2></div><a class="text-link" href="blog.html">All articles <span aria-hidden="true">↗︎</span></a></div>${postCards(site.posts.slice(0,3), true)}</div></section>`;
}
const figureSettings = {
  'img_comp-mjv5bqdh': {alt:'Comparison of negative and positive surgical margins', size:'small'},
  'img_comp-mjzren62': {alt:'Operation of the proposed AI-integrated FLIM system, from the endoscope to cloud analysis', size:'medium'},
  'img_comp-mjzgbllp': {alt:'Hardware specification: components and functions of the FLIM system', size:'wide'},
  'img_comp-mjzv47zv': {alt:'Distribution of photon counts over time after excitation'},
  'img_comp-mjzvcgz1': {alt:'Photon-distribution histograms across pixels in a scanning area'},
  'img_comp-mjzy656x': {alt:'Simulated AI cancer-probability map', size:'medium'},
  'img_comp-mk1288yw': {alt:'FLIM-guided resection with probability maps and histopathology', size:'wide'},
  'img_comp-mk15deyt': {alt:'Published FLIM diagnostic performance: ROC curves and prediction matrices', size:'wide'},
  'img_comp-mk1bnzjp': {alt:'Simulated comparison of diagnostic accuracy by lesion type', size:'wide'},
  'img_comp-mjpvz2wx': {alt:'NADP and NADPH redox pathways', size:'small'},
  'img_comp-mjqy8lar': {alt:'NADH metabolism through glycolysis, the TCA cycle and oxidative phosphorylation', size:'wide'},
  'img_comp-mjpw1pj5': {alt:'NAD and NADH redox pathways', size:'small'},
  'img_comp-mjqzozvh': {alt:'Fluorescence intensity image of normal cortex'},
  'img_comp-mjqzpdcd': {alt:'Fluorescence intensity image of glioblastoma'},
  'img_comp-mjra19c4': {alt:'Fluorescence lifetime image of normal cortex'},
  'img_comp-mjra1ow0': {alt:'Fluorescence lifetime image of glioblastoma'},
  'img_comp-mjsbuwmb': {alt:'Simplified molecular structures of NADH and NADPH', size:'medium'},
  'img_comp-mjsfgjj6': {alt:'Fluorescence excitation and emission energy levels', size:'medium'},
  'img_comp-mjsfzgmd': {alt:'FLIM principles: excitation pulses, photon decay and lifetime mapping', size:'wide'},
  'img_comp-mjss0jfr': {alt:'Fluorescence lifetime imaging and lifetime profile across a tumour margin', size:'wide'}
};
function figureImage(im) {
  const settings = figureSettings[im.id] || {alt:im.alt};
  return `<a class="figure-link" href="${im.src}" target="_blank" rel="noopener" data-figure data-caption="${esc(settings.alt)}" aria-label="Enlarge image: ${esc(settings.alt)}">${image(im, {alt:settings.alt})}<span class="figure-expand">View larger <span aria-hidden="true">⤢</span></span></a>`;
}
function figure(group, captionBlock) {
  let caption = '', remainder = '';
  if (captionBlock) {
    const html = clean(captionBlock.html);
    const firstParagraph = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/)?.[0] || '';
    caption = firstParagraph;
    remainder = html.replace(firstParagraph, '');
  }
  const isMetabolism = group.length === 3;
  if (isMetabolism) group = [group[1], group[0], group[2]];
  const size = group.length === 1 ? figureSettings[group[0].id]?.size || 'medium' : 'wide';
  return `<figure class="science-figure figure-${size}${group.length > 1 ? ' figure-pair' : ''}${isMetabolism ? ' figure-metabolism' : ''}"><div class="figure-images">${group.map(figureImage).join('')}</div>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>${plain(remainder) ? `<div class="prose figure-discussion">${remainder}</div>` : ''}`;
}
function technical(page) {
  let blocks = site[page].blocks.slice(1);
  const title = blocks.shift().text;
  if (page === 'specialist') blocks.shift();
  const descriptions = {
    product:'The proposed system, from imaging principles to AI-assisted tumour delineation.',
    specialist:'NAD(P)H, cellular metabolism and the application of fluorescence lifetime imaging in cancer surgery.',
    nonspecialist:'A guide to the molecules, light and imaging principles behind the technology.'
  };
  let output = '', sections = [], sectionOpen = false;
  function heading(id, text, sub = false) {
    if (!sub && sectionOpen) output += '</section>';
    if (!sub) {output += `<section class="reading-section" id="${id}">`; sectionOpen = true;}
    sections.push({id, text, sub});
    output += `<h${sub ? 3 : 2}${sub ? ` id="${id}"` : ''}>${esc(text)}</h${sub ? 3 : 2}>`;
  }
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'image') {
      // A rasterised heading becomes real text; scientific diagrams remain intact.
      if (b.id === 'img_comp-mjvptcdc') {heading('system-overview', 'AI-integrated FLIM System'); continue;}
      let group = [b];
      while (blocks[i+1]?.type === 'image') group.push(blocks[++i]);
      let caption;
      if (/^(Figure:|Image source:)/.test(blocks[i+1]?.text || '')) caption = blocks[++i];
      output += figure(group, caption);
      continue;
    }
    if (b.text === 'cavity' || b.id === 'comp-mjsc4hkk') continue;
    if (/^\d$/.test(b.text) && blocks[i+1]?.type === 'text') {
      const copy = blocks[++i];
      output += `<div class="process-step"><span class="step-number" aria-label="Step ${b.text}">${b.text.padStart(2,'0')}</span><div class="prose">${clean(copy.html)}</div></div>`;
      continue;
    }
    if (/<h[1-6]/.test(b.html)) {
      heading(b.id, b.text, /<h5/.test(b.html));
    } else {
      output += `<div class="prose${/^Acknowledgement|^\*Details/.test(b.text) ? ' research-note' : ''}" id="${b.id}">${clean(b.html)}</div>`;
    }
  }
  if (sectionOpen) output += '</section>';
  const intro = pageIntro({title:esc(title), eyebrow:page === 'product' ? 'The technology' : page === 'specialist' ? 'Science / For specialists' : 'Science / For non-specialists', description:`<p>${descriptions[page]}</p>`});
  return `${intro}<div class="container article-layout"><aside class="article-nav"><p class="eyebrow">On this page</p><nav aria-label="Article sections">${sections.map((s,i) => `<a href="#${s.id}"${s.sub ? ' class="toc-sub"' : ''}><span>${s.sub ? '·' : String(sections.slice(0,i+1).filter(x=>!x.sub).length).padStart(2,'0')}</span>${esc(s.text)}</a>`).join('')}</nav><a class="article-download text-link" href="references.html">View references <span aria-hidden="true">↗︎</span></a></aside><article class="technical-content">${output}<div class="reading-end"><span class="eyebrow">Continue exploring</span><div>${button(page === 'product' ? 'The science behind FLIM' : 'Explore the system', page === 'product' ? 'specialist.html' : 'product.html', true)}</div></div></article></div>`;
}
function team() {
  const d = site.team, people = [], blocks = d.blocks.slice(3);
  for (let i=0; i<blocks.length; i++) if (blocks[i].type === 'image' && blocks[i+1]?.type === 'text' && blocks[i+2]?.type === 'text') {
    people.push({image:blocks[i], name:blocks[i+1].text, role:blocks[i+2].text}); i += 2;
  }
  return `${pageIntro({title:'Our Team', eyebrow:'People & perspectives', description:rich('team','comp-mjjtxkg61')})}<section class="section team-section"><div class="container"><div class="team-grid">${people.map(p => `<article class="person"><div class="person-image">${image(p.image, {alt:`${p.name}, ${p.role}`})}</div><div class="person-copy"><h2>${esc(p.name)}</h2><p>${esc(p.role)}</p></div></article>`).join('')}</div><div class="team-contact"><p>Questions about our work or potential partnerships?</p>${button('Get in touch','contact.html',true)}</div></div></section><section class="section section-tint"><div class="container"><div class="section-header"><div><p class="eyebrow">Our network</p><h2>Our Partners</h2></div><p class="section-description">Partner identities shown as part of this fictional academic project.</p></div><div class="partner-grid">${d.images.slice(-2).map((im,i) => `<div class="partner-sheet">${image(im, {alt:`Illustrative partner organisations, group ${i+1}`})}</div>`).join('')}</div></div></section>`;
}
function contact() {
  return `${pageIntro({title:'Let’s start a conversation.', eyebrow:'Contact SurgicGuide', description:rich('contact','comp-mjjvnpuw1')})}<section class="section"><div class="container contact-layout"><aside class="contact-info"><div class="contact-detail"><span class="eyebrow">Email</span><a href="mailto:enquiry@surgicguide.com">enquiry@surgicguide.com <span aria-hidden="true">↗︎</span></a></div><div class="contact-detail"><span class="eyebrow">Phone</span><a href="tel:+85231552120">+852 3155 2120</a></div><div class="contact-detail"><span class="eyebrow">Connect</span>${social()}</div><div class="contact-note"><span aria-hidden="true">↗︎</span><p>This form opens a draft in your email app. Your message is sent when you send the email.</p></div></aside><form id="contact-form"><h2>Send an enquiry</h2><div class="form-row"><label>First name<input name="firstName" autocomplete="given-name" required></label><label>Last name<input name="lastName" autocomplete="family-name" required></label></div><label>Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label><label>Your message<textarea name="message" rows="6" placeholder="How can we help?" required></textarea></label><button type="submit" class="button">Create email draft <span aria-hidden="true">↗︎</span></button><p id="form-status" role="status"></p></form></div></section><section class="office-section section-tint"><div class="container office"><div><p class="eyebrow">Visit by appointment</p><h2>Our Office</h2><div class="prose">${rich('contact','comp-mjjvnpvl2')}</div><div class="office-details"><div><h3>Address</h3>${rich('contact','comp-mjjvnpvl8')}</div><div><h3>Opening hours</h3><dl><dt>Mon–Fri</dt><dd>9:00 am–5:00 pm</dd><dt>Saturday</dt><dd>Closed</dd><dt>Sunday</dt><dd>Closed</dd></dl></div></div></div><div class="office-image">${image(site.contact.images.at(-1), {alt:'Illustrative modern office interior'})}</div></div></section>`;
}
function references() {
  const entries = rich('reference','comp-mjjvqx1e4')
    .replace(/<(\/?)h5>/g, '<$1h2>')
    .replace(/<ol>/g, '<ol class="reference-list" role="list">');
  return `${pageIntro({title:'References', eyebrow:'Sources & further reading', description:'<p>The scientific literature and image sources behind our content.</p>'})}<section class="section"><div class="container references-content">${entries}</div></section>`;
}
function blog() {
  return `${pageIntro({title:'News & perspectives.', eyebrow:'The SurgicGuide journal', description:'<p>Research ideas, industry perspectives and life at SurgicGuide.</p>'})}<section class="section"><div class="container blog-content"><div class="blog-toolbar"><p class="article-count">${site.posts.length} ${site.posts.length === 1 ? 'article' : 'articles'}</p><label><span class="visually-hidden">Search articles</span><input type="search" id="blog-search" placeholder="Search the journal…"></label></div><p id="blog-results" class="visually-hidden" role="status"></p>${postCards(site.posts)}<div id="no-results" hidden><h2>No articles found.</h2><p>Try a different keyword or clear your search.</p></div></div></section>`;
}
function post(p) {
  const related = site.posts.filter(other => other.slug !== p.slug).map(other => ({post:other,score:p.title.toLowerCase().split(/\W+/).filter(w=>w.length>3 && other.title.toLowerCase().includes(w)).length})).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.post);
  return `<article class="post-content"><header class="post-header container"><a href="blog.html" class="text-link back-link">← Back to the journal</a><p class="eyebrow">News & perspectives</p><h1>${esc(p.title)}</h1><p class="post-meta">${esc(p.author)}<span aria-hidden="true"> / </span><time datetime="${esc(p.date.slice(0,10))}">${esc(formatDate(p.date))}</time></p></header><div class="post-body prose">${clean(p.html)}</div><div class="post-end">${button('All articles','blog.html',true)}</div></article><section class="section container" aria-label="Further reading"><div class="section-header"><h2>Continue reading</h2><a class="text-link" href="references.html">Scientific references ↗</a></div>${postCards(related,true)}</section>`;
}
function figureDialog() {
  return `<dialog id="figure-dialog" aria-labelledby="figure-dialog-title"><div class="figure-dialog-toolbar"><p id="figure-dialog-title">Scientific figure</p><button type="button" class="dialog-close" aria-label="Close enlarged figure">✕</button></div><div class="figure-dialog-image"><img alt=""></div><div class="figure-dialog-footer"><p id="figure-dialog-caption"></p><a target="_blank" rel="noopener" id="figure-original">Open original image ↗︎</a></div></dialog>`;
}
function seoMetadata(file, current, fallbackTitle) {
  const article = file.startsWith('post/') ? site.posts.find(p => file === `post/${p.slug}.html`) : null;
  const settings = seo.pages[current] || {};
  const url = new URL(file === 'index.html' ? '/' : '/' + file, seo.siteUrl).href;
  const absolute = value => new URL(value, seo.siteUrl + '/').href;
  const imagePath = article?.image || settings.image || seo.defaultImage;
  const title = article ? (article.seoTitle?.trim() || `${article.title} | SurgicGuide Journal`) : settings.title || `${fallbackTitle} | SurgicGuide`;
  const articleCopy = article ? plain(article.html).replace(/\s+/g, ' ').trim() : '';
  const description = article
    ? (article.seoDescription?.trim() || `Academic project: ${(article.excerpt || articleCopy).slice(0, 138).replace(/\s+\S*$/, '').replace(/[.,;:]$/, '')}…`)
    : settings.description || seo.siteDescription;
  const modified = article ? buildSeo.articles?.[article.slug] : buildSeo.pageModified;
  const breadcrumbs = [{name:'Home', url:seo.siteUrl + '/'}];
  if (article) breadcrumbs.push({name:'Journal', url:absolute('blog.html')}, {name:article.title, url});
  else if (current !== 'home') breadcrumbs.push({name:settings.label || fallbackTitle, url});
  const website = {
    '@type':'WebSite', '@id':seo.siteUrl + '/#website', url:seo.siteUrl + '/',
    name:seo.siteName, description:seo.siteDescription, inLanguage:seo.language
  };
  const graph = [website, {
    '@type':current === 'contact' ? 'ContactPage' : current === 'team' ? 'AboutPage' : current === 'blog' ? 'CollectionPage' : 'WebPage',
    '@id':url + '#webpage', url, name:title, description, inLanguage:seo.language,
    isPartOf:{'@id':website['@id']}, isAccessibleForFree:true,
    primaryImageOfPage:{'@type':'ImageObject', url:absolute(imagePath)}
  }];
  if (breadcrumbs.length > 1) graph.push({
    '@type':'BreadcrumbList', '@id':url + '#breadcrumbs',
    itemListElement:breadcrumbs.map((b,i) => ({'@type':'ListItem', position:i+1, name:b.name, item:b.url}))
  });
  if (current === 'blog' && !article) graph.push({'@type':'ItemList', itemListElement:site.posts.map((p,i)=>({'@type':'ListItem',position:i+1,url:absolute(`post/${p.slug}.html`),name:p.title}))});
  if (article) graph.push({
    '@type':'BlogPosting', '@id':url + '#article', mainEntityOfPage:{'@id':url + '#webpage'},
    headline:article.title, description, image:[absolute(imagePath)], datePublished:article.date,
    author:{'@type':article.author === 'SurgicGuide' ? 'Organization' : 'Person', name:article.author},
    ...(modified && Date.parse(modified) >= Date.parse(article.date) ? {dateModified:modified} : {}),
    inLanguage:seo.language, isAccessibleForFree:true, genre:'Educational',
    creativeWorkStatus:'Academic and illustrative content about a hypothetical company',
    isPartOf:{'@id':website['@id']}
  });
  return {title, description, url, modified, image:absolute(imagePath), imageAlt:article?.title || 'SurgicGuide academic project',
    imageDimensions:media[imagePath] || {width:1200,height:630}, sitemapImage:imagePath === seo.defaultImage ? null : absolute(imagePath), article,
    structured:JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g, '\\u003c')};
}
function document(title, content, current, file) {
  const depth=file.split('/').length-1;
  const prefix='../'.repeat(depth);
  const meta=seoMetadata(file,current,title);
  const indexable=seo.indexable !== false && current !== '404';
  const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
<meta name="theme-color" content="#102b35"><title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}"><link rel="canonical" href="${meta.url}">
<link rel="icon" type="image/png" sizes="96x96" href="assets/favicon.png"><link rel="preload" href="assets/media/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/rss+xml" title="SurgicGuide Journal" href="${seo.siteUrl}/feed.xml"><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="styles.css?v=${assetVersion}">
${indexable ? `<link rel="sitemap" type="application/xml" href="${seo.siteUrl}/sitemap.xml" title="Sitemap">` : ''}
<meta property="og:type" content="${meta.article ? 'article' : 'website'}"><meta property="og:site_name" content="${esc(seo.siteName)}"><meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${meta.url}">
<meta property="og:image" content="${meta.image}"><meta property="og:image:alt" content="${esc(meta.imageAlt)}"><meta property="og:image:width" content="${meta.imageDimensions.width}"><meta property="og:image:height" content="${meta.imageDimensions.height}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.description)}"><meta name="twitter:image" content="${meta.image}"><meta name="twitter:image:alt" content="${esc(meta.imageAlt)}">
${meta.article ? `<meta property="article:published_time" content="${meta.article.date}">${meta.modified ? `<meta property="article:modified_time" content="${meta.modified}">` : ''}` : ''}
${indexable ? `<script type="application/ld+json">${meta.structured}</script>` : ''}
<script defer src="site.js?v=${assetVersion}"></script>`;
  let html=`<!doctype html>
<html lang="${seo.language}"><head>${head}</head>
<body class="page-${current}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a href="index.html" class="brand" aria-label="SurgicGuide Ltd home">${site.logo}<span>SurgicGuide<span class="brand-subtitle">Precision through insight</span></span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="header-navigation">Menu <span aria-hidden="true">☰</span></button><div id="header-navigation">${nav(current)}</div></div></header><main id="main">${content}</main>${footer(current)}${figureDialog()}</body></html>`;
  html = html.replace(/↗\uFE0E*/g, '<svg class="icon-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  if (depth) html=html.replace(/(href|src)="(?!https?:|mailto:|tel:|#|data:|\/)([^\"]+)"/g,(_,attr,url)=>`${attr}="${prefix}${url}"`);
  if (depth) html=html.replace(/srcset="([^"]+)"/g, (_,set)=>`srcset="${set.split(',').map(item=>{const [url,width]=item.trim().split(/\s+/);return `${url.startsWith('assets/') ? prefix : ''}${url} ${width}`;}).join(', ')}"`);
  return html;
}
function write(file,title,content,current) {
  const dest=path.join(root,file); fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,document(title,content,current,file));
  if (current !== '404') publicPages.push(seoMetadata(file,current,title));
}
fs.rmSync(path.join(root, 'post'), {recursive:true, force:true});
write('index.html','Real-Time Surgical Guidance with FLIM and AI',home(),'home');
for(const p of ['product','specialist','nonspecialist']) write(p+'.html',p==='product'?'AI-integrated FLIM System':p==='specialist'?'Science for Specialists':'Science for Non-specialists',technical(p),p);
write('team.html','Our Team',team(),'team');
write('contact.html','Contact us',contact(),'contact');
write('references.html','References',references(),'references');
write('blog.html','Blog',blog(),'blog');
for(const p of site.posts) write('post/'+p.slug+'.html',p.title,post(p),'blog');
function redirect(file, title, url) {
  const dest=path.join(root,file); fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${new URL(url, new URL(file, seo.siteUrl + '/')).href}"><meta http-equiv="refresh" content="0;url=${url}"><title>${esc(title)}</title></head><body><a href="${url}">Continue to ${esc(title)}</a></body></html>`);
}
for(const [alias,target] of Object.entries({product:'product',specialist:'specialist',nonspecialist:'nonspecialist',team:'team',contact:'contact',reference:'references',references:'references',blog:'blog'})) redirect(alias+'/index.html','SurgicGuide','../'+target+'.html');
for(const p of site.posts) redirect('post/'+p.slug+'/index.html',p.title,'../'+p.slug+'.html');
fs.writeFileSync(path.join(root,'.nojekyll'),'');
write('404.html','Page not found',`<section class="not-found container"><p class="eyebrow">404 / Page not found</p><h1>A different direction.</h1><p>This page may have moved. Explore the site from the homepage.</p>${button('Back to Home','index.html')}</section>`,'404');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${publicPages.map(p => `  <url><loc>${esc(p.url)}</loc>${p.modified ? `<lastmod>${esc(p.modified)}</lastmod>` : ''}${p.sitemapImage ? `<image:image><image:loc>${esc(p.sitemapImage)}</image:loc></image:image>` : ''}</url>`).join('\n')}
</urlset>\n`;
if (seo.indexable !== false) fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
else fs.rmSync(path.join(root,'sitemap.xml'), {force:true});
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /content/\nDisallow: /scripts/\nDisallow: /mobile-app/\n${seo.indexable !== false ? `\nSitemap: ${seo.siteUrl}/sitemap.xml\n` : ''}`);
console.log(`Built ${publicPages.length} ${seo.indexable === false ? 'noindex staging' : 'indexable public'} pages, canonical redirects and 404 page.`);

const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>SurgicGuide Journal</title><link>${seo.siteUrl}/blog.html</link><description>${esc(seo.siteDescription)}</description><language>${seo.language}</language><atom:link href="${seo.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>${site.posts.map(p => `<item><title>${esc(p.title)}</title><link>${seo.siteUrl}/post/${p.slug}.html</link><guid isPermaLink="true">${seo.siteUrl}/post/${p.slug}.html</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('')}</channel></rss>`;
fs.writeFileSync(path.join(root,'feed.xml'),feed);
