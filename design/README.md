# Learn Being Forward — Website Redesign (design files)

Static HTML designs for every page of learnbeingforward.in, in the same visual
structure as the assessment-portal designs: a **navy header band**, a **white card
that overlaps the band**, small UPPERCASE labels, pill badges and 44px buttons.

Open `index.html` in a browser to see every page.

## Folder structure
```
index.html              – clickable index of every page
assets/styles.css       – design tokens (colours, type, spacing) + all components
assets/layout.js        – shared header, role menus, footer and icon sprite
public/                 – marketing site (Home, Courses, Course detail, Technologies, About, Team, Contact)
auth/                   – Login, Student sign up, Forgot password, Reset password
super-admin/            – 28 screens (Overview, Accounts, Registrations & Approvals, Assessments, Course Content, Profile)
college/                – 11 screens (Overview, Students, Courses, Batches, Query from Student, Contracts, Assessment Data, Profile)
trainer/                – 7 screens (Personal Details, My Batches, Schedule, Attendance + Mark attendance, Content, Invoice)
student/                – 7 screens (Dashboard + course progress, Attendance, Browse Courses, Content, Assessments, Profile)
```

## Brand tokens (taken from the live site)
| Token | Value | Use |
|---|---|---|
| `--navy` | `#1C2B4A` | header band, primary buttons, headings |
| `--gold` | `#C9973C` | accent fills, active-menu underline, icons on navy |
| `--gold-text` | `#8A6420` | gold used as text on light backgrounds (passes contrast) |
| `--cream` | `#FAF7F0` | page background |
| Font | Poppins (UI), JetBrains Mono (code) | |

Never put `--gold` text on white/cream (too low contrast); use `--gold-text`.

## Building it for real (instructions for Claude Code / developers)
- Rebuild in the existing stack (Next.js App Router). Turn `styles.css` tokens into
  the Tailwind theme (or CSS variables) and the classes into components:
  `PublicHeader`, `SiteFooter`, `AppShell(role)`, `PageHead`, `Card`, `Tile`,
  `Pill`, `Button`, `DataTable` (search + filters + pagination), `Tabs`,
  `FormField`, `Modal`, `EmptyState`, `Alert`.
- `layout.js` only exists so these static files share a header. In the app,
  each role's menu comes from one config (see `window.LBF_NAV` in layout.js).
- Every table page has: search, filters, bulk actions, row actions, pagination,
  an empty state and a loading skeleton.
- Every form has: required markers, inline errors, a disabled-while-saving
  submit button, and a success toast.
- Sample names and numbers come from the live site or are placeholders in
  [brackets] — replace with real data from the API.

## Portal layout
Every logged-in page uses the same shell: navy band → logo, role badge, notifications,
user chip, logout → top menu (one item per menu group) → gold sub-menu pills for the
group's pages → page title + actions → white card overlapping the band.
Pages that are empty on the live site show the empty state **and** an example row,
so both states are built.

The assessment question builders and the student exam screens (system check,
instructions, MCQ, coding, submission summary) are in the separate Assessment
Portal design set — not repeated here.

## Certificate rules (by design)
A student becomes certificate-eligible in two ways:
1. **Attendance ≥ 75%** for the course.
2. **Approved attendance exception** — the college sends a request (Query from Student),
   the company approves it (Approvals from College), and the student is eligible
   regardless of attendance. Show this with an "Approved by exception" pill and an
   info note, as on the student Dashboard and Attendance pages.

## Notes found on the live site
- College profile lists both "CSE" and "Computer Science" as branches — likely duplicates.
- Course id "placement-training-program" is labelled "Java & DSA" on the public site but "Placement Training Program" in college batches — pick one name.
- Contact page lists `invioce@learnbeingforward.in` (typo?). The design uses `invoice@`; confirm the real address.

## Site Builder (super-admin/site-builder.html)

### AI Create (first tab, runs locally, no cloud AI)
1. Employee details: name, email, phone, password (eye button to show or hide).
2. Plain-language description of what they should do; keywords map to capabilities (rule-based, in the browser, no API or subscription).
3. Access level per capability: full, view only or none.
4. Outline of the pages, each one removable before building.
5. Build: pages open in the canvas with delete on every box and every item; Publish creates the account, portal and menu.

