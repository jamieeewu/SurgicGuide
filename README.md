# SurgicGuide

SurgicGuide is an academic project exploring fluorescence lifetime imaging microscopy (FLIM) and artificial intelligence for precision cancer surgery.

The website includes Home, Product, Science for Specialists, Science for Non-specialists, Team, Contact, References and a journal with 12 articles. It uses a responsive editorial layout, locally bundled media and fonts, and an accessible viewer for detailed scientific figures.

SurgicGuide Limited and its proposed system are hypothetical. The educational and non-clinical disclaimers are displayed throughout the website and mobile application.

## Development

- Content: `content/site.json`
- Page templates: `scripts/build.mjs`
- Styles: `styles.css`
- Interactions: `site.js`
- Image dimensions: `content/media.json`
- Search metadata and canonical domain: `content/seo.json`
- Mobile application: `mobile-app/`

Generate pages and validate local links:

```bash
node scripts/build.mjs
node scripts/validate.mjs
```

Preview the site:

```bash
python -m http.server 8000
```

Open http://localhost:8000. Commit generated HTML together with changes to the content or templates. The committed files can be served directly without a build service.

## Images and typography

Media files are stored in `assets/media/`. Scientific figures retain their proportions and can be opened at full size. Figure descriptions and layout settings are defined in `scripts/build.mjs`. Images use WebP where appropriate, and natural dimensions reserve space while loading.

Poppins is distributed under the SIL Open Font License; see `assets/Poppins-OFL.txt`. Scientific sources and illustration credits are listed on the References page.

## Contact

The enquiry form validates required fields and opens a draft addressed to `enquiry@surgicguide.com`. The visitor sends the email through their email app. The website does not receive or store submissions on a server.

## Hosting

GitHub Pages serves the repository's `main` branch from the root folder. The current custom domain is `test.surgicguide.com`, configured in `CNAME`.

The test site is searchable. `content/seo.json` has `indexable: true`; the build enables indexing for all 20 content pages, generates `sitemap.xml` and advertises it in `robots.txt`.

Titles, descriptions, canonical URLs, social previews and structured data are included. See `SEO.md` for the search configuration.

## Browser checks

Install Playwright and its Chromium browser, then run:

```bash
node scripts/browser-check.cjs
```

The checks cover all 20 public pages at five screen widths, scientific figure proportions, image viewing and keyboard focus, menus, journal search, reference numbering, form validation and reduced-motion preferences.
