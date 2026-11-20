// Render timed HTML scenes to MP4 by seeking each frame and piping screenshots into ffmpeg.
// Usage: node render.cjs jobs.json   (jobs: [{html, dur, out}], fps)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

const { fps, jobs } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const WORKERS = Math.min(+(process.env.WORKERS || 4), jobs.length);

async function renderJob(browser, job) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + job.html);
  await page.evaluate(() => document.fonts.ready);
  const frames = Math.round(job.dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), job.out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
  await page.close();
  console.log(`  rendered ${job.out.split('/').pop()} (${frames} frames)`);
}

(async () => {
  const browser = await chromium.launch();
  const queue = [...jobs].sort((a, b) => b.dur - a.dur);
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    while (queue.length) await renderJob(browser, queue.shift());
  }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
