import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPosts } from './posts.mjs';
const root=path.resolve(import.meta.dirname,'..');
test('new posts publish; unpublished and deleted posts disappear; source stays out of artifact', async () => {
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'journal-test-'));
  try {
    for(const item of ['content','scripts','assets','styles.css','site.js','CNAME','editor.html']) fs.cpSync(path.join(root,item),path.join(tmp,item),{recursive:true});
    const baseline=loadPosts(tmp).length;
    const file=path.join(tmp,'content/posts/new-article.json');
    const entry={title:'A new research article',date:'2026-10-28',author:'Editor',image:'/assets/surgicguide-social-preview-v2.png',excerpt:'An independent summary for the new article.',html:'<img src="blob:https://app.pagescms.org/temporary-preview" alt="Unfinished upload"><p>A unique article written in the web editor with an uploaded image.</p><img src="/assets/surgicguide-social-preview-v2.png" alt="Test image">',published:true};
    fs.writeFileSync(file,JSON.stringify(entry));
    let revision=0;
    const run=script=>import(pathToFileURL(path.join(tmp,'scripts',script)).href+'?revision='+revision++);
    await run('build.mjs');await run('validate.mjs');
    const output=path.join(tmp,'post/new-article.html');
    assert(fs.existsSync(output));assert(!fs.readFileSync(output,'utf8').includes('blob:'));assert(fs.readFileSync(output,'utf8').includes('A unique article written'));assert(fs.readFileSync(path.join(tmp,'blog.html'),'utf8').includes(`${baseline+1} articles`));
    assert(fs.readFileSync(path.join(tmp,'index.html'),'utf8').includes('A new research article'));
    assert(fs.readFileSync(output,'utf8').includes('src="../assets/surgicguide-social-preview-v2.png"'));
    entry.published=false;fs.writeFileSync(file,JSON.stringify(entry));await run('build.mjs');await run('validate.mjs');
    assert(!fs.existsSync(output));assert(!fs.existsSync(path.join(tmp,'post/new-article/index.html')));
    assert(!fs.readFileSync(path.join(tmp,'sitemap.xml'),'utf8').includes('new-article'));
    assert(!fs.readFileSync(path.join(tmp,'blog.html'),'utf8').includes('A new research article'));
    entry.published=true;fs.writeFileSync(file,JSON.stringify(entry));await run('build.mjs');fs.unlinkSync(file);await run('build.mjs');assert(!fs.existsSync(output));
    await run('package-site.mjs');assert(fs.existsSync(path.join(tmp,'_site/editor.html')));assert(!fs.existsSync(path.join(tmp,'_site/content')));assert(!fs.existsSync(path.join(tmp,'_site/scripts')));
    entry.title='';fs.writeFileSync(file,JSON.stringify(entry));assert.throws(()=>loadPosts(tmp),/title and article/);
    fs.unlinkSync(file);fs.writeFileSync(path.join(tmp,'content/posts/Bad Slug.json'),JSON.stringify({...entry,published:false}));assert.throws(()=>loadPosts(tmp),/lowercase words/);
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
