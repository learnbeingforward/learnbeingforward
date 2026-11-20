# CLAUDE CODE PROMPT — Build Learn Being Forward exactly like the design

> **For Lohit (how to use this file)**
> 1. Unzip `lbf-claude-code-kit.zip` at the **root of your website repo**. It creates two folders:
>    - `design/`: all the design pages and assets, `rendered/`, `PAGE_SPEC.md` and this file;
>    - `design-check/`: the automatic visual check.
> 2. Add `design-check/auth/` to `.gitignore`.
> 3. Open Claude Code in the repo and paste the short message in the grey box below. Nothing else.
> 4. Claude Code works one phase at a time and stops after each phase with a report. Check the pages, then reply **"Phase N approved, continue"**, or tell it what's wrong.
>
> ```
> Read design/CLAUDE_CODE_PROMPT.md completely, then design/PAGE_SPEC.md. They are the
> specification for this website. Follow them exactly, rule by rule. Start with Phase 0
> and stop after it with the report described in section 12. Do not skip ahead.
> ```

---

## 1. Your job, in one sentence

Rebuild every page of learnbeingforward.in in this repo so that it is **visually and behaviourally identical** to the HTML design files in `design/`. Identical means the same colours, fonts, sizes, spacing, borders, shadows, text, element order, positions, icons, hover and click behaviour, dialogs, mobile layout and animations. Connect them to the real data and APIs that already exist in this repo.

## 2. The rules that matter most (read twice)

1. **The design files are the specification, not inspiration.** Do not redesign, "improve", modernise, simplify or reinterpret anything. If you think something should be different, write it in `DESIGN_DEVIATIONS.md` and ask. Do not change it yourself.
2. **Port from the source code, never from memory or from a screenshot.** For every page, open its rendered markup in `design/rendered/<same path>` and convert it element by element into JSX. Keep:
   - every element and wrapper `div`;
   - every class name;
   - every inline style;
   - every text string;
   - the order of everything.
3. **Use the design's own CSS, unchanged.** Import `design/assets/styles.css` (and `exam.css`, `docs.css`, `cert.css` where a page uses them) as global CSS, unedited. **Do not** rewrite it in Tailwind, CSS modules, styled-components or any component library. Do not "clean it up". If an existing global style (Tailwind preflight, an old globals.css, a UI kit theme) changes how a design page looks, fix it by scoping or ordering the old styles. Never edit the design CSS to compensate.
4. **No component-library look.** Do not use shadcn/ui, MUI, Chakra, Ant, Headless UI default styles, or lucide/heroicons icons on these pages. Buttons are `<button class="btn btn-primary">`, pills are `<span class="pill success">`, icons come from the design's SVG sprite. You may use a library *only* for invisible behaviour, such as a focus trap, and only if the rendered DOM and classes stay identical.
5. **Text is exact.** Copy every label, heading, button text, placeholder, helper text, empty-state text and error message exactly, including punctuation such as `·`, `—`, `₹` and `…`.
   - Button text is written in normal case in the markup. CSS makes it uppercase, so do **not** type it in capitals.
   - Sample names and numbers (Sunrise Engineering College, ₹1,18,000, Aadhya Joshi…) are placeholders for real data. Replace them with API data, but keep the same format.
6. **Same routes as the live site.** `PAGE_SPEC.md` gives the route for every design file. If the repo already has that route, rebuild that page in place. Routes marked **(new)** must be created.
7. **Every page is checked by the machine, not by eye.** A page is done only when `design-check` (section 9) passes for it at 1440px and 390px:
   - screenshot difference ≤ 2%;
   - no horizontal scroll.
8. **Never stop at "close enough".** If the check fails, open the Playwright report, look at the diff image, fix the difference, and run it again.
9. **Ask before inventing.** If something needed is missing (an API, a field, a business rule), stop and ask in the phase report. Do not make up a different UI to fit the backend; propose the backend change instead.
10. **Don't break what works.** Keep authentication, existing APIs, database models and the URLs people already use. Change the presentation layer, and add backend only where a design needs data that doesn't exist yet. List those additions in the report.

## 3. Why earlier attempts didn't match (and what to do instead)

