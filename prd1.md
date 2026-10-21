### Strict HTML-First, CSS-Only Styling, and Functionality-Only JavaScript Architecture

This project is a static website built with HTML5, CSS3, and vanilla JavaScript.

**HTML is the primary source of page content.** All main headings, paragraphs, section content, page structure, navigation, forms, and ordinary static content must be written directly in the relevant HTML files.

Do not store all page content in JavaScript objects or arrays. Do not generate the entire website through JavaScript.

JavaScript must primarily implement interactive functionality, including:
- Carousels and sliders
- Mobile navigation
- Portfolio search and category filters
- FAQ accordions
- Tabs and other interactive UI elements when needed
- Client-side form validation
- Optional loading of external HTML components
- Loading JSON datasets only when structured, reusable static data makes this appropriate

A `jsonData/` directory may contain JSON files for repeated datasets, such as `services.json`, `projects.json`, `case-studies.json`, `team.json`, `testimonials.json`, and `faqs.json`. Use only the files that are genuinely necessary.

Do not duplicate the same content in HTML, JavaScript, and JSON. Select one source of truth for each dataset.

Use JSON for repeated data-driven collections where it reduces duplication. Keep the homepage's primary content, page-specific descriptions, and ordinary static sections directly in HTML.

All styling must be contained in `public/css/style.css`. Use CSS custom properties under `:root`, reusable classes, responsive layouts, and accessible focus states. Inline CSS, embedded style blocks, and JavaScript-generated inline styling are prohibited.

Shared HTML fragments must live in `resources/views/components/`. Use a lightweight, documented component-loading approach compatible with a static website. All pages must use consistent component paths and must handle loading errors gracefully.

Do not use a backend, database, framework, Node.js, NPM, or a build process. All data must be static. Use vanilla JavaScript only.

Because JSON and external HTML fragments cannot be rendered directly by ordinary HTML, use `fetch()` only where required. Do not use JavaScript to load static JSON unnecessarily when the same content can be maintained more simply in HTML.

Ensure that essential content and navigation remain usable wherever practical if JavaScript fails. Test the project using a local HTTP server, since browser security restrictions may block `fetch()` when pages are opened directly through `file://`.

Follow DRY principles without introducing unnecessary abstractions. The final implementation must remain easy to understand, maintain, and extend.