### Copy & Remove (trim a copy for one employee)
- Copy a single page: opens directly with delete on every box and item.
- Copy a page with inner pages, or a whole portal: a list of the inner pages is shown first. On the outer page, links into inner pages show an "Open" button and the box is locked (no delete) while those inner pages exist.
- Deleting an inner page removes every link and button pointing to it on the outer pages; once nothing inner is left, the outer box becomes deletable.
- Everything removed is listed under "Removed — blocked for them" and can be restored before saving. On the server, removed items must be blocked for that account (routes and API actions refused), not just hidden.

### Canvas items
- Every small item inside a block (summary tiles, menu links, form fields, table columns) has its own × delete, can be dragged to reorder, and can be restored from the block settings.

### Password fields (whole website)
- assets/layout.js adds an eye button to every `input[type=password]` on every page: press to show, press again to hide (aria-pressed and the label update). Call `window.enhancePasswords(container)` after adding password fields dynamically.
A self-contained, working prototype (open it in a browser). Tabs:
- **Pages** – every page built with the builder: edit, preview, duplicate, delete. System pages can be copied as a start; the public Home page is locked.
- **Canvas editor** – left: library of every existing section, grouped by portal → page, plus basic blocks, form fields and layouts. Drag onto the canvas (or click +). Middle: live page with the portal's real header and menu; rows with 1–4 columns; move, duplicate and delete sections; auto-scroll while dragging. Right: settings for the selected section, row or page. Undo/redo (Ctrl+Z / Ctrl+Y), Delete key, device preview, full preview, publish.
- **Accounts & portals** – built-in portals are locked; custom account types (e.g. Placement Officer) are based on an existing one. Create users with a one-time password; reset password, disable, delete.
- **Menus** – drag to reorder, rename, place built pages in the top menu or inside a group.
- **Section library** – every smart block, the data it reads and which portals may use it.
- **Activity** – log of creates, publishes and deletes.

### Rules the real build must keep
1. **Pages are stored as data**, not code: `page = { portal, name, subtitle, icon, menu position, status, rows: [{ layout, cols: [{ blocks: [{ type, props }] }] }] }`. One renderer draws every built page.
2. **Smart blocks scope data by portal automatically**: student → only their own data; college → its students; trainer → its batches; super admin → everything; a custom portal → the scope set when it was created. Never trust the page to filter; enforce it in the API.
3. **Blocks not allowed for a portal** (e.g. admin-only actions) can sit on the canvas with a warning but are never rendered or served to that portal's users.
4. **Deletes are permanent and cascade in the database** (after typing the name/email to confirm):
   - delete a **page** → its sections, everything saved through its forms, its menu links, its versions;
   - delete a **user** → login revoked immediately and all sessions ended, profile, files and every record they own;
   - delete a **custom portal** → all its users (logins revoked), their data, its pages and menu.
   Write an audit-log entry for every delete. Built-in portals and the Home page cannot be deleted.
5. "Form (save new data)" creates a new data set (table) the first time the page is published; its fields come from the form's field list.


## MOUs, invoices and payment advice (assets/docs.js, docs.css, doc-editor.js, flows.js)

One template engine (`assets/docs.js`) renders four documents from a data object, so the editor preview, the shared copy and the PDF are always identical:

| Document | Pages | Created when |
|---|---|---|
| College MOU | 7 | A college accepts a training requirement → admin prepares it in `super-admin/mou-editor.html?type=college-mou` |
| Trainer MOU | 6 | The **first** session of a trainer with a batch is scheduled (once per trainer + batch, not per session) |
| College tax invoice | 1 | Accounts press **Mark as paid** on `colleges-sent.html` |
| Trainer payment advice | 1 | Accounts press **Mark as paid** on `trainers-invoices.html` |

Every page has the double navy/gold border, the brand header, company name/address under it, a watermark, and a footer with the document number, page x of n and initial boxes. Open `docs/view.html?type=…&id=…` and use **Download PDF** (print → Save as PDF). On the server, render the same HTML with a headless browser (Puppeteer/Playwright) to produce the PDF that is attached and emailed.

