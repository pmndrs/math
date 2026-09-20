import type { View } from './traits';

/** The offscreen scene canvas, matched to the main canvas's size and transform. */
export function sceneContext(view: ReturnType<typeof View.schema>) {
  if (!view.scene) view.scene = document.createElement('canvas');
  if (view.scene.width !== view.canvas!.width || view.scene.height !== view.canvas!.height) {
    view.scene.width = view.canvas!.width;
    view.scene.height = view.canvas!.height;
  }
  const ctx = view.scene.getContext('2d', { alpha: false })!;
  ctx.setTransform(view.canvas!.width / 1000, 0, 0, view.canvas!.height / view.height, 0, 0);
  return ctx;
}
