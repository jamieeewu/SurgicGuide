# Journal editor

Open https://test.surgicguide.com/editor.html for the editing guide and https://app.pagescms.org/ for the editor.

## One-time setup by the repository owner

1. Sign in to Pages CMS with GitHub. Install/authorize its GitHub App for **only jamieeewu/SurgicGuide**, then open this repository and the main branch. Configuration is already in .pages.yml.
2. In GitHub repository Settings → Pages → Build and deployment, change Source to **GitHub Actions**. Then run **Publish website** from Actions if the first run needs retrying. This replaces the old branch publishing process; CNAME and the public address stay the same.

## Writing

Choose Journal posts, create a post, add a title, article date, cover image, summary and formatted article. Insert article images using the editor’s image/media picker and wait for the upload to finish before saving. Temporary image previews are omitted from published articles; the other text and saved images still publish. Upload JPEG, PNG or WebP images; convert HEIC photos before upload. Turn on Publish on website and save. Existing articles can be edited in the same collection. The filename becomes the article URL; retain filenames when editing published articles.

Save with publishing off to exclude an article from the website. **This is not private storage:** every saved article and uploaded image in this public repository can be read on GitHub, including commit history. Keep confidential drafts in a private app. Deleting or unpublishing removes the generated page on the next successful deployment, but does not erase Git history or search caches.

The article date is display metadata, not scheduled publishing. Saving with publishing on publishes after deployment. Articles are ordered newest first by date. The first three are shown on the homepage.

## Publishing

Saving commits content to main. The Publish website workflow builds content/posts/*.json using scripts/posts.mjs and scripts/build.mjs, validates local links and SEO, packages runtime files, and deploys to GitHub Pages. It does not commit generated output back to main; GitHub Pages must use the Actions source. Draft source is excluded from the published artifact, but remains in the public repository.

There are no new paid services or secrets. GitHub and Pages CMS account/usage terms apply. No credentials are stored in this site. Signing in alone does not grant another GitHub user permission to edit your repository.

If a post does not appear, check Actions → Publish website for errors before saving again. Confirm its publishing switch is on. The site only updates when the complete build passes, so a failed build leaves the last successful deployment intact.

## Local checks

node scripts/build.mjs
node scripts/validate.mjs
python3 scripts/check-seo.py
node scripts/posts.test.mjs
node scripts/package-site.mjs

## Search appearance

Optional search title and description fields control page metadata. Leave them blank for automatic values from the title and short summary. Use accurate descriptions around 150 characters. Articles gain authorship metadata, related reading links and automatic sitemap/feed updates when published.
