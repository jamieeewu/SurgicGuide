# Public website design review

## Problems addressed

- Fixed Wix typography and inherited spacer paragraphs produced uneven gaps, justified text and unpredictable line lengths. Layout-only inline styles and empty paragraphs are removed during generation; scientific wording and emphasis are retained.
- Scientific images were grouped by document order and given conflicting filename-specific height rules. Each figure now has an explicit role, descriptive alternative text, a proportionate size and a full-size link. Related microscopy images stay together; metabolic diagrams have their own arrangement.
- Image dimensions were missing from markup. Natural dimensions now reserve space while assets load. Scientific figures are never cropped or stretched.
- The header and footer overwhelmed the content. Navigation is smaller, page introductions share a common scale, and the full academic disclaimer sits behind a disclosure with an always-visible fictional-company notice.
- Decorative backgrounds competed with body content. The new navy/teal palette, consistent grids and calmer reading pages establish a clearer hierarchy.
- Headlines on news cards were clipped. Titles are fully displayed; images have a consistent cover ratio and text areas grow with content.
- Portraits lacked a consistent frame. Team cards use a stable crop and type scale. Both partner sheets are visible, with blank canvas margins reduced through CSS.
- A rasterised product heading is now real heading text. An orphaned video caption without a playable source is omitted.
- The bibliography retains its original ordered list and citation numbering; long source URLs wrap within the reading width.
- Facebook and X icons incorrectly led to LinkedIn. Only the verified LinkedIn destination is displayed.

## Validation

- Rendered all 20 public pages at 320, 390, 768, 1024 and 1440 pixels: 100 layouts, no broken images, horizontal overflow or duplicate primary headings.
- Reviewed desktop and phone screenshots of all eight main pages and a representative article.
- Confirmed all scientific text blocks remain present except the duplicate raster heading, redundant figure label and unplayable-video caption described above.
- Static validation checks local references, academic disclaimers and absence of Wix runtime dependencies.
- `scripts/browser-check.cjs` also checks scientific image proportions, figure-viewer focus return, menus, journal search, reference numbering, form validation and reduced-motion preferences.

Original content and asset provenance remain in `content/site.json` and `content/asset-sources.json`. Hosting, domain settings, indexing restrictions and email-draft behaviour are preserved.
