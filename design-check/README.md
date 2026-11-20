# design-check
Visual comparison of the built site against the design files. See CLAUDE_CODE_PROMPT.md, section 9.

Setup (once):  npm i -D @playwright/test && npx playwright install chromium
Log in once per role and save the session (repeat for college, trainer, student):
  npx playwright codegen --save-storage=design-check/auth/super-admin.json http://localhost:3000/login
Baselines from the design:   DESIGN_DIR=$PWD/design MODE=design npx playwright test -c design-check --update-snapshots
Check the app:               MODE=app npx playwright test -c design-check
Report with diffs:           npx playwright show-report

routes.json: one entry per design page. Entries with "todo" need a real id/query in "route" (e.g. ?studentId=…). "mask": ["css selector"] hides parts that legitimately differ (live dates, avatars).
Never commit design-check/auth/*.json (they hold login sessions) — add them to .gitignore.
