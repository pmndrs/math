import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { once } from 'node:events';

// Render absolute timeline samples so export speed never affects the motion.
const output = resolve(process.argv[2] || 'renders/math-motion-studies.mp4');
const format = process.argv[3] || '1:1';
const fps = Number(process.argv[4] || 60);
if (!['4:5', '9:16', '1:1'].includes(format) || !Number.isInteger(fps) || fps < 1 || fps > 120) {
  throw new Error('Usage: pnpm render [output.mp4] [1:1|4:5|9:16] [fps: 1–120]');
}
await mkdir(dirname(output), { recursive: true });
const server = await createServer({ server: { port: 0, host: '127.0.0.1' } });
await server.listen();
let browser;
let encoder;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`${server.resolvedUrls.local[0]}?paused&clean&format=${encodeURIComponent(format)}`);
  await page.waitForFunction(() => !!window.promo);
  const duration = await page.evaluate(() => window.promo.duration);
  encoder = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps),
    '-vcodec', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: ['pipe', 'inherit', 'inherit'] });
  const finished = new Promise((resolve, reject) => {
    encoder.on('error', reject);
    encoder.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
  });
  // Attach immediately so a missing encoder cannot become an unhandled rejection.
  finished.catch(() => {});
  encoder.stdin.on('error', () => {});
  for (let i = 0; i < duration * fps; i++) {
    if (encoder.exitCode !== null || encoder.stdin.destroyed) { await finished; break; }
    const data = await page.evaluate(seconds => {
      window.promo.seek(seconds);
      return document.querySelector('canvas').toDataURL('image/png').split(',')[1];
    }, i / fps);
    if (!encoder.stdin.write(Buffer.from(data, 'base64'))) await once(encoder.stdin, 'drain');
    if (i % fps === 0) process.stdout.write(`\rRendering ${Math.round(i / (duration * fps) * 100)}%`);
  }
  encoder.stdin.end();
  await finished;
  process.stdout.write(`\rSaved ${output}\n`);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser?.close();
  await server.close();
}
