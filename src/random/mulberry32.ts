/**
 * State of a Mulberry32 PRNG: a single 32-bit accumulator that {@link sample}
 * advances on each call. Create one with {@link create}.
 *
 * Unlike a closure-based generator, the state is a plain object — so it can be
 * inspected, cloned (to fork a sequence), or serialised.
 */
export type Mulberry32 = { a: number };

/**
 * Creates Mulberry32 PRNG state seeded with `seed`.
 *
 * Mulberry32 is a simple, fast, and effective PRNG that passes statistical tests
 * and has good distribution properties.
 *
 * @param seed the seed value (32-bit integer)
 * @returns state to pass to {@link sample}
 */
export function create(seed: number): Mulberry32 {
    return { a: seed };
}

/**
 * Advances `state` and returns the next raw 32-bit unsigned integer.
 *
 * The accumulator is kept to 32 bits with `| 0`; without it, `state.a` would grow
 * as an unbounded float and lose integer precision past 2^53 (~5M draws),
 * corrupting the sequence.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns an integer in the range [0, 2^32)
 */
export function next(state: Mulberry32): number {
    state.a = (state.a + 0x6d2b79f5) | 0;
    let t = state.a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
}

/**
 * Advances `state` and returns the next number in the range [0, 1).
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns a number in the range [0, 1)
 */
export function sample(state: Mulberry32): number {
    return next(state) / 4294967296;
}

/**
 * Generates a random 32-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): number {
    return (Math.random() * 2 ** 32) >>> 0;
}
