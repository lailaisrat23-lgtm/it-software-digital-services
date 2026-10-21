# Implementation Plan — Techspire Solutions (IT Software & Digital Services)

Derived from [prd1.md](./prd1.md): strict HTML-first, CSS-only styling, functionality-only JavaScript.

---

## 1. Non-negotiable constraints (from PRD)

| # | Rule | How this plan satisfies it |
|---|------|----------------------------|
| 1 | HTML is the source of truth for content | Every page's headings, prose, sections, forms, and hero copy are hard-coded in HTML. |
| 2 | No whole-site generation in JS | JS only renders *repeated collections* (service cards, project cards, testimonial slides, FAQ items) from JSON. |
| 3 | No content duplication across HTML / JS / JSON | Each dataset has exactly one owner (§3 table). |
| 4 | All CSS in `public/css/style.css` | No `<style>` blocks, no `style="..."` attributes, no `element.style.*` in JS. |
| 5 | Shared fragments in `resources/views/components/` | `header.html` + `footer.html`, loaded by `public/js/components.js` via `fetch()` (`../components/`, relative to pages in `resources/views/frontend/`) with graceful failure. |
| 6 | No backend / DB / framework / Node / npm / build | Plain files served by any static HTTP server. |
| 7 | `fetch()` only where genuinely required | JSON + fragments only; image-free CSS visuals; no fetch for static page content. |
| 8 | Degrade gracefully without JS | `<noscript>` nav fallback, native `details`-less accordion still readable as fetched… see §6 accessibility notes; form remains visible with `action` fallback message. |
| 9 | DRY, easy to maintain and extend | 6 small single-purpose JS modules, one design-token layer, documented data contracts. |

---

## 2. File tree

```
/
├── execute.md                  This plan
├── README.md                   Run instructions + component loader docs
├── jsonData/
│   ├── services.json           Reused on index + services page
│   ├── projects.json           Reused on index (featured) + portfolio (all, filtered)
│   ├── testimonials.json       Reused on index + about
│   └── faqs.json               FAQ page (+ home "quick answers")
├── resources/views/
│   ├── frontend/               All pages — one folder, identical depth
│   │   ├── index.html          Home
│   │   ├── services.html       Services (detailed, HTML-authored sections + tabs)
│   │   ├── portfolio.html      Filterable/searchable project grid (projects.json)
│   │   ├── about.html          Story, values, timeline, team (static HTML)
│   │   ├── faq.html            Accordion fed by faqs.json
│   │   ├── contact.html        Validated enquiry form + contact details
│   │   └── legal.html          Privacy, terms and accessibility statement
│   └── components/
│       ├── header.html         Brand, nav, mobile toggle, CTA
│       └── footer.html         Sitemap, contact, legal
└── public/
    ├── css/style.css           Single stylesheet, tokens under :root
    ├── fonts/                  Self-hosted Inter + Sora woff2 subsets
    └── js/
        ├── components.js       Fragment loader + mobile navigation
        ├── data.js             JSON fetch + collection renderers
        ├── carousel.js         Hero + testimonial sliders
        ├── accordion.js        FAQ accordion (ARIA)
        ├── tabs.js             Services engagement tabs (roles + arrow keys)
        ├── filters.js          Portfolio search + category filter
        └── forms.js            Client-side validation
```

**Path convention:** every page lives in `resources/views/frontend/`, so it references
`../../../public/…` and `../../../jsonData/…`, while the loader resolves fragments as
`../components/…`. Serving must start at the project root; a page at any other depth would need
those prefixes changed, so keep all pages in this one folder.

**Not created (unnecessary per PRD):** `case-studies.json`, `team.json` — team and case-study narratives live once, in HTML, because each appears on a single page.

---

## 3. Single source of truth per dataset

| Content | Owner | Why |
|---|---|---|
| Home hero, stats, section intros | `index.html` | Ordinary static content — HTML. |
| Service cards (title, summary, features, icon) | `jsonData/services.json` | Repeated on home + services page + footer list. |
| Service long-form descriptions, process, stack | `services.html` | Page-specific prose — HTML. |
| Projects (cards + filter metadata) | `jsonData/projects.json` | Filtered/searched on portfolio, featured subset on home. |
| Testimonials | `jsonData/testimonials.json` | Carousel on home + quote strip on about. |
| FAQs | `jsonData/faqs.json` | Accordion on FAQ page. |
| Team members, values, history | `about.html` | Single page — HTML. |
| Navigation, brand, footer links, legal | `resources/views/components/*` | Shared fragments. |

---

## 4. Data contracts

