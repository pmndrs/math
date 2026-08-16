/* SNIPPET_START: modules */
import { mat4, quat, vec3 } from 'maath'; // core: vectors, quats, matrices
import { simplex3d } from 'maath/noise'; // perlin / simplex noise
import { mulberry32 } from 'maath/random'; // seeded rng
import { easing, spring } from 'maath/time'; // easings & springs
// also: maath/color, maath/geometry, maath/shapes — import only what you use
/* SNIPPET_END: modules */

// referenced so this doc module type-checks; not shown in the snippet
void [vec3, quat, mat4, mulberry32, easing, spring, simplex3d];
