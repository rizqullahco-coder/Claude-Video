// HTML -> PDF (and optional PNG) with Playwright. Usage: node pdf.cjs jobs.json
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch();
  for (const j of jobs) {
    const page = await browser.newPage(j.landscape ? { viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2 } : {});
    await page.goto('file://' + j.html);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: j.pdf, format: 'A4', landscape: !!j.landscape, printBackground: true, preferCSSPageSize: true });
    if (j.png) await page.screenshot({ path: j.png, clip: { x: 0, y: 0, width: 1123, height: 794 } });
    console.log('  ' + j.pdf.split('/').pop());
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