```jsonc
// services.json
[{ "id": "custom-software", "icon": "code", "title": "Custom Software Development",
   "summary": "…", "features": ["…", "…", "…"], "featured": true }]

// projects.json
[{ "id": "logistics-control-tower", "title": "Logistics Control Tower",
   "category": "web" | "mobile" | "cloud" | "data" | "design",
   "clientType": "Logistics · Enterprise",
   "summary": "…", "challenge": "…", "approach": "…", "result": "…",
   "cover": "logistics-control-tower.svg", "coverAlt": "…",
   "tags": ["Laravel", "Vue"], "year": 2025,
   "outcome": "−38% dispatch time", "featured": true }]

// testimonials.json
[{ "id": "t1", "quote": "…", "name": "…", "role": "…", "company": "…", "rating": 5 }]

// faqs.json
[{ "id": "f1", "category": "General", "question": "…", "answer": "…" }]
```

Renderer contracts (set by `data.js`):

| Attribute | Behaviour |
|---|---|
| `data-collection="services"` | Injects `data-limit` cards (all if omitted). |
| `data-collection="projects"` | Injects all cards; `filters.js` owns search/filter over the rendered DOM. |
| `data-collection="projects" data-filter="featured"` | Featured only. |
| `data-collection="testimonials"` | Slide markup consumed by `carousel.js`. |
| `data-collection="faqs"` | Accordion items consumed by `accordion.js`. |
| `data-component="header" \| "footer"` | Fragment host for `components.js`. |

---

## 5. Build phases

### Phase 1 — Foundation
- [x] Directory scaffold
- [x] `execute.md`
- [x] `public/css/style.css`: tokens (`:root`), reset, typography, layout primitives, buttons, cards, forms, nav, footer, carousel, accordion, tabs, filters, responsive breakpoints, `:focus-visible`, `prefers-reduced-motion`.
- [x] `public/fonts/` — self-hosted Inter + Sora woff2 subsets (latin), declared with `@font-face`

### Phase 2 — Shared shell
- [x] `resources/views/components/header.html` (skip link target, brand, 6 nav links, CTA, mobile toggle)
- [x] `resources/views/components/footer.html`
- [x] `public/js/components.js` (fetch loader, `data-page` active-link marking, mobile drawer, error state)
- [x] `README.md` documenting the loader contract

### Phase 3 — Data + renderers
- [x] `jsonData/services.json` (6), `projects.json` (9), `testimonials.json` (5), `faqs.json` (10)
- [x] `public/js/data.js` (cached fetch, escape-by-textContent DOM building, empty/error states)
- [x] `public/js/carousel.js`, `accordion.js`, `tabs.js`, `filters.js`, `forms.js`

### Phase 4 — Pages
- [x] `index.html` — hero carousel, trust bar, services (JSON), stats, featured projects (JSON), process, testimonials carousel (JSON), CTA
- [x] `services.html` — intro, 6 HTML service sections, engagement-model tabs, stack, CTA
- [x] `portfolio.html` — search + category chips + count + empty state (JSON-driven grid)
- [x] `about.html` — story, values, timeline, team, testimonial strip
- [x] `faq.html` — category-grouped accordion (JSON)
- [x] `contact.html` — validated form, contact cards, response promise
- [x] `legal.html` — privacy notice, terms summary, accessibility statement (target of the footer legal links)

### Phase 5 — Verification
- [x] Serve over `http://localhost:8080` (fetch requires HTTP, not `file://`)
- [x] Load every page: no console errors, header/footer injected, content visible
- [x] Exercise hero carousel, testimonial carousel, mobile nav, portfolio filter + search + empty state, FAQ accordion, tabs, form validation (invalid + valid)
- [x] Confirm no inline styles, no `<style>` blocks, one stylesheet, no build artefacts
- [x] Check responsive layout at 390 / 768 / 1440 px and keyboard focus visibility
- [x] Simulated failures: aborted JSON requests show collection error panels; aborted fragments show link fallbacks
- [x] Internal link and anchor check across all seven pages: no broken targets
- [x] Contrast review: muted greys ≥ 4.5:1 on their backgrounds; 44px mobile menu target

### Phase 6 — Visual redesign (post-review feedback)
Original build was structurally correct but visually flat; all seven pages were redesigned.

- [x] Typography: self-hosted `Sora` (display) + `Inter` (text), fluid `clamp()` scale, tighter
  letter-spacing, balanced headings
- [x] Home hero rebuilt: dark gradient + dot grid, eyebrow badge, gradient-emphasis headline, dual
  CTAs, avatar/rating trust row, CSS-only product mockup (KPIs, bar chart, progress rows), floating
  metric cards, and an overlapping metrics band
- [x] Hero carousel replaced by the product mockup; testimonial carousel retained
- [x] Services page: hero with "on every engagement" card, sticky anchor bar, six numbered service
  cards with icons + deliverable chips + per-service CTA, carded engagement tabs
