# Search visibility

## Public configuration

The canonical site is https://test.surgicguide.com/. All 20 public content pages permit indexing. Every page has a unique title and description, a canonical URL, social-sharing metadata and structured data. Articles include publication dates; breadcrumbs identify their place in the site.

The sitemap is https://test.surgicguide.com/sitemap.xml and is advertised in `robots.txt`. It lists canonical content URLs and relevant local images. Redirect aliases and the 404 page are not included. Source-code and content-data directories are excluded from crawling; styles, scripts and images needed to render the pages remain accessible.

Search metadata is edited in `content/seo.json`. Rebuild with `node scripts/build.mjs`, then run `node scripts/validate.mjs` and `python scripts/check-seo.py`.

## Search-engine discovery

1. Open Google Search Console: https://search.google.com/search-console
2. Add and verify the URL-prefix property `https://test.surgicguide.com/`, using its HTML verification file or meta tag. The verification value must come from the owner's account.
3. Submit `https://test.surgicguide.com/sitemap.xml` in the property's Sitemaps section.
4. Use URL Inspection to check the homepage and key scientific pages, then request indexing where available.
5. Monitor indexing, search queries and crawl errors. Search engines determine whether and when pages are indexed and how they rank.

Bing Webmaster Tools can also verify the site and accept the same sitemap. Verification and submission require the owner's search-service account; they are not completed by publishing the website files alone.

## Content and credibility

This is an academic project for a hypothetical company. Search descriptions and structured data preserve that context. Company-story articles are illustrative; the site does not mark itself up as a real medical provider or claim clinical accreditation, approvals, reviews or ratings.

Maintain descriptive scientific explainers, clear figure captions, accessible image descriptions, reliable citations and useful internal links. Earn relevant links from genuine academic/project profiles and related resources. Do not purchase links or create fabricated reviews.

## Domain changes and duplicate copies

Keep one preferred domain. If the site moves, update `CNAME` and `content/seo.json`, rebuild, redirect the previous address where possible and update the search-service property. Competing public copies can cause search engines to select a different canonical URL.
