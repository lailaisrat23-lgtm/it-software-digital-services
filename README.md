# Techspire Solutions — static site

A multi-page marketing site for an IT / digital services studio. No framework, no build step, no
backend: HTML files, one stylesheet, small vanilla JavaScript modules, and a few JSON datasets.

Architecture rules live in [prd1.md](./prd1.md); the delivery plan lives in [execute.md](./execute.md).

## Run locally

`fetch()` is used for shared fragments and JSON, so the site must be served over HTTP — opening
`index.html` through `file://` will block those requests.

```powershell
php -S localhost:8080          # PHP 7.4+ (Laragon, or any PHP install)
# or
python -m http.server 8080     # Python 3
```

Then open <http://localhost:8080/resources/views/frontend/index.html>.

Start the server **from the project root**, not from the `frontend` folder — pages reference
`../../../public/` and `../../../jsonData/`. Every page must stay at this same depth so those
relative paths keep resolving.

## Structure

| Path | Purpose |
|---|---|
| `resources/views/frontend/index.html`, `services.html`, `industries.html`, `portfolio.html`, `about.html`, `faq.html`, `contact.html`, `legal.html` | All pages. Headings, prose, sections and forms are authored here. |
| `public/css/style.css` | The only stylesheet. Design tokens live under `:root`. |
| `public/fonts/` | Self-hosted `Inter` and `Sora` woff2 subsets (latin only) — no CDN or third-party request. |
| `public/js/components.js` | Fragment loader + mobile navigation + active nav state. |
| `public/js/data.js` | Loads JSON datasets and renders repeated collections. |
| `public/js/carousel.js` | Hero and testimonial sliders. |
| `public/js/accordion.js` | FAQ accordion. |
| `public/js/tabs.js` | Engagement-model tabs. |
| `public/js/filters.js` | Portfolio search and category filtering. |
| `public/js/forms.js` | Contact form validation. |
| `jsonData/` | Repeated collections: `verticals`, `services`, `projects`, `testimonials`, `faqs`. |
| `resources/views/components/` | `header.html` and `footer.html` fragments. |

## Component loader

Each page declares where a shared fragment belongs:

```html
<div data-component="header"></div>
```

`public/js/components.js` fetches `../components/<name>.html` (relative to the page, so pages in
`resources/views/frontend/` resolve to `resources/views/components/`), injects it, then:

1. marks the nav link whose `data-nav-item` matches `<body data-page="…">` with `aria-current="page"`;
2. wires the mobile menu toggle (`[data-nav-toggle]` + `[data-nav]`);
3. sets the copyright year (`[data-year]`);
4. dispatches `components:loaded` so other modules can process markup that arrived late.

If a fragment cannot be fetched (missing file, blocked request, opened via `file://`), the host
renders an inline link list instead, so navigation never disappears. Pages also carry a small
`<noscript>` navigation fallback for browsers with JavaScript disabled.

Fragments are resolved relative to the page, so HTML files must stay in
`resources/views/frontend/` (the loader assumes `../components/`).

## Data collections

Markup asks for a dataset; `data.js` fetches `jsonData/<name>.json` once per page and renders it.

```html
<div class="grid grid--3" data-collection="services"></div>
<div class="service-grid" data-collection="services" data-variant="detail"></div>
<div class="vertical-grid" data-collection="verticals"></div>
<div class="vertical-list-stack" data-collection="verticals" data-variant="detail"></div>
<ul class="project-grid" data-collection="projects" data-filter="featured" data-limit="3"></ul>
<div class="carousel__track" data-collection="testimonials"></div>
<div data-collection="faqs"></div>
<select data-collection="services" data-variant="options">…</select>
```

| Attribute | Effect |
|---|---|
| `data-collection` | `services`, `verticals`, `projects`, `testimonials` or `faqs`. |
| `data-limit` | Render the first _n_ items. |
| `data-filter="featured"` | Render only items with `"featured": true`. |
| `data-variant` | services: `detail`, `links`, `options`; verticals: `detail`; testimonials: `grid`. |

Rendered markup is built with `textContent`, so dataset strings are never interpreted as HTML.
When a dataset fails to load, the host shows a readable message with a link to the contact page
instead of an empty section.

Filtering on `portfolio.html` runs over the rendered DOM (`data-filters` in `filters.js`), so the
project dataset stays the only source of truth. Two chip groups combine with AND:
`data-filter-group="category"` (capability) and `data-filter-group="vertical"` (partner type).
Chips carry `data-filter-value`; `data.js` writes `data-category` and `data-vertical` onto each card
from `projects.json`.

