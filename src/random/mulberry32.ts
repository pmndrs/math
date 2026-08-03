/** A function that returns a random number in the range [0, 1). */
export type RandomGenerator = () => number;

/**
 * Creates a Mulberry32 seeded pseudo-random number generator.
 * Mulberry32 is a simple, fast, and effective PRNG that passes statistical tests
 * and has good distribution properties.
 *
 * @param seed the seed value (32-bit integer)
 * @returns a generator that returns numbers in the range [0, 1)
 */
export function createMulberry32(seed: number): RandomGenerator {
    let a = seed;

    return () => {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generates a random 32-bit unsigned integer seed, suitable for use with
 * {@link createMulberry32}.
 */
export function seed(): number {
    return (Math.random() * 2 ** 32) >>> 0;
}