### College MOU flow
1. Requirement sent → college accepts → admin notification "accepted, prepare the MOU".
2. Admin opens the editor. Every key field is pre-filled from the requirement and editable: college name, address, signatory, course, sections, branch, semester, student strength, batches, dates, total days, **hours per day**, daily timing, venue, who pays (College / CSR sponsor / Free), fee basis, rate, GST, payment days (default 20 working days), late-payment interest (default 15%, unit per day / month / annum), postponement notice, delay charge per day, extra terms, company signature (upload image or typed) and date.
3. Blank fields are highlighted red in the preview and counted. **Share with college** opens a confirmation (tick "I have reviewed") before anything is sent.
4. College gets a notification; on Contracts it downloads the MOU, uploads the signed copy and presses **Share signed MOU** → admin notification.
5. Admin presses **Confirm training** → dates locked, college notified.

### Trainer MOU flow
Scheduling the first session for a trainer + batch opens "trainer MOU needed". Editable: trainer name/phone/email/PAN/address, college, course, batch, dates, total days, timing, **per-day payment** (total is calculated automatically), travel allowance, food and accommodation (blank = ₹0 / not applicable, with a note field), TDS % (default 10), payment window (default 20–30 days after completion), extra terms, signature. Rules included: reach campus 10 min early and class 5 min early, follow timings, release students on time, attendance per session, escalate to admin and never decide alone, dress code, carry own HDMI/adapters, no discussing commercials (penalty + strict action), no sharing personal details with students, non-solicitation. Trainer signs from **My Batches** and shares back.

### Invoices
- College: Mark as paid asks amount, date, mode, UTR, TDS deducted, funding (College / CSR). It generates the paid tax invoice (CGST+SGST or IGST, SAC 999293, amount in words, PAID stamp, bank details), attaches it to the contract row and sends it to the college's notifications and Contracts → Paid invoices.
- Trainer: Mark as paid asks date, mode, UTR; generates the payment advice (sessions, days × per-day, allowances, TDS 10% under 194J, net) and shares it on the trainer's Invoice page.

### Requirement form
`super-admin/colleges.html` now asks total student strength, number of batches, **training hours per day (required)**, daily start/end time and venue, so the MOU can be filled without retyping.

### To fill before going live
Company registered address, GSTIN, PAN, bank name/account/IFSC, signatory and signature image, and the opening wording from your existing MOU. These show as red "[…]" placeholders until filled (set them once in Profile on the real system).

### Prototype note
The flows store their state in the browser (localStorage) so the admin, college and trainer pages react to each other. Clear site data to reset the demo.


## Course Studio (super-admin/course-content.html · assets/studio.js)

Replaces the old single "Add content" form. Matches today's live data model (course → module → sub-module, a PDF and learn-more links per item, a gated course-book PDF per module) and adds:
- **Any depth**: module → sub-module → topic → sub-topic. Every row has rename-in-place, add inside, details, delete (with a count of what goes with it), drag to reorder (within the same parent) and Move up / down buttons.
- **Build from outline**: paste a syllabus; indentation sets the level. Add to the course or replace its structure.
- **Bulk upload PDFs**: choose many files; each is matched to the item whose name is in the file name (`java-fundamentals-arrays-strings.pdf` → Arrays & strings). Unmatched files are listed.
- **New course**: blank, from an outline, or a copy of an existing course. New courses start as Draft.
- **Share with batches**: per batch and per module, choose when students can open the module content and the course book — available now, after session N, on a date, after the training is completed, only on request, or hidden. Quick presets: module by module, everything after completion, everything now. A plain-language "what students will see" summary updates live. Students are notified as modules open.
- **Course settings**: name, domain, Live/Draft, description, "Show on the public website" (feeds Edit Site → Courses) and "Sell the course books on the Buy page" (feeds the Buy manager), delete with type-the-name confirmation.

## Edit Site hub and Buy (super-admin/edit-site.html, edit-site-buy.html, public/buy.html, public/buy-detail.html · assets/buy.js)

