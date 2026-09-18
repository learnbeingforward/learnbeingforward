import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "frontend-development",
  submodules: [
    // ───────────────────────────── HTML & CSS ─────────────────────────────
    {
      moduleTitle: "HTML & CSS",
      subModuleTitle: "Semantic HTML",
      overview:
        "Semantic HTML means choosing elements based on what content means, not how it happens to look — an <article> instead of a styled <div>, a <button> instead of a clickable <span>. This matters far beyond style: the browser's accessibility tree, screen readers, search engine crawlers, and even browser features like 'reader mode' or automatic form autofill all depend on semantic structure to understand a page. A visually identical page built entirely from <div> and <span> tags is invisible in meaning to every one of those systems. This submodule covers the structural landmark elements that define a page's regions, the inline elements that convey meaning in text, how to build genuinely accessible forms, and how heading hierarchy and ARIA fill the remaining gaps. By the end you should be able to look at any UI mockup and know which real HTML element each piece should become before writing a single line of CSS.",
      sections: [
        {
          heading: "Structural Landmarks: header, nav, main, article, section, aside, footer",
          body: "HTML5 introduced a set of sectioning elements that describe the large-scale regions of a page instead of relying on generically-named <div id=\"header\"> conventions. <header> marks introductory content (often a page or section title plus navigation), <nav> wraps primary navigation links, <main> wraps the one primary content area unique to that page (there should only ever be one visible <main> per page), <article> wraps self-contained content that would make sense distributed on its own (a blog post, a product card, a comment), <section> groups thematically related content that usually has its own heading, <aside> holds tangentially related content (a sidebar, a pull quote), and <footer> holds closing metadata. Each of these creates an implicit ARIA landmark role, which is exactly what lets a screen reader user jump directly to 'navigation' or 'main content' via a shortcut instead of tabbing through the entire page linearly.",
          bullets: [
            "<main> must be unique per page and should never be nested inside <article>, <aside>, <header>, footer, or another <main>.",
            "<section> is not a generic wrapper — if a region has no natural heading, it usually belongs in a <div> instead.",
            "<article> should make sense if pulled out of the page entirely and pasted somewhere else (an RSS reader, a syndication feed).",
            "Screen readers expose these as landmarks (role=banner, navigation, main, complementary, contentinfo) — inspect the accessibility tree in DevTools to see them.",
          ],
          code: {
            language: "html",
            code:
              "<body>\n  <header>\n    <h1>Daily Times</h1>\n    <nav aria-label=\"Primary\">\n      <ul>\n        <li><a href=\"/\">Home</a></li>\n        <li><a href=\"/world\">World</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main>\n    <article>\n      <h2>Local elections draw record turnout</h2>\n      <p>Published <time datetime=\"2026-09-14\">Sept 14, 2026</time></p>\n      <p>Turnout figures released this morning show...</p>\n    </article>\n    <aside aria-label=\"Related\">\n      <h2>Related coverage</h2>\n      <ul><li><a href=\"/analysis\">Full analysis</a></li></ul>\n    </aside>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 Daily Times</p>\n  </footer>\n</body>",
          },
        },
        {
          heading: "Text-Level Semantics: Meaning vs. Presentation",
          body: "HTML distinguishes tags that convey meaning from tags that only convey visual style, and the two are not interchangeable even when they render identically by default. <strong> means 'this content has strong importance' and is announced with emphasis by screen readers; <b> means only 'stylistically offset text' with no implied importance. Likewise <em> means genuine emphasis (changes the meaning of a sentence if read aloud with stress), while <i> is for text that is set off in a different voice or mood — a technical term, a ship's name, a thought — without implying emphasis. Other useful semantic text elements include <time> (machine-readable dates/times via the datetime attribute), <mark> (highlighted/relevant text, such as a search match), <abbr> (an abbreviation with its expansion in the title attribute), and <code>/<pre> for literal code text.",
          bullets: [
            "Use <strong>/<em> when meaning changes; use <b>/<i> only for pure styling with no semantic weight (rare in practice).",
            "<time datetime=\"2026-09-18\">Sept 18</time> lets machines (calendars, search engines) parse the actual date regardless of the displayed text.",
            "<abbr title=\"Cascading Style Sheets\">CSS</abbr> lets assistive tech announce the full expansion on first encounter.",
          ],
        },
        {
          heading: "Accessible Forms: Labels, Fieldsets, and Input Types",
          body: "Forms are the highest-stakes place to get semantics right because a mislabeled field can make an entire form unusable with a screen reader or unreliable with password managers and autofill. Every input needs an associated <label>, connected either by wrapping the input inside the label or by matching a for attribute to the input's id — this also creates a larger, more accessible click target since clicking the label text focuses the input. Related fields (like a set of radio buttons for a single question, or a billing-address group) should be wrapped in <fieldset> with a <legend> describing the group. Using the most specific input type (email, tel, date, number, url) instead of a generic text input isn't cosmetic — it triggers the right mobile keyboard, enables built-in browser validation, and improves autofill accuracy.",
          code: {
            language: "html",
            code:
              "<form>\n  <div>\n    <label for=\"email\">Email address</label>\n    <input id=\"email\" name=\"email\" type=\"email\" required autocomplete=\"email\" />\n  </div>\n\n  <fieldset>\n    <legend>Preferred contact method</legend>\n    <label><input type=\"radio\" name=\"contact\" value=\"email\" /> Email</label>\n    <label><input type=\"radio\" name=\"contact\" value=\"phone\" /> Phone</label>\n  </fieldset>\n\n  <button type=\"submit\">Create account</button>\n</form>",
          },
        },
        {
          heading: "Heading Hierarchy and the Document Outline",
          body: "Headings (<h1> through <h6>) aren't just for making text bigger — screen reader users frequently navigate a page by pulling up a list of all headings and jumping directly to the section they need, the same way a sighted user visually scans a page for the right subheading. This only works if heading levels are used in order without skipping (an <h2> should not jump straight to an <h4> just because the smaller default font size looked better — that's a job for CSS, not for choosing a different heading level). Each page should generally have exactly one <h1> describing its main content, with nested sections using <h2>, then <h3> for subsections within those, and so on.",
          bullets: [
            "Never choose a heading level for its default font size — style it with CSS and keep the level semantically correct.",
            "Run an automated heading-structure check (axe DevTools, Lighthouse accessibility audit, or the WAVE browser extension) as part of your normal review process.",
          ],
        },
        {
          heading: "ARIA: The Last Resort, Not the First Tool",
          body: "The first rule of ARIA (Accessible Rich Internet Applications) is: don't use ARIA if a native HTML element already provides the semantics and behavior you need. A native <button> already has the correct role, is keyboard-focusable, responds to both Enter and Space, and is announced correctly by every screen reader with zero extra code. Recreating that with <div role=\"button\" tabindex=\"0\"> requires you to manually wire up keyboard event handlers, manage focus styles, and set aria-pressed or similar state — and it's easy to miss an edge case native elements handle automatically. ARIA attributes are essential for the gaps HTML doesn't cover — custom widgets like tab panels, comboboxes, or live regions that announce dynamic updates (aria-live) — but they should be reached for only after confirming no semantic element already does the job.",
          bullets: [
            "aria-label and aria-labelledby give an accessible name when visible text isn't enough or isn't present.",
            "aria-live=\"polite\" announces dynamically inserted content (like a form validation error or a toast notification) without stealing focus.",
            "role overrides an element's default semantics — using it on an element that already has the right native role is redundant at best, harmful at worst.",
          ],
        },
        {
          heading: "Images, Alt Text, and Decorative Content",
          body: "Every <img> needs an alt attribute, but writing good alt text is a skill: describe the content and function of the image as it relates to the surrounding context, not a literal visual description. An image that functions as a link to the homepage should have alt text describing the destination ('Acme homepage'), not the image itself ('logo'). Purely decorative images (a background flourish, a spacer) should use an empty alt=\"\" (not omit the attribute entirely) so screen readers skip over them silently rather than announcing an unhelpful filename.",
          bullets: [
            "alt=\"\" (empty, but present) tells assistive tech to skip a purely decorative image.",
            "Omitting alt entirely is different from alt=\"\" — some screen readers will read the filename as a fallback, which is worse than silence.",
            "Complex images (charts, diagrams) need a longer text alternative nearby in the page, since alt text alone is too short to convey the data.",
          ],
        },
      ],
      commonPitfalls: [
        "Building entire layouts from <div> and <span> ('div soup') when a semantic element already exists for that purpose.",
        "Using a <div> or <span> with an onClick handler instead of a real <button>, which silently breaks keyboard navigation and screen reader announcement.",
        "Skipping heading levels for visual sizing reasons (jumping from <h2> straight to <h4>) instead of using CSS to control size.",
        "Leaving form inputs without an associated <label>, relying on placeholder text alone (which disappears once the user starts typing and isn't reliably announced).",
        "Omitting alt attributes on images, or filling them with unhelpful text like 'image123.jpg'.",
        "Reaching for ARIA roles and attributes before checking whether a native HTML element already provides the needed semantics and behavior.",
        "Using multiple <h1> elements or multiple <main> elements on a single page.",
      ],
      keyTakeaways: [
        "Choose elements for what content means, not how it renders — CSS controls appearance, HTML controls meaning.",
        "Landmark elements (header/nav/main/aside/footer) let screen reader users jump directly between page regions instead of tabbing linearly.",
        "A native interactive element (button, a, input) gives you keyboard support and correct semantics for free — recreating it with a styled div means rebuilding all of that by hand.",
        "Every form input needs a real, programmatically associated label — placeholder text is not a substitute.",
        "The first rule of ARIA is not to use ARIA when a native HTML element already solves the problem.",
      ],
      links: [
        { label: "MDN — HTML: A good basis for accessibility", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML" },
        { label: "web.dev — Learn HTML: Semantics", url: "https://web.dev/learn/html/semantic-html" },
        { label: "W3C WAI-ARIA Authoring Practices Guide", url: "https://www.w3.org/WAI/ARIA/apg/" },
      ],
    },
    {
      moduleTitle: "HTML & CSS",
      subModuleTitle: "Modern CSS & layout (Flexbox/Grid)",
      overview:
        "Before Flexbox and Grid, CSS layout relied on hacks — floats meant for wrapping text around images, or table-based layouts — that never behaved intuitively for full-page structure. Flexbox (2017-ish widespread adoption) and CSS Grid solved this properly: Flexbox distributes items along a single axis and excels at things like navigation bars, button groups, and centering; Grid defines both rows and columns simultaneously and excels at full page and component layouts with precise two-dimensional placement. This submodule covers both systems in depth — the core vocabulary of main/cross axis in Flexbox, the track/area vocabulary of Grid, the alignment properties they share, and the practical judgment call of when to reach for one over the other. It also covers the box model foundation both systems sit on top of, since a surprising number of 'Flexbox bugs' are actually box-sizing bugs in disguise.",
      sections: [
        {
          heading: "The Box Model and box-sizing",
          body: "Every element generates a box made of content, padding, border, and margin, stacked from the inside out. By default (content-box), the width and height you set apply only to the content area — adding 20px of padding and a 2px border to an element with width: 200px makes it render at 244px total, which surprises almost everyone the first time they hit it. Setting box-sizing: border-box changes width/height to include padding and border, so a 200px-wide box with padding stays 200px wide, with the content area shrinking instead. Nearly every modern CSS reset applies border-box globally as the very first rule, because it matches how most developers actually reason about sizing.",
          code: {
            language: "css",
            code:
              "*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.card {\n  width: 300px;\n  padding: 1.5rem;\n  border: 1px solid #ddd;\n  /* renders at exactly 300px wide, not 300 + padding + border */\n}",
          },
        },
        {
          heading: "Flexbox: One-Dimensional Layout",
          body: "Flexbox lays out children of a flex container along a single main axis (row by default, or column with flex-direction: column), with a perpendicular cross axis. justify-content aligns items along the main axis (flex-start, center, space-between, space-around, space-evenly); align-items aligns items along the cross axis (stretch is the default, plus center, flex-start, flex-end). Individual items grow and shrink to fill or fit available space via flex-grow, flex-shrink, and flex-basis — almost always written as the flex shorthand (flex: 1 1 0 or simply flex: 1 to mean 'grow and shrink equally, ignore intrinsic size'). flex-wrap: wrap lets items flow onto new lines instead of being forced to shrink indefinitely or overflow.",
          bullets: [
            "justify-content = main axis alignment; align-items = cross axis alignment — mixing these up is the single most common Flexbox confusion.",
            "flex: 1 on every child of a flex container makes them share available space equally regardless of content length.",
            "gap (not margin hacks) is the modern way to add spacing between flex items, and it doesn't add extra space at the container's edges.",
            "align-self overrides align-items for one individual flex item.",
          ],
          code: {
            language: "css",
            code:
              ".navbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0.75rem 1.5rem;\n}\n\n.navbar__links {\n  display: flex;\n  gap: 1.5rem;\n}\n\n.card-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n.card-row > .card {\n  flex: 1 1 250px; /* grow/shrink, but never smaller than ~250px before wrapping */\n}",
          },
        },
        {
          heading: "CSS Grid: Two-Dimensional Layout",
          body: "Grid defines an explicit set of rows and columns and places items into that structure directly, which makes it the natural choice for full-page layouts and any component that needs precise control over both dimensions at once. grid-template-columns and grid-template-rows define track sizes using fixed lengths, percentages, or the fr unit (a share of remaining space after fixed tracks are subtracted). Items are placed automatically in source order, or explicitly with grid-column/grid-row line numbers, or — often the most readable option — named template areas that let you sketch the layout visually right in the CSS.",
          code: {
            language: "css",
            code:
              ".page {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-areas:\n    \"sidebar header\"\n    \"sidebar main\";\n  min-height: 100vh;\n}\n.sidebar { grid-area: sidebar; }\n.header  { grid-area: header; }\n.main    { grid-area: main; }\n\n/* A responsive card grid with NO media queries at all */\n.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 1.5rem;\n}",
          },
        },
        {
          heading: "auto-fill vs. auto-fit with minmax()",
          body: "The repeat(auto-fit, minmax(220px, 1fr)) pattern is one of the most powerful tools in modern CSS: it tells the browser to fit as many 220px-minimum columns as will comfortably fit the container, and to stretch them to fill any remaining space — producing a fully responsive grid without writing a single media query. auto-fill and auto-fit differ subtly: auto-fill keeps empty tracks (leaving gaps if there aren't enough items to fill a row), while auto-fit collapses empty tracks to zero width, letting existing items stretch to fill the leftover space. For a card gallery where you always want items to fill the available width, auto-fit is almost always the right choice.",
        },
        {
          heading: "Shared Alignment Properties: place-items, gap, justify-self",
          body: "Grid and Flexbox share much of their alignment vocabulary, which makes the two systems easier to learn together than separately. gap works identically in both to add consistent spacing between items without margin hacks. justify-self/align-self position an individual item within its own grid cell or flex line, mirroring justify-content/align-items at the container level. The place-items and place-content shorthands set both the row and column (or main and cross axis) alignment in a single declaration — place-items: center center is the single most common and reliable way to center anything, replacing older hacks involving absolute positioning and negative margins.",
          code: {
            language: "css",
            code:
              ".centered-box {\n  display: grid;\n  place-items: center; /* centers child both horizontally and vertically */\n  min-height: 100vh;\n}",
          },
        },
        {
          heading: "Choosing Flexbox vs. Grid",
          body: "The practical rule: reach for Flexbox when you're arranging items along a single row or column and want them to react naturally to their own content size (a nav bar, a button group, a horizontally scrolling list of tags). Reach for Grid when you're laying out a structure with meaningful rows and columns at the same time (a page skeleton, a photo gallery, a dashboard of cards, form layouts with aligned labels and inputs). In practice most real interfaces use both together — Grid for the outer page/component skeleton, Flexbox for the one-dimensional arrangements nested inside each grid cell.",
          bullets: [
            "One dimension, content-driven sizing → Flexbox.",
            "Two dimensions, structure-driven sizing → Grid.",
            "It's completely normal (and common) to nest a flex container inside a grid item, or vice versa.",
          ],
        },
        {
          heading: "Common Flex/Grid Sizing Gotchas",
          body: "Flex and grid items have a default min-width/min-height of auto, which means they won't shrink below their content's intrinsic size by default — this is the root cause behind long unbreakable text or a wide image overflowing a flex/grid container even though flex-shrink is set. Setting min-width: 0 (for row layouts) or min-height: 0 (for column layouts) on the item removes that floor and lets it shrink or truncate (with overflow: hidden and text-overflow: ellipsis) as expected. This single property fixes a large fraction of 'my flex item won't shrink and it's overflowing the page' bug reports.",
          code: {
            language: "css",
            code:
              ".flex-row { display: flex; gap: 1rem; }\n.flex-row .text-cell {\n  min-width: 0; /* allow shrinking below content's intrinsic width */\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}",
          },
        },
      ],
      commonPitfalls: [
        "Forgetting box-sizing: border-box, then being confused why padding/border makes elements wider than the declared width.",
        "Confusing justify-content (main axis) with align-items (cross axis), especially after switching flex-direction to column.",
        "Assuming flex items shrink freely — they respect a default min-width: auto floor based on content, which overflow: hidden alone doesn't fix without also setting min-width: 0.",
        "Using margin on individual flex/grid children to fake spacing instead of the container's gap property, leading to inconsistent edge spacing.",
        "Reaching for absolute positioning and negative margins to center content instead of place-items: center or margin: auto in a flex container.",
        "Using floats and clearfix hacks for layout in new code when Flexbox/Grid make them unnecessary.",
        "Not realizing auto-fill leaves empty gap tracks while auto-fit collapses them — picking the wrong one gives a layout that looks broken with few items.",
      ],
      keyTakeaways: [
        "box-sizing: border-box should be a global reset in nearly every project — it makes width/height match real developer intuition.",
        "Flexbox = one axis at a time; Grid = both axes simultaneously — pick based on whether the layout is fundamentally 1D or 2D.",
        "repeat(auto-fit, minmax(min, 1fr)) builds a fully responsive grid without a single media query.",
        "gap is the modern, correct way to space out flex/grid children — stop reaching for margin hacks.",
        "min-width: 0 / min-height: 0 is the fix for flex/grid items that refuse to shrink below their content size.",
      ],
      links: [
        { label: "CSS-Tricks — A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
        { label: "CSS-Tricks — A Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
        { label: "MDN — CSS Grid Layout", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout" },
      ],
    },
    {
      moduleTitle: "HTML & CSS",
      subModuleTitle: "Responsive design principles",
      overview:
        "Responsive design means a single codebase adapts cleanly across phones, tablets, and desktops rather than shipping separate sites per device class. It rests on a handful of concrete techniques: the viewport meta tag (without which mobile browsers render at a fake desktop-width zoomed out), media queries applied mobile-first, relative sizing units that scale naturally, responsive images that serve the right file size for the right screen, and — more recently — container queries that respond to a component's own space rather than the whole viewport. This submodule walks through each technique with working code, and covers the mobile-first philosophy: write the simplest, single-column baseline for small screens first, then progressively layer on complexity as more screen space becomes available, rather than designing for desktop and trying to compress it down afterward.",
      sections: [
        {
          heading: "The Viewport Meta Tag",
          body: "Mobile browsers historically rendered pages at a virtual desktop width (usually 980px) and let users pinch-zoom, which made unstyled mobile pages readable but broke any actual responsive CSS. The viewport meta tag opts a page into using the device's real width for layout instead. Without <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> in the <head>, every media query and responsive layout technique in this module will render incorrectly on real phones even though it looks fine in a resized desktop browser — this one line is a prerequisite for everything else in this submodule.",
          code: {
            language: "html",
            code:
              "<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>My Site</title>\n</head>",
          },
        },
        {
          heading: "Mobile-First Media Queries",
          body: "A mobile-first approach writes default (unqueried) CSS for the smallest screens, then uses min-width media queries to add complexity as the viewport grows — each breakpoint only adds rules, never fights previous ones with overrides. This produces less CSS overall than desktop-first (max-width) approaches, because you're not writing a full desktop layout and then undoing pieces of it for mobile. Breakpoints should be chosen based on where your actual content starts to look cramped or awkwardly spaced, not based on specific device dimensions (which change every year with new hardware).",
          code: {
            language: "css",
            code:
              "/* Base styles: mobile, single column */\n.layout {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  .layout {\n    flex-direction: row;\n  }\n  .sidebar { flex: 0 0 220px; }\n}\n\n/* Desktop and up */\n@media (min-width: 1200px) {\n  .layout { gap: 2rem; }\n}",
          },
        },
        {
          heading: "Relative Units: rem, em, %, vw/vh, and clamp()",
          body: "Fixed pixel values don't respect user preferences or adapt to context. rem is relative to the root element's font size, making it the standard unit for spacing and typography because resizing the root font (e.g. a user's browser accessibility setting) scales the whole page proportionally. em is relative to the current element's own font size, useful for spacing that should scale with a specific component's text size. Percentages size relative to a parent's dimension, and vw/vh size relative to the viewport — powerful but risky for typography since text can become unreadably large or small at extreme viewport sizes if used alone. clamp(min, preferred, max) solves this by letting a value scale fluidly with the viewport while never crossing a safe minimum or maximum.",
          bullets: [
            "font-size: clamp(1rem, 0.9rem + 1vw, 1.5rem) scales fluidly between breakpoints instead of jumping abruptly at each one.",
            "Avoid setting the root font-size in px if you want to respect user browser zoom/accessibility settings — leave it at the browser default (usually 16px) or set it with a percentage.",
            "1rem always equals the root <html> font-size, regardless of nesting depth — unlike em, which compounds with each nested level.",
          ],
        },
        {
          heading: "Responsive Images: srcset, sizes, and <picture>",
          body: "Serving one large image to every device wastes bandwidth on small screens and hurts Core Web Vitals (specifically LCP). The srcset attribute lists multiple image files at different resolutions with their intrinsic widths, and sizes tells the browser how much of the viewport the image will occupy at different breakpoints — together they let the browser choose the best-fitting file automatically. The <picture> element goes further, allowing entirely different image sources (different art direction, or modern formats like AVIF/WebP with a fallback) based on media conditions.",
          code: {
            language: "html",
            code:
              "<img\n  src=\"hero-800.jpg\"\n  srcset=\"hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w\"\n  sizes=\"(min-width: 1024px) 50vw, 100vw\"\n  alt=\"Product overview\"\n  loading=\"lazy\"\n/>\n\n<picture>\n  <source srcset=\"hero.avif\" type=\"image/avif\" />\n  <source srcset=\"hero.webp\" type=\"image/webp\" />\n  <img src=\"hero.jpg\" alt=\"Product overview\" />\n</picture>",
          },
        },
        {
          heading: "Container Queries: Responding to Component Space, Not Viewport",
          body: "Media queries respond to the overall viewport size, which breaks down for reusable components that might appear in a wide main content area on one page and a narrow sidebar on another — a media query can't tell the difference. Container queries solve this by letting a component respond to the size of its own containing element instead. A parent is opted in with container-type: inline-size, and children use @container instead of @media — the same component then adapts correctly regardless of where it's placed on the page.",
          code: {
            language: "css",
            code:
              ".card-container {\n  container-type: inline-size;\n  container-name: card;\n}\n\n@container card (min-width: 400px) {\n  .card {\n    display: grid;\n    grid-template-columns: 120px 1fr;\n  }\n}",
          },
        },
        {
          heading: "Fluid Layouts Without Breakpoints",
          body: "Not every responsive behavior needs a media query at all. Percentage-based widths, max-width combined with width: 100% (so an element shrinks on small screens but never grows past a comfortable reading width on large ones), and flex-wrap on a flex container let a layout adapt continuously to any width in between explicit breakpoints. This 'fluid by default, breakpoints only when structure genuinely needs to change' approach produces layouts that hold up on the huge range of real device widths that exist between your chosen breakpoints, rather than only looking correct at the exact widths you tested.",
        },
        {
          heading: "Testing Responsiveness Properly",
          body: "Browser DevTools' device toolbar (responsive design mode) is the fast first pass — it lets you drag to any width and preview common device presets instantly — but it doesn't perfectly replicate real touch behavior, real network conditions, or how a real mobile browser's chrome (address bar showing/hiding) affects available viewport height. Before considering a responsive layout done, test on at least one real iOS and one real Android device where possible, check landscape orientation (often forgotten), and verify zoomed/larger text sizes don't break the layout for accessibility.",
        },
      ],
      commonPitfalls: [
        "Forgetting the viewport meta tag entirely, making every other responsive technique render incorrectly on real mobile devices.",
        "Designing desktop-first and retrofitting mobile with max-width overrides, producing bloated CSS that fights itself.",
        "Using fixed pixel widths on containers, which forces horizontal scrolling on any screen narrower than that fixed value.",
        "Sizing typography purely with vw units with no clamp()/min/max bound, producing unreadably tiny or huge text at extreme viewport widths.",
        "Choosing breakpoints based on specific device dimensions (e.g. 'iPhone 12 width') instead of where the actual content layout starts to break down.",
        "Shipping one large image to all devices instead of using srcset/sizes, hurting mobile load time and Largest Contentful Paint.",
        "Only testing in a resized desktop browser window and never on real touch hardware before shipping.",
      ],
      keyTakeaways: [
        "The viewport meta tag is a non-negotiable prerequisite — without it, mobile browsers ignore your responsive CSS.",
        "Mobile-first (min-width media queries) produces leaner, less contradictory CSS than desktop-first (max-width).",
        "rem for typography and spacing respects user accessibility preferences in a way raw px values don't.",
        "srcset/sizes and <picture> let the browser choose the right image for the device, saving significant bandwidth on mobile.",
        "Container queries solve what media queries structurally can't: a component that must adapt to its own container's width, not the viewport's.",
      ],
      links: [
        { label: "web.dev — Learn Responsive Design", url: "https://web.dev/learn/design/" },
        { label: "MDN — Responsive images", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images" },
        { label: "MDN — CSS Container Queries", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries" },
      ],
    },

    // ───────────────────────────── JavaScript ─────────────────────────────
    {
      moduleTitle: "JavaScript",
      subModuleTitle: "Core JS fundamentals",
      overview:
        "Every framework, library, and browser API a frontend developer touches is ultimately built on a small core of JavaScript language behavior — variable scoping, type coercion, function semantics, and closures. Getting these fundamentals genuinely solid (not just 'I've seen the syntax before') is what makes debugging fast instead of mysterious, because most bugs in application code trace back to a misunderstanding of one of these core mechanics rather than a framework quirk. This submodule covers variable declarations and scope (let/const vs. the legacy var), how JavaScript's type system and coercion rules actually work, the different ways to define functions and how each handles this, and closures — the mechanism behind private state, callbacks, and much of how hooks work in modern frameworks.",
      sections: [
        {
          heading: "let, const, var, and Scope",
          body: "var is function-scoped and hoisted with its declaration initialized to undefined, which means a var can be 'used' before its declaration line without an immediate error — a frequent source of confusing bugs, especially inside loops. let and const are block-scoped (confined to the nearest {}) and exist in a 'temporal dead zone' from the start of their block until their declaration line, so accessing them early throws a clear ReferenceError instead of silently returning undefined. const prevents reassignment of the variable binding itself, but does not make the value immutable — a const object or array can still have its properties or elements mutated, only the variable can't be pointed at a different value.",
          bullets: [
            "for (var i = 0; ...) inside a loop with an async callback captures the same shared i for every callback; for (let i = 0; ...) creates a fresh binding per iteration.",
            "const arr = [1,2,3]; arr.push(4) is legal — you're mutating the array's contents, not reassigning the variable.",
            "Prefer const by default, let only when you know a variable will be reassigned, and avoid var in new code entirely.",
          ],
          code: {
            language: "javascript",
            code:
              "// Classic var-in-loop bug\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0); // logs 3, 3, 3\n}\n\n// Fixed with let — each iteration gets its own binding\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 0); // logs 0, 1, 2\n}",
          },
        },
        {
          heading: "Types, Coercion, and == vs ===",
          body: "JavaScript has a small set of primitive types (string, number, boolean, undefined, null, symbol, bigint) plus object (which arrays and functions are special cases of). typeof reveals a value's type at runtime, but with two famous quirks: typeof null is 'object' (a decades-old bug preserved for compatibility) and typeof of an array is also 'object' (use Array.isArray() instead). The == operator performs type coercion before comparing, producing surprising results like '' == 0 being true, while === compares both type and value with no coercion. Modern style guides near-universally mandate === specifically to eliminate this class of bug.",
          bullets: [
            "null == undefined is true, but null === undefined is false — the one case where == is sometimes used deliberately.",
            "NaN is the only JS value that is not equal to itself; use Number.isNaN(x), never x === NaN.",
            "Falsy values: false, 0, -0, '', null, undefined, NaN. Everything else, including '0' and [] (empty array), is truthy.",
          ],
        },
        {
          heading: "Functions: Declarations, Expressions, and Arrow Functions",
          body: "Function declarations (function greet() {}) are fully hoisted, so they can be called before their line in the file. Function expressions (const greet = function() {}) are not — only the variable declaration is hoisted, not the assignment. Arrow functions (const greet = () => {}) are always expressions, have no arguments object, cannot be used as constructors, and — most importantly — do not have their own this; they inherit this lexically from the enclosing scope at the time they're defined. This last property is exactly why arrow functions are preferred for callbacks inside class methods or object methods where you want this to keep referring to the outer context.",
          code: {
            language: "javascript",
            code:
              "class Timer {\n  seconds = 0;\n  start() {\n    // Arrow function inherits `this` from start() — refers to the Timer instance\n    setInterval(() => { this.seconds++; }, 1000);\n  }\n}\n\nclass BrokenTimer {\n  seconds = 0;\n  start() {\n    // Regular function loses `this` — it's undefined or the global object here\n    setInterval(function () { this.seconds++; }, 1000); // bug\n  }\n}",
          },
        },
        {
          heading: "Objects and Arrays: The Core Data Structures",
          body: "Objects are unordered collections of key/value pairs; arrays are ordered, index-based lists that are actually objects under the hood with numeric keys and a special length property. Both are passed and assigned by reference, not by value — assigning an existing object to a new variable copies the reference, not the data, so mutating it through either variable affects the same underlying object. Common array methods split into mutating (push, pop, splice, sort, reverse — modify the original array) and non-mutating (map, filter, slice, concat — return a new array), and knowing which category a method falls into prevents accidental mutation bugs, especially in frameworks like React that rely on detecting new references to trigger re-renders.",
          bullets: [
            "const a = obj; a.x = 1 also changes obj.x — they're the same object in memory.",
            "sort() and reverse() mutate the original array in place; toSorted()/toReversed() (newer, ES2023) return new copies instead.",
            "Object.freeze() makes an object's own properties immutable at the top level only — nested objects inside it remain mutable.",
          ],
        },
        {
          heading: "Closures: Functions That Remember Their Scope",
          body: "A closure is a function bundled together with references to its surrounding (lexical) scope, which means the function can continue to access variables from that scope even after the outer function has finished executing. This is the mechanism behind private variables in JavaScript (before classes had real private fields), memoization/caching functions, and — critically for later material — how React's useState and custom hooks retain state between renders without any special language feature beyond closures themselves.",
          code: {
            language: "javascript",
            code:
              "function createCounter() {\n  let count = 0; // private — only accessible via the closure below\n  return {\n    increment: () => ++count,\n    getValue: () => count,\n  };\n}\n\nconst counter = createCounter();\ncounter.increment();\ncounter.increment();\nconsole.log(counter.getValue()); // 2 — `count` persisted between calls",
          },
        },
        {
          heading: "Control Flow and Truthy/Falsy Checks",
          body: "JavaScript's if/else, for, while, and switch statements work largely as in other C-family languages, but leaning on truthy/falsy coercion in conditions is idiomatic JS in a way it isn't in stricter languages. if (array.length) is a common, correct way to check for a non-empty array, since 0 (empty array's length) is falsy and any positive number is truthy. switch uses strict equality (===) for its case comparisons, and forgetting a break statement causes execution to 'fall through' into the next case — sometimes intentional, but usually a bug.",
          bullets: [
            "switch cases fall through without an explicit break — group cases deliberately with a comment noting the fallthrough is intentional.",
            "if (someValue) treats 0, '', and NaN as falsy even when they're semantically valid, meaningful values — be explicit (someValue === 0 ? ... ) when zero is a valid case.",
          ],
        },
        {
          heading: "Error Handling with try/catch",
          body: "try/catch lets code recover from runtime errors instead of crashing the whole script. Code that might throw goes in the try block; the catch block receives the thrown error (conventionally named err or e) and runs recovery logic; an optional finally block runs regardless of whether an error occurred, commonly used for cleanup (closing a connection, hiding a loading spinner). Throwing your own errors with throw new Error('message') (rather than throwing a plain string) preserves a stack trace, which is essential for debugging in production.",
          code: {
            language: "javascript",
            code:
              "function parseConfig(json) {\n  try {\n    return JSON.parse(json);\n  } catch (err) {\n    console.error('Invalid config JSON:', err.message);\n    return null; // fallback instead of crashing the app\n  } finally {\n    console.log('Config parse attempt finished');\n  }\n}",
          },
        },
      ],
      commonPitfalls: [
        "Using var inside a loop with an async callback, expecting each iteration to capture its own value of the loop variable.",
        "Assuming const makes an object or array immutable — it only prevents reassigning the variable, not mutating its contents.",
        "Using == instead of === and getting bitten by unexpected coercion ('' == 0, null == undefined).",
        "Passing a regular function as a callback inside a class method and being surprised that `this` is no longer the instance.",
        "Checking for NaN with x === NaN, which is always false — NaN is never equal to itself.",
        "Mutating an array with a mutating method (sort, splice) when the original, unmodified array was still needed elsewhere.",
        "Throwing a plain string (throw 'error') instead of an Error object, losing the stack trace needed to debug it.",
      ],
      keyTakeaways: [
        "Prefer const by default, let when reassignment is needed, and avoid var entirely in new code.",
        "=== avoids an entire category of coercion bugs that == silently permits.",
        "Arrow functions inherit `this` lexically — that's precisely why they're the right choice for callbacks inside class/object methods.",
        "Objects and arrays are reference types — copying the variable does not copy the underlying data.",
        "Closures are the mechanism, not a framework feature — they're what lets a returned function 'remember' variables from its creating scope.",
      ],
      links: [
        { label: "MDN — JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
        { label: "javascript.info — The Modern JavaScript Tutorial", url: "https://javascript.info/" },
        { label: "MDN — Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures" },
      ],
    },
    {
      moduleTitle: "JavaScript",
      subModuleTitle: "DOM manipulation",
      overview:
        "The Document Object Model (DOM) is the browser's live, in-memory tree representation of a page, and vanilla DOM manipulation — selecting elements, changing their content and attributes, responding to events, and updating the tree — is what every frontend framework ultimately compiles down to. Understanding it directly matters even in a React/Vue/Angular-heavy career, both because you'll occasionally need to escape the framework abstraction (measuring an element, integrating a non-framework library) and because understanding what the framework is optimizing away makes framework-level performance problems make sense. This submodule covers selecting and creating elements, updating content and attributes safely, the event system including bubbling and delegation, and the handful of practices that keep DOM-heavy code fast instead of janky.",
      sections: [
        {
          heading: "Selecting Elements",
          body: "document.querySelector(selector) returns the first element matching any CSS selector, and document.querySelectorAll(selector) returns all matches as a static NodeList — both are the modern, flexible default. The older getElementById, getElementsByClassName, and getElementsByTagName are faster in theory (no CSS selector parsing) but far less flexible, and getElementsByClassName/TagName return a live HTMLCollection that automatically updates as the DOM changes, which can cause subtle bugs if you iterate over it while modifying the DOM. querySelectorAll's NodeList, by contrast, is a snapshot and supports .forEach() directly.",
          code: {
            language: "javascript",
            code:
              "const submitBtn = document.querySelector('#submit-btn');\nconst allCards = document.querySelectorAll('.card');\n\nallCards.forEach((card) => {\n  card.classList.add('loaded');\n});\n\nif (submitBtn === null) {\n  console.warn('Submit button not found in DOM'); // always guard against null\n}",
          },
        },
        {
          heading: "Creating and Updating Elements Safely",
          body: "document.createElement(tag) builds a new, detached element that must be inserted with appendChild, append, prepend, or insertBefore before it appears on the page. For updating existing content, textContent sets/reads plain text and is always safe; innerHTML parses a string as HTML and re-renders the element's children, which is powerful but dangerous — inserting any string that includes untrusted user input via innerHTML opens a cross-site scripting (XSS) vulnerability, since embedded <script> or event-handler attributes can execute. When you need to insert structured content, build it with createElement/append calls or use the safer insertAdjacentText, rather than string-concatenating HTML.",
          code: {
            language: "javascript",
            code:
              "const list = document.querySelector('#todo-list');\n\nfunction addTodo(text) {\n  const li = document.createElement('li');\n  li.textContent = text; // safe — never interprets `text` as HTML\n  li.classList.add('todo-item');\n  list.appendChild(li);\n}\n\naddTodo('<img src=x onerror=alert(1)>'); // rendered as literal text, not executed",
          },
        },
        {
          heading: "Event Handling and the Event Object",
          body: "element.addEventListener(type, handler) attaches a listener without overwriting any existing listeners on the same element (unlike the older element.onclick = handler, which allows only one). The handler receives an event object carrying details like event.target (the actual element that triggered the event, useful with delegation), event.currentTarget (the element the listener is attached to), and methods like event.preventDefault() (stop a form submission or link navigation) and event.stopPropagation() (stop the event from bubbling further up the tree).",
          code: {
            language: "javascript",
            code:
              "const form = document.querySelector('#signup-form');\n\nform.addEventListener('submit', (event) => {\n  event.preventDefault(); // stop the default full-page form submission\n  const formData = new FormData(form);\n  console.log(Object.fromEntries(formData));\n});",
          },
        },
        {
          heading: "Event Bubbling and Delegation",
          body: "Most DOM events bubble: after firing on the exact target element, they fire again on each ancestor up to document. This is what makes event delegation possible — instead of attaching a listener to every individual item in a list (expensive, and broken for items added later), attach one listener to a stable parent container and inspect event.target to determine which child was actually interacted with. Delegation is both a performance win (one listener instead of hundreds) and a correctness win (it automatically covers elements added to the DOM after the listener was attached).",
          code: {
            language: "javascript",
            code:
              "const list = document.querySelector('#todo-list');\n\n// One listener handles clicks on ANY current or future <li>, via delegation\nlist.addEventListener('click', (event) => {\n  const item = event.target.closest('li');\n  if (!item) return; // click didn't land on/inside an <li>\n  item.classList.toggle('done');\n});",
          },
        },
        {
          heading: "Classes, Styles, and Data Attributes",
          body: "classList (.add, .remove, .toggle, .contains) is the preferred way to change an element's appearance, since it works with existing CSS rules instead of hard-coding style values in JavaScript. The style property sets inline CSS directly (element.style.display = 'none') and is appropriate for values computed at runtime that can't be expressed as a toggleable class, like a dynamically calculated position. dataset exposes custom data-* attributes as a convenient object, which is the standard way to attach small pieces of state or configuration directly to an element in HTML.",
          code: {
            language: "javascript",
            code:
              "// <button data-user-id=\"42\" class=\"follow-btn\">Follow</button>\nconst btn = document.querySelector('.follow-btn');\nconsole.log(btn.dataset.userId); // \"42\" (always a string)\n\nbtn.addEventListener('click', () => {\n  btn.classList.toggle('following');\n  btn.textContent = btn.classList.contains('following') ? 'Following' : 'Follow';\n});",
          },
        },
        {
          heading: "Traversing the DOM",
          body: "Once you have a reference to one element, related elements are reachable via parentElement, children (element children only, unlike childNodes which includes text/comment nodes), nextElementSibling/previousElementSibling, and closest(selector) (walks up from the element, including itself, to find the nearest ancestor matching a selector — extremely useful inside delegated event handlers, as shown above).",
        },
        {
          heading: "Performance: Avoiding Layout Thrashing",
          body: "Reading a layout property (offsetHeight, getBoundingClientRect(), scrollTop) forces the browser to recalculate layout if anything has changed since the last render; writing a style change invalidates layout again. Interleaving reads and writes in a loop — read, write, read, write — forces the browser to recalculate layout repeatedly within a single frame ('layout thrashing'), which is a common cause of janky scrolling and animation. The fix is to batch all reads first, then all writes. For inserting many elements at once, building them inside a DocumentFragment (an in-memory container with no visual presence) and appending the fragment once avoids triggering a reflow for every individual insertion.",
          bullets: [
            "Batch reads then writes: read all needed measurements first, store them in variables, then apply all DOM writes afterward.",
            "DocumentFragment lets you build a batch of nodes off-DOM and insert them all in a single operation.",
            "requestAnimationFrame schedules visual updates in sync with the browser's paint cycle, avoiding redundant work.",
          ],
        },
      ],
      commonPitfalls: [
        "Setting innerHTML with any string containing user-generated content, opening an XSS vulnerability.",
        "Attaching a separate event listener to every item in a large or dynamic list instead of using event delegation on a parent.",
        "Forgetting that querySelector/getElementById return null when nothing matches, then calling a method on that null and crashing.",
        "Iterating a live HTMLCollection (from getElementsByClassName/TagName) while adding or removing matching elements, producing unpredictable skipped/duplicated iterations.",
        "Interleaving DOM reads (offsetHeight, getBoundingClientRect) and writes (style changes) inside a loop, causing repeated forced layout recalculation.",
        "Attaching event listeners without ever removing them on cleanup, leaking memory in long-lived single-page applications.",
        "Using element.onclick = fn, which silently overwrites any previously assigned handler instead of adding an additional one.",
      ],
      keyTakeaways: [
        "querySelector/querySelectorAll with standard CSS selectors should be your default for element selection.",
        "textContent is always safe; innerHTML with any untrusted string is an XSS risk.",
        "Event bubbling makes delegation possible — one listener on a stable parent can handle events for children that don't exist yet.",
        "closest(selector) is the standard tool for identifying which delegated child was actually interacted with.",
        "Batch DOM reads separately from DOM writes to avoid forced synchronous layout recalculation (layout thrashing).",
      ],
      links: [
        { label: "MDN — Introduction to the DOM", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction" },
        { label: "MDN — EventTarget.addEventListener()", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" },
        { label: "web.dev — Avoid large, complex layouts and layout thrashing", url: "https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing" },
      ],
    },
    {
      moduleTitle: "JavaScript",
      subModuleTitle: "Async JS & APIs",
      overview:
        "Almost everything a frontend app does that takes real-world time — fetching data, waiting on a timer, reading a file, waiting for user input — is asynchronous, and JavaScript's single-threaded, non-blocking model handles this through callbacks, Promises, and the async/await syntax built on top of them. This submodule traces that evolution: why raw callbacks caused 'callback hell,' how Promises fixed composability with .then()/.catch() and combinators like Promise.all, and how async/await lets asynchronous code read almost like synchronous code while still never blocking the browser's main thread. It also covers the Fetch API in depth, including the easy-to-miss detail that fetch does not reject on HTTP error statuses, and closes with patterns for running requests in parallel, cancelling stale requests, and structuring error handling around network calls.",
      sections: [
        {
          heading: "From Callbacks to Promises",
          body: "The original async pattern in JavaScript was passing a callback function to be invoked later, when an operation completed. Nesting multiple dependent async operations this way produces deeply indented 'callback hell' that's hard to read and even harder to handle errors in consistently (each callback needs its own error-handling branch). A Promise represents a value that will exist in the future, in one of three states — pending, fulfilled, or rejected — and lets you chain .then() for success and .catch() for failure in a flat, readable sequence instead of nested callbacks.",
          code: {
            language: "javascript",
            code:
              "// Promise chain — flat, each step handles the previous step's result\nfetchUser(id)\n  .then((user) => fetchOrders(user.id))\n  .then((orders) => renderOrders(orders))\n  .catch((err) => console.error('Failed to load orders:', err));",
          },
        },
        {
          heading: "async/await",
          body: "async/await is syntax sugar over Promises that lets asynchronous code read top-to-bottom like synchronous code. A function marked async always returns a Promise (even if you write a plain return value inside it, it gets wrapped). Inside an async function, await pauses execution of that function — and only that function — until the awaited Promise settles, without blocking the browser's main thread or any other code running elsewhere. Error handling reverts to familiar try/catch around the awaited calls, which most developers find more natural than chained .catch() calls once multiple steps are involved.",
          code: {
            language: "javascript",
            code:
              "async function loadUserOrders(id) {\n  try {\n    const user = await fetchUser(id);\n    const orders = await fetchOrders(user.id);\n    renderOrders(orders);\n  } catch (err) {\n    console.error('Failed to load orders:', err);\n  }\n}",
          },
        },
        {
          heading: "The Fetch API and the response.ok Trap",
          body: "fetch(url) returns a Promise that resolves with a Response object as soon as the server responds with any status code at all — fetch only rejects on network-level failures (DNS failure, no connection, CORS block), never because the server returned a 404 or 500. This means checking response.ok (true for status codes 200-299) or response.status explicitly is mandatory; skipping it means a 404 page's error HTML gets silently parsed as if it were successful data. Parsing the body is itself async — response.json(), response.text(), and response.blob() all return Promises that must be awaited.",
          code: {
            language: "javascript",
            code:
              "async function getUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  return response.json();\n}",
          },
        },
        {
          heading: "Running Async Operations in Parallel",
          body: "Awaiting independent requests one after another wastes time waiting sequentially for operations that don't depend on each other. Promise.all([...]) runs multiple Promises concurrently and resolves once all of them succeed, rejecting immediately if any one of them rejects. Promise.allSettled([...]) is the safer choice when you want results from every operation regardless of individual failures — it never rejects, and instead returns an array of {status, value|reason} objects for each input Promise.",
          code: {
            language: "javascript",
            code:
              "// Sequential — slower, waits for each one before starting the next\nconst user = await fetchUser(id);\nconst posts = await fetchPosts(id);\n\n// Parallel — both requests start immediately\nconst [user2, posts2] = await Promise.all([fetchUser(id), fetchPosts(id)]);\n\n// Parallel, tolerant of individual failures\nconst results = await Promise.allSettled([fetchUser(id), fetchPosts(id)]);\nresults.forEach((r) => {\n  if (r.status === 'fulfilled') console.log(r.value);\n  else console.warn('One request failed:', r.reason);\n});",
          },
        },
        {
          heading: "Cancelling Requests with AbortController",
          body: "A fetch left running when the component or context that requested it no longer cares (a user typed a new search query, or navigated away) wastes bandwidth and can cause a 'stale response overwrites fresh state' bug if it resolves after a newer request. AbortController provides a signal that can be passed to fetch and triggered later to cancel the in-flight request, causing the fetch Promise to reject with an AbortError that should typically be ignored (it's an intentional cancellation, not a real failure).",
          code: {
            language: "javascript",
            code:
              "let controller;\n\nasync function search(query) {\n  controller?.abort(); // cancel any previous in-flight search\n  controller = new AbortController();\n  try {\n    const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal });\n    return res.json();\n  } catch (err) {\n    if (err.name === 'AbortError') return; // expected — a newer search superseded this one\n    throw err;\n  }\n}",
          },
        },
        {
          heading: "The Async Pitfalls of Array Iteration Methods",
          body: "forEach does not wait for the callback's returned Promise, and does not support await meaningfully inside it — passing an async function to forEach fires off all the async calls without any guarantee about order or completion before forEach itself returns. map has the same issue but at least gives you back an array of Promises, which Promise.all can then be awaited on. When you genuinely need sequential async processing (one item must finish before the next starts), a plain for...of loop with await inside it is the clearest, most reliable choice.",
          code: {
            language: "javascript",
            code:
              "// Broken: forEach doesn't wait — all requests fire, unordered, and errors are silently swallowed\nitems.forEach(async (item) => { await processItem(item); });\n\n// Correct: sequential, ordered, errors propagate normally\nfor (const item of items) {\n  await processItem(item);\n}\n\n// Correct: parallel, when order doesn't matter\nawait Promise.all(items.map((item) => processItem(item)));",
          },
        },
        {
          heading: "Unhandled Rejections and Global Error Handling",
          body: "A rejected Promise with no .catch() (or no surrounding try/catch if awaited) produces an unhandled promise rejection — logged as a console warning/error in browsers, and in Node.js capable of crashing the process depending on configuration. Listening for the global unhandledrejection event on window is a useful last line of defense for logging/monitoring in production, but it should never be relied on as the primary error-handling strategy; every async call site should have an explicit, deliberate error-handling path.",
        },
      ],
      commonPitfalls: [
        "Forgetting that fetch only rejects on network failure, not on HTTP error statuses — always check response.ok before parsing the body.",
        "Passing an async function to Array.prototype.forEach and assuming it waits for each call to finish before moving to the next.",
        "Awaiting independent requests sequentially instead of using Promise.all, needlessly slowing down page load.",
        "Forgetting the await keyword and ending up with a Promise object instead of the resolved value, then trying to use it as if it were the data.",
        "Not handling AbortError separately from real errors, causing a canceled, intentional request to be logged/treated as a failure.",
        "Leaving stale in-flight requests uncancelled during rapid user input (search-as-you-type), letting an old response overwrite a newer one.",
        "Not wrapping await calls in try/catch, leaving unhandled promise rejections that silently fail in production.",
      ],
      keyTakeaways: [
        "async/await is syntax over Promises, not a different concurrency model — a function marked async still returns a Promise.",
        "await pauses only the enclosing async function, never the browser's main thread.",
        "fetch() resolving successfully only means the network request completed — response.ok must be checked separately for HTTP-level success.",
        "Promise.all for concurrent success-required operations; Promise.allSettled when partial failure is acceptable.",
        "AbortController is the standard mechanism for cancelling stale in-flight requests, essential for search-as-you-type and rapid navigation.",
      ],
      links: [
        { label: "MDN — Using the Fetch API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" },
        { label: "MDN — Using Promises", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises" },
        { label: "javascript.info — Async/await", url: "https://javascript.info/async-await" },
      ],
    },
    {
      moduleTitle: "JavaScript",
      subModuleTitle: "ES6+ features",
      overview:
        "ECMAScript 2015 (ES6) and the yearly releases since introduced syntax that fundamentally changed how idiomatic JavaScript is written: destructuring, arrow functions, template literals, spread/rest, default parameters, real classes, native modules, and — more recently — optional chaining and nullish coalescing. None of these are optional extras in a modern codebase; they're the baseline syntax every React/Vue/Angular codebase and every modern job assumes you already read fluently. This submodule covers each feature with practical, realistic examples rather than toy syntax demos, and pays particular attention to the subtle gotchas — shallow vs. deep copying with spread, default vs. named exports, and when ?? is correct where || silently isn't.",
      sections: [
        {
          heading: "Destructuring: Arrays and Objects",
          body: "Destructuring pulls values out of arrays or objects directly into named variables in a single expression, replacing repetitive const x = obj.x; const y = obj.y; boilerplate. Object destructuring matches by property name (order doesn't matter) and supports renaming and default values; array destructuring matches by position (order matters) and is how multiple return values are typically 'unpacked' from a function or a Promise.all result. Destructuring also works directly in function parameters, which is the standard way React components accept props.",
          code: {
            language: "javascript",
            code:
              "const user = { name: 'Aisha', role: 'admin', email: 'aisha@example.com' };\nconst { name, role: userRole, phone = 'N/A' } = user;\n// name = 'Aisha', userRole = 'admin', phone = 'N/A' (default, since not present)\n\nconst [first, second, ...rest] = [10, 20, 30, 40];\n// first = 10, second = 20, rest = [30, 40]\n\nfunction UserCard({ name, email }) { // destructuring directly in the parameter list\n  return `${name} <${email}>`;\n}",
          },
        },
        {
          heading: "Template Literals",
          body: "Template literals (backtick strings) support ${} interpolation of any expression directly inside the string, and natively support multi-line strings without \\n concatenation. Tagged templates (an advanced form where a function processes the literal's pieces) power libraries like styled-components, but the everyday use — clean interpolation replacing '...' + var + '...' concatenation — is what you'll reach for constantly.",
          code: {
            language: "javascript",
            code:
              "const name = 'Rohan';\nconst itemCount = 3;\nconst message = `Hi ${name}, you have ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart.`;",
          },
        },
        {
          heading: "Spread and Rest Operators",
          body: "The ... syntax means two different things depending on context. As spread, it expands an array or object's elements/properties into a new array/object literal or into function arguments — the standard way to copy or merge arrays/objects immutably, and to build a new state object in React without mutating the original. As rest, appearing in a destructuring pattern or function parameter list, it collects the remaining elements/arguments into a single array. Crucially, spread performs a shallow copy — nested objects/arrays inside the spread result still point to the same nested references as the original, so mutating a nested property affects both copies.",
          code: {
            language: "javascript",
            code:
              "const original = { name: 'Aisha', address: { city: 'Bangalore' } };\nconst copy = { ...original, name: 'Meera' }; // shallow copy, name overridden\n\ncopy.address.city = 'Pune';\nconsole.log(original.address.city); // 'Pune' — nested object was shared, not deep-copied!\n\nfunction sum(...numbers) { // rest — collects all arguments into an array\n  return numbers.reduce((total, n) => total + n, 0);\n}\nsum(1, 2, 3); // 6",
          },
        },
        {
          heading: "Default Parameters",
          body: "Function parameters can declare a default value used only when the caller passes undefined for that argument (explicitly passing null does not trigger the default). Defaults are evaluated left-to-right at call time and can reference earlier parameters, which is useful for parameters that depend on each other.",
          code: {
            language: "javascript",
            code:
              "function createUser(name, role = 'member', id = crypto.randomUUID()) {\n  return { id, name, role };\n}\ncreateUser('Aisha'); // role defaults to 'member', id auto-generated",
          },
        },
        {
          heading: "ES Modules: import/export",
          body: "Native JavaScript modules replace older patterns (global script tags, IIFEs, CommonJS require in browser code) with explicit, statically analyzable dependencies declared via import/export. A module can have any number of named exports (export const x = ...) imported with matching names in {}, and at most one default export (export default ...) imported under any chosen name without braces. Because imports/exports are static (resolved before code runs, not computed at runtime), bundlers can perform tree-shaking — eliminating exported code that's never actually imported anywhere, which shrinks the final bundle sent to the browser.",
          code: {
            language: "javascript",
            code:
              "// mathUtils.js\nexport const PI = 3.14159;\nexport function double(n) { return n * 2; }\nexport default function square(n) { return n * n; }\n\n// app.js\nimport square, { PI, double } from './mathUtils.js';",
          },
        },
        {
          heading: "Classes and Inheritance",
          body: "ES6 classes are primarily syntax over JavaScript's existing prototype-based inheritance, not a fundamentally new object model. class declares a constructor and methods (which live on the prototype, shared across instances, unlike arrow-function class fields which are per-instance); extends and super() set up inheritance and let a subclass call its parent's constructor/methods. Modern class syntax also supports true private fields (prefixed with #), inaccessible from outside the class, unlike the older convention of prefixing a property with an underscore, which was private by convention only.",
          code: {
            language: "javascript",
            code:
              "class Shape {\n  #id = crypto.randomUUID(); // truly private — inaccessible outside the class\n  constructor(name) { this.name = name; }\n  describe() { return `${this.name} (${this.#id})`; }\n}\n\nclass Circle extends Shape {\n  constructor(radius) {\n    super('Circle'); // must call super() before using `this` in a subclass constructor\n    this.radius = radius;\n  }\n  area() { return Math.PI * this.radius ** 2; }\n}",
          },
        },
        {
          heading: "Optional Chaining and Nullish Coalescing",
          body: "Optional chaining (?.) short-circuits to undefined instead of throwing when accessing a property on null/undefined, replacing verbose manual guards like obj && obj.a && obj.a.b. It works on property access, method calls (obj.method?.()), and array indexing (arr?.[0]). Nullish coalescing (??) provides a fallback value only when the left side is null or undefined — critically different from ||, which falls back on any falsy value, including 0, '', and false, all of which are often legitimate, intentional values that shouldn't be silently replaced.",
          code: {
            language: "javascript",
            code:
              "const user = { profile: { settings: null } };\nconst theme = user.profile?.settings?.theme ?? 'light'; // undefined chain -> fallback 'light'\n\nfunction getDiscount(percent) {\n  // BUG with ||: a real, valid 0% discount would incorrectly become the default\n  const withOr = percent || 10;\n  // Correct with ??: only null/undefined trigger the default, 0 is respected\n  const withNullish = percent ?? 10;\n  return withNullish;\n}\ngetDiscount(0); // 0, correctly",
          },
        },
      ],
      commonPitfalls: [
        "Assuming spread ({...obj}) performs a deep copy — it's shallow, so nested objects/arrays remain shared references.",
        "Using || for a default value on a parameter where 0, '', or false are valid inputs, incorrectly overriding them — use ?? instead.",
        "Destructuring a property that doesn't exist yet on a possibly-null object without optional chaining, throwing a TypeError.",
        "Mixing up default and named exports, causing 'X is not a function' or unexpected undefined imports.",
        "Forgetting that rest parameters must be the last parameter in a function's parameter list.",
        "Using arrow functions as object/class methods when you need `this` to refer to the instance — arrow functions capture the enclosing lexical `this` instead.",
        "Forgetting to call super() before using `this` in a subclass constructor, which throws a ReferenceError.",
      ],
      keyTakeaways: [
        "Destructuring with defaults and renaming eliminates most manual property-access boilerplate — and is how React components typically read props.",
        "Spread (...) is shallow — nested structures still share references after a spread copy.",
        "?? (nullish coalescing) is the correct default-value operator whenever 0, '', or false are legitimate values; || is not.",
        "ES module imports/exports are statically analyzable, which is what enables bundlers to tree-shake unused code out of the final bundle.",
        "Class fields with # are genuinely private at the language level, unlike the older underscore-prefix convention.",
      ],
      links: [
        { label: "MDN — Destructuring assignment", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment" },
        { label: "MDN — Optional chaining (?.)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining" },
        { label: "javascript.info — Modules", url: "https://javascript.info/modules" },
      ],
    },

    // ─────────────────────── React / Angular / Vue ───────────────────────
    {
      moduleTitle: "React / Angular / Vue",
      subModuleTitle: "Component-driven architecture",
      overview:
        "Every modern frontend framework organizes an application as a tree of components — small, focused, reusable pieces that each own a slice of UI and, ideally, a single responsibility. React expresses this with functional components and JSX, Angular with TypeScript classes and separate template files, and Vue with single-file components combining template/script/style — but the underlying discipline is identical across all three: break the interface into pieces small enough to reason about individually, pass data down through explicit inputs, and compose small components into larger ones. This submodule focuses primarily on React syntax (since it's the most common target in interviews and job postings) while explicitly calling out the equivalent concept in Angular and Vue at each step, so the architectural thinking transfers regardless of which framework a given job uses.",
      sections: [
        {
          heading: "What a Component Actually Is",
          body: "A component is a self-contained, reusable unit that takes inputs and produces UI — conceptually similar to a function that takes arguments and returns a value, except the return value is a description of DOM structure rather than a plain value. In React, a functional component is literally a JavaScript function that returns JSX and accepts a single props object as its argument. Angular components are classes decorated with @Component, paired with an HTML template. Vue single-file components (.vue files) bundle a <template>, a <script>, and optionally scoped <style> together in one file. All three compile down to instructions for creating and updating real DOM nodes.",
          code: {
            language: "jsx",
            code:
              "function UserCard({ name, role, avatarUrl }) {\n  return (\n    <div className=\"user-card\">\n      <img src={avatarUrl} alt={`${name}'s avatar`} />\n      <h3>{name}</h3>\n      <p>{role}</p>\n    </div>\n  );\n}\n\n// Usage — data flows in through props, one-directionally\n<UserCard name=\"Aisha\" role=\"Admin\" avatarUrl=\"/avatars/aisha.png\" />",
          },
        },
        {
          heading: "Props: The One-Way Data Contract",
          body: "Props are how data flows into a component from its parent — read-only from the receiving component's perspective (a component must never mutate its own props directly). This one-directional flow (data down, events up) is what keeps a component tree predictable: to know why a piece of UI looks a certain way, you only need to look at what was passed in, not search the whole app for anything that might have changed it. When a child needs to communicate back up to a parent (a button click, a form submission), the parent passes a callback function down as a prop, and the child calls it — the data itself still only ever flows downward.",
          bullets: [
            "props.children (React) / <ng-content> (Angular) / <slot> (Vue) all solve the same problem: letting a parent inject arbitrary content into a child's layout.",
            "Never do props.name = 'X' inside a component — treat the props object as read-only.",
            "TypeScript prop types (or PropTypes in plain React) document exactly what a component expects and catch misuse at compile time.",
          ],
        },
        {
          heading: "Composition Over Configuration",
          body: "A common anti-pattern is building one large, configurable component with a growing list of boolean props (showHeader, showFooter, isCompact, hasIcon...) to handle every possible variation. Composition — building small components and combining them via children/slots — usually scales better: instead of a Card with ten boolean flags, build a plain Card that renders whatever children it's given, plus optional CardHeader/CardFooter sub-components a consumer assembles as needed. This mirrors how HTML itself works (a <select> is composed of <option> children, not configured with a giant options prop) and tends to produce more flexible, more testable components.",
          code: {
            language: "jsx",
            code:
              "// Configuration-heavy (harder to extend indefinitely)\n<Card showHeader title=\"Stats\" showFooter footerText=\"Updated today\" compact />\n\n// Composition-based (flexible, each piece independently reusable)\n<Card>\n  <Card.Header>Stats</Card.Header>\n  <Card.Body>...</Card.Body>\n  <Card.Footer>Updated today</Card.Footer>\n</Card>",
          },
        },
        {
          heading: "Lists, Keys, and Reconciliation",
          body: "Rendering a list of components from an array (via .map() in React) requires a key prop on each item — a stable, unique identifier the framework uses to track which DOM node corresponds to which data item across re-renders. Using the array index as a key works only if the list never reorders, is never filtered, and never has items inserted/removed from the middle — otherwise React can match the wrong DOM node to the wrong data, causing stale form input values or broken animations tied to the wrong item. A stable, data-derived id (a database primary key, a UUID) is the correct key whenever the list can change order or length.",
          code: {
            language: "jsx",
            code:
              "function TodoList({ todos }) {\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li key={todo.id}>{todo.text}</li> // key = todo.id, NOT the array index\n      ))}\n    </ul>\n  );\n}",
          },
        },
        {
          heading: "Container/Presentational Separation",
          body: "A useful, if not absolute, pattern for keeping components focused is separating 'container' components (concerned with fetching data, managing state, business logic) from 'presentational' components (concerned only with how things look, receiving all their data via props with no knowledge of where it came from). A presentational UserList that just renders a list of user objects it's handed can be reused anywhere — a dashboard, a search results page, a modal — regardless of how or where those users were fetched, while the container component handling the actual data-fetching logic stays isolated and swappable.",
        },
        {
          heading: "Component Architecture in Angular and Vue",
          body: "Angular components declare their inputs with @Input() decorators and outputs (events emitted upward) with @Output() combined with EventEmitter, structurally mirroring React's props-down/callback-up pattern but with more built-in ceremony (decorators, explicit dependency injection). Vue's single-file components declare props via defineProps() and emit events upward via defineEmits() in the Composition API — again the same underlying contract, just different syntax. Recognizing this shared shape (declared inputs, emitted outputs, one-directional data flow, composition of small pieces) is what makes moving between these frameworks a matter of learning new syntax rather than relearning frontend architecture from scratch.",
        },
        {
          heading: "Organizing Components in a Real Project",
          body: "As a component tree grows, folder structure starts to matter. A common, scalable convention groups files by feature/domain (a /features/checkout folder containing every component, hook, and style specific to checkout) rather than by file type (one giant /components folder, one giant /hooks folder) — feature-based organization keeps related code physically close together and makes it obvious what can be deleted if a feature is removed. Shared, generic UI primitives (Button, Input, Modal) that have no feature-specific logic typically live in a separate shared/ui directory used across features.",
        },
      ],
      commonPitfalls: [
        "Mutating props directly inside a child component instead of treating them as read-only and lifting change requests up via a callback prop.",
        "Using the array index as a list key when the list can reorder, filter, or have items inserted/removed from the middle.",
        "Building a single giant component with a dozen boolean configuration props instead of composing smaller, focused pieces.",
        "Mixing data-fetching/business logic directly into deeply nested presentational components, making them impossible to reuse elsewhere.",
        "Prop-drilling data through five layers of components that don't use it themselves, just to reach one deeply nested child.",
        "Organizing an entire large app in one flat /components folder with no feature-based grouping, making it hard to find related files.",
      ],
      keyTakeaways: [
        "Components are the unit of reuse in every modern framework — props/inputs flow down, events/callbacks flow up.",
        "Treat props as strictly read-only from the receiving component's side, always.",
        "Prefer composition (children/slots) over an ever-growing list of configuration props for flexible, reusable components.",
        "List keys must be stable and data-derived, not the array index, whenever the list's order or length can change.",
        "The React/Angular/Vue syntaxes differ, but the props-down/events-up, compose-small-pieces architecture is the same discipline underneath all three.",
      ],
      links: [
        { label: "React — Passing Props to a Component", url: "https://react.dev/learn/passing-props-to-a-component" },
        { label: "React — Rendering Lists", url: "https://react.dev/learn/rendering-lists" },
        { label: "Vue.js — Component Basics", url: "https://vuejs.org/guide/essentials/component-basics.html" },
      ],
    },
    {
      moduleTitle: "React / Angular / Vue",
      subModuleTitle: "Routing",
      overview:
        "Single-page applications load a single HTML document and then use JavaScript to swap what's displayed as the user navigates, rather than requesting a fresh page from the server on every link click — routing is the layer that makes this feel like ordinary multi-page browsing while staying entirely client-side. This submodule covers React Router (the dominant routing library in the React ecosystem) in depth: declaring routes, matching URL parameters, nested routes with shared layouts via Outlet, programmatic navigation, and protecting routes behind authentication checks — with the equivalent concepts in Angular's built-in Router and Vue Router called out for comparison. It also covers route-based code splitting, which is one of the highest-leverage, easiest performance wins available in any client-rendered SPA.",
      sections: [
        {
          heading: "Why Client-Side Routing Exists",
          body: "Traditional multi-page sites request a brand-new HTML document from the server on every navigation, which resets all JavaScript state and re-downloads shared assets. A client-side router instead intercepts navigation, uses the browser's History API (pushState/replaceState) to update the URL without a full page reload, and swaps the rendered component tree to match — all state that should persist (a global cart, an auth session already in memory) survives navigation, and only the data actually needed for the new view has to be fetched.",
        },
        {
          heading: "Basic Setup with React Router",
          body: "React Router wraps the app in a BrowserRouter (which hooks into the History API), then declares a Routes container holding individual Route elements, each mapping a URL path to a component to render. Routes are matched by path, and the first Route whose path matches the current URL renders its element — React Router v6+ matches routes more predictably than earlier versions by always picking the best (most specific) match rather than the first one written in source order.",
          code: {
            language: "jsx",
            code:
              "import { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/courses\" element={<CourseList />} />\n        <Route path=\"/courses/:courseId\" element={<CourseDetail />} />\n        <Route path=\"*\" element={<NotFound />} /> {/* catch-all 404 */}\n      </Routes>\n    </BrowserRouter>\n  );\n}",
          },
        },
        {
          heading: "Route Parameters and Nested Routes",
          body: "A path segment prefixed with a colon (:courseId) captures that portion of the URL as a route parameter, read inside the matched component via the useParams() hook — note that all route params arrive as strings, even ones that look numeric, so parsing (Number(id)) is often needed before using them. Nested routes let a parent route render shared layout (a sidebar, a tab bar) once, with an <Outlet /> placeholder marking where the matched child route's content should render — this avoids re-rendering shared chrome on every navigation within that section.",
          code: {
            language: "jsx",
            code:
              "function CourseDetail() {\n  const { courseId } = useParams(); // always a string, e.g. \"42\"\n  const [course, setCourse] = useState(null);\n\n  useEffect(() => {\n    fetchCourse(courseId).then(setCourse);\n  }, [courseId]); // re-fetch whenever the route param changes\n\n  return course ? <h1>{course.title}</h1> : <p>Loading...</p>;\n}\n\n// Nested routes sharing a layout via <Outlet />\n<Route path=\"/courses/:courseId\" element={<CourseLayout />}>\n  <Route index element={<CourseOverview />} />\n  <Route path=\"lessons\" element={<CourseLessons />} />\n</Route>",
          },
        },
        {
          heading: "Programmatic Navigation and Links",
          body: "Regular navigation should always use the <Link to=\"/path\"> component instead of a plain <a href=\"/path\">, because Link intercepts the click and performs client-side navigation through the router, while a plain <a> tag triggers a full page reload that defeats the entire purpose of an SPA. For navigation that needs to happen as a result of logic rather than a direct click (redirecting after a successful form submission, for example), the useNavigate() hook returns a function that can push a new route programmatically.",
          code: {
            language: "jsx",
            code:
              "import { Link, useNavigate } from 'react-router-dom';\n\nfunction LoginForm() {\n  const navigate = useNavigate();\n\n  async function handleSubmit(credentials) {\n    await login(credentials);\n    navigate('/dashboard'); // programmatic redirect after successful login\n  }\n\n  return (\n    <>\n      <form onSubmit={handleSubmit}>{/* ... */}</form>\n      <Link to=\"/signup\">Need an account? Sign up</Link>\n    </>\n  );\n}",
          },
        },
        {
          heading: "Protected Routes",
          body: "Restricting a route to authenticated users is typically implemented as a wrapper component that checks auth state and either renders its children or redirects to a login page using the Navigate component. This pattern composes cleanly with nested routes — wrap a whole subtree of protected routes in a single RequireAuth layout route instead of repeating the check inside every individual protected page.",
          code: {
            language: "jsx",
            code:
              "function RequireAuth({ children }) {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    // Preserve where the user was headed so we can send them back after login\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n  return children;\n}\n\n<Route path=\"/dashboard\" element={<RequireAuth><Dashboard /></RequireAuth>} />",
          },
        },
        {
          heading: "Route-Based Code Splitting",
          body: "Shipping the JavaScript for every single route in one bundle means users pay the download cost for pages they may never visit. React's lazy() combined with Suspense lets a route's component code be fetched only when that route is actually navigated to, splitting the bundle automatically along route boundaries — one of the highest-value, lowest-effort performance techniques available in any React SPA of meaningful size.",
          code: {
            language: "jsx",
            code:
              "import { lazy, Suspense } from 'react';\n\nconst AdminPanel = lazy(() => import('./AdminPanel'));\n\n<Route\n  path=\"/admin\"\n  element={\n    <Suspense fallback={<p>Loading...</p>}>\n      <AdminPanel />\n    </Suspense>\n  }\n/>",
          },
        },
        {
          heading: "Routing in Angular and Vue",
          body: "Angular's built-in RouterModule configures routes as an array of {path, component} objects (or, in modern Angular, functional route configs with loadComponent for lazy loading), and templates use <router-outlet> as the equivalent of React Router's <Outlet />, with routerLink replacing href for internal navigation. Vue Router configures routes similarly as an array of {path, component} objects passed to createRouter(), uses <router-view> as its outlet, and <router-link to=\"...\"> for navigation. All three frameworks converge on the identical mental model — a route table mapping paths to components, an outlet marking where matched content renders, and a special link component that avoids full page reloads.",
        },
      ],
      commonPitfalls: [
        "Using a plain <a href=\"/path\"> instead of <Link>/<router-link>, triggering an unwanted full page reload.",
        "Forgetting that route params are always strings, then comparing/using them as numbers without converting first.",
        "Not including a catch-all wildcard route, leaving users with a blank page instead of a proper 404 view on an unmatched URL.",
        "Re-implementing an auth check inside every individual protected page instead of a single reusable RequireAuth wrapper route.",
        "Shipping every route's code in one bundle instead of lazy-loading route components, inflating the initial page load.",
        "Forgetting the dependency array on a data-fetching useEffect keyed on a route param, so navigating between two similar routes doesn't refetch.",
      ],
      keyTakeaways: [
        "Client-side routing swaps rendered components via the History API instead of requesting a fresh document — the URL changes, but the page never fully reloads.",
        "Always navigate internally with the router's link component, never a plain <a href>, to avoid a full page reload.",
        "Route params always arrive as strings, regardless of what they look like.",
        "Nested routes with an Outlet let shared layout render once instead of re-rendering on every navigation within a section.",
        "Lazy-loading route components via code splitting is one of the easiest, highest-impact performance wins in any sizeable SPA.",
      ],
      links: [
        { label: "React Router — Official Documentation", url: "https://reactrouter.com/" },
        { label: "Vue Router — Official Documentation", url: "https://router.vuejs.org/" },
        { label: "Angular — Routing & Navigation", url: "https://angular.dev/guide/routing" },
      ],
    },
    {
      moduleTitle: "React / Angular / Vue",
      subModuleTitle: "State management",
      overview:
        "This submodule focuses specifically on React's state management toolkit, from the simplest case (a single component's own useState) through sharing state across a subtree with Context, up to reaching for a dedicated library like Redux (or its modern, far less boilerplate-heavy successor, Redux Toolkit) once an application's shared state grows complex enough to need more structure. The core skill isn't memorizing any one API — it's judgment: recognizing when state genuinely needs to live in a component versus be lifted to a parent, versus be shared via Context, versus warrant a dedicated state library, and understanding the real trade-offs (re-render behavior, boilerplate, debuggability) each option carries.",
      sections: [
        {
          heading: "useState: Local Component State",
          body: "useState(initialValue) returns a [value, setValue] pair — reading the current value and a setter that schedules a re-render with the new value. React batches multiple setState calls that happen within the same event handler into a single re-render for performance, and state updates are asynchronous relative to the code that triggered them — reading the state variable immediately after calling its setter still returns the old value, since the update hasn't applied yet. When a new state value depends on the previous one, passing a function to the setter (setCount(prev => prev + 1)) guarantees you're operating on the latest value, which matters especially inside closures like event handlers or timers.",
          code: {
            language: "jsx",
            code:
              "function Counter() {\n  const [count, setCount] = useState(0);\n\n  function handleTripleIncrement() {\n    // WRONG: all three reference the same stale `count` from this render\n    // setCount(count + 1); setCount(count + 1); setCount(count + 1);\n\n    // RIGHT: functional updates always see the latest value\n    setCount((prev) => prev + 1);\n    setCount((prev) => prev + 1);\n    setCount((prev) => prev + 1); // count increases by 3\n  }\n\n  return <button onClick={handleTripleIncrement}>{count}</button>;\n}",
          },
        },
        {
          heading: "Lifting State Up",
          body: "When two sibling components need to share or stay in sync on the same piece of state, the state should live in their closest common ancestor, which then passes the value down as props to both and passes down a callback that lets either child request a change. This is 'lifting state up' — React has no direct sibling-to-sibling communication, so a shared parent acting as the single source of truth is the standard solution before reaching for Context or an external store.",
          code: {
            language: "jsx",
            code:
              "function FilterableList() {\n  const [searchTerm, setSearchTerm] = useState('');\n  // Both siblings share `searchTerm`, lifted to their common parent\n  return (\n    <>\n      <SearchBox value={searchTerm} onChange={setSearchTerm} />\n      <ResultsList searchTerm={searchTerm} />\n    </>\n  );\n}",
          },
        },
        {
          heading: "Context API: Avoiding Deep Prop Drilling",
          body: "Prop drilling — passing a prop down through several layers of components that don't use it themselves, just to reach a deeply nested consumer — becomes unwieldy past a couple of levels. createContext() plus a Provider lets any descendant read a value directly via useContext(), without every intermediate component needing to know or forward it. Context is best suited to genuinely cross-cutting values that many distant components need (current theme, authenticated user, locale) — it is not a general-purpose replacement for all shared state, since every consumer of a context re-renders whenever the context's value changes, even if the consumer only cares about part of that value.",
          code: {
            language: "jsx",
            code:
              "const ThemeContext = createContext('light');\n\nfunction App() {\n  const [theme, setTheme] = useState('light');\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      <Dashboard /> {/* any descendant, at any depth, can now read the theme */}\n    </ThemeContext.Provider>\n  );\n}\n\nfunction ThemeToggleButton() {\n  const { theme, setTheme } = useContext(ThemeContext); // no prop drilling needed\n  return (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Current: {theme}\n    </button>\n  );\n}",
          },
        },
        {
          heading: "useReducer for Complex Local State",
          body: "When a single component's state involves multiple sub-values that change together in response to distinct 'actions' (e.g. a form with loading/error/data states, or a shopping cart with add/remove/clear operations), useReducer often produces clearer code than several separate useState calls updated ad hoc across many handlers. A reducer is a pure function (state, action) => newState, and the component dispatches plain action objects describing what happened rather than directly computing the next state inline in each handler — the same pattern Redux is built entirely around, just scoped to one component.",
          code: {
            language: "jsx",
            code:
              "function cartReducer(state, action) {\n  switch (action.type) {\n    case 'add': return [...state, action.item];\n    case 'remove': return state.filter((i) => i.id !== action.id);\n    case 'clear': return [];\n    default: return state;\n  }\n}\n\nfunction Cart() {\n  const [items, dispatch] = useReducer(cartReducer, []);\n  return (\n    <button onClick={() => dispatch({ type: 'add', item: { id: 1, name: 'Widget' } })}>\n      Add to cart ({items.length})\n    </button>\n  );\n}",
          },
        },
        {
          heading: "Redux Basics: Store, Actions, Reducers",
          body: "Redux applies the same reducer pattern globally, at the whole-application level: a single store holds the entire app's shared state, components dispatch plain action objects describing intent ({ type: 'cart/add', payload }), and one root reducer computes the next state from the current state and the dispatched action, always immutably (never mutating the existing state object directly). Modern Redux code is almost always written with Redux Toolkit, which drastically cuts the boilerplate of hand-written Redux by generating action creators and reducers together via createSlice, and by allowing 'mutating' syntax inside reducers that's safely converted to immutable updates under the hood (via the Immer library).",
          code: {
            language: "javascript",
            code:
              "import { createSlice, configureStore } from '@reduxjs/toolkit';\n\nconst cartSlice = createSlice({\n  name: 'cart',\n  initialState: { items: [] },\n  reducers: {\n    addItem: (state, action) => {\n      state.items.push(action.payload); // looks mutating, Immer makes it safe\n    },\n    clearCart: (state) => { state.items = []; },\n  },\n});\n\nexport const { addItem, clearCart } = cartSlice.actions;\nexport const store = configureStore({ reducer: { cart: cartSlice.reducer } });",
          },
        },
        {
          heading: "Choosing Local State, Context, or a Store",
          body: "A practical decision path: default to useState/useReducer scoped to the component that needs it; lift state to the nearest shared ancestor only once a sibling genuinely needs it too; reach for Context once state needs to be read by many components at very different depths and re-render cost of the whole subtree is acceptable; reach for Redux (or a lighter alternative like Zustand) once an application has enough interconnected shared state that tracking who-changes-what informally becomes error-prone, or once you need Redux DevTools' time-travel debugging and middleware ecosystem. Most real applications end up using all three at different points, not just one exclusively.",
        },
        {
          heading: "Avoiding Unnecessary Re-Renders from Context",
          body: "Because every consumer of a Context re-renders whenever its value changes, a Context whose value is a large object holding many unrelated pieces of state causes far more re-rendering than necessary — a component that only reads one field still re-renders when any other field changes. Splitting one large Context into several smaller, more targeted Contexts (one for theme, one for auth, one for cart) confines re-renders to only the consumers that actually care about that particular slice of state, which matters increasingly as an app's component tree grows.",
        },
      ],
      commonPitfalls: [
        "Reading a state variable immediately after calling its setter and expecting the updated value — state updates are asynchronous relative to that line of code.",
        "Calling a setter multiple times based on the current (stale) value instead of using the functional update form (prev => ...), losing updates.",
        "Mutating a state object or array directly (state.items.push(x)) instead of creating a new reference, which prevents React from detecting the change.",
        "Putting a single giant object with many unrelated fields into one Context, causing every consumer to re-render on any change to any field.",
        "Reaching for Redux immediately for a small app's simple, localized state instead of starting with useState/useReducer.",
        "Forgetting that Context re-renders every consumer on value change, and using it for high-frequency updates (like live cursor position) where performance suffers.",
      ],
      keyTakeaways: [
        "useState's setter is asynchronous relative to surrounding code — use the functional update form when the new value depends on the previous one.",
        "Lift state to the nearest common ancestor before reaching for Context; reach for Context before reaching for a full external store.",
        "Never mutate state directly — always create a new object/array reference so React can detect the change and re-render.",
        "Redux Toolkit's createSlice removes almost all of classic Redux's boilerplate while keeping the same store/action/reducer model.",
        "Splitting a large Context into several smaller ones limits unnecessary re-renders to only the components that actually depend on each slice.",
      ],
      links: [
        { label: "React — Managing State", url: "https://react.dev/learn/managing-state" },
        { label: "React — Passing Data Deeply with Context", url: "https://react.dev/learn/passing-data-deeply-with-context" },
        { label: "Redux Toolkit — Official Documentation", url: "https://redux-toolkit.js.org/" },
      ],
    },
    {
      moduleTitle: "React / Angular / Vue",
      subModuleTitle: "Hooks & composition patterns",
      overview:
        "Hooks let function components use state, side effects, and other React features without ever writing a class, and they replaced most of the older lifecycle-method and higher-order-component/render-prop patterns with a simpler, more composable model built on plain functions. This submodule covers the rules that make hooks work correctly, the two hooks responsible for the most real-world bugs (useEffect's dependency array and cleanup function, and the memoization hooks useMemo/useCallback), how to extract and share stateful logic through custom hooks, and useRef for values that need to persist across renders without triggering one. It closes with composition patterns — how custom hooks replace the older render-props and higher-order-component techniques for sharing logic between components.",
      sections: [
        {
          heading: "The Rules of Hooks",
          body: "Hooks must be called in the exact same order on every render of a given component — which means they can never be called conditionally, inside a loop, or after an early return; they must always be called at the top level of a function component or another hook. React relies on call order (not names) to associate each useState/useEffect call with its correct stored state between renders, so calling a hook conditionally would misalign that association on renders where the condition differs, corrupting state silently. The second rule — hooks can only be called from React function components or from other custom hooks, never from plain JavaScript functions — keeps this order-dependent bookkeeping working correctly.",
          code: {
            language: "jsx",
            code:
              "// WRONG — hook called conditionally, breaks call-order consistency\nfunction Profile({ userId }) {\n  if (userId) {\n    const [user, setUser] = useState(null); // violates rules of hooks\n  }\n}\n\n// RIGHT — hook always called, condition handled inside\nfunction Profile({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    if (userId) fetchUser(userId).then(setUser);\n  }, [userId]);\n}",
          },
        },
        {
          heading: "useEffect: Dependency Arrays and Cleanup",
          body: "useEffect synchronizes a component with something outside React's rendering model — fetching data, subscribing to an event, starting a timer. Its second argument, the dependency array, tells React when to re-run the effect: omitted entirely, it runs after every render; an empty array [] means it runs once after the initial mount only; a populated array [a, b] means it re-runs whenever any listed value changes between renders. Forgetting a value that the effect actually uses in the dependency array causes the effect to close over a stale version of that value, one of the single most common React bugs. An effect that subscribes to something or starts a timer should return a cleanup function, which React calls before the effect re-runs and when the component unmounts — omitting cleanup is how event listeners and intervals silently pile up as memory/performance leaks.",
          code: {
            language: "jsx",
            code:
              "function LiveClock() {\n  const [time, setTime] = useState(new Date());\n\n  useEffect(() => {\n    const id = setInterval(() => setTime(new Date()), 1000);\n    return () => clearInterval(id); // cleanup — prevents a leaked interval on unmount\n  }, []); // empty array: subscribe once on mount, clean up once on unmount\n\n  return <p>{time.toLocaleTimeString()}</p>;\n}",
          },
        },
        {
          heading: "useMemo and useCallback: Memoization",
          body: "useMemo(fn, deps) recomputes and caches an expensive derived value only when one of its dependencies changes, instead of on every render. useCallback(fn, deps) does the same thing for a function reference itself, which matters specifically when that function is passed as a prop to a child wrapped in React.memo — without useCallback, a new function reference is created every render, defeating the memoized child's shouldn't-re-render optimization even though the function's logic never actually changed. Both are optimization tools, not correctness tools, and reaching for them by default on every value/function adds cognitive overhead and a small computation/memory cost of their own without necessarily buying a measurable performance improvement — profile first, memoize what's actually shown to be expensive.",
          code: {
            language: "jsx",
            code:
              "const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }) {\n  console.log('ExpensiveList rendered');\n  return items.map((i) => <div key={i.id} onClick={() => onSelect(i.id)}>{i.name}</div>);\n});\n\nfunction Parent({ items }) {\n  const [count, setCount] = useState(0);\n\n  // Without useCallback, a NEW function is created every Parent render,\n  // which would defeat ExpensiveList's React.memo optimization\n  const handleSelect = useCallback((id) => console.log('selected', id), []);\n\n  return (\n    <>\n      <button onClick={() => setCount((c) => c + 1)}>Unrelated: {count}</button>\n      <ExpensiveList items={items} onSelect={handleSelect} />\n    </>\n  );\n}",
          },
        },
        {
          heading: "useRef: Persisting Values Without Re-Rendering",
          body: "useRef(initialValue) returns a mutable { current: value } object that persists for the component's entire lifetime without causing a re-render when it changes — unlike state, which always triggers a re-render on update. Its two main uses are holding a direct reference to a DOM node (attached via the ref attribute on a JSX element, useful for focusing an input or measuring an element) and holding any mutable value that needs to survive across renders but should never itself cause a re-render, like a timer ID or a 'previous value' for comparison.",
          code: {
            language: "jsx",
            code:
              "function SearchInput() {\n  const inputRef = useRef(null);\n\n  useEffect(() => {\n    inputRef.current.focus(); // direct DOM access, no re-render triggered\n  }, []);\n\n  return <input ref={inputRef} type=\"text\" />;\n}",
          },
        },
        {
          heading: "Custom Hooks: Extracting Reusable Stateful Logic",
          body: "A custom hook is simply a JavaScript function whose name starts with use and that calls other hooks internally — this naming convention is how both React's tooling (the linter) and other developers recognize that the rules of hooks apply to it. Custom hooks are the modern replacement for the older higher-order-component and render-props patterns for sharing stateful logic between components: instead of wrapping a component to inject behavior, you extract the behavior into a hook and call it directly wherever it's needed, which is both easier to read (no wrapper indirection) and easier to compose (calling multiple custom hooks in one component, versus nesting multiple higher-order components).",
          code: {
            language: "jsx",
            code:
              "function useDebouncedValue(value, delayMs) {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const timeoutId = setTimeout(() => setDebounced(value), delayMs);\n    return () => clearTimeout(timeoutId); // cancel the pending update if value changes again\n  }, [value, delayMs]);\n\n  return debounced;\n}\n\nfunction SearchBox() {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebouncedValue(query, 300);\n\n  useEffect(() => {\n    if (debouncedQuery) searchApi(debouncedQuery);\n  }, [debouncedQuery]); // only fires 300ms after the user stops typing\n\n  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;\n}",
          },
        },
        {
          heading: "Composition Patterns: Compound Components",
          body: "Compound components (like the earlier Card.Header/Card.Body example) are a composition pattern where a set of components implicitly share state through Context internally, while presenting a clean, declarative JSX API to the consumer with no explicit prop wiring needed between the parts. A Tabs component might expose Tabs, Tabs.List, Tabs.Tab, and Tabs.Panel as related pieces that internally coordinate which tab is active via a shared Context, while the consumer just writes the nested JSX structure declaratively without manually tracking or passing the active index themselves.",
        },
      ],
      commonPitfalls: [
        "Calling a hook conditionally or after an early return, breaking React's call-order-based state association.",
        "Omitting a value the effect actually reads from useEffect's dependency array, causing the effect to operate on a stale closure of that value.",
        "Omitting the cleanup function from an effect that subscribes to an event, timer, or socket, leaking listeners/timers across re-renders and unmounts.",
        "Wrapping every value in useMemo and every function in useCallback preemptively, adding overhead without a measured performance benefit.",
        "Naming a function that calls hooks internally without a 'use' prefix, so ESLint's hooks plugin can't verify it follows the rules of hooks.",
        "Using useRef to store a value that should actually drive a re-render (mutating ref.current expecting the UI to update, which it won't).",
      ],
      keyTakeaways: [
        "Hooks must be called unconditionally, in the same order, on every render — no exceptions inside conditionals, loops, or early returns.",
        "An incomplete useEffect dependency array is the single most common source of stale-closure bugs in React.",
        "Effects that subscribe to something must return a cleanup function, or the subscription/timer/listener leaks across renders.",
        "useMemo/useCallback are performance tools to reach for after profiling, not defaults to apply to every value and function.",
        "A custom hook is just a function starting with 'use' that calls other hooks — the modern way to share stateful logic between components.",
      ],
      links: [
        { label: "React — Reference: Hooks", url: "https://react.dev/reference/react/hooks" },
        { label: "React — Synchronizing with Effects (useEffect)", url: "https://react.dev/learn/synchronizing-with-effects" },
        { label: "React — Reusing Logic with Custom Hooks", url: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
      ],
    },

    // ─────────────────── Responsive Design & State Management ───────────────────
    {
      moduleTitle: "Responsive Design & State Management",
      subModuleTitle: "Mobile-first design",
      overview:
        "Mobile-first design is both a CSS technique (writing base styles for small screens, then layering complexity on with min-width media queries) and a broader design philosophy: start from the most constrained environment — the smallest screen, the slowest network, the least precise input method (a finger, not a mouse cursor) — and progressively enhance from there, rather than designing for an ideal desktop experience and stripping it down afterward. This submodule builds on the CSS-focused responsive design submodule from earlier in the course by focusing on the philosophy and non-CSS considerations: touch target sizing, thumb-zone ergonomics, performance budgets appropriate for mobile networks, and the distinction between progressive enhancement and graceful degradation as two different (and not equivalent) ways of thinking about the same problem.",
      sections: [
        {
          heading: "Why Mobile-First, Not Just 'Responsive'",
          body: "Designing desktop-first and adding media queries to compress the layout down for mobile tends to produce mobile experiences that feel like an afterthought — content and features get hidden or cramped rather than genuinely redesigned for the constraint. Starting from mobile forces harder, better decisions early: what's the one thing this screen must accomplish with minimal space? What can be deferred to a secondary screen or revealed on demand? Those same disciplined decisions, once made, tend to produce a cleaner desktop experience too — desktop then becomes 'the mobile experience plus more room,' not two independently designed products that drift apart over time.",
        },
        {
          heading: "Touch Targets and the Thumb Zone",
          body: "A mouse cursor is a precise single pixel; a finger is not — Apple's Human Interface Guidelines and Google's Material Design both recommend a minimum touch target size around 44x44px (Apple) or 48x48dp (Google) to keep tap accuracy reasonable, with adequate spacing between adjacent targets to prevent mis-taps. Beyond raw size, thumb-zone ergonomics matter: on a typical one-handed phone grip, the bottom third of the screen is easiest to reach, the middle requires a stretch, and the top corners (especially the opposite corner from the holding hand) are hardest — placing primary actions (a 'submit,' a bottom navigation bar) low on the screen and secondary/destructive actions further away reduces both strain and accidental taps.",
          bullets: [
            "Minimum touch target: roughly 44x44px (iOS) / 48x48dp (Android) — smaller interactive elements need extra invisible padding, not just a smaller visual size.",
            "Space adjacent tap targets far enough apart to prevent accidental mis-taps, especially in dense UI like a toolbar.",
            "Bottom navigation bars exist specifically because the bottom of the screen is the easiest one-handed thumb reach zone on most phones.",
          ],
        },
        {
          heading: "Mobile-First CSS in Practice",
          body: "In code, mobile-first means the unqueried, default CSS describes the mobile layout, and each min-width media query only adds rules for larger contexts — you should rarely need to undo or override a mobile-first rule inside a larger breakpoint, because you never wrote desktop-specific complexity into the base styles in the first place.",
          code: {
            language: "css",
            code:
              "/* Base = mobile: single column, full-width buttons, stacked nav */\n.hero {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n}\n.cta-button { width: 100%; }\n\n/* Enhance for tablet+ */\n@media (min-width: 768px) {\n  .hero { flex-direction: row; padding: 2rem; }\n  .cta-button { width: auto; }\n}",
          },
        },
        {
          heading: "Performance as a Mobile-First Concern",
          body: "Mobile users disproportionately experience slower, less reliable networks and less powerful hardware than the desktop machine most CSS gets tested on — a mobile-first mindset treats page weight and JavaScript execution cost as first-class design constraints, not an afterthought handled during a later 'performance pass.' Practically, this means deferring non-critical JavaScript, serving appropriately sized images by default (see the responsive images submodule), and testing with the browser's network throttling set to a realistic 'Slow 4G' profile rather than assuming a fast office WiFi connection reflects real-world usage.",
        },
        {
          heading: "Progressive Enhancement vs. Graceful Degradation",
          body: "These two philosophies both aim for cross-capability compatibility but start from opposite ends. Progressive enhancement builds a functional, accessible baseline first (semantic HTML that works with no CSS or JavaScript at all, like a basic form that still submits via full page reload), then layers on enhancements (AJAX submission, animations, advanced interactivity) for capable browsers/devices — if the enhancement fails to load, the baseline still works. Graceful degradation works in the opposite direction: build the full-featured experience first, then add fallback handling for older or less capable environments. Mobile-first design pairs naturally with progressive enhancement, since starting from the most constrained case and adding capability is the same underlying discipline applied to both screen size and device/browser capability.",
        },
        {
          heading: "Content-Based Breakpoints, Not Device-Based",
          body: "Choosing breakpoints by naming specific devices ('iPhone breakpoint', 'iPad breakpoint') is fragile, since device screen sizes change every product cycle and there are now far more distinct device widths than named device categories could ever cover. The more durable approach is to resize the browser continuously and add a breakpoint exactly where the current content starts to look cramped, awkwardly spaced, or where line lengths become uncomfortably long or short for reading — the breakpoint serves the content's actual layout needs, not an assumption about which specific device is being used.",
        },
        {
          heading: "Testing on Real Devices",
          body: "Browser DevTools' responsive mode is a fast approximation but simulates touch imprecisely and can't fully replicate real device rendering quirks, GPU performance, or how the on-screen keyboard affects available viewport height when a form input is focused. Before shipping, testing on at least one real low-to-mid-range Android device (representing a large share of real-world traffic) and one real iOS device catches issues DevTools emulation reliably misses — particularly touch target accuracy, scroll performance, and how fixed-position elements behave when mobile browser chrome (the address bar) shows and hides during scroll.",
        },
      ],
      commonPitfalls: [
        "Designing desktop-first and retrofitting mobile support with max-width overrides, producing a compressed rather than genuinely redesigned mobile experience.",
        "Making touch targets smaller than roughly 44px to save visual space, causing frequent mis-taps.",
        "Placing primary actions in the hardest-to-reach corner of the screen for a one-handed grip.",
        "Ignoring real-world mobile network conditions during development, testing exclusively on a fast office WiFi connection.",
        "Choosing breakpoints named after specific devices instead of wherever the content itself starts to break down.",
        "Only testing responsiveness in browser DevTools emulation and never on real touch hardware before shipping.",
      ],
      keyTakeaways: [
        "Mobile-first is a design discipline, not just a media-query direction — start from the most constrained case and add capability outward.",
        "Touch targets need roughly 44px minimum with adequate spacing — a mouse-precision assumption baked into a design breaks on touch devices.",
        "Thumb-zone ergonomics (bottom of screen = easiest reach) should influence where primary actions are placed on mobile layouts.",
        "Progressive enhancement builds a working baseline first and layers on capability, so a failed enhancement never breaks the core experience.",
        "Breakpoints belong wherever your actual content needs them, not tied to any specific device's screen dimensions.",
      ],
      links: [
        { label: "web.dev — Responsive Design Basics", url: "https://web.dev/learn/design/" },
        { label: "web.dev — Accessible Tap Targets", url: "https://web.dev/articles/accessible-tap-targets" },
        { label: "MDN — Progressive Enhancement", url: "https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement" },
      ],
    },
    {
      moduleTitle: "Responsive Design & State Management",
      subModuleTitle: "Cross-browser testing",
      overview:
        "Browsers differ because they're built on different rendering engines — Chromium-based browsers (Chrome, Edge, Brave, Opera) use Blink, Firefox uses Gecko, and Safari uses WebKit — each implementing CSS and JavaScript specifications on its own schedule, occasionally with real bugs or gaps in support for newer features. Cross-browser testing is the practice of verifying an application actually works correctly across this real diversity rather than only the browser a developer happens to use daily. This submodule covers feature detection versus browser sniffing, the tools that make gaps in support knowable ahead of time (caniuse.com, @supports), the mechanics of polyfills and CSS prefixing, and a practical testing strategy that combines fast automated checks with periodic real-device manual verification.",
      sections: [
        {
          heading: "Why Browsers Render Differently",
          body: "Each rendering engine (Blink, Gecko, WebKit) is a separate, independently developed codebase implementing the same web standards — differences arise both from genuinely differing implementation timelines for new CSS/JS features and from legitimate spec ambiguities interpreted slightly differently. Safari, running WebKit, has historically lagged behind Chromium on some newer CSS features (though this gap has narrowed significantly in recent years), and is the only rendering engine Apple permits on iOS regardless of which 'browser app' a user has installed — meaning every browser on iPhone (Chrome, Firefox, Edge included) is actually running WebKit underneath, which makes testing on an actual iOS device functionally equivalent to testing Safari specifically.",
        },
        {
          heading: "Feature Detection vs. Browser Sniffing",
          body: "Browser sniffing — inspecting navigator.userAgent to guess which browser is running and branching logic accordingly — is fragile and actively discouraged: user agent strings are inconsistent, spoofable, and require constant maintenance as new browser versions/names appear. Feature detection checks directly whether the capability you need actually exists, which is both more reliable and self-updating as browsers evolve. In CSS, the @supports at-rule checks for property/value support directly in stylesheets; in JavaScript, checking for the existence of an API ('IntersectionObserver' in window) before using it accomplishes the same goal.",
          code: {
            language: "css",
            code:
              "/* Feature detection in CSS — only applies grid layout if the browser supports it */\n@supports (display: grid) {\n  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); }\n}\n@supports not (display: grid) {\n  .gallery { display: flex; flex-wrap: wrap; } /* fallback for ancient browsers */\n}",
          },
        },
        {
          heading: "Checking Support Before You Build: caniuse.com",
          body: "Before using any newer CSS property, JS API, or HTML element in production code, checking its current support on caniuse.com takes seconds and prevents shipping a feature that silently fails (or, worse, partially works with subtle bugs) for a meaningful share of real users. Caniuse reports support broken down by browser and version, along with known partial-support caveats and links to relevant bug trackers — it should be a standard, habitual check before adopting any feature you haven't used before, not something consulted only after a bug report comes in.",
        },
        {
          heading: "Polyfills and Autoprefixing",
          body: "A polyfill is a piece of JavaScript that implements a missing browser API using older, more widely supported primitives, letting code call the modern API as if it were natively supported everywhere. CSS vendor prefixes (-webkit-, -moz-, -ms-) were the historical mechanism for browsers to ship experimental support for a not-yet-finalized CSS feature under a prefixed name — modern projects handle this automatically with Autoprefixer (usually run as part of the build via PostCSS), which reads a project's target browser list and adds exactly the prefixes still needed, rather than developers hand-writing every prefix.",
          code: {
            language: "css",
            code:
              "/* You write plain, unprefixed CSS: */\n.box {\n  user-select: none;\n}\n\n/* Autoprefixer (build-time) outputs, based on your target browser list: */\n.box {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n}",
          },
        },
        {
          heading: "Automated Cross-Browser Testing",
          body: "Modern end-to-end testing tools like Playwright can run the same test suite against Chromium, Firefox, and WebKit engines with a simple configuration change, catching rendering or behavior differences automatically as part of CI rather than relying purely on manual spot-checks. Cloud device-testing services (BrowserStack, Sauce Labs) extend this further by giving access to real device/OS/browser combinations that would otherwise be impractical to own and maintain physically, which matters especially for verifying older but still commonly used browser versions.",
          code: {
            language: "javascript",
            code:
              "// playwright.config.js — run the same suite across 3 real engines\nmodule.exports = {\n  projects: [\n    { name: 'chromium', use: { browserName: 'chromium' } },\n    { name: 'firefox', use: { browserName: 'firefox' } },\n    { name: 'webkit', use: { browserName: 'webkit' } }, // Safari's engine\n  ],\n};",
          },
        },
        {
          heading: "Testing Beyond Just 'Does It Render'",
          body: "Cross-browser and cross-device testing should also cover user preference media features that some browsers/OSes support more completely than others: prefers-color-scheme (dark mode), prefers-reduced-motion (users who've disabled animations, often for vestibular or motion-sensitivity reasons), and prefers-contrast. A page that ignores prefers-reduced-motion and plays a large parallax animation regardless of the user's explicit OS-level preference is a cross-compatibility and accessibility failure, not merely a cosmetic one.",
          code: {
            language: "css",
            code:
              "@media (prefers-reduced-motion: reduce) {\n  * {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}",
          },
        },
        {
          heading: "A Practical Testing Strategy",
          body: "A realistic strategy layers three levels: automated cross-engine tests (Playwright/Cypress) running in CI on every change to catch regressions early and cheaply; periodic manual checks on real hardware for at least one Chromium browser, Firefox, and an actual iOS device (covering WebKit, since that's mandatory on iOS regardless of the browser app used) before major releases; and an ongoing habit of checking caniuse.com before adopting any unfamiliar modern feature, rather than discovering the gap only after a user reports a broken page.",
        },
      ],
      commonPitfalls: [
        "Sniffing navigator.userAgent to detect a browser instead of checking directly whether the needed feature/API exists.",
        "Assuming 'testing in Chrome' covers Safari, when WebKit (Safari's engine) has historically diverged the most on both CSS and JS feature support.",
        "Using a brand-new CSS or JS feature in production without checking caniuse.com first, silently breaking the page for users on older browsers.",
        "Manually hand-writing vendor prefixes instead of using Autoprefixer, leading to inconsistent or outdated prefix coverage.",
        "Testing only on a resized desktop browser and never on a real iOS device, missing WebKit-specific bugs entirely.",
        "Ignoring prefers-reduced-motion and prefers-color-scheme, shipping an experience that overrides explicit user/OS accessibility preferences.",
      ],
      keyTakeaways: [
        "Every browser on iOS runs WebKit underneath, regardless of which browser app is installed — real iOS device testing is effectively Safari testing.",
        "Feature detection (@supports, checking for an API's existence) is more reliable and future-proof than browser/user-agent sniffing.",
        "Check caniuse.com before adopting any unfamiliar modern CSS/JS feature — it takes seconds and prevents shipping silent breakage.",
        "Autoprefixer should handle vendor prefixes automatically as part of the build — don't hand-write them.",
        "A solid strategy layers automated cross-engine CI tests with periodic real-device manual verification, not one or the other alone.",
      ],
      links: [
        { label: "Can I use... — Browser support tables", url: "https://caniuse.com/" },
        { label: "MDN — Cross-browser testing", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing" },
        { label: "Playwright — Cross-browser testing", url: "https://playwright.dev/docs/browsers" },
      ],
    },
    {
      moduleTitle: "Responsive Design & State Management",
      subModuleTitle: "Global vs. local state",
      overview:
        "Every frontend framework eventually forces the same architectural question: should a given piece of state live inside the one component that needs it, or somewhere shared that many components can read and change? This submodule addresses that question at the conceptual level, deliberately independent of any one framework's specific API, since the underlying judgment (not the syntax) is what actually transfers between React, Angular, and Vue jobs. It covers the signs that state should stay local, the signs it should be lifted or centralized, the tradeoffs global state introduces (debuggability, re-render cost, testability), the idea of derived state versus duplicated state, and a brief survey of the global-state tools available in each of the three major frameworks so the concept maps cleanly onto whichever one a given project uses.",
      sections: [
        {
          heading: "Defining Local vs. Global State",
          body: "Local state is owned by, and relevant only to, a single component — a dropdown's open/closed flag, the current value of a text input before it's submitted, a hover state for a tooltip. Global (or shared/app-level) state is needed by multiple components that aren't in a direct parent-child relationship, or that are too distant in the tree for passing props down at every level to remain practical — the identity of the logged-in user, a shopping cart's contents, the current UI theme, notification/toast messages. The distinction isn't about how 'important' the data is; it's purely about how many independent parts of the UI need to read or change it.",
        },
        {
          heading: "Signs State Should Stay Local",
          body: "If no other component needs to know about a piece of state, and it would be lost with no consequence if the component unmounted and remounted, it almost always belongs as local state in that component, managed with whatever your framework's local state primitive is (useState in React, a plain component property in Angular/Vue with the Composition API's ref()). Keeping state local by default — resisting the urge to centralize 'just in case a component needs it later' — keeps components genuinely independent, easier to test in isolation, and easier to delete or move without hunting down every place that reads their state from a shared store.",
        },
        {
          heading: "Signs State Should Be Lifted or Made Global",
          body: "State should move upward, and potentially all the way to a global store, once a second, unrelated part of the tree genuinely needs to read or change the same value — a filter selection that must affect both a sidebar and a results grid that don't share a close parent, a logged-in user's identity needed on nearly every screen, a cart badge count shown in a header far from the product-listing components that add items to it. The test isn't 'might this be useful elsewhere someday' (which almost anything could satisfy) but 'is there a second component, right now, that needs this.'",
        },
        {
          heading: "Lifting State Up as the Intermediate Step",
          body: "Before reaching for a global store, lifting state to the nearest common ancestor of the components that need it is usually the right intermediate step — this works identically in concept across React (moving a useState call up and passing props/callbacks down), Angular (moving state to a shared parent component or a scoped service), and Vue (moving a ref up and passing it via props/emits, or a provide/inject pair). Only once state needs to be shared across parts of the tree with no reasonably close common ancestor — or across entirely separate route-level pages — does a genuinely global store become the more practical solution than continuing to lift state through increasingly distant ancestors.",
        },
        {
          heading: "Global State Tools Across Frameworks",
          body: "Each major framework has both a lightweight, built-in option and heavier, more structured dedicated libraries for global state. React offers the built-in Context API for simpler cases and libraries like Redux Toolkit or Zustand for larger, more complex shared state. Angular commonly uses injectable services (which are singletons by default within their provided scope) combined with RxJS Observables or, increasingly, Signals, to share and reactively propagate state. Vue offers a built-in reactive() store pattern for simple cases and Pinia (the current officially recommended state library, having succeeded Vuex) for larger applications. Despite the different names and APIs, all of them solve the identical problem: a single source of truth that multiple, otherwise-unrelated components can subscribe to and update.",
        },
        {
          heading: "Derived State: Don't Duplicate What You Can Compute",
          body: "A subtle but common state-management mistake is storing a value in state that could instead be calculated on the fly from other state you already have — a 'filtered items' array stored separately from the full items array and the current filter text, for example. Storing both invites the two to drift out of sync (you filter once, then forget to re-filter when the underlying items array changes elsewhere), whereas computing the filtered list directly during render from the two source values (or memoizing that computation) guarantees it's always consistent with its inputs by construction, with no separate update step that can be forgotten.",
        },
        {
          heading: "The Real Tradeoffs of Global State",
          body: "Global state isn't free — it makes an application harder to reason about, since any given piece of shared state could in principle be read or changed from anywhere in the codebase, which becomes a genuine debugging burden past a certain scale ('what changed this value, and from where?'). It also makes components less portable and harder to unit test in isolation, since components depending on global state typically need that global context set up (or mocked) just to render for a test. The practical implication: treat global state as a deliberate architectural decision made when local/lifted state genuinely can't solve the problem — not a default reached for out of convenience or to avoid deciding where state should actually live.",
        },
      ],
      commonPitfalls: [
        "Defaulting new state to a global store 'just in case it's needed elsewhere,' when no second component currently needs it.",
        "Storing a value in state that could instead be derived/computed from other existing state, letting the two drift out of sync.",
        "Lifting state all the way to a global store when lifting it only as far as the nearest common ancestor would have been sufficient.",
        "Treating a global store as a dumping ground for anything shared by even two components, rather than reserving it for genuinely cross-cutting, app-wide concerns.",
        "Making components hard to test or reuse because they reach directly into a global store instead of receiving data through their normal props/inputs.",
        "Forgetting that syncing two independent sources of truth for the 'same' piece of data (e.g. a local copy of server data plus the server itself) is itself a state-duplication bug waiting to happen.",
      ],
      keyTakeaways: [
        "The local-vs-global decision is about how many independent parts of the UI need the data right now, not how important the data feels.",
        "Lift state to the nearest common ancestor before reaching for a global store — most 'shared state' problems don't need a full store.",
        "This concept transfers directly across React, Angular, and Vue — only the specific tool names (Context/Redux, services/RxJS, Pinia/provide-inject) differ.",
        "Prefer deriving state from existing data over storing a separate, parallel copy that can drift out of sync.",
        "Global state has real costs — harder debugging, harder isolated testing — so treat it as a deliberate choice, not a default.",
      ],
      links: [
        { label: "React — Sharing State Between Components", url: "https://react.dev/learn/sharing-state-between-components" },
        { label: "Pinia — Official Documentation (Vue)", url: "https://pinia.vuejs.org/" },
        { label: "Kent C. Dodds — State Colocation will make your React app faster", url: "https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster" },
      ],
    },
    {
      moduleTitle: "Responsive Design & State Management",
      subModuleTitle: "Performance basics",
      overview:
        "Frontend performance directly affects user experience, conversion rates, and search ranking — Google explicitly uses Core Web Vitals as a ranking signal, and studies consistently show even small increases in load time measurably increase bounce rates. This submodule covers the metrics that actually matter (Core Web Vitals: LCP, INP, CLS), the highest-leverage techniques for improving them — code splitting and lazy loading to shrink what's shipped, image optimization since images are typically the largest contributor to page weight, avoiding unnecessary re-renders in component frameworks, and understanding the critical rendering path so render-blocking resources don't delay first paint — and closes with how to actually measure performance (Lighthouse, DevTools) rather than guessing, since optimizing without measuring routinely wastes effort on things that were never actually the bottleneck.",
      sections: [
        {
          heading: "Core Web Vitals: LCP, INP, CLS",
          body: "Largest Contentful Paint (LCP) measures how long it takes the largest visible element (usually a hero image or heading) to render — the user's perception of 'is this page loaded yet' — and should ideally happen within 2.5 seconds. Interaction to Next Paint (INP, which replaced First Input Delay as the official responsiveness metric in 2024) measures how quickly the page responds to user interactions throughout the entire visit, not just the very first one — a good score is under 200ms. Cumulative Layout Shift (CLS) measures unexpected visual movement of content after it's already rendered (an ad loading late and pushing text down just as a user was about to tap something) — a good score is under 0.1, and it's fixed primarily by always reserving space (explicit width/height, or aspect-ratio) for images, ads, and embeds before they load.",
          bullets: [
            "LCP < 2.5s, INP < 200ms, CLS < 0.1 are the current 'good' thresholds Google uses for Core Web Vitals.",
            "Setting width/height attributes (or CSS aspect-ratio) on every image reserves its space before the file loads, directly preventing CLS.",
            "Web fonts loading late and swapping in can also cause layout shift — font-display: optional or preloading critical fonts mitigates this.",
          ],
        },
        {
          heading: "Reducing What You Ship: Code Splitting and Tree Shaking",
          body: "The single largest lever for initial load performance is usually reducing how much JavaScript the browser must download, parse, and execute before the page becomes interactive. Code splitting breaks a bundle into smaller chunks loaded only when needed (most commonly per-route, as covered in the Routing submodule, via dynamic import()); tree shaking is a build-time optimization where bundlers (Webpack, Vite, Rollup) statically analyze ES module imports/exports and exclude exported code that's never actually imported anywhere in the app, which only works reliably with native ES modules, not older CommonJS require() patterns.",
          code: {
            language: "javascript",
            code:
              "// Dynamic import — this chunk is only downloaded when the user opens the modal,\n// not as part of the initial bundle\nasync function openExportDialog() {\n  const { generatePdfReport } = await import('./pdfReportGenerator.js');\n  generatePdfReport();\n}",
          },
        },
        {
          heading: "Image Optimization",
          body: "Images are typically the single largest contributor to total page weight, which makes them the highest-leverage optimization target on most real pages. Practical steps: serve modern formats (WebP or AVIF, both meaningfully smaller than JPEG/PNG at equivalent visual quality, with a fallback via <picture> for older browsers), compress appropriately for the actual display size rather than shipping a source-resolution file, use loading=\"lazy\" on below-the-fold images so the browser defers fetching them until they're near the viewport, and use srcset/sizes (covered in the Responsive Design submodule) so mobile devices download an appropriately smaller file rather than a desktop-sized one.",
          code: {
            language: "html",
            code:
              "<img\n  src=\"product.jpg\"\n  srcset=\"product-400.webp 400w, product-800.webp 800w\"\n  sizes=\"(min-width: 768px) 50vw, 100vw\"\n  loading=\"lazy\"\n  width=\"800\" height=\"600\"\n  alt=\"Product photo\"\n/>",
          },
        },
        {
          heading: "Minimizing Unnecessary Re-Renders",
          body: "In component frameworks, re-rendering components whose output hasn't actually changed wastes CPU time and can cause visible jank, especially on lower-powered mobile devices. In React specifically, React.memo prevents a component from re-rendering when its props haven't changed (by reference, for objects/functions/arrays — which is why useCallback/useMemo on those props matters, as covered in the Hooks submodule), and correct, stable list keys (covered in the Component Architecture submodule) prevent the framework from unnecessarily discarding and recreating DOM nodes on every update. Profiling with React DevTools' Profiler tab (or the equivalent in Vue/Angular devtools) reveals exactly which components are re-rendering and why, rather than guessing.",
        },
        {
          heading: "The Critical Rendering Path",
          body: "The critical rendering path is the sequence of steps the browser must complete before it can paint the first pixels: parse HTML, fetch and parse CSS (render-blocking by default — the browser won't paint anything until CSS is parsed, to avoid a flash of unstyled content), then build the render tree and layout. A <script> tag with no attributes blocks HTML parsing entirely at the point it appears, until the script downloads and executes — the defer attribute downloads it in parallel and executes it after parsing completes (in document order), while async downloads in parallel and executes as soon as it's ready (potentially out of order relative to other scripts), which is why defer is usually the safer default for most application scripts.",
          code: {
            language: "html",
            code:
              "<!-- Blocks HTML parsing until this script downloads AND executes -->\n<script src=\"legacy.js\"></script>\n\n<!-- Downloads in parallel with parsing, executes after parsing, in order -->\n<script src=\"app.js\" defer></script>\n\n<!-- Downloads in parallel, executes immediately when ready (order not guaranteed) -->\n<script src=\"analytics.js\" async></script>",
          },
        },
        {
          heading: "Caching: Browser Cache, CDNs, and Service Workers",
          body: "Repeat visits should almost never re-download unchanged assets. HTTP caching headers (Cache-Control with a long max-age plus a content hash in the filename, so the filename itself changes whenever the content does, safely invalidating the cache) let browsers reuse a previously downloaded file without even a network round-trip to check for changes. A CDN serves static assets from a server geographically close to the user, reducing round-trip latency compared to a single origin server. Service workers go further, enabling assets and even full offline functionality to be served from a local cache the app controls directly — powerful, but adding real complexity that's usually only justified for apps with genuine offline requirements.",
        },
        {
          heading: "Measuring Before Optimizing",
          body: "Optimizing without measuring routinely wastes effort improving something that was never the actual bottleneck. Lighthouse (built into Chrome DevTools, or run via CLI/CI) audits a page against Core Web Vitals and gives specific, prioritized suggestions with estimated impact. The DevTools Performance panel records a detailed timeline of exactly what the browser was doing millisecond by millisecond during a real interaction, which is what reveals genuine bottlenecks — a slow synchronous function, an unexpected reflow, excessive re-renders — that intuition alone won't reliably find. Real User Monitoring (RUM) tools go a step further by capturing these metrics from actual visitors' real devices and networks in production, which routinely differ substantially from a fast developer machine on office WiFi.",
        },
      ],
      commonPitfalls: [
        "Shipping one large bundle with no code splitting, forcing every user to download JavaScript for pages they may never visit.",
        "Not reserving space (width/height or aspect-ratio) for images and embeds, causing layout shift as they load in.",
        "Serving desktop-resolution images to mobile devices instead of using srcset/sizes or a modern compressed format.",
        "Placing a blocking <script> tag with no defer/async in the <head>, delaying HTML parsing and first paint.",
        "Optimizing based on guesswork instead of profiling with Lighthouse or the DevTools Performance panel first.",
        "In React, creating new inline object/array/function props on every render for a memoized child, silently defeating React.memo.",
        "Treating performance as a one-time pre-launch task instead of a metric tracked continuously via RUM in production.",
      ],
      keyTakeaways: [
        "Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) are the concrete, measurable targets for real-world perceived performance.",
        "Code splitting and tree shaking reduce what a user's browser has to download and execute before the page becomes usable.",
        "Images are usually the largest contributor to page weight — format, compression, sizing, and lazy loading are the highest-leverage fixes.",
        "defer (and sometimes async) on <script> tags prevents render-blocking JavaScript from delaying first paint.",
        "Always measure with Lighthouse or DevTools before optimizing — fixing an unmeasured guess wastes effort on something that may not be the real bottleneck.",
      ],
      links: [
        { label: "web.dev — Core Web Vitals", url: "https://web.dev/articles/vitals" },
        { label: "web.dev — Fast load times", url: "https://web.dev/explore/fast" },
        { label: "Chrome DevTools — Performance features reference", url: "https://developer.chrome.com/docs/devtools/performance" },
      ],
    },
  ],
};

export default data;
