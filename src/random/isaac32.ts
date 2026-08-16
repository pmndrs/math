/**
 * State of an ISAAC-32 PRNG: two 256-word arrays plus three accumulators and a
 * cursor into the current batch of results. Create one with {@link create}.
 *
 * ISAAC (Indirection, Shift, Accumulate, Add, Count) generates 256 words per
 * round and hands them out one at a time; {@link next}/{@link sample} refill the
 * batch automatically when it runs dry.
 *
 * The state is a plain object, so it can be inspected,
 * cloned (to fork a sequence), or serialised. `m`/`r` are typed arrays, so a
 * structural clone (e.g. `structuredClone`) forks correctly; a shallow `{...}`
 * copy shares them and does not.
 */
export type Isaac32 = {
    /** internal state ("mem"), 256 words */
    m: Uint32Array;
    /** current batch of results, 256 words */
    r: Uint32Array;
    /** accumulator */
    a: number;
    /** previous result */
    b: number;
    /** counter, incremented once per batch */
    c: number;
    /** cursor into `r`; a value of 256 means the batch is spent */
    i: number;
};

// Bob Jenkins' seed mixing step (the golden-ratio scrambler from randinit).
function mix(s: Uint32Array): void {
    s[0] = (s[0] ^ (s[1] << 11)) >>> 0;
    s[3] = (s[3] + s[0]) >>> 0;
    s[1] = (s[1] + s[2]) >>> 0;
    s[1] = (s[1] ^ (s[2] >>> 2)) >>> 0;
    s[4] = (s[4] + s[1]) >>> 0;
    s[2] = (s[2] + s[3]) >>> 0;
    s[2] = (s[2] ^ (s[3] << 8)) >>> 0;
    s[5] = (s[5] + s[2]) >>> 0;
    s[3] = (s[3] + s[4]) >>> 0;
    s[3] = (s[3] ^ (s[4] >>> 16)) >>> 0;
    s[6] = (s[6] + s[3]) >>> 0;
    s[4] = (s[4] + s[5]) >>> 0;
    s[4] = (s[4] ^ (s[5] << 10)) >>> 0;
    s[7] = (s[7] + s[4]) >>> 0;
    s[5] = (s[5] + s[6]) >>> 0;
    s[5] = (s[5] ^ (s[6] >>> 4)) >>> 0;
    s[0] = (s[0] + s[5]) >>> 0;
    s[6] = (s[6] + s[7]) >>> 0;
    s[6] = (s[6] ^ (s[7] << 8)) >>> 0;
    s[1] = (s[1] + s[6]) >>> 0;
    s[7] = (s[7] + s[0]) >>> 0;
    s[7] = (s[7] ^ (s[0] >>> 9)) >>> 0;
    s[2] = (s[2] + s[7]) >>> 0;
    s[0] = (s[0] + s[1]) >>> 0;
}

/**
 * Creates ISAAC-32 PRNG state seeded with `seed`.
 *
 * ISAAC is a fast, high-quality generator: its cycle length is at least 2^40 and
 * ~2^8295 on average, and its output passes stringent statistical tests. Bob
 * Jenkins designed it to resist prediction, but it is not founded on
 * cryptographic theory, so **do not rely on it for cryptography** — use the Web
 * Crypto API for that.
 *
 * A `seed` of 0 reproduces the reference implementation's unseeded output. For
 * the full-strength 64-bit variant see {@link Isaac64}.
 *
 * @param seed the seed value (32-bit integer), defaults to 0
 * @returns state to pass to {@link sample} or {@link next}
 */
export function create(seed = 0): Isaac32 {
    const m = new Uint32Array(256);
    m[0] = seed >>> 0;

    const s = new Uint32Array(8).fill(0x9e3779b9); // the golden ratio
    for (let k = 0; k < 4; k++) mix(s); // scramble it

    // fill m[], folding the seed in as we go
    for (let i = 0; i < 256; i += 8) {
        for (let k = 0; k < 8; k++) s[k] = (s[k] + m[i + k]) >>> 0;
        mix(s);
        for (let k = 0; k < 8; k++) m[i + k] = s[k];
    }

    return { m, r: new Uint32Array(256), a: 0, b: 0, c: 0, i: 256 };
}

// Generate the next batch of 256 results into state.r.
//
// This is Bob Jenkins' optimized rand.c form: two unrolled half-passes with the
// second operand (`m[j]`) walking its own index, which drops both the per-word
// `switch` on the shift pattern and the `(i + 128) % 256` wrap of the readable
// reference. `a`/`b` are hoisted into locals so the hot loop stays off the heap.
function refill(state: Isaac32): void {
    const m = state.m;
    const r = state.r;
    const c = (state.c + 1) >>> 0;
    state.c = c;
    let a = state.a;
    let b = (state.b + c) >>> 0;

    let i = 0;
    let j = 128; // second operand starts a half-array ahead, then wraps to 0
    let x = 0;
    let y = 0;

    // First half: i in [0, 128), j (the second operand) in [128, 256).
    while (i < 128) {
        x = m[i];
        a = ((a ^ (a << 13)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a >>> 6)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a << 2)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a >>> 16)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;
    }

    // Second half: i in [128, 256), j wraps back to [0, 128).
    j = 0;
    while (i < 256) {
        x = m[i];
        a = ((a ^ (a << 13)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a >>> 6)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a << 2)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;

        x = m[i];
        a = ((a ^ (a >>> 16)) + m[j++]) >>> 0;
        y = (m[(x >>> 2) & 255] + a + b) >>> 0;
        m[i] = y;
        b = (m[(y >>> 10) & 255] + x) >>> 0;
        r[i++] = b;
    }

    state.a = a;
    state.b = b;
    state.i = 0;
}

/**
 * Advances `state` and returns the next raw 32-bit unsigned integer.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns an integer in the range [0, 2^32)
 */
export function next(state: Isaac32): number {
    if (state.i >= 256) refill(state);
    return state.r[state.i++];
}

/**
 * Advances `state` and returns the next number in the range [0, 1).
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns a number in the range [0, 1)
 */
export function sample(state: Isaac32): number {
    return next(state) / 4294967296;
}

/**
 * Generates a random 32-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): number {
    return (Math.random() * 2 ** 32) >>> 0;
}