- [x] Portfolio: at-a-glance stat cards, sticky filter bar with icon search, chip filters, live count,
  richer project cards (gradient media, outcome badge), NDA quote panel
- [x] About: hero stat grid, story split with pull-quote panel, icon value cards, timeline rail,
  avatar team cards
- [x] FAQ: two-column layout with sticky aside (reply-time stat, contact card) and carded accordions
- [x] Contact: sectioned form with legends, placeholder hints, grouped details column
- [x] Contrast fixes: primary gradient stops at `#6355f0` (>5:1 white), brand mark and avatars no
  longer end on cyan, `--danger` darkened to `#b42318` (5.67:1 on its tint)
- [x] Breakpoint unified at 1000 px (header was cramped between 921–999 px)
- [x] Verified at 390 / 768 / 1000 / 1280 / 1440 px: no horizontal overflow, no element bleeding
  outside the viewport, no clipped text, no overflowing KPI values

---

## 6. Accessibility & resilience notes

- Skip link, landmark elements, one `<h1>` per page, ordered heading levels.
- Carousel: `aria-roledescription="carousel"`, slide labels, prev/next/dot buttons, autoplay disabled under `prefers-reduced-motion`, pause on hover/focus.
- Accordion: `<button aria-expanded aria-controls>` + `region` panels.
- Tabs: `tablist`/`tab`/`tabpanel`, arrow-key roving focus.
- Forms: `aria-invalid`, `aria-describedby` error ids, `role="status"` success panel, no-JS `noscript` notice so the user still knows how to reach the team.
- Components: on `fetch` failure the host renders a visible fallback message with inline (class-based) navigation links, so navigation survives a broken component.
- If JSON fails, the host renders a readable error panel with links — never a blank section.
- `<noscript>` block per page provides a minimal text nav because the header is a fetched fragment.


### Phase 7 ? Repositioning to the real niches (client feedback)
The product is a **global delivery partner for agencies and product teams**, so content and IA moved
from "generic IT studio" to the five named verticals.

- [x] Positioning: white-label delivery for Custom Software Dev firms, SaaS Product Companies,
  Digital Marketing Agencies, UI/UX Studios and Cloud & DevOps Consultancies; market scope = global agency
- [x] New page `industries.html` ? 5 vertical blocks (pains vs. what we take off your plate, metric),
  partner-mix stats, global timezone scope, contractual partner rules
- [x] New dataset `jsonData/verticals.json` ? single source for the 5 verticals, rendered as cards on
  home + services and as detail blocks on industries
- [x] `services.json` gained `details[]`; the services page now renders 6 detail cards from JSON
  instead of 6 hand-authored long blocks (one source of truth, page height 2595 px ? ~1219 px)
- [x] Portfolio: projects carry `vertical` + `partnerType`; filters are now two AND-combined chip
  groups (capability + partner type); cards show the partner route
- [x] Testimonials rewritten as partner-side voices; FAQ reorganised around Partnership / Process /
  Commercial / Support with white-label, capacity, NDA, overlap and margin questions
- [x] Padding reduced site-wide: `--section-y` 4?7rem ? 2.5?3.75rem, page hero 3?4.5rem ? 2?2.75rem,
  cards ~1.85rem ? ~1.5rem, CTA band and tab panels tightened (measured section padding ?52 px vs 112 px)
- [x] Page heroes given a focal point: dark `hero-panel` (engagement models / partner mix / stats)
  on services, industries, portfolio, about and FAQ
- [x] Bug: deep links into JSON-rendered sections landed at the top of the page ? `data.js` now
  re-applies `location.hash` after rendering
- [x] Verified all 8 pages ? 390/768/1280 px: 24/24 combinations with no console error, no failed
  request, no empty collection, no overflow or bleeding element, one `h1` each

---

## 8. Content & UX additions (post-audit review)

Design audit found no layout defects (no overflow, no heading skips, one `h1` per page, contrast
pairs passing); three content gaps were closed instead.

- [x] **Security & confidentiality** section on `about.html` (ink section, 6 cards): contracts
  before code, IP assignment on payment, named least-privilege access, screened people and managed
  devices, data residency and deletion, 24-hour incident reporting. Styled with section-scoped
  `.section--ink .card` rules so no markup variants were needed.
- [x] **Case-study depth**: `projects.json` gained `challenge`, `approach` and `result`; `data.js`
  renders them in a native `<details>` brief on every project card (home + portfolio) and folds the
  same text into `data-search`, so portfolio search covers the brief without a second lookup.
- [x] **Comparison section** on `services.html` ? "Hire, freelance, or bring in a partner" table
  (6 criteria ? 4 columns), horizontally scrollable below 760 px, Techspire column highlighted.
