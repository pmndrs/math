/**
 * State of an ISAAC64 PRNG. Create one with {@link create}.
 *
 * ISAAC64 is the 64-bit variant of ISAAC (Indirection, Shift, Accumulate, Add,
 * Count): same design as {@link Isaac32} but on 64-bit words, giving a larger
 * state and 64-bit output. JavaScript has no native 64-bit integers, so each
 * 64-bit word is split into two 32-bit lanes — `*Hi` (bits 63..32) and `*Lo`
 * (bits 31..0) — and the hot loop does 64-bit math with explicit carries in
 * plain `number`s. That keeps the whole generator in fast Word32 arithmetic
 * (see the note on {@link Isaac32}'s typed arrays); a `bigint` implementation is
 * ~6x slower. `next` reassembles a `bigint`; `sample` skips `bigint` entirely.
 *
 * The state is a plain object, so it can be inspected, cloned (to fork a
 * sequence), or serialised. The lanes are typed arrays, so a structural clone
 * (e.g. `structuredClone`) forks correctly; a shallow `{...}` copy shares them.
 */
export type Isaac64 = {
    /** internal state ("mem") high/low lanes, 256 words */
    mHi: Uint32Array;
    mLo: Uint32Array;
    /** current batch of results, high/low lanes, 256 words */
    rHi: Uint32Array;
    rLo: Uint32Array;
    /** accumulator */
    aHi: number;
    aLo: number;
    /** previous result */
    bHi: number;
    bLo: number;
    /** counter, incremented once per batch */
    cHi: number;
    cLo: number;
    /** cursor into `r`; a value of 256 means the batch is spent */
    i: number;
};

const MASK = 0xffffffffffffffffn;

// The golden-ratio constant 0x9e3779b97f4a7c15 pre-scrambled by the reference's
// four mixing rounds — the seed-mixing starting accumulators.
const SCRAMBLED = [
    0x647c4677a2884b7cn,
    0xb9f8b322c73ac862n,
    0x8c0ea5053d4712a0n,
    0xb29b2e824a595524n,
    0x82f053db8355e0cen,
    0x48fe4a0fa5a09315n,
    0xae985bf2cbfc89edn,
    0x98f5704f6c44c0abn,
];

/**
 * Creates ISAAC64 PRNG state seeded with `seed`.
 *
 * ISAAC64 is a fast, high-quality generator with an enormous cycle length
 * (~2^8295 on average). Bob Jenkins designed it to resist prediction, but it is
 * not founded on cryptographic theory, so **do not rely on it for
 * cryptography** — use the Web Crypto API for that.
 *
 * A `seed` of 0 reproduces the reference implementation's unseeded output.
 *
 * @param seed the seed value (64-bit integer), defaults to 0n
 * @returns state to pass to {@link sample} or {@link next}
 */
export function create(seed: bigint = 0n): Isaac64 {
    // Seed mixing is one-time (not hot), so it stays in 64-bit `bigint`; the
    // resulting `m` is then split into the 32-bit lanes the refill loop uses.
    const m = new BigUint64Array(256);
    m[0] = seed & MASK;

    const a = SCRAMBLED.slice();
    for (let j = 0; j < 256; j += 8) {
        for (let x = 0; x < 8; x++) a[x] = (a[x] + m[j + x]) & MASK;
        a[0] = (a[0] - a[4]) & MASK;
        a[5] ^= a[7] >> 9n;
        a[7] = (a[7] + a[0]) & MASK;
        a[1] = (a[1] - a[5]) & MASK;
        a[6] ^= (a[0] << 9n) & MASK;
        a[0] = (a[0] + a[1]) & MASK;
        a[2] = (a[2] - a[6]) & MASK;
        a[7] ^= a[1] >> 23n;
        a[1] = (a[1] + a[2]) & MASK;
        a[3] = (a[3] - a[7]) & MASK;
        a[0] ^= (a[2] << 15n) & MASK;
        a[2] = (a[2] + a[3]) & MASK;
        a[4] = (a[4] - a[0]) & MASK;
        a[1] ^= a[3] >> 14n;
        a[3] = (a[3] + a[4]) & MASK;
        a[5] = (a[5] - a[1]) & MASK;
        a[2] ^= (a[4] << 20n) & MASK;
        a[4] = (a[4] + a[5]) & MASK;
        a[6] = (a[6] - a[2]) & MASK;
        a[3] ^= a[5] >> 17n;
        a[5] = (a[5] + a[6]) & MASK;
        a[7] = (a[7] - a[3]) & MASK;
        a[4] ^= (a[6] << 14n) & MASK;
        a[6] = (a[6] + a[7]) & MASK;
        for (let x = 0; x < 8; x++) m[j + x] = a[x];
    }

    const mHi = new Uint32Array(256);
    const mLo = new Uint32Array(256);
    for (let k = 0; k < 256; k++) {
        const v = m[k];
        mLo[k] = Number(v & 0xffffffffn);
        mHi[k] = Number(v >> 32n);
    }

    return {
        mHi,
        mLo,
        rHi: new Uint32Array(256),
        rLo: new Uint32Array(256),
        aHi: 0,
        aLo: 0,
        bHi: 0,
        bLo: 0,
        cHi: 0,
        cLo: 0,
        i: 256,
    };
}

const TWO32 = 4294967296; // 2^32, the carry threshold

