# Search visibility

The site is independently indexable at https://test.surgicguide.com/. Canonical URLs use this host. Public pages have unique titles, descriptions, social previews and JSON-LD. Redirect aliases, the editor and the 404 page remain noindex. The sitemap contains only the current published content, and robots.txt advertises it while allowing crawling and image fetching.

## Improvements

- Pages CMS offers optional search title and search description fields per article. Defaults use the article title and short summary. Keep descriptions accurate and around 150 characters; the validation limit is 180.
- Article markup includes the displayed author, publication date and real Git-based modification date when known. No fabricated credentials, medical organisation markup or reviews are used.
- Related articles and scientific references have crawlable links after every article. Journal listings remain server-rendered and usable without JavaScript.
- feed.xml provides RSS discovery and updates automatically when posts change. It and sitemap.xml are included in deployment artifacts.
- prepare-seo.py reads natural image dimensions and creates responsive WebP versions while keeping originals for scientific details. The homepage hero loads with high priority; other images remain lazy-loaded.
- Sitemap lastmod and article dateModified derive from Git history, not the build clock. The workflow fetches complete history. Do not edit generated dates manually.
- A square 96px PNG favicon preserves the site symbol for search engines and browsers.

## Search Console handoff

Use the property for https://test.surgicguide.com/ (or a verified encompassing domain property). Submit https://test.surgicguide.com/sitemap.xml. Inspect the homepage, product, specialist science page and a substantive recent article; use Test live URL and Request indexing if appropriate. If a previous temporary removal request for the test host is active, cancel it. A URL inspection result is the reliable place to see Google's chosen canonical and indexing status.

This setup does not have access to your Google Search Console account, so it cannot verify property ownership, submit indexing requests or report actual Google rankings. A successful deployment confirms publication, not Google indexing. Search operators and third-party fetches do not establish full index coverage.

Similar content on another public website can cause Google to choose that website as canonical even with self-canonical tags. No settings on other sites were changed. Improve visibility over time with original, useful articles, clear source citations, genuine authorship, and relevant links from sites where you have permission to share the work. Avoid publishing empty test posts as search content. Fictional business stories remain identified as academic content.

## Verification

Run python3 scripts/prepare-seo.py, node scripts/build.mjs, node scripts/validate.mjs, python3 scripts/check-seo.py, node scripts/posts.test.mjs and node scripts/package-site.mjs. The production workflow runs these checks before deploying; a failure preserves the last successful site.

## Careers

The Careers page uses a descriptive title and H1, a CollectionPage schema with an ItemList matching the visible role anchors, and internal links from navigation and the Team page. The sitemap and canonical URL include careers.html. JobPosting markup is intentionally absent: this academic site does not establish genuine vacancies with verified posting dates and workplace locations. Google Jobs eligibility would require genuine individual vacancy pages and complete, accurate employment details. Normal indexing remains enabled.
