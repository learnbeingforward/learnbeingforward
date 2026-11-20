/**
 * Design check — compares every built page with its design file.
 *
 *  1) Make baselines from the design files (run once, and again if the design changes):
 *       DESIGN_DIR=/abs/path/to/design MODE=design npx playwright test -c design-check --update-snapshots
 *  2) Check the app (dev server running, logged-in sessions saved in design-check/auth/<role>.json):
 *       BASE_URL=http://localhost:3000 MODE=app npx playwright test -c design-check
 *       npx playwright show-report      ← shows design | app | diff side by side for every failure
 *  Only one page:  npx playwright test -c design-check -g "college/contracts.html"
 */
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import routes from './routes.json';

const MODE = process.env.MODE ?? 'app';
const DESIGN_DIR = process.env.DESIGN_DIR ?? path.resolve(__dirname, '../design');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const VIEWPORTS = [ { name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 } ];

type R = { design: string; route: string; role: string | null; designQuery?: string; todo?: string; mask?: string[] };

for (const r of routes as R[]) {
  for (const vp of VIEWPORTS) {
    test(`${r.design} @${vp.name}`, async ({ browser }) => {
      test.skip(MODE === 'app' && !!r.todo, `route not filled in yet: ${r.todo}`);
      const auth = r.role ? path.join(__dirname, 'auth', `${r.role}.json`) : undefined;
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        storageState: MODE === 'app' && auth && fs.existsSync(auth) ? auth : undefined,
      });
      const page = await ctx.newPage();
      const url = MODE === 'design'
        ? 'file://' + path.join(DESIGN_DIR, r.design) + (r.designQuery ?? '')
        : BASE + r.route;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => (document as any).fonts.ready);
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
      await page.waitForTimeout(300);

      // Rule 1: never wider than the screen (no horizontal scrollbar), desktop or phone.
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, `page is ${sw}px wide on a ${vp.width}px screen`).toBeLessThanOrEqual(vp.width);

      // Rule 2: looks the same as the design (2% tolerance for anti-aliasing).
      await expect(page).toHaveScreenshot(`${r.design.replace(/[\/.]/g, '_')}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        mask: (r.mask ?? []).map(s => page.locator(s)),
      });
      await ctx.close();
    });
  }
}
