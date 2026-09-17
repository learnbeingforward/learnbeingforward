import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "full-stack-development",
  modules: [
    {
      moduleTitle: "Frontend Module",
      sections: [
        {
          heading: "HTML: Structuring Content",
          body: "HTML (HyperText Markup Language) is the skeleton of every web page — it doesn't describe how things look, only what they are. Writing semantic HTML means choosing tags that describe the actual meaning of content, not just its visual appearance: a navigation bar goes in a <nav>, a self-contained article goes in <article>, a heading uses <h1>-<h6> in order, not just whichever looks the right size. Semantic markup matters for three concrete reasons: screen readers rely on it to describe a page to visually impaired users, search engines use it to understand page structure, and it makes the DOM easier for other developers (and your own future self) to reason about.",
        },
        {
          heading: "CSS Fundamentals",
          body: "CSS (Cascading Style Sheets) controls layout, color, spacing, and typography. Three ideas explain almost all CSS behavior in practice:",
          bullets: [
            "The box model — every element is a rectangular box made of content, padding, border, and margin, in that order from inside out. Most layout bugs come from misunderstanding how these stack.",
            "Specificity and the cascade — when multiple rules target the same element, the browser picks a winner based on selector specificity (IDs beat classes, classes beat element selectors) and source order (later rules win ties).",
            "Inheritance — some properties (like font and color) automatically pass down from parent to child elements unless overridden; others (like border and padding) don't.",
          ],
        },
        {
          heading: "Modern Layout: Flexbox and Grid",
          body: "Flexbox lays elements out along a single axis (row or column) and excels at distributing space and aligning items — think navigation bars, button groups, and centering content. CSS Grid lays elements out on a full two-dimensional grid of rows and columns at once, and is the better tool whenever a layout needs to align things across both axes simultaneously — think page layouts, card grids, and dashboards. In practice, most real interfaces use both together: Grid for the overall page structure, Flexbox for the smaller components inside each grid area.",
        },
        {
          heading: "Responsive Design",
          body: "A responsive page adapts its layout to the screen it's rendered on rather than assuming one fixed size. The two core techniques are fluid sizing (using relative units like %, rem, and viewport units instead of fixed pixels so elements scale naturally) and media queries (CSS rules that apply only above or below a certain screen width, letting you change layout — e.g. switching a 3-column grid to a single column — at defined breakpoints). The standard approach today is mobile-first: write the base styles for the smallest screen, then use media queries to add complexity as the screen gets larger, rather than the reverse.",
        },
        {
          heading: "JavaScript & the DOM",
          body: "The Document Object Model (DOM) is the browser's live, in-memory tree representation of the HTML page — JavaScript reads and modifies this tree to make pages interactive after they've loaded. Core DOM skills include selecting elements (document.querySelector), reading and changing their content or attributes, and attaching event listeners (addEventListener) that run code in response to user actions like clicks, form submissions, or key presses. Every interactive behavior on a page — a dropdown opening, a form validating itself, a button changing color on click — ultimately comes down to this same pattern: select an element, listen for an event, update the DOM in response.",
        },
        {
          heading: "React Component Architecture",
          body: "React structures a UI as a tree of components — small, reusable functions that each return the markup for one piece of the interface, composed together to build the full page. Two concepts drive almost everything else in React:",
          bullets: [
            "Props — data passed down from a parent component to a child, making the child reusable and configurable rather than hard-coded.",
            "State — data a component owns and can change itself over time (via useState); when state changes, React automatically re-renders that component (and its children) to reflect the new value.",
            "Unidirectional data flow — data flows down through props, and changes flow back up through callback functions passed as props, keeping the app's data predictable even as it grows.",
          ],
        },
        {
          heading: "State Management",
          body: "As an app grows past a handful of components, keeping state organized becomes its own skill. Local component state (useState) is enough when only one component and its direct children need a value. When distant, unrelated components need to share and react to the same data — like a logged-in user or shopping cart — that state needs to move up to a common ancestor ('lifting state up') or into a dedicated store (React Context for simpler cases, or a library like Redux/Zustand for larger apps) so every component that needs it can read and update it consistently.",
        },
      ],
      links: [
        { label: "MDN Web Docs — HTML, CSS & JavaScript Reference", url: "https://developer.mozilla.org/en-US/docs/Web" },
        { label: "React Official Documentation", url: "https://react.dev/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
    {
      moduleTitle: "Backend Module",
      sections: [
        {
          heading: "What a Backend Actually Does",
          body: "The backend is the part of an application that runs on a server rather than in the user's browser — it handles business logic, talks to the database, enforces security rules, and exposes an API the frontend calls to read and write data. Every backend, regardless of language or framework, does some combination of: receiving a request, validating it, doing work (often involving a database), and sending back a response. Understanding this request-response cycle clearly is more valuable than memorizing any one framework's syntax, because it's the same shape in Node.js, Django, Spring Boot, or .NET.",
        },
        {
          heading: "REST API Design",
          body: "REST (Representational State Transfer) is a set of conventions for designing predictable, resource-oriented APIs. The core idea: model your API around nouns (resources, like /users or /orders), and use HTTP methods as the verbs that act on them.",
          bullets: [
            "GET — retrieve a resource or list of resources, without changing anything.",
            "POST — create a new resource.",
            "PUT/PATCH — update an existing resource (PUT typically replaces it fully, PATCH updates part of it).",
            "DELETE — remove a resource.",
            "Good REST design also means using URLs for identity (/users/42) and HTTP status codes to communicate outcome, rather than stuffing everything into the response body.",
          ],
        },
        {
          heading: "Status Codes & Error Handling",
          body: "HTTP status codes are the first thing a client checks, and using them correctly makes an API far easier to consume. The broad families are: 2xx for success (200 OK, 201 Created, 204 No Content), 4xx for client errors — the caller did something wrong (400 Bad Request for invalid input, 401 Unauthorized for missing/invalid auth, 403 Forbidden for valid auth but insufficient permission, 404 Not Found), and 5xx for server errors — something broke on the backend itself (500 Internal Server Error). A well-designed backend also returns a consistent, structured error body (not just a status code) so the frontend can show a useful message rather than a generic failure.",
        },
        {
          heading: "Middleware",
          body: "Middleware is code that runs between a request arriving and the final route handler processing it — a pipeline each request passes through in order. Common uses include: parsing the incoming request body into usable data, logging requests for debugging, authenticating the caller and attaching their identity to the request, and catching errors thrown anywhere downstream so the server can respond gracefully instead of crashing. Thinking of a backend as a pipeline of small, focused middleware functions — rather than one large function doing everything — is what keeps larger backends maintainable.",
        },
        {
          heading: "Server Architecture Basics",
          body: "Most backends follow a layered structure to keep concerns separated: a routing layer maps incoming URLs/methods to handler functions, a controller/handler layer contains the logic for each specific request, a service/business-logic layer holds reusable rules independent of HTTP (so the same logic can be reused outside a web request, e.g. in a background job), and a data-access layer talks to the database. Keeping these layers distinct — rather than putting database queries directly inside route handlers — is what makes a backend testable and easy to change later without breaking unrelated features.",
        },
        {
          heading: "Building a Production-Style API",
          body: "A production-quality API adds several things a quick prototype usually skips: input validation on every endpoint (never trust client-supplied data), consistent error responses, environment-based configuration (so the same code runs against different databases/settings in development vs. production without code changes), and automated tests covering the main success and failure paths of each endpoint. These aren't optional polish — they're what separates code that works on your machine from code a team can safely build and deploy on top of.",
        },
      ],
      links: [
        { label: "MDN Web Docs — HTTP Overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
        { label: "Node.js Official Documentation", url: "https://nodejs.org/en/docs" },
        { label: "GeeksforGeeks — REST API Design", url: "https://www.geeksforgeeks.org/rest-api-introduction/" },
      ],
    },
    {
      moduleTitle: "Database Module",
      sections: [
        {
          heading: "Relational vs. NoSQL Databases",
          body: "Relational databases (MySQL, PostgreSQL) store data in tables with a fixed schema and strong relationships enforced between them via foreign keys — ideal when data is structured, relationships matter (a user has many orders, an order has many line items), and consistency is critical. NoSQL databases (MongoDB being the most common document-oriented example) store more flexible, often nested JSON-like documents without a rigid shared schema — useful when data is naturally hierarchical, schema needs to evolve quickly, or the access pattern is simple key-based lookups at large scale. Most real products default to a relational database unless they have a specific reason not to, since strong relationships and consistency guarantees are hard to get back once you give them up.",
        },
        {
          heading: "Relational Schema Design",
          body: "Designing a good relational schema means modeling entities as tables and their relationships correctly:",
          bullets: [
            "One-to-many — e.g. one college has many students; the 'many' side (students) holds a foreign key pointing back to the 'one' side (college).",
            "Many-to-many — e.g. students and courses (a student takes many courses, a course has many students) — modeled with a separate join table holding pairs of foreign keys.",
            "Normalization — organizing tables to avoid storing the same fact in multiple places, so an update only ever needs to happen in one row. Some duplication is occasionally accepted deliberately for performance — that's a tradeoff to make consciously, not by accident.",
          ],
        },
        {
          heading: "Query Design",
          body: "Writing a query well means retrieving exactly the data needed, in the shape needed, without over-fetching. JOINs combine rows from related tables based on a shared key (an INNER JOIN returns only matching rows across both tables; a LEFT JOIN keeps all rows from the first table even when there's no match in the second). WHERE filters rows before grouping; HAVING filters after a GROUP BY aggregation. A common beginner mistake is fetching entire tables into application code and filtering there — that work almost always belongs in the query itself, which the database is optimized to do far faster.",
        },
        {
          heading: "Indexing & Performance Basics",
          body: "An index is a separate, ordered data structure the database maintains alongside a table specifically to make lookups on certain columns fast — similar to an index at the back of a book. Without an index on a column used in a WHERE clause or JOIN, the database may have to scan every row in the table to find matches, which gets slow as data grows. The tradeoff: indexes speed up reads but slightly slow down writes (since the index has to be updated too) and use extra storage — so they're added deliberately on columns that are actually queried often, not on every column by default.",
        },
        {
          heading: "ORMs",
          body: "An Object-Relational Mapper (ORM) — like Prisma, Sequelize, or Hibernate — lets application code interact with a relational database using the programming language's own objects and methods instead of writing raw SQL strings everywhere. ORMs typically also manage migrations (versioned, repeatable changes to the database schema as the application evolves) so schema changes can be tracked, reviewed, and applied consistently across development, staging, and production databases. ORMs remove a lot of repetitive SQL, but understanding the actual SQL an ORM generates underneath still matters — it's what you'll need to reason about when a query is slower than expected.",
        },
      ],
      links: [
        { label: "MySQL Official Documentation", url: "https://dev.mysql.com/doc/" },
        { label: "MongoDB Official Documentation", url: "https://www.mongodb.com/docs/" },
        { label: "Prisma Official Documentation", url: "https://www.prisma.io/docs" },
      ],
    },
    {
      moduleTitle: "Deployment & DevOps Module",
      sections: [
        {
          heading: "Git Workflows",
          body: "Git tracks changes to code over time and lets multiple people work on the same codebase without overwriting each other's work. The core workflow most teams use: create a feature branch off the main branch for each piece of work, commit changes with clear messages describing what and why, push the branch and open a pull request for review, then merge back into main once approved. Branching this way keeps main always in a working, deployable state, and gives every change a reviewable, revertible history — essential once more than one person touches the code.",
        },
        {
          heading: "Environment Configuration",
          body: "Real applications run in multiple environments — local development, staging (a production-like environment for final testing), and production (what real users actually use) — and each needs different configuration: different database connection strings, API keys, and feature flags. The standard practice is to never hard-code these values in source code; instead, read them from environment variables at runtime, with a separate .env file (excluded from version control) per environment. This means the exact same code can run correctly in every environment just by changing its configuration, not its logic.",
        },
        {
          heading: "Containerization Basics",
          body: "A container packages an application together with everything it needs to run — code, runtime, system libraries, dependencies — into one portable unit that behaves identically wherever it runs. Docker is the standard tool for this: a Dockerfile describes how to build an image (a snapshot of the app plus its environment), and that image can then be run as a container on any machine with Docker installed, eliminating the classic 'it works on my machine' problem caused by environment differences between developers' laptops and servers.",
        },
        {
          heading: "CI/CD Fundamentals",
          body: "Continuous Integration (CI) automatically builds and tests every code change (usually on every pull request) so problems are caught immediately rather than after merging. Continuous Deployment/Delivery (CD) automatically ships code that passes those checks to staging or production, removing manual, error-prone deployment steps. A typical CI/CD pipeline runs: install dependencies, run the linter and automated tests, build the application, and — if every step passes — deploy it. This automation is what lets teams ship changes frequently and confidently instead of treating every deployment as a risky, manual event.",
        },
        {
          heading: "Cloud Deployment",
          body: "Deploying an application means making it reachable to real users outside your local machine. At a minimum this involves: hosting the built application on a server (a traditional VM, a managed platform like a PaaS, or a containerized environment), configuring a domain name and HTTPS certificate so users can reach it securely, and connecting it to a production database (usually separate from any development database, with its own credentials and backups). Modern deployment also means planning for what happens when something goes wrong — monitoring/logging to know when the app is broken, and a way to quickly roll back to the previous working version if a deployment introduces a bug.",
        },
      ],
      links: [
        { label: "Git Official Documentation", url: "https://git-scm.com/doc" },
        { label: "Docker Official Documentation", url: "https://docs.docker.com/" },
        { label: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions" },
      ],
    },
  ],
};

export default data;
