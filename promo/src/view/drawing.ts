import { palette } from './theme';

export function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number,
  size = 12, color: string = palette.muted, align: CanvasTextAlign = 'left', family = 'mono') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = family === 'sans' ? `800 ${size}px Geist, sans-serif`
    : `400 ${size}px "Geist Mono", monospace`;
  ctx.fillText(value, x, y, 884);
}

// The pmndrs mark (github.com/pmndrs/branding, MIT): four white pieces on a 3 × 3 grid with a
// 240-unit block and 40-unit gutter, drawn here centred on (cx, cy) at `size` per 800 units.
export function mark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 800, size / 800);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(560, 0); ctx.lineTo(280, 0); ctx.lineTo(280, 240); ctx.lineTo(560, 240);
  ctx.lineTo(560, 520); ctx.lineTo(800, 520); ctx.lineTo(800, 0); ctx.closePath();
  ctx.fill();
  ctx.fillRect(0, 280, 240, 240);
  ctx.fillRect(280, 280, 240, 240);
  ctx.fillRect(280, 560, 240, 240);
  ctx.restore();
}