| What went wrong before | Do this instead |
|---|---|
| CSS re-typed in Tailwind "approximately" | Import `styles.css` as-is (rule 3) |
| Fonts swapped for the app's existing font, or `next/font` generated a different family name | Load the exact Google Fonts link (section 4.2) |
| Icons replaced with lucide/heroicons | Use the design's SVG sprite (section 4.3) |
| Header and menus rebuilt from a screenshot | Port `assets/layout.js` + `assets/nav.js` line by line (section 5) |
| Pages built from `design/<page>.html`, whose header and menus don't exist until JavaScript runs | Build from `design/rendered/<page>.html`, which is the final DOM after all scripts ran |
| Hover, animations, mobile drawer and bottom tabs missing | Section 8 lists every interaction; the CSS already contains them if the classes are kept |
| Tables overflowing on phones | Port `cardTables()` (section 5.4) and keep the `m-cards` class + `data-label` attributes |
| No way to know if a page matched | `design-check` compares each page with the design automatically |

## 4. Phase 0: set up the design system (do this first, exactly)

### 4.1 Files
- Keep `design/` in the repo as read-only reference. Never edit anything inside it.
- Copy `design/assets/styles.css`, `exam.css`, `docs.css` and `cert.css` to the app's styles folder, e.g. `app/styles/lbf/`. Add a comment at the top of each: `/* copied verbatim from design/assets — do not edit; change design first */`.
- Import `styles.css` once in the root layout, **after** any Tailwind/global CSS, so it wins the cascade. Import the others only on the routes that use them (`PAGE_SPEC.md` lists the CSS for every page).
- If Tailwind is installed, make sure its preflight doesn't change these pages. For example, preflight sets `img{display:block}`, `button{background:transparent}` and removes heading sizes. If anything differs in `design-check`, set `corePlugins.preflight=false` or load preflight before `styles.css`.

