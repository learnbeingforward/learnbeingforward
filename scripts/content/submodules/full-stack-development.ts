import type { CourseSubModuleContentData } from "../submodule-types";

const data: CourseSubModuleContentData = {
  courseSlug: "full-stack-development",
  submodules: [
    // ===================== FRONTEND MODULE =====================
    {
      moduleTitle: "Frontend Module",
      subModuleTitle: "HTML/CSS fundamentals",
      overview:
        "HTML and CSS are the substrate every frontend framework eventually compiles down to, and a surprising share of \"React bugs\" or \"layout bugs\" learners hit later are really unresolved gaps in these fundamentals — a misunderstood box model, a specificity fight, or not knowing when to reach for flexbox versus grid. This guide covers semantic HTML as a structural and accessibility tool, the box model and why box-sizing changes how every width calculation behaves, how the cascade and specificity actually resolve competing rules, and the two layout systems (flexbox and grid) that replaced float-based and table-based layouts. It closes with positioning/stacking context and CSS custom properties for maintainable theming. Treat this as the foundation the rest of the frontend track assumes is solid.",
      sections: [
        {
          heading: "Semantic HTML and Document Structure",
          body: "Semantic elements (header, nav, main, article, section, aside, footer) describe what content *is*, not just how it looks. A screen reader, search engine crawler, or browser's built-in reader mode all rely on this structure to navigate a page meaningfully — a page built entirely from generic divs gives them nothing to hook into. Semantic tags also come with free behavior: a button is keyboard-focusable and triggers on both click and Enter/Space without any JavaScript; a div styled to look like a button gives you none of that for free. The rule of thumb: reach for the most specific element that matches the content's meaning, and only fall back to div/span when no semantic element fits.",
          bullets: [
            "Use <button> for anything clickable that performs an action, and <a href> only for actual navigation — this alone fixes most keyboard-accessibility bugs.",
            "<main> should appear exactly once per page and wrap the primary content, letting assistive tech users skip repeated nav/header content.",
            "Heading levels (h1-h6) should nest in order and describe document outline, not be chosen for their default font size.",
          ],
          code: {
            language: "html",
            code:
              "<body>\n  <header>\n    <nav aria-label=\"Main\">\n      <a href=\"/\">Home</a>\n      <a href=\"/courses\">Courses</a>\n    </nav>\n  </header>\n  <main>\n    <article>\n      <h1>Understanding the Box Model</h1>\n      <p>Every element on the page is a rectangular box...</p>\n    </article>\n  </main>\n  <footer>\n    <p>&copy; 2026 Learn Being Forward</p>\n  </footer>\n</body>",
          },
        },
        {
          heading: "The Box Model and Layout Fundamentals",
          body: "Every rendered element is a box made of four layers, from the inside out: content, padding, border, and margin. By default (content-box), width/height apply only to the content area — padding and border are added on top, so an element styled width: 200px with 20px of padding and a 2px border actually occupies 244px. This trips up nearly every beginner's layout math. Setting box-sizing: border-box flips the model so width/height include padding and border, meaning a 200px-wide box stays 200px regardless of padding — which is why almost every production CSS reset applies border-box globally on day one.",
          bullets: [
            "Vertical margins between block siblings collapse to the larger of the two, not their sum — a common source of 'missing' spacing bugs.",
            "display: inline elements ignore top/bottom margin and explicit width/height entirely; use inline-block or flex if you need those.",
            "The universal border-box reset (* { box-sizing: border-box; }) should be one of the first rules in any real stylesheet.",
          ],
          code: {
            language: "css",
            code:
              "*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.card {\n  width: 300px;\n  padding: 24px;\n  border: 1px solid #ddd;\n  /* with border-box, the card is still exactly 300px wide */\n}",
          },
        },
        {
          heading: "CSS Selectors, Specificity, and the Cascade",
          body: "When multiple rules target the same element, the browser resolves the conflict using specificity, source order, and !important — in that priority order. Specificity is calculated as a tuple of (inline styles, IDs, classes/attributes/pseudo-classes, elements), compared left to right. An ID selector (#nav) always beats any number of class selectors; a class always beats an element selector. When specificity ties, the rule declared later in the stylesheet (or later in document order for equally-loaded stylesheets) wins. Understanding this is what lets you predict which rule applies without trial-and-error, and it's the direct fix for the classic 'my CSS isn't applying' complaint.",
          bullets: [
            "Inline style=\"\" attributes have the highest specificity short of !important and should be avoided in maintainable codebases for that reason.",
            "Prefer classes over IDs for styling — IDs are hard to override later and encourage specificity wars.",
            "!important should be a last resort; reaching for it repeatedly is a sign the selector architecture needs rethinking, not patching.",
          ],
        },
        {
          heading: "Flexbox for One-Dimensional Layout",
          body: "Flexbox arranges items along a single axis (row or column) and excels at distributing space, aligning items, and handling content that can wrap or resize dynamically — navbars, button groups, card rows, centering a single element. Setting display: flex on a container turns its direct children into flex items governed by main-axis (justify-content) and cross-axis (align-items) alignment properties. flex-grow, flex-shrink, and flex-basis on individual items control how they expand, contract, and what size they start from when space is distributed — this trio is what actually determines 'who gets the extra space' in a flex row, and it's the part most learners skip past without understanding.",
          bullets: [
            "justify-content controls alignment along the main axis; align-items controls the cross axis — mixing these up is the most common flexbox debugging mistake.",
            "flex: 1 is shorthand for flex-grow: 1; flex-shrink: 1; flex-basis: 0% — it makes an item grow to fill available space equally with siblings.",
            "gap works inside flex containers just like grid, and is now preferred over margin hacks for spacing between flex items.",
          ],
          code: {
            language: "css",
            code:
              ".navbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 12px 24px;\n}\n\n.navbar .spacer {\n  flex: 1; /* pushes following items to the right edge */\n}",
          },
        },
        {
          heading: "CSS Grid for Two-Dimensional Layout",
          body: "Grid handles layout where both rows and columns matter simultaneously — page-level layouts, dashboards, image galleries, and any design where items need to align across both axes. display: grid combined with grid-template-columns/rows defines the track sizes, and the fr unit distributes remaining space proportionally. Unlike flexbox, grid lets you place items explicitly by line number or named area, and repeat()/minmax() let you build responsive grids without a single media query in many cases. The general heuristic: reach for flexbox when laying out a single row or column of items, and grid when the layout is genuinely a two-dimensional structure.",
          code: {
            language: "css",
            code:
              ".dashboard {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 20px;\n}\n\n.page-layout {\n  display: grid;\n  grid-template-areas:\n    \"header header\"\n    \"sidebar content\"\n    \"footer footer\";\n  grid-template-columns: 220px 1fr;\n}\n.page-layout > header { grid-area: header; }\n.page-layout > aside  { grid-area: sidebar; }",
          },
        },
        {
          heading: "Positioning and Stacking Context",
          body: "position: static (default) leaves elements in normal document flow. relative positions an element offset from where it would normally sit while still reserving that original space. absolute removes the element from flow entirely and positions it relative to the nearest positioned ancestor (any ancestor with position other than static) — if none exists, it falls back to the document itself, which is the source of most 'why is my absolutely-positioned element in the wrong place' bugs. fixed positions relative to the viewport and stays put during scroll; sticky toggles between relative and fixed behavior based on scroll position. z-index only has an effect on positioned elements and only compares within the same stacking context.",
          bullets: [
            "An absolutely positioned element needs a positioned ancestor (usually position: relative on the parent) to be contained — otherwise it positions against the whole page.",
            "Creating a new stacking context (via transform, opacity < 1, or position + z-index) can trap a child's z-index so it never appears above elements outside that context, regardless of how high the z-index value is.",
          ],
        },
        {
          heading: "CSS Custom Properties and Maintainable Styling",
          body: "CSS custom properties (--variable-name) let you define values once and reference them throughout a stylesheet with var(), and — unlike preprocessor variables (Sass) — they're live in the browser, meaning they can be changed at runtime with JavaScript or overridden per-component/per-theme via the cascade. This is the mechanism behind most modern dark-mode implementations: define color tokens on :root, then override the same variable names inside a [data-theme='dark'] selector, and every component that references var(--bg-color) updates automatically without touching component CSS.",
          code: {
            language: "css",
            code:
              ":root {\n  --color-primary: #2563eb;\n  --color-bg: #ffffff;\n  --spacing-md: 16px;\n}\n\n[data-theme=\"dark\"] {\n  --color-bg: #0f172a;\n}\n\n.card {\n  background: var(--color-bg);\n  padding: var(--spacing-md);\n  border-color: var(--color-primary);\n}",
          },
        },
      ],
      commonPitfalls: [
        "Not setting box-sizing: border-box globally, then fighting width calculations that don't account for padding and border.",
        "Using divs and spans styled to look like buttons/links instead of real <button>/<a> elements, silently breaking keyboard and screen-reader access.",
        "Reaching for absolute positioning to fix a layout problem that flexbox or grid would solve more robustly and responsively.",
        "Not giving an absolutely positioned element's parent position: relative, causing it to position against the entire document instead.",
        "Escalating specificity fights with more and more specific selectors (or !important) instead of restructuring the CSS architecture.",
        "Forgetting that margins collapse vertically between block siblings, then adding redundant padding/margin to 'fix' spacing that was never actually missing.",
        "Confusing flexbox's justify-content (main axis) with align-items (cross axis), especially after switching flex-direction.",
      ],
      keyTakeaways: [
        "Semantic HTML gives you accessibility and SEO behavior for free — generic divs give you none of it.",
        "border-box should be a day-one global reset; content-box's default math is almost never what you want.",
        "Specificity resolves as (inline, IDs, classes, elements) compared left to right, with source order as the final tiebreaker.",
        "Flexbox is for one axis; grid is for two — most 'flexbox vs grid' confusion disappears once that distinction is internalized.",
        "position: absolute always positions against the nearest positioned ancestor, or the whole document if there isn't one.",
        "CSS custom properties are live and cascade-aware, making them the standard mechanism for theming today.",
      ],
      links: [
        { label: "MDN — CSS Box Model", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model" },
        { label: "MDN — Basic Concepts of Flexbox", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox" },
        { label: "CSS-Tricks — A Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
      ],
    },
    {
      moduleTitle: "Frontend Module",
      subModuleTitle: "JavaScript & the DOM",
      overview:
        "Before any framework, the browser gives you a live, mutable tree representation of the page — the DOM — and a JavaScript API for reading and changing it. Understanding this layer directly is what makes React's abstractions (JSX, synthetic events, the virtual DOM diffing it does on your behalf) make sense rather than feeling like magic, and it's what you fall back on for the parts frameworks don't cover, like measuring element sizes or integrating a third-party widget. This guide covers selecting and traversing elements, creating and modifying nodes, the event system including bubbling/capturing and delegation, form handling, fetch-based async updates, and the debounce/throttle patterns that keep DOM-heavy interactions performant. These are the exact mechanics React re-implements under the hood.",
      sections: [
        {
          heading: "Selecting and Traversing the DOM",
          body: "document.querySelector and document.querySelectorAll accept any CSS selector and are the modern default for finding elements, replacing older single-purpose methods like getElementById and getElementsByClassName. querySelector returns the first match (or null); querySelectorAll returns a static NodeList — a snapshot at call time, not a live view, meaning it won't automatically include elements added to the DOM afterward. Once you have a reference, .parentElement, .children, .nextElementSibling, and .closest(selector) let you navigate relative to it without re-querying the whole document, which matters both for performance and for correctness inside event handlers where you often need 'the row this button lives in' rather than the button itself.",
          bullets: [
            "querySelector('.card')/querySelectorAll('.card') work with any valid CSS selector, including combinators like '.list > li:first-child'.",
            "element.closest('.card') walks up the ancestor chain looking for a match — the standard way to find a containing component from a deeply nested click target.",
            "NodeList from querySelectorAll isn't an Array — use Array.from(list) or [...list] before calling .map()/.filter() on it.",
          ],
        },
        {
          heading: "Creating, Modifying, and Removing Elements",
          body: "document.createElement builds a new, detached node; setting its properties (.textContent, .className, .dataset) and then calling appendChild or the more flexible append/prepend/before/after inserts it into the tree. .textContent is the safe way to set text content — it never parses HTML, so user-supplied text can't inject markup. .innerHTML parses and executes its string as HTML, which is powerful for templating but a direct cross-site-scripting vector if the string includes any untrusted user input. Removing nodes is done with element.remove() (modern) rather than the older parent.removeChild(element) pattern, though both still work.",
          code: {
            language: "javascript",
            code:
              "function renderStudentCard(student) {\n  const card = document.createElement(\"div\");\n  card.className = \"student-card\";\n  card.dataset.studentId = student.id;\n\n  const name = document.createElement(\"h3\");\n  name.textContent = student.name; // safe: never parsed as HTML\n  card.append(name);\n\n  return card;\n}\n\nconst list = document.querySelector(\"#student-list\");\nstudents.forEach((s) => list.append(renderStudentCard(s)));",
          },
        },
        {
          heading: "Event Handling and the Event Object",
          body: "addEventListener(type, handler) attaches a listener without overwriting any existing ones, unlike setting element.onclick directly, which allows only a single handler. The event object passed to the handler carries useful context: event.target is the exact element that triggered the event, event.currentTarget is the element the listener is attached to (these differ during bubbling), and event.preventDefault() stops default browser behavior (like a form submitting or a link navigating) without stopping the event from continuing to propagate. Removing a listener later requires removeEventListener with a reference to the exact same function — an inline arrow function passed directly can never be removed because a new function reference is created each time.",
          code: {
            language: "javascript",
            code:
              "function handleClick(event) {\n  console.log(\"clicked:\", event.target);\n}\n\nconst btn = document.querySelector(\"#save-btn\");\nbtn.addEventListener(\"click\", handleClick);\n\n// Later, this only works because it's the SAME function reference:\nbtn.removeEventListener(\"click\", handleClick);",
          },
        },
        {
          heading: "Event Delegation, Bubbling, and Capturing",
          body: "Most DOM events bubble: they fire on the target element first, then travel up through each ancestor. Event delegation exploits this by attaching a single listener to a stable parent container instead of one listener per child, then inspecting event.target inside the handler to determine which child was actually interacted with. This is significantly more efficient for lists that render many items or change dynamically, since you attach one listener instead of re-attaching listeners every time the list updates. Capturing (the less common alternative, opted into with { capture: true }) fires listeners top-down before bubbling begins, and is mostly used for intercepting events before a child component can handle them.",
          bullets: [
            "Delegating a click listener to a <ul> and checking event.target.closest('li') handles clicks on any current or future <li>, including ones added after the listener was attached.",
            "event.stopPropagation() halts bubbling entirely — reach for it deliberately and rarely, since it can silently break delegation set up higher in the tree.",
          ],
        },
        {
          heading: "Forms, Validation, and preventDefault",
          body: "A form's default behavior is a full-page navigation/reload on submit — almost never what a modern interactive page wants, so listening for the 'submit' event and calling event.preventDefault() is close to mandatory. HTML5 gives you built-in validation attributes (required, pattern, minlength, type='email') that the browser enforces automatically and surfaces with :invalid/:valid CSS pseudo-classes, but any validation that depends on server-side state (like checking whether a username is already taken) still needs JavaScript. FormData(formElement) is the standard way to read all field values at once, including files, without manually querying every input.",
          code: {
            language: "javascript",
            code:
              "document.querySelector(\"#signup-form\").addEventListener(\"submit\", (event) => {\n  event.preventDefault();\n  const data = new FormData(event.target);\n  const payload = Object.fromEntries(data.entries());\n  submitSignup(payload);\n});",
          },
        },
        {
          heading: "Async JavaScript: fetch, Promises, and Updating the DOM",
          body: "fetch(url) returns a Promise that resolves once the HTTP response headers arrive — the body still needs to be read asynchronously via .json() or .text(), which itself returns another Promise, which is why a typical fetch call chains two awaits (or two .then() calls). async/await is syntactic sugar over Promises that lets asynchronous code read top-to-bottom like synchronous code, and try/catch around an awaited fetch is the standard way to handle both network failures and non-2xx responses (fetch, notably, does not throw on a 404 or 500 — you must check response.ok yourself).",
          code: {
            language: "javascript",
            code:
              "async function loadStudents() {\n  try {\n    const response = await fetch(\"/api/students\");\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    const students = await response.json();\n    renderStudentList(students);\n  } catch (err) {\n    showErrorBanner(\"Could not load students.\");\n  }\n}",
          },
        },
        {
          heading: "Debouncing and Throttling for Performance",
          body: "Events like scroll, resize, and keyup on a search input can fire dozens of times per second, and running expensive work (a DOM re-render, an API call) on every single firing will visibly lag the page. Debouncing delays execution until a pause of a given length has occurred since the last call — ideal for search-as-you-type, where you only want to fire the request once the user stops typing. Throttling instead guarantees execution happens at most once per interval regardless of how often the event fires — better suited to scroll-position tracking, where you want regular updates but not on every single pixel of movement.",
          code: {
            language: "javascript",
            code:
              "function debounce(fn, delayMs) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delayMs);\n  };\n}\n\nconst debouncedSearch = debounce((query) => fetchResults(query), 300);\nsearchInput.addEventListener(\"input\", (e) => debouncedSearch(e.target.value));",
          },
        },
      ],
      commonPitfalls: [
        "Setting .innerHTML with any string that includes user-supplied input, opening a direct XSS vulnerability instead of using .textContent.",
        "Attaching a new event listener every time a list re-renders instead of using event delegation, leaking listeners over time.",
        "Trying to removeEventListener with a freshly created inline arrow function, which can never match the originally attached reference.",
        "Assuming fetch() rejects on HTTP error status codes — it only rejects on network failure, so response.ok must be checked explicitly.",
        "Querying the same DOM element repeatedly inside a loop or handler instead of caching the reference once.",
        "Confusing event.target (where the event originated) with event.currentTarget (where the listener is attached) during bubbling.",
        "Running expensive logic directly on scroll/resize/keyup without debouncing or throttling, causing visible jank.",
      ],
      keyTakeaways: [
        "querySelector/querySelectorAll with CSS selectors are the modern default for DOM lookups.",
        "textContent is safe by default; innerHTML executes markup and is a security decision, not just a convenience choice.",
        "Event delegation (one listener on a parent, inspect event.target) scales far better than per-item listeners.",
        "fetch requires checking response.ok manually — it does not throw for HTTP error statuses.",
        "Debounce for 'wait until they stop'; throttle for 'no more than once every X ms' — picking the wrong one causes either laggy or overly-chatty UIs.",
        "Everything a framework like React does — diffing, event handling, updates — is built on exactly these DOM primitives.",
      ],
      links: [
        { label: "MDN — Introduction to Events", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events" },
        { label: "MDN — Using Fetch", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" },
        { label: "javascript.info — Bubbling and Capturing", url: "https://javascript.info/bubbling-and-capturing" },
      ],
    },
    {
      moduleTitle: "Frontend Module",
      subModuleTitle: "React component architecture",
      overview:
        "React's core idea is that a UI is a function of state: components declare what the UI should look like for a given set of props and state, and React handles turning that declaration into actual DOM updates. Getting comfortable with component architecture means understanding function components and JSX, how props flow data downward and composition avoids over-coupling components together, how useState and useEffect manage local state and side effects respectively, and when to extract logic into a custom hook instead of duplicating it. This guide also covers the classic 'lifting state up' pattern and common component design patterns you'll see in production codebases. These are the exact skills that separate a component tree that's pleasant to extend from one that turns into unmanageable prop-drilling spaghetti.",
      sections: [
        {
          heading: "Function Components and JSX",
          body: "A React function component is just a JavaScript function that returns JSX — a syntax extension that looks like HTML but compiles to React.createElement() calls describing the UI tree. Because it's just JavaScript, you can embed any expression inside curly braces: variables, function calls, ternaries, and array .map() calls for rendering lists. JSX enforces a single root element per return (or a Fragment, <>...</>, when you don't want an extra wrapper DOM node), and uses camelCase for attributes that mirror DOM properties (className instead of class, onClick instead of onclick) because they're JavaScript property names, not HTML attribute strings.",
          code: {
            language: "jsx",
            code:
              "function StudentCard({ name, score }) {\n  const passed = score >= 60;\n  return (\n    <div className={`card ${passed ? \"card--pass\" : \"card--fail\"}`}>\n      <h3>{name}</h3>\n      <p>Score: {score}</p>\n    </div>\n  );\n}",
          },
        },
        {
          heading: "Props and Composition",
          body: "Props are read-only inputs passed from a parent to a child — a component must never reassign or mutate its own props. Composition is React's alternative to deep inheritance hierarchies: instead of a component trying to handle every possible variant internally, you compose smaller, focused components together, often passing JSX itself as a prop (most commonly as children). This is what makes a generic <Modal> or <Card> reusable across an entire app — the shell component owns layout and behavior, and the caller supplies the specific content via children, keeping the shell component ignorant of what it's actually displaying.",
          bullets: [
            "props.children lets a wrapper component render whatever JSX its caller passes between its opening and closing tags.",
            "Prefer composing small components over adding more and more conditional props to one large component — the latter tends to grow unmanageable.",
            "Destructuring props in the function signature (function Card({ title, children })) is the standard, more readable convention over accessing props.title everywhere.",
          ],
        },
        {
          heading: "useState and Local Component State",
          body: "useState(initialValue) returns a pair: the current state value and a setter function, and calling the setter schedules a re-render with the new value on the next render pass — it does not mutate the variable in place. React compares state by reference for objects and arrays, so updating a nested field requires creating a new object/array (typically via spread syntax) rather than mutating the existing one; mutating in place and calling the setter with the same reference will not trigger a re-render at all, which is one of the most common React bugs beginners hit.",
          code: {
            language: "jsx",
            code:
              "function TodoForm() {\n  const [todos, setTodos] = useState([]);\n  const [text, setText] = useState(\"\");\n\n  function addTodo() {\n    setTodos((prev) => [...prev, { id: Date.now(), text }]); // new array, not mutated\n    setText(\"\");\n  }\n\n  return (\n    <div>\n      <input value={text} onChange={(e) => setText(e.target.value)} />\n      <button onClick={addTodo}>Add</button>\n    </div>\n  );\n}",
          },
        },
        {
          heading: "useEffect and Side Effects",
          body: "useEffect(fn, deps) runs fn after React commits the render to the DOM, and is the designated escape hatch for anything that isn't purely rendering: fetching data, subscribing to an external event source, manually manipulating a DOM node a library needs direct access to, or setting up a timer. The dependency array controls when the effect re-runs: omitting it runs the effect after every render, an empty array runs it once on mount, and a populated array re-runs it whenever any listed value changes between renders. When an effect sets up something ongoing (a subscription, a timer, an event listener), returning a cleanup function from it is mandatory — React calls that cleanup before the next effect run and on unmount.",
          code: {
            language: "jsx",
            code:
              "function StudentProfile({ studentId }) {\n  const [student, setStudent] = useState(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    fetch(`/api/students/${studentId}`)\n      .then((r) => r.json())\n      .then((data) => { if (!cancelled) setStudent(data); });\n\n    return () => { cancelled = true; }; // avoid setting state after unmount\n  }, [studentId]); // re-fetch whenever studentId changes\n\n  if (!student) return <p>Loading...</p>;\n  return <h2>{student.name}</h2>;\n}",
          },
        },
        {
          heading: "Lifting State Up and Avoiding Prop Drilling",
          body: "When two sibling components need to share or stay in sync with the same piece of state, the fix is to move ('lift') that state to their nearest common ancestor and pass it down as props to both, along with a callback for children to request changes. This keeps a single source of truth instead of two components independently tracking the same data and drifting out of sync. The trade-off is prop drilling — passing a prop down through several intermediate components that don't use it themselves, just to reach a deeply nested consumer. A little drilling (two or three levels) is normal and fine; drilling through five or six unrelated layers is the signal to reach for Context or a state management library instead.",
        },
        {
          heading: "Custom Hooks for Reusable Logic",
          body: "A custom hook is simply a function whose name starts with 'use' that calls other hooks internally — it's the mechanism React provides for extracting stateful logic (not just plain functions, but logic that itself uses useState/useEffect) so it can be reused across multiple components without duplicating the underlying implementation. Unlike a regular utility function, each component that calls a custom hook gets its own independent state instance — the hook is not a shared singleton, it's a reusable recipe for a stateful behavior.",
          code: {
            language: "jsx",
            code:
              "function useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    setLoading(true);\n    fetch(url).then((r) => r.json()).then((d) => {\n      setData(d);\n      setLoading(false);\n    });\n  }, [url]);\n\n  return { data, loading };\n}\n\n// Reused across any component that needs remote data:\nfunction StudentList() {\n  const { data: students, loading } = useFetch(\"/api/students\");\n  if (loading) return <p>Loading...</p>;\n  return <ul>{students.map((s) => <li key={s.id}>{s.name}</li>)}</ul>;\n}",
          },
        },
        {
          heading: "Component Design Patterns",
          body: "Two patterns recur constantly in production React codebases. The container/presentational split separates data-fetching and logic (container) from purely visual rendering (presentational, ideally receiving everything via props and rendering the same output for the same input). Compound components — like a <Tabs> component whose <Tabs.List> and <Tabs.Panel> children implicitly coordinate through shared context — let you expose a flexible, composable API instead of one giant component with dozens of configuration props. Both patterns exist to keep individual components small, focused, and independently testable rather than growing into a single component that does everything.",
        },
      ],
      commonPitfalls: [
        "Mutating state directly (array.push(item); setState(array)) instead of creating a new reference, so React never detects the change and skips the re-render.",
        "Using array index as the key prop for a list that can reorder, insert, or remove items — causing React to misattribute state and DOM nodes to the wrong items.",
        "Omitting a value used inside useEffect from its dependency array, causing the effect to run with stale, captured values ('stale closure' bugs).",
        "Reaching for useEffect to compute a value that's actually just a derived value from existing props/state, instead of calculating it directly during render.",
        "Prop-drilling the same value through five or more intermediate components instead of introducing Context once it's clearly warranted.",
        "Forgetting the cleanup function in useEffect for subscriptions or timers, causing memory leaks or 'set state on unmounted component' warnings.",
        "Defining a new inline function or object literal as a prop on every render, which can defeat memoization (React.memo) on the child receiving it.",
      ],
      keyTakeaways: [
        "React re-renders in response to new state or props references, not in-place mutation — always create new objects/arrays when updating state.",
        "useEffect is for synchronizing with something outside React (network, subscriptions, DOM APIs) — not for computing derived values.",
        "A stable, unique key (not array index, unless the list is static) is required for any list that can reorder or change length.",
        "Lift state to the nearest common ancestor when siblings need to share it; reach for Context only once prop drilling becomes genuinely painful.",
        "Custom hooks extract reusable stateful logic; each calling component still gets its own independent state.",
        "Small, composable components with a clear single responsibility scale far better than a few large, heavily-configured ones.",
      ],
      links: [
        { label: "React Docs — Describing the UI", url: "https://react.dev/learn/describing-the-ui" },
        { label: "React Docs — Synchronizing with Effects", url: "https://react.dev/learn/synchronizing-with-effects" },
        { label: "React Docs — Reusing Logic with Custom Hooks", url: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
      ],
    },
    {
      moduleTitle: "Frontend Module",
      subModuleTitle: "State management",
      overview:
        "As an app grows past a handful of components, deciding *where* a piece of state should live becomes one of the highest-leverage architectural decisions in frontend development. This guide walks through the full spectrum: state that's genuinely local to one component, state lifted to a shared ancestor, React's built-in Context API for avoiding deep prop drilling, and dedicated state libraries (Redux and lighter alternatives like Zustand) for large, complex applications. It also covers a distinction that trips up almost every learner moving into real-world apps: server state (data that lives on a backend and is just cached on the client) is fundamentally different from client UI state (a modal being open, a selected tab), and treating them the same way causes both unnecessary complexity and subtle bugs.",
      sections: [
        {
          heading: "The State Locality Spectrum",
          body: "The default, correct choice for any new piece of state is to keep it as local as possible — inside the component that actually uses it, via useState. Only move state further out (lifting it to a parent, or eventually to global state) once you have a concrete reason: multiple components need to read or write the same value and they aren't in a simple parent-child relationship. A common mistake is prematurely reaching for a global store 'just in case,' which adds indirection and boilerplate to state that will only ever be used by one component and its direct children.",
        },
        {
          heading: "React Context API",
          body: "Context lets a value be read by any descendant of a Provider without passing it down as a prop through every intermediate layer. A Context is created with createContext(), populated with a value via <MyContext.Provider value={...}>, and read anywhere below it with useContext(MyContext). Context is well-suited to relatively static, infrequently-changing data — theme, current authenticated user, locale — because every component consuming that context re-renders whenever the Provider's value changes, regardless of which specific field a given consumer actually reads. Splitting frequently-changing state into its own smaller, dedicated Context (rather than one large context object holding everything) limits the blast radius of each update.",
          code: {
            language: "jsx",
            code:
              "const ThemeContext = createContext(\"light\");\n\nfunction App() {\n  const [theme, setTheme] = useState(\"light\");\n  return (\n    <ThemeContext.Provider value={theme}>\n      <Toolbar onToggle={() => setTheme((t) => (t === \"light\" ? \"dark\" : \"light\"))} />\n    </ThemeContext.Provider>\n  );\n}\n\nfunction Toolbar({ onToggle }) {\n  const theme = useContext(ThemeContext); // no prop drilling needed\n  return <button onClick={onToggle}>Current theme: {theme}</button>;\n}",
          },
        },
        {
          heading: "Redux Fundamentals",
          body: "Redux centralizes all application state in a single store and enforces that the only way to change it is by dispatching a plain-object action, which a pure reducer function uses to compute the next state from the current state — never mutating it. This unidirectional flow (dispatch action → reducer computes new state → UI re-renders from new state) makes state changes predictable and traceable, which is why Redux DevTools can replay every action that ever happened. Modern Redux (via Redux Toolkit) drastically cuts the historical boilerplate by generating action creators and allowing reducers to be written with 'mutating' syntax internally (backed by Immer, which produces an immutable update under the hood).",
          code: {
            language: "javascript",
            code:
              "import { createSlice, configureStore } from \"@reduxjs/toolkit\";\n\nconst counterSlice = createSlice({\n  name: \"counter\",\n  initialState: { value: 0 },\n  reducers: {\n    incremented: (state) => { state.value += 1; }, // Immer makes this safe\n    decremented: (state) => { state.value -= 1; },\n  },\n});\n\nexport const { incremented, decremented } = counterSlice.actions;\nexport const store = configureStore({ reducer: { counter: counterSlice.reducer } });",
          },
        },
        {
          heading: "Zustand as a Lightweight Alternative",
          body: "Zustand takes a much smaller-footprint approach: a store is just a hook created with create(), holding state and the functions that update it, with no actions, reducers, or Provider wrapper required. Components subscribe only to the specific slice of state they select, so — unlike naive Context usage — a component reading store.count doesn't re-render when store.username changes. This makes Zustand a popular middle ground for apps that have outgrown plain useState/Context but don't want Redux's ceremony.",
          code: {
            language: "javascript",
            code:
              "import { create } from \"zustand\";\n\nconst useCounterStore = create((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n}));\n\nfunction Counter() {\n  const count = useCounterStore((state) => state.count); // only re-renders on count change\n  const increment = useCounterStore((state) => state.increment);\n  return <button onClick={increment}>{count}</button>;\n}",
          },
        },
        {
          heading: "Server State vs. Client State",
          body: "Client state (a form's current input, whether a dropdown is open) is owned entirely by the frontend. Server state (a list of students fetched from an API) is fundamentally different: it's owned by the backend, can go stale, can fail to load, may need refetching, and is often needed by multiple unrelated components. Managing server state with the same tools as client state (manually useState + useEffect fetching everywhere) reproduces a lot of hand-rolled logic — loading flags, error handling, cache invalidation, avoiding duplicate requests — that dedicated server-state libraries like TanStack Query (React Query) or SWR already solve, including automatic caching, background refetching, and request deduplication.",
        },
        {
          heading: "Avoiding Unnecessary Re-renders",
          body: "A component re-renders when its own state changes, when its parent re-renders, or when a Context it consumes changes — not only when 'its own data' changes, which surprises many learners. React.memo prevents a function component from re-rendering when its props haven't changed (by shallow comparison), but it's easily defeated by passing a new inline object, array, or function as a prop on every parent render, since those are never shallow-equal to the previous render's value. useMemo and useCallback exist specifically to preserve stable references for values and functions across renders so that memoized children can actually skip re-rendering.",
          bullets: [
            "React.memo only helps if the props passed to the component are actually stable between renders — verify with a profiler before assuming it worked.",
            "Splitting a large context value into multiple smaller contexts limits how many consumers re-render on any single change.",
          ],
        },
        {
          heading: "Choosing the Right Tool",
          body: "There's no single correct answer — it's a decision based on scope and change frequency. Local component state should be the default. Lifted state covers small, closely related component groups. Context suits infrequently-changing, broadly-needed values like theme or auth. A dedicated store (Redux/Zustand) earns its cost once genuinely complex, cross-cutting client state exists (e.g., a multi-step wizard's state needed across a dozen unrelated routes). And any data that originates from a server belongs in a server-state library, not hand-rolled fetch-and-useState logic, regardless of which client-state tool the rest of the app uses.",
        },
      ],
      commonPitfalls: [
        "Reaching for Redux or global state on day one for state that only one component and its direct children will ever need.",
        "Putting frequently-changing values (like mouse position or a text input) into a single large Context, causing every consumer to re-render on every keystroke.",
        "Mutating Redux state directly outside of Immer-backed Redux Toolkit reducers, silently breaking change detection.",
        "Managing server-fetched data with plain useState/useEffect everywhere instead of a server-state library, reinventing caching and loading-state logic per component.",
        "Passing a new inline object or arrow function as a prop every render, which defeats React.memo on the receiving component.",
        "Treating 'is this modal open' (client UI state) and 'what did the API return' (server state) as the same kind of state requiring the same tool.",
      ],
      keyTakeaways: [
        "Default to the most local state possible; only lift or globalize state once a concrete cross-component need appears.",
        "Context is best for infrequently-changing, broadly-shared values — not a general-purpose replacement for a state management library.",
        "Redux enforces a strict, traceable unidirectional data flow; Zustand offers similar centralized state with far less boilerplate.",
        "Server state and client state are different problems — use a server-state library (React Query/SWR) for anything that originates from an API.",
        "A component re-renders when its parent re-renders or a consumed Context changes, not only when its 'own' data changes.",
        "Stable references (via useMemo/useCallback) are what make React.memo actually effective.",
      ],
      links: [
        { label: "React Docs — Passing Data Deeply with Context", url: "https://react.dev/learn/passing-data-deeply-with-context" },
        { label: "Redux Toolkit — Quick Start", url: "https://redux-toolkit.js.org/tutorials/quick-start" },
        { label: "Zustand — Getting Started", url: "https://zustand.docs.pmnd.rs/getting-started/introduction" },
      ],
    },
    {
      moduleTitle: "Frontend Module",
      subModuleTitle: "Responsive UI",
      overview:
        "Responsive design means a single codebase adapts cleanly across phones, tablets, and desktops rather than shipping separate sites per device class. This guide covers the mobile-first philosophy that underlies modern CSS (writing base styles for small screens, then progressively enhancing with media queries for more space), the mechanics of breakpoints, fluid layout using relative units instead of fixed pixels, responsive images that avoid shipping desktop-sized assets to phones, and how flexbox/grid patterns naturally adapt across screen sizes with minimal extra code. It closes with the viewport meta tag (without which none of this works on real mobile browsers) and the accessibility considerations — touch target sizing, content order, zoom support — that responsive design is also responsible for, not just visual layout.",
      sections: [
        {
          heading: "Mobile-First Design Philosophy",
          body: "Mobile-first means writing your base (unqualified) CSS rules for the smallest, most constrained viewport, then using min-width media queries to add complexity as more screen space becomes available — the inverse of the older desktop-first approach, which started with a full desktop layout and used max-width queries to strip things away for small screens. Mobile-first tends to produce simpler, more maintainable CSS because you're additively layering enhancements rather than fighting to undo desktop-oriented rules on a cramped screen, and it forces you to prioritize what content actually matters when space is scarce.",
        },
        {
          heading: "Media Queries and Breakpoints",
          body: "A media query applies a block of CSS only when a condition (most commonly viewport width) is true. Rather than hardcoding breakpoints to specific popular device widths (which change every product cycle), the better practice is to set breakpoints wherever your own design actually starts to break — where text lines get too long, where a grid gets too cramped — and use a small, consistent set of breakpoints (commonly 2-4) across the whole app rather than a different one-off value per component.",
          code: {
            language: "css",
            code:
              "/* Mobile-first: base styles apply to all screens */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n\n@media (min-width: 640px) {\n  .grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: repeat(4, 1fr); }\n}",
          },
        },
        {
          heading: "Fluid Layouts with Relative Units",
          body: "Fixed pixel widths force layouts to break at specific points; relative units let content adapt continuously. Percentages and fr units (in grid) size relative to their container; rem sizes relative to the root font size (making it respect a user's browser-level font size preference, unlike px); and modern CSS functions clamp(min, preferred, max), min(), and max() let a single declaration fluidly scale a value between bounds without needing a media query at all — most commonly used today for fluid typography.",
          code: {
            language: "css",
            code:
              "h1 {\n  /* scales fluidly between 24px and 48px based on viewport width */\n  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);\n}\n\n.container {\n  width: min(90%, 1200px); /* never wider than 1200px, but shrinks on small screens */\n  margin-inline: auto;\n}",
          },
        },
        {
          heading: "Responsive Images and Art Direction",
          body: "Shipping a single large image to every device wastes bandwidth on phones and can even look worse than a purpose-cropped version. The srcset attribute on <img> lets the browser choose the best-fitting image from a set of candidates based on the device's actual viewport size and pixel density, avoiding manual breakpoint-based JavaScript. The <picture> element goes further, allowing genuinely different images (not just different resolutions of the same image) per breakpoint — useful when a wide banner crop looks wrong cropped down for a narrow phone screen.",
          code: {
            language: "html",
            code:
              "<img\n  src=\"student-800.jpg\"\n  srcset=\"student-480.jpg 480w, student-800.jpg 800w, student-1200.jpg 1200w\"\n  sizes=\"(max-width: 600px) 100vw, 50vw\"\n  alt=\"Student presenting a capstone project\"\n/>",
          },
        },
        {
          heading: "Flexbox and Grid Patterns That Adapt Naturally",
          body: "Some layout patterns require zero media queries at all. grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) automatically fits as many 200px-minimum columns as will comfortably fit the container, reflowing to fewer columns as the viewport shrinks, without a single breakpoint declared. Similarly, flex-wrap: wrap on a flex container lets items naturally flow onto new lines once they no longer fit the current row. Reaching for these adaptive patterns before reaching for a media query keeps the CSS smaller and more resilient to viewport sizes you didn't explicitly plan for.",
        },
        {
          heading: "The Viewport Meta Tag and Real-Device Testing",
          body: "Without <meta name='viewport' content='width=device-width, initial-scale=1'> in the document head, mobile browsers render the page at a fixed desktop-width virtual viewport (typically 980px) and then zoom it out to fit the screen — meaning every media query you write is evaluated against that fake desktop width, not the phone's actual screen size, and nothing responsive will work as intended. Testing responsive design in a desktop browser's device-emulation mode is a reasonable first pass, but touch behavior, real network conditions, and actual pixel density differences only surface on physical devices, so a final check on at least one real phone and tablet is worth the time before shipping.",
        },
        {
          heading: "Accessibility Considerations in Responsive Design",
          body: "Responsive design isn't only about visual layout — it's also responsible for making sure the experience stays usable. Touch targets (buttons, links) should be at least roughly 44x44px so they're comfortably tappable with a finger, not just a precise mouse cursor. Content that's hidden with display: none on mobile to save space should be content that's genuinely not needed there, not content silently removed from screen readers and keyboard users while remaining in the DOM for layout reasons. And since hover states don't exist on touch devices, any interaction that depends purely on :hover to be discoverable needs a touch-accessible equivalent (visible by default, or triggered on tap).",
        },
      ],
      commonPitfalls: [
        "Forgetting the viewport meta tag, which makes every media query evaluate against a fake desktop-width viewport on real mobile browsers.",
        "Hardcoding breakpoints to specific device widths (e.g. 'iPhone 12 width') that become meaningless as new devices ship.",
        "Using fixed px widths for containers and text, which break rather than adapt as viewport size changes.",
        "Relying on :hover-only interactions for critical functionality, which is undiscoverable on touch devices.",
        "Serving the same large desktop-resolution image to mobile devices instead of using srcset/sizes for responsive images.",
        "Making touch targets too small or too close together, causing mis-taps on phones even though the layout looks fine on desktop.",
        "Hiding content with display:none for smaller screens instead of genuinely reflowing or prioritizing it, hurting both UX and accessibility.",
      ],
      keyTakeaways: [
        "Mobile-first CSS (base styles for small screens, min-width media queries to enhance) is generally simpler to maintain than desktop-first.",
        "Set breakpoints where your own design breaks, not at specific popular device widths.",
        "clamp(), min(), and max() enable fluid values without needing a media query at all.",
        "srcset/sizes and <picture> let the browser (or you) choose the right image per device instead of shipping one size to everyone.",
        "The viewport meta tag is a prerequisite for responsive CSS to function at all on real mobile browsers.",
        "Responsive design includes touch target sizing and hover-independent interactions, not just fluid layout.",
      ],
      links: [
        { label: "MDN — Responsive Design", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design" },
        { label: "MDN — Responsive Images", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images" },
        { label: "web.dev — Responsive Web Design Basics", url: "https://web.dev/learn/design/" },
      ],
    },

    // ===================== BACKEND MODULE =====================
    {
      moduleTitle: "Backend Module",
      subModuleTitle: "REST API design",
      overview:
        "REST (Representational State Transfer) is a set of architectural constraints — not a protocol — that, applied well, makes an API predictable enough that a developer who has never seen your specific endpoints can guess how they behave. This guide covers designing resource-oriented URIs, using HTTP methods according to their actual semantics (especially idempotency, which many production bugs violate), choosing status codes that communicate real outcomes instead of defaulting to 200 for everything, structuring request/response bodies consistently, and the practical concerns that separate a toy API from a production one: pagination for large collections, a versioning strategy for breaking changes, and consistent, non-leaky error responses. These conventions matter because they're what every frontend, mobile client, and third-party integrator relies on implicitly.",
      sections: [
        {
          heading: "Resources and URI Design",
          body: "REST models everything as a resource — a noun, not a verb — identified by a URI. Collections are plural nouns (/students), and a specific item within a collection is addressed by appending its identifier (/students/42). Nesting expresses ownership or containment (/students/42/enrollments for that student's enrollments), but nesting should stay shallow — more than two or three levels deep becomes unwieldy and usually signals the nested resource deserves its own top-level, filterable endpoint instead (/enrollments?studentId=42).",
          bullets: [
            "URIs should never contain verbs like /getStudents or /createStudent — the HTTP method already conveys the action.",
            "Use plural nouns consistently for collections (/students, not /student) to avoid inconsistent pluralization across the API.",
            "Query parameters are for filtering, sorting, and pagination (?status=active&sort=-createdAt), not for identifying a specific resource.",
          ],
        },
        {
          heading: "HTTP Methods and Idempotency",
          body: "Each HTTP method carries a specific meaning that clients, proxies, and caches all rely on. GET retrieves and must never cause a side effect. POST creates a new resource (or triggers a non-idempotent action) and is not idempotent — calling it twice can create two resources. PUT replaces a resource entirely and is idempotent — calling it n times has the same effect as calling it once. PATCH applies a partial update and may or may not be idempotent depending on implementation. DELETE removes a resource and should be idempotent (deleting an already-deleted resource should not error in a way that breaks retries). Violating idempotency — e.g., a PUT that increments a counter rather than setting an absolute value — breaks client retry logic in subtle, hard-to-debug ways.",
        },
        {
          heading: "Status Codes That Communicate Intent",
          body: "Returning 200 OK for every response, with success/failure buried in the response body, forces every client to parse the body just to know if a request worked — defeating a huge part of what HTTP already gives you for free. 2xx codes indicate success (200 OK, 201 Created for a successful POST, 204 No Content when there's nothing to return, e.g. after a DELETE). 4xx indicates the client did something wrong (400 Bad Request for malformed input, 401 Unauthorized for missing/invalid auth, 403 Forbidden for valid auth but insufficient permission, 404 Not Found, 409 Conflict for a state clash like a duplicate unique field). 5xx indicates the server failed (500 Internal Server Error, 503 Service Unavailable). Using these precisely lets clients branch on status code alone before ever inspecting the body.",
        },
        {
          heading: "Request/Response Body Design",
          body: "JSON is the default body format for modern REST APIs, and consistency across endpoints matters more than any specific convention chosen — pick one casing style (commonly camelCase for JSON) and use it everywhere, pick one date format (ISO 8601, e.g. 2026-09-18T14:30:00Z) and use it everywhere, and wrap list responses in a consistent envelope (e.g. { data: [...], meta: { total, page } }) rather than sometimes returning a bare array and sometimes an object. The Content-Type header (application/json) and, on the request side, honoring Accept headers for content negotiation, round out a well-behaved API.",
          code: {
            language: "javascript",
            code:
              "app.get(\"/api/students\", async (req, res) => {\n  const page = Number(req.query.page) || 1;\n  const limit = Math.min(Number(req.query.limit) || 20, 100);\n\n  const [students, total] = await Promise.all([\n    db.student.findMany({ skip: (page - 1) * limit, take: limit }),\n    db.student.count(),\n  ]);\n\n  res.status(200).json({\n    data: students,\n    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },\n  });\n});",
          },
        },
        {
          heading: "Pagination, Filtering, and Sorting",
          body: "Any endpoint that can return an unbounded number of records must be paginated — returning all 500,000 rows because nobody added a limit is a classic production incident waiting to happen. Offset-based pagination (?page=2&limit=20) is simple and sufficient for most admin/UI use cases; cursor-based pagination (?after=<opaque_cursor>) scales better for very large or frequently-changing datasets because it avoids the 'skipped or duplicated row' problem that occurs when rows are inserted/deleted between paginated requests using offsets. Filtering (?status=active) and sorting (?sort=-createdAt, with a - prefix for descending) should follow one consistent query-parameter convention across every collection endpoint in the API.",
        },
        {
          heading: "API Versioning Strategies",
          body: "Once an API has real consumers, you can't silently make a breaking change (removing a field, changing a type, renaming a route) without breaking them. The two dominant strategies are URI versioning (/api/v1/students, /api/v2/students) — simple, highly visible, but means maintaining parallel route trees — and header-based versioning (a custom Accept or API-Version header), which keeps URIs stable but is less discoverable and harder to test casually in a browser. Whichever is chosen, the real discipline is defining what counts as 'breaking' (removing/renaming a field, changing a type, changing status code semantics) versus safe to add without a version bump (adding a new optional field).",
        },
        {
          heading: "Error Response Design",
          body: "A consistent error shape lets every client handle failures the same way instead of writing bespoke parsing per endpoint. A good baseline includes a machine-readable error code, a human-readable message, and — for validation errors — a list of which specific fields failed and why. Stack traces and internal implementation details should never reach the client in production; they belong in server-side logs, not the response body, both because they leak information useful to an attacker and because they're meaningless to the API consumer.",
          code: {
            language: "json",
            code:
              "{\n  \"error\": {\n    \"code\": \"VALIDATION_ERROR\",\n    \"message\": \"Request failed validation\",\n    \"details\": [\n      { \"field\": \"email\", \"issue\": \"must be a valid email address\" }\n    ]\n  }\n}",
          },
        },
      ],
      commonPitfalls: [
        "Putting verbs in URIs (/getStudent, /createStudent) instead of letting the HTTP method carry the action.",
        "Returning 200 OK for failed requests with the actual error buried in the JSON body, forcing every client to parse the body to detect failure.",
        "Implementing PUT in a way that isn't idempotent (e.g. incrementing rather than replacing), which silently breaks safe client retries.",
        "Shipping a collection endpoint with no pagination at all, which works fine in testing and becomes an incident once the table has real production volume.",
        "Inconsistent casing or date formats across different endpoints in the same API, forcing clients to special-case each one.",
        "Making a breaking change to a live endpoint with no versioning strategy, breaking every existing consumer with no warning.",
        "Leaking stack traces or internal error details in API responses instead of logging them server-side and returning a generic client-safe message.",
      ],
      keyTakeaways: [
        "URIs name resources (nouns); HTTP methods express the action — mixing the two produces an API that's harder to predict.",
        "GET/PUT/DELETE should be idempotent; POST is not — client retry logic depends on this distinction being respected.",
        "Precise status codes let clients branch on the response before ever parsing the body.",
        "Any collection endpoint that can grow unbounded must be paginated from day one, not retrofitted after an incident.",
        "Decide your versioning and breaking-change policy before you have real API consumers, not after the first breaking change ships.",
        "Error responses should be consistent and client-safe; stack traces belong in logs, not in the HTTP response.",
      ],
      links: [
        { label: "MDN — HTTP Request Methods", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods" },
        { label: "MDN — HTTP Response Status Codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status" },
        { label: "Microsoft REST API Guidelines", url: "https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md" },
      ],
    },
    {
      moduleTitle: "Backend Module",
      subModuleTitle: "Authentication & authorization",
      overview:
        "Authentication answers 'who is this?' and authorization answers 'what are they allowed to do?' — two distinct problems that are easy to conflate but need to be reasoned about separately. This guide covers hashing passwords correctly (never storing them in plaintext or with a fast general-purpose hash), the trade-offs between session-based auth (server-tracked, cookie-referenced) and token-based auth (stateless JWTs), building role-based access control as reusable middleware, handling token expiry and refresh safely, and a brief grounding in OAuth2 for third-party login. Getting this layer wrong is one of the most common sources of real production security incidents, so the emphasis throughout is on the specific mistakes that turn a reasonable-looking auth implementation into an exploitable one.",
      sections: [
        {
          heading: "Authentication vs. Authorization",
          body: "Authentication (authn) verifies identity — logging in with a username/password, or presenting a valid token, proves you are who you claim to be. Authorization (authz) is a separate, subsequent question: given that verified identity, is this specific action on this specific resource allowed? A system can authenticate a user perfectly and still have a critical bug if it forgets to check authorization — for example, correctly verifying a JWT belongs to user 42, but then fetching /orders/99 without checking that order 99 actually belongs to user 42. Every protected route needs both checks, and they should be implemented as clearly separate steps, not tangled together.",
        },
        {
          heading: "Password Hashing",
          body: "Passwords must never be stored in plaintext or reversibly encrypted — they must be hashed with a slow, purpose-built algorithm (bcrypt, scrypt, or Argon2), never a fast general-purpose hash like MD5 or SHA-256, which are designed for speed and make brute-forcing billions of guesses per second trivial on modern hardware. bcrypt automatically generates and stores a random salt per password, meaning two users with the same password get completely different hashes — this defeats precomputed rainbow-table attacks. The 'cost factor' (rounds) controls how slow the hash is to compute, which is a deliberate, tunable trade-off against brute-force attempts.",
          code: {
            language: "javascript",
            code:
              "const bcrypt = require(\"bcrypt\");\n\nasync function registerUser(email, plainPassword) {\n  const passwordHash = await bcrypt.hash(plainPassword, 12); // cost factor 12\n  return db.user.create({ data: { email, passwordHash } });\n}\n\nasync function verifyLogin(email, plainPassword) {\n  const user = await db.user.findUnique({ where: { email } });\n  if (!user) return null;\n  const valid = await bcrypt.compare(plainPassword, user.passwordHash);\n  return valid ? user : null;\n}",
          },
        },
        {
          heading: "Session-Based Authentication",
          body: "In session-based auth, the server creates a session record (in memory, a database, or Redis) after a successful login, and sends the client an opaque session ID inside a cookie. On each subsequent request, the browser automatically attaches that cookie, and the server looks up the session to identify the user. This gives the server full control — a session can be instantly invalidated server-side (immediate logout, forced revocation) — but requires shared session storage across every server instance in a horizontally scaled deployment, since any instance might need to look up any session.",
        },
        {
          heading: "Token-Based Authentication with JWT",
          body: "A JSON Web Token packs claims (like user ID and role) into a signed, self-contained token that the server can verify without a database lookup, using a secret (HMAC) or public/private key pair (RSA/ECDSA). This statelessness makes JWTs attractive for horizontally scaled APIs and microservices — any server instance with the shared secret/public key can verify the token independently. The trade-off is that a JWT can't be individually revoked before its expiry without extra infrastructure (a denylist), since the server isn't tracking active tokens the way it tracks sessions — which is why short expiry times paired with a refresh-token flow are standard practice rather than issuing long-lived JWTs.",
          code: {
            language: "javascript",
            code:
              "const jwt = require(\"jsonwebtoken\");\n\nfunction issueToken(user) {\n  return jwt.sign(\n    { sub: user.id, role: user.role },\n    process.env.JWT_SECRET,\n    { expiresIn: \"15m\" }\n  );\n}\n\nfunction requireAuth(req, res, next) {\n  const authHeader = req.headers.authorization; // \"Bearer <token>\"\n  const token = authHeader?.split(\" \")[1];\n  if (!token) return res.status(401).json({ error: \"Missing token\" });\n\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch {\n    res.status(401).json({ error: \"Invalid or expired token\" });\n  }\n}",
          },
        },
        {
          heading: "Role-Based Access Control (RBAC) Middleware",
          body: "Once a request is authenticated (req.user populated by the auth middleware above), authorization middleware can check the user's role or permissions against what the route requires, and reject the request before the route handler's own business logic even runs. This keeps 'can this user do this?' logic centralized and declarative on the route definition, rather than scattered as ad hoc if-checks inside every handler.",
          code: {
            language: "javascript",
            code:
              "function requireRole(...allowedRoles) {\n  return (req, res, next) => {\n    if (!allowedRoles.includes(req.user.role)) {\n      return res.status(403).json({ error: \"Insufficient permissions\" });\n    }\n    next();\n  };\n}\n\napp.delete(\n  \"/api/students/:id\",\n  requireAuth,\n  requireRole(\"admin\"),\n  deleteStudentHandler\n);",
          },
        },
        {
          heading: "Refresh Tokens and Expiry",
          body: "Short-lived access tokens (minutes, not days) limit the damage window if one is stolen, but forcing a full re-login every 15 minutes would be unusable. The standard pattern pairs a short-lived access token with a long-lived refresh token, stored more securely (an httpOnly cookie, or server-side) and used only to request a new access token when the old one expires — never sent with every ordinary API request. Refresh tokens should be revocable server-side (stored in a database, checked and invalidated on logout or suspected compromise) since, unlike access tokens, they live long enough that revocability actually matters.",
        },
        {
          heading: "OAuth2 and Third-Party Login",
          body: "OAuth2 is a delegation protocol: it lets your app receive proof that a user authenticated with a trusted third party (Google, GitHub) without your app ever seeing that third party's password. The Authorization Code flow — the standard for a web app with a backend — redirects the user to the provider's login page, receives a short-lived authorization code back, and the app's backend exchanges that code (with a secret) for tokens, keeping the exchange off the client entirely. It's worth being explicit that OAuth2 by itself is about delegated authorization/authentication with a third party — your own app still needs its own session or token issued after that exchange completes to manage its own logged-in state.",
        },
      ],
      commonPitfalls: [
        "Storing passwords in plaintext or hashed with a fast general-purpose algorithm (MD5/SHA-256) instead of bcrypt/Argon2.",
        "Storing a JWT in localStorage, which is readable by any JavaScript running on the page — making it a direct target for XSS-based token theft.",
        "Issuing long-lived access tokens with no expiry, removing any practical way to revoke access if a token is compromised.",
        "Trusting a client-supplied user ID or role in the request body instead of deriving identity solely from the verified token/session.",
        "Confusing authentication with authorization — verifying who someone is but forgetting to check whether they're allowed to access the specific resource requested.",
        "Not invalidating sessions or refresh tokens on logout, leaving them usable until natural expiry even after the user explicitly logged out.",
        "Using cookie-based sessions without CSRF protection, since browsers attach cookies automatically to cross-site requests unless explicitly guarded against.",
      ],
      keyTakeaways: [
        "Hash passwords with bcrypt/Argon2, never store or reversibly encrypt them, and never use a fast general-purpose hash.",
        "Sessions are server-tracked and instantly revocable; JWTs are stateless and scale better but are hard to revoke before expiry.",
        "Authentication proves identity; authorization checks permission on a specific resource — both are required on every protected route.",
        "Pair short-lived access tokens with a revocable, longer-lived refresh token rather than issuing one long-lived token.",
        "Never trust client-supplied identity or role fields — always derive them from the verified token or session.",
        "OAuth2 delegates authentication to a trusted provider; your app still issues and manages its own session/token afterward.",
      ],
      links: [
        { label: "OWASP — Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
        { label: "jwt.io — Introduction to JSON Web Tokens", url: "https://jwt.io/introduction" },
        { label: "Auth0 — OAuth 2.0 Authorization Code Flow", url: "https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow" },
      ],
    },
    {
      moduleTitle: "Backend Module",
      subModuleTitle: "Middleware & error handling",
      overview:
        "Middleware is the mechanism that turns a web framework from a single request handler into a pipeline of composable, single-purpose functions — logging, parsing, authentication, and business logic all plug in as separate stages. This guide walks through what middleware actually is in the request-response cycle, how to write custom middleware and reason about execution order (which is a frequent source of subtle bugs), and — critically — how to centralize error handling so failures are caught, logged, and returned consistently rather than crashing the process or leaking internals. Special attention goes to the specific trap of async errors in Express, which don't behave the way synchronous errors do and silently disappear unless handled deliberately.",
      sections: [
        {
          heading: "What Middleware Is and the Request-Response Cycle",
          body: "In a framework like Express, a middleware function receives the request, response, and a next() function, and sits in a chain that a request passes through before reaching its final route handler. Each middleware can inspect or modify the request/response, end the cycle by sending a response, or call next() to pass control to the next function in the chain. This design lets cross-cutting concerns (logging every request, parsing JSON bodies, checking authentication) live as independent, reusable functions instead of being copy-pasted into every route handler.",
        },
        {
          heading: "Built-in and Third-Party Middleware",
          body: "Most Express apps compose a handful of well-known middleware before any custom logic: express.json() parses JSON request bodies into req.body, cors handles cross-origin request headers, helmet sets a batch of security-related HTTP headers, and morgan logs each incoming request. Reaching for a well-maintained package for these common, well-understood concerns is almost always better than hand-rolling them, since the edge cases (character encoding, header spec compliance, security header nuances) have already been solved and battle-tested.",
        },
        {
          heading: "Writing Custom Middleware",
          body: "Custom middleware follows the same (req, res, next) signature and is where app-specific cross-cutting logic lives: request logging with timing, attaching a request ID for tracing, or validating a header present on every request. Forgetting to call next() (when the middleware isn't itself ending the response) is the most common bug — the request simply hangs forever with no error, since nothing downstream is ever invoked.",
          code: {
            language: "javascript",
            code:
              "function requestLogger(req, res, next) {\n  const start = Date.now();\n  res.on(\"finish\", () => {\n    const ms = Date.now() - start;\n    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);\n  });\n  next(); // MUST be called or the request hangs\n}\n\napp.use(requestLogger);",
          },
        },
        {
          heading: "Middleware Order Matters",
          body: "Middleware executes in the exact order it's registered with app.use()/app.get() etc. — this isn't a stylistic preference, it changes behavior. Body-parsing middleware (express.json()) must run before any route handler that reads req.body, or req.body will be undefined. Authentication middleware must run before authorization middleware, which must run before the route handler doing the actual work. And error-handling middleware — a special case covered next — must be registered last, after every other app.use() and route definition, or it will never catch errors thrown by things registered after it.",
        },
        {
          heading: "Centralized Error-Handling Middleware",
          body: "Express recognizes error-handling middleware by its distinct four-argument signature (err, req, res, next) and routes any error passed to next(err) — from anywhere in the app — directly to it, skipping all normal middleware in between. Centralizing error handling this way means every route can fail consistently: log the error once, decide the right status code, and return a client-safe error body, without duplicating that logic in every single route handler.",
          code: {
            language: "javascript",
            code:
              "// Must be registered AFTER all routes and other middleware\nfunction errorHandler(err, req, res, next) {\n  console.error(err); // full details go to server logs\n\n  const status = err.statusCode || 500;\n  const message = status === 500 ? \"Internal server error\" : err.message;\n\n  res.status(status).json({ error: { message } }); // client-safe body only\n}\n\napp.use(errorHandler);",
          },
        },
        {
          heading: "Handling Async Errors Correctly",
          body: "Express's built-in error handling only automatically catches errors thrown synchronously inside a route handler. An error thrown inside an async function's rejected Promise (e.g. an await'd database call that fails) does not automatically reach the error-handling middleware in older Express versions — it needs to be caught and explicitly forwarded with next(err), or the request hangs with an unhandled rejection and no response is ever sent to the client. A small wrapper utility that catches rejected promises and forwards them to next() is the standard fix, avoiding a repetitive try/catch in every single async route.",
          code: {
            language: "javascript",
            code:
              "function asyncHandler(fn) {\n  return (req, res, next) => {\n    Promise.resolve(fn(req, res, next)).catch(next);\n  };\n}\n\napp.get(\"/api/students/:id\", asyncHandler(async (req, res) => {\n  const student = await db.student.findUnique({ where: { id: req.params.id } });\n  if (!student) {\n    const err = new Error(\"Student not found\");\n    err.statusCode = 404;\n    throw err; // caught by asyncHandler, forwarded to errorHandler\n  }\n  res.json(student);\n}));",
          },
        },
        {
          heading: "Validation as Middleware",
          body: "Input validation is a natural fit for middleware, since it's a cross-cutting concern that should run before a route handler ever executes its business logic. Libraries like Zod or Joi let you define a schema once and validate req.body/req.query/req.params against it in a single reusable middleware, rejecting malformed requests with a clear 400 response before any database call or business logic runs — rather than scattering ad hoc if-checks throughout the handler, or worse, letting invalid data reach the database layer.",
        },
      ],
      commonPitfalls: [
        "Forgetting to call next() in a middleware that isn't ending the response, causing the request to hang indefinitely with no error surfaced.",
        "Registering error-handling middleware before other routes/middleware instead of last, so it never catches errors from anything registered after it.",
        "Not catching rejected promises in async route handlers, leaving requests hanging with unhandled rejections and no response sent.",
        "Registering body-parsing middleware after the routes that need req.body, so req.body is undefined in those handlers.",
        "Building one large middleware that does logging, auth, and validation all at once instead of small, single-purpose, composable ones.",
        "Returning raw error.stack or internal exception details to the client instead of a generic, client-safe error message.",
        "Not distinguishing operational errors (expected, like 'not found' or bad input) from programmer errors (bugs) when deciding what to log versus what to alert on.",
      ],
      keyTakeaways: [
        "Middleware forms an ordered pipeline; execution order changes behavior, not just readability.",
        "Body-parsing must run before handlers that read req.body; auth must run before authorization; error handlers must be registered last.",
        "Express only auto-catches synchronous errors — async/Promise-based errors must be explicitly forwarded to next(err).",
        "Centralized error-handling middleware keeps logging and client-facing error shape consistent across every route.",
        "Never return raw stack traces or internal error details to API clients — log them server-side and return a generic, safe message.",
        "Validation belongs in middleware, running before business logic, not scattered as inline checks inside handlers.",
      ],
      links: [
        { label: "Express — Using Middleware", url: "https://expressjs.com/en/guide/using-middleware.html" },
        { label: "Express — Error Handling", url: "https://expressjs.com/en/guide/error-handling.html" },
        { label: "Node.js Docs — Error Handling Best Practices", url: "https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs" },
      ],
    },
    {
      moduleTitle: "Backend Module",
      subModuleTitle: "Server architecture basics",
      overview:
        "How a backend codebase is organized determines whether adding a feature six months from now takes an hour or a day. This guide covers layered architecture — separating routes, controllers, business logic (services), and data access into distinct layers with clear responsibilities — the classic MVC pattern as applied to backend APIs (as opposed to server-rendered pages), the trade-offs between a monolith and microservices, why statelessness is what actually enables horizontal scaling, and the supporting practices (configuration management, structured logging) that make a service operable in production rather than just functional on a laptop. The throughline is separation of concerns: each layer should be replaceable and independently testable without dragging the others along with it.",
      sections: [
        {
          heading: "Layered Architecture: Routes, Controllers, Services, Data Access",
          body: "A common and effective structure splits a backend into four layers with a strict one-directional dependency: routes map an HTTP method+path to a controller function; controllers translate an HTTP request into a call to business logic and translate the result back into an HTTP response (status code, JSON shape) — they should contain no actual business rules; services hold the actual business logic, independent of HTTP entirely (so they're callable from a route, a background job, or a test with no framework involved); and the data access layer (repositories, or an ORM directly) is the only layer that talks to the database. A route handler that directly runs a SQL query and does business logic in the same function collapses all four layers into one, which is fast to write initially and painful to test or change later.",
          code: {
            language: "javascript",
            code:
              "// routes/students.js\nrouter.post(\"/students\", asyncHandler(studentController.create));\n\n// controllers/studentController.js\nasync function create(req, res) {\n  const student = await studentService.registerStudent(req.body);\n  res.status(201).json(student);\n}\n\n// services/studentService.js — no req/res, no HTTP knowledge\nasync function registerStudent(input) {\n  if (await studentRepo.findByEmail(input.email)) {\n    throw new ConflictError(\"Email already registered\");\n  }\n  return studentRepo.create(input);\n}",
          },
        },
        {
          heading: "MVC in a Backend/API Context",
          body: "Model-View-Controller predates REST APIs and originally described server-rendered pages, where the View literally rendered HTML. In a JSON API, there's no traditional view template — the 'view' is effectively the JSON serialization of the response, and the Model is the data layer (often the ORM models directly). The Controller role maps closely onto the controller layer described above. Understanding this mapping matters because 'MVC' shows up constantly in framework documentation and job descriptions, and knowing that the View concept has simply been replaced by response serialization in an API context avoids confusion when a framework's folder structure doesn't obviously match the classic diagram.",
        },
        {
          heading: "Monolith vs. Microservices",
          body: "A monolith deploys the entire application (all features, all domains) as a single unit with a single codebase and typically a single database — simpler to develop, test, and deploy when a team and domain are still small, since there's no network call between 'services' that live in the same process. Microservices split the application into independently deployable services, each owning its own data, communicating over the network (HTTP/gRPC/message queues) — this buys independent scaling and deployment per service, at the direct cost of distributed-systems complexity: network failures, data consistency across services, and significantly more operational overhead. The common, well-supported advice is to start with a well-organized monolith and split out services only once a specific, demonstrated need (team scaling boundaries, wildly different scaling requirements between components) justifies the added complexity.",
        },
        {
          heading: "Statelessness and Horizontal Scaling",
          body: "A stateless server keeps no request-specific data in its own memory between requests — anything that needs to persist (session data, uploaded files, cached values) lives in a shared external store (a database, Redis, object storage) that every server instance can access equally. This is what makes horizontal scaling (running multiple identical server instances behind a load balancer) actually work: a load balancer can route any request to any instance interchangeably, because no instance holds state that only it knows about. Storing session data in a server's local memory is the classic violation — it works fine with one server instance and breaks unpredictably the moment a second instance is added, since a user's session might only exist on the instance that handled their login.",
        },
        {
          heading: "Configuration and Dependency Injection",
          body: "Configuration (database URLs, API keys, feature flags, timeouts) should be injected into the application at startup — typically from environment variables — rather than hardcoded, so the exact same codebase runs correctly across development, staging, and production by changing only its configuration, never its code. Dependency injection (passing a service's dependencies, like a database client, into it explicitly rather than having it construct or import them directly) is what makes services testable in isolation — a unit test can inject a fake/mock database client instead of requiring a real database connection just to test business logic.",
        },
        {
          heading: "Logging and Observability Basics",
          body: "Scattered console.log statements are adequate for local development but inadequate in production, where you need to search, filter, and correlate logs across potentially many server instances handling concurrent requests. Structured logging (emitting logs as JSON with consistent fields — timestamp, request ID, severity level, message) rather than free-form text makes logs queryable in a log aggregation tool. Attaching a unique request ID to each incoming request (generated at the very first middleware and threaded through every subsequent log line for that request) is what lets you reconstruct the full story of one specific request across multiple log lines and, in a microservices setup, across multiple services.",
        },
        {
          heading: "Separating Concerns for Testability",
          body: "The entire point of the layered structure discussed above is testability: business logic in the service layer, with no HTTP or database code mixed in, can be unit-tested by calling functions directly with plain JavaScript objects and mock dependencies — no test server, no test database, no network involved, making these tests fast and reliable. Controllers and routes are thin enough that they're usually covered by a smaller number of integration tests that verify the HTTP contract (status codes, response shape) rather than re-testing business rules already covered at the service layer. Tangling business logic directly into route handlers forces every test to go through the full HTTP + database stack just to verify a single business rule, making the test suite slow and brittle.",
        },
      ],
      commonPitfalls: [
        "Writing business logic directly inside route handlers, making it untestable without spinning up a full HTTP server and database.",
        "Storing session or other per-user state in a server instance's local memory, which silently breaks once a second instance is added behind a load balancer.",
        "Adopting a microservices architecture before the team or domain actually needs the independent scaling/deployment it trades complexity for.",
        "Hardcoding configuration values (URLs, keys, timeouts) directly in code instead of injecting them via environment variables.",
        "Tight coupling between layers (e.g. a service function directly constructing its own database client) that makes unit testing require a real database connection.",
        "Using unstructured console.log statements in production instead of structured, queryable logs with request-level correlation IDs.",
        "Letting circular dependencies form between modules/layers, making the codebase's actual dependency graph hard to reason about.",
      ],
      keyTakeaways: [
        "Layered architecture (routes → controllers → services → data access) keeps business logic independently testable and framework-agnostic.",
        "In an API context, MVC's 'View' is effectively the JSON response shape, not an HTML template.",
        "Start with a well-organized monolith; split into microservices only once a specific, demonstrated need justifies the added distributed-systems complexity.",
        "Statelessness — no per-user data held in server memory — is the prerequisite for horizontal scaling to work at all.",
        "Inject configuration via environment variables so the same code runs correctly across every environment.",
        "Structured logging with request-correlation IDs is what makes production issues debuggable across concurrent requests and multiple instances.",
      ],
      links: [
        { label: "Martin Fowler — Microservices", url: "https://martinfowler.com/articles/microservices.html" },
        { label: "The Twelve-Factor App", url: "https://12factor.net/" },
        { label: "Node.js Best Practices (GitHub)", url: "https://github.com/goldbergyoni/nodebestpractices" },
      ],
    },

    // ===================== DATABASE MODULE =====================
    {
      moduleTitle: "Database Module",
      subModuleTitle: "Relational vs. NoSQL modeling",
      overview:
        "Choosing between a relational database and a NoSQL document store is a modeling decision, not a popularity contest — the two paradigms make different trade-offs around consistency, schema flexibility, and how relationships between data are represented. This guide covers relational normalization and referential integrity through foreign keys, document modeling with the core embed-vs-reference decision that governs most MongoDB schema design, a practical (not purely academic) framing of the CAP theorem, and concrete guidance for choosing between the two — including the reality that most serious production systems end up using more than one data store for different purposes (polyglot persistence) rather than forcing every kind of data into a single database technology.",
      sections: [
        {
          heading: "Relational Modeling and Normalization",
          body: "Normalization organizes relational data to minimize redundancy: instead of repeating a student's name and email on every row of an enrollments table, you store student data once in a students table and reference it by ID from enrollments. Third normal form (3NF) — the practical target for most OLTP schemas — requires that every non-key column depends on the whole primary key and nothing but the key, eliminating both duplicate data and the update anomalies that come with it (e.g., updating a student's email in one row of a denormalized table while forgetting three other rows that still show the old one).",
        },
        {
          heading: "Foreign Keys and Referential Integrity",
          body: "A foreign key constraint declares that a column's value must match an existing value in another table's key column, and the database itself enforces this — it will reject an insert that references a non-existent parent row, and it will act according to a declared ON DELETE policy (CASCADE, SET NULL, RESTRICT) when a referenced row is deleted. This is what prevents 'orphaned' data (an enrollment row pointing to a student_id that no longer exists) at the database layer, rather than relying on every piece of application code to remember to check this manually.",
          code: {
            language: "sql",
            code:
              "CREATE TABLE students (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);\n\nCREATE TABLE enrollments (\n  id SERIAL PRIMARY KEY,\n  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,\n  course_id INTEGER NOT NULL REFERENCES courses(id),\n  enrolled_at TIMESTAMP DEFAULT NOW()\n);\n-- Deleting a student automatically removes their enrollments (CASCADE)",
          },
        },
        {
          heading: "Document Modeling in NoSQL",
          body: "A document database like MongoDB stores each record as a self-contained, typically JSON-like document, and doesn't enforce a schema across documents in the same collection the way a relational table enforces column types across all rows. This flexibility is well-suited to data with a naturally nested, hierarchical, or evolving shape — a student profile with an arbitrary, growing list of certifications, for instance — where a relational schema would otherwise require several joined tables just to reconstruct one logical record.",
          code: {
            language: "json",
            code:
              "{\n  \"_id\": \"665f1a2b3c4d5e6f7a8b9c0d\",\n  \"name\": \"Aisha Khan\",\n  \"email\": \"aisha@example.com\",\n  \"enrollments\": [\n    { \"courseId\": \"fsd-2026\", \"enrolledAt\": \"2026-01-15\", \"status\": \"active\" }\n  ]\n}",
          },
        },
        {
          heading: "Embedding vs. Referencing in Document Databases",
          body: "The single most consequential decision in document modeling is whether related data lives embedded inside the parent document or in a separate collection referenced by ID. Embed when the related data is always accessed together with its parent, is bounded in size, and doesn't need to be queried independently — a student's address, for example. Reference (store an ID and look it up separately, similar to a foreign key) when the related data is large, unbounded, shared across multiple parents, or frequently queried on its own — a student's enrollments across potentially hundreds of courses, for instance, which would otherwise make the student document grow without bound and force rewriting the entire document on every new enrollment.",
          bullets: [
            "MongoDB documents have a hard 16MB size limit — an unbounded embedded array (e.g., logging every login event inside a user document) can eventually hit it.",
            "Data that needs to be queried or updated independently of its 'parent' (e.g., searching all enrollments across all students) is a strong signal to reference rather than embed.",
          ],
        },
        {
          heading: "The CAP Theorem in Practice",
          body: "The CAP theorem states that a distributed data system can only fully guarantee two of three properties during a network partition: Consistency (every read gets the latest write), Availability (every request gets a response, even if not the latest data), and Partition tolerance (the system keeps working despite network failures between nodes). Since network partitions do happen in real distributed systems, partition tolerance isn't really optional — the practical trade-off most engineers actually face day to day is CP vs. AP: does this specific piece of data need to always be perfectly up to date even if that means some requests fail during a partition (CP — typical for financial balances), or is it acceptable to serve slightly stale data to keep the system always responsive (AP — typical for a social media feed or product view count)?",
        },
        {
          heading: "When to Choose Relational vs. NoSQL",
          body: "Relational databases fit best when data has clear, stable structure and relationships, when strong consistency and transactional guarantees across multiple related records matter (a payment and the order it's tied to must both succeed or both fail), and when you'll need to query across relationships in ways you can't fully predict at design time (SQL's flexibility here is a real advantage). Document databases fit best when the schema is naturally variable or evolving, when the primary access pattern is 'fetch one big document by ID' rather than complex cross-entity joins, and when horizontal write scaling across many servers matters more than strict cross-record consistency.",
        },
        {
          heading: "Hybrid and Polyglot Persistence",
          body: "Most non-trivial production systems don't force every kind of data into one database technology — a typical setup might use a relational database (Postgres) for core transactional data (users, orders, payments) where consistency and relationships matter most, alongside a document store or search index for a specific workload it's better suited to (a product catalog with wildly varying attributes per category, or full-text search), and a cache (Redis) for hot, frequently-read data. This 'polyglot persistence' approach trades some operational complexity (more systems to run and keep in sync) for using each tool where it's actually strongest.",
        },
      ],
      commonPitfalls: [
        "Over-normalizing a read-heavy OLTP schema to the point where common queries require six or seven joins for data that's almost always read together.",
        "Modeling a document database exactly like a relational one, with many small referenced collections, which defeats the point of embedding and forces application-level joins MongoDB isn't optimized for.",
        "Embedding an array that can grow unbounded (e.g. an activity log) directly inside a parent document, risking hitting the 16MB document size limit.",
        "Ignoring referential integrity in a NoSQL store because 'there's no foreign key constraint,' leading to silently orphaned references over time.",
        "Choosing NoSQL purely because it 'scales better' without actually needing schema flexibility or that specific scaling profile, then fighting the lack of joins and transactions later.",
        "Not planning for schema evolution in a schemaless database, leading to a collection with wildly inconsistent document shapes across old and new records.",
      ],
      keyTakeaways: [
        "Normalization eliminates redundancy and update anomalies; foreign keys enforce referential integrity at the database layer, not just in application code.",
        "In document modeling, embed for data always accessed together and bounded in size; reference for large, shared, or independently-queried data.",
        "CAP theorem trade-offs matter mainly during network partitions — the practical day-to-day question is usually CP (always-correct) vs. AP (always-available).",
        "Relational fits stable, relationship-heavy data needing strong consistency; document stores fit variable, document-shaped data with simple access patterns.",
        "Most real production systems use more than one data store, each for the workload it's best suited to, rather than one database for everything.",
      ],
      links: [
        { label: "PostgreSQL Docs — Normalization", url: "https://www.postgresql.org/docs/current/tutorial-normalization.html" },
        { label: "MongoDB — Data Modeling: Embedding vs Referencing", url: "https://www.mongodb.com/docs/manual/core/data-modeling-introduction/" },
        { label: "MongoDB — Building With Patterns (Schema Design)", url: "https://www.mongodb.com/developer/products/mongodb/schema-design-anti-patterns-summary/" },
      ],
    },
    {
      moduleTitle: "Database Module",
      subModuleTitle: "Query design",
      overview:
        "Writing SQL that returns correct results is the easy half of query design; writing SQL that returns correct results efficiently, at production data volumes, is the part that separates a query that works in a demo from one that takes a service down under real load. This guide covers filtering and joins, aggregation semantics (the WHERE vs. HAVING distinction that trips up most learners), the choice between subqueries and CTEs for readability, the notorious N+1 query problem that ORMs make easy to accidentally introduce, using EXPLAIN to understand what the database is actually doing with your query, and parameterized queries as the non-negotiable defense against SQL injection.",
      sections: [
        {
          heading: "SELECT Fundamentals and Filtering",
          body: "A SELECT statement's clauses execute in a specific logical order that doesn't match the order you write them in: FROM/JOIN first, then WHERE (filtering individual rows), then GROUP BY, then HAVING (filtering grouped results), then SELECT (choosing/computing output columns), then ORDER BY, then LIMIT. Understanding this order explains behavior that otherwise seems confusing — for instance, why you can't reference a column alias defined in SELECT inside the same query's WHERE clause in most databases (WHERE is evaluated before SELECT computes that alias).",
        },
        {
          heading: "JOINs and Their Semantics",
          body: "An INNER JOIN returns only rows that have a match in both tables — a student with zero enrollments would simply be excluded from a join between students and enrollments. A LEFT JOIN returns every row from the left table regardless of whether a match exists on the right, filling unmatched columns with NULL — the correct choice when you need 'all students, and their enrollments if any.' Choosing the wrong join type is a common source of quietly incorrect results: an INNER JOIN silently dropping rows you actually needed to see (with NULLs) is a very common real bug, not a hypothetical one.",
          code: {
            language: "sql",
            code:
              "-- All students and their enrollment count, including students with zero enrollments\nSELECT s.id, s.name, COUNT(e.id) AS enrollment_count\nFROM students s\nLEFT JOIN enrollments e ON e.student_id = s.id\nGROUP BY s.id, s.name\nHAVING COUNT(e.id) > 0  -- only students with at least one enrollment\nORDER BY enrollment_count DESC;",
          },
        },
        {
          heading: "Aggregation: GROUP BY and HAVING",
          body: "GROUP BY collapses rows sharing the same value(s) in specified columns into a single row per group, at which point aggregate functions (COUNT, SUM, AVG, MAX, MIN) operate on each group rather than the whole table. WHERE filters individual rows before grouping happens; HAVING filters entire groups after aggregation, which is why 'only show courses with more than 10 enrolled students' requires HAVING COUNT(*) > 10 — WHERE cannot reference an aggregate result because it runs before aggregation exists.",
        },
        {
          heading: "Subqueries vs. CTEs",
          body: "A subquery nests one query inside another, either in the WHERE clause (to filter using a computed set of values) or in the FROM clause (treating a query's result as a temporary table). A Common Table Expression (WITH clause) achieves the same thing but names the intermediate result and can be referenced multiple times in the outer query, and — critically for readability — lets you build a query as a sequence of clearly named logical steps instead of deeply nested parentheses. For queries with more than one or two levels of nesting, CTEs are almost always more maintainable.",
          code: {
            language: "sql",
            code:
              "WITH active_students AS (\n  SELECT id, name FROM students WHERE status = 'active'\n),\nrecent_enrollments AS (\n  SELECT student_id, COUNT(*) AS cnt\n  FROM enrollments\n  WHERE enrolled_at > NOW() - INTERVAL '30 days'\n  GROUP BY student_id\n)\nSELECT a.name, COALESCE(r.cnt, 0) AS enrollments_last_30d\nFROM active_students a\nLEFT JOIN recent_enrollments r ON r.student_id = a.id;",
          },
        },
        {
          heading: "The N+1 Query Problem",
          body: "The N+1 problem occurs when code fetches a list of N records with one query, then loops over them and issues a separate query per record to fetch related data — resulting in 1 + N total queries instead of 2. This is extremely easy to introduce accidentally through an ORM's lazy-loaded relations (accessing student.enrollments inside a loop over 500 students triggers 500 separate queries). The fix is eager loading — a single JOIN or a single batched IN (...) query that fetches all the related data for the entire list up front, which every mainstream ORM supports explicitly (it's just not the default).",
          code: {
            language: "javascript",
            code:
              "// N+1: one query per student inside the loop\nconst students = await db.student.findMany();\nfor (const s of students) {\n  s.enrollments = await db.enrollment.findMany({ where: { studentId: s.id } });\n}\n\n// Fixed: a single query with eager loading\nconst studentsWithEnrollments = await db.student.findMany({\n  include: { enrollments: true },\n});",
          },
        },
        {
          heading: "Reading Query Plans with EXPLAIN",
          body: "EXPLAIN (and EXPLAIN ANALYZE, which actually runs the query and reports real timing) shows the execution plan the database chose: whether it used an index or scanned the whole table (a 'sequential scan' on a large table is usually the first red flag), the estimated versus actual number of rows at each step, and where the majority of time is being spent. Making a habit of running EXPLAIN on any query touching a large table before shipping it — rather than only after a production slowdown is reported — catches most performance problems while they're still cheap to fix.",
        },
        {
          heading: "Parameterized Queries and SQL Injection",
          body: "Building a SQL string by concatenating raw user input directly into it is the source of SQL injection, one of the longest-standing and most damaging classes of web vulnerabilities — a crafted input value can terminate the intended query and append arbitrary additional SQL. Parameterized queries (placeholders like $1 or ? that the database driver binds values to separately from the query structure) close this off entirely, because user input is never treated as executable SQL syntax, only ever as a literal value. Every mainstream database driver and ORM supports parameterization, and there is essentially never a legitimate reason to string-concatenate user input into a raw query.",
          code: {
            language: "javascript",
            code:
              "// VULNERABLE: user input concatenated directly into SQL\nconst bad = `SELECT * FROM students WHERE email = '${userInput}'`;\n\n// SAFE: parameterized — userInput is always treated as a value, never as SQL\nconst safe = await db.query(\"SELECT * FROM students WHERE email = $1\", [userInput]);",
          },
        },
      ],
      commonPitfalls: [
        "Introducing N+1 queries by accessing an ORM's lazy-loaded relation inside a loop instead of eager-loading it up front.",
        "Using SELECT * in production code, pulling unnecessary columns across the network and making the query more fragile to schema changes.",
        "Confusing WHERE and HAVING — trying to filter on an aggregate value in WHERE, which runs before aggregation exists.",
        "Choosing INNER JOIN when a LEFT JOIN was needed, silently dropping rows that had no match instead of showing them with NULLs.",
        "Building SQL queries via string concatenation of user input instead of using parameterized queries, opening a SQL injection vulnerability.",
        "Shipping a query against a large table without ever running EXPLAIN to check whether it's actually using an index.",
        "Writing a correlated subquery that re-executes once per outer row when a JOIN or a single aggregated subquery would compute the same result far more efficiently.",
      ],
      keyTakeaways: [
        "SQL's logical execution order (FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT) explains most 'why can't I do this' query confusions.",
        "WHERE filters rows before grouping; HAVING filters groups after aggregation — they are not interchangeable.",
        "The N+1 problem is an ORM-era default trap; eager loading (a single batched query) is the fix, and it's opt-in in every mainstream ORM.",
        "EXPLAIN/EXPLAIN ANALYZE should be a routine check on any query touching a large table, not just a debugging tool used after an incident.",
        "Parameterized queries are the non-negotiable defense against SQL injection — never build queries via string concatenation of user input.",
        "CTEs (WITH clauses) generally beat deeply nested subqueries for readability once a query has more than one logical step.",
      ],
      links: [
        { label: "PostgreSQL Docs — The EXPLAIN Command", url: "https://www.postgresql.org/docs/current/using-explain.html" },
        { label: "MDN — Using Prepared Statements (SQL Injection Prevention)", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SQL_Injection" },
        { label: "PostgreSQL Docs — WITH Queries (CTEs)", url: "https://www.postgresql.org/docs/current/queries-with.html" },
      ],
    },
    {
      moduleTitle: "Database Module",
      subModuleTitle: "Indexing & performance basics",
      overview:
        "An index is the single highest-leverage tool for making a slow query fast, and also one of the easiest things to misuse by over-applying — every index added speeds up certain reads while adding overhead to every write. This guide explains how the B-tree index structure that underlies most database indexes actually works, the difference between a clustered primary key and secondary indexes, when an index genuinely helps a query (and the common cases where it silently doesn't, even though it exists), how column order in a composite index changes which queries it can serve, covering indexes that avoid a table lookup entirely, and the ongoing cost indexes impose on every write — closing with a practical process for actually diagnosing a slow query rather than guessing.",
      sections: [
        {
          heading: "How B-Tree Indexes Work",
          body: "Most general-purpose database indexes are B-tree (balanced tree) structures: a sorted, hierarchical structure that lets the database find a specific value, or a range of values, in roughly logarithmic time instead of scanning every row. Without an index, finding a row matching a WHERE condition requires a sequential scan — reading every single row in the table to check if it matches, which scales linearly with table size and becomes painfully slow on large tables. An index on the filtered column lets the database jump almost directly to the matching rows instead.",
        },
        {
          heading: "Primary Keys and Clustered Indexes",
          body: "A primary key is automatically indexed and, in many database engines (including PostgreSQL's default table structure and MySQL's InnoDB), determines the physical or logical ordering the table's data is stored in — a clustered index. Every additional index you create beyond the primary key is a secondary index: a separate structure mapping indexed column values to the location of the actual row, meaning a lookup through a secondary index typically involves an extra step (finding the row's location, then fetching it) compared to a lookup that can be satisfied by the clustered index alone.",
        },
        {
          heading: "When an Index Helps (and When It Doesn't)",
          body: "An index helps queries that filter (WHERE), join (ON), or sort (ORDER BY) on the indexed column(s) — assuming the query is selective enough that using the index is actually cheaper than scanning the table (for a column where most rows match, like a boolean with 90% true values, a sequential scan can be faster than random-access index lookups for that many rows). An index does not help when a function or expression wraps the indexed column in the query (WHERE LOWER(email) = ... won't use a plain index on email), when the query filters on a different column than what's indexed, or on very small tables where a full scan is already essentially instant.",
          code: {
            language: "sql",
            code:
              "-- This index won't be used because LOWER() wraps the column:\nSELECT * FROM students WHERE LOWER(email) = 'aisha@example.com';\n\n-- Fix: index the expression itself\nCREATE INDEX idx_students_email_lower ON students (LOWER(email));",
          },
        },
        {
          heading: "Composite Indexes and Column Order",
          body: "A composite (multi-column) index is built as a single sorted structure across multiple columns in a specific declared order, and that order determines which queries it can actually serve — it behaves like a phone book sorted by last name then first name: you can efficiently find 'Smith', or 'Smith, John', but you cannot efficiently find everyone with first name 'John' regardless of last name using that same structure. The rule of thumb: put the column used for equality filtering first, and the column used for range filtering or sorting last — a composite index on (status, created_at) efficiently serves WHERE status = 'active' ORDER BY created_at, but a query filtering only on created_at can't use it at all.",
          code: {
            language: "sql",
            code:
              "CREATE INDEX idx_enrollments_student_status ON enrollments (student_id, status);\n\n-- Uses the index efficiently (matches column order):\nSELECT * FROM enrollments WHERE student_id = 42 AND status = 'active';\n\n-- Cannot use this index efficiently (skips the leading column):\nSELECT * FROM enrollments WHERE status = 'active';",
          },
        },
        {
          heading: "Covering Indexes",
          body: "A covering index includes every column a query needs — both the filtered/sorted columns and the columns being selected — so the database can satisfy the entire query directly from the index itself, without a second lookup back to the actual table row (sometimes called avoiding a 'bookmark lookup' or achieving an 'index-only scan'). This is a meaningful performance win for hot, frequently-run queries, at the cost of a larger index that duplicates more column data and adds more write overhead — making it a deliberate optimization for specific known-hot queries, not a default to apply everywhere.",
        },
        {
          heading: "Index Maintenance Cost on Writes",
          body: "Every index on a table must be updated on every INSERT, UPDATE (of an indexed column), and DELETE — meaning each additional index makes writes slightly slower and consumes additional storage, permanently. A table with fifteen indexes because every column that might ever be filtered on got one is a very common real-world performance anti-pattern: it looks harmless in read-focused testing and quietly cripples write throughput in production. The right number of indexes is driven by actual, observed query patterns — not by indexing every column defensively.",
        },
        {
          heading: "Diagnosing a Slow Query",
          body: "The reliable process is: identify the actual slow query (via slow query logs or application-level timing, not guessing), run EXPLAIN ANALYZE on it to see the real execution plan and where time is actually being spent, check whether a sequential scan is happening where an index lookup was expected, and check whether an existing index isn't being used because of a wrapped column, a mismatched composite index column order, or low selectivity. Adding an index should be a response to this kind of concrete diagnosis, not a first reflex applied to every column that appears in a WHERE clause somewhere in the codebase.",
        },
      ],
      commonPitfalls: [
        "Adding an index to every column 'just in case,' which slows down every write without meaningfully helping reads that never filter or sort on that column.",
        "Wrapping an indexed column in a function in the query (LOWER(), DATE(), etc.) without an expression index, silently preventing the existing index from being used.",
        "Getting composite index column order wrong — putting a range-filtered or rarely-used column first, making the index unusable for the query's actual equality filter.",
        "Indexing a low-cardinality column (like a boolean or a status with only two or three values) and expecting a large performance gain that a sequential scan often matches anyway.",
        "Never revisiting index usage over time — accumulating unused indexes from queries that were removed or changed long ago, still silently taxing every write.",
        "Assuming an index fixes any slow query regardless of the query's actual shape, instead of running EXPLAIN to check what's really happening.",
      ],
      keyTakeaways: [
        "Indexes trade faster reads for slower writes and more storage — they are not a free performance upgrade to apply everywhere.",
        "A composite index's column order determines which queries it can serve — equality columns first, range/sort columns last is the standard heuristic.",
        "Wrapping an indexed column in a function in a WHERE clause defeats a plain index unless an expression index exists for that exact expression.",
        "EXPLAIN ANALYZE is how you verify whether an index is actually being used, rather than assuming it is because it exists.",
        "Low-cardinality columns often don't benefit meaningfully from indexing, since a sequential scan can be just as fast when most rows match anyway.",
        "Let real, observed query patterns drive which indexes exist — not defensive indexing of every column that could theoretically be filtered on.",
      ],
      links: [
        { label: "PostgreSQL Docs — Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" },
        { label: "Use The Index, Luke — SQL Indexing Guide", url: "https://use-the-index-luke.com/" },
        { label: "PostgreSQL Docs — Multicolumn Indexes", url: "https://www.postgresql.org/docs/current/indexes-multicolumn.html" },
      ],
    },
    {
      moduleTitle: "Database Module",
      subModuleTitle: "ORMs",
      overview:
        "An Object-Relational Mapper lets application code work with database records as ordinary objects (or typed models) instead of writing raw SQL strings for every operation, and modern ORMs like Prisma, Sequelize, and TypeORM add schema definitions, migrations, and relationship handling on top of that core mapping. This guide covers what problem ORMs actually solve, how models and migrations version a schema over time, how relationships (one-to-many, many-to-many) are declared and queried, the eager-vs-lazy loading distinction that's central to avoiding performance problems, and — just as important — recognizing the specific situations where dropping down to raw SQL is the better choice than forcing an ORM to express something it isn't well suited for.",
      sections: [
        {
          heading: "What Problem ORMs Solve",
          body: "Without an ORM, every database interaction means writing a raw SQL string, manually mapping the returned rows into application objects, and hand-writing schema changes as SQL migration scripts. An ORM removes most of that repetition: you define a model once (its fields and types), and the ORM generates the corresponding SQL for common operations (create, read, update, delete, and filtered queries) through a typed, language-native API — which also gives you compile-time type checking on queries in a typed language like TypeScript, catching mistakes (a typo'd field name, a wrong type) before the query ever runs.",
        },
        {
          heading: "Defining Models and Schema",
          body: "In Prisma, the schema is defined declaratively in a single schema.prisma file, describing each model's fields, types, and relationships; the ORM then generates a fully-typed client from that schema. Other ORMs (Sequelize, TypeORM) define models directly in code as classes or objects with decorators. Either way, the model definition becomes the single source of truth the ORM uses both to generate queries and to generate/validate migrations against the actual database schema.",
          code: {
            language: "typescript",
            code:
              "// schema.prisma\nmodel Student {\n  id          String       @id @default(cuid())\n  name        String\n  email       String       @unique\n  enrollments Enrollment[]\n  createdAt   DateTime     @default(now())\n}\n\nmodel Enrollment {\n  id        String   @id @default(cuid())\n  studentId String\n  student   Student  @relation(fields: [studentId], references: [id])\n  courseId  String\n  status    String   @default(\"active\")\n}",
          },
        },
        {
          heading: "Migrations and Schema Versioning",
          body: "A migration is a versioned, ordered set of schema changes (create table, add column, add index) that lets a database schema evolve safely and reproducibly across every environment — local, staging, production — rather than manually running ad hoc ALTER TABLE statements that different environments might apply differently or forget entirely. Most ORMs can auto-generate a migration by diffing the current schema definition against the previous one, though reviewing the generated SQL before applying it to production is still essential, since destructive changes (dropping a column with data in it) deserve a human decision, not silent automation.",
        },
        {
          heading: "Querying Through the ORM",
          body: "ORM query APIs translate method chains or query objects into SQL under the hood, typically supporting filtering, sorting, pagination, and field selection through a fluent, language-native syntax rather than string-built SQL. The productivity gain is real, but it comes with an important discipline: periodically checking the actual generated SQL (most ORMs expose a query-logging option) to confirm it's doing what you expect, especially for anything beyond a simple single-table lookup.",
          code: {
            language: "typescript",
            code:
              "const activeStudents = await prisma.student.findMany({\n  where: { enrollments: { some: { status: \"active\" } } },\n  orderBy: { createdAt: \"desc\" },\n  take: 20,\n  select: { id: true, name: true, email: true },\n});",
          },
        },
        {
          heading: "Relationships: One-to-Many and Many-to-Many",
          body: "A one-to-many relationship (one student, many enrollments) is declared with a foreign key on the 'many' side, exactly mirroring the underlying relational foreign key. A many-to-many relationship (students to courses, where a student takes many courses and a course has many students) requires a join table under the hood — some ORMs (Prisma) can manage this join table implicitly for the simple case, while more complex many-to-many relationships that need their own extra fields (like an enrollment date on the join itself) require modeling the join table as its own explicit model, exactly as you would in raw SQL.",
        },
        {
          heading: "Eager vs. Lazy Loading",
          body: "Lazy loading fetches a related record only when it's actually accessed in code, which is convenient but is exactly what causes the N+1 query problem when that access happens inside a loop over many parent records. Eager loading fetches related data up front, in the same query (via a JOIN) or in one additional batched query, and is the standard fix once you know you'll need the related data for every item in a list. Every mainstream ORM supports eager loading explicitly (Prisma's include, Sequelize's include, TypeORM's relations option) — the discipline is remembering to reach for it whenever a list of parent records and their related data are both needed together.",
        },
        {
          heading: "When to Bypass the ORM",
          body: "ORMs are excellent for standard CRUD and moderately complex queries, but complex reporting queries, bulk operations across millions of rows, or database-specific features (full-text search, window functions, recursive CTEs) are often better expressed as raw SQL that the ORM executes directly, rather than contorted into whatever subset of SQL the ORM's query builder happens to expose. Nearly every ORM provides an escape hatch for raw queries specifically for this reason, and using it for the specific cases where it's genuinely clearer or more efficient is a sign of good judgment, not a failure to 'use the ORM properly.'",
        },
      ],
      commonPitfalls: [
        "Accessing a lazily-loaded relation inside a loop over many records, silently reintroducing the N+1 query problem the ORM doesn't prevent by default.",
        "Never looking at the actual SQL an ORM generates for a non-trivial query, and discovering only in production that it's doing something inefficient.",
        "Forcing a complex reporting or analytics query through the ORM's query builder instead of dropping to raw SQL where it would be clearer and faster.",
        "Letting migrations drift between environments — generating a migration locally but forgetting to run it in staging/production, causing schema mismatches.",
        "Not understanding a cascading delete configured in the ORM's relation definition, and being surprised when deleting a parent silently deletes related child records.",
        "Fetching and serializing an entire deep object graph (a student with all enrollments, each with all course details) when only a few fields were actually needed.",
      ],
      keyTakeaways: [
        "An ORM's core value is a typed, language-native API over the database plus schema/migration management — not that it eliminates the need to understand SQL.",
        "Migrations version schema changes reproducibly across environments; auto-generated migrations still deserve a human review before hitting production.",
        "Lazy loading causes N+1 queries when accessed in a loop; eager loading (include/join) is the standard, explicit fix every mainstream ORM supports.",
        "Many-to-many relationships needing extra fields on the join itself require modeling the join table explicitly, not relying on an implicit join table.",
        "Periodically inspect the actual SQL an ORM generates — trusting it blindly is how inefficient queries reach production unnoticed.",
        "Raw SQL is still the right tool for complex reporting, bulk operations, or database-specific features the ORM's query builder can't cleanly express.",
      ],
      links: [
        { label: "Prisma Docs — Getting Started", url: "https://www.prisma.io/docs/getting-started" },
        { label: "Prisma Docs — Relations", url: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations" },
        { label: "Sequelize Docs — Migrations", url: "https://sequelize.org/docs/v6/other-topics/migrations/" },
      ],
    },

    // ===================== DEPLOYMENT & DEVOPS MODULE =====================
    {
      moduleTitle: "Deployment & DevOps Module",
      subModuleTitle: "Git workflows",
      overview:
        "Git is the shared source of truth for how a team's code changes over time, and how well a team uses it — commit hygiene, branching strategy, merge discipline — has a direct, daily impact on how easy the codebase is to work in and debug. This guide covers writing commits that actually communicate intent, comparing the major branching strategies (Git Flow, trunk-based development, GitHub Flow), the practical difference between merging and rebasing and when each is appropriate, a calm process for resolving merge conflicts instead of panicking, safely undoing mistakes without losing work, and the repo hygiene practices (a proper .gitignore, never committing secrets) that prevent entirely avoidable incidents.",
      sections: [
        {
          heading: "Commits as a Communication Tool",
          body: "A commit is not just a save point — it's a message to every future reader of the codebase (including yourself in six months) about what changed and why. A commit should represent one logical, coherent change; bundling an unrelated bug fix, a refactor, and a new feature into a single commit makes it impossible to revert or review any one of them independently. Commit messages should describe the reasoning ('why') more than the mechanics ('what'), since the diff itself already shows what changed — a message like 'fix stuff' or 'wip' communicates nothing to a future reader trying to understand history.",
        },
        {
          heading: "Branching Strategies",
          body: "Git Flow uses long-lived develop and main branches plus dedicated feature/release/hotfix branches with strict merge rules — thorough, but heavier process than most modern web teams need. Trunk-based development keeps everyone committing small, frequent changes directly to a single main branch (often behind feature flags for anything not ready to ship), minimizing long-lived branches and the painful merge conflicts they tend to accumulate. GitHub Flow sits between the two: short-lived feature branches off main, opened as a pull request, reviewed, and merged back quickly — this is the default most small-to-mid-sized teams reach for today.",
        },
        {
          heading: "Merging vs. Rebasing",
          body: "git merge combines two branches' histories with a new merge commit, preserving exactly how history actually happened, including every side branch — accurate, but can leave a tangled, hard-to-read history on an active repo. git rebase replays your branch's commits on top of another branch's current tip, producing a linear history as if you'd started from the latest code — cleaner to read, but it rewrites commit hashes, which is the reason for the cardinal rule: never rebase commits that have already been pushed and might be in use by someone else. A common team convention: rebase your own local feature branch to keep it current with main before opening a PR, but merge (not rebase) when integrating a reviewed PR into main.",
          code: {
            language: "bash",
            code:
              "# Keep a local feature branch current with main via rebase (before it's shared)\ngit checkout feature/add-login\ngit fetch origin\ngit rebase origin/main\n\n# If conflicts arise, resolve them, then:\ngit add .\ngit rebase --continue",
          },
        },
        {
          heading: "Resolving Merge Conflicts",
          body: "A conflict occurs when Git can't automatically reconcile changes to the same lines (or nearby lines) in two branches, and it marks the conflicting sections directly in the file with <<<<<<<, =======, and >>>>>>> markers for you to resolve manually. The reliable process: open each conflicted file, understand what each side was actually trying to do (not just mechanically pick one block), edit the file to the correct final result, remove the conflict markers entirely, then stage the file and continue the merge or rebase. Blindly accepting 'ours' or 'theirs' without reading both sides is how conflicts get 'resolved' into silently broken code.",
          code: {
            language: "bash",
            code:
              "git status               # see which files have conflicts\n# ... manually edit conflicted files, removing <<<<<<< ======= >>>>>>> markers ...\ngit add path/to/resolved-file.js\ngit commit               # completes a merge (or `git rebase --continue` for a rebase)",
          },
        },
        {
          heading: "Undoing Mistakes Safely",
          body: "git revert creates a new commit that undoes a previous commit's changes, preserving history — the safe choice for anything already pushed and shared, since it doesn't rewrite existing commits. git reset moves the branch pointer (optionally discarding commits and/or working-directory changes) and is appropriate for undoing local, unpushed work. git reflog records every place HEAD has pointed, including commits that seem to have vanished after a reset — it's the practical safety net for recovering work that appeared to be lost.",
          code: {
            language: "bash",
            code:
              "git revert <commit-hash>          # safe: undoes a pushed commit with a new commit\ngit reset --soft HEAD~1           # undo last local commit, keep changes staged\ngit reflog                        # find a commit that seems to have disappeared\ngit reset --hard <hash-from-reflog>  # recover to that exact state",
          },
        },
        {
          heading: "Pull Request Workflow and Code Review",
          body: "A pull request bundles a branch's commits for review before they're merged into a shared branch, giving teammates a chance to catch bugs, suggest improvements, and share context before the change ships. Good PR hygiene includes keeping PRs reasonably small and focused (a 2,000-line PR is nearly impossible to review meaningfully), writing a description that explains the why and how to test it, and treating review comments as a collaborative discussion rather than either a rubber stamp or a personal critique.",
        },
        {
          heading: ".gitignore and Repository Hygiene",
          body: ".gitignore tells Git which files/patterns to never track — build output, dependency folders (node_modules), local environment files (.env), and IDE-specific settings are the classic entries, since none of them belong in version control and some (like .env) are an active security risk if committed. If a secret is accidentally committed, simply deleting it in a later commit is not sufficient — it remains fully visible in the repository's history and must be actively purged (or, more practically, the leaked credential must be rotated/invalidated immediately, since history rewriting on a shared repo is itself risky).",
        },
      ],
      commonPitfalls: [
        "Bundling several unrelated changes into one giant commit, making it impossible to review, revert, or bisect independently.",
        "Force-pushing or rebasing a branch that other people have already pulled and built work on top of, rewriting history out from under them.",
        "Committing .env files or other secrets to the repository, requiring credential rotation even after the file is later removed.",
        "Writing uninformative commit messages ('fix', 'update', 'wip') that give future readers no idea what changed or why.",
        "Resolving a merge conflict by blindly accepting one side without understanding what both changes were actually trying to do.",
        "Not pulling the latest changes from the shared branch before starting new work, leading to unnecessarily large and painful merge conflicts later.",
        "Opening enormous, sprawling pull requests that are effectively unreviewable, leading to rushed or superficial reviews.",
      ],
      keyTakeaways: [
        "A commit should represent one coherent logical change with a message that explains why, not just what.",
        "Short-lived feature branches merged via pull request (GitHub Flow) is the practical default for most modern teams.",
        "Never rebase commits that have already been pushed and shared — rebase locally, merge when integrating reviewed work.",
        "git revert is the safe way to undo shared/pushed history; git reset is for local, unpushed changes only.",
        "git reflog is the safety net for recovering work that appears lost after a reset or rebase gone wrong.",
        "A committed secret must be rotated, not just deleted in a later commit — it remains visible in history either way.",
      ],
      links: [
        { label: "Git Docs — Branching Basics", url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell" },
        { label: "Atlassian — Merging vs. Rebasing", url: "https://www.atlassian.com/git/tutorials/merging-vs-rebasing" },
        { label: "GitHub Docs — About Pull Requests", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests" },
      ],
    },
    {
      moduleTitle: "Deployment & DevOps Module",
      subModuleTitle: "Environment configuration",
      overview:
        "The exact same codebase needs to behave differently across a developer's laptop, a staging server, and production — different database URLs, different API keys, different feature flags — and configuration is the mechanism that makes this possible without maintaining separate code branches per environment. This guide covers why configuration must never be hardcoded, how .env files and process.env work in practice, structuring configuration per environment, secrets management as a distinct and higher-stakes concern than ordinary config, the Twelve-Factor App's config principle that most modern deployment platforms are built around, validating configuration at startup so misconfiguration fails loudly instead of silently, and feature flags as a form of runtime configuration.",
      sections: [
        {
          heading: "Why Configuration Shouldn't Be Hardcoded",
          body: "Hardcoding a database URL, API key, or environment-specific behavior directly into source code means changing environments requires changing and redeploying code — and worse, it means the exact same binary/build artifact can't be promoted unchanged from staging to production, which undermines confidence that what you tested is what you're shipping. Externalizing configuration means the application's behavior for a given environment is determined entirely by what's injected at startup, and the same tested build can be deployed anywhere by changing only its configuration.",
        },
        {
          heading: ".env Files and process.env",
          body: "A .env file holds key-value pairs of environment variables for local development, loaded into process.env at startup by a library like dotenv, letting developers configure their local environment without touching code or shell profiles. In deployed environments (staging, production), these same variables are typically injected directly by the hosting platform or CI/CD system rather than from a committed file — the .env file itself should never be committed to version control, since it often holds real secrets for at least one environment.",
          code: {
            language: "bash",
            code:
              "# .env (local development only — never committed)\nDATABASE_URL=postgresql://localhost:5432/lbf_dev\nJWT_SECRET=dev-only-secret-not-for-prod\nSTRIPE_API_KEY=sk_test_xxx",
          },
        },
        {
          heading: "Environment-Specific Configuration",
          body: "Development, staging, and production typically need different values for the same configuration keys — a local database URL versus a managed production database, verbose logging in development versus structured, lower-volume logging in production, test API keys for a payment provider versus live keys. The configuration keys themselves (the schema) should stay identical across environments; only the values differ, which is exactly what lets the same code run correctly everywhere by changing only what's injected, not the code that reads it.",
        },
        {
          heading: "Secrets Management",
          body: "Secrets (API keys, database passwords, signing keys) are configuration, but they deserve stricter handling than ordinary config like a log level or a feature flag: they should never appear in source control, never be logged, and ideally live in a dedicated secrets manager (AWS Secrets Manager, HashiCorp Vault, or a cloud platform's built-in secrets store) rather than plain environment variables in less mature setups, since a secrets manager adds audit logging, rotation support, and fine-grained access control that plain env vars don't provide.",
        },
        {
          heading: "The Twelve-Factor App's Config Principle",
          body: "The Twelve-Factor App methodology (a widely-referenced set of best practices for building deployable, scalable web apps) states config should be stored in the environment, strictly separate from code — and specifically warns against grouping config into named 'environments' like 'development' and 'production' inside the codebase itself, since that scales poorly as more environments (a second staging environment, a per-developer preview environment) get added. The cleaner model treats each deploy as parameterized purely by whatever environment variables are injected into it at that moment, with no environment-specific code branches at all.",
        },
        {
          heading: "Validating Configuration at Startup",
          body: "An application that silently starts up with a missing or malformed environment variable and only fails later — often confusingly, deep inside unrelated code the first time that config value is actually used — is far harder to debug than one that validates all required configuration immediately at startup and refuses to start with a clear error if anything is missing or invalid. A schema validation library (Zod, in a Node/TypeScript app) applied to process.env at boot time turns 'mysterious crash three requests in' into 'clear error message the moment the process starts.'",
          code: {
            language: "typescript",
            code:
              "import { z } from \"zod\";\n\nconst envSchema = z.object({\n  DATABASE_URL: z.string().url(),\n  JWT_SECRET: z.string().min(32),\n  PORT: z.coerce.number().default(3000),\n});\n\nexport const env = envSchema.parse(process.env); // throws immediately if invalid/missing",
          },
        },
        {
          heading: "Feature Flags as Configuration",
          body: "A feature flag is a runtime configuration value that toggles a piece of functionality on or off without a code deploy — enabling gradual rollouts, A/B tests, or an instant kill switch for a problematic new feature. Simple flags can live as ordinary environment variables/booleans; more sophisticated needs (per-user targeting, percentage rollouts, changing a flag without redeploying at all) typically call for a dedicated feature-flag service, since that goes beyond what static environment variables alone can express.",
        },
      ],
      commonPitfalls: [
        "Committing a .env file containing real secrets to version control instead of adding it to .gitignore from the start.",
        "Hardcoding an API URL, key, or environment-specific value directly in source code instead of reading it from configuration.",
        "Using the exact same secrets (database credentials, API keys) across development, staging, and production instead of separate credentials per environment.",
        "Letting the application start successfully with missing or invalid configuration, only to fail confusingly later when that value is first used.",
        "Logging environment variables or request payloads that contain secrets, leaking them into log aggregation systems.",
        "Not maintaining a .env.example file documenting which environment variables are required, leaving new developers to guess or dig through code.",
      ],
      keyTakeaways: [
        "Configuration must be externalized from code so the same tested build can run correctly across every environment.",
        ".env files are for local development convenience only and should never be committed to version control.",
        "Secrets deserve stricter handling than ordinary config — ideally a dedicated secrets manager with rotation and audit logging.",
        "Twelve-Factor config treats each deploy as parameterized by environment variables, not by environment-specific code branches.",
        "Validating all required configuration at startup turns silent misconfiguration into an immediate, clear failure.",
        "Feature flags are a form of runtime configuration that decouples deploying code from releasing functionality.",
      ],
      links: [
        { label: "The Twelve-Factor App — Config", url: "https://12factor.net/config" },
        { label: "dotenv — npm package documentation", url: "https://www.npmjs.com/package/dotenv" },
        { label: "OWASP — Secrets Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
      ],
    },
    {
      moduleTitle: "Deployment & DevOps Module",
      subModuleTitle: "Containerization basics",
      overview:
        "Containers solve the 'it works on my machine' problem by packaging an application together with its exact runtime environment — dependencies, system libraries, configuration defaults — into a single portable unit that runs identically anywhere a container runtime is available. This guide covers the distinction between an image (a static blueprint) and a container (a running instance of it), writing a Dockerfile, the layer caching model that determines build speed, multi-stage builds for lean production images, Docker Compose for coordinating multiple services (an app plus its database) locally, persisting data with volumes, and the basics of how containers communicate over a network.",
      sections: [
        {
          heading: "Images vs. Containers",
          body: "A Docker image is a read-only, layered blueprint — application code, a runtime, installed dependencies, and configuration, all baked into a static artifact built once from a Dockerfile. A container is a running (or stopped) instance of that image, with its own writable layer on top and its own isolated process, filesystem view, and network namespace. The relationship mirrors a class and an object in object-oriented programming: many containers can be spun up from the exact same image, each an independent running instance.",
        },
        {
          heading: "Writing a Dockerfile",
          body: "A Dockerfile is a sequence of instructions that Docker executes in order to build an image: FROM specifies the base image to start from, WORKDIR sets the working directory inside the image, COPY brings files from the build context into the image, RUN executes a command during the build (like installing dependencies), and CMD specifies the default command to run when a container starts from the image. Each instruction creates a new layer, and layers are cached — which is why the order of instructions has a direct, significant impact on build speed.",
          code: {
            language: "dockerfile",
            code:
              "FROM node:20-alpine\nWORKDIR /app\n\n# Copy only dependency manifests first so npm install is cached\n# unless package.json/package-lock.json actually change\nCOPY package*.json ./\nRUN npm ci --omit=dev\n\n# Now copy the rest of the source code\nCOPY . .\n\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
          },
        },
        {
          heading: "Layer Caching and Build Optimization",
          body: "Docker caches each layer and reuses it on subsequent builds as long as nothing that affects that layer has changed — but the moment one layer's inputs change, every layer after it must be rebuilt, even if their own inputs didn't change. This is exactly why copying package.json and running npm install before copying the rest of the application source (as shown above) matters: editing a source file doesn't invalidate the dependency-install layer, so rebuilds after a routine code change skip reinstalling every dependency and are dramatically faster.",
        },
        {
          heading: "Multi-Stage Builds",
          body: "A multi-stage build uses multiple FROM instructions in one Dockerfile, where an early stage can include heavy build tooling (a full Node.js toolchain, a TypeScript compiler) that's needed only to produce build artifacts, and a later, final stage copies just those artifacts into a much smaller runtime base image — discarding the build tools entirely from the final image. This routinely shrinks a production image from several hundred megabytes down to tens of megabytes, which matters directly for deploy speed, storage cost, and reduced attack surface.",
          code: {
            language: "dockerfile",
            code:
              "# Stage 1: build\nFROM node:20 AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Stage 2: run — only the compiled output ships, not the build tooling\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD [\"node\", \"dist/server.js\"]",
          },
        },
        {
          heading: "Docker Compose for Multi-Service Apps",
          body: "A real full-stack app is rarely just one container — it's typically an API server, a database, and maybe a cache, all needing to run together and talk to each other. Docker Compose defines all of these services declaratively in a single docker-compose.yml, and a single docker compose up command builds/starts every service, wires up a shared network so they can reach each other by service name, and manages their lifecycle together — replacing what would otherwise be a manual sequence of individual docker run commands with the correct flags every time.",
          code: {
            language: "yaml",
            code:
              "services:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      DATABASE_URL: postgresql://postgres:postgres@db:5432/app\n    depends_on:\n      - db\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: postgres\n    volumes:\n      - db-data:/var/lib/postgresql/data\n\nvolumes:\n  db-data:",
          },
        },
        {
          heading: "Volumes and Persistent Data",
          body: "A container's writable layer is ephemeral by default — data written inside it disappears the moment the container is removed, which is a serious problem for anything stateful like a database. A volume is a persistence mechanism managed by Docker that lives outside any single container's lifecycle: it can be mounted into a container at a specific path, survive that container being stopped, removed, and recreated, and even be shared between multiple containers. Any container running a database, as in the Compose example above, needs its data directory mounted to a volume, or every restart silently wipes all data.",
        },
        {
          heading: "Container Networking Basics",
          body: "By default, Docker Compose puts all services defined in the same file on a shared network where each can reach the others using the service name as a hostname (the api service connects to db:5432, not localhost:5432 or a hardcoded IP) — Docker's internal DNS resolves the service name automatically. Ports need to be explicitly published (the '3000:3000' mapping) only for services that need to be reachable from outside the Docker network entirely, like the API server being reachable from a browser on the host machine; internal service-to-service communication doesn't require publishing any ports.",
        },
      ],
      commonPitfalls: [
        "Copying the entire project directory before installing dependencies, busting the dependency-install layer's cache on every single code change.",
        "Running the containerized application as the root user by default instead of creating and switching to a non-root user, unnecessarily widening the container's attack surface.",
        "Shipping a bloated production image because a multi-stage build wasn't used, leaving build tools and dev dependencies in the final image.",
        "Storing a database's data files only inside the container's writable layer with no volume, silently losing all data on the next container restart or recreation.",
        "Not pinning a specific base image version (using node:latest instead of node:20-alpine), causing builds to be inconsistent across time as the 'latest' tag moves.",
        "Trying to reach another Compose service via localhost instead of its service name, since each container has its own isolated network namespace.",
        "Exposing more ports than actually need to be reachable from outside the container network, unnecessarily widening the attack surface.",
      ],
      keyTakeaways: [
        "An image is a static blueprint; a container is a running instance of it — many containers can share one image.",
        "Order Dockerfile instructions so rarely-changing steps (dependency installs) come before frequently-changing ones (copying source code) to maximize layer cache hits.",
        "Multi-stage builds keep heavy build tooling out of the final production image, often shrinking it dramatically.",
        "Docker Compose coordinates multiple services locally, giving them a shared network where they reach each other by service name.",
        "Any stateful service (a database) needs its data directory mounted to a volume, or restarts will silently wipe its data.",
        "Service-to-service communication inside Compose uses service names as hostnames, not localhost or published host ports.",
      ],
      links: [
        { label: "Docker Docs — Dockerfile Reference", url: "https://docs.docker.com/reference/dockerfile/" },
        { label: "Docker Docs — Multi-Stage Builds", url: "https://docs.docker.com/build/building/multi-stage/" },
        { label: "Docker Docs — Compose File Reference", url: "https://docs.docker.com/reference/compose-file/" },
      ],
    },
    {
      moduleTitle: "Deployment & DevOps Module",
      subModuleTitle: "CI/CD fundamentals",
      overview:
        "Continuous Integration and Continuous Deployment automate the steps between 'a developer pushes code' and 'that code is running safely in production,' replacing manual, error-prone, and inconsistently-applied processes with a repeatable pipeline. This guide covers what CI/CD actually automates and why that matters, the typical anatomy of a pipeline (build, test, deploy stages), writing a GitHub Actions workflow concretely, using automated tests and linting as real quality gates rather than a formality, caching dependencies to keep pipelines fast, the major deployment strategies (blue-green, canary, rolling) for shipping changes without downtime, and handling secrets safely inside a CI environment.",
      sections: [
        {
          heading: "What CI/CD Actually Automates",
          body: "Continuous Integration means every code change is automatically built and tested as soon as it's pushed, catching integration problems (a change that breaks something elsewhere in the codebase) within minutes rather than being discovered days later when several people's changes collide. Continuous Deployment (or the more conservative Continuous Delivery, which stops just short of automatic production deploys, requiring a manual approval step) extends this by automatically deploying code that passes all checks, removing manual, error-prone deploy steps and making shipping small changes frequently the normal, low-risk default instead of a rare, high-stakes event.",
        },
        {
          heading: "Anatomy of a Pipeline",
          body: "A typical pipeline runs as an ordered sequence of stages, each of which must succeed for the pipeline to proceed: install dependencies, run linting/static analysis, run the automated test suite, build the production artifact (a compiled bundle, a Docker image), and finally deploy that artifact to an environment. Structuring it as distinct, ordered stages means a failure is immediately localized to a specific step (a lint failure won't waste time running a slow test suite afterward if the pipeline is ordered to fail fast on cheaper checks first).",
        },
        {
          heading: "GitHub Actions Workflow Basics",
          body: "A GitHub Actions workflow is a YAML file in .github/workflows/ that defines when it runs (on: push, pull_request, a schedule, etc.), one or more jobs, and, within each job, a sequence of steps — either a shell command (run:) or a reusable community action (uses:, like actions/checkout to pull the repo's code onto the runner). Jobs can run in parallel by default, or be made to depend on each other via needs:, letting you express, for example, that a deploy job should only run after a test job has succeeded.",
          code: {
            language: "yaml",
            code:
              "name: CI\n\non:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: \"npm\"\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test",
          },
        },
        {
          heading: "Tests and Linting as Real Gates",
          body: "A pipeline stage is only a meaningful gate if a failure actually blocks the pipeline from proceeding — branch protection rules on the repository that require the CI check to pass before a pull request can be merged are what turn 'we have tests' into 'broken code literally cannot reach main.' A test suite that exists but that failures are routinely ignored or overridden on is functionally decorative; the discipline of never merging on red CI is what makes the whole practice worth the setup investment.",
        },
        {
          heading: "Caching Dependencies for Faster Builds",
          body: "Reinstalling every dependency from scratch on every single pipeline run wastes real time and, for many package registries, real bandwidth — most CI platforms support caching a dependency directory (node_modules, or more precisely the package manager's download cache) keyed by a hash of the lockfile, so the cache is reused automatically whenever the lockfile hasn't changed and invalidated automatically the moment it has. This single optimization is often the difference between a pipeline that takes 30 seconds versus several minutes on every single push.",
        },
        {
          heading: "Deployment Strategies",
          body: "A rolling deployment gradually replaces old instances with new ones a few at a time, keeping the service available throughout but meaning both versions briefly serve traffic simultaneously. A blue-green deployment runs the new version fully in parallel on a separate environment, then switches all traffic over at once (typically via a load balancer or router change) once it's verified healthy — enabling an instant rollback by simply switching back. A canary deployment routes a small percentage of real traffic to the new version first, monitoring for errors before gradually increasing that percentage — catching a bad deploy while it's only affecting a small fraction of users instead of everyone.",
        },
        {
          heading: "Secrets in CI Pipelines",
          body: "A CI pipeline frequently needs secrets (a deploy key, a database password, an API token) to do its job, and these must never be hardcoded into the workflow file itself, since workflow files are typically committed to the same repository they're building. CI platforms provide a dedicated, encrypted secrets store (GitHub Actions Secrets, for instance) that injects secret values as environment variables at runtime without ever exposing them in the workflow file's source or, by default, in the pipeline's logs — and it's worth verifying that a secret value is never accidentally echoed or logged by a script step, since that would defeat the protection entirely.",
        },
      ],
      commonPitfalls: [
        "Having a test suite in the pipeline that isn't actually enforced by branch protection, so failing tests don't stop broken code from merging.",
        "Deploying directly to production with no staging environment or canary/rolling rollout, so a bad deploy immediately affects every user at once.",
        "Not caching dependencies between pipeline runs, wasting minutes reinstalling the exact same packages on every single push.",
        "Hardcoding a secret directly into a workflow YAML file instead of using the CI platform's encrypted secrets store.",
        "Only running the pipeline on merges to main, missing the fast feedback a pull-request-triggered run would give before code is even merged.",
        "Tolerating flaky tests by re-running them until they pass instead of fixing the underlying flakiness, eroding trust in what a failing test actually means.",
        "Having no rollback plan for a failed deployment, turning a bad deploy into an extended outage while a fix is rushed out instead of simply reverting.",
      ],
      keyTakeaways: [
        "CI catches integration problems within minutes of a push; CD automates getting passing code safely into production.",
        "Structure pipelines as ordered stages that fail fast on cheap checks (lint) before running expensive ones (full test suite, build).",
        "A test gate is only real if branch protection actually blocks merging on a failing check — otherwise it's decorative.",
        "Dependency caching keyed on the lockfile hash is usually the single biggest lever for pipeline speed.",
        "Blue-green and canary deployments both enable safer rollouts and fast rollback compared to an all-at-once deploy.",
        "Secrets belong in the CI platform's encrypted secrets store, never hardcoded in a workflow file or echoed into logs.",
      ],
      links: [
        { label: "GitHub Docs — Understanding GitHub Actions", url: "https://docs.github.com/en/actions/get-started/understand-github-actions" },
        { label: "GitHub Docs — Using Secrets in GitHub Actions", url: "https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions" },
        { label: "Martin Fowler — Continuous Integration", url: "https://martinfowler.com/articles/continuousIntegration.html" },
      ],
    },
    {
      moduleTitle: "Deployment & DevOps Module",
      subModuleTitle: "Cloud deployment",
      overview:
        "Getting a full-stack application running on a laptop is a very different problem from running it reliably, securely, and scalably for real users in the cloud. This guide surveys the major deployment models (raw virtual machines, Platform-as-a-Service, serverless, and container orchestration) and the trade-offs between them, how to think about choosing a hosting platform for a typical full-stack app, the DNS/SSL layer that sits between a domain name and a running server, horizontal versus vertical scaling, keeping local and cloud environments consistent enough to trust testing, the monitoring/logging/alerting that turns 'find out from an angry user' into 'find out automatically,' and deploying changes without downtime.",
      sections: [
        {
          heading: "Deployment Models: VM, PaaS, Serverless, Containers",
          body: "A raw virtual machine (an EC2 instance, a DigitalOcean Droplet) gives full control over the operating system and runtime but means you're responsible for OS patching, process management, and scaling yourself. A Platform-as-a-Service (Render, Railway, Heroku-style platforms) takes a git push or a container and handles provisioning, scaling, and infrastructure for you, at the cost of less low-level control. Serverless (AWS Lambda, Vercel/Netlify functions) runs your code only in response to individual requests/events, scaling to zero when idle and billing per invocation, well-suited to spiky or infrequent workloads but with cold-start latency and execution-time limits to design around. Container orchestration (Kubernetes) manages many containers across a cluster of machines with fine-grained control over scaling, networking, and rollout strategy, at the cost of meaningfully higher operational complexity than the other options.",
        },
        {
          heading: "Choosing a Hosting Platform for a Full-Stack App",
          body: "For most learners and small-to-mid production apps, the practical decision tree is: a PaaS (Render, Railway, Fly.io) for the backend API and a managed database service, plus a frontend-specialized platform (Vercel, Netlify) for a React/Next.js frontend, gets a full-stack app into production quickly with minimal infrastructure management — and this is genuinely the right choice for a large share of real applications, not just a beginner's shortcut. Kubernetes-based container orchestration earns its added complexity once an organization has enough services, enough scale, or specific compliance/control requirements that a managed PaaS genuinely can't satisfy — reaching for it by default, before that need is concrete, adds operational burden without a corresponding benefit.",
        },
        {
          heading: "DNS, Domains, and SSL/TLS",
          body: "DNS translates a human-readable domain name into the IP address of the server actually handling requests, via records configured with your domain registrar or DNS provider — an A record points a domain directly to an IP, and a CNAME record points it to another domain name (common when pointing a custom domain at a hosting platform's own infrastructure). SSL/TLS certificates encrypt traffic between the browser and server and are what make a domain load over https instead of http; nearly every modern hosting platform (Vercel, Render, Cloudflare) provisions and renews these automatically via Let's Encrypt, removing what used to be a genuinely painful manual process.",
        },
        {
          heading: "Horizontal vs. Vertical Scaling",
          body: "Vertical scaling means giving a single server more resources (more CPU, more RAM) — simple, but with a hard ceiling (there's a biggest machine you can rent) and no redundancy (if that one machine goes down, everything goes down). Horizontal scaling means running multiple smaller server instances behind a load balancer that distributes traffic across them — this is what enables both near-unlimited scaling and redundancy (one instance failing doesn't take down the whole service), but, as covered in server architecture, it requires the application to be stateless, since any instance might handle any given request.",
        },
        {
          heading: "Environment Parity Between Local and Cloud",
          body: "The further local development diverges from the production environment (a different database engine locally versus in production, different Node.js versions, different OS-level behavior), the more 'works on my machine, breaks in production' surprises show up, precisely at the worst time. Using containers locally (matching the same Docker image or base image used in production) and matching dependency versions exactly via a lockfile are the two most effective, practical ways to keep environment parity high without literally running production-scale infrastructure on a laptop.",
        },
        {
          heading: "Monitoring, Logging, and Alerting in Production",
          body: "Once an application is live, the question isn't whether something will eventually go wrong, but whether you find out from your own monitoring or from an angry user's support ticket. Monitoring tools (Datadog, Sentry, or a cloud platform's built-in metrics) track error rates, response times, and resource usage over time; centralized logging aggregates logs from every instance into one searchable place; and alerting rules notify the team automatically when a metric crosses a concerning threshold (error rate spikes, response time degrades, a health check starts failing) — the entire point being to be notified before most users are affected, not after.",
        },
        {
          heading: "Zero-Downtime Deploys and Rollbacks",
          body: "A naive deploy that stops the old version and then starts the new one creates a visible gap where the service is completely down. A zero-downtime deploy starts new instances running the new version, waits until they pass a health check, then only shifts traffic to them and terminates the old instances afterward — most managed hosting platforms and container orchestrators support this pattern out of the box, requiring only that your application expose a health-check endpoint and handle graceful shutdown (finishing in-flight requests instead of dropping them when told to terminate). Having a fast, tested rollback path (redeploying the previous known-good version) is just as important as the deploy mechanism itself, since some issues only surface under real production traffic.",
        },
      ],
      commonPitfalls: [
        "Having no monitoring or alerting at all, so outages and errors are first discovered through user complaints instead of automated detection.",
        "Deploying with hardcoded localhost URLs or development-only configuration that silently breaks once the app is actually running in the cloud.",
        "Forgetting to configure HTTPS/SSL for a production domain, or letting a certificate expire due to relying on manual renewal.",
        "Scaling application servers horizontally without checking the database's connection limit, causing 'too many connections' errors under load.",
        "Treating a cloud deployment as 'set and forget,' missing both cost creep from unused/oversized resources and slow performance regressions over time.",
        "Running a single server instance with no redundancy, creating a single point of failure for the entire application.",
        "Skipping a staging environment entirely and testing changes for the first time directly in production.",
      ],
      keyTakeaways: [
        "PaaS platforms get most full-stack apps into production quickly; Kubernetes-style orchestration is justified only once scale or control requirements genuinely demand it.",
        "Modern hosting platforms automate SSL/TLS certificate provisioning and renewal via Let's Encrypt — manual certificate management is largely a solved problem now.",
        "Horizontal scaling requires a stateless application; vertical scaling has a hard resource ceiling and no built-in redundancy.",
        "High environment parity (matching containers, matching lockfile versions) between local and production prevents an entire class of late-stage surprises.",
        "Monitoring and alerting exist to catch problems before users do — treat their absence as a production gap, not an optional extra.",
        "A zero-downtime deploy needs a health check and graceful shutdown handling; a fast rollback path matters just as much as the deploy mechanism.",
      ],
      links: [
        { label: "MDN — What is a Domain Name / DNS", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name" },
        { label: "AWS — Types of Cloud Computing (overview of deployment models)", url: "https://aws.amazon.com/types-of-cloud-computing/" },
        { label: "Google SRE Book — Monitoring Distributed Systems", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
      ],
    },
  ],
};

export default data;
