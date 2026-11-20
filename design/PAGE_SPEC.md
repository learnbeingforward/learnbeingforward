# PAGE SPEC — every page, point by point

Generated from the design files after their scripts ran (1440px wide). For each page: the design file, the route to build it at, and everything that must appear on it, in order.
Text is the real text from the design (buttons are written in normal case here; CSS makes them UPPERCASE — keep that in CSS, not in the text).

**Routes marked "(new)" do not exist on the live site yet. All other routes are what the live site uses today — check them against `app/` and keep the existing URL if it differs.**

Legend: `*required` = must show the required marker and block submit when empty. `[widget: x]` = dynamic block rendered by assets/flows.js (see the prompt, section 7).

## Contents
- [Public website](#public-website)
- [Login & sign-up](#login--sign-up)
- [Super Admin portal (company)](#super-admin-portal-company)
- [College portal](#college-portal)
- [Trainer portal](#trainer-portal)
- [Student portal](#student-portal)
- [Documents (MOU / invoice / payment advice viewer)](#documents-mou--invoice--payment-advice-viewer)
- [Assessment portal (exam + question builders)](#assessment-portal-exam--question-builders)

## Public website

14 pages.

### About — `public/about.html`
- **Route:** `/about`
- **Layout:** public · active menu: About · CSS: styles.css · JS: —
- **Title:** Building job-ready talent, together — *A skills-training company working directly with schools, colleges & universities and companies — from classroom to career.*
- **Summary tiles (left→right):** Colleges = 75+ · Experience = 4+ yrs
- **Sections in order:** Courses → Campus partnerships → Placements → Lohit Kumar
- **Reference:** open `public/about.html` in a browser; full page height at 1440px ≈ 1229px.

### Checkout — `public/buy-checkout.html`
- **Route:** `/buy/[course]/checkout`
- **Layout:** public · active menu: Buy · CSS: styles.css · JS: buy.js
- **Title:** Checkout — *Two quick steps: your details, then pay by UPI.*
- **Sections in order:** Where should we send your books?
- **Form fields (in order):**
  - Your name * [text] *required
  - Email — your books are sent here * [email] *required
  - Phone (optional) [tel]
- **Buttons:** Continue to payment
- **Reference:** open `public/buy-checkout.html` in a browser; full page height at 1440px ≈ 1076px.

### Coding Patterns — `public/buy-detail.html`
- **Route:** `/buy/[course]`
- **Layout:** public · active menu: Buy · CSS: styles.css · JS: buy.js
- **Title:** Coding Patterns — *100 data-structure & algorithm patterns, worked through step by step.*
- **Sections in order:** Coding Patterns
- **Buttons:** Preview · Buy now
- **Links:** Programming Basics — Complete Course Notes → buy-module.html?id=coding-patterns&b=0 · Arrays and Strings — Complete Course Notes → buy-module.html?id=coding-patterns&b=1 · Searching and Sorting — Complete Course Notes → buy-module.html?id=coding-patterns&b=2 · Hashing — Complete Course Notes → buy-module.html?id=coding-patterns&b=3 · Linked Lists — Complete Course Notes → buy-module.html?id=coding-patterns&b=4 · Stacks and Queues — Complete Course Notes → buy-module.html?id=coding-patterns&b=5 · Recursion and Backtracking — Complete Course Notes → buy-module.html?id=coding-patterns&b=6 · Trees — Complete Course Notes → buy-module.html?id=coding-patterns&b=7 · Heaps — Complete Course Notes → buy-module.html?id=coding-patterns&b=8 · Graphs — Complete Course Notes → buy-module.html?id=coding-patterns&b=9 · Greedy — Complete Course Notes → buy-module.html?id=coding-patterns&b=10 · Dynamic Programming — Complete Course Notes → buy-module.html?id=coding-patterns&b=11 · Bit Manipulation — Complete Course Notes → buy-module.html?id=coding-patterns&b=12 · Advanced Patterns — Complete Course Notes → buy-module.html?id=coding-patterns&b=13
- **Status pills used:** 50% off
- **Reference:** open `public/buy-detail.html` in a browser; full page height at 1440px ≈ 1840px.

### Course book — `public/buy-module.html`
- **Route:** `/buy/[course]/[book]`
- **Layout:** public · active menu: Buy · CSS: styles.css · JS: buy.js
- **Title:** Programming Basics — Complete Course Notes — *Book 1 of 14 in Coding Patterns · 40 pages*
- **Sections in order:** Sub-modules in this book (11)
- **Buttons:** Read 3 free pages · Next book · Buy now · See all books
- **Status pills used:** Full access after purchase
- **Reference:** open `public/buy-module.html` in a browser; full page height at 1440px ≈ 1736px.

### Buy — `public/buy.html`
- **Route:** `/buy`
- **Layout:** public · active menu: Buy · CSS: styles.css · JS: buy.js
- **Title:** Own the course, at your own pace — *Full course books and guides, emailed to you the moment your payment is confirmed. Read the free preview pages before you buy.*
- **Sections in order:** Coding Patterns → Frontend Development → Programming
- **Links:** Coding Patterns14 course books50% off Coding Patte → buy-detail.html?id=coding-patterns · Frontend Development3 course books Frontend Develo → buy-detail.html?id=frontend-development · Programming4 course books ProgrammingCore programm → buy-detail.html?id=programming
- **Reference:** open `public/buy.html` in a browser; full page height at 1440px ≈ 1179px.

### Level 01 — `public/coding-patterns-level.html`
- **Route:** `/coding-patterns/level-[NN]`
- **Layout:** public · active menu: Courses · CSS: styles.css · JS: cp.js
- **Title:** Pattern visualiser — *Pick a pattern, then play it or step through one line at a time.*
- **Sections in order:** 
- **Buttons:** Level 02 · Full screen · Linear Searchfree · Min / Max Tracking🔒 · Accumulator🔒 · Counter🔒 · Swap🔒 · Digit Extraction🔒 · Flag / Sentinel🔒 · Early Exit / Guard Clause🔒 · Nested Loops🔒 · Parity / Toggle🔒 · Reset · Back · Play · Step
- **Links:** All levels → coding-patterns.html
- **Status pills used:** Step 1 of 7
- **Reference:** open `public/coding-patterns-level.html` in a browser; full page height at 1440px ≈ 1261px.

### Coding Patterns — `public/coding-patterns.html`
- **Route:** `/coding-patterns`
- **Layout:** public · active menu: Courses · CSS: styles.css · JS: cp.js
- **Title:** 100 patterns, 14 levels — *Watch each data-structure and algorithm pattern run step by step, with the code line highlighted as it happens.*
- **Sections in order:** Want the full notes for every pattern?
- **Buttons:** Get the Coding Patterns books
- **Links:** Get the course → buy-detail.html?id=coding-patterns · Level 01Programming Basics10 patterns · 1 free, 9  → coding-patterns-level.html?l=1 · Level 02Arrays and Strings6 patterns · 1 free, 5 w → coding-patterns-level.html?l=2 · Level 03Searching and Sorting6 patterns · 1 free,  → coding-patterns-level.html?l=3 · Level 04Hashing4 patterns · 1 free, 3 with the cou → coding-patterns-level.html?l=4 · Level 05Linked Lists5 patterns · 1 free, 4 with th → coding-patterns-level.html?l=5 · Level 06Stacks and Queues4 patterns · 1 free, 3 wi → coding-patterns-level.html?l=6 · Level 07Recursion and Backtracking4 patterns · 1 f → coding-patterns-level.html?l=7 · Level 08Trees5 patterns · 1 free, 4 with the cours → coding-patterns-level.html?l=8 · Level 09Heaps3 patterns · 1 free, 2 with the cours → coding-patterns-level.html?l=9 · Level 10Graphs7 patterns · 1 free, 6 with the cour → coding-patterns-level.html?l=10 · Level 11Greedy3 patterns · 1 free, 2 with the cour → coding-patterns-level.html?l=11 · Level 12Dynamic Programming8 patterns · 1 free, 7  → coding-patterns-level.html?l=12 · Level 13Bit Manipulation3 patterns · 1 free, 2 wit → coding-patterns-level.html?l=13 · Level 14Advanced Patterns4 patterns · 1 free, 3 wi → coding-patterns-level.html?l=14
- **Notes / empty states:** The first pattern in every level is free. Get the course to unlock all 72 patterns.
- **Reference:** open `public/coding-patterns.html` in a browser; full page height at 1440px ≈ 1559px.

### Contact — `public/contact.html`
- **Route:** `/contact`
- **Layout:** public · active menu: Contact · CSS: styles.css · JS: —
- **Title:** Let's talk training — *Whether you're a college, a company or a student — reach out and our team will get back to you.*
- **Sections in order:** Send us a message → Lohit Kumar A B
- **Form fields (in order):**
  - Name * [text] *required
  - Email * [email] *required
  - I am aCollege / UniversityCompanyStudent [select] options: College / University / Company / Student / Trainer
  - Phone (optional) [tel]
  - Message * [textarea] *required
- **Buttons:** Send message · Email Rahul Sharma · Email Divya Menon · Email Vikram Singh · Email Neha Kulkarni · Email Sanjay Gupta · Email Meera Pillai · Email Harsh P
- **Links:** +91 99729 34418 → tel:+919972934418 · support@learnbeingforward.in → mailto:support@learnbeingforward.in
- **Reference:** open `public/contact.html` in a browser; full page height at 1440px ≈ 1458px.

### Java & DSA — `public/course-detail.html`
- **Route:** `/courses/[id]`
- **Layout:** public · active menu: Courses · CSS: styles.css · JS: —
- **Title:** Java & DSA — *From core syntax and OOP through collections, concurrency and design patterns, alongside a full DSA track covering arrays, trees, graphs, dynamic programming and mock coding interviews.*
- **Tabs / segmented controls:** What you'll learn | Format | FAQs
- **Sections in order:** Programming track → DSA track → Want this course for your college or company?
- **Buttons:** What you'll learn · Format · FAQs · Enroll your college · Contact us about this course
- **Status pills used:** 5 topics · 4 topics
- **Notes / empty states:** Guided coding labs with daily practice problems and instructor code review.
- **Reference:** open `public/course-detail.html` in a browser; full page height at 1440px ≈ 1357px.

### Courses — `public/courses.html`
- **Route:** `/courses`
- **Layout:** public · active menu: Courses · CSS: styles.css · JS: —
- **Title:** Training built for placement outcomes — *From our flagship Java & DSA program to focused frontend, backend, data and robotics courses — everything is built around what students need to get hired.*
- **Tabs / segmented controls:** All (27) | Technical (7) | Aptitude (4) | Soft skills (1) | Coding patterns (14)
- **Sections in order:** Technical courses → Java & DSA → Full-Stack Development → Frontend Development → Backend Development → Data Science / AI Fundamentals → Robotics → Programming → Aptitude training → Soft skills → Coding patterns → Coding Pattern Visualisers
- **Buttons:** All (27) · Technical (7) · Aptitude (4) · Soft skills (1) · Coding patterns (14) · Open Coding Patterns · Get the full course · ₹499
- **Links:** Flagship Java & DSA Deep, interview-focused Java a → course-detail.html · Full-Stack Development Frontend, backend, database → course-detail.html · Frontend Development Building modern, responsive,  → course-detail.html · Backend Development APIs, databases, authenticatio → course-detail.html · Data Science / AI Fundamentals Python data science → course-detail.html · Robotics Sensors, actuators and programming for ro → course-detail.html · Programming Language-by-language deep dives — C, C → course-detail.html · Quantitative AptitudePlacement aptitude training → course-detail.html · Logical ReasoningPlacement aptitude training → course-detail.html · Verbal ReasoningPlacement aptitude training → course-detail.html · Non-Verbal ReasoningPlacement aptitude training → course-detail.html · Soft SkillsCommunication, group discussion, interv → course-detail.html · 01Programming Basics → coding-patterns-level.html?l=1 · 02Arrays and Strings → coding-patterns-level.html?l=2 · 03Searching and Sorting → coding-patterns-level.html?l=3 · 04Hashing → coding-patterns-level.html?l=4 · 05Linked Lists → coding-patterns-level.html?l=5 · 06Stacks and Queues → coding-patterns-level.html?l=6 · 07Recursion and Backtracking → coding-patterns-level.html?l=7 · 08Trees → coding-patterns-level.html?l=8 · 09Heaps → coding-patterns-level.html?l=9 · 10Graphs → coding-patterns-level.html?l=10 · 11Greedy → coding-patterns-level.html?l=11 · 12Dynamic Programming → coding-patterns-level.html?l=12 · 13Bit Manipulation → coding-patterns-level.html?l=13 · 14Advanced Patterns → coding-patterns-level.html?l=14
- **Status pills used:** Flagship
- **Reference:** open `public/courses.html` in a browser; full page height at 1440px ≈ 2053px.

### Learn Being Forward — Placement-Focused Technical Training — `public/home.html`
- **Route:** `/`
- **Layout:** public · active menu: Home · CSS: styles.css · JS: —
- **Title:** Learn Being Future-Ready — *We deliver placement-focused technical training to school students, college & university students, and corporate freshers — through direct partnerships with colleges and companies.*
- **Summary tiles (left→right):** Languages taught = 6+ · Frameworks covered = 10+ · Colleges trained = 75+ · Students placement-ready = 1000s
- **Sections in order:** 4 pillars that take students from the classroom to career-ready → Programming & Full-Stack Training → Aptitude & Soft-Skills Training → Placement Support & Campus Partnerships → Corporate Onboarding Training → What students learn with us → Ready to build a placement-ready cohort? → See DSA patterns move
- **Buttons:** Partner with us · Explore courses · Open Coding Patterns · All courses
- **Links:** See all technologies → → technologies.html · 01Programming Basics → coding-patterns-level.html?l=1 · 02Arrays and Strings → coding-patterns-level.html?l=2 · 03Searching and Sorting → coding-patterns-level.html?l=3 · 04Hashing → coding-patterns-level.html?l=4 · 05Linked Lists → coding-patterns-level.html?l=5 · 06Stacks and Queues → coding-patterns-level.html?l=6 · +8more levels → coding-patterns.html
- **Reference:** open `public/home.html` in a browser; full page height at 1440px ≈ 2077px.

### Employees & Trainers — `public/team.html`
- **Route:** `/team`
- **Layout:** public · active menu: Team · CSS: styles.css · JS: —
- **Title:** The people behind the training — *Full-time employees and freelance trainers who deliver our programs across colleges and companies.*
- **Sections in order:** Lohit Kumar → Ananya Rao → Chidananda K → Sumitra S → Arjun Mehta → Priya Nair → Karthik Iyer
- **Buttons:** All (7) · Employees (4) · Freelance (3)
- **Status pills used:** 4+ yrs · 3+ yrs · 7+ yrs · Freelance · 6+ yrs · 2+ yrs · 1+ yrs
- **Reference:** open `public/team.html` in a browser; full page height at 1440px ≈ 1327px.

### Technologies — `public/technologies.html`
- **Route:** `/technologies`
- **Layout:** public · active menu: Technologies · CSS: styles.css · JS: —
- **Title:** Everything we teach, in one place — *The languages, frameworks, tools and skill areas covered across our courses.*
- **Sections in order:** Languages → Frontend → Backend → Databases → Tools & DevOps → Data & AI → Aptitude → Soft skills → Robotics
- **Status pills used:** 7 · 6 · 4 · 3
- **Reference:** open `public/technologies.html` in a browser; full page height at 1440px ≈ 1324px.

### Certificate — `public/verify.html`
- **Route:** `/verify/[certificateId]  (new)`
- **Layout:** public · CSS: cert.css, styles.css · JS: cert.js
- **Title:** Certificate — *Aadhya Joshi · Full-Stack Development*
- **Sections in order:** 
- **Form fields (in order):**
  - Check another certificate [text] placeholder="Certificate ID, e.g. LBF-C-2026-00417"
- **Buttons:** Verify
- **Links:** learnbeingforward.in/verify/LBF-C-2026-00593 → ../public/verify.html?id=LBF-C-2026-00593 · ✓ Verify certificate → ../public/verify.html?id=LBF-C-2026-00593
- **Status pills used:** Verified
- **Reference:** open `public/verify.html` in a browser; full page height at 1440px ≈ 1807px.

## Login & sign-up

4 pages.

### Forgot password — `auth/forgot-password.html`
- **Route:** `/forgot-password`
- **Layout:** public · CSS: styles.css · JS: —
- **Title:** Forgot your password? — *Enter your account email and we'll send you a secure reset link.*
- **Sections in order:** Check your inbox
- **Form fields (in order):**
  - Email * [email] *required
- **Buttons:** Send reset link · Resend in 0:42
- **Links:** ← Back to login → login.html
- **Reference:** open `auth/forgot-password.html` in a browser; full page height at 1440px ≈ 927px.

### Login — `auth/login.html`
- **Route:** `/login`
- **Layout:** public · CSS: styles.css · JS: —
- **Title:** Log in to your portal — *One login for Super Admin, College, Trainer and Student accounts — you'll land on your own dashboard.*
- **Tabs / segmented controls:** Login | Sign Up
- **Form fields (in order):**
  - Email * [email] *required placeholder="you@college.edu"
  - Password *Forgot password? [password] *required
- **Checkboxes / toggles:** Keep me signed in on this device
- **Buttons:** Login · Show password · Log in
- **Links:** Sign Up → signup.html · Forgot password? → forgot-password.html
- **Notes / empty states:** Example error state: Incorrect email or password. 2 attempts left before the account is locked for 15 minutes.
- **Reference:** open `auth/login.html` in a browser; full page height at 1440px ≈ 1214px.

### Reset password — `auth/reset-password.html`
- **Route:** `/reset-password`
- **Layout:** public · CSS: styles.css · JS: —
- **Title:** Set a new password — *Used from the email link, and on first login for accounts created by an admin.*
- **Sections in order:** Password updated
- **Form fields (in order):**
  - New password * [password] *required
  - Confirm new password * [password] *required
- **Checkboxes / toggles:** Log me out of all other devices
- **Buttons:** Show password · Update password · Go to login · Request a new link
- **Reference:** open `auth/reset-password.html` in a browser; full page height at 1440px ≈ 1073px.

### Sign Up — `auth/signup.html`
- **Route:** `/signup`
- **Layout:** public · CSS: styles.css · JS: —
- **Title:** Create your student account — *Only students already added by their college can sign up here.*
- **Tabs / segmented controls:** Login | Sign Up
- **Form fields (in order):**
  - Full name * [text] *required
  - Email * [email] *required
  - College * [select] *required options: Select your college
  - Password * [password] *required
  - Confirm password * [password] *required
- **Checkboxes / toggles:** I agree to the Terms and Privacy Policy
- **Buttons:** Sign Up · Show password · Create account
- **Links:** Login → login.html · Log in → login.html
- **Notes / empty states:** Use the same email your college gave us. Colleges and companies get accounts from Learn Being Forward directly. ‖ Example error state: This email isn't on your college's student list. Ask your placement officer to add you, then try again.
- **Reference:** open `auth/signup.html` in a browser; full page height at 1440px ≈ 1578px.

## Super Admin portal (company)

46 pages.

### Account Details — `super-admin/account-details.html`
- **Route:** `/lms/company/account-details`
- **Layout:** app · role `super-admin` · active menu: Accounts, Account Details · CSS: styles.css · JS: —
- **Title:** Account details — *One directory of every student, college, trainer and admin account.*
- **Summary tiles (left→right):** Students = 293 · Colleges = 7 · Trainers = 3 · Admins = 3 · Trainer dues = ₹0
- **Tabs / segmented controls:** Students (293) | Colleges (7) | Trainers (3) | Admins / employees (3)
- **Sections in order:** 
- **Table 1:** columns `Name | Phone | College | Courses & attendance | Password` · 5 sample rows · first row: AJAadhya Joshiaadhya.joshi6@extradata.in | — | Crestview College of Engineering | Java & DSA — 90% | Generate new password
- **Buttons:** Students (293) · Colleges (7) · Trainers (3) · Admins / employees (3) · Export · Generate new password · ‹ · 1 · 2 · 3 · ›
- **Notes / empty states:** Passwords are one-way hashes and can never be read back. Generate new password sets a new one, shows it once, and overwrites any password se
- **Reference:** open `super-admin/account-details.html` in a browser; full page height at 1440px ≈ 1235px.

### Add Account — `super-admin/add-account.html`
- **Route:** `/lms/company/add-account`
- **Layout:** app · role `super-admin` · active menu: Accounts, Add Account · CSS: styles.css · JS: —
- **Title:** Add account — *Create student, college, trainer, second-admin or employee accounts and hand out the credentials yourself.*
- **Tabs / segmented controls:** Student | College | Trainer | Second admin | Employee
- **Sections in order:** College tab → Trainer tab → Success modal (after any create) → Account created
- **Form fields (in order):**
  - Full name * [text] *required
  - Email * [email] *required
  - USN / roll number [text]
  - Father's name [text]
  - Branch [select] options: Select branch / Computer Science / Information Technology / Electronics & Communication / Mechanical Engineering
  - Semester [select] options: — / 1 / 2 / 3 / 4 / 5 / 6 / 7
  - College [select] options: Select college / Crestview College of Engineering / Global Institute of Technology
  - College / organization name * [text] *required
  - College contact email [email]
  - Admin contact name * [text] *required
  - Admin login email * [email] *required
  - Full name * [text] *required
  - Login email * [email] *required
  - Phone [tel]
  - Hourly rate (₹) [number]
- **Buttons:** Student · College · Trainer · Second admin · Employee · Single student · Bulk upload (Excel) · Create student account · Download template · Browse file · Create college account · Create trainer login · Copy · Done
- **Notes / empty states:** students_nov.xlsx · 48 rows ready · 2 rows have errors (duplicate email) — review
- **Reference:** open `super-admin/add-account.html` in a browser; full page height at 1440px ≈ 1884px.

### Assessment Builder — `super-admin/assessment-builder.html`
- **Route:** `/lms/company/assessments?assessmentId=…`
- **Layout:** app · role `super-admin` · active menu: Assessments, Build & Send · CSS: styles.css · JS: —
- **Title:** uhibjnokml — *Technical Aptitude · Published · 3 questions · 12 marks*
- **Header actions (right of title):** Back to Assessments
- **Sections in order:** 1 · Details → 2 · Sections & questions → 3 · Proctoring & rules → 4 · Review & publish
- **Table 1:** columns `# | Question | Difficulty | Marks | (actions)` · 2 sample rows · first row: 1 | fgh jkl; | Easy | 1 | Edit
- **Table 2:** columns `# | Question | Difficulty | Marks | (actions)` · 1 sample rows · first row: 1 | Binary search — first and last position | Medium | 10 | Edit
- **Form fields (in order):**
  - Assessment name * [text] *required value="uhibjnokml"
  - Assessment code [text] value="TA-1114"
  - Duration (minutes) * [number] *required value="30"
  - Pass mark [number] value="6"
  - Opens on * [datetime-local] *required value="2026-11-14T16:46"
  - Closes on * [datetime-local] *required value="2026-11-20T16:46"
  - Description (shown to students) [textarea] value="vyibunkml"
  - Tab-switch limit [number] value="3"
  - Instructions [select] options: Standard instructions / Coding round instructions / Custom…
  - Message after submitting [text] value="Thank you. Results will be shared by your college."
- **Checkboxes / toggles:** Shuffle question order per student
- **Buttons:** Add section · Create question · Add from bank · Edit · Preview as student · Save draft · Review & publish
- **Status pills used:** Easy · Medium
- **Notes / empty states:** This assessment is published and 6 students have it. Changes to questions apply to anyone who hasn’t started yet. ‖ No questions yet.
- **Reference:** open `super-admin/assessment-builder.html` in a browser; full page height at 1440px ≈ 2335px.

### New Assessment — `super-admin/assessment-create.html`
- **Route:** `/lms/company/assessment-create`
- **Layout:** app · role `super-admin` · active menu: Assessments, Build & Send · CSS: styles.css · JS: —
- **Title:** Technical aptitude assessments — *2 assessments created in this category.*
- **Header actions (right of title):** All categories
- **Sections in order:** Create a new technical aptitude assessment → In this category (2) → "Send to students" modal → Send "Sample Test 1"
- **Form fields (in order):**
  - Assessment title * [text] *required
  - Description [textarea]
  - Duration (minutes) * [number] *required value="30"
  - Opens * [datetime-local] *required
  - Closes * [datetime-local] *required
  - College [select] options: All colleges / Crestview College of Engineering
  - Course / batch [select] options: All / JAVA-SEM5-B1
- **Checkboxes / toggles:** Webcam & microphone proctoringPeriodic snapshots + audio monitoring · Only students with ≥ 75% attendance
- **Buttons:** Create & start adding questions · Edit questions · Send to students · Cancel · Send to 48 students
- **Status pills used:** Proctored
- **Notes / empty states:** 48 students will receive this.
- **Reference:** open `super-admin/assessment-create.html` in a browser; full page height at 1440px ≈ 1639px.

### Assessment Submissions — `super-admin/assessment-submissions.html`
- **Route:** `/lms/company/assessment-submissions`
- **Layout:** app · role `super-admin` · active menu: Overview · CSS: styles.css · JS: —
- **Title:** Submissions — *Scores, status and proctoring flags for every attempt.*
- **Header actions (right of title):** Back to Assessments
- **Summary tiles (left→right):** Submissions = 1 · Average score = 17% · Graded = 1 · Flagged = 0
- **Sections in order:** 
- **Table 1:** columns `Student | College | Assessment | Marks | Time taken | Proctoring | Status | (actions)` · 1 sample rows · first row: AMAadhya Mehtaaadhya.mehta84@bulkdemo.in | Crestview College of Engineering | Sasken Test 1 Technical | 2 / 12 | 24 min | Clean | Graded | View attempt
- **Buttons:** Export CSV · View attempt
- **Status pills used:** Technical · Clean · Graded
- **Reference:** open `super-admin/assessment-submissions.html` in a browser; full page height at 1440px ≈ 900px.

### Assessments — `super-admin/assessments.html`
- **Route:** `/lms/company/assessments`
- **Layout:** app · role `super-admin` · active menu: Assessments, Build & Send · CSS: styles.css · JS: —
- **Title:** Assessments — *Build tests, send them to students, and review submissions.*
- **Header actions (right of title):** Submissions
- **Sections in order:** Aptitude → Technical aptitude → Coding → Recent assessments
- **Table 1:** columns `Assessment | Category | Questions | Window | Sent | (actions)` · 2 sample rows · first row: Sample Test 1 | Technical | 3 | Nov 13, 7:23 AM – Nov 15, 7:23 AM | 0 | Edit questions Send
- **Buttons:** Edit questions · Send · Results
- **Links:** 0 createdAptitudeGeneral aptitude and reasoning te → assessment-create.html · 2 createdTechnical aptitudeRole-specific technical → assessment-create.html · 0 createdCodingHands-on coding problems with a rea → assessment-create.html
- **Status pills used:** 0 created · 2 created · Technical
- **Notes / empty states:** Question builders (Aptitude, Technical, Coding with test cases) and the student exam screens are in the separate Assessment Portal design se
- **Reference:** open `super-admin/assessments.html` in a browser; full page height at 1440px ≈ 955px.

### Approvals from College — `super-admin/attendance-approvals.html`
- **Route:** `/lms/company/attendance-approvals`
- **Layout:** app · role `super-admin` · active menu: Registrations & Approvals, Approvals from College · CSS: styles.css · JS: —
- **Title:** Attendance exceptions — *Colleges request these when a student missed the attendance requirement for a valid reason.*
- **Sections in order:** Pending → Recent decisions
- **Table 1:** columns `Student | Course | College | Decision | Date` · 1 sample rows · first row: Aadhya Joshi | Full-Stack Development | Crestview College of Engineering | Approved | Nov 7
- **Buttons:** Reject · Approve
- **Status pills used:** Approved
- **Notes / empty states:** Approving makes the student immediately certificate-eligible for that course.
- **Reference:** open `super-admin/attendance-approvals.html` in a browser; full page height at 1440px ≈ 968px.

### Batch attendance — `super-admin/attendance-batch.html`
- **Route:** `/lms/company/attendance?collegeId=…&batchId=…`
- **Layout:** app · role `super-admin` · active menu: Overview, Attendance · CSS: styles.css · JS: —
- **Title:** Full-Stack Development — Batch 1 — *Crestview College of Engineering · Demo Trainer · 10 students*
- **Header actions (right of title):** Back to Crestview
- **Summary tiles (left→right):** Average = 66% · Certificates issued = 3 · Eligible to approve = 4 · Below 75% = 3
- **Sections in order:** Students (10)
- **Table 1:** columns `Student | Classes | Attendance | Certificate | CV | (actions)` · 10 sample rows · first row: AJAadhya JoshiFull-Stack Development | 0/0 (no classes) | 0% | Issued By exception | — | —
- **Buttons:** Approve all eligible · Approve
- **Status pills used:** Issued · By exception · Not yet eligible · Eligible
- **Reference:** open `super-admin/attendance-batch.html` in a browser; full page height at 1440px ≈ 1399px.

### Attendance — `super-admin/attendance-college.html`
- **Route:** `/lms/company/attendance?collegeId=…`
- **Layout:** app · role `super-admin` · active menu: Overview, Attendance · CSS: styles.css · JS: —
- **Title:** Crestview College of Engineering — *Attendance by course and batch*
- **Header actions (right of title):** Back to all colleges
- **Sections in order:** Average attendance by course → Batches (5)
- **Links:** Full-Stack Development — Batch 110 students · Demo → attendance-batch.html · Robotics — Batch 111 students · Arvind Bhatt61% → attendance-batch.html · Data Science / AI Fundamentals — Batch 24 students → attendance-batch.html · Java & DSA — Batch 12 students · Demo Trainer61% → attendance-batch.html · Data Science / AI Fundamentals — Batch 15 students → attendance-batch.html
- **Reference:** open `super-admin/attendance-college.html` in a browser; full page height at 1440px ≈ 900px.

### Attendance — `super-admin/attendance.html`
- **Route:** `/lms/company/attendance`
- **Layout:** app · role `super-admin` · active menu: Overview, Attendance · CSS: styles.css · JS: —
- **Title:** Attendance — *Platform-wide progress and certificate eligibility.*
- **Header actions (right of title):** Certificate approvals
- **Summary tiles (left→right):** Avg attendance = 68% · Enrollments = 309 · Certificate-eligible, not issued = 79 · Certificates issued = [n]
- **Sections in order:** Average attendance by course → By college → Eligible for certificate, not yet issued (79)
- **Table 1:** columns `(actions) | Student | College | Course | Attendance | Status | (actions)` · 3 sample rows · first row:  | AMAadhya Mehtaaadhya.mehta84@bulkdemo.in | Crestview College of Engineering | Full-Stack Development | 86% | Eligible | Issue
- **Buttons:** Approve certificates · Issue selected · Issue · View · ‹ · 1 · 2 · 3 · ›
- **Links:** Crestview College of Engineering → attendance-college.html · Sunrise Engineering College → attendance-college.html · Pinnacle Institute of Technology → attendance-college.html · Horizon College of Engineering → attendance-college.html · Global Institute of Technology → attendance-college.html · CCE → attendance-college.html
- **Status pills used:** Eligible · Issued
- **Reference:** open `super-admin/attendance.html` in a browser; full page height at 1440px ≈ 1396px.

### Full-Stack Development — Batch 1 — `super-admin/batch-admin.html`
- **Route:** `/lms/company/trainers/batches?collegeId=…&batchId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css, cert.css · JS: cert.js
- **Title:** Full-Stack Development — Batch 1 — *Crestview College of Engineering · Demo Trainer*
- **Header actions (right of title):** Back to Crestview batches · Schedule
- **Summary tiles (left→right):** Students = 10 / 60 · Classes recorded = 36 · Status = Completed · Trainer = Demo Trainer
- **Sections in order:** Certificate → Students (10)
- **Table 1:** columns `Student | Classes recorded | Move` · 10 sample rows · first row: SCSai Chauhansai.chauhan72@bulkdemo.in | 27 | Move to course…Java & DSABackend DevelopmentFrontend Develop
- **Buttons:** Edit certificate · Approve certificates · Add students · Attendance · Move
- **Links:** learnbeingforward.in/verify/LBF-C-2026-00601 → ../public/verify.html?id=LBF-C-2026-00601 · ✓ Verify certificate → ../public/verify.html?id=LBF-C-2026-00601
- **Status pills used:** Created with the batch · Nov 6, 2026 · 0
- **Reference:** open `super-admin/batch-admin.html` in a browser; full page height at 1440px ≈ 2358px.

### Buyers — `super-admin/buyers.html`
- **Route:** `/lms/company/buyers`
- **Layout:** app · role `super-admin` · active menu: Accounts, Buyers · CSS: styles.css · JS: —
- **Title:** Buyers — *People who bought course books on the website. An account is created automatically once their order is confirmed paid.*
- **Header actions (right of title):** Back to Accounts
- **Summary tiles (left→right):** Buyers = 2 · Orders paid = 2 · Revenue = ₹898 · Waiting to verify = 1
- **Sections in order:** Buyer accounts (2) → How buyer accounts are made
- **Table 1:** columns `Buyer | Bought | Paid | Order | Since | (actions)` · 2 sample rows · first row: SRSneha Raosneha.rao@gmail.com | Coding Patterns | ₹499 | ORD-1039 | Nov 16, 2026 | Resend booksReset password
- **Buttons:** Orders to verify · Resend books · Reset password
- **Reference:** open `super-admin/buyers.html` in a browser; full page height at 1440px ≈ 1307px.

### Batch Certificate — `super-admin/certificate-editor.html`
- **Route:** `/lms/company/certificate-editor`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css, cert.css · JS: cert.js
- **Title:** Batch certificate — *Full-Stack Development — Batch 1 · Crestview College of Engineering. Made automatically when the batch was created; change anything below.*
- **Header actions (right of title):** Back to batch
- **Sections in order:** Edit → Preview
- **Form fields (in order):**
  - College name (as printed) [text] value="Crestview College of Engineering"
  - Or choose the two lines yourself [textarea] placeholder="Christ Institute of Technology
Science and Technology"
  - Course name [text] value="Full-Stack Development"
  - Ribbon heading [text] value="Course Certificate"
  - Line under the student name [text] value="has successfully completed"
  - Programme line [textarea] value="a placement training programme delivered by Learn "
  - Signatory name [text] value="Lohit Kumar A B"
  - Signatory title [text] value="Founder & CEO, Learn Being Forward"
  - Typed signature [text] value="Lohit Kumar"
  - Signature image [file]
  - Verification note [textarea] value="Learn Being Forward has confirmed the identity of "
- **Buttons:** Reset · Save certificate
- **Links:** learnbeingforward.in/verify/LBF-C-2026-00610 → ../public/verify.html?id=LBF-C-2026-00610 · ✓ Verify certificate → ../public/verify.html?id=LBF-C-2026-00610
- **Notes / empty states:** Filled in by itself: student name, course name, issue date and certificate ID. You only need to check the college name — shorten it, or deci
- **Reference:** open `super-admin/certificate-editor.html` in a browser; full page height at 1440px ≈ 1708px.

### Certificate Approvals — `super-admin/certificates.html`
- **Route:** `/lms/company/attendance/certificates`
- **Layout:** app · role `super-admin` · active menu: Overview, Attendance · CSS: styles.css · JS: —
- **Title:** Certificate approvals — *Students who finished a course and are waiting for their certificate — by course, college and semester.*
- **Header actions (right of title):** Back to Attendance
- **Summary tiles (left→right):** Pending certificates = 79 · Eligible (≥75%) = 61 · Exception requests = 9 · Approved this session = 0
- **Sections in order:** 
- **Buttons:** All courses · Data Science / AI Fundamentals19 pending · 13 eligible · 6 b · Frontend Development15 pending · 12 eligible · 3 below 75% · Java & DSA12 pending · 9 eligible · 3 below 75% · Backend Development12 pending · 9 eligible · 3 below 75% · Robotics11 pending · 9 eligible · 2 below 75% · Full-Stack Development10 pending · 9 eligible · 1 below 75%
- **Notes / empty states:** Students with 75% attendance or more can be approved straight away. Below 75%, approve only when the college has sent an exception request.
- **Reference:** open `super-admin/certificates.html` in a browser; full page height at 1440px ≈ 928px.

### Java & DSA — `super-admin/college-contract.html`
- **Route:** `/lms/company/colleges?contractId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: —
- **Title:** Java & DSA — *Training request · Crestview College of Engineering*
- **Header actions (right of title):** Back to Colleges
- **Sections in order:** Details → Progress
- **Buttons:** Prepare MOU · Invoice
- **Status pills used:** Approved · Not set
- **Notes / empty states:** Check the dates: this request was sent on Sep 18 and approved on Sep 25, after the training dates (Sep 1–10). Requests should be accepted be
- **Reference:** open `super-admin/college-contract.html` in a browser; full page height at 1440px ≈ 900px.

### Invoice — `super-admin/college-invoice.html`
- **Route:** `/lms/company/colleges?invoiceId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: —
- **Title:** Data Science / AI Fundamentals — *Invoice to Crestview College of Engineering*
- **Header actions (right of title):** Back to Colleges
- **Summary tiles (left→right):** Students trained = 9 · Hours = 6 · Fee = ₹27,000 · GST 18% = ₹4,860 · Total = ₹31,860
- **Sections in order:** Progress
- **Buttons:** Invoice PDF · Mark as paid
- **Status pills used:** Accepted · not paid
- **Reference:** open `super-admin/college-invoice.html` in a browser; full page height at 1440px ≈ 1075px.

### College Approvals — `super-admin/colleges-approvals.html`
- **Route:** `/lms/company/colleges-approvals`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: —
- **Title:** Approvals — *The second admin can request training without a rate. Set the rate and send it to the college.*
- **Header actions (right of title):** Back to Colleges
- **Sections in order:** Pending approvals (0)
- **Buttons:** Send to college
- **Notes / empty states:** Nothing waiting on a rate right now.
- **Reference:** open `super-admin/colleges-approvals.html` in a browser; full page height at 1440px ≈ 900px.

### MOUs — `super-admin/colleges-mous.html`
- **Route:** `/lms/company/colleges-mous`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: docs.js, flows.js
- **Title:** MOUs — *Prepare, edit and share the MOU after a college accepts a requirement, then confirm the training once the signed copy is back.*
- **Header actions (right of title):** Back to Colleges
- **Dynamic widgets:** [widget: admin-mous]
- **Summary tiles (left→right):** MOU needed = 1 · Waiting for college = 1 · Signed · to confirm = 1 · Confirmed = 1
- **Sections in order:** College MOUs
- **Buttons:** View signed copy · Confirm training · Prepare MOU · View shared · Edit & reshare · Signed MOU
- **Status pills used:** Signed copy received · Accepted · MOU needed · Shared · waiting for signature · Training confirmed
- **Reference:** open `super-admin/colleges-mous.html` in a browser; full page height at 1440px ≈ 1039px.

### Sent to College — `super-admin/colleges-sent.html`
- **Route:** `/lms/company/colleges-sent`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Sent to college — *Every training contract sent, its status, and invoices.*
- **Header actions (right of title):** Back to Colleges
- **Dynamic widgets:** [widget: admin-sent]
- **Sections in order:** Training contracts (4)
- **Buttons:** Mark as paid · LBF/INV/2026-27/011 · Generate invoice
- **Links:** Crestview College of Engineering — Data Science /  → college-contract.html · Crestview College of Engineering — Java & DSA → college-contract.html · Crestview College of Engineering — Robotics → college-contract.html · Crestview College of Engineering — Frontend Develo → college-contract.html
- **Status pills used:** Invoice accepted · not paid · Paid · Training running · Invoice sent · awaiting college
- **Notes / empty states:** When accounts press Mark as paid, the paid tax invoice is generated, attached to the contract below and sent to the college as a notificatio
- **Reference:** open `super-admin/colleges-sent.html` in a browser; full page height at 1440px ≈ 948px.

### Colleges — `super-admin/colleges.html`
- **Route:** `/lms/company/colleges`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css · JS: —
- **Title:** Colleges — *Send training requests and manage contracts, invoices and MOUs.*
- **Header actions (right of title):** Add college
- **Sections in order:** Approvals → Sent to college → MOUs → New training request
- **Form fields (in order):**
  - College * [select] *required options: Select college / Crestview College of Engineering / Global Institute of Technology / Pinnacle Institute of Technology
  - Choose any combination. [checkbox] value="on"
  - Java & DSA [checkbox] value="on"
  - Training type * [select] *required options: Select training type / Per student, per hour / Flat rate per day / Free / CSR
  - Branch [select] options: All branches / Computer Science & Engineering / Information Science / Electronics & Communication
  - Semester [select] options: All semesters / 3 / 5 / 7
  - Total student strength * [number] *required
  - Minimum students * [number] *required
  - Number of batches [number]
  - Total training days * [number] *required
  - Training hours per day * [number] *required placeholder="e.g. 6"
  - Start date * [date] *required
  - Daily start time * [time] *required
  - Daily end time * [time] *required
  - Venue / mode [select] options: On campus — computer labs / On campus — classrooms / Online
- **Checkboxes / toggles:** Technical · Aptitude · Soft Skill · Java & DSA · Full-Stack Development · Frontend Development · Backend Development · Data Science / AI · Robotics · Programming
- **Buttons:** Send training request
- **Links:** 0ApprovalsSet the rate on contracts the second adm → colleges-approvals.html · 4Sent to collegeEvery contract sent, its status, a → colleges-sent.html · 4MOUsGenerate and edit a formal MOU for each appro → colleges-mous.html
- **Reference:** open `super-admin/colleges.html` in a browser; full page height at 1440px ≈ 1439px.

### Course Studio — `super-admin/course-content.html`
- **Route:** `/lms/company/course-content`
- **Layout:** app · role `super-admin` · active menu: Course Content · CSS: styles.css · JS: studio.js
- **Title:** Course Studio — *Create courses, modules, sub-modules and topics, attach PDFs, and choose when each batch gets them.*
- **Header actions (right of title):** Access requests · Trainer-submitted
- **Tabs / segmented controls:** Structure | Share with batches | Course settings
- **Sections in order:** Courses (13) → Java & DSA → Structure
- **Buttons:** New · Backend Development4 modules · 12 items · Coding Patterns14 modules · 42 items · on Buy · Data Science / AI Fundamentals3 modules · 9 items · Frontend Development3 modules · 9 items · on Buy · Full-Stack Development3 modules · 9 items · Java & DSA5 modules · 34 items · Logical Reasoning3 modules · 9 items · Non-Verbal Reasoning3 modules · 9 items · Programming4 modules · 12 items · on Buy · Quantitative Aptitude3 modules · 9 items · Robotics2 modules · 6 items · on Buy · Soft Skills3 modules · 9 items · Verbal Reasoning3 modules · 9 items · Build from outline · Bulk upload PDFs · Student view · Structure · Share with batches · Course settings · Expand all · Collapse all · Collapse · Add module · Paste a syllabus outline
- **Status pills used:** On website · 26 PDFs
- **Notes / empty states:** Select an itemPress on any row to attach its PDF, learn-more links and the module’s course book.
- **Reference:** open `super-admin/course-content.html` in a browser; full page height at 1440px ≈ 2403px.

### Company Dashboard — `super-admin/dashboard.html`
- **Route:** `/lms/company`
- **Layout:** app · role `super-admin` · active menu: Overview, Requests · CSS: styles.css · JS: —
- **Title:** Company Dashboard — *Course enrollment requests from students, grouped by college.*
- **Header actions (right of title):** Notifications
- **Summary tiles (left→right):** Pending requests = 0 · Colleges represented = 0 · Courses requested = 0 · Students = 293 · Certificates to issue = 79
- **Sections in order:** Pending approval, by college → Recent decisions → Quick actions
- **Buttons:** View all
- **Links:** Add an account → add-account.html · Schedule training → trainers-schedule.html · Build an assessment → assessments.html · Upload course content → course-content.html
- **Status pills used:** Approved
- **Notes / empty states:** No pending enrollment requests right now.New requests appear here grouped by college, with Approve / Reject on each.
- **Reference:** open `super-admin/dashboard.html` in a browser; full page height at 1440px ≈ 1584px.

### Edit Site — `super-admin/edit-site-buy.html`
- **Route:** `/lms/company/edit-site/buy (Orders tab = /lms/company/edit-site/buy/orders)`
- **Layout:** app · role `super-admin` · active menu: Overview, Edit Site · CSS: styles.css · JS: buy.js
- **Title:** Buy — *Sell course books on the website: prices, free previews, who can buy, payments and orders.*
- **Header actions (right of title):** Back to Edit Site · View Buy page
- **Tabs / segmented controls:** Listings (4) | Orders 2 to verify | Payment settings
- **Sections in order:** Listings → Coding Patterns → Coding Patterns → What’s included (14 books)
- **Table 1:** columns `Book | Pages | Free preview | Locked | (actions)` · 14 sample rows · first row: Programming Basics — Complete Course Notes | 40 | of 40 |  | 
- **Form fields (in order):**
  - Price (₹) * [number] *required value="499"
  - Original price (₹) [number] placeholder="optional" value="999"
  - Headline [text] value="100 data-structure & algorithm patterns, worked th"
  - Who can see and buy it [radio] value="public"
- **Buttons:** Listings (4) · Orders 2 to verify · Payment settings · Add · Coding Patterns₹499 · 14 books · Everyone on the website · Frontend Development₹399 · 3 books · Everyone on the website · Robotics₹399 · 2 books · Logged-in students only · Programming₹399 · 4 books · Everyone on the website · Apply · Delete listing · View as a buyer · Save changes
- **Status pills used:** 2 to verify
- **Reference:** open `super-admin/edit-site-buy.html` in a browser; full page height at 1440px ≈ 2272px.

### Edit Site — `super-admin/edit-site-courses.html`
- **Route:** `/lms/company/edit-site/courses`
- **Layout:** app · role `super-admin` · active menu: Overview, Edit Site · CSS: styles.css · JS: —
- **Title:** Courses & curriculum — *Add courses and modules. Each module topic becomes a selectable sub-module for course content.*
- **Header actions (right of title):** Back to Edit Site
- **Sections in order:** Add new course → Add module to a course → Existing courses
- **Table 1:** columns `Course | Category | Modules | Status | (actions)` · 3 sample rows · first row: Java & DSA | Technical | 5 | Live | Edit
- **Form fields (in order):**
  - Course name * [text] *required
  - Category * [select] *required options: Technical / Aptitude / Soft Skills
  - Short description (course card) [text]
  - Full description * [textarea] *required
  - C [checkbox] value="on"
  - Course * [select] *required options: Java & DSA / Full-Stack Development / Backend Development
  - Track / section title [text] placeholder="e.g. DSA Track"
  - Level [select] options: — / Fundamentals / Intermediate / Advanced
  - Module title * [text] *required
  - Topics / sub-modules (one per line) * [textarea] *required value="Arrays & strings
Linked lists
Stacks & queues"
  - Delivery note [text] placeholder="e.g. Daily problem sets with walkthroughs"
- **Checkboxes / toggles:** C · C++ · Java · Python · C# · JavaScript · TypeScript · HTML5 · CSS3 · React · Angular · Node.js · Spring Boot · MySQL / SQL · MongoDB · Git · Docker · Pandas · Mark as placeholder syllabus (real content not provided yet)
- **Buttons:** Create course · Add module · Edit
- **Status pills used:** Live · Placeholder
- **Reference:** open `super-admin/edit-site-courses.html` in a browser; full page height at 1440px ≈ 1440px.

### Edit Site — `super-admin/edit-site-employees.html`
- **Route:** `/lms/company/edit-site/employees`
- **Layout:** app · role `super-admin` · active menu: Overview, Edit Site · CSS: styles.css · JS: —
- **Title:** Employees & contacts — *Profiles shown on the public Team and Contact pages.*
- **Header actions (right of title):** Back to Edit Site
- **Sections in order:** Add employee / trainer profile → Company contact → Published profiles
- **Table 1:** columns `Profile | Shown on | Type | Order | (actions)` · 3 sample rows · first row: LKLohit KumarFounder & Lead Trainer | Team | Employee | 1 | Edit Remove
- **Form fields (in order):**
  - Full name * [text] *required
  - Role / title * [text] *required placeholder="e.g. Aptitude Trainer"
  - Experience (years) [number]
  - Type [select] options: Full-time employee / Freelance trainer
  - Skills (comma separated) [text] placeholder="Java, Spring Boot, SQL"
  - Colleges trained at (freelance) [text]
  - Name * [text] *required value="Lohit Kumar A B"
  - Phone * [tel] *required value="+91 99729 34418"
  - Email * [email] *required value="support@learnbeingforward.in"
- **Buttons:** Upload photo · Add profile · Save company contact · Reorder · Edit · Remove
- **Status pills used:** Employee · Freelance · Contact
- **Reference:** open `super-admin/edit-site-employees.html` in a browser; full page height at 1440px ≈ 1321px.

### Edit Site — `super-admin/edit-site.html`
- **Route:** `/lms/company/edit-site`
- **Layout:** app · role `super-admin` · active menu: Overview, Edit Site · CSS: styles.css · JS: —
- **Title:** Edit Site — *Change what the public website shows.*
- **Header actions (right of title):** View live site
- **Sections in order:** Pages on the website → Home page → Courses → Technologies → Team → Contact → Store → Buy → Across every page → Footer links → Company contact
- **Buttons:** Edit · View
- **Status pills used:** 4 pillars · 13 courses · 18 technologies · 6 profiles · 3 contacts · 4 listings · 2 orders to verify · 7 links · +91 99729 34418
- **Notes / empty states:** Everything here goes straight to the public website — no redeploy. Use View to check a page after you save.
- **Reference:** open `super-admin/edit-site.html` in a browser; full page height at 1440px ≈ 1641px.

### Employee Access — `super-admin/employee-access.html`
- **Route:** `/lms/company/employee-access`
- **Layout:** app · role `super-admin` · active menu: Accounts, Employee Access · CSS: styles.css · JS: —
- **Title:** Employee access — *Give staff a login that shows only the sections you tick.*
- **Header actions (right of title):** Open Site Builder
- **Sections in order:** New employee login → What can this employee access? → Employee accounts (1)
- **Form fields (in order):**
  - Full name * [text] *required
  - Login email * [email] *required
  - Password * [password] *required
  - Phone [tel]
- **Checkboxes / toggles:** Notifications · Student notifications · College notifications · Trainer notifications · Admin / system notifications · Requests · Attendance · Edit Site · Trainer-submitted content · Add account · Manage accounts · Reset student passwords · Reset college passwords · Reset trainer passwords · Reset admin / employee passwords · Reset buyer passwords · All students · Buyers · Colleges · College MOUs · College approvals · College sent items · Trainers · Create & manage trainers (rate, profile, login) · Decide trainer invoices · Account details · New registrations · Approvals from college · Password reset requests · Build & send assessments
- **Buttons:** Employee · Admin · Show password · All · None · Create employee account · Edit access · Reset password · Remove
- **Status pills used:** Employee
- **Reference:** open `super-admin/employee-access.html` in a browser; full page height at 1440px ≈ 2411px.

### Java & DSA — `super-admin/enrollment-detail.html`
- **Route:** `/lms/company/students?studentId=…&enrollmentId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, All Students · CSS: styles.css · JS: —
- **Title:** Java & DSA — *Aadhya Joshi · Trainer: not yet assigned*
- **Header actions (right of title):** Back to student
- **Summary tiles (left→right):** Attendance = 90% · Total classes = 34 · Classes held = 20 · Attended = 18 · Certificate = Issued
- **Sections in order:** Session-by-session attendance
- **Buttons:** All (20) · Present (18) · Absent (2)
- **Status pills used:** Present · Topic not recorded · Absent
- **Reference:** open `super-admin/enrollment-detail.html` in a browser; full page height at 1440px ≈ 2165px.

### Manage Accounts — `super-admin/manage-accounts.html`
- **Route:** `/lms/company/manage-accounts`
- **Layout:** app · role `super-admin` · active menu: Accounts, Manage Accounts · CSS: styles.css · JS: —
- **Title:** Manage accounts — *Reset a login when someone is locked out and didn't use the forgot-password form.*
- **Sections in order:** Reset by email → Reset a student's password → Reset a college's password → Reset a trainer's password → Recent resets (audit log)
- **Table 1:** columns `When | Account | Role | Reset by` · 2 sample rows · first row: Nov 13, 10:42 | aadhya.joshi6@extradata.in | Student | Lohit Kumar
- **Form fields (in order):**
  - Account email * [email] *required placeholder="name@example.com"
  - New password * [password] *required
  - Student * [select] *required options: Select student
  - New password * [password] *required
  - College * [select] *required options: Select college
  - New password * [password] *required
  - Trainer * [select] *required options: Select trainer
  - New password * [password] *required
- **Buttons:** Show password · Generate · Reset password · Reset student password · Reset college password · Reset trainer password
- **Links:** Profile → profile.html
- **Status pills used:** Student · College
- **Notes / empty states:** The main company admin's own password can't be reset here — change it from Profile.
- **Reference:** open `super-admin/manage-accounts.html` in a browser; full page height at 1440px ≈ 1263px.

### MOU Editor — `super-admin/mou-editor.html`
- **Route:** `/lms/company/mou-editor`
- **Layout:** app · role `super-admin` · active menu: Accounts, Colleges · CSS: styles.css, docs.css · JS: docs.js, flows.js, doc-editor.js
- **Title:** Review & edit MOU — *Pre-filled from the portal. Change any detail, check the preview, then share.*
- **Header actions (right of title):** Back to MOUs
- **Sections in order:** Crestview College of Engineering — Java & DSA → Recitals → 1.Purpose and scope → 2.Programme details → 3.Sections and topics to be covered → 4.Schedule and timings → 5.Postponement, cancellation and delay charges → 6.Responsibilities of the Company → 7.Responsibilities of the College → 8.Certificates → 9.Commercials → 10.Payment terms → 11.Confidentiality → 12.Intellectual property → 13.Term and termination → 14.Additional terms → 15.Force majeure → 16.Dispute resolution → 17.General
- **Table 1:** columns `` · 11 sample rows · first row: Name of the institution | Crestview College of Engineering
- **Table 2:** columns `` · 6 sample rows · first row: Funding | Paid by the College
- **Form fields (in order):**
  - MOU number [text] value="LBF/MOU/2026-27/007"
  - MOU date [date] value="2026-11-19"
  - Place of signing [text] value="Bengaluru"
  - College name * [text] *required value="Crestview College of Engineering"
  - Address [textarea]
  - Signatory name [text]
  - Designation [text] value="Principal"
  - Email [email] value="placements@crestview.edu.in"
  - Phone [tel]
  - Course / subject * [text] *required value="Java & DSA"
  - Domain [select] options: Technical / Aptitude / Soft Skills / Technical + Aptitude
  - Sections we train on (one per line) [textarea] value="Core Java — OOP, collections and exception handlin"
  - Branch [text] value="Computer Science & Engineering"
  - Semester [text] value="7"
  - Total student strength * [number] *required value="120"
  - Number of batches [number] value="3"
  - Start date [date] value="2026-12-01"
  - End date [date] value="2026-12-12"
  - Total training days * [number] *required value="10"
  - Training hours per day * [number] *required value="6"
  - Daily start [time] value="09:30"
  - Daily end [time] value="16:30"
  - Venue / mode [text] value="On campus — computer labs"
  - Who pays [select] options: College / CSR sponsor / Free
  - CSR sponsor name [text]
  - Fee basis [select] options: Per batch, per day / Per student, per hour / Lump sum
  - Rate / amount (₹) * [number] *required value="10000"
  - GST [select] options: CGST + SGST / IGST / Not applicable
  - GST % [number] value="18"
  - Pay within (working days after completion) [number] value="20"
  - Late-payment interest % [number] value="15"
  - Interest charged [select] options: per day / per month / per annum
  - Postponement notice (days) [number] value="7"
  - Delay charge per day (₹) [number] value="5000"
  - City for courts [text] value="Bengaluru"
  - One term per line (optional) [textarea]
  - Company name [text] value="Learn Being Forward"
  - Registered address [textarea]
  - Email [email] value="info@learnbeingforward.in"
  - Phone [tel] value="+91 99729 34418"
  - GSTIN [text]
  - PAN [text]
  - Signatory name [text] value="Lohit Kumar A B"
  - Signatory title [text] value="Founder & CEO"
  - Company signature image [file]
  - Typed signature (used when no image) [text] value="Lohit Kumar"
  - Date beside the signature [date] value="2026-11-19"
- **Buttons:** Reset to defaults · Save draft · Download PDF · Share with college · Upload
- **Status pills used:** 13 blank fields — highlighted in red in the preview
- **Notes / empty states:** Everything is filled from the requirement the college accepted. Change anything here — the preview updates as you type.
- **Reference:** open `super-admin/mou-editor.html` in a browser; full page height at 1440px ≈ 1483px.

### Notifications — `super-admin/notifications.html`
- **Route:** `/lms/company/notifications`
- **Layout:** app · role `super-admin` · active menu: Overview, Notifications · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Notifications — *Activity across the student, college and trainer portals.*
- **Dynamic widgets:** [widget: notes]
- **Tabs / segmented controls:** All (2) | Students (1) | Colleges (1) | Trainers (0) | Admin / system (0)
- **Sections in order:** MOUs & payments
- **Buttons:** Open · All (2) · Students (1) · Colleges (1) · Trainers (0) · Admin / system (0) · Review
- **Notes / empty states:** Nothing here yet.
- **Reference:** open `super-admin/notifications.html` in a browser; full page height at 1440px ≈ 1136px.

### Password Reset Requests — `super-admin/password-resets.html`
- **Route:** `/lms/company/password-resets`
- **Layout:** app · role `super-admin` · active menu: Registrations & Approvals, Password Reset Requests · CSS: styles.css · JS: —
- **Title:** Password reset requests — *Older manual requests, kept for reference.*
- **Sections in order:** Pending (1) → Recent decisions
- **Table 1:** columns `Account | Role | Decision | Date` · 1 sample rows · first row: Reyansh — reyansh.singh@bulkdemo.in | Student | Rejected | Sep 18, 2026
- **Buttons:** Reject · Send reset link
- **Links:** Manage Accounts → manage-accounts.html
- **Status pills used:** Student · Rejected
- **Notes / empty states:** Everyone now resets their own password by email from the login page's "Forgot password?" link. Need to reset directly? Use Manage Accounts.
- **Reference:** open `super-admin/password-resets.html` in a browser; full page height at 1440px ≈ 900px.

### Profile — `super-admin/profile.html`
- **Route:** `/lms/company/profile`
- **Layout:** app · role `super-admin` · active menu: Profile · CSS: styles.css · JS: —
- **Title:** Profile — *Your details, invoice bank details and password.*
- **Sections in order:** Profile details → Change password
- **Form fields (in order):**
  - Name * [text] *required value="Lohit Kumar"
  - Email [email] value="admin@learnbeingforward.in"
  - Account holder [text]
  - Bank name [text]
  - Account number [text]
  - IFSC [text]
  - GST number [text]
  - Current password * [password] *required
  - New password * [password] *required
  - Confirm new password * [password] *required
- **Buttons:** Change photo · Save changes · Show password · Change password
- **Reference:** open `super-admin/profile.html` in a browser; full page height at 1440px ≈ 900px.

### New Registrations — `super-admin/registrations.html`
- **Route:** `/lms/company/registrations`
- **Layout:** app · role `super-admin` · active menu: Registrations & Approvals, New Registrations · CSS: styles.css · JS: —
- **Title:** New registrations — *Students who signed up and matched a roster entry their college added.*
- **Sections in order:** Pending (0)
- **Buttons:** Approve all · Reject · Approve
- **Status pills used:** Roster match
- **Notes / empty states:** Approve lets them request courses. Reject sends the entry back to the college roster so they can sign up again. ‖ No pending registrations.
- **Reference:** open `super-admin/registrations.html` in a browser; full page height at 1440px ≈ 900px.

### Site Builder — `super-admin/site-builder.html`
- **Route:** `/lms/company/site-builder`
- **Layout:** standalone · CSS:  · JS: —
- **Title:** AI Create — *Answer a few questions. The assistant builds the account, its menu and its pages from your existing sections.*
- **Sections in order:** Who is this account for?
- **Form fields (in order):**
  - Full name * [text] placeholder="e.g. Rahul Sharma"
  - Login email * [email] placeholder="name@learnbeingforward.in"
  - Phone [tel] placeholder="+91"
  - New [password]
  - Job title [text] placeholder="e.g. Placement Coordinator"
  - Works forLearn Being ForwardCrestview Co [select] options: Learn Being Forward / Crestview College of Engineering / Pinnacle Institute of Technology / Global Institute of Technology
  - Company employeeWorks inside Learn Being Forward [radio] value="super-admin"
- **Buttons:** Show password · New · Next
- **Reference:** open `super-admin/site-builder.html` in a browser; full page height at 1440px ≈ 900px.

### Aadhya Joshi — `super-admin/student-detail.html`
- **Route:** `/lms/company/students?studentId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, All Students · CSS: styles.css · JS: —
- **Title:** Aadhya Joshi — *Student · Crestview College of Engineering*
- **Header actions (right of title):** Back to All Students
- **Sections in order:** Profile → Enrollments (2)
- **Buttons:** Edit details · Reset password · Delete account
- **Links:** Java & DSATrainer: Not yet assigned · 18/20 classe → enrollment-detail.html · Full-Stack DevelopmentTrainer: Demo Trainer · 0/0  → enrollment-detail.html
- **Status pills used:** Certificate issued · Certificate issued by exception
- **Notes / empty states:** No trainer or batch is linked, but 18 classes and a trainer-approved certificate are recorded — link the batch so the record is complete.
- **Reference:** open `super-admin/student-detail.html` in a browser; full page height at 1440px ≈ 901px.

### All Students — `super-admin/students.html`
- **Route:** `/lms/company/students`
- **Layout:** app · role `super-admin` · active menu: Accounts, All Students · CSS: styles.css · JS: —
- **Title:** All students — *293 students across 7 colleges.*
- **Header actions (right of title):** Export
- **Table 1:** columns `Student | College | Branch | Sem | Course | Attendance | CV | (actions)` · 7 sample rows · first row: AJAadhya Joshiaadhya.joshi6@extradata.in | Crestview College of Engineering | Electronics & Comm. | 3 | Java & DSA | 90% Issued | — | 
- **Buttons:** Export CSV · Add student · More actions · ‹ · 1 · 2 · 3 · ›
- **Links:** Aadhya Joshi → student-detail.html · Aadhya Mehta → student-detail.html · Aadhya Pillai → student-detail.html · Aadhya Singh → student-detail.html · Aarav Agarwal → student-detail.html · Aarav Kumar → student-detail.html · Aarav Rao → student-detail.html
- **Status pills used:** Issued · Eligible
- **Reference:** open `super-admin/students.html` in a browser; full page height at 1440px ≈ 1133px.

### Trainer-Submitted Content — `super-admin/trainer-content.html`
- **Route:** `/lms/company/trainer-content`
- **Layout:** app · role `super-admin` · active menu: Overview, Trainer-Submitted Content · CSS: styles.css · JS: —
- **Title:** Trainer-Submitted Content — *Review content trainers upload before it reaches students.*
- **Sections in order:** Submissions
- **Table 1:** columns `Content | Trainer | Course · Module | Batch / session | Submitted | Status | (actions)` · 2 sample rows · first row: Recursion practice set.pdf2.1 MB · 1 link | Demo Trainer | Java & DSA · DSA Fundamentals | CCE-JAVA-B1 · Nov 12 | Nov 12 | Pending review | Preview Send to attendees
- **Buttons:** Preview · Send to attendees · View
- **Status pills used:** Pending review · Sent · 38 students
- **Notes / empty states:** Trainer uploads land here first and never touch the official course library. Open a course to review what was submitted and send it to the s
- **Reference:** open `super-admin/trainer-content.html` in a browser; full page height at 1440px ≈ 900px.

### Invoice — `super-admin/trainer-invoice.html`
- **Route:** `/lms/company/trainers/invoices?invoiceId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Demo Trainer — invoice — *Submitted Sep 17, 2026 · decided Sep 17, 2026*
- **Header actions (right of title):** Back to Trainer Invoices
- **Summary tiles (left→right):** Sessions = 9 · Hours = 18 · Rate = ₹500/hr · Submitted = ₹9,000 · Approved = ₹9,000
- **Sections in order:** Sessions trained (9)
- **Buttons:** Mark as paid
- **Status pills used:** Approved
- **Reference:** open `super-admin/trainer-invoice.html` in a browser; full page height at 1440px ≈ 1316px.

### Demo Trainer — `super-admin/trainer-sessions.html`
- **Route:** `/lms/company/trainers/schedule?trainerId=…`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Demo Trainer — *Sessions, batches and attendance*
- **Header actions (right of title):** Back to all trainers · Invoices
- **Summary tiles (left→right):** Sessions taught = 9 · Hours = 18 · Upcoming = 2 · Rate = ₹500/hr · Batches = 4
- **Sections in order:** Sessions
- **Buttons:** Schedule a session · All · Upcoming · Completed
- **Status pills used:** Attendance taken · Upcoming
- **Reference:** open `super-admin/trainer-sessions.html` in a browser; full page height at 1440px ≈ 1482px.

### Batch Calendar — `super-admin/trainers-batches-calendar.html`
- **Route:** `/lms/company/trainers/batches/calendar`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Batch calendar — *When each batch starts. Pick a day to see its batches and schedule sessions.*
- **Header actions (right of title):** Back to Batches · Batch requests
- **Sections in order:** November 2026 → Tuesday, 17 November 2026 → All start dates
- **Buttons:** Previous · Next · 1 · 2 · 3PIT · FSD-SEM5-B1 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17CCE · JAVA-SEM7-B1 · 18 · 19 · 20 · 21 · 22 · 23 · 24Sunrise · BE-SEM5-B2 · 25 · 26 · 27 · 28 · 29 · 30 · Schedule · 24/11/20261 batch · 17/11/20261 batch · 03/11/20261 batch · 17/09/20266 batches
- **Status pills used:** 1 batch · 6 batches
- **Reference:** open `super-admin/trainers-batches-calendar.html` in a browser; full page height at 1440px ≈ 996px.

### Batch Requests — `super-admin/trainers-batches-requests.html`
- **Route:** `/lms/company/trainers/batches/requests`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Batch requests — *Changes to batches asked for by trainers and colleges — split, merge, move students or add a batch.*
- **Header actions (right of title):** Back to Batches · Batch calendar
- **Sections in order:** Awaiting approval (3) → Recent decisions
- **Buttons:** Reject · Ask for details · Approve
- **Status pills used:** Awaiting approval · Approved · Rejected
- **Reference:** open `super-admin/trainers-batches-requests.html` in a browser; full page height at 1440px ≈ 1020px.

### Batches — `super-admin/trainers-batches.html`
- **Route:** `/lms/company/trainers/batches`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Batches — *Group enrolled students into class batches.*
- **Header actions (right of title):** Back to Trainers · Batch requests · Calendar
- **Sections in order:** Auto-create batches → Build a batch manually → By college
- **Table 1:** columns `(actions) | Student | Branch | Sem` · 3 sample rows · first row:  | Aadhya Mehta | CSE | 5
- **Form fields (in order):**
  - College * [select] *required options: Select college
  - Course * [select] *required options: Select course
  - Semester [select] options: All semesters
- **Buttons:** Auto-batch everyone · Create batch
- **Links:** JAVA-SEM5-B1 → batch-admin.html · FSD-SEM7-B1 → batch-admin.html
- **Status pills used:** 7 batches · 6 batches · 5 batches · 1 batches
- **Reference:** open `super-admin/trainers-batches.html` in a browser; full page height at 1440px ≈ 1280px.

### Trainer Invoices — `super-admin/trainers-invoices.html`
- **Route:** `/lms/company/trainers/invoices`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Trainer invoices — *Review and approve invoices trainers submit for their sessions.*
- **Header actions (right of title):** Back to Trainers
- **Dynamic widgets:** [widget: admin-pays]
- **Summary tiles (left→right):** Pending = 0 · Approved this month = ₹9,000 · Trainer dues = ₹0
- **Sections in order:** Pending (0) → Approved · ready to pay → Recent decisions
- **Table 1:** columns `Trainer | Period | Amount | Decision | Date` · 1 sample rows · first row: DTDemo Trainerdemo.trainer@learnbeingforward.in | Oct 2026 | ₹9,000 | Approved | Nov 2
- **Buttons:** View breakdown · Reject · Approve · Mark as paid
- **Links:** Demo Trainer → trainer-invoice.html
- **Status pills used:** Approved · not paid · Approved
- **Reference:** open `super-admin/trainers-invoices.html` in a browser; full page height at 1440px ≈ 1219px.

### Schedule Training — `super-admin/trainers-schedule.html`
- **Route:** `/lms/company/trainers/schedule`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Schedule training — *One session-day at a time for a batch: trainer, date and up to 3 slots.*
- **Header actions (right of title):** Back to Trainers
- **Dynamic widgets:** [widget: schedule], [widget: admin-trainer-mous]
- **Sections in order:** New session-day → Sessions by trainer → Trainer MOUs → November 2026
- **Form fields (in order):**
  - Batch * [select] *required options: Select batch / CCE · JAVA-SEM5-B1 / CCE · JAVA-SEM7-B1 / Sunrise · BE-SEM5-B1
  - Trainer * [select] *required options: Select trainer / Demo Trainer / Anil Deshmukh / Lakshmi Menon
  - Date * [date] *required
  - Time * [select] *required options: Select time / 9:30 – 11:00 / 11:15 – 12:45 / 2:00 – 3:30
  - Module / subject [select] options: Select module / DSA Fundamentals / Java Intermediate
  - Topic (if no module fits) [text]
- **Checkboxes / toggles:** Session 1 · Session 2 · Session 3
- **Buttons:** Schedule session · Signed · View · ‹ · Today · ›
- **Status pills used:** 2 pending attendance · Signed · Waiting for trainer
- **Notes / empty states:** Leaving the module blank means students won't get that module's content unlocked from this session.
- **Reference:** open `super-admin/trainers-schedule.html` in a browser; full page height at 1440px ≈ 2037px.

### Trainers — `super-admin/trainers.html`
- **Route:** `/lms/company/trainers`
- **Layout:** app · role `super-admin` · active menu: Accounts, Trainers · CSS: styles.css · JS: —
- **Title:** Trainers — *Batches, schedules, invoices and hourly rates.*
- **Header actions (right of title):** Add trainer
- **Sections in order:** Batches → Schedule training → Invoices → All trainers (10)
- **Table 1:** columns `Trainer | Batches | Login | Hourly rate | (actions)` · 6 sample rows · first row: ADAnil Deshmukhanil.deshmukh@learnbeingforward.in | 1 batch | Active | ₹ | Save
- **Buttons:** Save · Create login
- **Links:** BatchesGroup enrolled students into class batches. → trainers-batches.html · Schedule trainingAssign a trainer, date and sessio → trainers-schedule.html · InvoicesReview and approve trainer invoices. → trainers-invoices.html · Anil Deshmukh → trainer-sessions.html · Arvind Bhatt → trainer-sessions.html · Demo Trainer → trainer-sessions.html · Lakshmi Menon → trainer-sessions.html · Meenakshi Nair → trainer-sessions.html · Shashank BS → trainer-sessions.html
- **Status pills used:** Active · No login yet
- **Reference:** open `super-admin/trainers.html` in a browser; full page height at 1440px ≈ 1225px.

## College portal

16 pages.

### Add Student — `college/add-student.html`
- **Route:** `/lms/college/add-student`
- **Layout:** app · role `college` · active menu: Students, Add student · CSS: styles.css · JS: —
- **Title:** Add student — *Add students to your college roster.*
- **Sections in order:** Single student → Bulk upload → Recently added
- **Table 1:** columns `Student | Added | Signup status` · 3 sample rows · first row: IVIshaan Vermaishaan.verma@college.edu | Nov 12 | Waiting for student to sign up
- **Form fields (in order):**
  - Full name * [text] *required
  - Email * [email] *required
  - USN / roll number [text]
  - Father's name [text]
  - Branch [select] options: Select branch / Computer Science / Information Technology / Electronics & Communication
  - Semester [select] options: — / 1 / 2 / 3 / 4 / 5 / 6 / 7
- **Buttons:** Single student · Bulk upload (Excel) · Add to roster · Template · Browse
- **Status pills used:** Waiting for student to sign up · Signed up · awaiting company approval · Active
- **Notes / empty states:** This doesn't create a login by itself. The student signs up on the login page, and it only succeeds if their name and email match exactly wh
- **Reference:** open `college/add-student.html` in a browser; full page height at 1440px ≈ 1307px.

### All Students — `college/all-students.html`
- **Route:** `/lms/college/all-students`
- **Layout:** app · role `college` · active menu: Students, All students · CSS: styles.css · JS: —
- **Title:** All students — *Search across your college.*
- **Header actions (right of title):** Back to branches
- **Table 1:** columns `Student | Branch | Sem | Course | Attendance | CV | (actions)` · 6 sample rows · first row: AJAadhya Joshiaadhya.joshi6@extradata.in | Electronics & Comm. | 3 | Java & DSA | 90% Issued | — | 
- **Buttons:** Export · More · ‹ · 1 · 2 · 3 · ›
- **Links:** Aadhya Joshi → student-detail.html · Aadhya Mehta → student-detail.html · Aadhya Singh → student-detail.html · Aarav Mehta → student-detail.html · Aditya Chauhan → student-detail.html · Amit Verma → student-detail.html
- **Status pills used:** Issued · Eligible
- **Reference:** open `college/all-students.html` in a browser; full page height at 1440px ≈ 996px.

### Assessment Data — `college/assessment-data.html`
- **Route:** `/lms/college/assessment-data`
- **Layout:** app · role `college` · active menu: Assessment Data · CSS: styles.css · JS: —
- **Title:** Assessment data — *Results shared with you by Learn Being Forward.*
- **Summary tiles (left→right):** Attempted = 3 · Average = 42% · Highest = 9 / 12 · Cleared (≥ 60%) = 1
- **Sections in order:** Example: shared result
- **Table 1:** columns `Student | Branch | Marks | Percent | Result` · 2 sample rows · first row: AMAadhya Mehtaaadhya.mehta84@bulkdemo.in | — | 2 / 12 | 17% | Not cleared
- **Buttons:** Download CSV
- **Status pills used:** Not cleared · Cleared
- **Notes / empty states:** No assessment results have been shared with your college yet.When results are shared you'll see them like the example below.
- **Reference:** open `college/assessment-data.html` in a browser; full page height at 1440px ≈ 1038px.

### Batch Detail — `college/batch-detail.html`
- **Route:** `/lms/college/batch-detail`
- **Layout:** app · role `college` · active menu: Batches · CSS: styles.css · JS: —
- **Title:** Data Science / AI Fundamentals — Batch 2 — *4 / 60 students · Training in progress · Trainer: Demo Trainer*
- **Header actions (right of title):** All batches
- **Sections in order:** Students in this batch (4) → Add students to this batch
- **Checkboxes / toggles:** Ishaan Mehta · Myra Agarwal · Kavya Kumar · Yash Nair · Sanjay Sharma · Aadhya Singh
- **Buttons:** Move · Add selected
- **Reference:** open `college/batch-detail.html` in a browser; full page height at 1440px ≈ 900px.

### Batches — `college/batches.html`
- **Route:** `/lms/college/batches`
- **Layout:** app · role `college` · active menu: Batches · CSS: styles.css · JS: —
- **Title:** Batches — *Group approved students into batches of up to 60 so a trainer can be assigned.*
- **Sections in order:** Build a batch → Your batches (7) → Data Science / AI Fundamentals — Batch 2 → Placement Training Program — Batch 2 → Placement Training Program — Batch 1 → Data Science / AI Fundamentals — Batch 1 → Full-Stack Development — Batch 1 → Backend Development — Batch 1 → Robotics — Batch 1 → Undo
- **Form fields (in order):**
  - Course * [select] *required options: Select course
  - Semester [select] options: All semesters
- **Buttons:** Create batch · Undo most recent batch
- **Links:** In progress4/60Data Science / AI Fundamentals — Ba → batch-detail.html · Not started2/60Placement Training Program — Batch  → batch-detail.html · In progress2/60Placement Training Program — Batch  → batch-detail.html · In progress5/60Data Science / AI Fundamentals — Ba → batch-detail.html · Completed10/60Full-Stack Development — Batch 1Trai → batch-detail.html · Not started3/60Backend Development — Batch 1Traine → batch-detail.html · Not started5/60Robotics — Batch 1Trainer not yet a → batch-detail.html
- **Status pills used:** In progress · Not started · Completed
- **Notes / empty states:** Pick a course to list approved, unbatched students.
- **Reference:** open `college/batches.html` in a browser; full page height at 1440px ≈ 1193px.

### Content Requests — `college/content-requests.html`
- **Route:** `/lms/college/content-requests`
- **Layout:** app · role `college` · active menu: Content Requests · CSS: styles.css · JS: —
- **Title:** Content requests — *Students asking for course material they missed. Approve it here, then Learn Being Forward unlocks it for them.*
- **Sections in order:** Waiting on your decision (3) → Your past decisions
- **Buttons:** Decline · Approve
- **Status pills used:** Waiting for you · Approved
- **Notes / empty states:** Students normally get a module’s material after attending its session. When someone missed it, they request it — you confirm it’s genuine.
- **Reference:** open `college/content-requests.html` in a browser; full page height at 1440px ≈ 1159px.

### Robotics — `college/contract-detail.html`
- **Route:** `/lms/college/contracts?contractId=…`
- **Layout:** app · role `college` · active menu: Contracts · CSS: styles.css · JS: —
- **Title:** Robotics — *Training contract with Learn Being Forward*
- **Header actions (right of title):** Back to Contracts
- **Sections in order:** Details → Progress
- **Buttons:** Download MOU
- **Status pills used:** Approved
- **Notes / empty states:** This request was recorded on Nov 6, after the training dates. Learn Being Forward will normally send requests before training starts.
- **Reference:** open `college/contract-detail.html` in a browser; full page height at 1440px ≈ 900px.

### Contracts — `college/contracts.html`
- **Route:** `/lms/college/contracts`
- **Layout:** app · role `college` · active menu: Contracts · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Contracts — *Training requests, MOUs and invoices from Learn Being Forward.*
- **Dynamic widgets:** [widget: notes], [widget: college-mous], [widget: college-invoices]
- **Summary tiles (left→right):** Pending requests = 0 · Pending invoices = 0 · Active trainings = 4 · Paid to date = ₹54,000
- **Sections in order:** Notifications → MOUs from Learn Being Forward → Paid invoices → Waiting for you → Recent decisions
- **Table 1:** columns `Invoice | Training | Amount received | Paid on | (actions)` · 1 sample rows · first row: LBF/INV/2026-27/011 | Java & DSA120 students · 10 day(s) | ₹1,18,000 | 06 Oct 2026 | PDF
- **Table 2:** columns `Item | Type | Decision` · 6 sample rows · first row: Robotics | Training request | Approved
- **Buttons:** Download MOU · PDF · View MOU · Reject · Approve · Download PDF · Accept
- **Links:** Robotics — training request → contract-detail.html · Invoice · Data Science / AI Fundamentals → invoice-detail.html
- **Status pills used:** Training confirmed · Needs your decision · Approved · Accepted · Rejected
- **Notes / empty states:** No new notifications.
- **Reference:** open `college/contracts.html` in a browser; full page height at 1440px ≈ 1874px.

### Courses — `college/courses.html`
- **Route:** `/lms/college/courses`
- **Layout:** app · role `college` · active menu: Courses · CSS: styles.css · JS: —
- **Title:** Courses — *Enroll many students into a course at once. The company approves each request.*
- **Sections in order:** Enroll students in a course → Course activity
- **Form fields (in order):**
  - Course [select] options: Select a course / Java & DSA / Full-Stack Development
- **Checkboxes / toggles:** Electronics & Communication · Aadhya Joshi · Aarav Mehta · Deepak Chauhan · Information Technology · Mechanical Engineering · Electrical Engineering
- **Buttons:** Request enrollment
- **Status pills used:** 8 students · 10 students · 15 students · 12 students · 11 students
- **Reference:** open `college/courses.html` in a browser; full page height at 1440px ≈ 1089px.

### College Dashboard — `college/dashboard.html`
- **Route:** `/lms/college`
- **Layout:** app · role `college` · active menu: Overview · CSS: styles.css · JS: —
- **Title:** Crestview College of Engineering — *Your students' enrollment, attendance and training at a glance.*
- **Header actions (right of title):** Add student
- **Summary tiles (left→right):** Students enrolled = 60 · Average attendance = 66% · Courses active = 6 · Certificates issued = [n]
- **Sections in order:** Average attendance by course → Breakdown by course → Quick actions
- **Links:** Students enrolled60 → all-students.html · Courses active6 → courses.html · Java & DSA8 students · 61% avg → courses.html · Full-Stack Development10 students · 66% avg → courses.html · Data Science / AI Fundamentals15 students · 75% av → courses.html · Backend Development8 students · 73% avg → courses.html · Frontend Development12 students · 58% avg → courses.html · Robotics11 students · 61% avg → courses.html · Add a student → add-student.html · Enroll students in a course → courses.html · Build a batch → batches.html · Request an attendance exception → queries.html
- **Reference:** open `college/dashboard.html` in a browser; full page height at 1440px ≈ 1262px.

### Java & DSA — `college/enrollment-detail.html`
- **Route:** `/lms/college/students?studentId=…&enrollmentId=…`
- **Layout:** app · role `college` · active menu: Students, Browse by branch · CSS: styles.css · JS: —
- **Title:** Java & DSA — *Aadhya Joshi · Trainer: not yet assigned*
- **Header actions (right of title):** Back to student
- **Summary tiles (left→right):** Attendance = 90% · Total classes = 34 · Classes held = 20 · Attended = 18 · Certificate = Issued
- **Sections in order:** Session-by-session attendance
- **Buttons:** All (20) · Present (18) · Absent (2)
- **Status pills used:** Present · Topic not recorded · Absent
- **Reference:** open `college/enrollment-detail.html` in a browser; full page height at 1440px ≈ 2165px.

### Invoice — `college/invoice-detail.html`
- **Route:** `/lms/college/contracts?invoiceId=…`
- **Layout:** app · role `college` · active menu: Contracts · CSS: styles.css · JS: —
- **Title:** Data Science / AI Fundamentals — *Invoice from Learn Being Forward*
- **Header actions (right of title):** Back to Contracts
- **Summary tiles (left→right):** Students trained = 9 · Hours = 6 · Fee = ₹27,000 · GST 18% = ₹4,860 · Total due = ₹31,860
- **Sections in order:** Payment
- **Buttons:** Download invoice · I have paid this invoice
- **Status pills used:** Accepted · not paid
- **Notes / empty states:** The live invoice shows 12 hours for this one-day training; the contract is 1 day × 6 hours. Worth checking how hours are counted (sessions ×
- **Reference:** open `college/invoice-detail.html` in a browser; full page height at 1440px ≈ 900px.

### Profile — `college/profile.html`
- **Route:** `/lms/college/profile`
- **Layout:** app · role `college` · active menu: Profile · CSS: styles.css · JS: —
- **Title:** College profile — *College details and password.*
- **Sections in order:** College details → Students (60 total) → Change password
- **Form fields (in order):**
  - College name * [text] *required value="Crestview College of Engineering"
  - Contact email [email]
  - Current password * [password] *required
  - New password * [password] *required
- **Buttons:** Upload logo · Save · Show password · Change password
- **Notes / empty states:** "CSE" and "Computer Science" look like the same branch — consider merging.
- **Reference:** open `college/profile.html` in a browser; full page height at 1440px ≈ 916px.

### Query from Student — `college/queries.html`
- **Route:** `/lms/college/queries`
- **Layout:** app · role `college` · active menu: Query from Student · CSS: styles.css · JS: —
- **Title:** Attendance exception requests — *Ask the company to make a student certificate-eligible when they missed classes for a genuine reason.*
- **Sections in order:** Students below the attendance requirement (18) → Your requests
- **Table 1:** columns `Student | Course | Reason | Sent | Decision` · 2 sample rows · first row: AJAadhya JoshiUSN: CR26EX006 | Full-Stack Development | “hh” Reason too short | Nov 6, 2026 | Approved
- **Buttons:** Attach proof · Send request · Write a reason · ‹ · 1 · 2 · 3 · ›
- **Status pills used:** Reason too short · Approved · Waiting
- **Notes / empty states:** New requests need a reason of at least 20 characters and, for medical reasons, a document — so every exception certificate has a clear recor
- **Reference:** open `college/queries.html` in a browser; full page height at 1440px ≈ 1475px.

### Aadhya Joshi — `college/student-detail.html`
- **Route:** `/lms/college/students?studentId=…`
- **Layout:** app · role `college` · active menu: Students, Browse by branch · CSS: styles.css · JS: —
- **Title:** Aadhya Joshi — *Student · Crestview College of Engineering*
- **Header actions (right of title):** Back to All Students
- **Sections in order:** Profile → Enrollments (2)
- **Buttons:** Edit details · Reset password
- **Links:** Java & DSATrainer: Not yet assigned · 18/20 classe → enrollment-detail.html · Full-Stack DevelopmentTrainer: Demo Trainer · 0/0  → enrollment-detail.html
- **Status pills used:** Certificate issued · Certificate issued by exception
- **Notes / empty states:** No trainer or batch is linked, but 18 classes and a trainer-approved certificate are recorded — link the batch so the record is complete.
- **Reference:** open `college/student-detail.html` in a browser; full page height at 1440px ≈ 901px.

### Students — `college/students.html`
- **Route:** `/lms/college/students`
- **Layout:** app · role `college` · active menu: Students, Browse by branch · CSS: styles.css · JS: —
- **Title:** Students — *60 students across 6 branches.*
- **Sections in order:** Electronics & Communication → Information Technology → Mechanical Engineering → Electrical Engineering → Computer Science → Unspecified
- **Buttons:** View all students · Add student
- **Links:** 9 studentsElectronics & CommunicationView students → all-students.html · 8 studentsInformation TechnologyView students → → all-students.html · 12 studentsMechanical EngineeringView students → → all-students.html · 9 studentsElectrical EngineeringView students → → all-students.html · 3 studentsComputer ScienceView students → → all-students.html · 23 studentsUnspecifiedView students → → all-students.html
- **Status pills used:** 9 students · 8 students · 12 students · 3 students · 23 students
- **Reference:** open `college/students.html` in a browser; full page height at 1440px ≈ 900px.

## Trainer portal

10 pages.

### Attendance — `trainer/attendance.html`
- **Route:** `/lms/trainer/attendance`
- **Layout:** app · role `trainer` · active menu: Attendance · CSS: styles.css · JS: —
- **Title:** Attendance — *Pick a session to mark. Invoices fill up as you mark attendance.*
- **Sections in order:** Sessions
- **Table 1:** columns `Session | Batch | Module | Status | (actions)` · 2 sample rows · first row: Wed, Sep 16, 2026Slot 1 · 09:00–11:00 | Sunrise Engineering College — Backend — Batch 1 | Server Frameworks | Pending | Mark attendance
- **Buttons:** Mark attendance
- **Status pills used:** Pending
- **Notes / empty states:** You have 2 sessions waiting for attendance.
- **Reference:** open `trainer/attendance.html` in a browser; full page height at 1440px ≈ 900px.

### Backend Development — Batch 1 — `trainer/batch-detail.html`
- **Route:** `/lms/trainer/batches?batchId=…`
- **Layout:** app · role `trainer` · active menu: My Batches · CSS: styles.css · JS: —
- **Title:** Backend Development — Batch 1 — *Sunrise Engineering College · 5 students*
- **Header actions (right of title):** Back to My Batches
- **Summary tiles (left→right):** Students = 5 · Completed sessions = 0 · Attendance overdue = 2 · Modules covered = 0 / 4
- **Sections in order:** Sessions → Students (5) → Course progress
- **Table 1:** columns `Student | USN | Attended | Attendance` · 5 sample rows · first row: RPRiya PatelSunrise Engineering College | SU26CS019 | 0 / 0 | No classes yet
- **Buttons:** Mark attendance
- **Status pills used:** Overdue · Not started
- **Reference:** open `trainer/batch-detail.html` in a browser; full page height at 1440px ≈ 1413px.

### My Batches — `trainer/batches.html`
- **Route:** `/lms/trainer/batches`
- **Layout:** app · role `trainer` · active menu: My Batches · CSS: styles.css · JS: docs.js, flows.js
- **Title:** My batches — *Every batch assigned to you, including completed ones.*
- **Dynamic widgets:** [widget: trainer-mous], [widget: notes]
- **Summary tiles (left→right):** Students = 5 · Done = 0 · Upcoming = 2
- **Tabs / segmented controls:** Active (1) | Completed (0)
- **Sections in order:** Trainer MOU → Notifications → Backend Development — Batch 1
- **Buttons:** Download MOU · Upload signed copy · Share signed MOU · Open · Active (1) · Completed (0) · Schedule · Students · Mark attendance
- **Links:** Backend Development — Batch 1 → batch-detail.html
- **Status pills used:** Needs your signature · Signed · Active
- **Reference:** open `trainer/batches.html` in a browser; full page height at 1440px ≈ 1398px.

### Content — `trainer/content.html`
- **Route:** `/lms/trainer/content`
- **Layout:** app · role `trainer` · active menu: Content · CSS: styles.css · JS: —
- **Title:** Content — *Share what you've taught. Everything goes to the company admin for approval first.*
- **Sections in order:** Send course content to eligible students → Upload new content → Your content (0)
- **Table 1:** columns `(actions) | Student | Attendance | Eligible` · 2 sample rows · first row:  | Riya Patel | 100% | Yes
- **Form fields (in order):**
  - Batch [select] options: Select a batch / Sunrise — Backend Development — Batch 1
  - Title * [text] *required
  - Description * [textarea] *required
  - Course * [select] *required options: Select course / Backend Development
  - Module * [select] *required options: Select module / Server Frameworks
- **Buttons:** Send for approval · browse · Upload
- **Status pills used:** Yes · Below threshold
- **Notes / empty states:** Nothing uploaded yet.Uploads show here with status: Pending review → Sent to students.
- **Reference:** open `trainer/content.html` in a browser; full page height at 1440px ≈ 1336px.

### Trainer Dashboard — `trainer/dashboard.html`
- **Route:** `/lms/trainer`
- **Layout:** app · role `trainer` · active menu: Dashboard · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Welcome back, Demo Trainer — *What needs you today.*
- **Header actions (right of title):** Personal details
- **Dynamic widgets:** [widget: trainer-mous]
- **Summary tiles (left→right):** Active batches = 1 · Attendance to mark = 2 · Next session = — · Ready to invoice = ₹0
- **Sections in order:** Trainer MOU → Action needed → My batches → Your sessions
- **Buttons:** Download MOU · Upload signed copy · Share signed MOU · Mark now · Add details · All batches
- **Links:** Backend Development — Batch 1Sunrise Engineering C → batch-detail.html
- **Status pills used:** Needs your signature · Signed · Active
- **Reference:** open `trainer/dashboard.html` in a browser; full page height at 1440px ≈ 1528px.

### Personal Details — `trainer/details.html`
- **Route:** `/lms/trainer/details`
- **Layout:** app · role `trainer` · active menu: Personal Details · CSS: styles.css · JS: —
- **Title:** Welcome back, Demo Trainer — *Keep your details and bank info up to date — invoices need them.*
- **Summary tiles (left→right):** Active batches = 1 · Upcoming sessions = 2 · Attendance pending = 2 · Ready to invoice = ₹0
- **Sections in order:** Personal details → Bank details (for invoice payments)
- **Form fields (in order):**
  - Name * [text] *required value="Demo Trainer"
  - Email [email] value="demo.trainer@learnbeingforward.in"
  - Phone [tel]
  - Hourly rate [text] value="₹1,000 / hr"
  - About you [textarea]
  - Account holder name * [text] *required
  - Account number * [text] *required
  - IFSC code * [text] *required
  - Bank name [text]
- **Buttons:** browse · Save changes
- **Notes / empty states:** Account holder, account number and IFSC are required before you can generate an invoice.
- **Reference:** open `trainer/details.html` in a browser; full page height at 1440px ≈ 1248px.

### Invoice — `trainer/invoice.html`
- **Route:** `/lms/trainer/invoice`
- **Layout:** app · role `trainer` · active menu: Invoice · CSS: styles.css · JS: docs.js, flows.js
- **Title:** Invoice — *Your training payments.*
- **Dynamic widgets:** [widget: trainer-advices]
- **Summary tiles (left→right):** Sessions ready = 0 · Total hours = 0 · Rate = ₹1,000/hr · Total = ₹0
- **Sections in order:** Ready to invoice (0 sessions) → Generate invoice → Payments received → Past invoices
- **Table 1:** columns `Date | Batch | Module | Hours | Amount` · 1 sample rows · first row: Sep 16 | Sunrise — Backend — B1 | Server Frameworks | 2 | ₹2,000
- **Table 2:** columns `Advice | Period | Net paid | Paid on | (actions)` · 1 sample rows · first row: LBF/PA/2026-27/006 | Oct 2026Crestview College of Engineering | ₹7,200TDS ₹800 | 02 Nov 2026 | PDF
- **Table 3:** columns `Invoice | Period | Amount | Status` · 1 sample rows · first row: INV-0001 | Oct 2026 | ₹9,000 | Approved
- **Form fields (in order):**
  - Note [textarea]
- **Buttons:** Generate invoice · PDF
- **Status pills used:** Approved
- **Notes / empty states:** No completed sessions are ready to invoice yet.This fills up as you mark attendance for your classes.
- **Reference:** open `trainer/invoice.html` in a browser; full page height at 1440px ≈ 1518px.

### Mark Attendance — `trainer/mark-attendance.html`
- **Route:** `/lms/trainer/attendance?sessionId=…`
- **Layout:** app · role `trainer` · active menu: Attendance · CSS: styles.css · JS: —
- **Title:** Mark attendance — *Sunrise Engineering College — Backend Development — Batch 1*
- **Header actions (right of title):** Back to sessions
- **Buttons:** Mark all present · Clear · Present · Absent · Submit attendance
- **Status pills used:** Overdue
- **Notes / empty states:** Nobody is marked until you tap Present or Absent, so a missed student isn’t counted present by mistake. Submitting unlocks Server Frameworks ‖ 
- **Reference:** open `trainer/mark-attendance.html` in a browser; full page height at 1440px ≈ 1002px.

### MOU — `trainer/mou.html`
- **Route:** `/lms/trainer/mou`
- **Layout:** app · role `trainer` · active menu: MOU · CSS: styles.css · JS: docs.js, flows.js
- **Title:** MOU — *Your trainer MOUs — one for each college and batch you train.*
- **Dynamic widgets:** [widget: trainer-mous], [widget: notes]
- **Sections in order:** Trainer MOU → How it works → What every MOU covers → Notifications
- **Buttons:** Download MOU · Upload signed copy · Share signed MOU · Open
- **Status pills used:** Needs your signature · Signed
- **Reference:** open `trainer/mou.html` in a browser; full page height at 1440px ≈ 1527px.

### Schedule — `trainer/schedule.html`
- **Route:** `/lms/trainer/schedule`
- **Layout:** app · role `trainer` · active menu: Schedule · CSS: styles.css · JS: —
- **Title:** Your schedule — *All classes assigned to you.*
- **Sections in order:** Upcoming & pending → Batch 1 timeline
- **Buttons:** List · Calendar · Mark attendance
- **Status pills used:** Attendance overdue
- **Reference:** open `trainer/schedule.html` in a browser; full page height at 1440px ≈ 900px.

## Student portal

9 pages.

### Assessments — `student/assessments.html`
- **Route:** `/lms/student/assessments`
- **Layout:** app · role `student` · active menu: Assessments · CSS: styles.css · JS: —
- **Title:** Assessments — *Tests your college or Learn Being Forward assigned.*
- **Tabs / segmented controls:** To take (1) | Completed (0)
- **Sections in order:** Your assessments → Sasken Test 1 → Sample Test 1 → Aptitude Mock 2
- **Buttons:** To take (1) · Completed (0) · Can no longer be taken · Start assessment · Not open yet
- **Status pills used:** Technical aptitude · Window closed · Open now · Aptitude · Opens soon
- **Notes / empty states:** Assessments open full-screen. Switching tabs or leaving full-screen counts as a violation — after 3, it is submitted automatically.
- **Reference:** open `student/assessments.html` in a browser; full page height at 1440px ≈ 900px.

### Attendance — `student/attendance.html`
- **Route:** `/lms/student/attendance`
- **Layout:** app · role `student` · active menu: Attendance · CSS: styles.css · JS: —
- **Title:** Attendance — *75% attendance is required for certification.*
- **Summary tiles (left→right):** Held = 20 · Attended = 18 · Upcoming = 14 · Attendance = 90% · Held = 0 · Attended = 0 · Upcoming = 0 · Attendance = 0%
- **Sections in order:** Attendance across courses → Java & DSA → Full-Stack Development
- **Buttons:** Download
- **Notes / empty states:** Certificate issued and approved by your trainer.Download ‖ Certificate issued through an attendance exception your college requested and Learn Being Forward approved.Download
- **Reference:** open `student/attendance.html` in a browser; full page height at 1440px ≈ 928px.

### Certificate — `student/certificate.html`
- **Route:** `/lms/student/certificate/[id]`
- **Layout:** standalone · CSS: cert.css, styles.css · JS: cert.js
- **Links:** learnbeingforward.in/verify/LBF-C-2026-00593 → ../public/verify.html?id=LBF-C-2026-00593 · ✓ Verify certificate → ../public/verify.html?id=LBF-C-2026-00593
- **Reference:** open `student/certificate.html` in a browser; full page height at 1440px ≈ 942px.

### HTML/CSS fundamentals — `student/content-view.html`
- **Route:** `/lms/student/content/view?contentId=…`
- **Layout:** app · role `student` · active menu: My Dashboard · CSS: styles.css · JS: —
- **Title:** HTML/CSS fundamentals — *Viewable here only — not available to download or share.*
- **Header actions (right of title):** Back to content
- **Sections in order:** Frontend Module → The CSS box model → Learn more
- **Buttons:** Previous page · Next page · − · + · Next: JavaScript & the DOM
- **Links:** MDN — CSS Box Model → https://developer.mozilla.org/ · MDN — Basic Concepts of Flexbox → https://developer.mozilla.org/ · CSS-Tricks — A Complete Guide to Grid → https://css-tricks.com/
- **Status pills used:** Request access · Locked
- **Reference:** open `student/content-view.html` in a browser; full page height at 1440px ≈ 1084px.

### Content — `student/content.html`
- **Route:** `/lms/student/content`
- **Layout:** app · role `student` · active menu: Content · CSS: styles.css · JS: —
- **Title:** Content — *Modules unlock after your batch has had that class.*
- **Sections in order:** Full-Stack Development
- **Buttons:** Download · Request access
- **Links:** HTML & CSS fundamentals.pdf → content-view.html · JavaScript & the DOM.pdf → content-view.html · React components.pdf → content-view.html
- **Status pills used:** 3 unlocked · Request sent · Available to request · Locked
- **Reference:** open `student/content.html` in a browser; full page height at 1440px ≈ 1040px.

### Course Progress — `student/course-progress.html`
- **Route:** `/lms/student/course-progress`
- **Layout:** app · role `student` · active menu: My Dashboard · CSS: styles.css · JS: —
- **Title:** Java & DSA — *Aadhya Joshi · Trainer: Anil Deshmukh*
- **Header actions (right of title):** Back to dashboard
- **Summary tiles (left→right):** Total classes = 34 · Classes held = 20 · Attended = 18 · Attendance = 90%
- **Sections in order:** Session-by-session attendance
- **Table 1:** columns `Date | Sessions | Module | Status` · 9 sample rows · first row: Aug 28, 2026 | 1 session · 1/1 present | Java Fundamentals | Present
- **Buttons:** Download certificate · All (20) · Missed (2)
- **Status pills used:** Present · Absent
- **Notes / empty states:** Certificate issued.Download certificate
- **Reference:** open `student/course-progress.html` in a browser; full page height at 1440px ≈ 1301px.

### Browse Courses — `student/courses.html`
- **Route:** `/lms/student/courses`
- **Layout:** app · role `student` · active menu: Browse Courses · CSS: styles.css · JS: —
- **Title:** Browse courses — *Request enrollment — your college and Learn Being Forward approve it.*
- **Tabs / segmented controls:** Technical | Aptitude | Soft skills
- **Sections in order:** Backend Development → Data Science / AI Fundamentals → Frontend Development → Full-Stack Development → Java & DSA → Robotics
- **Buttons:** Technical · Aptitude · Soft skills · Request enrollment · Awaiting approval · Go to course
- **Status pills used:** Requested · Enrolled
- **Reference:** open `student/courses.html` in a browser; full page height at 1440px ≈ 904px.

### Student Dashboard — `student/dashboard.html`
- **Route:** `/lms/student`
- **Layout:** app · role `student` · active menu: My Dashboard · CSS: styles.css · JS: —
- **Title:** Hi Aadhya — *Your courses, attendance and what's next.*
- **Header actions (right of title):** Browse courses
- **Summary tiles (left→right):** Enrolled courses = 2 · Overall attendance = 90% · Next class = Mon 9:30 · Assessments due = 0
- **Sections in order:** Java & DSA → Full-Stack Development
- **Links:** View details → course-progress.html · Java Fundamentals → content.html · Java Intermediate → content.html · Java Advanced → content.html · DSA Fundamentals → content.html · DSA Advanced → content.html · Frontend Module → content.html · Backend Module → content.html · Database Module → content.html · Deployment & DevOps Module → content.html · CV → profile.html
- **Status pills used:** Certification: Eligible · 18 / 20 classes · Approved by exception · 0 / 0 classes
- **Notes / empty states:** 75% attendance is required for certification — you're at 90%. Placement support is unlocked. ‖ Certificate approved by exception. Your college requested it for a valid reason and Learn Being Forward approved it, so the attendance rule  ‖ Placement support is unlocked for Java & DSA. Keep your CV updated so the placement team can share it.
- **Reference:** open `student/dashboard.html` in a browser; full page height at 1440px ≈ 1176px.

### Profile — `student/profile.html`
- **Route:** `/lms/student/profile`
- **Layout:** app · role `student` · active menu: Profile · CSS: styles.css · JS: —
- **Title:** Profile — *Keep your details and CV up to date for placements.*
- **Sections in order:** Your details → Change password
- **Form fields (in order):**
  - Full name * [text] *required value="Aadhya Joshi"
  - Email [text] value="aadhya.joshi6@extradata.in"
  - College [text] value="Crestview College of Engineering"
  - Branch [select] options: Electronics & Communication
  - Semester [select] options: 3
  - USN / roll number [text]
  - Father's name [text]
  - Current password * [password] *required
  - New password * [password] *required
- **Buttons:** Upload photo · Upload CV · Save · Show password · Change password
- **Reference:** open `student/profile.html` in a browser; full page height at 1440px ≈ 902px.

## Documents (MOU / invoice / payment advice viewer)

1 pages.

### College MOU — `docs/view.html`
- **Route:** `/documents/[type]/[id]  (new; also the PDF render target)`
- **Layout:** standalone · CSS: styles.css, docs.css · JS: docs.js
- **Title:** Memorandum of Understanding — *Campus Training Programme · Java & DSA*
- **Sections in order:** Recitals → 1.Purpose and scope → 2.Programme details → 3.Sections and topics to be covered → 4.Schedule and timings → 5.Postponement, cancellation and delay charges → 6.Responsibilities of the Company → 7.Responsibilities of the College → 8.Certificates → 9.Commercials → 10.Payment terms → 11.Confidentiality → 12.Intellectual property → 13.Term and termination → 14.Additional terms → 15.Force majeure → 16.Dispute resolution → 17.General
- **Table 1:** columns `` · 11 sample rows · first row: Name of the institution | Crestview College of Engineering
- **Table 2:** columns `` · 6 sample rows · first row: Funding | Paid by the College
- **Reference:** open `docs/view.html` in a browser; full page height at 1440px ≈ 8168px.

## Assessment portal (exam + question builders)

10 pages.

### New aptitude question — `assessment/admin-add-aptitude.html`
- **Route:** `(assessment portal) /admin-add-aptitude`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Header actions (right of title):** 28 of 30 questions added
- **Tabs / segmented controls:** Single correct | Multiple correct | Numeric answer
- **Sections in order:** Student preview → Aptitude Skills II – ExLAT
- **Form fields (in order):**
  - Topic [select] options: Logical reasoning
  - Sub-topic [text] value="Dice & cubes"
  - Solution / explanation (shown only in the admin report) [textarea] value="Opposite faces of a die add up to 7. Four dice giv"
  - Marks (correct) [text] value="1"
  - Negative marks [text] value="0.25"
  - Difficulty [select] options: Easy
  - Tags [text] value="dice, reasoning"
- **Buttons:** Remove option · Add option · Cancel · Save & add another · Save question
- **Reference:** open `assessment/admin-add-aptitude.html` in a browser; full page height at 1440px ≈ 1236px.

### New coding question — `assessment/admin-add-coding.html`
- **Route:** `(assessment portal) /admin-add-coding`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Header actions (right of title):** Preview as student · Save draft
- **Tabs / segmented controls:** ✓ Python 3✓ Java✓ C✓ C++ | + Language
- **Sections in order:** Fill in this order → Basics → Problem statement → Input & output format → Constraints → Sample input, output & explanation → Test cases · 2 visible · 6 hidden → Boilerplate code → Reference solution Never shown to students → Validate & run rules
- **Table 1:** columns `# | Type | Label | Input | Expected output | Weight` · 8 sample rows · first row: 1 | Visible | Sample | 7 1 2 2 2 3 5 8 4 2 5 4 8 | 1 5 -1 6 | 10%
- **Form fields (in order):**
  - Question title [text] value="First Occurrence in a Sorted Array"
  - Difficulty [select] options: Easy–Medium
  - Topic [text] value="Binary Search"
  - Time limit (sec) [text] value="1"
  - Memory (MB) [text] value="256"
  - Marks [text] value="20"
  - Input format [textarea] value="Line 1: integer N
Line 2: N space-separated intege"
  - Output format [textarea] value="Print Q lines. Line i holds the answer for the i-t"
  - Sample input [textarea] value="7
1 2 2 2 3 5 8
4
2 5 4 8"
  - Sample output [textarea] value="1
5
-1
6"
  - Explanation [textarea] value="2 first appears at index 1.
5 is at index 5.
4 is "
  - Why these test cases (admin note) [textarea] value="Test 3 fails any-match answers. Test 7 catches (lo"
  - Scoring [select] options: Partial marks by test weight
  - Submissions allowed [select] options: Unlimited (last submission counts)
- **Checkboxes / toggles:** Also add this sample as visible Test 1
- **Buttons:** Bulk upload (.zip) · Add test case · Mark selected lines as editable · Re-validate · Cancel · Try it as student · Save question
- **Status pills used:** Visible · Hidden · Never shown to students
- **Notes / empty states:** Visible = runs on Run code and is shown to the student. Hidden = runs only on Submit; input never shown.
- **Reference:** open `assessment/admin-add-coding.html` in a browser; full page height at 1440px ≈ 4139px.

### New technical question — `assessment/admin-add-technical.html`
- **Route:** `(assessment portal) /admin-add-technical`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Header actions (right of title):** 9 of 14 questions added
- **Tabs / segmented controls:** Single correct | Multiple correct
- **Sections in order:** Student preview → Technical aptitude
- **Form fields (in order):**
  - Subject [select] options: OOP
  - Concept [text] value="Static members"
  - Question style [select] options: Predict the output
  - Question [textarea] value="What is the output of the following Java program?"
  - Explanation [textarea] value="x is static, so p and q share one copy: 10 + 1 + 5"
  - Marks (correct) [text] value="1"
  - Negative marks [text] value="0.25"
  - Difficulty [select] options: Medium
  - Tags [text] value="java, static"
- **Buttons:** Add option · Run snippet to verify answer · Cancel · Save & add another · Save question
- **Reference:** open `assessment/admin-add-technical.html` in a browser; full page height at 1440px ≈ 1525px.

### Create assessment — `assessment/admin-create-assessment.html`
- **Route:** `(assessment portal) /admin-create-assessment`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Header actions (right of title):** Preview as student · Save draft
- **Sections in order:** 1 · Assessment details → 2 · Sections & questions → Section 1 · Aptitude → Section 2 · Technical aptitude → Section 3 · Coding → Questions in Section 3 · Coding → 3 · Proctoring & rules
- **Table 1:** columns `# | Question | Difficulty | Test cases | Status | Marks | (actions)` · 3 sample rows · first row: 45 | First Occurrence in a Sorted Array | Medium | 2 visible · 6 hidden | ✓ Validated | 20 | Edit
- **Form fields (in order):**
  - Assessment name [text] value="Aptitude Skills II – ExLAT"
  - Assessment code [text] value="EXL-2026-NOV"
  - Duration (minutes) [text] value="120"
  - Opens on [text] value="20 Nov 2026, 10:00 AM"
  - Closes on [text] value="20 Nov 2026, 06:00 PM"
  - Pass mark [text] value="40"
  - Description (shown to students) [textarea] value="Campus hiring round 1: aptitude, technical MCQs an"
  - Tab switches allowed before auto-submit [text] value="3"
  - Instructions & violations template [select] options: Standard proctored test (your rules)
  - Message shown after submission [textarea] value="Your result will be shared by email within 3–5 wor"
- **Checkboxes / toggles:** Shuffle questions & options · Shuffle questions · Webcam recording · Microphone recording · Entire-screen sharing · Force full screen · Face match with ID photo · Block copy / paste
- **Buttons:** Create question · Add from bank · Cancel · Review & publish
- **Links:** Edit → admin-add-coding.html · Fix → admin-add-coding.html
- **Status pills used:** MCQ · MCQ + code snippets · Code · 4 languages · Medium · ✓ Validated · ✗ 1 test fails reference · Easy · Draft
- **Reference:** open `assessment/admin-create-assessment.html` in a browser; full page height at 1440px ≈ 1622px.

### Coding question — `assessment/coding.html`
- **Route:** `(assessment portal) /coding`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Tabs / segmented controls:** Test results | Custom input | Console
- **Sections in order:** First Occurrence in a Sorted Array → Description → Input format → Constraints → Sample input → Sample output → Language
- **Buttons:** Reset code · Full screen editor · Run code · Submit code · Previous problem · Finish & submit assessment · All problems · Next problem
- **Status pills used:** Coding · Medium · 20 marks · Passed · Hidden
- **Reference:** open `assessment/coding.html` in a browser; full page height at 1440px ≈ 1192px.

### Assessment portal screens — `assessment/index.html`
- **Route:** `(assessment portal) /index`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Links:** Student · System check → system-check.html · Student · Instructions & rules → instructions.html · Student · Coding question → coding.html · Student · Run vs Submit results → run-submit-states.html · Student · After submitting → submitted.html · Admin · Create assessment → admin-create-assessment.html · Admin · Add aptitude question → admin-add-aptitude.html · Admin · Add technical question → admin-add-technical.html · Admin · Add coding question → admin-add-coding.html
- **Reference:** open `assessment/index.html` in a browser; full page height at 1440px ≈ 930px.

### Instructions — `assessment/instructions.html`
- **Route:** `(assessment portal) /instructions`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Title:** Instructions & rules — *Please read everything on this page. The timer starts only when you press Start assessment.*
- **Header actions (right of title):** All system checks passed
- **Sections in order:** General instructions → AI proctoring is ON → Violations and what happens
- **Table 1:** columns `Violation | Detected by | What happens` · 7 sample rows · first row: Switching tabs or leaving full screen | Browser activity | Warning3rd time: auto-submit
- **Checkboxes / toggles:** I have read the instructions. I agree to be monitored through my camera, microph
- **Buttons:** Back to system check · Start assessment
- **Status pills used:** Warning · Blocked · Serious · Disqualified
- **Reference:** open `assessment/instructions.html` in a browser; full page height at 1440px ≈ 1309px.

### Run and Submit results — `assessment/run-submit-states.html`
- **Route:** `(assessment portal) /run-submit-states`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Tabs / segmented controls:** Test results | Custom input | Console ‖ Test results | Custom input | Console
- **Sections in order:** State 1 · Run code → compile / syntax error → State 2 · Run code → wrong answer on a visible test → State 3 · Submit code → all tests (visible + hidden)
- **Status pills used:** Wrong answer · Passed · Time limit exceeded · >1 s
- **Reference:** open `assessment/run-submit-states.html` in a browser; full page height at 1440px ≈ 900px.

### Assessment submitted — `assessment/submitted.html`
- **Route:** `(assessment portal) /submitted`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Title:** Your assessment has been submitted — *Submitted on 14 Nov 2026 at 11:47 AM · Submission ID EXL-2026-48213*
- **Header actions (right of title):** Camera & mic turned off
- **Summary tiles (left→right):** Total questions = 52 · Attempted = 46 · Not attempted = 6 · Bookmarked = 3 · Time taken = 1h 47m
- **Sections in order:** Section-wise summary → Question map → Your result will be shared after evaluation
- **Table 1:** columns `Section | Attempted | Progress` · 3 sample rows · first row: AptitudeMCQ · Q1–30 | 28 / 30 | 
- **Buttons:** Download submission receipt · Go to dashboard
- **Reference:** open `assessment/submitted.html` in a browser; full page height at 1440px ≈ 965px.

### System check — `assessment/system-check.html`
- **Route:** `(assessment portal) /system-check`
- **Layout:** exam · CSS: styles.css, exam.css · JS: —
- **Title:** Let’s make sure your system is ready — *About 30 seconds. Keep this window open and press Allow when your browser asks for the camera, microphone and screen.*
- **Sections in order:** Camera preview → System checks
- **Form fields (in order):**
  - Camera [select] options: Integrated Webcam (HD)
  - Microphone [select] options: Default – Microphone Array
- **Buttons:** Re-run checks · Next: Instructions
- **Status pills used:** 8 of 8 checks passed · Passed
- **Reference:** open `assessment/system-check.html` in a browser; full page height at 1440px ≈ 1109px.
