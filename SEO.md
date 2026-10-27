# Search configuration

The test site at https://test.surgicguide.com/ is enabled for search indexing at the owner's request.

All published public content pages include index,follow directives, unique titles and descriptions, canonical URLs, social previews and structured data. Redirect aliases and the 404 page remain noindex. Crawling is allowed, and robots.txt advertises the generated sitemap.xml.

Submit https://test.surgicguide.com/sitemap.xml in this domain's Google Search Console property. Search engines decide when to crawl and index pages; enabling indexing does not guarantee inclusion or ranking. The primary website's settings are unchanged.

Run `node scripts/build.mjs`, `node scripts/validate.mjs` and `python scripts/check-seo.py` to rebuild and validate. To exclude the site again, set `indexable` to false in content/seo.json and rebuild.
