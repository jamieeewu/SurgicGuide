# SurgicGuide public website

Independent static SurgicGuide website, hosted on GitHub Pages. The public Wix content is presented in a new responsive design with an editorial reading layout, consistent image sizes and an accessible figure viewer. All images, background videos and fonts are bundled locally; the site does not load Wix scripts, APIs or hosting assets.

The migration includes Home, Blog, Product, Science for Specialists, Science for Non-specialists, Team, Contact, References and all 12 public blog posts available on 26 October 2026. Original scientific wording, citations and the academic/fictional-company disclaimer are preserved. Member accounts, comments and likes are omitted because this is the public website only.

## Edit and build

- Edit content in `content/site.json`.
- Edit layouts in `scripts/build.mjs`, appearance in `styles.css`, and interactions in `site.js`.
- Run `node scripts/build.mjs` after changing content or layouts. Commit the generated HTML as well as the source.
- Preview with `python -m http.server 8000` and open http://localhost:8000.
- No build or paid service is required to serve the committed files.
- Image dimensions are recorded in `content/media.json` to reserve space before images load.
- The figure sizes and descriptions are defined in `figureSettings` in `scripts/build.mjs`.

`content/asset-sources.json` records where the original media came from. Images are resized to a maximum of 1920 × 1600 and converted to WebP for faster loading. Poppins fonts use the SIL Open Font License.

## Contact form

The form validates the required fields and opens an email draft addressed to `enquiry@surgicguide.com`. The visitor must send that email in their email app. It does not send or store submissions on a server, and it never displays a false submission success message. A normal email link and telephone link are also available.

## Hosting and moving away from Wix

`CNAME` is currently `test.surgicguide.com`; this migration preserves that domain setting. Enable GitHub Pages from the repository's main branch, root folder if it is not already enabled.

The existing `noindex,nofollow,noarchive` metadata and `robots.txt` crawl restriction are deliberately retained while the site is at the test domain. Before making this the primary site:

1. Verify the full site at the GitHub Pages address and custom domain.
2. Point the desired domain to GitHub Pages and change `CNAME` and social-preview URLs to that domain.
3. Remove the robots restrictions in `scripts/build.mjs`, redirect templates and `robots.txt`, then rebuild.
4. Keep the domain registration and email service active independently of Wix. Cancelling Wix hosting does not move or cancel those services automatically.

No Wix subscription, domain, DNS record or email account was changed by this migration. The original Wix site remains available as a reference.

## Validation

Run `node scripts/build.mjs` and `node scripts/validate.mjs`. With a local preview running and Playwright installed (`npm install --no-save playwright` and `npx playwright install chromium`), run `node scripts/browser-check.cjs`. Browser checks cover desktop/mobile rendering, local images, navigation, article search, scientific figure proportions, the figure viewer and focus return, bibliography numbering and form validation. The `mobile-app` project is separate and is not changed by the website migration.
