import type { World } from 'koota';
import { Time } from '../time/traits';
import { View } from '../view/traits';
import { frame } from '../frameloop';

export async function recordFilm(world: World, onProgress: (seconds: number) => void) {
  if (typeof MediaRecorder === 'undefined') throw new Error('Video export is unavailable in this browser. Use the render command in the README.');
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error('No supported video encoder. Use the render command in the README.');
  const time = { ...world.get(Time)! };
  const canvas = world.get(View)!.canvas!;
  const stream = canvas.captureStream(60);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 16000000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  const completed = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error('Video encoding failed.'));
  });
  world.set(Time, { elapsed: 0, playing: false });
  frame(world, 0);
  recorder.start();
  const start = performance.now();
  try {
    await new Promise<void>(resolve => {
      function tick(now: number) {
        const elapsed = Math.min((now - start) / 1000, time.duration - 1 / 60);
        world.set(Time, { elapsed });
        frame(world, 0);
        onProgress(elapsed);
        if (now - start < time.duration * 1000) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
    recorder.stop();
    const blob = await completed;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `math-motion-studies.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    if (recorder.state !== 'inactive') recorder.stop();
    stream.getTracks().forEach(track => track.stop());
    world.set(Time, time);
  }
}
