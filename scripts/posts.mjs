import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
// Browser-local upload previews cannot be served to visitors. Keep source intact,
// omit unresolved images from public output, and let the article publish.
export function publicArticleHtml(html, filename) {
  return html.replace(/<img\b[^>]*\bsrc\s*=\s*(["'])blob:[\s\S]*?\1[^>]*>/gi, () => {
    console.warn(`${filename}: skipped a temporary image preview; upload it through the editor media picker.`);
    return '';
  }).replace(/(["'])\/assets\//g, '$1assets/');
}
export function loadPosts(root) {
  const folder = path.join(root, 'content/posts');
  const posts = fs.readdirSync(folder).filter(f => f.endsWith('.json')).map(file => {
    const p = JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'));
    const slug = file.slice(0, -5);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), `Use lowercase words separated by hyphens: ${file}`);
    assert(typeof p.published === 'boolean', `${file}: choose whether to publish`);
    if (!p.published) return null;
    assert(p.title?.trim() && p.html?.trim(), `${file}: title and article text are required`);
    assert(p.date && Number.isFinite(Date.parse(p.date)), `${file}: valid date required`);
    const image = (p.image || 'assets/surgicguide-social-preview-v2.png').replace(/^\/+/, '');
    assert(image.startsWith('assets/') && !image.includes('..') && fs.existsSync(path.join(root, image)), `${file}: choose a local cover image`);
    return {...p, slug, image, author:p.author?.trim() || 'SurgicGuide',
      html:publicArticleHtml(p.html, file),
      excerpt:p.excerpt?.trim() || p.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)};
  }).filter(Boolean);
  return posts.sort((a,b) => Date.parse(b.date) - Date.parse(a.date) || a.slug.localeCompare(b.slug));
}
