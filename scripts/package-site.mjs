// Publish only runtime files. CMS source, tools and mobile-app files stay out of the Pages artifact.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'_site');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
for(const entry of fs.readdirSync(root)) {
  if(entry.endsWith('.html') || ['styles.css','site.js','robots.txt','sitemap.xml','feed.xml','CNAME','.nojekyll','assets','post','product','specialist','nonspecialist','team','contact','reference','references','blog'].includes(entry)) {
    fs.cpSync(path.join(root,entry),path.join(output,entry),{recursive:true});
  }
}
console.log('Packaged public website in _site/');