- Edit Site is grouped into Pages / Store / Across every page, each card with Edit and View.
- **Buy manager** has three tabs:
  - Listings: price and original price (shows "% off"), headline, Live/Hidden, **who can see and buy it** (everyone / logged-in students only / students of chosen colleges), feature on the Home page, and a live preview card. "What's included" lists every course book with free-preview pages (bulk "first N pages free for all"), a lock to hide a book's preview, and remove. Add listing picks a course from Course Studio and creates one book per module.
  - Orders: to-verify / paid / rejected with UTR; Confirm requires ticking "I found this payment", then the books are emailed; Reject sends a reason; Resend books.
  - Payment settings: UPI ID, payee name, sender email, optional QR image (otherwise generated from the UPI ID), with the buyer's payment screen preview.
- **Public Buy**: cards for live, public listings (featured first). Detail page shows every book with its free preview, price/discount, and a UPI payment dialog that collects name, email, phone and the 12-digit UTR and creates an order "awaiting verification".

## Live-site issue found (19 Nov 2026)
Seven of the eight Edit Site pages on learnbeingforward.in return HTTP 500 ("This page couldn't load"): courses, technologies, employees, contacts, home, footer, company-contact. Only /edit-site/buy loads.

## Build order
`python3 super_admin.py && python3 college.py && python3 trainer.py && python3 student.py && python3 docs_pages.py && python3 studio_pages.py && python3 extra_pages.py && python3 detail_pages.py && python3 student_extra.py && python3 trainer_extra.py && python3 college.py && python3 college_extra.py && python3 super_v2.py && python3 cert_pages.py && python3 index_build.py` — studio_pages.py and extra_pages.py must run after super_admin.py (it replaces course-content.html and edit-site.html).


## Pages added from the 19 Nov live-site crawl
| Live route | Design |
|---|---|
| /lms/company/attendance/certificates (course → college → semester → students) | super-admin/certificates.html — one page with drill-down chips, attendance bar with the 75% line, exception requests, "Approve all eligible" |
| /lms/company/trainers/batches/requests | super-admin/trainers-batches-requests.html — split / move / new-batch requests with Approve, Reject, Ask for details |
| /lms/company/trainers/batches/calendar | super-admin/trainers-batches-calendar.html — month view of batch start dates, day detail, all start dates |
| /lms/company/edit-site/buy/orders | super-admin/edit-site-buy.html#orders |
| /coding-patterns | public/coding-patterns.html — 14 level cards |
| /coding-patterns/level-NN | public/coding-patterns-level.html?l=NN — pattern list, array stage, step explanation, variables, highlighted Java code, play / step / speed / full screen |
| /buy/<course>/<book> | public/buy-module.html?id=…&b=… — the book, its sub-modules, free preview, previous/next book |
| /buy/<course>/checkout | public/buy-checkout.html?id=… — details → pay by UPI (QR + UTR) → done, with order summary |
| /lms/company/students?studentId=… | super-admin/student-detail.html — profile, edit / reset password / delete, enrolment cards with data warnings |
| …&enrollmentId=… | super-admin/enrollment-detail.html — attendance tiles, course progress, session timeline with Present/Absent filter, "topic not recorded" flags |
| /lms/company/colleges?contractId=… | super-admin/college-contract.html — contract details, progress (request → approval → MOU → training → invoice) |
| /lms/company/trainers/schedule?trainerId=… | super-admin/trainer-sessions.html — sessions by day and slot, upcoming / completed |
| /lms/company/attendance?collegeId=… | super-admin/attendance-college.html — course averages against the 75% line, batches |
| …&batchId=… | super-admin/attendance-batch.html — students, classes, attendance, certificate status, approve one / all eligible |
| /lms/company/trainers/batches?collegeId=…&batchId=… | super-admin/batch-admin.html — batch students, classes recorded, move to course |
| /lms/company/trainers/invoices?invoiceId=… | super-admin/trainer-invoice.html — totals, trainer note, sessions grouped by batch with dates and roster |

