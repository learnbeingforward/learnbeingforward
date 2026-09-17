import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "frontend-development",
  modules: [
    {
      moduleTitle: "HTML & CSS",
      sections: [
        {
          heading: "Semantic HTML in Practice",
          body: "Semantic HTML means picking tags for what content is, not how it looks. A page built entirely from <div> tags might look identical to one using <header>, <nav>, <main>, <article>, and <footer> — but the semantic version is accessible to screen readers, easier for search engines to index correctly, and easier for another developer to understand at a glance. A useful rule: before reaching for a generic <div>, check whether a more specific tag already exists for what you're building (a list is <ul>/<ol>, a form control's label uses <label for=...>, a button that submits a form is <button>, not a styled <div> with a click handler).",
        },
        {
          heading: "Forms and Accessibility",
          body: "Forms are one of the most common places accessibility gets ignored. Every input should have an associated <label> (linked via the for/id attributes, or wrapping the input) so screen readers announce what the field is for, and so clicking the label focuses the input. Required fields should use the required attribute (which also gives free browser-level validation), and error messages should be associated with their field via aria-describedby so assistive technology announces them. Getting forms right isn't just about compliance — it directly reduces how many users give up partway through filling one out.",
        },
        {
          heading: "The CSS Box Model, Precisely",
          body: "Every element's rendered size is the sum of its content, padding, border, and margin. By default, width/height apply only to the content box, so adding padding or a border increases the element's total rendered size beyond what you set — a frequent source of layout bugs. Setting box-sizing: border-box (commonly applied globally to all elements) changes this so width/height include padding and border, making sizing far more predictable and matching how most developers actually think about element size.",
        },
        {
          heading: "Flexbox in Depth",
          body: "Flexbox distributes space along one axis at a time.",
          bullets: [
            "justify-content controls alignment along the main axis (e.g. horizontally in a row layout) — flex-start, center, space-between, and space-around are the ones used most often.",
            "align-items controls alignment along the cross axis (e.g. vertically in a row layout) — stretch (default), center, flex-start, flex-end.",
            "flex-grow/flex-shrink/flex-basis (usually shorthand as flex: 1) control how individual items grow or shrink to fill available space.",
            "flex-wrap lets items wrap onto multiple lines instead of overflowing or shrinking indefinitely.",
          ],
        },
        {
          heading: "CSS Grid in Depth",
          body: "Grid defines both rows and columns explicitly, then places items into that structure. grid-template-columns/grid-template-rows define the track sizes (fixed values, percentages, or the flexible fr unit, which divides remaining space proportionally). Named grid areas (grid-template-areas) let you lay out a page visually in the CSS itself, mapping named regions like 'header', 'sidebar', and 'main' to a readable ASCII-art-style grid — often the clearest way to express a full page layout, especially one that needs to rearrange at different breakpoints.",
        },
        {
          heading: "Responsive Design Principles",
          body: "Mobile-first responsive design means writing default styles for the smallest expected screen, then layering on complexity with min-width media queries as the viewport grows — rather than writing for desktop first and trying to compress it down. Common breakpoints (though every project should base them on its actual content, not fixed numbers) roughly separate mobile, tablet, and desktop layouts. Beyond media queries, relative units (rem for text so it respects user font-size preferences, % or fr for flexible widths, vw/vh sparingly for full-viewport elements) do most of the work of making a layout naturally adapt without needing a breakpoint for every small size change.",
        },
      ],
      links: [
        { label: "MDN Web Docs — HTML & CSS Reference", url: "https://developer.mozilla.org/en-US/docs/Web" },
        { label: "CSS-Tricks — A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
        { label: "web.dev — Learn Responsive Design", url: "https://web.dev/learn/design/" },
      ],
    },
    {
      moduleTitle: "JavaScript",
      sections: [
        {
          heading: "Core Language Fundamentals",
          body: "JavaScript's core building blocks — variables (let/const, avoiding the older var due to its confusing scoping rules), functions (including arrow functions, which don't rebind this and are common in modern code), and control flow (if/else, loops, switch) — are the foundation everything else builds on. Understanding truthy/falsy values (empty string, 0, null, undefined, and NaN are all falsy; almost everything else is truthy) explains a lot of JavaScript's sometimes-surprising conditional behavior, like why if (someArray.length) works as a non-empty check.",
        },
        {
          heading: "The DOM and Events",
          body: "The DOM is a tree of node objects representing the page, and JavaScript manipulates it to create interactivity. Beyond basic selection and updates, understanding event propagation matters: events bubble upward from the target element through its ancestors by default, which is why a single click listener on a parent container can handle clicks on any of its children (event delegation) — often more efficient than attaching a separate listener to every individual child element, and it automatically works for children added later.",
        },
        {
          heading: "Asynchronous JavaScript",
          body: "Most real frontend work — fetching data from an API, waiting on a timer, responding to user input over time — is asynchronous. Promises represent a value that will be available in the future (either resolved successfully or rejected with an error), and async/await is syntax that lets asynchronous code read like ordinary sequential code while still being non-blocking underneath. A function marked async always returns a Promise, and await pauses execution inside that function (not the whole program) until the awaited Promise settles — this distinction between 'this function pauses' and 'the browser tab freezes' is one of the most commonly misunderstood parts of JavaScript.",
        },
        {
          heading: "Working with APIs",
          body: "The Fetch API is the standard way to make HTTP requests from the browser. A typical pattern: call fetch(url), await the response, check response.ok (fetch does not reject on HTTP error status codes like 404 or 500 — only on network failure — so this check is easy to forget), parse the body (commonly via response.json()), and handle errors with try/catch around the whole sequence. Getting comfortable reading the actual response — status code, headers, and body — rather than assuming success is what separates code that works in the demo from code that survives real network conditions.",
        },
        {
          heading: "ES6+ Features",
          body: "Modern JavaScript adds syntax that makes common patterns shorter and less error-prone:",
          bullets: [
            "Destructuring — pulling values out of objects/arrays directly into named variables (const { name, email } = user).",
            "Spread/rest syntax (...) — copying/merging arrays and objects, or collecting extra function arguments into an array.",
            "Template literals — string interpolation with backticks and ${} instead of concatenation.",
            "Optional chaining (?.) and nullish coalescing (??) — safely accessing potentially-missing nested properties and providing fallback values without verbose manual checks.",
            "Modules (import/export) — splitting code across files with explicit, statically analyzable dependencies, replacing older global-script patterns.",
          ],
        },
      ],
      links: [
        { label: "MDN Web Docs — JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
        { label: "javascript.info — The Modern JavaScript Tutorial", url: "https://javascript.info/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
    {
      moduleTitle: "React / Angular / Vue",
      sections: [
        {
          heading: "Why Frameworks Exist",
          body: "Hand-written DOM manipulation gets unmanageable as an interface grows — keeping dozens of interdependent pieces of UI in sync with changing data by hand is error-prone and repetitive. Component frameworks solve this by letting you describe what the UI should look like for a given state, and having the framework handle updating the actual DOM efficiently when that state changes. React, Angular, and Vue all solve this same core problem with different philosophies — React with explicit JavaScript and a virtual DOM, Angular with a full opinionated framework and TypeScript-first design, Vue with HTML-like templates and a gentler learning curve — but the component-driven, data-drives-UI mental model transfers across all three.",
        },
        {
          heading: "Component-Driven Architecture",
          body: "In every one of these frameworks, a UI is built from small, focused, reusable components composed into a tree — a page is a component made of smaller components, which are made of smaller components still. Good component design keeps each piece focused on one responsibility (a button component shouldn't also manage a shopping cart's totals) and passes data in through defined inputs (props in React/Vue, @Input() in Angular) rather than reaching out to grab data from elsewhere, which keeps components predictable and reusable across different parts of an app.",
        },
        {
          heading: "Routing",
          body: "Single-page applications (SPAs) load one HTML page and then swap out content in place as the user navigates, rather than requesting a fresh full page from the server on every click. A router (React Router, Angular's built-in Router, Vue Router) matches the current URL to a component to render, keeps the browser's back/forward buttons working correctly, and lets you pass data through the URL itself (route params like /courses/:id, or query strings). Understanding routing is what makes an SPA feel like a normal multi-page website while actually staying a single page under the hood.",
        },
        {
          heading: "State Management Across Frameworks",
          body: "All three frameworks distinguish local component state (owned by one component, not shared) from state that needs sharing across distant parts of the app. React commonly uses Context or a library like Redux/Zustand for shared state; Vue has its own reactive state system and libraries like Pinia; Angular commonly uses services combined with RxJS Observables. Despite different APIs, the underlying question is always the same: which component actually owns this piece of data, and how does a change to it get communicated to every other part of the UI that depends on it?",
        },
        {
          heading: "Hooks and Composition Patterns",
          body: "Modern React relies heavily on hooks — functions like useState, useEffect, and useContext that let function components manage state and side effects without needing class components. useEffect in particular handles anything that needs to synchronize a component with something outside React (fetching data on mount, subscribing to an event, setting up a timer), and its dependency array controls exactly when that synchronization re-runs. Vue's Composition API (setup(), ref(), computed()) and Angular's signals follow a similar underlying idea: give developers small, composable functions to build behavior from, instead of relying purely on inheritance or lifecycle methods baked into a class.",
        },
      ],
      links: [
        { label: "React Official Documentation", url: "https://react.dev/" },
        { label: "Vue.js Official Documentation", url: "https://vuejs.org/guide/introduction.html" },
        { label: "Angular Official Documentation", url: "https://angular.dev/" },
      ],
    },
    {
      moduleTitle: "Responsive Design & State Management",
      sections: [
        {
          heading: "Mobile-First Design in a Component World",
          body: "Building responsively inside a component framework works the same way as plain CSS — mobile-first styles, layered breakpoints — but with an added question: should a component change its layout with CSS alone, or actually render different content at different sizes? As a rule, prefer CSS-only responsiveness (hiding/showing elements, changing grid layouts) wherever possible, since it's simpler and doesn't cause a re-render; only conditionally render entirely different components when the mobile and desktop experiences are genuinely structurally different, not just re-styled.",
        },
        {
          heading: "Cross-Browser Testing",
          body: "Different browsers (and different versions of the same browser) can render CSS and execute JavaScript slightly differently. Practical cross-browser testing means: checking layout in at least one Chromium-based browser, Firefox, and Safari (which has historically lagged on newer CSS/JS features); testing on a real mobile device or accurate emulator, not just a resized desktop browser window, since touch interactions and viewport behavior differ; and treating browser dev tools' device toolbar as a first approximation, not a substitute for testing on real hardware before shipping something widely used.",
        },
        {
          heading: "Global vs. Local State, Revisited",
          body: "A common mistake is putting too much state globally, which makes an app harder to reason about since any component could theoretically change shared data. A practical guideline: start with local state in the component that needs it; only lift it up to a shared/global store once a second, unrelated component genuinely needs to read or change the same value. Global state should represent things that are truly cross-cutting — the logged-in user, theme preference, shopping cart — not values only one screen cares about.",
        },
        {
          heading: "Performance Basics",
          body: "The most common frontend performance issues come from unnecessary re-renders and unnecessarily large bundles.",
          bullets: [
            "Avoid creating new objects/functions inline in render if they're passed to child components that otherwise wouldn't re-render — this can defeat memoization.",
            "Use code-splitting/lazy-loading (loading a route or component's code only when it's actually needed) to keep the initial page load small.",
            "Optimize images (correct format, compressed, appropriately sized) — images are usually the single largest contributor to page weight.",
            "Measure before optimizing: browser dev tools' Performance and Network tabs (or Lighthouse) tell you what's actually slow, rather than guessing.",
          ],
        },
        {
          heading: "Building a Capstone Responsive Application",
          body: "Bringing the module together: a well-built responsive application with proper state management starts from a clear component hierarchy planned before writing code, uses local state by default and lifts state up only when genuinely shared, applies mobile-first CSS with a small number of deliberate breakpoints, and is verified on at least one real mobile device before being considered done. Treating responsiveness and state architecture as decisions made upfront — not patched in after the fact — is what separates a capstone project that holds together from one that needs a rewrite the moment new requirements arrive.",
        },
      ],
      links: [
        { label: "web.dev — Learn Responsive Design", url: "https://web.dev/learn/design/" },
        { label: "web.dev — Web Performance", url: "https://web.dev/learn/performance/" },
        { label: "MDN Web Docs — Cross Browser Testing", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing" },
      ],
    },
  ],
};

export default data;