Sections rendered from JSON do not exist while the browser handles an initial fragment, so `data.js`
re-applies `location.hash` after rendering. That keeps deep links such as
`services.html#cloud-devops` and `industries.html#for-saas` working.

Each collection emits `collection:rendered` with `{ name, host }`; `carousel.js` and
`accordion.js` listen for it to enhance late-arriving markup.

Project cards render their `challenge`, `approach` and `result` fields inside a native
`<details>` brief ("Read the brief"), so no extra JavaScript is needed to expand a case summary.
Those three fields are also written into the card's `data-search` string, which keeps them in scope
for portfolio search without a second lookup.

## Artwork and licensing

Every image in this project is original, hand-authored SVG in `public/img/projects/`. Nothing is
stock photography, so there is **no third-party licence, attribution requirement or copyright risk**
in shipping this site, and the files total roughly 45 KB for all nine mockups.

| Field in `projects.json` | Purpose |
|---|---|
| `cover` | File name inside `public/img/projects/`, e.g. `"logistics-control-tower.svg"`. |
| `coverAlt` | Alternative text describing the mockup. Falls back to the project title. |

`data.js` prefixes `cover` with `IMAGE_PATH` and renders a lazy, 1200 × 760 `<img>`. The gradient
tile and monogram stay in the markup behind it, so a missing or broken file degrades to the old
card design instead of an empty box (the `error` handler removes the image and the
`project-card__media--image` class).

To use a different picture — including a licensed photo — drop the file in
`public/img/projects/`, set `cover` to its file name and update `coverAlt`. Keep the artwork free of
third-party logos, recognisable people and trademarks unless you hold a release for them.

## Content ownership (avoid duplication)

| Content | Lives in |
|---|---|
| Page headings, prose, hero copy, forms, page-specific service descriptions | The HTML files |
| Partner verticals (5 niches: pains, offers, metric) | `jsonData/verticals.json` |
| Service cards + detail copy (title, summary, details, deliverables, icon) | `jsonData/services.json` |
| Project cards (title, category, vertical, partner type, summary, challenge, approach, result, tags, outcome, cover, coverAlt) | `jsonData/projects.json` |
| Testimonials | `jsonData/testimonials.json` |
| FAQ questions and answers | `jsonData/faqs.json` |
| Navigation, brand, footer links, contact details | `resources/views/components/` |

## Styling rules

- All styling lives in `public/css/style.css`; there are no `style` attributes and no `<style>` blocks.
- JavaScript toggles classes and attributes only.
- Typography: `Sora` for headings and numerals, `Inter` for body copy, both self-hosted in
  `public/fonts/` and declared with `@font-face` at the top of the tokens section.
- Design tokens under `:root` cover colour, type scale, spacing, radii, elevation and motion.
  Change a token, not a rule, when adjusting the visual system.
- Layout uses CSS Grid and `clamp()`; the single layout breakpoint is **1000 px** (header nav, hero
  and page-hero switch from stacked to split), with content-driven `auto-fit` grids below it.
- Hero and CTA surfaces are dark gradients (`.hero`, `.section--ink`, `.cta-band`); body sections
  alternate white and `--paper-soft`.
- The home coverage board (`.coverage`) is a white card on a white section, separated by a
  `--line-strong` border and `--shadow-sm`. Its bars are absolutely positioned percentages of a
  24-hour UTC day — change a bar by editing `left` / `width` on
  `.coverage-row__window--{london|lisbon|dhaka}` and keep the 08:00–13:00 band in step.
- `.global-grid` / `.global-card` remain for the compact timezone tiles on `industries.html` (dark
  section only); do not reuse them on a light background.
- Carousel dots are 24 × 24 px buttons with a 10 px indicator painted by `::before`, so the visual
  size stays small while the tap target clears WCAG 2.5.8.
- Focus states use `:focus-visible`; `prefers-reduced-motion` disables transitions and carousel
  autoplay.
- Text/background pairs meet WCAG AA (4.5:1). The primary button gradient stops at `#6355f0` so
  white labels stay above 5:1 across the whole gradient.

## Accessibility notes

- Skip link on every page; one `<h1>` per page.
- Carousels expose `aria-roledescription="carousel"`, labelled prev/next/dot controls and
  arrow-key support; autoplay pauses on hover, focus and hidden tabs.
- FAQ accordion uses `aria-expanded` / `aria-controls` with `hidden` panels.
- Tabs follow the WAI-ARIA pattern with roving `tabindex` and arrow/Home/End keys.
- The contact form marks invalid fields with `aria-invalid` and `aria-describedby`, and announces
  the summary through a `role="status"` region.
