import type { RandomGenerator } from './mulberry32';

export * from './mulberry32';
export * from './vector';

/**
 * Returns a random integer in the range [min, max] (inclusive).
 * @param random the random generator to use
 * @param min the minimum value (inclusive)
 * @param max the maximum value (inclusive)
 */
export function int(random: RandomGenerator, min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Returns a random float in the range [min, max).
 * @param random the random generator to use
 * @param min the minimum value (inclusive)
 * @param max the maximum value (exclusive)
 */
export function float(random: RandomGenerator, min: number, max: number): number {
    return random() * (max - min) + min;
}

/**
 * Returns a random boolean.
 * @param random the random generator to use
 * @param chance the probability of returning true, in the range [0, 1]. Defaults to 0.5.
 */
export function bool(random: RandomGenerator, chance = 0.5): boolean {
    return random() < chance;
}

/**
 * Returns a random sign, either 1 or -1.
 * @param random the random generator to use
 * @param plusChance the probability of returning 1, in the range [0, 1]. Defaults to 0.5.
 */
export function sign(random: RandomGenerator, plusChance = 0.5): number {
    return random() < plusChance ? 1 : -1;
}

/**
 * Returns a random item from an array.
 * @param random the random generator to use
 * @param items the array to choose from
 * @throws if the array is empty
 */
export function choice<T>(random: RandomGenerator, items: T[]): T {
    if (items.length === 0) {
        throw new Error('cannot choose from an empty array');
    }
    return items[Math.floor(random() * items.length) % items.length];
}
