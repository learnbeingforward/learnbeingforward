import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "backend-development",
  modules: [
    {
      moduleTitle: "Server Frameworks",
      sections: [
        {
          heading: "What a Framework Gives You",
          body: "A backend framework (Node.js/Express, Django, Spring Boot, .NET) provides the routing, request-parsing, and conventions that would otherwise need to be built by hand for every project. Frameworks differ in philosophy — Express is minimal and unopinionated, giving you building blocks to assemble yourself; Django and Spring Boot are more 'batteries included,' with strong conventions for how a project should be organized; .NET sits between the two, opinionated but flexible. None of these differences change the underlying job of a backend — they just change how much structure is handed to you versus how much you build yourself.",
        },
        {
          heading: "Project Structure & Routing",
          body: "Most frameworks organize a project around the same recurring pieces: entry point (where the server starts and middleware is registered), routes (mapping URLs and HTTP methods to handler functions), controllers/handlers (the actual logic for each route), and models (representing the data the app works with). Routing itself maps a request's method and path to the function that should handle it — e.g. GET /students/:id → a handler that looks up one student by id. Path parameters (:id) and query strings (?page=2) are the two main ways data arrives via the URL itself, distinct from data sent in the request body.",
        },
        {
          heading: "Middleware, Across Frameworks",
          body: "Every mainstream backend framework has some version of middleware — code that runs on a request before (or after) the main handler. In Express this is literally called middleware; Django calls it middleware too; Spring Boot uses filters/interceptors; .NET uses its own middleware pipeline. Regardless of naming, the pattern is identical: a chain of functions each request passes through, commonly used for logging, authentication, parsing request bodies, and centralized error handling — understanding this one pattern transfers directly across every framework track in this module.",
        },
        {
          heading: "Choosing a Framework in Practice",
          body: "In a real job, framework choice is usually already made by the team/company, and the more valuable skill is being able to get productive in whichever framework is already in use — because the underlying concepts (routing, middleware, request/response handling) are the same everywhere. That said, some patterns of choice are common: Node.js/Express for teams wanting a unified JavaScript/TypeScript stack across frontend and backend; Django for teams prioritizing rapid development with strong built-in tooling (admin panel, ORM); Spring Boot for larger enterprise Java environments; .NET for Microsoft-centric environments and enterprise systems.",
        },
      ],
      links: [
        { label: "Express.js Official Documentation", url: "https://expressjs.com/" },
        { label: "Django Official Documentation", url: "https://docs.djangoproject.com/" },
        { label: "Spring Boot Official Documentation", url: "https://spring.io/projects/spring-boot" },
      ],
    },
    {
      moduleTitle: "REST API Design",
      sections: [
        {
          heading: "Resource Modeling",
          body: "The first design decision in any API is identifying its resources — the nouns the API exposes (students, courses, enrollments) — and how they relate to each other. A well-modeled API mirrors the real relationships in the data: /colleges/:collegeId/students for students that clearly belong to a college, versus a flat /students?collegeId=42 when the relationship is more incidental. There's no single universally 'correct' answer — the right structure depends on how the resource is actually used and queried — but consistency across the whole API matters more than any individual choice.",
        },
        {
          heading: "Status Codes & Error Handling, Applied",
          body: "Building on the general status-code families, real API error handling means: validating input before doing any work and returning 400 with specific field-level errors when it fails, returning 401 vs. 403 correctly (401 means 'we don't know who you are,' 403 means 'we know who you are, but you can't do this'), and always returning errors in a consistent shape across every endpoint (e.g. { error: { code, message, fields } }) so client code can handle failures generically instead of parsing a different error format per endpoint.",
        },
        {
          heading: "API Versioning",
          body: "Once an API has real consumers, changing it becomes risky — a field rename or removed endpoint can break every client depending on it. Versioning strategies include putting a version in the URL (/api/v1/students), a custom header, or content negotiation via the Accept header. URL versioning is the most common because it's the most visible and easiest to route on the server side. The underlying discipline matters more than the specific mechanism: never make a breaking change to an existing version — add a new version instead, and give consumers time to migrate before retiring the old one.",
        },
        {
          heading: "API Documentation",
          body: "An API that isn't documented is effectively unusable by anyone except the person who wrote it. Good documentation for each endpoint specifies: the HTTP method and path, required and optional parameters (with types), the shape of a successful response, and every error response that can occur. Tools like the OpenAPI/Swagger specification let this documentation be generated directly from code annotations or a schema file, keeping docs in sync with the actual implementation rather than drifting out of date as a separate hand-written document.",
        },
      ],
      links: [
        { label: "GeeksforGeeks — REST API Design", url: "https://www.geeksforgeeks.org/rest-api-introduction/" },
        { label: "Swagger/OpenAPI Documentation", url: "https://swagger.io/docs/" },
        { label: "MDN Web Docs — HTTP Response Status Codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
      ],
    },
    {
      moduleTitle: "Databases",
      sections: [
        {
          heading: "Relational Schema Design, Applied to Real Systems",
          body: "Designing a schema for a real backend means translating the actual business rules into tables and constraints — not just entities, but the rules that govern them. A student belongs to exactly one college (a foreign key, not nullable if the rule is strict); a course can have many enrollments, but an enrollment always belongs to exactly one student and one course (a many-to-one relationship from each side). Getting these constraints right at the database level — not just checking them in application code — means the database itself refuses to store impossible data, which is a far stronger guarantee than a check that could be accidentally skipped somewhere in the code.",
        },
        {
          heading: "Query Optimization Basics",
          body: "Slow queries usually trace back to one of a few common causes: missing indexes on columns used in WHERE/JOIN/ORDER BY, fetching more columns or rows than actually needed (SELECT * instead of the specific fields used), or the classic N+1 query problem — fetching a list of records, then running a separate query per record to get related data, instead of one query that joins or batches the related data upfront. Most ORMs have a way to eagerly load related data in a single query specifically to avoid this N+1 pattern, and recognizing it is one of the highest-value debugging skills for backend performance.",
        },
        {
          heading: "ORMs & Migrations",
          body: "Beyond writing queries, ORMs manage the evolution of a database schema over time through migrations — versioned, ordered files that each describe one change (add a column, create a table, add an index). Migrations are checked into version control alongside application code, so the database schema's history is tracked the same way code changes are, and any environment (a new developer's machine, staging, production) can be brought to the exact same schema state by running the same ordered set of migrations. Never modifying a production schema by hand, outside of the migration system, is one of the most important habits for keeping environments consistent.",
        },
      ],
      links: [
        { label: "MySQL Official Documentation", url: "https://dev.mysql.com/doc/" },
        { label: "Prisma Official Documentation", url: "https://www.prisma.io/docs" },
        { label: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs/" },
      ],
    },
    {
      moduleTitle: "Authentication & Deployment",
      sections: [
        {
          heading: "Session vs. Token Authentication",
          body: "Session-based auth stores a session identifier server-side (often in a database or in-memory store) and gives the client a cookie referencing it; the server looks up the session on every request to identify the user. Token-based auth (commonly JWT — JSON Web Tokens) instead issues the client a self-contained, signed token that encodes the user's identity directly; the server verifies the token's signature on each request without needing to look anything up in a store. Sessions are simpler to revoke immediately (just delete the session server-side) but require server-side state; tokens scale more easily across multiple servers but are harder to revoke before they naturally expire.",
        },
        {
          heading: "Role-Based Access Control",
          body: "Most real applications need more than 'logged in or not' — different users need different permissions. Role-based access control (RBAC) assigns each user one or more roles (student, college admin, trainer, company admin, in this app's case), and every protected action checks the current user's role before proceeding, rejecting the request (typically with 403 Forbidden) if their role doesn't permit it. Good RBAC design checks permissions as close to the actual action as possible — not just hiding a button in the UI, since a determined user can call the API directly, bypassing any UI-only restriction.",
        },
        {
          heading: "Environment Configuration for Auth",
          body: "Authentication secrets — password hashing salts, JWT signing secrets, OAuth client secrets — are exactly the kind of value that must never be hard-coded or committed to version control. These belong in environment variables, injected differently per environment (a throwaway value in development, a strong randomly-generated secret in production, never shared between the two). Password hashing itself should always use an algorithm purpose-built for it (like bcrypt) rather than a general-purpose hash function — general hashes are fast, which is exactly the wrong property for password storage, since it makes brute-force attacks cheaper.",
        },
        {
          heading: "Shipping an Authenticated API",
          body: "Deploying a backend with real authentication adds a few extra concerns beyond a basic deployment: HTTPS is non-negotiable, since credentials and tokens sent over plain HTTP can be intercepted; cookies (if using session auth) need the correct security flags set (HttpOnly to block JavaScript access, Secure to require HTTPS, SameSite to limit cross-site sending); and rate limiting on login endpoints specifically helps prevent brute-force password guessing. None of these are optional hardening steps for 'later' — they're part of what makes an authenticated API actually safe to expose to real users.",
        },
      ],
      links: [
        { label: "OWASP — Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
        { label: "jwt.io — JSON Web Tokens Introduction", url: "https://jwt.io/introduction" },
        { label: "MDN Web Docs — Using HTTPS", url: "https://developer.mozilla.org/en-US/docs/Web/Security" },
      ],
    },
  ],
};

export default data;