### 4.2 Fonts (exactly these)
In the root layout `<head>`, use the exact link the design uses:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
```
The CSS refers to the families by name (`'Poppins'`, `'JetBrains Mono'`). If you prefer `next/font`, you must make sure the family name the CSS sees is still `Poppins`, otherwise text widths change. The `<link>` is the safe choice.

### 4.3 Icons
`design/assets/layout.js` has an `ICONS` map (name → SVG paths). It turns that map into a hidden sprite with one `<symbol id="i-<name>" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` per icon.
- Copy the `ICONS` map exactly into an `IconSprite` component and render it **once** in the root layout, hidden.
- Make `<Icon name="users" size={18}/>` render exactly what the design renders: `<svg …><use href="#i-users"/></svg>`, with the same width/height, `stroke-width` and `class`.
- The assessment pages draw their icons inline (`design/assessment/*.html`). Copy those SVG paths as they are.

### 4.4 Design tokens (reference; they already live in styles.css)
| Token | Value | Used for |
|---|---|---|
| `--navy` | `#1C2B4A` | header band, primary buttons, headings |
| `--navy-2` / `--navy-3` | `#24365C` / `#2E4370` | hover on navy, chips on navy |
| `--gold` | `#C9973C` | accents, active-tab underline, gold buttons, icons on navy |
| `--gold-soft` / `--gold-text` | `#F6EBD3` / `#8A6420` | gold tint background / gold as text on light backgrounds |
| `--cream` | `#FAF7F0` | page background |
| `--surface` | `#F4F1E8` | table heads, tiles, rows |
| `--text` / `--muted` | `#1E2533` / `#5D6472` | body text / secondary text |
| `--border` / `--border-strong` | `#E4DFD3` / `#CFC8B8` | dividers / inputs and outline buttons |
| success / warning / danger / info | `#1F8A4C` / `#B45309` / `#B91C1C` / `#1E4FBF` (+ `-soft`, `-text`) | status pills, alerts, tiles |
| radius | 12 / 8 / 6 px | cards / inputs / buttons |
| shadow | `0 8px 30px rgba(28,43,74,.12)` | cards |
| font | Poppins 14px / 1.55 body; JetBrains Mono for code | |

Fixed measurements:
- Buttons are 44px tall, 12px bold uppercase text with .06em letter-spacing, 6px radius.
- Inputs are 44px tall with an 8px radius.
- Focus ring is `0 0 0 3px rgba(201,151,60,.35)`.
- The content is 1280px wide max, with 24px side gutters.
- The header band has 128px bottom padding, and the white card overlaps it.

Never put `--gold` text on white or cream; use `--gold-text`.

### 4.5 Install the checker
Install `@playwright/test` and chromium. Then generate the baselines from the design (section 9) and commit `design-check/baseline/`.

**Phase 0 is done when** fonts, CSS, the icon sprite and the checker are in place, and the baselines exist for all 110 pages × 2 sizes.

## 5. Phase 1: the shared shells (port line by line)

The design builds its headers, menus and footers with `design/assets/layout.js`, using the menu config in `design/assets/nav.js`. Port them into React components that output the **same DOM** as `design/rendered/*` shows.

### 5.1 Menu config
Copy `window.LBF_NAV` and `window.LBF_PARENT` from `nav.js` into a typed config file, such as `lib/nav.ts`. Keep the same keys, labels, order and icons.
- `LBF_NAV[role].groups` gives the top menu (one item per group) and its sub-pages.
- `LBF_PARENT` tells which menu item is active on detail pages (e.g. `student-detail` → `students`).

Map each `.html` href to the real route from `PAGE_SPEC.md`.

### 5.2 `PublicHeader` + `SiteFooter` (public pages)
- Logo, menu, Buy, Sign up / Login buttons and footer columns are exactly as in `design/rendered/public/home.html`.
- The footer includes the "Coding Patterns" and "Buy books" links.

### 5.3 `AppShell role=…` (all logged-in portals)
Top to bottom:
1. Navy band.
2. Logo, role badge, notifications bell, user chip, logout.
3. Top menu, one item per group, with a gold underline on the active one.
4. Gold sub-menu pills for the active group's pages.
5. `page-head`: crumb, h1, sub-text, and action buttons on the right.
6. `<main>` with the white `.card`(s) overlapping the band.

The exact class names and nesting are in `design/rendered/super-admin/dashboard.html`. The user name and role come from the session (design sample: "Lohit Kumar · Company admin").

### 5.4 Mobile behaviour (≤ 900px), also in layout.js
- **Hamburger** (`.m-burger`) opens a **left drawer** (`.m-drawer`) with a scrim (`.m-scrim`). It closes on the scrim, on the close button, and on the Escape key. Lock body scroll while it's open, and add the slide-in animation (`lbf-slide`).
- **Bottom tab bar** (`.m-tabs`, logged-in portals only):
  - The first 4 menu groups plus **More**, which opens the drawer.
  - If the active group isn't among the first 4, it replaces the 4th tab.
  - Content gets bottom padding so the bar never covers it.
- **Tables become cards.** `window.cardTables()` adds `data-label="<column header>"` to every `td` and the class `m-cards` to every table. The CSS then stacks each row as a card with labels. Do this in your `DataTable` component at render time, so it also covers tables loaded later.
- **Dialogs become bottom sheets** above the tab bar (`.ov` has `z-index:160`). This is CSS only; keep the classes.
- **Hard rule:** nothing may be wider than the screen at 390px. `design-check` fails the page if it is.

### 5.5 Password fields
`enhancePasswords()` adds an eye button to every `input[type=password]`. It shows and hides the password, updates `aria-pressed`, and swaps the label between "Show password" and "Hide password". Build it into the `PasswordInput` component and use that everywhere.

**Phase 1 is done when** `design-check` passes for `super-admin/dashboard.html`, `public/home.html` and one page of each portal, with real page content, at both sizes.

## 6. Phases 2–9: build the pages

### 6.1 Order (one phase at a time; stop and report after each)
| Phase | Section | Design folder | Pages |
|---|---|---|---|
| 2 | Public website + certificate verify + Buy + Coding Patterns | `public/` | 14 |
| 3 | Login, sign up, forgot / reset password | `auth/` | 4 |
| 4 | Super Admin (company), menu group by group: Overview → Accounts → Registrations & Approvals → Assessments → Course Content → Site Builder → Profile, then the detail pages | `super-admin/` | 46 |
| 5 | College portal | `college/` | 16 |
| 6 | Trainer portal | `trainer/` | 10 |
| 7 | Student portal | `student/` | 9 |
| 8 | Documents: MOUs, tax invoice, payment advice (viewer + server-side PDF) | `docs/` + `assets/docs.js` | 1 viewer + 4 templates |
| 9 | Assessment portal (exam screens + question builders) | `assessment/` | 9 + index |

### 6.2 For every single page, do these steps in this order
1. Read its entry in `design/PAGE_SPEC.md`: route, layout, title, header actions, tiles, tabs, sections in order, tables and columns, form fields and required markers, buttons, links, pills, dialogs and empty states.
2. Open `design/rendered/<path>` and convert the markup inside `<main>` to JSX:
   - `class` → `className`, `for` → `htmlFor`;
   - inline `style="a:b"` → `style={{a:'b'}}` with the same values;
   - self-close void tags.
   - Keep every wrapper element and every class.
3. Pull out a component only when the markup is identical between uses (`Tile`, `Pill`, `DataTable`, `FormField`, `Modal`, `Tabs`, `EmptyState`, `Alert`, `PageHead`). The component's output must be the same markup.
4. Replace the sample data with real data from the API, keeping the formatting rules in section 10. When a list is empty, show the design's empty-state text.
5. Wire up every interaction listed for the page (buttons, links, dialogs, tabs) and the global rules in section 8. Use the original JS in `design/assets/*.js` to see exactly what each button does: field validation, what the confirmation says, what the toast says.
6. Run `design-check` for that page at both sizes. Fix and re-run until it passes.
7. Tick the page in `DESIGN_PROGRESS.md`: page | route | desktop ✓ | mobile ✓ | notes.

### 6.3 Pages whose content is drawn by JavaScript in the design
Some pages are mostly empty in their `.html`, and a script draws the content. The rendered snapshot shows the result. Port the script's logic into React and keep its markup.

| Design script | Pages | What to build |
|---|---|---|
| `flows.js` (widgets `[data-w]`) | Contracts, MOUs, invoices, schedule, notifications, trainer MOU/invoice pages | Each widget becomes a component reading from the API: `admin-mous`, `college-mous`, `admin-sent`, `college-invoices`, `notes`, `schedule`, `admin-trainer-mous`, `trainer-mous`, `admin-pays`, `trainer-advices`. The design keeps this state in localStorage; you must store it in the database and send real notifications. |
| `docs.js` + `docs.css` | `docs/view.html`, MOU editor, invoice pages | Port `render(type, data)` as a **pure function returning the same HTML** (college MOU 7 pages, trainer MOU 6 pages, college tax invoice, trainer payment advice). Use it for the preview, the shared copy and the PDF, so all three are identical. Make PDFs server-side with headless Chromium (Playwright/Puppeteer) from that HTML at A4. Keep `words()` (Indian amount in words), `inr()` and `fdate()` exactly. |
| `doc-editor.js` | `super-admin/mou-editor.html` | Accordion of editable fields with defaults, live preview, blank fields highlighted red and counted, and a "Share" confirmation with an "I have reviewed" tick. |
| `studio.js` | `super-admin/course-content.html` (Course Studio) | Tree of course → module → sub-module → topic (any depth): rename in place, add inside, drag to reorder, move up/down, outline paste, bulk PDF matching, release rules per batch, settings. |
| `buy.js` | `super-admin/edit-site-buy.html`, `public/buy*.html` | Listings / Orders / Payment settings; public list, detail, book, UPI checkout with UTR. |
| `cp.js` | `public/coding-patterns*.html` | 14 levels; the first pattern of each level is free, the rest locked. **Check the lock on the server** (the live site ships every pattern to the browser today, so it isn't really locked). Buyers are unlocked. |
| `cert.js` + `cert.css` | `student/certificate.html`, `super-admin/certificate-editor.html`, `public/verify.html` | Certificate exactly as rendered: college name centred in the left block (split onto 2 balanced lines when longer than 34 characters), right ribbon with the "Learn Being / Forward" seal and slogan, signatory bottom-left, verify bottom-right, LBF watermark. Created with the batch, editable per batch; the verify page reads the real record. |
| `site-builder.html` (self-contained prototype) | `super-admin/site-builder.html` | Follow the rules in `design/README.md`, section "Site Builder": pages stored as data, a single renderer, permissions enforced in the API. |

### 6.4 Business rules the pages depend on
Read `design/README.md` completely. It defines:
- the college MOU flow, the trainer MOU flow (once per trainer + batch, at the first scheduled session), invoices and payment advice;
- the requirement form (hours per day required);
- certificate eligibility (attendance ≥ 75%, or an approved exception);
- mark-attendance (nobody pre-marked; Submit disabled until everyone is marked);
- overdue sessions, the Buy order verification, and employee permissions;
- the list of live-site bugs that the designs fix.

The UI must enforce these rules, and the API must enforce them too.

## 7. Components to create (output = the design's markup)
`PublicHeader`, `SiteFooter`, `AppShell`, `MobileDrawer`, `MobileTabs`, `PageHead`, `Card`, `Tile`, `Pill`, `Button`, `Icon`, `IconSprite`, `DataTable` (search, filters, bulk actions, row actions, pagination, empty state, loading skeleton, mobile cards), `Tabs`, `FormField`, `PasswordInput`, `Modal` (`.ov` / `.ov-card`), `Toast`, `Alert`, `EmptyState`, `Progress`, `Stepper` (`.ed-steps`).

Before using a component on many pages, render it next to the design and check it.

## 8. Interaction rules (everywhere)
1. **Hover:**
   - Buttons lift 1px with a soft shadow.
   - Outline buttons get a cream background.
   - Navy and gold buttons keep their colours; their background must **never** disappear on hover.
   - Table rows go `#FCFBF7`; tabs get a surface background.
   All of this is in `styles.css`; keep the classes and don't override it.
2. **Press:** `scale(.97)`. **Keyboard focus:** a 2px gold outline. Never remove focus styles.
3. **Dialogs (`.ov`):**
   - Fade in (`lbf-fade`). Close on Escape, the ✕ button and the backdrop.
   - Trap focus and return it to the opening button.
   - Destructive actions need a confirmation dialog, with type-the-name where the design shows it.
4. **Toasts:** navy, bottom centre, `lbf-pop` animation, gone after about 3 seconds. Use the exact wording from the design scripts.
5. **Forms:**
   - Required fields show the marker.
   - Errors appear inline under the field, in red.
   - Submit is disabled while saving, and wherever the design keeps it disabled until the form is valid (e.g. mark attendance).
   - Show a success toast after saving.
6. **Tabs:** change content without a page reload. Keep the selected tab in the URL hash where the design does (e.g. `#orders` on the Buy manager).
7. **Tables:** search, filters and pagination exactly as drawn. Keep the right-aligned action buttons.
8. **Links:** every link and button goes where `PAGE_SPEC.md` says. No dead buttons. If the backend for an action doesn't exist yet, list it in the report rather than hiding the button.
9. **Animations:** only the ones in the CSS (`lbf-pop`, `lbf-fade`, `lbf-slide`, `lbf-up`, and the transitions). Don't add any.
10. **Print / PDF:** documents use the print CSS in `docs.css` (A4, each page exactly 297mm, no extra blank pages).

## 9. Visual check (`design-check/`) — how a page is accepted
- Set it up as described in `design-check/README.md`.
- Log in once per role and save the session to `design-check/auth/<role>.json`. Do not commit those files.
- **Baselines** come from the design files: `MODE=design … --update-snapshots`.
- **Check:** `MODE=app npx playwright test -c design-check -g "<design path>"`. The test fails if the page is wider than the screen, or if more than 2% of its pixels differ from the design.
- Run `npx playwright show-report` to see Expected (design), Actual (app) and Diff side by side. Read the diff image and fix what it highlights.
- **Comparable data:** differences in data make the diff noisy. Create a seed script (`scripts/seed-design-demo.ts`) that loads the same sample records the design shows (the colleges, students, batches, amounts and dates in `PAGE_SPEC.md`), into a local/dev database only.
  - Only where something legitimately differs (today's date, an avatar), add a CSS selector to that page's `"mask"` in `design-check/routes.json`.
  - Never raise the 2% tolerance to make a page pass.
- `routes.json` entries that contain `"todo"` need a real id or query (e.g. `?studentId=…`). Fill them from the seed data and remove the `todo` key.

## 10. Data formatting (exactly as the design shows)
| Kind | Format | Example |
|---|---|---|
| Money | Indian grouping, ₹ prefix, no decimals unless the design shows paise | ₹1,18,000 |
| Amount in words | Indian system (lakh/crore), as `docs.js` `words()` | Rupees One Lakh Eighteen Thousand Only |
| Date | `DD Mon YYYY` | 06 Oct 2026 |
| Date + time | `DD Mon YYYY, hh:mm AM` | 20 Nov 2026, 10:00 AM |
| Percent | whole number + % | 75% |
| Counts in text | singular/plural correct | 1 permission / 3 permissions |
| Status | the pill text and colour the design uses for that status | Approved = `pill success`, Needs your decision = `pill warning` |
| IDs | as in the design | LBF/INV/2026-27/011, LBF-C-2026-00417 |

## 11. Do-not list
- Do not change colours, font sizes, font weights, letter-spacing, padding, margins, radii or shadows.
- Do not swap icons, change their order, or add or remove menu items.
- Do not wrap pages in extra containers that change widths.
- Do not use `100vw` (it causes horizontal scroll) or fixed pixel widths wider than 390px on mobile.
- Do not hard-code sample data in production code; it comes from the API (the seed is for dev only).
- Do not show a loading spinner where the design has a skeleton, or a blank page where it has an empty state.
- Do not edit anything in `design/`. If the design itself has a bug, report it.
- Do not mark a page done without a passing `design-check` at both sizes.

## 12. Report at the end of every phase (then stop and wait)
```
Phase N — <name>
Pages: <done>/<total>
| Design file | Route | Desktop diff | Mobile diff | No h-scroll | Notes |
Backend added/changed: …
Questions / blocked: …
Deviations (DESIGN_DEVIATIONS.md): …
How to check: <URLs to open>
```
Then wait for "Phase N approved, continue".
