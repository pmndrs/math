export const exp = (t: number) => 1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t);

export const linear = (t: number) => t;

export const sineIn = (x: number) => 1 - Math.cos((x * Math.PI) / 2);
export const sineOut = (x: number) => Math.sin((x * Math.PI) / 2);
export const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

export const cubicIn = (x: number) => x * x * x;
export function cubicOut(x: number): number {
    const t = 1 - x;
    return 1 - t * t * t;
}

export function cubicInOut(x: number): number {
    if (x < 0.5) return 4 * x * x * x;
    const t = -2 * x + 2;
    return 1 - (t * t * t) / 2;
}

export function quintIn(x: number): number {
    return x * x * x * x * x;
}

export function quintOut(x: number): number {
    const t = 1 - x;
    return 1 - t * t * t * t * t;
}

export function quintInOut(x: number): number {
    if (x < 0.5) return 16 * x * x * x * x * x;
    const t = -2 * x + 2;
    return 1 - (t * t * t * t * t) / 2;
}

export const circIn = (x: number) => 1 - Math.sqrt(1 - x * x);
export const circOut = (x: number) => Math.sqrt(1 - (x - 1) * (x - 1));
export const circInOut = (x: number) =>
    x < 0.5 ? (1 - Math.sqrt(1 - 2 * x * (2 * x))) / 2 : (Math.sqrt(1 - (-2 * x + 2) * (-2 * x + 2)) + 1) / 2;

export const quartIn = (t: number) => t * t * t * t;
export const quartOut = (t: number) => 1 - --t * t * t * t;
export const quartInOut = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);

export const expoIn = (x: number) => (x === 0 ? 0 : 2 ** (10 * x - 10));
export const expoOut = (x: number) => (x === 1 ? 1 : 1 - 2 ** (-10 * x));
export const expoInOut = (x: number) =>
    x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2;

export const rsqw = (t: number, delta = 0.01, a = 1, f = 1 / (2 * Math.PI)) =>
    (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
