// The pmndrs brand theme from the Three.js Conf talk: a warm dark and light ramp, and seven
// spectrum accents in order. The film keeps its high contrast, with the spectrum reserved for
// one emphasis color per cut.

export const palette = {
  /** Canvas base: the talk's mineral sky, a shade under ramp dark-900. */
  base: '#14120e',
  /** Ramp dark-900, for the page around the film. */
  page: '#191712',
  /** Brand light, for linework, type and the mark. */
  light: '#eae5da',
  /** Muted warm gray for equations and faint guides. */
  muted: '#8c877a',
  /** Dim marker fill, a warm counterpart to the guide ink. */
  dim: '#5a554a',
} as const;

export const lightRgb = [234, 229, 218] as const;

/** Brand accents in spectrum order: purple, red, orange, yellow, green, teal, blue. */
export const spectrum = ['#d855f9', '#ff4980', '#ffc043', '#ebff0f', '#caf543', '#00f7a3', '#2bdcf6'] as const;

export const spectrumRgb = spectrum.map(hex => [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))) as [number, number, number][];

/** The accent for a cut: the spectrum cycles in order, one color per cut. */
export function accent(cut: number) {
  return spectrumRgb[((cut % spectrum.length) + spectrum.length) % spectrum.length];
}

/** A color along the cyclic spectrum, `phase` in turns, as the talk's starfield shades its glints. */
export function spectrumAt(phase: number, out: [number, number, number]) {
  const hue = (phase - Math.floor(phase)) * spectrum.length;
  const from = spectrumRgb[Math.floor(hue) % spectrum.length];
  const to = spectrumRgb[(Math.floor(hue) + 1) % spectrum.length];
  const t = hue - Math.floor(hue);
  out[0] = from[0] + (to[0] - from[0]) * t;
  out[1] = from[1] + (to[1] - from[1]) * t;
  out[2] = from[2] + (to[2] - from[2]) * t;
  return out;
}
