# Search configuration

This is a test website. It is deliberately excluded from search results while the primary public website remains in use.

## Current settings

- `content/seo.json` sets `indexable` to `false`.
- All content pages include `noindex,follow`.
- Redirect aliases and the 404 page also remain excluded.
- `robots.txt` allows crawling so search engines can discover the `noindex` directives.
- No sitemap is published or advertised for the test site.
- Page titles, descriptions, canonical URLs and social previews remain available.

Search engines remove previously indexed pages after recrawling; the change is not instantaneous. Remove any previously submitted test-site sitemap from its Search Console property. Search Console's temporary Removals tool can accelerate hiding a test URL, but does not replace permanent page-level `noindex` directives.

## Production configuration

When this site should become the primary searchable website, update `CNAME` and `siteUrl`, set `indexable` to `true`, and rebuild. The build then generates the sitemap, advertises it in `robots.txt`, enables public-page indexing and includes structured data. Verify the intended domain in Search Console and submit the generated sitemap.

Keep one preferred public website to avoid competing copies. No search-engine account, domain or DNS configuration is changed by running the build.

## Validation

Run `node scripts/build.mjs`, `node scripts/validate.mjs` and `python scripts/check-seo.py`. The search checks validate either production or staging mode, based on the configuration.