### Data issues seen on the live site (19 Nov 2026)
- Aadhya Joshi's Full-Stack certificate with 0 classes is an approved college exception (intended) — admin pages now label it "By exception". Her Java & DSA record has 18/20 classes and a trainer-approved certificate but no trainer or batch linked.
- Crestview Java & DSA contract: requested Sep 18 and approved Sep 25, after its training dates (Sep 1–10).
- Many sessions have no topic recorded.
- The course is called "Placement Training Program" in batches and schedules but "Java & DSA" elsewhere.

## Student portal (19 Nov 2026 crawl)
| Live route | Design |
|---|---|
| /lms/student/certificate/<id> | student/certificate.html?c=java / ?c=fsd — A4 landscape certificate: double border, corner frames, watermark, seal, signature, training period, duration, attendance (left out for exception certificates), certificate ID and verify link; prints to one page |
| (new) certificate verification | public/verify.html?id=… — anyone can check a certificate ID |
| /lms/student/content/view?contentId=… | student/content-view.html — module item list (open / request access / locked), page viewer with page and zoom controls, the student's name and email as a watermark, no right-click, hidden when printing, learn-more links, next item |

Student-side issues seen live: the dashboard's "Assessments due 2" counts two assessments whose windows are closed (should be 0); "Overall attendance 45%" averages in the exception course with 0 classes (the design shows 90% — leave out courses with no classes held); the Java & DSA attendance card says "approved by your trainer" while no trainer is assigned.

## Trainer portal (19 Nov 2026 crawl, logged in as Anil Deshmukh)
| Live route | Design |
|---|---|
| /lms/trainer (dashboard is only the details + bank form) | trainer/dashboard.html — tiles, MOU to sign, "Action needed" (overdue attendance, missing bank details), my batches with progress, sessions. The details and bank form stays on trainer/details.html |
| /lms/trainer/batches?batchId=… | trainer/batch-detail.html — overdue / completed / upcoming sessions, student roster, module progress |
| /lms/trainer/attendance?sessionId=… | trainer/mark-attendance.html — nobody pre-marked; live counter of present / absent / not marked; Submit stays disabled until every student is marked; confirmation of what was unlocked and invoiced |

Trainer-side issues seen live:
- Mark attendance opens with every student already set to Present ("5 present · 0 absent"), so pressing Submit without checking marks absent students present, unlocks content for them and bills the hours.
- Sessions from Sep 16 are still listed under "Upcoming & pending" and as "Upcoming (2)" in the batch, two months after the date; the dashboard says "Upcoming sessions 0". Past sessions without attendance should show as overdue.
- The batch name repeats in the schedule: "Sunrise Engineering College — Backend Development — Backend Development — Batch 1".
- The trainer dashboard only contains the profile and bank form; there's no overview of what needs doing.
| (not on the live site) trainer MOU section | trainer/mou.html — new "MOU" menu item: MOUs waiting for a signature first (download → upload signed copy → share), signed MOUs with download, how it works, what every MOU covers, notifications. Shared MOUs also appear on Dashboard and My Batches. |

## College portal (19 Nov 2026 crawl)
| Live route | Design |
|---|---|
| /lms/college/content-requests (new menu item) | college/content-requests.html — student requests for missed material with course, module, attendance and reason; Approve / Decline; past decisions |
| /lms/college/contracts?contractId=… | college/contract-detail.html — details and progress (request → approval → MOU → training → invoice), download signed MOU |
| /lms/college/contracts?invoiceId=… | college/invoice-detail.html — students, hours, fee, GST, total, due date; **I have paid this invoice** asks for amount, date, mode, UTR, TDS and optional proof, then shows "waiting for Learn Being Forward to confirm"; download the unpaid invoice (shows "Payment due", no PAID stamp). Accounts then use Mark as paid, which creates the paid tax invoice |
| /lms/college/students?studentId=… and …&enrollmentId=… | college/student-detail.html, college/enrollment-detail.html — the same records as the admin view, without delete |

College-side issues seen live:
- Robotics: requested and approved on Nov 6, after its training dates (Oct 1–10) — same pattern as Java & DSA on the admin side.
- The Data Science / AI invoice says 12 hours for a 1-day × 6-hour training.
- The same ₹27,000 invoice appears three times in Recent decisions (Accepted, Rejected, Accepted).
- Branch counts differ between Students (Unspecified 23) and Profile (Unspecified 19), and "CSE" and "Computer Science" are listed as separate branches.
- Contracts shows "Paid to date ₹0" while one invoice has been accepted — expected until payment is confirmed, but the "I have paid" step isn't visible from the list.

