const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(project, 'content/site.json')));
site.posts = fs.readdirSync(path.join(project,'content/posts')).filter(f=>f.endsWith('.json')).map(f=>({...JSON.parse(fs.readFileSync(path.join(project,'content/posts',f))),slug:f.slice(0,-5)})).filter(p=>p.published);
const root = process.env.SITE_URL || `file://${project}/`;
const pages = ['index.html','product.html','specialist.html','nonspecialist.html','team.html','contact.html','references.html','blog.html', ...site.posts.map(p => `post/${p.slug}.html`)];
const screenshots = process.env.SCREENSHOT_DIR;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const failures = [], remote = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await page.route('**/*', route => {
    if (/^https?:/.test(route.request().url()) && !route.request().url().startsWith(root)) {
      remote.push(route.request().url()); return route.abort();
    }
    return route.continue();
  });
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    for (const file of pages) {
      await page.goto(root + file, { waitUntil:'load' });
      await page.locator('img[src]').evaluateAll(images => images.forEach(i => i.loading = 'eager'));
      await page.evaluate(() => Promise.all([...document.querySelectorAll('img[src]')].map(i => i.decode().catch(() => {}))));
      assert.deepEqual(await page.locator('img[src]').evaluateAll(images => images.filter(i => !i.naturalWidth).map(i => i.src)), [], `${width}px ${file}: broken images`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px ${file}: horizontal overflow`);
      assert.equal(await page.locator('h1').count(), 1, file);
      assert.deepEqual(await page.locator('.figure-link img').evaluateAll(images => images.filter(i => {
        const b = i.getBoundingClientRect();
        return Math.abs(b.width / b.height - i.naturalWidth / i.naturalHeight) > .03;
      }).map(i => i.src)), [], `${width}px ${file}: distorted scientific figures`);
      assert((await page.locator('body').innerText()).includes('hypothetical company'), `${file}: missing visible academic disclaimer`);
      if (screenshots && [1440, 390].includes(width) && !file.startsWith('post/')) {
        fs.mkdirSync(screenshots, { recursive:true });
        for (let y=0; y<await page.evaluate(() => document.body.scrollHeight); y+=850) await page.evaluate(y => scrollTo(0,y),y);
        await page.evaluate(() => scrollTo(0,0));
        await page.screenshot({path:path.join(screenshots, `${width}-${file.replace('.html','')}.png`),fullPage:true});
      }
    }
    console.log(`PASS: all ${pages.length} pages at ${width}px`);
  }
  // Navigation and accessibility behaviour at mobile and desktop sizes.
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:960});
    await page.goto(root+'product.html');
    if (width < 861) {
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    }
    await page.locator('#header-navigation .science-menu summary').click();
    assert(await page.locator('#header-navigation a[href="specialist.html"]').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#header-navigation .science-menu').getAttribute('open'), null);
    if (width < 861) assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    const trigger=page.locator('[data-figure]').first();
    await trigger.click();
    assert(await page.locator('#figure-dialog').isVisible());
    assert(await page.locator('#figure-dialog img').evaluate(i=>i.naturalWidth>0));
    assert((await page.locator('#figure-original').getAttribute('href')).includes('assets/media/'));
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#figure-dialog').isVisible()));
    assert(await trigger.evaluate(e=>e===document.activeElement), 'Figure viewer must return focus');
    await trigger.click();
    await page.locator('.dialog-close').click();
    assert(!(await page.locator('#figure-dialog').isVisible()));
    await page.locator('.disclaimer summary').click();
    assert(await page.locator('.disclaimer').evaluate(e=>e.open));
  }
  await page.goto(root+'blog.html');
  await page.locator('#blog-search').fill('fluorescence');
  assert(await page.locator('.post-card:visible').count() > 0);
  await page.locator('#blog-search').fill('no-such-post-abcdef');
  assert.equal(await page.locator('.post-card:visible').count(),0);
  assert(await page.locator('#no-results').isVisible());
  await page.locator('#blog-search').fill('');
  assert.equal(await page.locator('.post-card:visible').count(),site.posts.length);
  await page.goto(root+'references.html');
  assert.equal(await page.locator('.reference-list').count(),1);
  assert.equal(await page.locator('.reference-list > li').count(),28);
  await page.goto(root+'contact.html');
  await page.locator('button[type=submit]').click();
  assert(await page.locator('input[name=firstName]').evaluate(e=>e.validity.valueMissing));
  for (const [name,value] of Object.entries({firstName:'Test',lastName:'Visitor',email:'test@example.com',message:'Website test'})) await page.locator(`[name=${name}]`).fill(value);
  assert(await page.locator('form').evaluate(e=>e.checkValidity()));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(root+'index.html');
  assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
  assert.deepEqual(failures,[]); assert.deepEqual(remote,[]);
  console.log('PASS: figure proportions/viewer/focus, mobile menus, search, reference numbering, form validation, reduced motion, and no external dependencies.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
