import './style.css';
import { clamp } from 'math';
import { createPromoWorld } from './world';
import { Time } from './time/traits';
import { View } from './view/traits';
import { resizeView } from './view/systems';
import { prepareReveal } from './reveal/actions';
import { recordFilm } from './capture/actions';
import { frame } from './frameloop';

async function main() {
  await Promise.all([
    document.fonts.load('500 112px "Geist Mono"'),
    document.fonts.load('500 66px "Geist"'),
  ]);
  const world = createPromoWorld();
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is unavailable.');
  const view = world.get(View)!;
  view.canvas = canvas;
  view.context = ctx;
  world.set(View, view);
  const params = new URLSearchParams(location.search);
  const format = document.querySelector<HTMLSelectElement>('#format')!;
  format.value = ['4:5', '9:16', '1:1'].includes(params.get('format')!) ? params.get('format')! : '1:1';
  resizeView(world, format.value, clamp(Number(params.get('width')) || 1080, 320, 2160));
  prepareReveal(world);
  if (params.has('clean')) document.body.classList.add('clean');
  const paused = params.has('paused') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  world.set(Time, { playing: !paused, elapsed: clamp(Number(params.get('t')) || 0, 0, world.get(Time)!.duration) });

  const play = document.querySelector<HTMLButtonElement>('#play')!;
  const restart = document.querySelector<HTMLButtonElement>('#restart')!;
  const seek = document.querySelector<HTMLInputElement>('#seek')!;
  seek.max = String(world.get(Time)!.duration);
  const label = document.querySelector('#time')!;
  label.textContent = `00.0 / ${world.get(Time)!.duration.toFixed(1)}`;
  const status = document.querySelector('#status')!;
  const exportButton = document.querySelector<HTMLButtonElement>('#export')!;
  let recording = false;

  function togglePlay() {
    if (recording) return;
    const time = world.get(Time)!;
    world.set(Time, { elapsed: time.elapsed === time.duration ? 0 : time.elapsed, playing: !time.playing });
  }
  function restartFilm() { if (!recording) world.set(Time, { elapsed: 0, playing: true }); }
  play.onclick = togglePlay;
  restart.onclick = restartFilm;
  seek.oninput = () => world.set(Time, { elapsed: Math.min(Number(seek.value), world.get(Time)!.duration), playing: false });
  format.onchange = () => resizeView(world, format.value);
  document.querySelector<HTMLButtonElement>('#clean')!.onclick = () => document.body.classList.toggle('clean');
  canvas.addEventListener('pointerdown', () => document.body.classList.remove('clean'));
  document.addEventListener('keydown', event => {
    if ((event.target as HTMLElement).matches('input, select')) return;
    if (event.code === 'Space' && (event.target as HTMLElement).matches('button')) return;
    if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
    if (event.code === 'KeyR') restartFilm();
    if (event.code === 'KeyH') document.body.classList.toggle('clean');
  });
  exportButton.onclick = async () => {
    recording = true;
    for (const element of [play, restart, seek, format, exportButton]) element.disabled = true;
    try {
      status.textContent = 'Recording the full film. Keep this tab visible.';
      await recordFilm(world, seconds => { exportButton.textContent = `Exporting ${Math.round(seconds / world.get(Time)!.duration * 100)}%`; });
      status.textContent = 'Film exported. For frame-perfect MP4, use pnpm --filter math-promo render.';
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'Export failed.'; }
    finally {
      recording = false;
      for (const element of [play, restart, seek, format, exportButton]) element.disabled = false;
      exportButton.textContent = 'Export film ↗';
    }
  };

  // A deterministic entry point for offline rendering and visual checks.
  window.promo = {
    seek(seconds: number) {
      world.set(Time, { elapsed: clamp(seconds, 0, world.get(Time)!.duration), playing: false });
      frame(world, 0);
    },
    duration: world.get(Time)!.duration,
  };
  let previous = performance.now();
  function tick(now: number) {
    if (!recording) frame(world, Math.min((now - previous) / 1000, 0.1));
    previous = now;
    const time = world.get(Time)!;
    seek.value = String(time.elapsed);
    label.textContent = `${time.elapsed.toFixed(1).padStart(4, '0')} / ${time.duration.toFixed(1)}`;
    play.textContent = time.playing ? 'Ⅱ' : '▷';
    play.setAttribute('aria-label', time.playing ? 'Pause animation' : 'Play animation');
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

declare global {
  interface Window { promo: { seek: (seconds: number) => void; duration: number } }
}

main().catch(error => { document.querySelector('#status')!.textContent = error.message; console.error(error); });