## Second scan — 19 Nov 2026, 13:35 (Super Admin + public site)
New or changed on the live site, and the matching design:
| Live route | Design |
|---|---|
| /lms/company/buyers (new menu item under Accounts) | super-admin/buyers.html — buyer accounts made automatically when an order is confirmed paid; resend books, reset password; how buyer accounts are made |
| /lms/company/employee-access (now a detailed permission list) | super-admin/employee-access.html — every permission from the live site grouped (Overview, Accounts, Registrations & approvals, Assessments, Other) with All / None per group, parent ticks its children, live count; employee list with what each can access, edit, reset password, remove |
| /lms/company/assessments?assessmentId=… (4-step builder) | super-admin/assessment-builder.html — Details, Sections & questions (MCQ / MCQ + code / Code · 4 languages, create or add from bank, shuffle), Proctoring & rules, Review & publish; published-assessment warning. The full question builders are in the separate Assessment Portal design set |
| /lms/company/colleges?invoiceId=… | super-admin/college-invoice.html — invoice totals, progress (sent → accepted → college reports payment → marked paid), PDF and Mark as paid |
| /lms/company/profile (bank details + GST number) | already in super-admin/profile.html; the MOU and invoice templates read these fields |
| /lms/company/site-builder (AI Create, 5 steps) | matches the Site Builder design (super-admin/site-builder.html) |

Unchanged: the public site pages, and Edit Site — 7 of its 8 sub-pages still return a server error.