- [x] Two FAQ entries added (`faq-data`, `faq-incident`) ? 14 questions across the same four
  topics; the FAQ hero copy count was updated to match.
- [x] Polish: project cards no longer lift on hover (they are not links; feedback now follows
  `:focus-within` and an open brief), mobile anchor bar shows a thin scrollbar instead of hiding
  overflow, card links are 44 px tall under 1000 px, `.pill--accent` darkened to `#086b5c`.
- [x] Re-verified: 8 pages ? 390/1440 px, no overflow or bleeding, no console errors, 9 project
  briefs on portfolio / 3 on home, filters + search + empty state unchanged, 14 FAQ items in 4 groups.

---

## 9. Home page fixes (reported: text not visible)

The "One contract, three timezones" section was a **white section rendering cards designed for a
dark surface**: white city names and `--invert-muted` body copy on white, so the copy was invisible.

- [x] Replaced the four `.global-card` tiles on `index.html` with a `.coverage` board: a 24-hour
  UTC rail with a working-window bar per studio (London 08–18, Lisbon 08–17, Dhaka 04–13) and a
  dashed band marking the shared 08:00–13:00 overlap. City, zone, note and the 4-hour badge now use
  ink-on-white pairs (18.4:1, 6.4:1, 6.0:1, 6.7:1).
- [x] `industries.html` still uses the compact `.global-grid` / `.global-card` set on its ink
  section, so those rules stay in the stylesheet (they are correct on dark).
- [x] Removed the undefined `--font-mono` reference that the old timezone label depended on.
- [x] Testimonials rebuilt as a two-column "partner voices" block (heading beside the carousel from
  1000 px) with the quote card on a two-zone grid: quote mark and rating on the top row, quote at a
  capped 48ch measure, person row last. Section height dropped from a full-width 46 px headline over
  a 1044 px-wide quote to a composed split.
- [x] Carousel: viewport no longer clips (slide shadows render fully), dots are 24 px targets with a
  10 px indicator, and prev/next, dots, arrow keys, autoplay pause and `aria-hidden` were re-tested.
- [x] Verified at 390 / 768 / 1000 / 1200 / 1440 px: no overflow, no clipped card text, heading order
  intact, all 5 slides reachable.

---

## 10. Project artwork (replacing the monogram tiles)

The portfolio showed a gradient tile with initials instead of a picture of the work.

- [x] Nine original SVG mockups in `public/img/projects/` (one per project): dashboards, a phone
  app, checkout, triage queue, migration diagram, patient portal, fleet map, design-system page and
  an integration graph. Hand-authored, so **no stock licence, no attribution and no copyright risk**;
  ~45 KB for the set, all vector and crisp at any density.
- [x] `projects.json` gained `cover` + `coverAlt`; `data.js` renders a lazy 1200 × 760 `<img>` using
  the `IMAGE_PATH` constant (`../../../public/img/projects/`), keeping the single-source-of-truth
  rule — the page only names a file.
- [x] `.project-card__media--image` switches the media area to a 1200 : 760 aspect ratio, hides the
  dot pattern, radial highlight and monogram, and moves the year chip to the top-right corner.
- [x] Graceful failure: the `error` listener is bound before `src` is assigned, removes the image and
  drops the `--image` class, so a missing file falls back to the gradient tile + monogram rather
  than an empty box (verified with a deliberate 404).
- [x] Verified: 12 images (3 home + 9 portfolio) all load at 1200 px natural width, `object-fit:
  cover` fills the media box at 390 / 768 / 1440 px, category and partner-type filters still work,
  no page overflow, no console errors.

---

## 11. "What you can rely on" redesign (industries)

The old block reused the About page's `.value-list` icon cards inside a narrow `.split` column, so
it read as generic marketing next to copy that says these terms are contractual.

- [x] Replaced with a two-column `.rules` layout: heading, lead, two proof pills and an
  "Ask for the partner agreement" action on the left; a document-style `.agreement` panel on the
  right, labelled "Partner agreement · extract" with the clause range in the corner.
- [x] The four promises are now numbered clauses (`01`–`04`) generated by a CSS `counter` on
  `.agreement__clauses li::before`, separated by hairlines, with the NDA/DPA hand-off line as a
  panel footer. The copy is unchanged word for word.
- [x] Section changed to `section--soft` so the white panel reads as a document on a tinted page;
  rhythm is now white → ink → soft → white CTA band.
- [x] Removed the now-unused `.value-list` markup from this page only; the About page still uses it
  for the four working principles, so those rules stay in the stylesheet.
- [x] Verified at 390 / 768 / 1000 / 1440 px: single column below 1000 px, 419 px + 629 px above it,
  counters resolve to 01–04, body copy at 6.04:1, no clipping, no overflow, no console errors.
