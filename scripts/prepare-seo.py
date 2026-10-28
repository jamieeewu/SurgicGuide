"""Derive image dimensions and meaningful update dates from real files and Git history."""
import json, subprocess
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def changed(*files):
    try:
        value=subprocess.run(['git','log','-1','--format=%cI','--',*files],cwd=ROOT,capture_output=True,text=True,check=True).stdout.strip()
        return value or None
    except (OSError,subprocess.CalledProcessError): return None
images={}
responsive=ROOT/'assets/responsive'
responsive.mkdir(exist_ok=True)
for p in list((ROOT/'assets').rglob('*')):
    if responsive in p.parents: continue
    if p.suffix.lower() in ('.png','.jpg','.jpeg','.webp','.gif'):
        with Image.open(p) as im:
            info={'width':im.width,'height':im.height}
            if p.suffix.lower() in ('.png','.jpg','.jpeg','.webp') and im.width > 640:
                import hashlib
                stem=hashlib.sha256(p.read_bytes()).hexdigest()[:16]
                info['sources']=[]
                for width in (640,960,1280):
                    if width >= im.width: continue
                    target=responsive/f'{stem}-{width}.webp'
                    try:
                        if not target.exists(): im.convert('RGB').resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=84)
                    except OSError:
                        print(f'Kept original image without resizing: {p.name}')
                        if target.exists(): target.unlink()
                        continue
                    info['sources'].append({'src':str(target.relative_to(ROOT)),'width':width})
                info['sources'].append({'src':str(p.relative_to(ROOT)),'width':im.width})
            images[str(p.relative_to(ROOT))]=info
articles={p.stem:changed(str(p.relative_to(ROOT))) for p in (ROOT/'content/posts').glob('*.json')}
page=changed('content/site.json','content/seo.json','content/careers.json','content/posts','scripts/build.mjs')
(ROOT/'.build-seo.json').write_text(json.dumps({'images':images,'articles':articles,'pageModified':page}))
print(f'Prepared {len(images)} image sizes and Git update dates')
