/* SNIPPET_START: core */
import { type Vec3, vec3 } from 'maath';

// maath types are plain arrays — the constructors just return literals:
const a: Vec3 = [1, 2, 3]; // a plain-array literal
const b = vec3.fromValues(1, 2, 3); // …exactly the same as `a`
const out = vec3.create(); // …and create() is just [0, 0, 0]

// functions write into their first argument, so nothing is allocated:
vec3.add(out, a, b); // out = [2, 4, 6]
vec3.normalize(out, out); // aliasing an argument is fine
/* SNIPPET_END: core */

console.log(out);