### College portal — second scan (13:40)
Same pages as before. Two small additions found and designed:
- Query from Student now lists **Your requests** (exceptions sent and their decisions) → added to college/queries.html, with a rule that a reason needs at least 20 characters (Aadhya Joshi's approved exception reason on the live site is just "hh").
- Batches has **Undo most recent batch** → added to college/batches.html with a confirmation showing which batch and how many students.
- Batch names still repeat the course: "Robotics — Robotics — Batch 1".

### Admin 1, trainer and student — second scan (13:43–13:46)
- Admin 1 (employee): Buyers is now visible; Assessments is blocked as expected; no other new pages.
- Trainer and student: unchanged since the first scan — the existing designs cover every page, and the issues listed earlier are still live.

## Coding Patterns lock (checked live, 19 Nov 2026 13:50)
Live behaviour: in each of the 14 levels the first pattern is free; the others show 🔒 "Purchase to unlock" with a "Buy this course" button.
Design (public/coding-patterns.html, public/coding-patterns-level.html, assets/cp.js): the hub says "1 free, N with the course" on every level and shows a banner; in a level, locked patterns are marked 🔒 in the list, the stage and code are blurred behind "Purchase to unlock" with **Get Coding Patterns · ₹499** (goes to that course's Buy page) and **Try the free pattern**. Owners see everything unlocked (`?owned=1` shows that state in the prototype).

Two problems with the live lock:
1. **It can be bypassed.** Every level file (e.g. /coding-patterns/level-02.html) contains the code and steps for all 100 patterns, and the lock is only an overlay drawn over the page. Anyone can remove it in the browser's developer tools and use everything. Fix: send only the free pattern's data to visitors who haven't bought; load the rest from the server after checking the signed-in buyer's paid order.
2. **Buyers can't unlock it.** Nothing on the level pages checks whether the visitor has bought the course, so a buyer still sees the lock. And "Buy this course" goes to /buy (all books) instead of /buy/coding-patterns.

### Getting to Coding Patterns on the public site
Live: the only way in is a "Coding Pattern Artifacts" card at the bottom of /courses (plus the "Coding patterns (14)" filter tab). Nothing on the home page, the top menu, the footer or the Buy page links to it.
Design: public/courses.html has a working **Coding patterns (14)** filter tab and a full-width Coding Pattern Visualisers block (Open Coding Patterns, Get the full course · ₹499, and all 14 levels as direct links); public/home.html has a "See DSA patterns move" block; the footer has Coding Patterns and Buy books links. Suggest also adding "Coding Patterns" to the top menu.

## Phone and tablet layout (≤ 900px) — assets/layout.js + styles.css
- **Public site:** logo + hamburger; the menu slides in from the left with every page, Coding Patterns, Sign up / Login and contact details. Hero text and spacing shrink; footer columns stack.
- **Portals:** compact top bar (hamburger, logo, bell, avatar). A **bottom tab bar** shows the first four sections plus **More**; if you are in another section it takes the fourth slot so the current section is always highlighted. **More** / hamburger opens a drawer with every section and its pages (current one open and highlighted) and Log out. Sub-page links wrap as chips under the header.
- **No sideways scrolling anywhere:** every table turns into stacked cards on phones (each value labelled with its column name, added automatically by layout.js — also for tables drawn later); tabs wrap into pills; code wraps; button rows wrap; dialogs become bottom sheets above the tab bar. Checked on all 100 pages at 390px width: nothing is wider than the screen.
- **Motion:** buttons lift slightly with a shadow on hover and press down on click; cards, list rows, chips and tabs get hover backgrounds; dialogs, toasts and cards fade/pop in; the drawer slides in. All motion is switched off for people who set "reduce motion".
- **Fix:** buttons on dark backgrounds (Coding Patterns "Get the full course", visualiser controls, ghost buttons) no longer turn navy-on-navy and disappear on hover.

## Certificates (assets/cert.js, cert.css)
Layout follows the sample the owner shared: A4 landscape, thin grey border with corner squares, soft guilloche lines and a faint **LBF · LEARN BEING FORWARD** watermark; the **college name centred in the space left of the ribbon** (where the sample has its logo) with a gold rule under it — names over 34 characters split onto two balanced lines automatically, or the admin chooses the two lines; then date, student name, "has successfully completed", course, and the programme line; signature, name and title bottom-left; a light ribbon on the right with "COURSE CERTIFICATE" and a round seal — "Learn Being" on top and "Forward" below in the brand colours, ring text "EDUCATION IS FOR EVERYONE · LEARN BEING FORWARD"; bottom-right "Verify at" link, note and a **Verify certificate** button.
- **Created automatically** with each batch (course + college from the batch). Student name, course, issue date and certificate ID fill in by themselves.
- **Batch page** (super-admin/batch-admin.html) has a Certificate section at the top: live thumbnail, issued / eligible counts, **Edit certificate** and Approve certificates.
- **Editor** (super-admin/certificate-editor.html): college name as printed, optional two lines, course name, ribbon heading, wording, signatory, typed or uploaded signature, verification note; preview any student of the batch; Save applies to every certificate in the batch.
- **Student download** (student/certificate.html): the same certificate, Print / Save as PDF (one A4 landscape page), link to the verification page.
- **Verification** (public/verify.html?id=…): opens on the Learn Being Forward website with the normal menu — heading "Certificate", a **Valid certificate · Verified** panel (awarded to, course, college, issue date, ID), the certificate itself scaled to the screen, and a box to check another ID. Unknown IDs show "No certificate found". The link printed on every certificate is learnbeingforward.in/verify/<ID>; on the server that route should show this page.

## Assessment portal screens (assessment/, assets/exam.css)
Nine screens in LBF colours (navy band, gold actions, cream background), generated by build/exam_pages.py:
system-check → instructions → coding (editor, timer, question numbers, webcam REC tile) → run-submit-states (compile error / wrong answer on a visible test / submit with hidden tests) → submitted (summary, section table, question map).
Admin: admin-create-assessment (details, section cards, coding question table with validation status, proctoring rules), admin-add-aptitude, admin-add-technical (code snippet + "run snippet to verify"), admin-add-coding (9-step order: basics → statement → I/O → constraints → sample → test cases with visible/hidden + weights → 4-language boilerplate with editable/locked lines → reference solution → validation + Run/Submit rules).
Improvements over the earlier version: violation table colour-coded by severity, auto-save indicator, hidden-test verdicts without inputs, validation checks (reference passes, empty boilerplate fails, slowest test vs limit), test weights summing to 100%.