// Generate the next batch of 256 results into state.r{Hi,Lo}.
//
// Bob Jenkins' ISAAC64 on split 32-bit lanes: each 64-bit add is a lane add plus
// a carry into the high lane, and the 64-bit shifts (21/5/12/33) are done by
// hand across the lane boundary. Results are written in reverse (r[255 - i]) to
// match the reference stream order. `a`/`b` are hoisted into locals so the loop
// stays in fast Word32 integer math.
function refill(state: Isaac64): void {
    const mHi = state.mHi;
    const mLo = state.mLo;
    const rHi = state.rHi;
    const rLo = state.rLo;

    // c += 1
    const cLo = (state.cLo + 1) >>> 0;
    let cHi = state.cHi;
    if (cLo === 0) cHi = (cHi + 1) >>> 0;
    state.cLo = cLo;
    state.cHi = cHi;

    // b += c
    const b0 = state.bLo + cLo;
    let bLo = b0 >>> 0;
    let bHi = (state.bHi + cHi + (b0 >= TWO32 ? 1 : 0)) >>> 0;

    let aHi = state.aHi;
    let aLo = state.aLo;

    for (let i = 0; i < 256; i++) {
        // mixed = (~)(a ^ (a << k)) / (a ^ (a >> k)), the shift pattern cycling
        // every four words. Only the mix differs between the four cases.
        let mxHi: number;
        let mxLo: number;
        let tHi: number;
        let tLo: number;
        switch (i & 3) {
            case 0: // ~(a ^ (a << 21))
                tHi = ((aHi << 21) | (aLo >>> 11)) >>> 0;
                tLo = (aLo << 21) >>> 0;
                mxHi = ~(aHi ^ tHi) >>> 0;
                mxLo = ~(aLo ^ tLo) >>> 0;
                break;
            case 1: // a ^ (a >> 5)
                tLo = ((aLo >>> 5) | (aHi << 27)) >>> 0;
                tHi = aHi >>> 5;
                mxHi = (aHi ^ tHi) >>> 0;
                mxLo = (aLo ^ tLo) >>> 0;
                break;
            case 2: // a ^ (a << 12)
                tHi = ((aHi << 12) | (aLo >>> 20)) >>> 0;
                tLo = (aLo << 12) >>> 0;
                mxHi = (aHi ^ tHi) >>> 0;
                mxLo = (aLo ^ tLo) >>> 0;
                break;
            default: // a ^ (a >> 33) — shifts entirely into the low lane
                mxLo = (aLo ^ (aHi >>> 1)) >>> 0;
                mxHi = aHi;
        }

        const i2 = (i + 128) & 255; // the second operand, half an array ahead
        const xLo = mLo[i];
        const xHi = mHi[i];

        // a = mixed + m[i2]
        const s0 = mxLo + mLo[i2];
        aLo = s0 >>> 0;
        aHi = (mxHi + mHi[i2] + (s0 >= TWO32 ? 1 : 0)) >>> 0;

        // y = a + b + m[(x >> 3) & 255]   (the low 8 index bits live in the low lane)
        const idx = (xLo >>> 3) & 255;
        let abLo = aLo + bLo;
        const abHi = (aHi + bHi + (abLo >= TWO32 ? 1 : 0)) >>> 0;
        abLo = abLo >>> 0;
        let yLo = abLo + mLo[idx];
        const yHi = (abHi + mHi[idx] + (yLo >= TWO32 ? 1 : 0)) >>> 0;
        yLo = yLo >>> 0;
        mLo[i] = yLo;
        mHi[i] = yHi;

        // b = x + m[(y >> 11) & 255]
        const idx2 = (yLo >>> 11) & 255;
        const t = xLo + mLo[idx2];
        bHi = (xHi + mHi[idx2] + (t >= TWO32 ? 1 : 0)) >>> 0;
        bLo = t >>> 0;

        const o = 255 - i;
        rLo[o] = bLo;
        rHi[o] = bHi;
    }

    state.aHi = aHi;
    state.aLo = aLo;
    state.bHi = bHi;
    state.bLo = bLo;
    state.i = 0;
}

/**
 * Advances `state` and returns the next raw 64-bit unsigned integer.
 *
 * This reassembles a `bigint` from the two lanes, so it allocates; for a value
 * in [0, 1) prefer {@link sample}, which stays in `number` arithmetic.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns an integer in the range [0, 2^64)
 */
export function next(state: Isaac64): bigint {
    if (state.i >= 256) refill(state);
    const i = state.i++;
    return (BigInt(state.rHi[i]) << 32n) | BigInt(state.rLo[i]);
}

/**
 * Advances `state` and returns the next number in the range [0, 1).
 *
 * The result carries 53 bits of randomness (the width of a double's mantissa),
 * taken from the high bits of a 64-bit word — read straight from the lanes, so
 * no `bigint` is allocated.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns a number in the range [0, 1)
 */
export function sample(state: Isaac64): number {
    if (state.i >= 256) refill(state);
    const i = state.i++;
    // top 53 bits = (word >> 11) = hi * 2^21 + (lo >>> 11), exact in a double
    return (state.rHi[i] * 2097152 + (state.rLo[i] >>> 11)) / 9007199254740992; // 2^21, 2^53
}

/**
 * Generates a random 64-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): bigint {
    const hi = BigInt((Math.random() * 2 ** 32) >>> 0);
    const lo = BigInt((Math.random() * 2 ** 32) >>> 0);
    return (hi << 32n) | lo;
}
