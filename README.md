```sh
> npm install math@canary
```

# math

math is a collection of math helpers for graphics and simulations.

**Features:**

- Vector, Quaternion, Euler, and Matrix math (`math`)
- Shape primitives and spatial queries (`math/shapes`)
- Computational geometry - convex hulls, circumcircle (`math/geometry`)
- Easing and spring functions (`math/time`)
- Seeded randomness utilities (`math/random`)
- Perlin and simplex noise utilities (`math/noise`)
- Color and colorspace utilities (`math/color`)
- Simple JSON-serializable data structures (no classes or typed arrays)
- Consistent output-argument-first API for allocation-free usage
- TypeScript-first, great DX for both JavaScript and TypeScript projects
- Excellent tree-shaking support, with a subpath entrypoint per module group

## Quick Start

```ts
import { type Vec3, vec3 } from 'math';

// math types are plain arrays — the constructors just return literals:
const a: Vec3 = [1, 2, 3]; // a plain-array literal
const b = vec3.fromValues(1, 2, 3); // the same as `a`
const out = vec3.create(); // returns [0, 0, 0]

// functions write into their first argument, so nothing is allocated:
vec3.add(out, a, b); // out = [2, 4, 6]
vec3.normalize(out, out); // aliasing an argument is fine
```

The library is grouped by domain behind subpath entrypoints. All APIs are highly tree-shakeable, only pay for what you use:

```ts
import { mat4, quat, vec3 } from 'math'; // core: vectors, quats, matrices
import { simplex3d } from 'math/noise'; // perlin / simplex noise
import { mulberry32 } from 'math/random'; // seeded rng
import { easing, spring } from 'math/time'; // easings & springs
// also: math/color, math/geometry, math/shapes — import only what you use
```

## Examples

<table>
  <tr>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-look-at">
        <img src="./examples/public/screenshots/example-look-at.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Look At
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-fibonacci-sphere">
        <img src="./examples/public/screenshots/example-fibonacci-sphere.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Fibonacci Sphere
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-contains-point">
        <img src="./examples/public/screenshots/example-contains-point.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Contains Point
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-convex-hull-3d">
        <img src="./examples/public/screenshots/example-convex-hull-3d.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Convex Hull 3D
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-convex-hull-2d">
        <img src="./examples/public/screenshots/example-convex-hull-2d.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Convex Hull 2D
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-circumcircle">
        <img src="./examples/public/screenshots/example-circumcircle.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Circumcircle
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-flow-field">
        <img src="./examples/public/screenshots/example-flow-field.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Flow Field
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-color-wheel">
        <img src="./examples/public/screenshots/example-color-wheel.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Color Wheel
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-ridged-noise-voxel-terrain">
        <img src="./examples/public/screenshots/example-ridged-noise-voxel-terrain.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Ridged Noise Voxel Terrain
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-simplex-4d-looping-noise">
        <img src="./examples/public/screenshots/example-simplex-4d-looping-noise.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Simplex 4D Looping Noise
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-simplex-2d-noise-terrain">
        <img src="./examples/public/screenshots/example-simplex-2d-noise-terrain.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Simplex 2D Noise Terrain
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-quaternion-slerp">
        <img src="./examples/public/screenshots/example-quaternion-slerp.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Quaternion Slerp
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-spring">
        <img src="./examples/public/screenshots/example-spring.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Spring
      </a>
    </td>
    <td align="center">
      <a href="https://pmndrs.github.io/math/examples/#example-easing">
        <img src="./examples/public/screenshots/example-easing.png" width="180" height="120" style="object-fit:cover;"/><br/>
        Easing
      </a>
    </td>
  </tr>
</table>

## API Documentation

**`math`**

<table><tr>
<td><a href="#epsilon"><code>EPSILON</code></a></td><td><a href="#round"><code>round</code></a></td><td><a href="#degreestoradians"><code>degreesToRadians</code></a></td><td><a href="#radianstodegrees"><code>radiansToDegrees</code></a></td>
</tr><tr>
<td><a href="#equals"><code>equals</code></a></td><td><a href="#fade"><code>fade</code></a></td><td><a href="#lerp"><code>lerp</code></a></td><td><a href="#clamp"><code>clamp</code></a></td>
</tr><tr>
<td><a href="#repeat"><code>repeat</code></a></td><td><a href="#deltaangle"><code>deltaAngle</code></a></td><td><a href="#remap"><code>remap</code></a></td><td><a href="#remapclamp"><code>remapClamp</code></a></td>
</tr><tr>
<td><a href="#mutablearraylike"><code>MutableArrayLike</code></a></td><td><a href="#vec2"><code>Vec2</code></a></td><td><a href="#vec3"><code>Vec3</code></a></td><td><a href="#vec4"><code>Vec4</code></a></td>
</tr><tr>
<td><a href="#euler"><code>Euler</code></a></td><td><a href="#eulerorder"><code>EulerOrder</code></a></td><td><a href="#quat"><code>Quat</code></a></td><td><a href="#quat2"><code>Quat2</code></a></td>
</tr><tr>
<td><a href="#mat2"><code>Mat2</code></a></td><td><a href="#mat2d"><code>Mat2d</code></a></td><td><a href="#mat3"><code>Mat3</code></a></td><td><a href="#mat4"><code>Mat4</code></a></td>
</tr><tr>
<td><a href="#spherical"><code>Spherical</code></a></td><td><a href="#polar"><code>Polar</code></a></td><td></td><td></td>
</tr></table>

**vec2**

<table><tr>
<td><a href="#vec2create"><code>vec2.create</code></a></td><td><a href="#vec2clone"><code>vec2.clone</code></a></td><td><a href="#vec2fromvalues"><code>vec2.fromValues</code></a></td>
</tr><tr>
<td><a href="#vec2copy"><code>vec2.copy</code></a></td><td><a href="#vec2set"><code>vec2.set</code></a></td><td><a href="#vec2frombuffer"><code>vec2.fromBuffer</code></a></td>
</tr><tr>
<td><a href="#vec2tobuffer"><code>vec2.toBuffer</code></a></td><td><a href="#vec2add"><code>vec2.add</code></a></td><td><a href="#vec2addscalar"><code>vec2.addScalar</code></a></td>
</tr><tr>
<td><a href="#vec2subtract"><code>vec2.subtract</code></a></td><td><a href="#vec2subtractscalar"><code>vec2.subtractScalar</code></a></td><td><a href="#vec2multiply"><code>vec2.multiply</code></a></td>
</tr><tr>
<td><a href="#vec2divide"><code>vec2.divide</code></a></td><td><a href="#vec2ceil"><code>vec2.ceil</code></a></td><td><a href="#vec2floor"><code>vec2.floor</code></a></td>
</tr><tr>
<td><a href="#vec2min"><code>vec2.min</code></a></td><td><a href="#vec2max"><code>vec2.max</code></a></td><td><a href="#vec2round"><code>vec2.round</code></a></td>
</tr><tr>
<td><a href="#vec2scale"><code>vec2.scale</code></a></td><td><a href="#vec2scaleandadd"><code>vec2.scaleAndAdd</code></a></td><td><a href="#vec2distance"><code>vec2.distance</code></a></td>
</tr><tr>
<td><a href="#vec2squareddistance"><code>vec2.squaredDistance</code></a></td><td><a href="#vec2length"><code>vec2.length</code></a></td><td><a href="#vec2squaredlength"><code>vec2.squaredLength</code></a></td>
</tr><tr>
<td><a href="#vec2negate"><code>vec2.negate</code></a></td><td><a href="#vec2inverse"><code>vec2.inverse</code></a></td><td><a href="#vec2normalize"><code>vec2.normalize</code></a></td>
</tr><tr>
<td><a href="#vec2dot"><code>vec2.dot</code></a></td><td><a href="#vec2cross"><code>vec2.cross</code></a></td><td><a href="#vec2lerp"><code>vec2.lerp</code></a></td>
</tr><tr>
<td><a href="#vec2transformmat2"><code>vec2.transformMat2</code></a></td><td><a href="#vec2transformmat2d"><code>vec2.transformMat2d</code></a></td><td><a href="#vec2transformmat3"><code>vec2.transformMat3</code></a></td>
</tr><tr>
<td><a href="#vec2transformmat4"><code>vec2.transformMat4</code></a></td><td><a href="#vec2rotate"><code>vec2.rotate</code></a></td><td><a href="#vec2angle"><code>vec2.angle</code></a></td>
</tr><tr>
<td><a href="#vec2zero"><code>vec2.zero</code></a></td><td><a href="#vec2str"><code>vec2.str</code></a></td><td><a href="#vec2exactequals"><code>vec2.exactEquals</code></a></td>
</tr><tr>
<td><a href="#vec2equals"><code>vec2.equals</code></a></td><td><a href="#vec2finite"><code>vec2.finite</code></a></td><td><a href="#vec2len"><code>vec2.len</code></a></td>
</tr><tr>
<td><a href="#vec2sub"><code>vec2.sub</code></a></td><td><a href="#vec2mul"><code>vec2.mul</code></a></td><td><a href="#vec2div"><code>vec2.div</code></a></td>
</tr><tr>
<td><a href="#vec2dist"><code>vec2.dist</code></a></td><td><a href="#vec2sqrdist"><code>vec2.sqrDist</code></a></td><td><a href="#vec2sqrlen"><code>vec2.sqrLen</code></a></td>
</tr></table>

**vec3**

<table><tr>
<td><a href="#vec3create"><code>vec3.create</code></a></td><td><a href="#vec3clone"><code>vec3.clone</code></a></td><td><a href="#vec3fromvalues"><code>vec3.fromValues</code></a></td>
</tr><tr>
<td><a href="#vec3length"><code>vec3.length</code></a></td><td><a href="#vec3copy"><code>vec3.copy</code></a></td><td><a href="#vec3set"><code>vec3.set</code></a></td>
</tr><tr>
<td><a href="#vec3setscalar"><code>vec3.setScalar</code></a></td><td><a href="#vec3frombuffer"><code>vec3.fromBuffer</code></a></td><td><a href="#vec3tobuffer"><code>vec3.toBuffer</code></a></td>
</tr><tr>
<td><a href="#vec3add"><code>vec3.add</code></a></td><td><a href="#vec3addscalar"><code>vec3.addScalar</code></a></td><td><a href="#vec3subtract"><code>vec3.subtract</code></a></td>
</tr><tr>
<td><a href="#vec3subtractscalar"><code>vec3.subtractScalar</code></a></td><td><a href="#vec3multiply"><code>vec3.multiply</code></a></td><td><a href="#vec3divide"><code>vec3.divide</code></a></td>
</tr><tr>
<td><a href="#vec3ceil"><code>vec3.ceil</code></a></td><td><a href="#vec3floor"><code>vec3.floor</code></a></td><td><a href="#vec3min"><code>vec3.min</code></a></td>
</tr><tr>
<td><a href="#vec3max"><code>vec3.max</code></a></td><td><a href="#vec3round"><code>vec3.round</code></a></td><td><a href="#vec3scale"><code>vec3.scale</code></a></td>
</tr><tr>
<td><a href="#vec3scaleandadd"><code>vec3.scaleAndAdd</code></a></td><td><a href="#vec3distance"><code>vec3.distance</code></a></td><td><a href="#vec3squareddistance"><code>vec3.squaredDistance</code></a></td>
</tr><tr>
<td><a href="#vec3squaredlength"><code>vec3.squaredLength</code></a></td><td><a href="#vec3negate"><code>vec3.negate</code></a></td><td><a href="#vec3inverse"><code>vec3.inverse</code></a></td>
</tr><tr>
<td><a href="#vec3normalize"><code>vec3.normalize</code></a></td><td><a href="#vec3dot"><code>vec3.dot</code></a></td><td><a href="#vec3cross"><code>vec3.cross</code></a></td>
</tr><tr>
<td><a href="#vec3perpendicular"><code>vec3.perpendicular</code></a></td><td><a href="#vec3lerp"><code>vec3.lerp</code></a></td><td><a href="#vec3slerp"><code>vec3.slerp</code></a></td>
</tr><tr>
<td><a href="#vec3hermite"><code>vec3.hermite</code></a></td><td><a href="#vec3bezier"><code>vec3.bezier</code></a></td><td><a href="#vec3transformmat4"><code>vec3.transformMat4</code></a></td>
</tr><tr>
<td><a href="#vec3transformmat3"><code>vec3.transformMat3</code></a></td><td><a href="#vec3transformquat"><code>vec3.transformQuat</code></a></td><td><a href="#vec3rotatex"><code>vec3.rotateX</code></a></td>
</tr><tr>
<td><a href="#vec3rotatey"><code>vec3.rotateY</code></a></td><td><a href="#vec3rotatez"><code>vec3.rotateZ</code></a></td><td><a href="#vec3angle"><code>vec3.angle</code></a></td>
</tr><tr>
<td><a href="#vec3zero"><code>vec3.zero</code></a></td><td><a href="#vec3str"><code>vec3.str</code></a></td><td><a href="#vec3exactequals"><code>vec3.exactEquals</code></a></td>
</tr><tr>
<td><a href="#vec3equals"><code>vec3.equals</code></a></td><td><a href="#vec3finite"><code>vec3.finite</code></a></td><td><a href="#vec3isscaleinsideout"><code>vec3.isScaleInsideOut</code></a></td>
</tr><tr>
<td><a href="#vec3sub"><code>vec3.sub</code></a></td><td><a href="#vec3mul"><code>vec3.mul</code></a></td><td><a href="#vec3div"><code>vec3.div</code></a></td>
</tr><tr>
<td><a href="#vec3dist"><code>vec3.dist</code></a></td><td><a href="#vec3sqrdist"><code>vec3.sqrDist</code></a></td><td><a href="#vec3len"><code>vec3.len</code></a></td>
</tr><tr>
<td><a href="#vec3sqrlen"><code>vec3.sqrLen</code></a></td><td></td><td></td>
</tr></table>

**vec4**

<table><tr>
<td><a href="#vec4create"><code>vec4.create</code></a></td><td><a href="#vec4clone"><code>vec4.clone</code></a></td><td><a href="#vec4fromvalues"><code>vec4.fromValues</code></a></td>
</tr><tr>
<td><a href="#vec4copy"><code>vec4.copy</code></a></td><td><a href="#vec4set"><code>vec4.set</code></a></td><td><a href="#vec4frombuffer"><code>vec4.fromBuffer</code></a></td>
</tr><tr>
<td><a href="#vec4tobuffer"><code>vec4.toBuffer</code></a></td><td><a href="#vec4add"><code>vec4.add</code></a></td><td><a href="#vec4subtract"><code>vec4.subtract</code></a></td>
</tr><tr>
<td><a href="#vec4multiply"><code>vec4.multiply</code></a></td><td><a href="#vec4divide"><code>vec4.divide</code></a></td><td><a href="#vec4ceil"><code>vec4.ceil</code></a></td>
</tr><tr>
<td><a href="#vec4floor"><code>vec4.floor</code></a></td><td><a href="#vec4min"><code>vec4.min</code></a></td><td><a href="#vec4max"><code>vec4.max</code></a></td>
</tr><tr>
<td><a href="#vec4round"><code>vec4.round</code></a></td><td><a href="#vec4scale"><code>vec4.scale</code></a></td><td><a href="#vec4scaleandadd"><code>vec4.scaleAndAdd</code></a></td>
</tr><tr>
<td><a href="#vec4distance"><code>vec4.distance</code></a></td><td><a href="#vec4squareddistance"><code>vec4.squaredDistance</code></a></td><td><a href="#vec4length"><code>vec4.length</code></a></td>
</tr><tr>
<td><a href="#vec4squaredlength"><code>vec4.squaredLength</code></a></td><td><a href="#vec4negate"><code>vec4.negate</code></a></td><td><a href="#vec4inverse"><code>vec4.inverse</code></a></td>
</tr><tr>
<td><a href="#vec4normalize"><code>vec4.normalize</code></a></td><td><a href="#vec4dot"><code>vec4.dot</code></a></td><td><a href="#vec4cross"><code>vec4.cross</code></a></td>
</tr><tr>
<td><a href="#vec4lerp"><code>vec4.lerp</code></a></td><td><a href="#vec4transformmat4"><code>vec4.transformMat4</code></a></td><td><a href="#vec4transformquat"><code>vec4.transformQuat</code></a></td>
</tr><tr>
<td><a href="#vec4zero"><code>vec4.zero</code></a></td><td><a href="#vec4str"><code>vec4.str</code></a></td><td><a href="#vec4exactequals"><code>vec4.exactEquals</code></a></td>
</tr><tr>
<td><a href="#vec4equals"><code>vec4.equals</code></a></td><td><a href="#vec4finite"><code>vec4.finite</code></a></td><td><a href="#vec4sub"><code>vec4.sub</code></a></td>
</tr><tr>
<td><a href="#vec4mul"><code>vec4.mul</code></a></td><td><a href="#vec4div"><code>vec4.div</code></a></td><td><a href="#vec4dist"><code>vec4.dist</code></a></td>
</tr><tr>
<td><a href="#vec4sqrdist"><code>vec4.sqrDist</code></a></td><td><a href="#vec4len"><code>vec4.len</code></a></td><td><a href="#vec4sqrlen"><code>vec4.sqrLen</code></a></td>
</tr></table>

**euler**

<table><tr>
<td><a href="#eulercreate"><code>euler.create</code></a></td><td><a href="#eulerfromvalues"><code>euler.fromValues</code></a></td><td><a href="#eulerset"><code>euler.set</code></a></td>
</tr><tr>
<td><a href="#eulerfromdegrees"><code>euler.fromDegrees</code></a></td><td><a href="#eulerfromrotationmat4"><code>euler.fromRotationMat4</code></a></td><td><a href="#eulerexactequals"><code>euler.exactEquals</code></a></td>
</tr><tr>
<td><a href="#eulerequals"><code>euler.equals</code></a></td><td><a href="#eulerfromquat"><code>euler.fromQuat</code></a></td><td><a href="#eulerreorder"><code>euler.reorder</code></a></td>
</tr></table>

**quat**

<table><tr>
<td><a href="#quatcreate"><code>quat.create</code></a></td><td><a href="#quatfrombuffer"><code>quat.fromBuffer</code></a></td><td><a href="#quattobuffer"><code>quat.toBuffer</code></a></td>
</tr><tr>
<td><a href="#quatidentity"><code>quat.identity</code></a></td><td><a href="#quatsetaxisangle"><code>quat.setAxisAngle</code></a></td><td><a href="#quatgetaxisangle"><code>quat.getAxisAngle</code></a></td>
</tr><tr>
<td><a href="#quatgetangle"><code>quat.getAngle</code></a></td><td><a href="#quatmultiply"><code>quat.multiply</code></a></td><td><a href="#quatrotatex"><code>quat.rotateX</code></a></td>
</tr><tr>
<td><a href="#quatrotatey"><code>quat.rotateY</code></a></td><td><a href="#quatrotatez"><code>quat.rotateZ</code></a></td><td><a href="#quatcalculatew"><code>quat.calculateW</code></a></td>
</tr><tr>
<td><a href="#quatexp"><code>quat.exp</code></a></td><td><a href="#quatln"><code>quat.ln</code></a></td><td><a href="#quatpow"><code>quat.pow</code></a></td>
</tr><tr>
<td><a href="#quatslerp"><code>quat.slerp</code></a></td><td><a href="#quatinvert"><code>quat.invert</code></a></td><td><a href="#quatconjugate"><code>quat.conjugate</code></a></td>
</tr><tr>
<td><a href="#quatfrommat3"><code>quat.fromMat3</code></a></td><td><a href="#quatfrommat4"><code>quat.fromMat4</code></a></td><td><a href="#quatfromeuler"><code>quat.fromEuler</code></a></td>
</tr><tr>
<td><a href="#quatfromdegrees"><code>quat.fromDegrees</code></a></td><td><a href="#quatstr"><code>quat.str</code></a></td><td><a href="#quatclone"><code>quat.clone</code></a></td>
</tr><tr>
<td><a href="#quatfromvalues"><code>quat.fromValues</code></a></td><td><a href="#quatcopy"><code>quat.copy</code></a></td><td><a href="#quatset"><code>quat.set</code></a></td>
</tr><tr>
<td><a href="#quatadd"><code>quat.add</code></a></td><td><a href="#quatscale"><code>quat.scale</code></a></td><td><a href="#quatdot"><code>quat.dot</code></a></td>
</tr><tr>
<td><a href="#quatlerp"><code>quat.lerp</code></a></td><td><a href="#quatlength"><code>quat.length</code></a></td><td><a href="#quatlen"><code>quat.len</code></a></td>
</tr><tr>
<td><a href="#quatsquaredlength"><code>quat.squaredLength</code></a></td><td><a href="#quatsqrlen"><code>quat.sqrLen</code></a></td><td><a href="#quatmul"><code>quat.mul</code></a></td>
</tr><tr>
<td><a href="#quatnormalize"><code>quat.normalize</code></a></td><td><a href="#quatexactequals"><code>quat.exactEquals</code></a></td><td><a href="#quatequals"><code>quat.equals</code></a></td>
</tr><tr>
<td><a href="#quatrotationto"><code>quat.rotationTo</code></a></td><td><a href="#quatsqlerp"><code>quat.sqlerp</code></a></td><td><a href="#quatsetaxes"><code>quat.setAxes</code></a></td>
</tr></table>

**quat2**

<table><tr>
<td><a href="#quat2create"><code>quat2.create</code></a></td><td><a href="#quat2clone"><code>quat2.clone</code></a></td>
</tr><tr>
<td><a href="#quat2fromvalues"><code>quat2.fromValues</code></a></td><td><a href="#quat2fromrotationtranslationvalues"><code>quat2.fromRotationTranslationValues</code></a></td>
</tr><tr>
<td><a href="#quat2fromrotationtranslation"><code>quat2.fromRotationTranslation</code></a></td><td><a href="#quat2fromtranslation"><code>quat2.fromTranslation</code></a></td>
</tr><tr>
<td><a href="#quat2fromrotation"><code>quat2.fromRotation</code></a></td><td><a href="#quat2frommat4"><code>quat2.fromMat4</code></a></td>
</tr><tr>
<td><a href="#quat2copy"><code>quat2.copy</code></a></td><td><a href="#quat2identity"><code>quat2.identity</code></a></td>
</tr><tr>
<td><a href="#quat2set"><code>quat2.set</code></a></td><td><a href="#quat2getreal"><code>quat2.getReal</code></a></td>
</tr><tr>
<td><a href="#quat2getdual"><code>quat2.getDual</code></a></td><td><a href="#quat2setreal"><code>quat2.setReal</code></a></td>
</tr><tr>
<td><a href="#quat2setdual"><code>quat2.setDual</code></a></td><td><a href="#quat2gettranslation"><code>quat2.getTranslation</code></a></td>
</tr><tr>
<td><a href="#quat2translate"><code>quat2.translate</code></a></td><td><a href="#quat2rotatex"><code>quat2.rotateX</code></a></td>
</tr><tr>
<td><a href="#quat2rotatey"><code>quat2.rotateY</code></a></td><td><a href="#quat2rotatez"><code>quat2.rotateZ</code></a></td>
</tr><tr>
<td><a href="#quat2rotatebyquatappend"><code>quat2.rotateByQuatAppend</code></a></td><td><a href="#quat2rotatebyquatprepend"><code>quat2.rotateByQuatPrepend</code></a></td>
</tr><tr>
<td><a href="#quat2rotatearoundaxis"><code>quat2.rotateAroundAxis</code></a></td><td><a href="#quat2add"><code>quat2.add</code></a></td>
</tr><tr>
<td><a href="#quat2multiply"><code>quat2.multiply</code></a></td><td><a href="#quat2mul"><code>quat2.mul</code></a></td>
</tr><tr>
<td><a href="#quat2scale"><code>quat2.scale</code></a></td><td><a href="#quat2dot"><code>quat2.dot</code></a></td>
</tr><tr>
<td><a href="#quat2lerp"><code>quat2.lerp</code></a></td><td><a href="#quat2invert"><code>quat2.invert</code></a></td>
</tr><tr>
<td><a href="#quat2conjugate"><code>quat2.conjugate</code></a></td><td><a href="#quat2length"><code>quat2.length</code></a></td>
</tr><tr>
<td><a href="#quat2len"><code>quat2.len</code></a></td><td><a href="#quat2squaredlength"><code>quat2.squaredLength</code></a></td>
</tr><tr>
<td><a href="#quat2sqrlen"><code>quat2.sqrLen</code></a></td><td><a href="#quat2normalize"><code>quat2.normalize</code></a></td>
</tr><tr>
<td><a href="#quat2str"><code>quat2.str</code></a></td><td><a href="#quat2exactequals"><code>quat2.exactEquals</code></a></td>
</tr><tr>
<td><a href="#quat2equals"><code>quat2.equals</code></a></td><td></td>
</tr></table>

**mat2**

<table><tr>
<td><a href="#mat2create"><code>mat2.create</code></a></td><td><a href="#mat2clone"><code>mat2.clone</code></a></td>
</tr><tr>
<td><a href="#mat2copy"><code>mat2.copy</code></a></td><td><a href="#mat2identity"><code>mat2.identity</code></a></td>
</tr><tr>
<td><a href="#mat2fromvalues"><code>mat2.fromValues</code></a></td><td><a href="#mat2set"><code>mat2.set</code></a></td>
</tr><tr>
<td><a href="#mat2transpose"><code>mat2.transpose</code></a></td><td><a href="#mat2invert"><code>mat2.invert</code></a></td>
</tr><tr>
<td><a href="#mat2adjoint"><code>mat2.adjoint</code></a></td><td><a href="#mat2determinant"><code>mat2.determinant</code></a></td>
</tr><tr>
<td><a href="#mat2multiply"><code>mat2.multiply</code></a></td><td><a href="#mat2rotate"><code>mat2.rotate</code></a></td>
</tr><tr>
<td><a href="#mat2scale"><code>mat2.scale</code></a></td><td><a href="#mat2fromrotation"><code>mat2.fromRotation</code></a></td>
</tr><tr>
<td><a href="#mat2fromscaling"><code>mat2.fromScaling</code></a></td><td><a href="#mat2str"><code>mat2.str</code></a></td>
</tr><tr>
<td><a href="#mat2frob"><code>mat2.frob</code></a></td><td><a href="#mat2ldu"><code>mat2.LDU</code></a></td>
</tr><tr>
<td><a href="#mat2add"><code>mat2.add</code></a></td><td><a href="#mat2subtract"><code>mat2.subtract</code></a></td>
</tr><tr>
<td><a href="#mat2exactequals"><code>mat2.exactEquals</code></a></td><td><a href="#mat2equals"><code>mat2.equals</code></a></td>
</tr><tr>
<td><a href="#mat2multiplyscalar"><code>mat2.multiplyScalar</code></a></td><td><a href="#mat2multiplyscalarandadd"><code>mat2.multiplyScalarAndAdd</code></a></td>
</tr><tr>
<td><a href="#mat2mul"><code>mat2.mul</code></a></td><td><a href="#mat2sub"><code>mat2.sub</code></a></td>
</tr></table>

**mat2d**

<table><tr>
<td><a href="#mat2dcreate"><code>mat2d.create</code></a></td><td><a href="#mat2dclone"><code>mat2d.clone</code></a></td>
</tr><tr>
<td><a href="#mat2dcopy"><code>mat2d.copy</code></a></td><td><a href="#mat2didentity"><code>mat2d.identity</code></a></td>
</tr><tr>
<td><a href="#mat2dfromvalues"><code>mat2d.fromValues</code></a></td><td><a href="#mat2dset"><code>mat2d.set</code></a></td>
</tr><tr>
<td><a href="#mat2dinvert"><code>mat2d.invert</code></a></td><td><a href="#mat2ddeterminant"><code>mat2d.determinant</code></a></td>
</tr><tr>
<td><a href="#mat2dmultiply"><code>mat2d.multiply</code></a></td><td><a href="#mat2drotate"><code>mat2d.rotate</code></a></td>
</tr><tr>
<td><a href="#mat2dscale"><code>mat2d.scale</code></a></td><td><a href="#mat2dtranslate"><code>mat2d.translate</code></a></td>
</tr><tr>
<td><a href="#mat2dfromrotation"><code>mat2d.fromRotation</code></a></td><td><a href="#mat2dfromscaling"><code>mat2d.fromScaling</code></a></td>
</tr><tr>
<td><a href="#mat2dfromtranslation"><code>mat2d.fromTranslation</code></a></td><td><a href="#mat2dstr"><code>mat2d.str</code></a></td>
</tr><tr>
<td><a href="#mat2dfrob"><code>mat2d.frob</code></a></td><td><a href="#mat2dadd"><code>mat2d.add</code></a></td>
</tr><tr>
<td><a href="#mat2dsubtract"><code>mat2d.subtract</code></a></td><td><a href="#mat2dmultiplyscalar"><code>mat2d.multiplyScalar</code></a></td>
</tr><tr>
<td><a href="#mat2dmultiplyscalarandadd"><code>mat2d.multiplyScalarAndAdd</code></a></td><td><a href="#mat2dexactequals"><code>mat2d.exactEquals</code></a></td>
</tr><tr>
<td><a href="#mat2dequals"><code>mat2d.equals</code></a></td><td><a href="#mat2dmul"><code>mat2d.mul</code></a></td>
</tr><tr>
<td><a href="#mat2dsub"><code>mat2d.sub</code></a></td><td></td>
</tr></table>

**mat3**

<table><tr>
<td><a href="#mat3create"><code>mat3.create</code></a></td><td><a href="#mat3frommat4"><code>mat3.fromMat4</code></a></td>
</tr><tr>
<td><a href="#mat3clone"><code>mat3.clone</code></a></td><td><a href="#mat3copy"><code>mat3.copy</code></a></td>
</tr><tr>
<td><a href="#mat3fromvalues"><code>mat3.fromValues</code></a></td><td><a href="#mat3set"><code>mat3.set</code></a></td>
</tr><tr>
<td><a href="#mat3identity"><code>mat3.identity</code></a></td><td><a href="#mat3zero"><code>mat3.zero</code></a></td>
</tr><tr>
<td><a href="#mat3transpose"><code>mat3.transpose</code></a></td><td><a href="#mat3invert"><code>mat3.invert</code></a></td>
</tr><tr>
<td><a href="#mat3adjoint"><code>mat3.adjoint</code></a></td><td><a href="#mat3determinant"><code>mat3.determinant</code></a></td>
</tr><tr>
<td><a href="#mat3multiply"><code>mat3.multiply</code></a></td><td><a href="#mat3translate"><code>mat3.translate</code></a></td>
</tr><tr>
<td><a href="#mat3rotate"><code>mat3.rotate</code></a></td><td><a href="#mat3scale"><code>mat3.scale</code></a></td>
</tr><tr>
<td><a href="#mat3fromtranslation"><code>mat3.fromTranslation</code></a></td><td><a href="#mat3fromrotation"><code>mat3.fromRotation</code></a></td>
</tr><tr>
<td><a href="#mat3fromscaling"><code>mat3.fromScaling</code></a></td><td><a href="#mat3frommat2d"><code>mat3.fromMat2d</code></a></td>
</tr><tr>
<td><a href="#mat3fromquat"><code>mat3.fromQuat</code></a></td><td><a href="#mat3normalfrommat4"><code>mat3.normalFromMat4</code></a></td>
</tr><tr>
<td><a href="#mat3projection"><code>mat3.projection</code></a></td><td><a href="#mat3str"><code>mat3.str</code></a></td>
</tr><tr>
<td><a href="#mat3frob"><code>mat3.frob</code></a></td><td><a href="#mat3add"><code>mat3.add</code></a></td>
</tr><tr>
<td><a href="#mat3subtract"><code>mat3.subtract</code></a></td><td><a href="#mat3multiplyscalar"><code>mat3.multiplyScalar</code></a></td>
</tr><tr>
<td><a href="#mat3multiplyscalarandadd"><code>mat3.multiplyScalarAndAdd</code></a></td><td><a href="#mat3exactequals"><code>mat3.exactEquals</code></a></td>
</tr><tr>
<td><a href="#mat3equals"><code>mat3.equals</code></a></td><td><a href="#mat3mul"><code>mat3.mul</code></a></td>
</tr><tr>
<td><a href="#mat3sub"><code>mat3.sub</code></a></td><td></td>
</tr></table>

**mat4**

<table><tr>
<td><a href="#mat4create"><code>mat4.create</code></a></td><td><a href="#mat4clone"><code>mat4.clone</code></a></td>
</tr><tr>
<td><a href="#mat4copy"><code>mat4.copy</code></a></td><td><a href="#mat4fromvalues"><code>mat4.fromValues</code></a></td>
</tr><tr>
<td><a href="#mat4set"><code>mat4.set</code></a></td><td><a href="#mat4identity"><code>mat4.identity</code></a></td>
</tr><tr>
<td><a href="#mat4zero"><code>mat4.zero</code></a></td><td><a href="#mat4transpose"><code>mat4.transpose</code></a></td>
</tr><tr>
<td><a href="#mat4invert"><code>mat4.invert</code></a></td><td><a href="#mat4invert3x3"><code>mat4.invert3x3</code></a></td>
</tr><tr>
<td><a href="#mat4adjoint"><code>mat4.adjoint</code></a></td><td><a href="#mat4determinant"><code>mat4.determinant</code></a></td>
</tr><tr>
<td><a href="#mat4multiply"><code>mat4.multiply</code></a></td><td><a href="#mat4multiply3x3"><code>mat4.multiply3x3</code></a></td>
</tr><tr>
<td><a href="#mat4multiply3x3righttransposed"><code>mat4.multiply3x3RightTransposed</code></a></td><td><a href="#mat4multiply3x3transposedvec"><code>mat4.multiply3x3TransposedVec</code></a></td>
</tr><tr>
<td><a href="#mat4multiply3x3vec"><code>mat4.multiply3x3Vec</code></a></td><td><a href="#mat4crossproductmatrix"><code>mat4.crossProductMatrix</code></a></td>
</tr><tr>
<td><a href="#mat4translate"><code>mat4.translate</code></a></td><td><a href="#mat4scale"><code>mat4.scale</code></a></td>
</tr><tr>
<td><a href="#mat4rotate"><code>mat4.rotate</code></a></td><td><a href="#mat4rotatex"><code>mat4.rotateX</code></a></td>
</tr><tr>
<td><a href="#mat4rotatey"><code>mat4.rotateY</code></a></td><td><a href="#mat4rotatez"><code>mat4.rotateZ</code></a></td>
</tr><tr>
<td><a href="#mat4fromtranslation"><code>mat4.fromTranslation</code></a></td><td><a href="#mat4fromscaling"><code>mat4.fromScaling</code></a></td>
</tr><tr>
<td><a href="#mat4fromrotation"><code>mat4.fromRotation</code></a></td><td><a href="#mat4fromxrotation"><code>mat4.fromXRotation</code></a></td>
</tr><tr>
<td><a href="#mat4fromyrotation"><code>mat4.fromYRotation</code></a></td><td><a href="#mat4fromzrotation"><code>mat4.fromZRotation</code></a></td>
</tr><tr>
<td><a href="#mat4fromrotationtranslation"><code>mat4.fromRotationTranslation</code></a></td><td><a href="#mat4fromquat2"><code>mat4.fromQuat2</code></a></td>
</tr><tr>
<td><a href="#mat4gettranslation"><code>mat4.getTranslation</code></a></td><td><a href="#mat4getscaling"><code>mat4.getScaling</code></a></td>
</tr><tr>
<td><a href="#mat4getrotation"><code>mat4.getRotation</code></a></td><td><a href="#mat4decompose"><code>mat4.decompose</code></a></td>
</tr><tr>
<td><a href="#mat4fromrotationtranslationscale"><code>mat4.fromRotationTranslationScale</code></a></td><td><a href="#mat4fromrotationtranslationscaleorigin"><code>mat4.fromRotationTranslationScaleOrigin</code></a></td>
</tr><tr>
<td><a href="#mat4fromquat"><code>mat4.fromQuat</code></a></td><td><a href="#mat4frustumno"><code>mat4.frustumNO</code></a></td>
</tr><tr>
<td><a href="#mat4frustumzo"><code>mat4.frustumZO</code></a></td><td><a href="#mat4perspectiveno"><code>mat4.perspectiveNO</code></a></td>
</tr><tr>
<td><a href="#mat4perspectivezo"><code>mat4.perspectiveZO</code></a></td><td><a href="#mat4perspectivefromfieldofviewno"><code>mat4.perspectiveFromFieldOfViewNO</code></a></td>
</tr><tr>
<td><a href="#mat4perspectivefromfieldofviewzo"><code>mat4.perspectiveFromFieldOfViewZO</code></a></td><td><a href="#mat4orthono"><code>mat4.orthoNO</code></a></td>
</tr><tr>
<td><a href="#mat4orthozo"><code>mat4.orthoZO</code></a></td><td><a href="#mat4lookat"><code>mat4.lookAt</code></a></td>
</tr><tr>
<td><a href="#mat4targetto"><code>mat4.targetTo</code></a></td><td><a href="#mat4str"><code>mat4.str</code></a></td>
</tr><tr>
<td><a href="#mat4frob"><code>mat4.frob</code></a></td><td><a href="#mat4add"><code>mat4.add</code></a></td>
</tr><tr>
<td><a href="#mat4subtract"><code>mat4.subtract</code></a></td><td><a href="#mat4multiplyscalar"><code>mat4.multiplyScalar</code></a></td>
</tr><tr>
<td><a href="#mat4multiplyscalarandadd"><code>mat4.multiplyScalarAndAdd</code></a></td><td><a href="#mat4exactequals"><code>mat4.exactEquals</code></a></td>
</tr><tr>
<td><a href="#mat4equals"><code>mat4.equals</code></a></td><td><a href="#mat4mul"><code>mat4.mul</code></a></td>
</tr><tr>
<td><a href="#mat4sub"><code>mat4.sub</code></a></td><td></td>
</tr></table>

**spherical**

<table><tr>
<td><a href="#sphericalcreate"><code>spherical.create</code></a></td><td><a href="#sphericalfromvalues"><code>spherical.fromValues</code></a></td><td><a href="#sphericalclone"><code>spherical.clone</code></a></td>
</tr><tr>
<td><a href="#sphericalcopy"><code>spherical.copy</code></a></td><td><a href="#sphericalset"><code>spherical.set</code></a></td><td><a href="#sphericalnormalize"><code>spherical.normalize</code></a></td>
</tr><tr>
<td><a href="#sphericalscale"><code>spherical.scale</code></a></td><td><a href="#sphericallerp"><code>spherical.lerp</code></a></td><td><a href="#sphericalsetfromvec3"><code>spherical.setFromVec3</code></a></td>
</tr><tr>
<td><a href="#sphericalfromvec3"><code>spherical.fromVec3</code></a></td><td><a href="#sphericalmakesafe"><code>spherical.makeSafe</code></a></td><td><a href="#sphericaltovec3"><code>spherical.toVec3</code></a></td>
</tr><tr>
<td><a href="#sphericalfromvec2"><code>spherical.fromVec2</code></a></td><td><a href="#sphericaltovec2"><code>spherical.toVec2</code></a></td><td><a href="#sphericalequals"><code>spherical.equals</code></a></td>
</tr><tr>
<td><a href="#sphericalexactequals"><code>spherical.exactEquals</code></a></td><td><a href="#sphericalstr"><code>spherical.str</code></a></td><td><a href="#sphericalangleto"><code>spherical.angleTo</code></a></td>
</tr></table>

**polar**

<table><tr>
<td><a href="#polarcreate"><code>polar.create</code></a></td><td><a href="#polarfromvalues"><code>polar.fromValues</code></a></td><td><a href="#polarclone"><code>polar.clone</code></a></td>
</tr><tr>
<td><a href="#polarcopy"><code>polar.copy</code></a></td><td><a href="#polarset"><code>polar.set</code></a></td><td><a href="#polarnormalize"><code>polar.normalize</code></a></td>
</tr><tr>
<td><a href="#polarscale"><code>polar.scale</code></a></td><td><a href="#polarrotate"><code>polar.rotate</code></a></td><td><a href="#polarlerp"><code>polar.lerp</code></a></td>
</tr><tr>
<td><a href="#polarsetfromvec2"><code>polar.setFromVec2</code></a></td><td><a href="#polarfromvec2"><code>polar.fromVec2</code></a></td><td><a href="#polartovec2"><code>polar.toVec2</code></a></td>
</tr><tr>
<td><a href="#polarangleto"><code>polar.angleTo</code></a></td><td><a href="#polardistance"><code>polar.distance</code></a></td><td><a href="#polarequals"><code>polar.equals</code></a></td>
</tr><tr>
<td><a href="#polarexactequals"><code>polar.exactEquals</code></a></td><td><a href="#polarstr"><code>polar.str</code></a></td><td></td>
</tr></table>

**`math/shapes`**

<table><tr>
<td><a href="#box2"><code>Box2</code></a></td><td><a href="#box3"><code>Box3</code></a></td><td><a href="#obb3"><code>OBB3</code></a></td><td><a href="#plane3"><code>Plane3</code></a></td>
</tr><tr>
<td><a href="#sphere"><code>Sphere</code></a></td><td><a href="#circle"><code>Circle</code></a></td><td></td><td></td>
</tr></table>

**box2**

<table><tr>
<td><a href="#box2create"><code>box2.create</code></a></td><td><a href="#box2clone"><code>box2.clone</code></a></td>
</tr><tr>
<td><a href="#box2copy"><code>box2.copy</code></a></td><td><a href="#box2set"><code>box2.set</code></a></td>
</tr><tr>
<td><a href="#box2setfromvectors"><code>box2.setFromVectors</code></a></td><td><a href="#box2min"><code>box2.min</code></a></td>
</tr><tr>
<td><a href="#box2max"><code>box2.max</code></a></td><td><a href="#box2empty"><code>box2.empty</code></a></td>
</tr><tr>
<td><a href="#box2exactequals"><code>box2.exactEquals</code></a></td><td><a href="#box2equals"><code>box2.equals</code></a></td>
</tr><tr>
<td><a href="#box2setfromcenterandsize"><code>box2.setFromCenterAndSize</code></a></td><td><a href="#box2expandbypoint"><code>box2.expandByPoint</code></a></td>
</tr><tr>
<td><a href="#box2expandbyextents"><code>box2.expandByExtents</code></a></td><td><a href="#box2expandbymargin"><code>box2.expandByMargin</code></a></td>
</tr><tr>
<td><a href="#box2union"><code>box2.union</code></a></td><td><a href="#box2center"><code>box2.center</code></a></td>
</tr><tr>
<td><a href="#box2extents"><code>box2.extents</code></a></td><td><a href="#box2size"><code>box2.size</code></a></td>
</tr><tr>
<td><a href="#box2area"><code>box2.area</code></a></td><td><a href="#box2scale"><code>box2.scale</code></a></td>
</tr><tr>
<td><a href="#box2containspoint"><code>box2.containsPoint</code></a></td><td><a href="#box2containsbox2"><code>box2.containsBox2</code></a></td>
</tr><tr>
<td><a href="#box2intersectsbox2"><code>box2.intersectsBox2</code></a></td><td><a href="#box2intersectscircle"><code>box2.intersectsCircle</code></a></td>
</tr></table>

**box3**

<table><tr>
<td><a href="#box3create"><code>box3.create</code></a></td><td><a href="#box3clone"><code>box3.clone</code></a></td>
</tr><tr>
<td><a href="#box3copy"><code>box3.copy</code></a></td><td><a href="#box3set"><code>box3.set</code></a></td>
</tr><tr>
<td><a href="#box3setfromvectors"><code>box3.setFromVectors</code></a></td><td><a href="#box3min"><code>box3.min</code></a></td>
</tr><tr>
<td><a href="#box3max"><code>box3.max</code></a></td><td><a href="#box3empty"><code>box3.empty</code></a></td>
</tr><tr>
<td><a href="#box3exactequals"><code>box3.exactEquals</code></a></td><td><a href="#box3equals"><code>box3.equals</code></a></td>
</tr><tr>
<td><a href="#box3setfromcenterandsize"><code>box3.setFromCenterAndSize</code></a></td><td><a href="#box3expandbypoint"><code>box3.expandByPoint</code></a></td>
</tr><tr>
<td><a href="#box3expandbyextents"><code>box3.expandByExtents</code></a></td><td><a href="#box3expandbymargin"><code>box3.expandByMargin</code></a></td>
</tr><tr>
<td><a href="#box3union"><code>box3.union</code></a></td><td><a href="#box3center"><code>box3.center</code></a></td>
</tr><tr>
<td><a href="#box3extents"><code>box3.extents</code></a></td><td><a href="#box3size"><code>box3.size</code></a></td>
</tr><tr>
<td><a href="#box3surfacearea"><code>box3.surfaceArea</code></a></td><td><a href="#box3scale"><code>box3.scale</code></a></td>
</tr><tr>
<td><a href="#box3transformmat4"><code>box3.transformMat4</code></a></td><td><a href="#box3containspoint"><code>box3.containsPoint</code></a></td>
</tr><tr>
<td><a href="#box3containsbox3"><code>box3.containsBox3</code></a></td><td><a href="#box3intersectsbox3"><code>box3.intersectsBox3</code></a></td>
</tr><tr>
<td><a href="#box3intersectstriangle3"><code>box3.intersectsTriangle3</code></a></td><td><a href="#box3intersectssphere"><code>box3.intersectsSphere</code></a></td>
</tr><tr>
<td><a href="#box3intersectsplane3"><code>box3.intersectsPlane3</code></a></td><td></td>
</tr></table>

**obb3**

<table><tr>
<td><a href="#obb3create"><code>obb3.create</code></a></td><td><a href="#obb3clone"><code>obb3.clone</code></a></td>
</tr><tr>
<td><a href="#obb3copy"><code>obb3.copy</code></a></td><td><a href="#obb3set"><code>obb3.set</code></a></td>
</tr><tr>
<td><a href="#obb3setfromcenterhalfextentsquaternion"><code>obb3.setFromCenterHalfExtentsQuaternion</code></a></td><td><a href="#obb3setfrombox3"><code>obb3.setFromBox3</code></a></td>
</tr><tr>
<td><a href="#obb3containspoint"><code>obb3.containsPoint</code></a></td><td><a href="#obb3clamppoint"><code>obb3.clampPoint</code></a></td>
</tr><tr>
<td><a href="#obb3intersectsobb3"><code>obb3.intersectsOBB3</code></a></td><td><a href="#obb3intersectsbox3"><code>obb3.intersectsBox3</code></a></td>
</tr><tr>
<td><a href="#obb3applymatrix4"><code>obb3.applyMatrix4</code></a></td><td></td>
</tr></table>

**plane3**

<table><tr>
<td><a href="#plane3create"><code>plane3.create</code></a></td><td><a href="#plane3fromnormalandconstant"><code>plane3.fromNormalAndConstant</code></a></td>
</tr><tr>
<td><a href="#plane3fromnormalandpoint"><code>plane3.fromNormalAndPoint</code></a></td><td><a href="#plane3fromcoplanarpoints"><code>plane3.fromCoplanarPoints</code></a></td>
</tr><tr>
<td><a href="#plane3clone"><code>plane3.clone</code></a></td><td><a href="#plane3copy"><code>plane3.copy</code></a></td>
</tr><tr>
<td><a href="#plane3normalize"><code>plane3.normalize</code></a></td><td><a href="#plane3negate"><code>plane3.negate</code></a></td>
</tr><tr>
<td><a href="#plane3offset"><code>plane3.offset</code></a></td><td><a href="#plane3distancetopoint"><code>plane3.distanceToPoint</code></a></td>
</tr><tr>
<td><a href="#plane3projectpoint"><code>plane3.projectPoint</code></a></td><td><a href="#plane3transform"><code>plane3.transform</code></a></td>
</tr><tr>
<td><a href="#plane3intersectssphere"><code>plane3.intersectsSphere</code></a></td><td><a href="#plane3exactequals"><code>plane3.exactEquals</code></a></td>
</tr><tr>
<td><a href="#plane3intersect"><code>plane3.intersect</code></a></td><td><a href="#plane3equals"><code>plane3.equals</code></a></td>
</tr></table>

**sphere**

<table><tr>
<td><a href="#spherecreate"><code>sphere.create</code></a></td><td><a href="#spherecontainspoint"><code>sphere.containsPoint</code></a></td>
</tr></table>

**circle**

<table><tr>
<td><a href="#circlecreate"><code>circle.create</code></a></td>
</tr></table>

**segment2**

<table><tr>
<td><a href="#segment2closestpoint"><code>segment2.closestPoint</code></a></td>
</tr></table>

**triangle3**

<table><tr>
<td><a href="#triangle3bounds"><code>triangle3.bounds</code></a></td><td><a href="#triangle3normal"><code>triangle3.normal</code></a></td><td><a href="#triangle3centroid"><code>triangle3.centroid</code></a></td>
</tr></table>

**raycast3**

<table><tr>
<td><a href="#raycast3intersectstriangleresult"><code>raycast3.IntersectsTriangleResult</code></a></td><td><a href="#raycast3createintersectstriangleresult"><code>raycast3.createIntersectsTriangleResult</code></a></td>
</tr><tr>
<td><a href="#raycast3intersectstriangle"><code>raycast3.intersectsTriangle</code></a></td><td><a href="#raycast3intersectsbox3"><code>raycast3.intersectsBox3</code></a></td>
</tr></table>

**`math/geometry`**

<table><tr>
<td><a href="#circumcircle"><code>circumcircle</code></a></td><td><a href="#quickhull2"><code>quickhull2</code></a></td><td><a href="#quickhull3"><code>quickhull3</code></a></td>
</tr></table>

**`math/time`**

<table><tr>
<td><a href="#spring"><code>Spring</code></a></td>
</tr></table>

**easing**

<table><tr>
<td><a href="#easingexp"><code>easing.exp</code></a></td><td><a href="#easinglinear"><code>easing.linear</code></a></td><td><a href="#easingsinein"><code>easing.sineIn</code></a></td>
</tr><tr>
<td><a href="#easingsineout"><code>easing.sineOut</code></a></td><td><a href="#easingsineinout"><code>easing.sineInOut</code></a></td><td><a href="#easingcubicin"><code>easing.cubicIn</code></a></td>
</tr><tr>
<td><a href="#easingcubicout"><code>easing.cubicOut</code></a></td><td><a href="#easingcubicinout"><code>easing.cubicInOut</code></a></td><td><a href="#easingquintin"><code>easing.quintIn</code></a></td>
</tr><tr>
<td><a href="#easingquintout"><code>easing.quintOut</code></a></td><td><a href="#easingquintinout"><code>easing.quintInOut</code></a></td><td><a href="#easingcircin"><code>easing.circIn</code></a></td>
</tr><tr>
<td><a href="#easingcircout"><code>easing.circOut</code></a></td><td><a href="#easingcircinout"><code>easing.circInOut</code></a></td><td><a href="#easingquartin"><code>easing.quartIn</code></a></td>
</tr><tr>
<td><a href="#easingquartout"><code>easing.quartOut</code></a></td><td><a href="#easingquartinout"><code>easing.quartInOut</code></a></td><td><a href="#easingexpoin"><code>easing.expoIn</code></a></td>
</tr><tr>
<td><a href="#easingexpoout"><code>easing.expoOut</code></a></td><td><a href="#easingexpoinout"><code>easing.expoInOut</code></a></td><td><a href="#easingrsqw"><code>easing.rsqw</code></a></td>
</tr></table>

**spring**

<table><tr>
<td><a href="#springcreate"><code>spring.create</code></a></td><td><a href="#springupdate"><code>spring.update</code></a></td><td><a href="#springdamp"><code>spring.damp</code></a></td>
</tr><tr>
<td><a href="#springdampangle"><code>spring.dampAngle</code></a></td><td><a href="#springfromresponse"><code>spring.fromResponse</code></a></td><td></td>
</tr></table>

**spring2**

<table><tr>
<td><a href="#spring2create"><code>spring2.create</code></a></td><td><a href="#spring2update"><code>spring2.update</code></a></td><td><a href="#spring2damp"><code>spring2.damp</code></a></td>
</tr></table>

**spring3**

<table><tr>
<td><a href="#spring3create"><code>spring3.create</code></a></td><td><a href="#spring3update"><code>spring3.update</code></a></td><td><a href="#spring3damp"><code>spring3.damp</code></a></td>
</tr></table>

**spring4**

<table><tr>
<td><a href="#spring4create"><code>spring4.create</code></a></td><td><a href="#spring4update"><code>spring4.update</code></a></td><td><a href="#spring4damp"><code>spring4.damp</code></a></td>
</tr></table>

**`math/random`**

<table><tr>
<td><a href="#isaac32"><code>Isaac32</code></a></td><td><a href="#isaac64"><code>Isaac64</code></a></td><td><a href="#mulberry32"><code>Mulberry32</code></a></td><td><a href="#randomgenerator"><code>RandomGenerator</code></a></td>
</tr></table>

**isaac32**

<table><tr>
<td><a href="#isaac32create"><code>isaac32.create</code></a></td><td><a href="#isaac32next"><code>isaac32.next</code></a></td><td><a href="#isaac32sample"><code>isaac32.sample</code></a></td><td><a href="#isaac32seed"><code>isaac32.seed</code></a></td>
</tr></table>

**isaac64**

<table><tr>
<td><a href="#isaac64create"><code>isaac64.create</code></a></td><td><a href="#isaac64next"><code>isaac64.next</code></a></td><td><a href="#isaac64sample"><code>isaac64.sample</code></a></td><td><a href="#isaac64seed"><code>isaac64.seed</code></a></td>
</tr></table>

**mulberry32**

<table><tr>
<td><a href="#mulberry32create"><code>mulberry32.create</code></a></td><td><a href="#mulberry32next"><code>mulberry32.next</code></a></td><td><a href="#mulberry32sample"><code>mulberry32.sample</code></a></td>
</tr><tr>
<td><a href="#mulberry32seed"><code>mulberry32.seed</code></a></td><td></td><td></td>
</tr></table>

**random**

<table><tr>
<td><a href="#randomfloat"><code>random.float</code></a></td><td><a href="#randomint"><code>random.int</code></a></td><td><a href="#randombool"><code>random.bool</code></a></td><td><a href="#randomsign"><code>random.sign</code></a></td>
</tr><tr>
<td><a href="#randomchoice"><code>random.choice</code></a></td><td><a href="#randomvec2"><code>random.vec2</code></a></td><td><a href="#randomvec3"><code>random.vec3</code></a></td><td><a href="#randomvec4"><code>random.vec4</code></a></td>
</tr><tr>
<td><a href="#randomquat"><code>random.quat</code></a></td><td></td><td></td><td></td>
</tr></table>

**`math/noise`**

<table><tr>
<td><a href="#fractaloptions"><code>FractalOptions</code></a></td><td><a href="#fbm"><code>fbm</code></a></td><td><a href="#ridged"><code>ridged</code></a></td><td><a href="#billow"><code>billow</code></a></td>
</tr><tr>
<td><a href="#domainwarp2"><code>domainWarp2</code></a></td><td><a href="#domainwarp3"><code>domainWarp3</code></a></td><td><a href="#curl2"><code>curl2</code></a></td><td><a href="#curl3"><code>curl3</code></a></td>
</tr><tr>
<td><a href="#permutation"><code>Permutation</code></a></td><td></td><td></td><td></td>
</tr></table>

**perlin2d**

<table><tr>
<td><a href="#perlin2dperlin2dgenerator"><code>perlin2d.Perlin2DGenerator</code></a></td><td><a href="#perlin2dcreate"><code>perlin2d.create</code></a></td>
</tr><tr>
<td><a href="#perlin2dsample"><code>perlin2d.sample</code></a></td><td></td>
</tr></table>

**perlin3d**

<table><tr>
<td><a href="#perlin3dperlin3dgenerator"><code>perlin3d.Perlin3DGenerator</code></a></td><td><a href="#perlin3dcreate"><code>perlin3d.create</code></a></td>
</tr><tr>
<td><a href="#perlin3dsample"><code>perlin3d.sample</code></a></td><td></td>
</tr></table>

**simplex2d**

<table><tr>
<td><a href="#simplex2dsimplex2dgenerator"><code>simplex2d.Simplex2DGenerator</code></a></td><td><a href="#simplex2dcreate"><code>simplex2d.create</code></a></td>
</tr><tr>
<td><a href="#simplex2dsample"><code>simplex2d.sample</code></a></td><td></td>
</tr></table>

**simplex3d**

<table><tr>
<td><a href="#simplex3dsimplex3dgenerator"><code>simplex3d.Simplex3DGenerator</code></a></td><td><a href="#simplex3dcreate"><code>simplex3d.create</code></a></td>
</tr><tr>
<td><a href="#simplex3dsample"><code>simplex3d.sample</code></a></td><td></td>
</tr></table>

**simplex4d**

<table><tr>
<td><a href="#simplex4dsimplex4dgenerator"><code>simplex4d.Simplex4DGenerator</code></a></td><td><a href="#simplex4dcreate"><code>simplex4d.create</code></a></td>
</tr><tr>
<td><a href="#simplex4dsample"><code>simplex4d.sample</code></a></td><td></td>
</tr></table>

**worley2d**

<table><tr>
<td><a href="#worley2dworley2dgenerator"><code>worley2d.Worley2DGenerator</code></a></td><td><a href="#worley2dcreate"><code>worley2d.create</code></a></td>
</tr><tr>
<td><a href="#worley2dsample"><code>worley2d.sample</code></a></td><td></td>
</tr></table>

**worley3d**

<table><tr>
<td><a href="#worley3dworley3dgenerator"><code>worley3d.Worley3DGenerator</code></a></td><td><a href="#worley3dcreate"><code>worley3d.create</code></a></td>
</tr><tr>
<td><a href="#worley3dsample"><code>worley3d.sample</code></a></td><td></td>
</tr></table>

**`math/color`**

<table><tr>
<td><a href="#color"><code>Color</code></a></td><td><a href="#colorinput"><code>ColorInput</code></a></td><td><a href="#hsl"><code>HSL</code></a></td>
</tr></table>

**color**

<table><tr>
<td><a href="#colorcreate"><code>color.create</code></a></td><td><a href="#colorfromvalues"><code>color.fromValues</code></a></td><td><a href="#colorclone"><code>color.clone</code></a></td>
</tr><tr>
<td><a href="#colorcopy"><code>color.copy</code></a></td><td><a href="#colorset"><code>color.set</code></a></td><td><a href="#colorsetscalar"><code>color.setScalar</code></a></td>
</tr><tr>
<td><a href="#colorsetfromsrgb"><code>color.setFromSRGB</code></a></td><td><a href="#colorfromsrgb"><code>color.fromSRGB</code></a></td><td><a href="#colortosrgb"><code>color.toSRGB</code></a></td>
</tr><tr>
<td><a href="#colortocss"><code>color.toCSS</code></a></td><td><a href="#colortohex"><code>color.toHex</code></a></td><td><a href="#colortohexstring"><code>color.toHexString</code></a></td>
</tr><tr>
<td><a href="#coloradd"><code>color.add</code></a></td><td><a href="#coloraddscalar"><code>color.addScalar</code></a></td><td><a href="#colorsub"><code>color.sub</code></a></td>
</tr><tr>
<td><a href="#colormultiply"><code>color.multiply</code></a></td><td><a href="#colormultiplyscalar"><code>color.multiplyScalar</code></a></td><td><a href="#colorlerp"><code>color.lerp</code></a></td>
</tr><tr>
<td><a href="#colorclamp"><code>color.clamp</code></a></td><td><a href="#colorequals"><code>color.equals</code></a></td><td><a href="#colorluminance"><code>color.luminance</code></a></td>
</tr></table>

**colorspace**

<table><tr>
<td><a href="#colorspacesrgbtolinear"><code>colorspace.srgbToLinear</code></a></td><td><a href="#colorspacelineartosrgb"><code>colorspace.linearToSrgb</code></a></td>
</tr><tr>
<td><a href="#colorspacelinearsrgbtolineardisplayp3"><code>colorspace.linearSrgbToLinearDisplayP3</code></a></td><td><a href="#colorspacelineardisplayp3tolinearsrgb"><code>colorspace.linearDisplayP3ToLinearSrgb</code></a></td>
</tr></table>

**hsl**

<table><tr>
<td><a href="#hslcreate"><code>hsl.create</code></a></td><td><a href="#hslfromvalues"><code>hsl.fromValues</code></a></td><td><a href="#hslclone"><code>hsl.clone</code></a></td><td><a href="#hslcopy"><code>hsl.copy</code></a></td>
</tr><tr>
<td><a href="#hslset"><code>hsl.set</code></a></td><td><a href="#hslfromcolor"><code>hsl.fromColor</code></a></td><td><a href="#hsltocolor"><code>hsl.toColor</code></a></td><td><a href="#hsllerp"><code>hsl.lerp</code></a></td>
</tr><tr>
<td><a href="#hsloffset"><code>hsl.offset</code></a></td><td></td><td></td><td></td>
</tr></table>


---

## Reference

### `math`

#### `EPSILON`

```ts
export const EPSILON = 0.000001;
```

#### `round`

```ts
/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param a value to round
 */
export function round(a: number): number;
```

#### `degreesToRadians`

```ts
/**
 * Converts Degrees To Radians
 *
 * @param a Angle in Degrees
 */
export function degreesToRadians(degrees: number): number;
```

#### `radiansToDegrees`

```ts
/**
 * Converts Radians To Degrees
 *
 * @param a Angle in Radians
 */
export function radiansToDegrees(radians: number): number;
```

#### `equals`

```ts
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param a The first number to test.
 * @param b The second number to test.
 * @returns True if the numbers are approximately equal, false otherwise.
 */
export function equals(a: number, b: number, epsilon = EPSILON): boolean;
```

#### `fade`

```ts
/**
 * Ease-in-out, goes to -Infinite before 0 and Infinite after 1
 *
 * https://www.desmos.com/calculator/vsnmlaljdu
 *
 * @param t
 * @returns
 */
export function fade(t: number);
```

#### `lerp`

```ts
/**
 *
 * Returns the result of linearly interpolating between input A and input B by input T.
 *
 * @param v0
 * @param v1
 * @param t
 * @returns
 */
export function lerp(v0: number, v1: number, t: number);
```

#### `clamp`

```ts
/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number;
```

#### `repeat`

```ts
/**
 * Loops `t` so that it is never larger than `length` and never smaller than 0.
 */
export function repeat(t: number, length: number): number;
```

#### `deltaAngle`

```ts
/**
 * Calculates the shortest signed difference between two angles (in radians).
 */
export function deltaAngle(current: number, target: number): number;
```

#### `remap`

```ts
/**
 * Remaps a number from one range to another.
 */
export function remap(number: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
```

#### `remapClamp`

```ts
/**
 * Remaps a number from one range to another, clamping the result to the output range.
 */
export function remapClamp(value: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
```

#### `MutableArrayLike`

```ts
export type MutableArrayLike<T> = {
    [index: number]: T;
    length: number;
};
```

#### `Vec2`

```ts
/** A 2D vector */
export type Vec2 = [
    x: number,
    y: number
];
```

#### `Vec3`

```ts
/** A 3D vector */
export type Vec3 = [
    x: number,
    y: number,
    z: number
];
```

#### `Vec4`

```ts
/** A 4D vector */
export type Vec4 = [
    x: number,
    y: number,
    z: number,
    w: number
];
```

#### `Euler`

```ts
/** A Euler in 3D space, with an optional order (default is 'xyz') */
export type Euler = [
    x: number,
    y: number,
    z: number,
    order?: EulerOrder
];
```

#### `EulerOrder`

```ts
/** Euler orders */
export type EulerOrder = 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx';
```

#### `Quat`

```ts
/** A quaternion that represents rotation */
export type Quat = [
    x: number,
    y: number,
    z: number,
    w: number
];
```

#### `Quat2`

```ts
/** A dual quaternion that represents both rotation and translation */
export type Quat2 = [
    x: number,
    y: number,
    z: number,
    w: number,
    x2: number,
    y2: number,
    z2: number,
    w2: number
];
```

#### `Mat2`

```ts
/** A 2x2 matrix */
export type Mat2 = [
    e1: number,
    e2: number,
    e3: number,
    e4: number
];
```

#### `Mat2d`

```ts
/** A 2D affine transform matrix */
export type Mat2d = [
    e1: number,
    e2: number,
    e3: number,
    e4: number,
    e5: number,
    e6: number
];
```

#### `Mat3`

```ts
/** A 3x3 matrix */
export type Mat3 = [
    e1: number,
    e2: number,
    e3: number,
    e4: number,
    e5: number,
    e6: number,
    e7: number,
    e8: number,
    e9: number
];
```

#### `Mat4`

```ts
/** A 4x4 matrix */
export type Mat4 = [
    e1: number,
    e2: number,
    e3: number,
    e4: number,
    e5: number,
    e6: number,
    e7: number,
    e8: number,
    e9: number,
    e10: number,
    e11: number,
    e12: number,
    e13: number,
    e14: number,
    e15: number,
    e16: number
];
```

#### `Spherical`

```ts
/**
 * A point in spherical coordinates [r, theta, phi] (Three.js / OpenGL convention)
 *  r     - radial distance from the origin
 *  theta - azimuthal angle in the XZ plane from the +Z axis (radians, range [-π, π])
 *  phi   - polar angle from the +Y axis (radians, range [0, π])
 */
export type Spherical = [
    r: number,
    theta: number,
    phi: number
];
```

#### `Polar`

```ts
/**
 * A point in polar coordinates [r, theta]
 *   r     - radial distance from the origin (>= 0)
 *   theta - angle from the +X axis, counter-clockwise (radians, range (-pi, pi])
 *
 * This is the standard 2D convention: Vec2 is (x, y) and theta = atan2(y, x).
 * It is deliberately NOT the ground-plane slice of [[spherical]] (which is
 * Y-up, with an XZ ground plane and azimuth measured from +Z); for that
 * horizontal projection use spherical.fromVec2 / spherical.toVec2 instead.
 */
export type Polar = [
    r: number,
    theta: number
];
```

**vec2**

#### `vec2.create`

```ts
/**
 * Creates a new, empty vec2
 *
 * @returns a new 2D vector
 */
export function create(): Vec2;
```

#### `vec2.clone`

```ts
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param a vector to clone
 * @returns a new 2D vector
 */
export function clone(a: Vec2): Vec2;
```

#### `vec2.fromValues`

```ts
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param x X component
 * @param y Y component
 * @returns a new 2D vector
 */
export function fromValues(x: number, y: number): Vec2;
```

#### `vec2.copy`

```ts
/**
 * Copy the values from one vec2 to another
 *
 * @param out the receiving vector
 * @param a the source vector
 * @returns out
 */
export function copy(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.set`

```ts
/**
 * Set the components of a vec2 to the given values
 *
 * @param out the receiving vector
 * @param x X component
 * @param y Y component
 * @returns out
 */
export function set(out: Vec2, x: number, y: number): Vec2;
```

#### `vec2.fromBuffer`

```ts
/**
 * Sets the components of a vec2 from a buffer
 * @param out the receiving vector
 * @param buffer the source buffer
 * @param startIndex the starting index in the buffer
 * @returns out
 */
export function fromBuffer(out: Vec2, buffer: ArrayLike<number>, startIndex: number): Vec2;
```

#### `vec2.toBuffer`

```ts
/**
 * Writes the components of a vec2 to a buffer
 * @param outBuffer The output buffer
 * @param vec The source vector
 * @param startIndex The starting index in the buffer
 * @returns The output buffer
 */
export function toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec2, startIndex: number): MutableArrayLike<number>;
```

#### `vec2.add`

```ts
/**
 * Adds two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.addScalar`

```ts
/**
 * Adds a scalar value to all components of a vec2
 *
 * @param out the receiving vector
 * @param a the source vector
 * @param b the scalar value to add
 * @returns out
 */
export function addScalar(out: Vec2, a: Vec2, b: number): Vec2;
```

#### `vec2.subtract`

```ts
/**
 * Subtracts vector b from vector a
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.subtractScalar`

```ts
/**
 * Subtracts a scalar value from all components of a vec2
 *
 * @param out the receiving vector
 * @param a the source vector
 * @param b the scalar value to subtract
 * @returns out
 */
export function subtractScalar(out: Vec2, a: Vec2, b: number): Vec2;
```

#### `vec2.multiply`

```ts
/**
 * Multiplies two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.divide`

```ts
/**
 * Divides two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function divide(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.ceil`

```ts
/**
 * Math.ceil the components of a vec2
 *
 * @param out the receiving vector
 * @param a vector to ceil
 * @returns out
 */
export function ceil(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.floor`

```ts
/**
 * Math.floor the components of a vec2
 *
 * @param out the receiving vector
 * @param a vector to floor
 * @returns out
 */
export function floor(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.min`

```ts
/**
 * Returns the minimum of two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function min(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.max`

```ts
/**
 * Returns the maximum of two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function max(out: Vec2, a: Vec2, b: Vec2): Vec2;
```

#### `vec2.round`

```ts
/**
 * symmetric round the components of a vec2
 *
 * @param out the receiving vector
 * @param a vector to round
 * @returns out
 */
export function round(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.scale`

```ts
/**
 * Scales a vec2 by a scalar number
 *
 * @param out the receiving vector
 * @param a the vector to scale
 * @param b amount to scale the vector by
 * @returns out
 */
export function scale(out: Vec2, a: Vec2, b: number): Vec2;
```

#### `vec2.scaleAndAdd`

```ts
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b by before adding
 * @returns out
 */
export function scaleAndAdd(out: Vec2, a: Vec2, b: Vec2, scale: number): Vec2;
```

#### `vec2.distance`

```ts
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns distance between a and b
 */
export function distance(a: Vec2, b: Vec2): number;
```

#### `vec2.squaredDistance`

```ts
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns squared distance between a and b
 */
export function squaredDistance(a: Vec2, b: Vec2): number;
```

#### `vec2.length`

```ts
/**
 * Calculates the length of a vec2
 *
 * @param a vector to calculate length of
 * @returns length of a
 */
export function length(a: Vec2): number;
```

#### `vec2.squaredLength`

```ts
/**
 * Calculates the squared length of a vec2
 *
 * @param a vector to calculate squared length of
 * @returns squared length of a
 */
export function squaredLength(a: Vec2): number;
```

#### `vec2.negate`

```ts
/**
 * Negates the components of a vec2
 *
 * @param out the receiving vector
 * @param a vector to negate
 * @returns out
 */
export function negate(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.inverse`

```ts
/**
 * Returns the inverse of the components of a vec2
 *
 * @param out the receiving vector
 * @param a vector to invert
 * @returns out
 */
export function inverse(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.normalize`

```ts
/**
 * Normalize a vec2
 *
 * @param out the receiving vector
 * @param a vector to normalize
 * @returns out
 */
export function normalize(out: Vec2, a: Vec2): Vec2;
```

#### `vec2.dot`

```ts
/**
 * Calculates the dot product of two vec2's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 */
export function dot(a: Vec2, b: Vec2): number;
```

#### `vec2.cross`

```ts
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function cross(out: Vec3, a: Vec2, b: Vec2): Vec3;
```

#### `vec2.lerp`

```ts
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function lerp(out: Vec2, a: Vec2, b: Vec2, t: number): Vec2;
```

#### `vec2.transformMat2`

```ts
/**
 * Transforms the vec2 with a mat2
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat2(out: Vec2, a: Vec2, m: Mat2): Vec2;
```

#### `vec2.transformMat2d`

```ts
/**
 * Transforms the vec2 with a mat2d
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat2d(out: Vec2, a: Vec2, m: Mat2d): Vec2;
```

#### `vec2.transformMat3`

```ts
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat3(out: Vec2, a: Vec2, m: Mat3): Vec2;
```

#### `vec2.transformMat4`

```ts
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat4(out: Vec2, a: Vec2, m: Mat4): Vec2;
```

#### `vec2.rotate`

```ts
/**
 * Rotate a 2D vector
 * @param out The receiving vec2
 * @param a The vec2 point to rotate
 * @param b The origin of the rotation
 * @param rad The angle of rotation in radians
 * @returns out
 */
export function rotate(out: Vec2, a: Vec2, b: Vec2, rad: number): Vec2;
```

#### `vec2.angle`

```ts
/**
 * Get the angle between two 2D vectors
 * @param a The first operand
 * @param b The second operand
 * @returns The angle in radians
 */
export function angle(a: Vec2, b: Vec2): number;
```

#### `vec2.zero`

```ts
/**
 * Set the components of a vec2 to zero
 *
 * @param out the receiving vector
 * @returns out
 */
export function zero(out: Vec2): Vec2;
```

#### `vec2.str`

```ts
/**
 * Returns a string representation of a vector
 *
 * @param a vector to represent as a string
 * @returns string representation of the vector
 */
export function str(a: Vec2): string;
```

#### `vec2.exactEquals`

```ts
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function exactEquals(a: Vec2, b: Vec2): boolean;
```

#### `vec2.equals`

```ts
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function equals(a: Vec2, b: Vec2): boolean;
```

#### `vec2.finite`

```ts
/**
 * Returns whether or not the vector is finite
 * @param a vector to test
 * @returns whether or not the vector is finite
 */
export function finite(a: Vec2): boolean;
```

#### `vec2.len`

```ts
/**
 * Alias for {@link length}
 */
export const len = length;
```

#### `vec2.sub`

```ts
/**
 * Alias for {@link subtract}
 */
export const sub = subtract;
```

#### `vec2.mul`

```ts
/**
 * Alias for {@link multiply}
 */
export const mul = multiply;
```

#### `vec2.div`

```ts
/**
 * Alias for {@link divide}
 */
export const div = divide;
```

#### `vec2.dist`

```ts
/**
 * Alias for {@link distance}
 */
export const dist = distance;
```

#### `vec2.sqrDist`

```ts
/**
 * Alias for {@link squaredDistance}
 */
export const sqrDist = squaredDistance;
```

#### `vec2.sqrLen`

```ts
/**
 * Alias for {@link squaredLength}
 */
export const sqrLen = squaredLength;
```

**vec3**

#### `vec3.create`

```ts
/**
 * Creates a new, empty vec3
 *
 * @returns a new 3D vector
 */
export function create(): Vec3;
```

#### `vec3.clone`

```ts
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param a vector to clone
 * @returns a new 3D vector
 */
export function clone(a: Vec3): Vec3;
```

#### `vec3.fromValues`

```ts
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @returns a new 3D vector
 */
export function fromValues(x: number, y: number, z: number): Vec3;
```

#### `vec3.length`

```ts
/**
 * Calculates the length of a vec3
 *
 * @param a vector to calculate length of
 * @returns length of a
 */
export function length(a: Vec3): number;
```

#### `vec3.copy`

```ts
/**
 * Copy the values from one vec3 to another
 *
 * @param out the receiving vector
 * @param a the source vector
 * @returns out
 */
export function copy(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.set`

```ts
/**
 * Set the components of a vec3 to the given values
 *
 * @param out the receiving vector
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @returns out
 */
export function set(out: Vec3, x: number, y: number, z: number): Vec3;
```

#### `vec3.setScalar`

```ts
/**
 * Sets all components of a vec3 to the given scalar value
 *
 * @param out the receiving vector
 * @param s scalar value to set
 * @returns out
 */
export function setScalar(out: Vec3, s: number): Vec3;
```

#### `vec3.fromBuffer`

```ts
/**
 * Sets the components of a vec3 from a buffer
 * @param out the receiving vector
 * @param buffer the source buffer
 * @param startIndex the starting index in the buffer
 * @returns out
 */
export function fromBuffer(out: Vec3, buffer: ArrayLike<number>, startIndex: number): Vec3;
```

#### `vec3.toBuffer`

```ts
/**
 * Writes the components of a vec3 to a buffer
 * @param outBuffer The output buffer
 * @param vec The source vector
 * @param startIndex The starting index in the buffer
 * @returns The output buffer
 */
export function toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec3, startIndex: number): MutableArrayLike<number>;
```

#### `vec3.add`

```ts
/**
 * Adds two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.addScalar`

```ts
/**
 * Adds a scalar value to all components of a vec3
 *
 * @param out the receiving vector
 * @param a the source vector
 * @param b the scalar value to add
 * @returns out
 */
export function addScalar(out: Vec3, a: Vec3, b: number): Vec3;
```

#### `vec3.subtract`

```ts
/**
 * Subtracts vector b from vector a
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.subtractScalar`

```ts
/**
 * Subtracts a scalar value from all components of a vec3
 *
 * @param out the receiving vector
 * @param a the source vector
 * @param b the scalar value to subtract
 * @returns out
 */
export function subtractScalar(out: Vec3, a: Vec3, b: number): Vec3;
```

#### `vec3.multiply`

```ts
/**
 * Multiplies two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.divide`

```ts
/**
 * Divides two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function divide(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.ceil`

```ts
/**
 * Math.ceil the components of a vec3
 *
 * @param out the receiving vector
 * @param a vector to ceil
 * @returns out
 */
export function ceil(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.floor`

```ts
/**
 * Math.floor the components of a vec3
 *
 * @param out the receiving vector
 * @param a vector to floor
 * @returns out
 */
export function floor(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.min`

```ts
/**
 * Returns the minimum of two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function min(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.max`

```ts
/**
 * Returns the maximum of two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function max(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.round`

```ts
/**
 * symmetric round the components of a vec3
 *
 * @param out the receiving vector
 * @param a vector to round
 * @returns out
 */
export function round(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.scale`

```ts
/**
 * Scales a vec3 by a scalar number
 *
 * @param out the receiving vector
 * @param a the vector to scale
 * @param b amount to scale the vector by
 * @returns out
 */
export function scale(out: Vec3, a: Vec3, b: number): Vec3;
```

#### `vec3.scaleAndAdd`

```ts
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b by before adding
 * @returns out
 */
export function scaleAndAdd(out: Vec3, a: Vec3, b: Vec3, scale: number): Vec3;
```

#### `vec3.distance`

```ts
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns distance between a and b
 */
export function distance(a: Vec3, b: Vec3): number;
```

#### `vec3.squaredDistance`

```ts
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns squared distance between a and b
 */
export function squaredDistance(a: Vec3, b: Vec3): number;
```

#### `vec3.squaredLength`

```ts
/**
 * Calculates the squared length of a vec3
 *
 * @param a vector to calculate squared length of
 * @returns squared length of a
 */
export function squaredLength(a: Vec3): number;
```

#### `vec3.negate`

```ts
/**
 * Negates the components of a vec3
 *
 * @param out the receiving vector
 * @param a vector to negate
 * @returns out
 */
export function negate(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.inverse`

```ts
/**
 * Returns the inverse of the components of a vec3
 *
 * @param out the receiving vector
 * @param a vector to invert
 * @returns out
 */
export function inverse(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.normalize`

```ts
/**
 * Normalize a vec3
 *
 * @param out the receiving vector
 * @param a vector to normalize
 * @returns out
 */
export function normalize(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.dot`

```ts
/**
 * Calculates the dot product of two vec3's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 */
export function dot(a: Vec3, b: Vec3): number;
```

#### `vec3.cross`

```ts
/**
 * Computes the cross product of two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function cross(out: Vec3, a: Vec3, b: Vec3): Vec3;
```

#### `vec3.perpendicular`

```ts
/**
 * Calculates a normalized perpendicular vector to the given vector.
 * Useful for finding an arbitrary orthogonal basis vector.
 *
 * @param out the receiving vector
 * @param a the source vector
 * @returns the out vector
 */
export function perpendicular(out: Vec3, a: Vec3): Vec3;
```

#### `vec3.lerp`

```ts
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function lerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3;
```

#### `vec3.slerp`

```ts
/**
 * Performs a spherical linear interpolation between two vec3's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function slerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3;
```

#### `vec3.hermite`

```ts
/**
 * Performs a hermite interpolation with two control points
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param c the third operand
 * @param d the fourth operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function hermite(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3;
```

#### `vec3.bezier`

```ts
/**
 * Performs a bezier interpolation with two control points
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param c the third operand
 * @param d the fourth operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function bezier(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3;
```

#### `vec3.transformMat4`

```ts
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat4(out: Vec3, a: Vec3, m: Mat4): Vec3;
```

#### `vec3.transformMat3`

```ts
/**
 * Transforms the vec3 with a mat3.
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m the 3x3 matrix to transform with
 * @returns out
 */
export function transformMat3(out: Vec3, a: Vec3, m: Mat3): Vec3;
```

#### `vec3.transformQuat`

```ts
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param q quaternion to transform with
 * @returns out
 */
export function transformQuat(out: Vec3, a: Vec3, q: Quat): Vec3;
```

#### `vec3.rotateX`

```ts
/**
 * Rotate a 3D vector around the x-axis
 * @param out The receiving vec3
 * @param a The vec3 point to rotate
 * @param b The origin of the rotation
 * @param rad The angle of rotation in radians
 * @returns out
 */
export function rotateX(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3;
```

#### `vec3.rotateY`

```ts
/**
 * Rotate a 3D vector around the y-axis
 * @param out The receiving vec3
 * @param a The vec3 point to rotate
 * @param b The origin of the rotation
 * @param rad The angle of rotation in radians
 * @returns out
 */
export function rotateY(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3;
```

#### `vec3.rotateZ`

```ts
/**
 * Rotate a 3D vector around the z-axis
 * @param out The receiving vec3
 * @param a The vec3 point to rotate
 * @param b The origin of the rotation
 * @param rad The angle of rotation in radians
 * @returns out
 */
export function rotateZ(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3;
```

#### `vec3.angle`

```ts
/**
 * Get the angle between two 3D vectors
 * @param a The first operand
 * @param b The second operand
 * @returns The angle in radians
 */
export function angle(a: Vec3, b: Vec3): number;
```

#### `vec3.zero`

```ts
/**
 * Set the components of a vec3 to zero
 *
 * @param out the receiving vector
 * @returns out
 */
export function zero(out: Vec3): Vec3;
```

#### `vec3.str`

```ts
/**
 * Returns a string representation of a vector
 *
 * @param a vector to represent as a string
 * @returns string representation of the vector
 */
export function str(a: Vec3): string;
```

#### `vec3.exactEquals`

```ts
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function exactEquals(a: Vec3, b: Vec3): boolean;
```

#### `vec3.equals`

```ts
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function equals(a: Vec3, b: Vec3): boolean;
```

#### `vec3.finite`

```ts
/**
 * Returns whether or not the vector is finite
 * @param a vector to test
 * @returns whether or not the vector is finite
 */
export function finite(a: Vec3): boolean;
```

#### `vec3.isScaleInsideOut`

```ts
/**
 * Determines if a scale vector represents an inside-out transformation (reflection)
 * Returns true if an odd number of scale components are negative
 *
 * @param scale The scale vector to test
 * @returns true if the scale represents a reflection (odd number of negative components)
 */
export function isScaleInsideOut(scale: Vec3): boolean;
```

#### `vec3.sub`

```ts
/**
 * Alias for {@link subtract}
 */
export const sub = subtract;
```

#### `vec3.mul`

```ts
/**
 * Alias for {@link multiply}
 */
export const mul = multiply;
```

#### `vec3.div`

```ts
/**
 * Alias for {@link divide}
 */
export const div = divide;
```

#### `vec3.dist`

```ts
/**
 * Alias for {@link distance}
 */
export const dist = distance;
```

#### `vec3.sqrDist`

```ts
/**
 * Alias for {@link squaredDistance}
 */
export const sqrDist = squaredDistance;
```

#### `vec3.len`

```ts
/**
 * Alias for {@link length}
 */
export const len = length;
```

#### `vec3.sqrLen`

```ts
/**
 * Alias for {@link squaredLength}
 */
export const sqrLen = squaredLength;
```

**vec4**

#### `vec4.create`

```ts
/**
 * Creates a new, empty vec4
 *
 * @returns a new 4D vector
 */
export function create(): Vec4;
```

#### `vec4.clone`

```ts
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param a vector to clone
 * @returns a new 4D vector
 */
export function clone(a: Vec4): Vec4;
```

#### `vec4.fromValues`

```ts
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @param w W component
 * @returns a new 4D vector
 */
export function fromValues(x: number, y: number, z: number, w: number): Vec4;
```

#### `vec4.copy`

```ts
/**
 * Copy the values from one vec4 to another
 *
 * @param out the receiving vector
 * @param a the source vector
 * @returns out
 */
export function copy(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.set`

```ts
/**
 * Set the components of a vec4 to the given values
 *
 * @param out the receiving vector
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @param w W component
 * @returns out
 */
export function set(out: Vec4, x: number, y: number, z: number, w: number): Vec4;
```

#### `vec4.fromBuffer`

```ts
/**
 * Sets the components of a vec4 from a buffer
 * @param out the receiving vector
 * @param buffer the source buffer
 * @param startIndex the starting index in the buffer
 * @returns out
 */
export function fromBuffer(out: Vec4, buffer: ArrayLike<number>, startIndex: number): Vec4;
```

#### `vec4.toBuffer`

```ts
/**
 * Writes the components of a vec4 to a buffer
 * @param outBuffer The output buffer
 * @param vec The source vector
 * @param startIndex The starting index in the buffer
 * @returns The output buffer
 */
export function toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec4, startIndex: number): MutableArrayLike<number>;
```

#### `vec4.add`

```ts
/**
 * Adds two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.subtract`

```ts
/**
 * Subtracts vector b from vector a
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.multiply`

```ts
/**
 * Multiplies two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.divide`

```ts
/**
 * Divides two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function divide(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.ceil`

```ts
/**
 * Math.ceil the components of a vec4
 *
 * @param out the receiving vector
 * @param a vector to ceil
 * @returns out
 */
export function ceil(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.floor`

```ts
/**
 * Math.floor the components of a vec4
 *
 * @param out the receiving vector
 * @param a vector to floor
 * @returns out
 */
export function floor(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.min`

```ts
/**
 * Returns the minimum of two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function min(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.max`

```ts
/**
 * Returns the maximum of two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function max(out: Vec4, a: Vec4, b: Vec4): Vec4;
```

#### `vec4.round`

```ts
/**
 * symmetric round the components of a vec4
 *
 * @param out the receiving vector
 * @param a vector to round
 * @returns out
 */
export function round(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.scale`

```ts
/**
 * Scales a vec4 by a scalar number
 *
 * @param out the receiving vector
 * @param a the vector to scale
 * @param b amount to scale the vector by
 * @returns out
 */
export function scale(out: Vec4, a: Vec4, b: number): Vec4;
```

#### `vec4.scaleAndAdd`

```ts
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b by before adding
 * @returns out
 */
export function scaleAndAdd(out: Vec4, a: Vec4, b: Vec4, scale: number): Vec4;
```

#### `vec4.distance`

```ts
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns distance between a and b
 */
export function distance(a: Vec4, b: Vec4): number;
```

#### `vec4.squaredDistance`

```ts
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns squared distance between a and b
 */
export function squaredDistance(a: Vec4, b: Vec4): number;
```

#### `vec4.length`

```ts
/**
 * Calculates the length of a vec4
 *
 * @param a vector to calculate length of
 * @returns length of a
 */
export function length(a: Vec4): number;
```

#### `vec4.squaredLength`

```ts
/**
 * Calculates the squared length of a vec4
 *
 * @param a vector to calculate squared length of
 * @returns squared length of a
 */
export function squaredLength(a: Vec4): number;
```

#### `vec4.negate`

```ts
/**
 * Negates the components of a vec4
 *
 * @param out the receiving vector
 * @param a vector to negate
 * @returns out
 */
export function negate(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.inverse`

```ts
/**
 * Returns the inverse of the components of a vec4
 *
 * @param out the receiving vector
 * @param a vector to invert
 * @returns out
 */
export function inverse(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.normalize`

```ts
/**
 * Normalize a vec4
 *
 * @param out the receiving vector
 * @param a vector to normalize
 * @returns out
 */
export function normalize(out: Vec4, a: Vec4): Vec4;
```

#### `vec4.dot`

```ts
/**
 * Calculates the dot product of two vec4's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 */
export function dot(a: Vec4, b: Vec4): number;
```

#### `vec4.cross`

```ts
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param out the receiving vector
 * @param u the first vector
 * @param v the second vector
 * @param w the third vector
 * @returns result
 */
export function cross(out: Vec4, u: Vec4, v: Vec4, w: Vec4): Vec4;
```

#### `vec4.lerp`

```ts
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function lerp(out: Vec4, a: Vec4, b: Vec4, t: number): Vec4;
```

#### `vec4.transformMat4`

```ts
/**
 * Transforms the vec4 with a mat4.
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param m matrix to transform with
 * @returns out
 */
export function transformMat4(out: Vec4, a: Vec4, m: Mat4): Vec4;
```

#### `vec4.transformQuat`

```ts
/**
 * Transforms the vec4 with a quat
 *
 * @param out the receiving vector
 * @param a the vector to transform
 * @param q quaternion to transform with
 * @returns out
 */
export function transformQuat(out: Vec4, a: Vec4, q: Quat): Vec4;
```

#### `vec4.zero`

```ts
/**
 * Set the components of a vec4 to zero
 *
 * @param out the receiving vector
 * @returns out
 */
export function zero(out: Vec4): Vec4;
```

#### `vec4.str`

```ts
/**
 * Returns a string representation of a vector
 *
 * @param a vector to represent as a string
 * @returns string representation of the vector
 */
export function str(a: Vec4): string;
```

#### `vec4.exactEquals`

```ts
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function exactEquals(a: Vec4, b: Vec4): boolean;
```

#### `vec4.equals`

```ts
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param a The first vector.
 * @param b The second vector.
 * @returns True if the vectors are equal, false otherwise.
 */
export function equals(a: Vec4, b: Vec4): boolean;
```

#### `vec4.finite`

```ts
/**
 * Returns whether or not the vector is finite
 * @param a vector to test
 * @returns whether or not the vector is finite
 */
export function finite(a: Vec4): boolean;
```

#### `vec4.sub`

```ts
/**
 * Alias for {@link subtract}
 */
export const sub = subtract;
```

#### `vec4.mul`

```ts
/**
 * Alias for {@link multiply}
 */
export const mul = multiply;
```

#### `vec4.div`

```ts
/**
 * Alias for {@link divide}
 */
export const div = divide;
```

#### `vec4.dist`

```ts
/**
 * Alias for {@link distance}
 */
export const dist = distance;
```

#### `vec4.sqrDist`

```ts
/**
 * Alias for {@link squaredDistance}
 */
export const sqrDist = squaredDistance;
```

#### `vec4.len`

```ts
/**
 * Alias for {@link length}
 */
export const len = length;
```

#### `vec4.sqrLen`

```ts
/**
 * Alias for {@link squaredLength}
 */
export const sqrLen = squaredLength;
```

**euler**

#### `euler.create`

```ts
/**
 * Creates a new Euler with default values (0, 0, 0, 'xyz').
 */
export function create(): Euler;
```

#### `euler.fromValues`

```ts
/**
 * Creates a new Euler from the given values.
 * @param x The x rotation in radians.
 * @param y The y rotation in radians.
 * @param z The z rotation in radians.
 * @param order The order of rotation.
 * @returns A new Euler.
 */
export function fromValues(x: number, y: number, z: number, order: EulerOrder): Euler;
```

#### `euler.set`

```ts
/**
 * Sets a given Euler from the given values.
 * @param x The x rotation in radians.
 * @param y The y rotation in radians.
 * @param z The z rotation in radians.
 * @param order The order of rotation.
 * @returns The output Euler.
 */
export function set(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler;
```

#### `euler.fromDegrees`

```ts
/**
 * Sets Euler angle radians from given degrees
 * @param out The output Euler.
 * @param x The x rotation in degrees.
 * @param y The y rotation in degrees.
 * @param z The z rotation in degrees.
 * @param order The order of rotation.
 * @returns The output Euler.
 */
export function fromDegrees(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler;
```

#### `euler.fromRotationMat4`

```ts
/**
 * Sets the Euler angles from a rotation matrix.
 * @param out The output Euler.
 * @param rotationMatrix The input rotation matrix.
 * @param order The order of the Euler angles.
 * @returns The output Euler.
 */
export function fromRotationMat4(out: Euler, rotationMatrix: Mat4, order: EulerOrder = out[3] || 'xyz'): Euler;
```

#### `euler.exactEquals`

```ts
/**
 * Returns whether or not the euler angles have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first euler.
 * @param b The second euler.
 * @returns True if the euler angles are equal, false otherwise.
 */
export function exactEquals(a: Euler, b: Euler): boolean;
```

#### `euler.equals`

```ts
/**
 * Returns whether or not the euler angles have approximately the same elements in the same position.
 *
 * @param a The first euler.
 * @param b The second euler.
 * @returns True if the euler angles are equal, false otherwise.
 */
export function equals(a: Euler, b: Euler): boolean;
```

#### `euler.fromQuat`

```ts
/**
 * Sets the Euler angles from a quaternion.
 * @param out The output Euler.
 * @param q The input quaternion. Assumed to be normalized (unit length).
 * @param order The order of the Euler.
 * @returns The output Euler
 */
export function fromQuat(out: Euler, q: Quat, order: EulerOrder): Euler;
```

#### `euler.reorder`

```ts
/**
 * Reorders the Euler based on the specified order.
 * @param out The output Euler.
 * @param a The input Euler.
 * @param order The order of the Euler.
 * @returns The output Euler.
 */
export function reorder(out: Euler, a: Euler, order: EulerOrder): Euler;
```

**quat**

#### `quat.create`

```ts
/**
 * Creates a new identity quat
 *
 * @returns a new quaternion
 */
export function create(): Quat;
```

#### `quat.fromBuffer`

```ts
/**
 * Sets the components of a quat from a buffer
 * @param out the receiving quaternion
 * @param buffer the source buffer
 * @param startIndex the starting index in the buffer
 * @returns out
 */
export function fromBuffer(out: Quat, buffer: ArrayLike<number>, startIndex: number): Quat;
```

#### `quat.toBuffer`

```ts
/**
 * Writes the components of a quat to a buffer
 * @param outBuffer The output buffer
 * @param q The source quaternion
 * @param startIndex The starting index in the buffer
 * @returns The output buffer
 */
export function toBuffer(outBuffer: MutableArrayLike<number>, q: Quat, startIndex: number): MutableArrayLike<number>;
```

#### `quat.identity`

```ts
/**
 * Set a quat to the identity quaternion
 *
 * @param out the receiving quaternion
 * @returns out
 */
export function identity(out: Quat): Quat;
```

#### `quat.setAxisAngle`

```ts
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param out the receiving quaternion
 * @param axis the axis around which to rotate
 * @param rad the angle in radians
 * @returns out
 **/
export function setAxisAngle(out: Quat, axis: Vec3, rad: number): Quat;
```

#### `quat.getAxisAngle`

```ts
/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  out_axis  Vector receiving the axis of rotation
 * @param  q     Quaternion to be decomposed
 * @return     Angle, in radians, of the rotation
 */
export function getAxisAngle(out_axis: Vec3, q: Quat): number;
```

#### `quat.getAngle`

```ts
/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  a     Origin unit quaternion
 * @param  b     Destination unit quaternion
 * @return     Angle, in radians, between the two quaternions
 */
export function getAngle(a: Quat, b: Quat): number;
```

#### `quat.multiply`

```ts
/**
 * Multiplies two quat's
 *
 * @param out the receiving quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Quat, a: Quat, b: Quat): Quat;
```

#### `quat.rotateX`

```ts
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param out quat receiving operation result
 * @param a quat to rotate
 * @param rad angle (in radians) to rotate
 * @returns out
 */
export function rotateX(out: Quat, a: Quat, rad: number): Quat;
```

#### `quat.rotateY`

```ts
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param out quat receiving operation result
 * @param a quat to rotate
 * @param rad angle (in radians) to rotate
 * @returns out
 */
export function rotateY(out: Quat, a: Quat, rad: number): Quat;
```

#### `quat.rotateZ`

```ts
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param out quat receiving operation result
 * @param a quat to rotate
 * @param rad angle (in radians) to rotate
 * @returns out
 */
export function rotateZ(out: Quat, a: Quat, rad: number): Quat;
```

#### `quat.calculateW`

```ts
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate W component of
 * @returns out
 */
export function calculateW(out: Quat, a: Quat): Quat;
```

#### `quat.exp`

```ts
/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate the exponential of
 * @returns out
 */
export function exp(out: Quat, a: Quat): Quat;
```

#### `quat.ln`

```ts
/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate the exponential of
 * @returns out
 */
export function ln(out: Quat, a: Quat): Quat;
```

#### `quat.pow`

```ts
/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate the exponential of
 * @param b amount to scale the quaternion by
 * @returns out
 */
export function pow(out: Quat, a: Quat, b: number): Quat;
```

#### `quat.slerp`

```ts
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param out the receiving quaternion
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function slerp(out: Quat, a: Quat, b: Quat, t: number): Quat;
```

#### `quat.invert`

```ts
/**
 * Calculates the inverse of a quat
 *
 * @param out the receiving quaternion
 * @param a quat to calculate inverse of
 * @returns out
 */
export function invert(out: Quat, a: Quat): Quat;
```

#### `quat.conjugate`

```ts
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate conjugate of
 * @returns out
 */
export function conjugate(out: Quat, a: Quat): Quat;
```

#### `quat.fromMat3`

```ts
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param out the receiving quaternion
 * @param m rotation matrix
 * @returns out
 */
export function fromMat3(out: Quat, m: Mat3): Quat;
```

#### `quat.fromMat4`

```ts
/**
 * Calculates a quaternion from a 4x4 rotation matrix
 * Extracts the 3x3 rotation part and calls fromMat3
 *
 * @param out the receiving quaternion
 * @param m rotation matrix
 * @returns out
 */
export function fromMat4(out: Quat, m: Mat4): Quat;
```

#### `quat.fromEuler`

```ts
/**
 * Creates a quaternion from the given euler
 * @param out the receiving quaternion
 * @param euler the euler to create the quaternion from
 * @returns out
 */
export function fromEuler(out: Quat, euler: Euler): Quat;
```

#### `quat.fromDegrees`

```ts
/**
 * Creates a quaternion from euler angles specified in degrees.
 * Shorthand for converting degrees to radians and then creating a quaternion from euler.
 *
 * @param out the receiving quaternion
 * @param x The x euler rotation in degrees
 * @param y The y euler rotation in degrees
 * @param z The z euler rotation in degrees
 * @param order The order of rotation
 * @returns out
 */
export function fromDegrees(out: Quat, x: number, y: number, z: number, order: EulerOrder): Quat;
```

#### `quat.str`

```ts
/**
 * Returns a string representation of a quaternion
 *
 * @param a vector to represent as a string
 * @returns string representation of the vector
 */
export function str(a: Quat): string;
```

#### `quat.clone`

```ts
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param a quaternion to clone
 * @returns a new quaternion
 */
export const clone = vec4.clone;
```

#### `quat.fromValues`

```ts
/**
 * Creates a new quat initialized with the given values
 *
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @param w W component
 * @returns a new quaternion
 */
export const fromValues = vec4.fromValues;
```

#### `quat.copy`

```ts
/**
 * Copy the values from one quat to another
 *
 * @param out the receiving quaternion
 * @param a the source quaternion
 * @returns out
 */
export const copy = vec4.copy;
```

#### `quat.set`

```ts
/**
 * Set the components of a quat to the given values
 *
 * @param out the receiving quaternion
 * @param x X component
 * @param y Y component
 * @param z Z component
 * @param w W component
 * @returns out
 */
export const set = vec4.set;
```

#### `quat.add`

```ts
/**
 * Adds two quat's
 *
 * @param out the receiving quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export const add = vec4.add;
```

#### `quat.scale`

```ts
/**
 * Scales a quat by a scalar number
 *
 * @param out the receiving quaternion
 * @param a the quaternion to scale
 * @param b amount to scale the quaternion by
 * @returns out
 */
export const scale = vec4.scale;
```

#### `quat.dot`

```ts
/**
 * Calculates the dot product of two quat's
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 */
export const dot = vec4.dot;
```

#### `quat.lerp`

```ts
/**
 * Performs a linear interpolation between two quat's
 *
 * @param out the receiving quaternion
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export const lerp = vec4.lerp;
```

#### `quat.length`

```ts
/**
 * Calculates the length of a quat
 *
 * @param a quaternion to calculate length of
 * @returns length of a
 */
export const length = vec4.length;
```

#### `quat.len`

```ts
/**
 * Alias for {@link length}
 */
export const len = length;
```

#### `quat.squaredLength`

```ts
/**
 * Calculates the squared length of a quat
 *
 * @param a quaternion to calculate squared length of
 * @returns squared length of a
 */
export const squaredLength = vec4.squaredLength;
```

#### `quat.sqrLen`

```ts
/**
 * Alias for {@link squaredLength}
 */
export const sqrLen = squaredLength;
```

#### `quat.mul`

```ts
/**
 * Alias for {@link multiply}
 */
export const mul = multiply;
```

#### `quat.normalize`

```ts
/**
 * Normalize a quat
 *
 * @param out the receiving quaternion
 * @param a quaternion to normalize
 * @returns out
 */
export const normalize = vec4.normalize;
```

#### `quat.exactEquals`

```ts
/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first quaternion.
 * @param b The second quaternion.
 * @returns True if the quaternions are equal, false otherwise.
 */
export const exactEquals = vec4.exactEquals;
```

#### `quat.equals`

```ts
/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param a The first quaternion.
 * @param b The second quaternion.
 * @returns True if the quaternions are equal, false otherwise.
 */
export function equals(a: Quat, b: Quat): boolean;
```

#### `quat.rotationTo`

```ts
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param out the receiving quaternion.
 * @param a the initial vector
 * @param b the destination vector
 * @returns out
 */
export const rotationTo = (() => {
    const tmpvec3 = vec3.create();
    const xUnitVec3 = vec3.fromValues(1, 0, 0);
    const yUnitVec3 = vec3.fromValues(0, 1, 0);
    return (out: Quat, a: Vec3, b: Vec3): Quat => {
        const dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        }
        if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        vec3.cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot;
        return normalize(out, out);
    };
})();
```

#### `quat.sqlerp`

```ts
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param out the receiving quaternion
 * @param a the first operand
 * @param b the second operand
 * @param c the third operand
 * @param d the fourth operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export const sqlerp = (() => {
    const temp1 = create();
    const temp2 = create();
    return (out: Quat, a: Quat, b: Quat, c: Quat, d: Quat, t: number): Quat => {
        slerp(temp1, a, d, t);
        slerp(temp2, b, c, t);
        slerp(out, temp1, temp2, 2 * t * (1 - t));
        return out;
    };
})();
```

#### `quat.setAxes`

```ts
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param view  the vector representing the viewing direction
 * @param right the vector representing the local "right" direction
 * @param up    the vector representing the local "up" direction
 * @returns out
 */
export const setAxes = (() => {
    const matr = mat3.create();
    return (out: Quat, view: Vec3, right: Vec3, up: Vec3): Quat => {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];
        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];
        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];
        return normalize(out, fromMat3(out, matr));
    };
})();
```

**quat2**

#### `quat2.create`

```ts
/**
 * Creates a new identity dual quat
 *
 * @returns a new dual quaternion [real -> rotation, dual -> translation]
 */
export function create(): Quat2;
```

#### `quat2.clone`

```ts
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param a dual quaternion to clone
 * @returns new dual quaternion
 * @function
 */
export function clone(a: Quat2): Quat2;
```

#### `quat2.fromValues`

```ts
/**
 * Creates a new dual quat initialized with the given values
 *
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component
 * @param y2 Y component
 * @param z2 Z component
 * @param w2 W component
 * @returns new dual quaternion
 * @function
 */
export function fromValues(x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number): Quat2;
```

#### `quat2.fromRotationTranslationValues`

```ts
/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component (translation)
 * @param y2 Y component (translation)
 * @param z2 Z component (translation)
 * @returns new dual quaternion
 * @function
 */
export function fromRotationTranslationValues(x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number): Quat2;
```

#### `quat2.fromRotationTranslation`

```ts
/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param out dual quaternion receiving operation result
 * @param q a normalized quaternion
 * @param t translation vector
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromRotationTranslation(out: Quat2, q: Quat, t: Vec3): Quat2;
```

#### `quat2.fromTranslation`

```ts
/**
 * Creates a dual quat from a translation
 *
 * @param out dual quaternion receiving operation result
 * @param t translation vector
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromTranslation(out: Quat2, t: Vec3): Quat2;
```

#### `quat2.fromRotation`

```ts
/**
 * Creates a dual quat from a quaternion
 *
 * @param out dual quaternion receiving operation result
 * @param q the quaternion
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromRotation(out: Quat2, q: Quat): Quat2;
```

#### `quat2.fromMat4`

```ts
/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param out the dual quaternion
 * @param a the matrix
 * @returns dual quat receiving operation result
 */
export function fromMat4(out: Quat2, a: Mat4): Quat2;
```

#### `quat2.copy`

```ts
/**
 * Copy the values from one dual quat to another
 *
 * @param out the receiving dual quaternion
 * @param a the source dual quaternion
 * @returns out
 * @function
 */
export function copy(out: Quat2, a: Quat2): Quat2;
```

#### `quat2.identity`

```ts
/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param out the receiving quaternion
 * @returns out
 */
export function identity(out: Quat2): Quat2;
```

#### `quat2.set`

```ts
/**
 * Set the components of a dual quat to the given values
 *
 * @param out the receiving quaternion
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component
 * @param y2 Y component
 * @param z2 Z component
 * @param w2 W component
 * @returns out
 * @function
 */
export function set(out: Quat2, x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number): Quat2;
```

#### `quat2.getReal`

```ts
/**
 * Gets the real part of a dual quat
 * @param  out real part
 * @param  a Dual Quaternion
 * @return real part
 */
export function getReal(out: Quat, a: Quat2): Quat;
```

#### `quat2.getDual`

```ts
/**
 * Gets the dual part of a dual quat
 * @param  out dual part
 * @param  a Dual Quaternion
 * @return dual part
 */
export function getDual(out: Quat, a: Quat2): Quat;
```

#### `quat2.setReal`

```ts
/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param out the receiving dual quaternion
 * @param q a quaternion representing the real part
 * @returns out
 */
export function setReal(out: Quat2, q: Quat): Quat2;
```

#### `quat2.setDual`

```ts
/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param out the receiving quaternion
 * @param q a quaternion representing the dual part
 * @returns out
 * @function
 */
export function setDual(out: Quat2, q: Quat): Quat2;
```

#### `quat2.getTranslation`

```ts
/**
 * Gets the translation of a normalized dual quat
 * @param  out translation
 * @param  a Dual Quaternion to be decomposed
 * @return translation
 */
export function getTranslation(out: Vec3, a: Quat2): Vec3;
```

#### `quat2.translate`

```ts
/**
 * Translates a dual quat by the given vector
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to translate
 * @param v vector to translate by
 * @returns out
 */
export function translate(out: Quat2, a: Quat2, v: Vec3): Quat2;
```

#### `quat2.rotateX`

```ts
/**
 * Rotates a dual quat around the X axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateX(out: Quat2, a: Quat2, rad: number): Quat2;
```

#### `quat2.rotateY`

```ts
/**
 * Rotates a dual quat around the Y axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateY(out: Quat2, a: Quat2, rad: number): Quat2;
```

#### `quat2.rotateZ`

```ts
/**
 * Rotates a dual quat around the Z axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateZ(out: Quat2, a: Quat2, rad: number): Quat2;
```

#### `quat2.rotateByQuatAppend`

```ts
/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param q quaternion to rotate by
 * @returns out
 */
export function rotateByQuatAppend(out: Quat2, a: Quat2, q: Quat): Quat2;
```

#### `quat2.rotateByQuatPrepend`

```ts
/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param out the receiving dual quaternion
 * @param q quaternion to rotate by
 * @param a the dual quaternion to rotate
 * @returns out
 */
export function rotateByQuatPrepend(out: Quat2, q: Quat, a: Quat2): Quat2;
```

#### `quat2.rotateAroundAxis`

```ts
/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param axis the axis to rotate around
 * @param rad how far the rotation should be
 * @returns out
 */
export function rotateAroundAxis(out: Quat2, a: Quat2, axis: Vec3, rad: number): Quat2;
```

#### `quat2.add`

```ts
/**
 * Adds two dual quat's
 *
 * @param out the receiving dual quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 * @function
 */
export function add(out: Quat2, a: Quat2, b: Quat2): Quat2;
```

#### `quat2.multiply`

```ts
/**
 * Multiplies two dual quat's
 *
 * @param out the receiving dual quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Quat2, a: Quat2, b: Quat2): Quat2;
```

#### `quat2.mul`

```ts
/**
 * Alias for {@link quat2.multiply}
 * @function
 */
export const mul = multiply;
```

#### `quat2.scale`

```ts
/**
 * Scales a dual quat by a scalar number
 *
 * @param out the receiving dual quat
 * @param a the dual quat to scale
 * @param b amount to scale the dual quat by
 * @returns out
 * @function
 */
export function scale(out: Quat2, a: Quat2, b: number): Quat2;
```

#### `quat2.dot`

```ts
/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 */
export function dot(a: Quat2, b: Quat2): number;
```

#### `quat2.lerp`

```ts
/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param out the receiving dual quat
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function lerp(out: Quat2, a: Quat2, b: Quat2, t: number): Quat2;
```

#### `quat2.invert`

```ts
/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param out the receiving dual quaternion
 * @param a dual quat to calculate inverse of
 * @returns out
 */
export function invert(out: Quat2, a: Quat2): Quat2;
```

#### `quat2.conjugate`

```ts
/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate conjugate of
 * @returns out
 */
export function conjugate(out: Quat2, a: Quat2): Quat2;
```

#### `quat2.length`

```ts
/**
 * Calculates the length of a dual quat (the length of its real/rotation part)
 *
 * @param a dual quat to calculate length of
 * @returns length of a
 */
export function length(a: Quat2): number;
```

#### `quat2.len`

```ts
/**
 * Alias for {@link quat2.length}
 * @function
 */
export const len = length;
```

#### `quat2.squaredLength`

```ts
/**
 * Calculates the squared length of a dual quat (the squared length of its real/rotation part)
 *
 * @param a dual quat to calculate squared length of
 * @returns squared length of a
 */
export function squaredLength(a: Quat2): number;
```

#### `quat2.sqrLen`

```ts
/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */
export const sqrLen = squaredLength;
```

#### `quat2.normalize`

```ts
/**
 * Normalize a dual quat
 *
 * @param out the receiving dual quaternion
 * @param a dual quaternion to normalize
 * @returns out
 * @function
 */
export function normalize(out: Quat2, a: Quat2): Quat2;
```

#### `quat2.str`

```ts
/**
 * Returns a string representation of a dual quaternion
 *
 * @param a dual quaternion to represent as a string
 * @returns string representation of the dual quat
 */
export function str(a: Quat2): string;
```

#### `quat2.exactEquals`

```ts
/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param a the first dual quaternion.
 * @param b the second dual quaternion.
 * @returns true if the dual quaternions are equal, false otherwise.
 */
export function exactEquals(a: Quat2, b: Quat2): boolean;
```

#### `quat2.equals`

```ts
/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param a the first dual quat.
 * @param b the second dual quat.
 * @returns true if the dual quats are equal, false otherwise.
 */
export function equals(a: Quat2, b: Quat2): boolean;
```

**mat2**

#### `mat2.create`

```ts
/**
 * Creates a new identity mat2
 *
 * @returns a new 2x2 matrix
 */
export function create(): Mat2;
```

#### `mat2.clone`

```ts
/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param a matrix to clone
 * @returns a new 2x2 matrix
 */
export function clone(a: Mat2): Mat2;
```

#### `mat2.copy`

```ts
/**
 * Copy the values from one mat2 to another
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function copy(out: Mat2, a: Mat2): Mat2;
```

#### `mat2.identity`

```ts
/**
 * Set a mat2 to the identity matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function identity(out: Mat2): Mat2;
```

#### `mat2.fromValues`

```ts
/**
 * Create a new mat2 with the given values
 *
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m10 Component in column 1, row 0 position (index 2)
 * @param m11 Component in column 1, row 1 position (index 3)
 * @returns out A new 2x2 matrix
 */
export function fromValues(m00: number, m01: number, m10: number, m11: number): Mat2;
```

#### `mat2.set`

```ts
/**
 * Set the components of a mat2 to the given values
 *
 * @param out the receiving matrix
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m10 Component in column 1, row 0 position (index 2)
 * @param m11 Component in column 1, row 1 position (index 3)
 * @returns out
 */
export function set(out: Mat2, m00: number, m01: number, m10: number, m11: number): Mat2;
```

#### `mat2.transpose`

```ts
/**
 * Transpose the values of a mat2
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function transpose(out: Mat2, a: Mat2): Mat2;
```

#### `mat2.invert`

```ts
/**
 * Inverts a mat2
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out, or null if source matrix is not invertible
 */
export function invert(out: Mat2, a: Mat2): Mat2 | null;
```

#### `mat2.adjoint`

```ts
/**
 * Calculates the adjugate of a mat2
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function adjoint(out: Mat2, a: Mat2): Mat2;
```

#### `mat2.determinant`

```ts
/**
 * Calculates the determinant of a mat2
 *
 * @param a the source matrix
 * @returns determinant of a
 */
export function determinant(a: Mat2): number;
```

#### `mat2.multiply`

```ts
/**
 * Multiplies two mat2's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Mat2, a: Mat2, b: Mat2): Mat2;
```

#### `mat2.rotate`

```ts
/**
 * Rotates a mat2 by the given angle
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotate(out: Mat2, a: Mat2, rad: number): Mat2;
```

#### `mat2.scale`

```ts
/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param v the vec2 to scale the matrix by
 * @returns out
 **/
export function scale(out: Mat2, a: Mat2, v: Vec2): Mat2;
```

#### `mat2.fromRotation`

```ts
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param out mat2 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromRotation(out: Mat2, rad: number): Mat2;
```

#### `mat2.fromScaling`

```ts
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param out mat2 receiving operation result
 * @param v Scaling vector
 * @returns out
 */
export function fromScaling(out: Mat2, v: Vec2): Mat2;
```

#### `mat2.str`

```ts
/**
 * Returns a string representation of a mat2
 *
 * @param a matrix to represent as a string
 * @returns string representation of the matrix
 */
export function str(a: Mat2): string;
```

#### `mat2.frob`

```ts
/**
 * Returns Frobenius norm of a mat2
 *
 * @param a the matrix to calculate Frobenius norm of
 * @returns Frobenius norm
 */
export function frob(a: Mat2): number;
```

#### `mat2.LDU`

```ts
/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param L the lower triangular matrix
 * @param D the diagonal matrix
 * @param U the upper triangular matrix
 * @param a the input matrix to factorize
 */
export function LDU(L: Mat2, D: Mat2, U: Mat2, a: Mat2): [
    Mat2,
    Mat2,
    Mat2
];
```

#### `mat2.add`

```ts
/**
 * Adds two mat2's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Mat2, a: Mat2, b: Mat2): Mat2;
```

#### `mat2.subtract`

```ts
/**
 * Subtracts matrix b from matrix a
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Mat2, a: Mat2, b: Mat2): Mat2;
```

#### `mat2.exactEquals`

```ts
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function exactEquals(a: Mat2, b: Mat2): boolean;
```

#### `mat2.equals`

```ts
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function equals(a: Mat2, b: Mat2): boolean;
```

#### `mat2.multiplyScalar`

```ts
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param out the receiving matrix
 * @param a the matrix to scale
 * @param b amount to scale the matrix's elements by
 * @returns out
 */
export function multiplyScalar(out: Mat2, a: Mat2, b: number): Mat2;
```

#### `mat2.multiplyScalarAndAdd`

```ts
/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b's elements by before adding
 * @returns out
 */
export function multiplyScalarAndAdd(out: Mat2, a: Mat2, b: Mat2, scale: number): Mat2;
```

#### `mat2.mul`

```ts
/**
 * Alias for {@link mat2.multiply}
 */
export const mul = multiply;
```

#### `mat2.sub`

```ts
/**
 * Alias for {@link mat2.subtract}
 */
export const sub = subtract;
```

**mat2d**

#### `mat2d.create`

```ts
/**
 * Creates a new identity mat2d
 *
 * @returns a new 2x3 matrix
 */
export function create(): Mat2d;
```

#### `mat2d.clone`

```ts
/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param a matrix to clone
 * @returns a new 2x3 matrix
 */
export function clone(a: Mat2d): Mat2d;
```

#### `mat2d.copy`

```ts
/**
 * Copy the values from one mat2d to another
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function copy(out: Mat2d, a: Mat2d): Mat2d;
```

#### `mat2d.identity`

```ts
/**
 * Set a mat2d to the identity matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function identity(out: Mat2d): Mat2d;
```

#### `mat2d.fromValues`

```ts
/**
 * Create a new mat2d with the given values
 *
 * @param a Component A (index 0)
 * @param b Component B (index 1)
 * @param c Component C (index 2)
 * @param d Component D (index 3)
 * @param tx Component TX (index 4)
 * @param ty Component TY (index 5)
 * @returns A new mat2d
 */
export function fromValues(a: number, b: number, c: number, d: number, tx: number, ty: number): Mat2d;
```

#### `mat2d.set`

```ts
/**
 * Set the components of a mat2d to the given values
 *
 * @param out the receiving matrix
 * @param a Component A (index 0)
 * @param b Component B (index 1)
 * @param c Component C (index 2)
 * @param d Component D (index 3)
 * @param tx Component TX (index 4)
 * @param ty Component TY (index 5)
 * @returns out
 */
export function set(out: Mat2d, a: number, b: number, c: number, d: number, tx: number, ty: number): Mat2d;
```

#### `mat2d.invert`

```ts
/**
 * Inverts a mat2d
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out, or null if source matrix is not invertible
 */
export function invert(out: Mat2d, a: Mat2d): Mat2d | null;
```

#### `mat2d.determinant`

```ts
/**
 * Calculates the determinant of a mat2d
 *
 * @param a the source matrix
 * @returns determinant of a
 */
export function determinant(a: Mat2d): number;
```

#### `mat2d.multiply`

```ts
/**
 * Multiplies two mat2d's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d;
```

#### `mat2d.rotate`

```ts
/**
 * Rotates a mat2d by the given angle
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotate(out: Mat2d, a: Mat2d, rad: number): Mat2d;
```

#### `mat2d.scale`

```ts
/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param out the receiving matrix
 * @param a the matrix to translate
 * @param v the vec2 to scale the matrix by
 * @returns out
 **/
export function scale(out: Mat2d, a: Mat2d, v: Vec2): Mat2d;
```

#### `mat2d.translate`

```ts
/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param out the receiving matrix
 * @param a the matrix to translate
 * @param v the vec2 to translate the matrix by
 * @returns out
 **/
export function translate(out: Mat2d, a: Mat2d, v: Vec2): Mat2d;
```

#### `mat2d.fromRotation`

```ts
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param out mat2d receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromRotation(out: Mat2d, rad: number): Mat2d;
```

#### `mat2d.fromScaling`

```ts
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param out mat2d receiving operation result
 * @param v Scaling vector
 * @returns out
 */
export function fromScaling(out: Mat2d, v: Vec2): Mat2d;
```

#### `mat2d.fromTranslation`

```ts
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param out mat2d receiving operation result
 * @param v Translation vector
 * @returns out
 */
export function fromTranslation(out: Mat2d, v: Vec2): Mat2d;
```

#### `mat2d.str`

```ts
/**
 * Returns a string representation of a mat2d
 *
 * @param a matrix to represent as a string
 * @returns string representation of the matrix
 */
export function str(a: Mat2d): string;
```

#### `mat2d.frob`

```ts
/**
 * Returns Frobenius norm of a mat2d
 *
 * @param a the matrix to calculate Frobenius norm of
 * @returns Frobenius norm
 */
export function frob(a: Mat2d): number;
```

#### `mat2d.add`

```ts
/**
 * Adds two mat2d's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d;
```

#### `mat2d.subtract`

```ts
/**
 * Subtracts matrix b from matrix a
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d;
```

#### `mat2d.multiplyScalar`

```ts
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param out the receiving matrix
 * @param a the matrix to scale
 * @param b amount to scale the matrix's elements by
 * @returns out
 */
export function multiplyScalar(out: Mat2d, a: Mat2d, b: number): Mat2d;
```

#### `mat2d.multiplyScalarAndAdd`

```ts
/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b's elements by before adding
 * @returns out
 */
export function multiplyScalarAndAdd(out: Mat2d, a: Mat2d, b: Mat2d, scale: number): Mat2d;
```

#### `mat2d.exactEquals`

```ts
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function exactEquals(a: Mat2d, b: Mat2d): boolean;
```

#### `mat2d.equals`

```ts
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function equals(a: Mat2d, b: Mat2d): boolean;
```

#### `mat2d.mul`

```ts
/**
 * Alias for {@link mat2d.multiply}
 */
export const mul = multiply;
```

#### `mat2d.sub`

```ts
/**
 * Alias for {@link mat2d.subtract}
 */
export const sub = subtract;
```

**mat3**

#### `mat3.create`

```ts
/**
 * Creates a new identity mat3
 *
 * @returns a new 3x3 matrix
 */
export function create(): Mat3;
```

#### `mat3.fromMat4`

```ts
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param out the receiving 3x3 matrix
 * @param a   the source 4x4 matrix
 * @returns out
 */
export function fromMat4(out: Mat3, a: Mat4): Mat3;
```

#### `mat3.clone`

```ts
/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param a matrix to clone
 * @returns a new 3x3 matrix
 */
export function clone(a: Mat3): Mat3;
```

#### `mat3.copy`

```ts
/**
 * Copy the values from one mat3 to another
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function copy(out: Mat3, a: Mat3): Mat3;
```

#### `mat3.fromValues`

```ts
/**
 * Create a new mat3 with the given values
 *
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m02 Component in column 0, row 2 position (index 2)
 * @param m10 Component in column 1, row 0 position (index 3)
 * @param m11 Component in column 1, row 1 position (index 4)
 * @param m12 Component in column 1, row 2 position (index 5)
 * @param m20 Component in column 2, row 0 position (index 6)
 * @param m21 Component in column 2, row 1 position (index 7)
 * @param m22 Component in column 2, row 2 position (index 8)
 * @returns A new mat3
 */
export function fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Mat3;
```

#### `mat3.set`

```ts
/**
 * Set the components of a mat3 to the given values
 *
 * @param out the receiving matrix
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m02 Component in column 0, row 2 position (index 2)
 * @param m10 Component in column 1, row 0 position (index 3)
 * @param m11 Component in column 1, row 1 position (index 4)
 * @param m12 Component in column 1, row 2 position (index 5)
 * @param m20 Component in column 2, row 0 position (index 6)
 * @param m21 Component in column 2, row 1 position (index 7)
 * @param m22 Component in column 2, row 2 position (index 8)
 * @returns out
 */
export function set(out: Mat3, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Mat3;
```

#### `mat3.identity`

```ts
/**
 * Set a mat3 to the identity matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function identity(out: Mat3): Mat3;
```

#### `mat3.zero`

```ts
/**
 * Set a mat3 to the zero matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function zero(out: Mat3): Mat3;
```

#### `mat3.transpose`

```ts
/**
 * Transpose the values of a mat3
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function transpose(out: Mat3, a: Mat3): Mat3;
```

#### `mat3.invert`

```ts
/**
 * Inverts a mat3
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function invert(out: Mat3, a: Mat3): Mat3 | null;
```

#### `mat3.adjoint`

```ts
/**
 * Calculates the adjugate of a mat3
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function adjoint(out: Mat3, a: Mat3): Mat3;
```

#### `mat3.determinant`

```ts
/**
 * Calculates the determinant of a mat3
 *
 * @param a the source matrix
 * @returns determinant of a
 */
export function determinant(a: Mat3): number;
```

#### `mat3.multiply`

```ts
/**
 * Multiplies two mat3's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Mat3, a: Mat3, b: Mat3): Mat3;
```

#### `mat3.translate`

```ts
/**
 * Translate a mat3 by the given vector
 *
 * @param out the receiving matrix
 * @param a the matrix to translate
 * @param v vector to translate by
 * @returns out
 */
export function translate(out: Mat3, a: Mat3, v: Vec2): Mat3;
```

#### `mat3.rotate`

```ts
/**
 * Rotates a mat3 by the given angle
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotate(out: Mat3, a: Mat3, rad: number): Mat3;
```

#### `mat3.scale`

```ts
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param v the vec2 to scale the matrix by
 * @returns out
 **/
export function scale(out: Mat3, a: Mat3, v: Vec2): Mat3;
```

#### `mat3.fromTranslation`

```ts
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param out mat3 receiving operation result
 * @param v Translation vector
 * @returns out
 */
export function fromTranslation(out: Mat3, v: Vec2): Mat3;
```

#### `mat3.fromRotation`

```ts
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param out mat3 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromRotation(out: Mat3, rad: number): Mat3;
```

#### `mat3.fromScaling`

```ts
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param out mat3 receiving operation result
 * @param v Scaling vector
 * @returns out
 */
export function fromScaling(out: Mat3, v: Vec2): Mat3;
```

#### `mat3.fromMat2d`

```ts
/**
 * Copies the values from a mat2d into a mat3
 *
 * @param out the receiving matrix
 * @param a the matrix to copy
 * @returns out
 **/
export function fromMat2d(out: Mat3, a: Mat2d): Mat3;
```

#### `mat3.fromQuat`

```ts
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param out mat3 receiving operation result
 * @param q Quaternion to create matrix from
 *
 * @returns out
 */
export function fromQuat(out: Mat3, q: Quat): Mat3;
```

#### `mat3.normalFromMat4`

```ts
/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param out mat3 receiving operation result
 * @param a Mat4 to derive the normal matrix from
 *
 * @returns out
 */
export function normalFromMat4(out: Mat3, a: Mat4): Mat3 | null;
```

#### `mat3.projection`

```ts
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param out mat3 frustum matrix will be written into
 * @param width Width of your gl context
 * @param height Height of gl context
 * @returns out
 */
export function projection(out: Mat3, width: number, height: number): Mat3;
```

#### `mat3.str`

```ts
/**
 * Returns a string representation of a mat3
 *
 * @param a matrix to represent as a string
 * @returns string representation of the matrix
 */
export function str(a: Mat3): string;
```

#### `mat3.frob`

```ts
/**
 * Returns Frobenius norm of a mat3
 *
 * @param a the matrix to calculate Frobenius norm of
 * @returns Frobenius norm
 */
export function frob(a: Mat3): number;
```

#### `mat3.add`

```ts
/**
 * Adds two mat3's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Mat3, a: Mat3, b: Mat3): Mat3;
```

#### `mat3.subtract`

```ts
/**
 * Subtracts matrix b from matrix a
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Mat3, a: Mat3, b: Mat3): Mat3;
```

#### `mat3.multiplyScalar`

```ts
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param out the receiving matrix
 * @param a the matrix to scale
 * @param b amount to scale the matrix's elements by
 * @returns out
 */
export function multiplyScalar(out: Mat3, a: Mat3, b: number): Mat3;
```

#### `mat3.multiplyScalarAndAdd`

```ts
/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b's elements by before adding
 * @returns out
 */
export function multiplyScalarAndAdd(out: Mat3, a: Mat3, b: Mat3, scale: number): Mat3;
```

#### `mat3.exactEquals`

```ts
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function exactEquals(a: Mat3, b: Mat3): boolean;
```

#### `mat3.equals`

```ts
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns True if the matrices are equal, false otherwise.
 */
export function equals(a: Mat3, b: Mat3): boolean;
```

#### `mat3.mul`

```ts
/**
 * Alias for {@link mat3.multiply}
 * @function
 */
export const mul = multiply;
```

#### `mat3.sub`

```ts
/**
 * Alias for {@link mat3.subtract}
 * @function
 */
export const sub = subtract;
```

**mat4**

#### `mat4.create`

```ts
/**
 * Creates a new identity mat4
 *
 * @returns a new 4x4 matrix
 */
export function create(): Mat4;
```

#### `mat4.clone`

```ts
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param a matrix to clone
 * @returns a new 4x4 matrix
 */
export function clone(a: Mat4): Mat4;
```

#### `mat4.copy`

```ts
/**
 * Copy the values from one mat4 to another
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function copy(out: Mat4, a: Mat4): Mat4;
```

#### `mat4.fromValues`

```ts
/**
 * Create a new mat4 with the given values
 *
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m02 Component in column 0, row 2 position (index 2)
 * @param m03 Component in column 0, row 3 position (index 3)
 * @param m10 Component in column 1, row 0 position (index 4)
 * @param m11 Component in column 1, row 1 position (index 5)
 * @param m12 Component in column 1, row 2 position (index 6)
 * @param m13 Component in column 1, row 3 position (index 7)
 * @param m20 Component in column 2, row 0 position (index 8)
 * @param m21 Component in column 2, row 1 position (index 9)
 * @param m22 Component in column 2, row 2 position (index 10)
 * @param m23 Component in column 2, row 3 position (index 11)
 * @param m30 Component in column 3, row 0 position (index 12)
 * @param m31 Component in column 3, row 1 position (index 13)
 * @param m32 Component in column 3, row 2 position (index 14)
 * @param m33 Component in column 3, row 3 position (index 15)
 * @returns A new mat4
 */
export function fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Mat4;
```

#### `mat4.set`

```ts
/**
 * Set the components of a mat4 to the given values
 *
 * @param out the receiving matrix
 * @param m00 Component in column 0, row 0 position (index 0)
 * @param m01 Component in column 0, row 1 position (index 1)
 * @param m02 Component in column 0, row 2 position (index 2)
 * @param m03 Component in column 0, row 3 position (index 3)
 * @param m10 Component in column 1, row 0 position (index 4)
 * @param m11 Component in column 1, row 1 position (index 5)
 * @param m12 Component in column 1, row 2 position (index 6)
 * @param m13 Component in column 1, row 3 position (index 7)
 * @param m20 Component in column 2, row 0 position (index 8)
 * @param m21 Component in column 2, row 1 position (index 9)
 * @param m22 Component in column 2, row 2 position (index 10)
 * @param m23 Component in column 2, row 3 position (index 11)
 * @param m30 Component in column 3, row 0 position (index 12)
 * @param m31 Component in column 3, row 1 position (index 13)
 * @param m32 Component in column 3, row 2 position (index 14)
 * @param m33 Component in column 3, row 3 position (index 15)
 * @returns out
 */
export function set(out: Mat4, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Mat4;
```

#### `mat4.identity`

```ts
/**
 * Set a mat4 to the identity matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function identity(out: Mat4): Mat4;
```

#### `mat4.zero`

```ts
/**
 * Set a mat4 to the zero matrix
 *
 * @param out the receiving matrix
 * @returns out
 */
export function zero(out: Mat4): Mat4;
```

#### `mat4.transpose`

```ts
/**
 * Transpose the values of a mat4
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function transpose(out: Mat4, a: Mat4): Mat4;
```

#### `mat4.invert`

```ts
/**
 * Inverts a mat4
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out, or null if source matrix is not invertible
 */
export function invert(out: Mat4, a: Mat4): Mat4 | null;
```

#### `mat4.invert3x3`

```ts
/**
 * Inverts only the 3x3 rotation part of a mat4.
 * Sets the translation column and bottom row to [0, 0, 0, 1].
 * Equivalent to Jolt's Mat44::Inversed3x3()
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out, or null if the 3x3 part is not invertible
 */
export function invert3x3(out: Mat4, a: Mat4): Mat4 | null;
```

#### `mat4.adjoint`

```ts
/**
 * Calculates the adjugate of a mat4
 *
 * @param out the receiving matrix
 * @param a the source matrix
 * @returns out
 */
export function adjoint(out: Mat4, a: Mat4): Mat4;
```

#### `mat4.determinant`

```ts
/**
 * Calculates the determinant of a mat4
 *
 * @param a the source matrix
 * @returns determinant of a
 */
export function determinant(a: Mat4): number;
```

#### `mat4.multiply`

```ts
/**
 * Multiplies two mat4s
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Mat4, a: Mat4, b: Mat4): Mat4;
```

#### `mat4.multiply3x3`

```ts
/**
 * Multiplies two mat4s treating them as 3x3 rotation matrices.
 * Only computes the upper-left 3x3 portion, sets the 4th column to [0,0,0,1].
 * More efficient than full mat4.multiply when working with pure rotations.
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply3x3(out: Mat4, a: Mat4, b: Mat4): Mat4;
```

#### `mat4.multiply3x3RightTransposed`

```ts
/**
 * Multiplies a mat4 by the transpose of another mat4,
 * treating both as 3x3 rotation matrices.
 * Computes: out = a * transpose(b) (3x3 only)
 * Sets the 4th column to [0,0,0,1].
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand (will be transposed)
 * @returns out
 */
export function multiply3x3RightTransposed(out: Mat4, a: Mat4, b: Mat4): Mat4;
```

#### `mat4.multiply3x3TransposedVec`

```ts
/**
 * Transform a Vec3 by the transpose of the 3x3 rotation part.
 *
 * @param out the receiving vector
 * @param mat the matrix to transform with
 * @param vec the vector to transform
 * @returns out
 */
export function multiply3x3TransposedVec(out: Vec3, mat: Mat4, vec: Vec3): Vec3;
```

#### `mat4.multiply3x3Vec`

```ts
/**
 * Transform a Vec3 by only the 3x3 rotation part of a Mat4.
 *
 * @param out the receiving vector
 * @param mat the matrix to transform with
 * @param vec the vector to transform
 * @returns out
 */
export function multiply3x3Vec(out: Vec3, mat: Mat4, vec: Vec3): Vec3;
```

#### `mat4.crossProductMatrix`

```ts
/**
 * Cross product matrix (skew-symmetric matrix).
 * Equivalent to Jolt's Mat44::sCrossProduct(Vec3Arg)
 *
 * @param out the receiving matrix
 * @param v the vector to create the cross product matrix from
 * @returns out
 */
export function crossProductMatrix(out: Mat4, v: Vec3): Mat4;
```

#### `mat4.translate`

```ts
/**
 * Translate a mat4 by the given vector
 *
 * @param out the receiving matrix
 * @param a the matrix to translate
 * @param v vector to translate by
 * @returns out
 */
export function translate(out: Mat4, a: Mat4, v: Vec3): Mat4;
```

#### `mat4.scale`

```ts
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param out the receiving matrix
 * @param a the matrix to scale
 * @param v the vec3 to scale the matrix by
 * @returns out
 **/
export function scale(out: Mat4, a: Mat4, v: Vec3): Mat4;
```

#### `mat4.rotate`

```ts
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @param axis the axis to rotate around
 * @returns out
 */
export function rotate(out: Mat4, a: Mat4, rad: number, axis: Vec3): Mat4 | null;
```

#### `mat4.rotateX`

```ts
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotateX(out: Mat4, a: Mat4, rad: number): Mat4;
```

#### `mat4.rotateY`

```ts
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotateY(out: Mat4, a: Mat4, rad: number): Mat4;
```

#### `mat4.rotateZ`

```ts
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param out the receiving matrix
 * @param a the matrix to rotate
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function rotateZ(out: Mat4, a: Mat4, rad: number): Mat4;
```

#### `mat4.fromTranslation`

```ts
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param out mat4 receiving operation result
 * @param v Translation vector
 * @returns out
 */
export function fromTranslation(out: Mat4, v: Vec3): Mat4;
```

#### `mat4.fromScaling`

```ts
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param out mat4 receiving operation result
 * @param v Scaling vector
 * @returns out
 */
export function fromScaling(out: Mat4, v: Vec3): Mat4;
```

#### `mat4.fromRotation`

```ts
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param out mat4 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @param axis the axis to rotate around
 * @returns out
 */
export function fromRotation(out: Mat4, rad: number, axis: Vec3): Mat4 | null;
```

#### `mat4.fromXRotation`

```ts
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param out mat4 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromXRotation(out: Mat4, rad: number): Mat4;
```

#### `mat4.fromYRotation`

```ts
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param out mat4 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromYRotation(out: Mat4, rad: number): Mat4;
```

#### `mat4.fromZRotation`

```ts
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param out mat4 receiving operation result
 * @param rad the angle to rotate the matrix by
 * @returns out
 */
export function fromZRotation(out: Mat4, rad: number): Mat4;
```

#### `mat4.fromRotationTranslation`

```ts
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *
 * @param out mat4 receiving operation result
 * @param q Rotation quaternion
 * @param v Translation vector
 * @returns out
 */
export function fromRotationTranslation(out: Mat4, q: Quat | Quat2, v: Vec3): Mat4;
```

#### `mat4.fromQuat2`

```ts
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param out Matrix
 * @param a Dual Quaternion
 * @returns mat4 receiving operation result
 */
export function fromQuat2(out: Mat4, a: Quat2): Mat4;
```

#### `mat4.getTranslation`

```ts
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param out Vector to receive translation component
 * @param mat Matrix to be decomposed (input)
 * @return out
 */
export function getTranslation(out: Vec3, mat: Mat4): Vec3;
```

#### `mat4.getScaling`

```ts
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion parameter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param out Vector to receive scaling factor component
 * @param mat Matrix to be decomposed (input)
 * @return out
 */
export function getScaling(out: Vec3, mat: Mat4): Vec3;
```

#### `mat4.getRotation`

```ts
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param out Quaternion to receive the rotation component
 * @param mat Matrix to be decomposed (input)
 * @return out
 */
export function getRotation(out: Quat, mat: Mat4): Quat;
```

#### `mat4.decompose`

```ts
/**
 * Decomposes a transformation matrix into its rotation, translation
 * and scale components. Returns only the rotation component
 * @param out_r Quaternion to receive the rotation component
 * @param out_t Vector to receive the translation vector
 * @param out_s Vector to receive the scaling factor
 * @param mat Matrix to be decomposed (input)
 * @returns out_r
 */
export function decompose(out_r: Quat, out_t: Vec3, out_s: Vec3, mat: Mat4): Quat;
```

#### `mat4.fromRotationTranslationScale`

```ts
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *     mat4.scale(dest, dest, scale)
 *
 * @param out mat4 receiving operation result
 * @param q Rotation quaternion
 * @param v Translation vector
 * @param s Scaling vector
 * @returns out
 */
export function fromRotationTranslationScale(out: Mat4, q: Quat, v: Vec3, s: Vec3): Mat4;
```

#### `mat4.fromRotationTranslationScaleOrigin`

```ts
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     mat4.translate(dest, dest, origin);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *     mat4.scale(dest, dest, scale)
 *     mat4.translate(dest, dest, negativeOrigin);
 *
 * @param out mat4 receiving operation result
 * @param q Rotation quaternion
 * @param v Translation vector
 * @param s Scaling vector
 * @param o The origin vector around which to scale and rotate
 * @returns out
 */
export function fromRotationTranslationScaleOrigin(out: Mat4, q: Quat, v: Vec3, s: Vec3, o: Vec3): Mat4;
```

#### `mat4.fromQuat`

```ts
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param out mat4 receiving operation result
 * @param q Quaternion to create matrix from
 *
 * @returns out
 */
export function fromQuat(out: Mat4, q: Quat): Mat4;
```

#### `mat4.frustumNO`

```ts
/**
 * Generates a frustum matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param left Left bound of the frustum
 * @param right Right bound of the frustum
 * @param bottom Bottom bound of the frustum
 * @param top Top bound of the frustum
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function frustumNO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
```

#### `mat4.frustumZO`

```ts
/**
 * Generates a frustum matrix with the given bounds, suitable for WebGPU.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param left Left bound of the frustum
 * @param right Right bound of the frustum
 * @param bottom Bottom bound of the frustum
 * @param top Top bound of the frustum
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function frustumZO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
```

#### `mat4.perspectiveNO`

```ts
/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param out mat4 frustum matrix will be written into
 * @param fovy Vertical field of view in radians
 * @param aspect Aspect ratio. typically viewport width/height
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum, can be null or Infinity
 * @returns out
 */
export function perspectiveNO(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4;
```

#### `mat4.perspectiveZO`

```ts
/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param out mat4 frustum matrix will be written into
 * @param fovy Vertical field of view in radians
 * @param aspect Aspect ratio. typically viewport width/height
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum, can be null or Infinity
 * @returns out
 */
export function perspectiveZO(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4;
```

#### `mat4.perspectiveFromFieldOfViewNO`

```ts
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experimental WebVR API.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function perspectiveFromFieldOfViewNO(out: Mat4, fov: {
    upDegrees: number;
    downDegrees: number;
    leftDegrees: number;
    rightDegrees: number;
}, near: number, far: number): Mat4;
```

#### `mat4.perspectiveFromFieldOfViewZO`

```ts
/**
 * Generates a perspective projection matrix with the given field of view, suitable for WebGPU.
 * This is primarily useful for generating projection matrices to be used
 * with the still experimental WebVR API.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function perspectiveFromFieldOfViewZO(out: Mat4, fov: {
    upDegrees: number;
    downDegrees: number;
    leftDegrees: number;
    rightDegrees: number;
}, near: number, far: number): Mat4;
```

#### `mat4.orthoNO`

```ts
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param left Left bound of the frustum
 * @param right Right bound of the frustum
 * @param bottom Bottom bound of the frustum
 * @param top Top bound of the frustum
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function orthoNO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
```

#### `mat4.orthoZO`

```ts
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param out mat4 frustum matrix will be written into
 * @param left Left bound of the frustum
 * @param right Right bound of the frustum
 * @param bottom Bottom bound of the frustum
 * @param top Top bound of the frustum
 * @param near Near bound of the frustum
 * @param far Far bound of the frustum
 * @returns out
 */
export function orthoZO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
```

#### `mat4.lookAt`

```ts
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param out mat4 frustum matrix will be written into
 * @param eye Position of the viewer
 * @param center Point the viewer is looking at
 * @param up vec3 pointing up
 * @returns out
 */
export function lookAt(out: Mat4, eye: Vec3, center: Vec3, up: Vec3): Mat4;
```

#### `mat4.targetTo`

```ts
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param out mat4 frustum matrix will be written into
 * @param eye Position of the viewer
 * @param target Point the viewer is looking at
 * @param up vec3 pointing up
 * @returns out
 */
export function targetTo(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4;
```

#### `mat4.str`

```ts
/**
 * Returns a string representation of a mat4
 *
 * @param a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
export function str(a: Mat4): string;
```

#### `mat4.frob`

```ts
/**
 * Returns Frobenius norm of a mat4
 *
 * @param a the matrix to calculate Frobenius norm of
 * @returns Frobenius norm
 */
export function frob(a: Mat4): number;
```

#### `mat4.add`

```ts
/**
 * Adds two mat4's
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function add(out: Mat4, a: Mat4, b: Mat4): Mat4;
```

#### `mat4.subtract`

```ts
/**
 * Subtracts matrix b from matrix a
 *
 * @param out the receiving matrix
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function subtract(out: Mat4, a: Mat4, b: Mat4): Mat4;
```

#### `mat4.multiplyScalar`

```ts
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param out the receiving matrix
 * @param a the matrix to scale
 * @param b amount to scale the matrix's elements by
 * @returns out
 */
export function multiplyScalar(out: Mat4, a: Mat4, b: number): Mat4;
```

#### `mat4.multiplyScalarAndAdd`

```ts
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param out the receiving vector
 * @param a the first operand
 * @param b the second operand
 * @param scale the amount to scale b's elements by before adding
 * @returns out
 */
export function multiplyScalarAndAdd(out: Mat4, a: Mat4, b: Mat4, scale: number): Mat4;
```

#### `mat4.exactEquals`

```ts
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function exactEquals(a: Mat4, b: Mat4): boolean;
```

#### `mat4.equals`

```ts
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
export function equals(a: Mat4, b: Mat4): boolean;
```

#### `mat4.mul`

```ts
/**
 * Alias for {@link mat4.multiply}
 * @function
 */
export const mul = multiply;
```

#### `mat4.sub`

```ts
/**
 * Alias for {@link mat4.subtract}
 * @function
 */
export const sub = subtract;
```

**spherical**

#### `spherical.create`

```ts
/**
 * Creates a new spherical coordinate at r=1, theta=0, phi=0
 *
 * @returns a new Spherical
 */
export function create(): Spherical;
```

#### `spherical.fromValues`

```ts
/**
 * Creates a new Spherical initialized with the given values
 *
 * @param r radial distance
 * @param theta azimuthal angle in the XZ plane from +Z (radians)
 * @param phi polar angle from +Y axis (radians)
 * @returns a new Spherical
 */
export function fromValues(r: number, theta: number, phi: number): Spherical;
```

#### `spherical.clone`

```ts
/**
 * Creates a new Spherical initialized with values from an existing one
 *
 * @param a the source Spherical
 * @returns a new Spherical
 */
export function clone(a: Spherical): Spherical;
```

#### `spherical.copy`

```ts
/**
 * Copies values from one Spherical to another
 *
 * @param out the receiving Spherical
 * @param a the source Spherical
 * @returns out
 */
export function copy(out: Spherical, a: Spherical): Spherical;
```

#### `spherical.set`

```ts
/**
 * Sets the components of a Spherical
 *
 * @param out the receiving Spherical
 * @param r radial distance
 * @param theta azimuthal angle in the XZ plane from +Z (radians)
 * @param phi polar angle from +Y axis (radians)
 * @returns out
 */
export function set(out: Spherical, r: number, theta: number, phi: number): Spherical;
```

#### `spherical.normalize`

```ts
/**
 * Sets r=1, preserving the angles. No-op if r is already zero.
 *
 * @param out the receiving Spherical
 * @param a the source Spherical
 * @returns out
 */
export function normalize(out: Spherical, a: Spherical): Spherical;
```

#### `spherical.scale`

```ts
/**
 * Scales the radial distance r by a scalar
 *
 * @param out the receiving Spherical
 * @param a the source Spherical
 * @param s scalar to multiply r by
 * @returns out
 */
export function scale(out: Spherical, a: Spherical, s: number): Spherical;
```

#### `spherical.lerp`

```ts
/**
 * Linearly interpolates between two Spherical coordinates taking the shortest
 * angular path for theta and phi.
 *
 * @param out the receiving Spherical
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation factor in [0, 1]
 * @returns out
 */
export function lerp(out: Spherical, a: Spherical, b: Spherical, t: number): Spherical;
```

#### `spherical.setFromVec3`

```ts
/**
 * Sets a Spherical from Cartesian Vec3 coordinates (Three.js / OpenGL convention):
 *   r     = sqrt(x² + y² + z²)
 *   theta = atan2(x, z)   (azimuthal angle in XZ plane from +Z)
 *   phi   = acos(y / r)   (polar angle from +Y)
 *
 * @param out the receiving Spherical
 * @param v the source Vec3
 * @returns out
 */
export function setFromVec3(out: Spherical, v: Vec3): Spherical;
```

#### `spherical.fromVec3`

```ts
/** @alias setFromVec3 */
export const fromVec3 = setFromVec3;
```

#### `spherical.makeSafe`

```ts
/**
 * Clamps phi to the range [EPSILON, π - EPSILON] to avoid coordinate
 * singularities at the poles (gimbal lock / division by zero).
 * r and theta are left unchanged.
 *
 * @param out the receiving Spherical
 * @param a the source Spherical
 * @returns out
 */
export function makeSafe(out: Spherical, a: Spherical): Spherical;
```

#### `spherical.toVec3`

```ts
/**
 * Converts spherical coordinates to a Cartesian Vec3 (Three.js / OpenGL convention):
 *   x = r * sin(phi) * sin(theta)
 *   y = r * cos(phi)
 *   z = r * sin(phi) * cos(theta)
 *
 * @param out the receiving Vec3
 * @param a the source Spherical
 * @returns out
 */
export function toVec3(out: Vec3, a: Spherical): Vec3;
```

#### `spherical.fromVec2`

```ts
/**
 * Converts a Vec2 (x, z) in the horizontal XZ plane to spherical coordinates.
 * The point is treated as lying on the equator (phi = π/2, y = 0).
 *
 * @param out the receiving Spherical
 * @param v the source Vec2 interpreted as (x, z)
 * @returns out
 */
export function fromVec2(out: Spherical, v: Vec2): Spherical;
```

#### `spherical.toVec2`

```ts
/**
 * Projects spherical coordinates onto the XZ plane, returning a Vec2 (x, z).
 * Equivalent to taking the horizontal footprint of the 3D point.
 *
 * @param out the receiving Vec2
 * @param a the source Spherical
 * @returns out
 */
export function toVec2(out: Vec2, a: Spherical): Vec2;
```

#### `spherical.equals`

```ts
/**
 * Returns true if two Spherical coordinates are approximately equal,
 * within an absolute/relative tolerance of EPSILON.
 *
 * @param a the first Spherical
 * @param b the second Spherical
 * @returns true if approximately equal
 */
export function equals(a: Spherical, b: Spherical): boolean;
```

#### `spherical.exactEquals`

```ts
/**
 * Returns true if two Spherical coordinates are exactly equal (===).
 *
 * @param a the first Spherical
 * @param b the second Spherical
 * @returns true if exactly equal
 */
export function exactEquals(a: Spherical, b: Spherical): boolean;
```

#### `spherical.str`

```ts
/**
 * Returns a string representation of a Spherical
 *
 * @param a the source Spherical
 * @returns string representation
 */
export function str(a: Spherical): string;
```

#### `spherical.angleTo`

```ts
/**
 * Returns the great-circle angle (in radians) between two spherical coordinates,
 * ignoring r. Equivalent to the central angle between the two directions on a
 * unit sphere.
 *
 * Uses the numerically stable haversine formula.
 *
 * @param a the first Spherical
 * @param b the second Spherical
 * @returns angle in radians in [0, π]
 */
export function angleTo(a: Spherical, b: Spherical): number;
```

**polar**

#### `polar.create`

```ts
/**
 * Creates a new polar coordinate at r=1, theta=0
 *
 * @returns a new Polar
 */
export function create(): Polar;
```

#### `polar.fromValues`

```ts
/**
 * Creates a new Polar initialized with the given values
 *
 * @param r radial distance
 * @param theta angle from +X, counter-clockwise (radians)
 * @returns a new Polar
 */
export function fromValues(r: number, theta: number): Polar;
```

#### `polar.clone`

```ts
/**
 * Creates a new Polar initialized with values from an existing one
 *
 * @param a the source Polar
 * @returns a new Polar
 */
export function clone(a: Polar): Polar;
```

#### `polar.copy`

```ts
/**
 * Copies values from one Polar to another
 *
 * @param out the receiving Polar
 * @param a the source Polar
 * @returns out
 */
export function copy(out: Polar, a: Polar): Polar;
```

#### `polar.set`

```ts
/**
 * Sets the components of a Polar
 *
 * @param out the receiving Polar
 * @param r radial distance
 * @param theta angle from +X, counter-clockwise (radians)
 * @returns out
 */
export function set(out: Polar, r: number, theta: number): Polar;
```

#### `polar.normalize`

```ts
/**
 * Sets r=1, preserving the angle. No-op on the angle if r is already zero.
 *
 * @param out the receiving Polar
 * @param a the source Polar
 * @returns out
 */
export function normalize(out: Polar, a: Polar): Polar;
```

#### `polar.scale`

```ts
/**
 * Scales the radial distance r by a scalar
 *
 * @param out the receiving Polar
 * @param a the source Polar
 * @param s scalar to multiply r by
 * @returns out
 */
export function scale(out: Polar, a: Polar, s: number): Polar;
```

#### `polar.rotate`

```ts
/**
 * Rotates a Polar by an angle (in radians), wrapping theta into (-pi, pi].
 *
 * @param out the receiving Polar
 * @param a the source Polar
 * @param rad the angle to add to theta
 * @returns out
 */
export function rotate(out: Polar, a: Polar, rad: number): Polar;
```

#### `polar.lerp`

```ts
/**
 * Linearly interpolates between two Polar coordinates, taking the shortest
 * angular path for theta.
 *
 * @param out the receiving Polar
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation factor in [0, 1]
 * @returns out
 */
export function lerp(out: Polar, a: Polar, b: Polar, t: number): Polar;
```

#### `polar.setFromVec2`

```ts
/**
 * Sets a Polar from Cartesian Vec2 coordinates:
 *   r     = sqrt(x^2 + y^2)
 *   theta = atan2(y, x)
 *
 * @param out the receiving Polar
 * @param v the source Vec2
 * @returns out
 */
export function setFromVec2(out: Polar, v: Vec2): Polar;
```

#### `polar.fromVec2`

```ts
/** @alias setFromVec2 */
export const fromVec2 = setFromVec2;
```

#### `polar.toVec2`

```ts
/**
 * Converts polar coordinates to a Cartesian Vec2:
 *   x = r * cos(theta)
 *   y = r * sin(theta)
 *
 * @param out the receiving Vec2
 * @param a the source Polar
 * @returns out
 */
export function toVec2(out: Vec2, a: Polar): Vec2;
```

#### `polar.angleTo`

```ts
/**
 * Returns the smallest angle (in radians) between two polar directions,
 * ignoring r. Range [0, pi].
 *
 * @param a the first Polar
 * @param b the second Polar
 * @returns angle in radians in [0, pi]
 */
export function angleTo(a: Polar, b: Polar): number;
```

#### `polar.distance`

```ts
/**
 * Returns the straight-line (chord) distance between two polar coordinates,
 * via the law of cosines.
 *
 * @param a the first Polar
 * @param b the second Polar
 * @returns the Euclidean distance between the two points
 */
export function distance(a: Polar, b: Polar): number;
```

#### `polar.equals`

```ts
/**
 * Returns true if two Polar coordinates are approximately equal,
 * within an absolute/relative tolerance of EPSILON.
 *
 * @param a the first Polar
 * @param b the second Polar
 * @returns true if approximately equal
 */
export function equals(a: Polar, b: Polar): boolean;
```

#### `polar.exactEquals`

```ts
/**
 * Returns true if two Polar coordinates are exactly equal (===).
 *
 * @param a the first Polar
 * @param b the second Polar
 * @returns true if exactly equal
 */
export function exactEquals(a: Polar, b: Polar): boolean;
```

#### `polar.str`

```ts
/**
 * Returns a string representation of a Polar
 *
 * @param a the source Polar
 * @returns string representation
 */
export function str(a: Polar): string;
```

### `math/shapes`

#### `Box2`

```ts
/** An axis-aligned box in 2D space, as [minX, minY, maxX, maxY] */
export type Box2 = [
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
];
```

#### `Box3`

```ts
/** A box in 3D space */
export type Box3 = [
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number
];
```

#### `OBB3`

```ts
/** An oriented bounding box in 3D space */
export type OBB3 = {
    center: Vec3;
    halfExtents: Vec3;
    rotation: Mat3;
};
```

#### `Plane3`

```ts
/**
 * A plane in 3D space
 * normal - a unit length vector defining the normal of the plane.
 * constant - the signed distance from the origin to the plane.
 */
export type Plane3 = {
    normal: Vec3;
    constant: number;
};
```

#### `Sphere`

```ts
/** A sphere in 3D space */
export type Sphere = {
    center: Vec3;
    radius: number;
};
```

#### `Circle`

```ts
/** A circle in 2D space */
export type Circle = {
    center: Vec2;
    radius: number;
};
```

**box2**

#### `box2.create`

```ts
/**
 * Create a new empty Box2 with "min" set to positive infinity and "max" set to negative infinity
 * @returns A new Box2
 */
export function create(): Box2;
```

#### `box2.clone`

```ts
/**
 * Clones a Box2
 * @param box - A Box2 to clone
 * @returns a clone of box
 */
export function clone(box: Box2): Box2;
```

#### `box2.copy`

```ts
/**
 * Copies a Box2 to another Box2
 * @param out the output Box2
 * @param box the input Box2
 * @returns the output Box2
 */
export function copy(out: Box2, box: Box2): Box2;
```

#### `box2.set`

```ts
/**
 * Sets the min and max values of a Box2
 * @param out - The output Box2
 * @param minX - The minimum X coordinate
 * @param minY - The minimum Y coordinate
 * @param maxX - The maximum X coordinate
 * @param maxY - The maximum Y coordinate
 * @returns The updated Box2
 */
export function set(out: Box2, minX: number, minY: number, maxX: number, maxY: number): Box2;
```

#### `box2.setFromVectors`

```ts
/**
 * Sets the min and max values of a Box2 from Vec2 vectors
 * @param out - The output Box2
 * @param min - The minimum corner
 * @param max - The maximum corner
 * @returns The updated Box2
 */
export function setFromVectors(out: Box2, min: Vec2, max: Vec2): Box2;
```

#### `box2.min`

```ts
/**
 * Extracts the minimum corner of a Box2
 * @param out - The output Vec2 for the minimum corner
 * @param box - The input Box2
 * @returns The minimum corner
 */
export function min(out: Vec2, box: Box2): Vec2;
```

#### `box2.max`

```ts
/**
 * Extracts the maximum corner of a Box2
 * @param out - The output Vec2 for the maximum corner
 * @param box - The input Box2
 * @returns The maximum corner
 */
export function max(out: Vec2, box: Box2): Vec2;
```

#### `box2.empty`

```ts
/**
 * Set a Box2 to empty (min to positive infinity, max to negative infinity)
 * @param out - The Box2 to make empty
 * @returns The emptied Box2
 */
export function empty(out: Box2): Box2;
```

#### `box2.exactEquals`

```ts
/**
 * Returns whether or not the boxes have exactly the same elements in the same position (when compared with ===)
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function exactEquals(a: Box2, b: Box2): boolean;
```

#### `box2.equals`

```ts
/**
 * Returns whether or not the boxes have approximately the same elements in the same position
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function equals(a: Box2, b: Box2): boolean;
```

#### `box2.setFromCenterAndSize`

```ts
/**
 * Sets the box from a center point and size
 * @param out - The output Box2
 * @param center - The center point
 * @param size - The size of the box
 * @returns The updated Box2
 */
export function setFromCenterAndSize(out: Box2, center: Vec2, size: Vec2): Box2;
```

#### `box2.expandByPoint`

```ts
/**
 * Expands a Box2 to include a point
 * @param out - The output Box2
 * @param box - The input Box2
 * @param point - The point to include
 * @returns The expanded Box2
 */
export function expandByPoint(out: Box2, box: Box2, point: Vec2): Box2;
```

#### `box2.expandByExtents`

```ts
/**
 * Widens a Box2 by a vector on both sides
 * Subtracts the vector from min and adds it to max
 * @param out - The output Box2
 * @param box - The input Box2
 * @param vector - The vector to expand by
 * @returns The expanded Box2
 */
export function expandByExtents(out: Box2, box: Box2, vector: Vec2): Box2;
```

#### `box2.expandByMargin`

```ts
/**
 * Expands a Box2 uniformly by a scalar margin on all sides
 * Subtracts the margin from min and adds it to max on each axis
 * @param out - The output Box2
 * @param box - The input Box2
 * @param margin - The uniform margin to expand by
 * @returns The expanded Box2
 */
export function expandByMargin(out: Box2, box: Box2, margin: number): Box2;
```

#### `box2.union`

```ts
/**
 * Computes the union of two bounding boxes
 * Returns a Box2 that encompasses both input boxes
 * @param out - The output Box2
 * @param boxA - The first Box2
 * @param boxB - The second Box2
 * @returns The union Box2
 */
export function union(out: Box2, boxA: Box2, boxB: Box2): Box2;
```

#### `box2.center`

```ts
/**
 * Calculate the center point of a bounding box
 * @param out - The output Vec2 for the center
 * @param box - The input Box2
 * @returns The center point
 */
export function center(out: Vec2, box: Box2): Vec2;
```

#### `box2.extents`

```ts
/**
 * Calculate the extents (half-size) of a bounding box
 * @param out - The output Vec2 for the extents
 * @param box - The input Box2
 * @returns The extents (distance from center to each edge)
 */
export function extents(out: Vec2, box: Box2): Vec2;
```

#### `box2.size`

```ts
/**
 * Calculate the size (dimensions) of a bounding box
 * @param out - The output Vec2 for the size
 * @param box - The input Box2
 * @returns The size (width, height)
 */
export function size(out: Vec2, box: Box2): Vec2;
```

#### `box2.area`

```ts
/**
 * Calculate the area of a bounding box
 * @param box - The input Box2
 * @returns The area (width * height)
 */
export function area(box: Box2): number;
```

#### `box2.scale`

```ts
/**
 * Scale a bounding box by a vector, handling non-uniform and negative scaling
 * @param out - The output Box2
 * @param box - The input Box2
 * @param scale - The scale to apply (as a Vec2)
 * @returns The scaled Box2
 */
export function scale(out: Box2, box: Box2, scale: Vec2): Box2;
```

#### `box2.containsPoint`

```ts
/**
 * Test if a point is contained within the bounding box
 * @param box - The bounding box
 * @param point - The point to test
 * @returns true if the point is inside or on the boundary of the box
 */
export function containsPoint(box: Box2, point: Vec2): boolean;
```

#### `box2.containsBox2`

```ts
/**
 * Test if one Box2 completely contains another Box2
 * @param container - The potentially containing Box2
 * @param contained - The Box2 that might be contained
 * @returns true if the container Box2 completely contains the contained Box2
 */
export function containsBox2(container: Box2, contained: Box2): boolean;
```

#### `box2.intersectsBox2`

```ts
/**
 * Check whether two bounding boxes intersect
 */
export function intersectsBox2(boxA: Box2, boxB: Box2): boolean;
```

#### `box2.intersectsCircle`

```ts
/**
 * Test intersection between an axis-aligned bounding box and a circle.
 */
export function intersectsCircle(box: Box2, circle: Circle): boolean;
```

**box3**

#### `box3.create`

```ts
/**
 * Create a new empty Box3 with "min" set to positive infinity and "max" set to negative infinity
 * @returns A new Box3
 */
export function create(): Box3;
```

#### `box3.clone`

```ts
/**
 * Clones a Box3
 * @param box - A Box3 to clone
 * @returns a clone of box
 */
export function clone(box: Box3): Box3;
```

#### `box3.copy`

```ts
/**
 * Copies a Box3 to another Box3
 * @param out the output Box3
 * @param box the input Box3
 * @returns the output Box3
 */
export function copy(out: Box3, box: Box3): Box3;
```

#### `box3.set`

```ts
/**
 * Sets the min and max values of a Box3
 * @param out - The output Box3
 * @param minX - The minimum X coordinate
 * @param minY - The minimum Y coordinate
 * @param minZ - The minimum Z coordinate
 * @param maxX - The maximum X coordinate
 * @param maxY - The maximum Y coordinate
 * @param maxZ - The maximum Z coordinate
 * @returns The updated Box3
 */
export function set(out: Box3, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): Box3;
```

#### `box3.setFromVectors`

```ts
/**
 * Sets the min and max values of a Box3 from Vec3 vectors
 * @param out - The output Box3
 * @param min - The minimum corner
 * @param max - The maximum corner
 * @returns The updated Box3
 */
export function setFromVectors(out: Box3, min: Vec3, max: Vec3): Box3;
```

#### `box3.min`

```ts
/**
 * Extracts the minimum corner of a Box3
 * @param out - The output Vec3 for the minimum corner
 * @param box - The input Box3
 * @returns The minimum corner
 */
export function min(out: Vec3, box: Box3): Vec3;
```

#### `box3.max`

```ts
/**
 * Extracts the maximum corner of a Box3
 * @param out - The output Vec3 for the maximum corner
 * @param box - The input Box3
 * @returns The maximum corner
 */
export function max(out: Vec3, box: Box3): Vec3;
```

#### `box3.empty`

```ts
/**
 * Set a Box3 to empty (min to positive infinity, max to negative infinity)
 * @param out - The Box3 to make empty
 * @returns The emptied Box3
 */
export function empty(out: Box3): Box3;
```

#### `box3.exactEquals`

```ts
/**
 * Returns whether or not the boxes have exactly the same elements in the same position (when compared with ===)
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function exactEquals(a: Box3, b: Box3): boolean;
```

#### `box3.equals`

```ts
/**
 * Returns whether or not the boxes have approximately the same elements in the same position
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function equals(a: Box3, b: Box3): boolean;
```

#### `box3.setFromCenterAndSize`

```ts
/**
 * Sets the box from a center point and size
 * @param out - The output Box3
 * @param center - The center point
 * @param size - The size of the box
 * @returns The updated Box3
 */
export function setFromCenterAndSize(out: Box3, center: Vec3, size: Vec3): Box3;
```

#### `box3.expandByPoint`

```ts
/**
 * Expands a Box3 to include a point
 * @param out - The output Box3
 * @param box - The input Box3
 * @param point - The point to include
 * @returns The expanded Box3
 */
export function expandByPoint(out: Box3, box: Box3, point: Vec3): Box3;
```

#### `box3.expandByExtents`

```ts
/**
 * Widens a Box3 by a vector on both sides
 * Subtracts the vector from min and adds it to max
 * @param out - The output Box3
 * @param box - The input Box3
 * @param vector - The vector to expand by
 * @returns The expanded Box3
 */
export function expandByExtents(out: Box3, box: Box3, vector: Vec3): Box3;
```

#### `box3.expandByMargin`

```ts
/**
 * Expands a Box3 uniformly by a scalar margin on all sides
 * Subtracts the margin from min and adds it to max on each axis
 * @param out - The output Box3
 * @param box - The input Box3
 * @param margin - The uniform margin to expand by
 * @returns The expanded Box3
 */
export function expandByMargin(out: Box3, box: Box3, margin: number): Box3;
```

#### `box3.union`

```ts
/**
 * Computes the union of two bounding boxes
 * Returns a Box3 that encompasses both input boxes
 * @param out - The output Box3
 * @param boxA - The first Box3
 * @param boxB - The second Box3
 * @returns The union Box3
 */
export function union(out: Box3, boxA: Box3, boxB: Box3): Box3;
```

#### `box3.center`

```ts
/**
 * Calculate the center point of a bounding box
 * @param out - The output Vec3 for the center
 * @param box - The input Box3
 * @returns The center point
 */
export function center(out: Vec3, box: Box3): Vec3;
```

#### `box3.extents`

```ts
/**
 * Calculate the extents (half-size) of a bounding box
 * @param out - The output Vec3 for the extents
 * @param box - The input Box3
 * @returns The extents (distance from center to each face)
 */
export function extents(out: Vec3, box: Box3): Vec3;
```

#### `box3.size`

```ts
/**
 * Calculate the size (dimensions) of a bounding box
 * @param out - The output Vec3 for the size
 * @param box - The input Box3
 * @returns The size (width, height, depth)
 */
export function size(out: Vec3, box: Box3): Vec3;
```

#### `box3.surfaceArea`

```ts
/**
 * Calculate the surface area of a bounding box
 * @param box - The input Box3
 * @returns The surface area
 */
export function surfaceArea(box: Box3): number;
```

#### `box3.scale`

```ts
/**
 * Scale a bounding box by a vector, handling non-uniform and negative scaling
 * @param out - The output Box3
 * @param box - The input Box3
 * @param scale - The scale to apply (as a Vec3)
 * @returns The scaled Box3
 */
export function scale(out: Box3, box: Box3, scale: Vec3): Box3;
```

#### `box3.transformMat4`

```ts
/**
 * Transform a bounding box by a 4x4 matrix.
 * Uses Arvo's trick — transform the center, build new half-extents from
 * |M| · extents — which is ~4× fewer ops than transforming all 8 corners.
 * Reference: Jim Arvo, "Transforming Axis-Aligned Bounding Boxes",
 * Graphics Gems I (1990).
 * https://github.com/erich666/GraphicsGems/blob/master/gems/TransBox.c
 * Assumes mat is affine (no perspective), which is always true for AABB
 * transforms in practice.
 * Safe under aliasing (out and box may be the same array): all six box
 * components are read into locals before out is written.
 * @param out - The output Box3
 * @param box - The input Box3
 * @param mat - The 4x4 transformation matrix
 * @returns The transformed Box3
 */
export function transformMat4(out: Box3, box: Box3, mat: Mat4): Box3;
```

#### `box3.containsPoint`

```ts
/**
 * Test if a point is contained within the bounding box
 * @param box - The bounding box
 * @param point - The point to test
 * @returns true if the point is inside or on the boundary of the box
 */
export function containsPoint(box: Box3, point: Vec3): boolean;
```

#### `box3.containsBox3`

```ts
/**
 * Test if one Box3 completely contains another Box3
 * @param container - The potentially containing Box3
 * @param contained - The Box3 that might be contained
 * @returns true if the container Box3 completely contains the contained Box3
 */
export function containsBox3(container: Box3, contained: Box3): boolean;
```

#### `box3.intersectsBox3`

```ts
/**
 * Check whether two bounding boxes intersect
 */
export function intersectsBox3(boxA: Box3, boxB: Box3): boolean;
```

#### `box3.intersectsTriangle3`

```ts
/**
 * Test whether an axis-aligned bounding box intersects a triangle, via the
 * separating-axis theorem over 13 axes: the 3 box face normals, the triangle
 * face normal, and the 9 box-axis × triangle-edge cross products.
 *
 * Fully inlined with local scalars — no scratch arrays or per-call allocations.
 * Axes are tested cheapest-first (box faces, i.e. the triangle-vs-box AABB
 * reject) so the common non-overlapping case exits before any edge or cross
 * product is computed. On each edge-cross axis two of the three vertices project
 * to the same value (the axis is perpendicular to that edge), so only two
 * projections are needed. An all-zero cross axis (edge parallel to a box axis)
 * collapses every projection and the radius to 0, passing automatically.
 */
export function intersectsTriangle3(box: Box3, a: Vec3, b: Vec3, c: Vec3): boolean;
```

#### `box3.intersectsSphere`

```ts
/**
 * Test intersection between axis-aligned bounding box and a sphere.
 */
export function intersectsSphere(box: Box3, sphere: Sphere): boolean;
```

#### `box3.intersectsPlane3`

```ts
/**
 * Test intersection between axis-aligned bounding box and plane.
 */
export function intersectsPlane3(box: Box3, plane: Plane3): boolean;
```

**obb3**

#### `obb3.create`

```ts
export function create(): OBB3;
```

#### `obb3.clone`

```ts
export function clone(a: OBB3): OBB3;
```

#### `obb3.copy`

```ts
export function copy(out: OBB3, a: OBB3): OBB3;
```

#### `obb3.set`

```ts
/**
 * Sets an OBB from center, half extents, and a rotation matrix.
 * @param out the OBB to store the result
 * @param center the center of the OBB
 * @param halfExtents the half extents of the OBB
 * @param rotation the Mat3 rotation matrix
 * @returns the OBB with the given center, half extents, and rotation
 */
export function set(out: OBB3, center: Vec3, halfExtents: Vec3, rotation: Mat3): OBB3;
```

#### `obb3.setFromCenterHalfExtentsQuaternion`

```ts
/**
 * Sets an OBB from center, half extents, and a quaternion.
 * Convenience helper for users who store orientation as a quaternion.
 *
 * @param out - The OBB to store the result
 * @param center - The center of the OBB
 * @param halfExtents - The half extents of the OBB
 * @param q - The quaternion representing the OBB's orientation
 * @returns out
 */
export function setFromCenterHalfExtentsQuaternion(out: OBB3, center: Vec3, halfExtents: Vec3, q: Quat): OBB3;
```

#### `obb3.setFromBox3`

```ts
/**
 * Creates an OBB from an axis-aligned bounding box (AABB).
 * The resulting OBB will have the same center and extents as the AABB,
 * with no rotation (identity orientation).
 *
 * @param out - The OBB to store the result
 * @param aabb - The AABB (min and max corners)
 * @returns out
 */
export function setFromBox3(out: OBB3, aabb: Box3): OBB3;
```

#### `obb3.containsPoint`

```ts
/**
 * Tests whether a point is contained within an OBB.
 *
 * @param obb - The OBB to test
 * @param point - The point to test
 * @returns true if the point is inside the OBB
 */
export function containsPoint(obb: OBB3, point: Vec3): boolean;
```

#### `obb3.clampPoint`

```ts
/**
 * Clamps a point to the surface or interior of an OBB.
 * Reference: Closest Point on OBB to Point in Real-Time Collision Detection
 * by Christer Ericson (chapter 5.1.4)
 *
 * @param out - The clamped point result
 * @param obb - The OBB
 * @param point - The point to clamp
 * @returns out
 */
export function clampPoint(out: Vec3, obb: OBB3, point: Vec3): Vec3;
```

#### `obb3.intersectsOBB3`

```ts
/**
 * Tests whether an OBB intersects with another OBB using the Separating Axis Theorem.
 * Reference: OBB-OBB Intersection in Real-Time Collision Detection
 * by Christer Ericson (chapter 4.4.1)
 *
 * A cross-product axis A_i x B_j degenerates to ~zero when those edges are near
 * parallel, which makes its (un-normalised) separation test numerically unstable.
 * Such an axis carries no separation information not already covered by the face
 * axes, so it is skipped when `1 - R[i][j]^2` (its squared length, = sin^2 of the
 * angle between the edges) falls below `epsilon`. This is scale-invariant — R is a
 * matrix of cosines — unlike fudging the projected radii.
 *
 * @param a - The first OBB
 * @param b - The second OBB
 * @param epsilon - Squared-sine threshold below which near-parallel edge axes are skipped
 * @returns true if the OBBs intersect
 */
export function intersectsOBB3(a: OBB3, b: OBB3, epsilon = EPSILON): boolean;
```

#### `obb3.intersectsBox3`

```ts
/**
 * Tests whether an OBB intersects with an AABB.
 *
 * Specialised form of {@link intersectsOBB3}: the AABB's axes are the world axes, so
 * the axis dot-product matrix R is just the OBB's rotation (no 9 dot-products), and the
 * AABB's centre/half-extents come straight from its min/max. The near-parallel edge
 * skip works identically — here it fires when an OBB axis aligns with a world axis.
 *
 * @param obb - The OBB
 * @param aabb - The AABB (axis-aligned bounding box)
 * @returns true if they intersect
 */
export function intersectsBox3(obb: OBB3, aabb: Box3): boolean;
```

#### `obb3.applyMatrix4`

```ts
export function applyMatrix4(out: OBB3, obb: OBB3, matrix: Mat4): OBB3;
```

**plane3**

#### `plane3.create`

```ts
/**
 * Creates a new plane with normal (0, 1, 0) and constant 0
 * @returns A new plane
 */
export function create(): Plane3;
```

#### `plane3.fromNormalAndConstant`

```ts
/**
 * Creates a plane from a normal and constant
 * @param out - The output plane
 * @param normal - The plane normal (should be unit length)
 * @param constant - The signed distance from origin
 * @returns The output plane
 */
export function fromNormalAndConstant(out: Plane3, normal: Vec3, constant: number): Plane3;
```

#### `plane3.fromNormalAndPoint`

```ts
/**
 * Creates a plane from a normal and a point on the plane
 * @param out - The output plane
 * @param normal - The plane normal (should be unit length)
 * @param point - A point on the plane
 * @returns The output plane
 */
export function fromNormalAndPoint(out: Plane3, normal: Vec3, point: Vec3): Plane3;
```

#### `plane3.fromCoplanarPoints`

```ts
/**
 * Creates a plane from three coplanar points
 * @param out - The output plane
 * @param a - First point
 * @param b - Second point
 * @param c - Third point
 * @returns The output plane
 */
export function fromCoplanarPoints(out: Plane3, a: Vec3, b: Vec3, c: Vec3): Plane3;
```

#### `plane3.clone`

```ts
/**
 * Clones a plane
 * @param plane - The plane to clone
 * @returns A new plane
 */
export function clone(plane: Plane3): Plane3;
```

#### `plane3.copy`

```ts
/**
 * Copies one plane to another
 * @param out - The output plane
 * @param plane - The source plane
 * @returns The output plane
 */
export function copy(out: Plane3, plane: Plane3): Plane3;
```

#### `plane3.normalize`

```ts
/**
 * Normalizes a plane (ensures the normal vector is unit length)
 * @param out - The output plane
 * @param plane - The input plane
 * @returns The normalized plane
 */
export function normalize(out: Plane3, plane: Plane3): Plane3;
```

#### `plane3.negate`

```ts
/**
 * Negates a plane (flips the normal and constant)
 * @param out - The output plane
 * @param plane - The input plane
 * @returns The negated plane
 */
export function negate(out: Plane3, plane: Plane3): Plane3;
```

#### `plane3.offset`

```ts
/**
 * Offsets a plane by a distance along its normal
 * @param out - The output plane
 * @param plane - The input plane
 * @param distance - The distance to offset (positive = in direction of normal)
 * @returns The offset plane
 */
export function offset(out: Plane3, plane: Plane3, distance: number): Plane3;
```

#### `plane3.distanceToPoint`

```ts
/**
 * Calculates the signed distance from a point to the plane
 * @param plane - The plane
 * @param point - The point
 * @returns The signed distance (positive = in direction of normal)
 */
export function distanceToPoint(plane: Plane3, point: Vec3): number;
```

#### `plane3.projectPoint`

```ts
/**
 * Projects a point onto the plane
 * @param out - The output point
 * @param plane - The plane
 * @param point - The point to project
 * @returns The projected point
 */
export function projectPoint(out: Vec3, plane: Plane3, point: Vec3): Vec3;
```

#### `plane3.transform`

```ts
/**
 * Transforms a plane by a 4x4 matrix
 * @param out - The output plane
 * @param plane - The plane to transform
 * @param matrix - The transformation matrix
 * @returns The transformed plane
 */
export function transform(out: Plane3, plane: Plane3, matrix: Mat4): Plane3;
```

#### `plane3.intersectsSphere`

```ts
/**
 * Tests if a sphere intersects the plane
 * @param plane - The plane
 * @param sphere - The sphere
 * @returns True if they intersect
 */
export function intersectsSphere(plane: Plane3, sphere: Sphere): boolean;
```

#### `plane3.exactEquals`

```ts
/**
 * Tests if two planes are exactly equal
 * @param a - First plane
 * @param b - Second plane
 * @returns True if planes are exactly equal
 */
export function exactEquals(a: Plane3, b: Plane3): boolean;
```

#### `plane3.intersect`

```ts
/**
 * Finds the intersection point of three planes
 * @param out - The output point where the three planes intersect
 * @param p1 - First plane
 * @param p2 - Second plane
 * @param p3 - Third plane
 * @returns True if intersection exists, false if planes are degenerate or parallel
 */
export function intersect(out: Vec3, p1: Plane3, p2: Plane3, p3: Plane3): boolean;
```

#### `plane3.equals`

```ts
/**
 * Tests if two planes are equal
 * @param a - First plane
 * @param b - Second plane
 * @returns True if planes are equal
 */
export function equals(a: Plane3, b: Plane3): boolean;
```

**sphere**

#### `sphere.create`

```ts
/**
 * Creates a new sphere with a default center 0,0,0 and radius 1
 * @returns A new sphere.
 */
export function create(): Sphere;
```

#### `sphere.containsPoint`

```ts
/**
 * Returns true if a point lies inside (or on the surface of) the sphere.
 *
 * @param sphere the sphere
 * @param point the point to test
 * @returns true if the point is within the sphere's radius
 */
export function containsPoint(sphere: Sphere, point: Vec3): boolean;
```

**circle**

#### `circle.create`

```ts
export function create(): Circle;
```

**segment2**

#### `segment2.closestPoint`

```ts
/**
 * Calculates the closest point on a line segment to a given point
 * @param out Output parameter for the closest point
 * @param point The point
 * @param a First endpoint of the segment
 * @param b Second endpoint of the segment
 */
export function closestPoint(out: Vec2, point: Vec2, a: Vec2, b: Vec2): Vec2;
```

**triangle3**

#### `triangle3.bounds`

```ts
/**
 * Computes the axis-aligned bounding box of a triangle defined by three vertices.
 * @param out the output box to store the result.
 * @param a the first vertex of the triangle.
 * @param b the second vertex of the triangle.
 * @param c the third vertex of the triangle.
 * @returns the output box containing the axis-aligned bounding box of the triangle.
 */
export function bounds(out: Box3, a: Vec3, b: Vec3, c: Vec3): Box3;
```

#### `triangle3.normal`

```ts
/**
 * Computes the normal vector of a triangle defined by three vertices.
 * @param out the output vector to store the result.
 * @param a the first vertex of the triangle.
 * @param b the second vertex of the triangle.
 * @param c the third vertex of the triangle.
 * @returns the output vector containing the normal of the triangle.
 */
export function normal(out: Vec3, a: Vec3, b: Vec3, c: Vec3): Vec3;
```

#### `triangle3.centroid`

```ts
/**
 * Computes the centroid of a triangle defined by three vertices.
 * @param out the output vector to store the result.
 * @param a the first vertex of the triangle.
 * @param b the second vertex of the triangle.
 * @param c the third vertex of the triangle.
 * @returns the output vector containing the centroid of the triangle.
 */
export function centroid(out: Vec3, a: Vec3, b: Vec3, c: Vec3): Vec3;
```

**raycast3**

#### `raycast3.IntersectsTriangleResult`

```ts
/**
 * Result of a ray-triangle intersection test
 * @see createIntersectsTriangleResult
 * @see intersectsTriangle
 */
export type IntersectsTriangleResult = {
    fraction: number;
    hit: boolean;
    frontFacing: boolean;
};
```

#### `raycast3.createIntersectsTriangleResult`

```ts
/**
 * Creates a new IntersectsTriangleResult with default values.
 * @returns A new IntersectsTriangleResult.
 */
export function createIntersectsTriangleResult(): IntersectsTriangleResult;
```

#### `raycast3.intersectsTriangle`

```ts
/**
 * Ray-triangle intersection test.
 * Based on https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
 *
 * @param out output object to store result (hit boolean, fraction, frontFacing)
 * @param origin ray origin
 * @param direction ray direction
 * @param length ray length
 * @param a first vertex of triangle
 * @param b second vertex of triangle
 * @param c third vertex of triangle
 * @param backfaceCulling if true, backfaces will not be considered hits
 */
export function intersectsTriangle(out: IntersectsTriangleResult, origin: Vec3, direction: Vec3, length: number, a: Vec3, b: Vec3, c: Vec3, backfaceCulling: boolean): void;
```

#### `raycast3.intersectsBox3`

```ts
/**
 * Test if a ray intersects an axis-aligned bounding box.
 * Uses slab-based algorithm that handles parallel rays correctly.
 *
 * @param origin ray origin
 * @param direction ray direction
 * @param length ray length
 * @param aabb AABB to test against
 * @returns true if ray intersects the AABB, false otherwise
 */
export function intersectsBox3(origin: Vec3, direction: Vec3, length: number, aabb: Box3): boolean;
```

### `math/geometry`

#### `circumcircle`

```ts
/**
 * Calculates the circumcircle of three points and stores the center in the output parameter.
 * @param out The circle to store the result in
 * @param triangle The triangle defined by three points
 * @returns
 */
export function circumcircle(out: Circle, a: Vec2, b: Vec2, c: Vec2): Circle;
```

#### `quickhull2`

```ts
/**
 * Computes the convex hull of a set of 2D points using the QuickHull algorithm.
 * The hull is returned as an array of indices in counter-clockwise order.
 *
 * Implementation of pseudocode from: https://en.wikipedia.org/wiki/Quickhull
 *
 * @param points flat array of 2D points: [x0, y0, x1, y1, ...]
 * @returns indices of hull vertices in ccw order
 */
export function quickhull2(points: number[]): number[];
```

#### `quickhull3`

```ts
/**
 * Computes the convex hull of a set of 3D points using an incremental QuickHull algorithm.
 *
 * @param points An array of numbers representing the 3D points (x1, y1, z1, x2, y2, z2, ...)
 * @returns An array of indices representing the triangles of the convex hull (i1, j1, k1, i2, j2, k2, ...).
 */
export function quickhull3(points: number[]): number[];
```

### `math/time`

#### `Spring`

```ts
// Internal: the damped-harmonic-oscillator solver shared by every spring
// dimension. `coefficients` recomputes the step's 2×2 linear map into `coef`
// (module scratch, zero-allocation); each `spring*` namespace then applies those
// four coefficients per component.
/**
 * Spring state: a `value` and its `velocity`, of matching rank
 * (`number`, `Vec2`, `Vec3`, or `Vec4`). Allocate once, mutate each frame.
 */
export type Spring<T> = {
    value: T;
    velocity: T;
};
```

**easing**

#### `easing.exp`

```ts
export function exp(t: number);
```

#### `easing.linear`

```ts
export function linear(t: number);
```

#### `easing.sineIn`

```ts
export function sineIn(x: number);
```

#### `easing.sineOut`

```ts
export function sineOut(x: number);
```

#### `easing.sineInOut`

```ts
export function sineInOut(x: number);
```

#### `easing.cubicIn`

```ts
export function cubicIn(x: number);
```

#### `easing.cubicOut`

```ts
export function cubicOut(x: number);
```

#### `easing.cubicInOut`

```ts
export function cubicInOut(x: number);
```

#### `easing.quintIn`

```ts
export function quintIn(x: number);
```

#### `easing.quintOut`

```ts
export function quintOut(x: number);
```

#### `easing.quintInOut`

```ts
export function quintInOut(x: number);
```

#### `easing.circIn`

```ts
export function circIn(x: number);
```

#### `easing.circOut`

```ts
export function circOut(x: number);
```

#### `easing.circInOut`

```ts
export function circInOut(x: number);
```

#### `easing.quartIn`

```ts
export function quartIn(t: number);
```

#### `easing.quartOut`

```ts
export function quartOut(t: number);
```

#### `easing.quartInOut`

```ts
export function quartInOut(t: number);
```

#### `easing.expoIn`

```ts
export function expoIn(x: number);
```

#### `easing.expoOut`

```ts
export function expoOut(x: number);
```

#### `easing.expoInOut`

```ts
export function expoInOut(x: number);
```

#### `easing.rsqw`

```ts
export function rsqw(t: number, delta = 0.01, a = 1, f = 1 / (2 * Math.PI));
```

**spring**

#### `spring.create`

```ts
/** Creates a scalar spring at `value`, at rest. */
export function create(value = 0): Spring<number>;
```

#### `spring.update`

```ts
/**
 * Springs `state.value` toward `target`, mutating `state` in place. Returns it.
 *
 * @param state spring state, mutated in place
 * @param target goal value
 * @param smoothTime approximate time to reach the target; smaller is faster
 * @param dampingRatio 1 = critically damped (no overshoot), <1 bouncy, >1 sluggish
 * @param delta frame delta, for refresh-rate independence
 * @returns state
 */
export function update(state: Spring<number>, target: number, smoothTime: number, dampingRatio: number, delta: number): Spring<number>;
```

#### `spring.damp`

```ts
/**
 * Critically-damped {@link update} (dampingRatio = 1): moves toward `target` as
 * fast as possible without overshooting.
 */
export function damp(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number>;
```

#### `spring.dampAngle`

```ts
/**
 * Like {@link damp}, but takes the shortest angular path to `target` (radians),
 * wrapping across the ±π seam rather than unwinding the long way around.
 */
export function dampAngle(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number>;
```

#### `spring.fromResponse`

```ts
/**
 * Converts a SwiftUI-style `response` — the spring's natural period, in seconds
 * — to the `smoothTime` that `update`/`damp` consume. `dampingRatio` is the
 * orthogonal second dial and is passed to `update` unchanged.
 *
 * Yields the same stiffness/damping as SwiftUI's `Spring(response:dampingFraction:)`:
 *
 * ```ts
 * spring3.update(state, target, spring.fromResponse(0.5), 0.3, delta); // bouncy, ~0.5s period
 * ```
 */
export function fromResponse(response: number): number;
```

**spring2**

#### `spring2.create`

```ts
/** Creates a Vec2 spring at `value` (copied), at rest. */
export function create(value: Vec2 = [0, 0]): Spring<Vec2>;
```

#### `spring2.update`

```ts
/**
 * Springs `state.value` toward `target`, mutating `state` in place. Returns it.
 * @param dampingRatio 1 = critically damped (no overshoot), <1 bouncy, >1 sluggish
 */
export function update(state: Spring<Vec2>, target: Vec2, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec2>;
```

#### `spring2.damp`

```ts
/** Critically-damped Vec2 spring (dampingRatio = 1). See {@link update}. */
export function damp(state: Spring<Vec2>, target: Vec2, smoothTime: number, delta: number): Spring<Vec2>;
```

**spring3**

#### `spring3.create`

```ts
/** Creates a Vec3 spring at `value` (copied), at rest. */
export function create(value: Vec3 = [0, 0, 0]): Spring<Vec3>;
```

#### `spring3.update`

```ts
/**
 * Springs `state.value` toward `target`, mutating `state` in place. Returns it.
 * @param dampingRatio 1 = critically damped (no overshoot), <1 bouncy, >1 sluggish
 */
export function update(state: Spring<Vec3>, target: Vec3, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec3>;
```

#### `spring3.damp`

```ts
/** Critically-damped Vec3 spring (dampingRatio = 1). See {@link update}. */
export function damp(state: Spring<Vec3>, target: Vec3, smoothTime: number, delta: number): Spring<Vec3>;
```

**spring4**

#### `spring4.create`

```ts
/** Creates a Vec4 spring at `value` (copied), at rest. */
export function create(value: Vec4 = [0, 0, 0, 0]): Spring<Vec4>;
```

#### `spring4.update`

```ts
/**
 * Springs `state.value` toward `target`, mutating `state` in place. Returns it.
 * @param dampingRatio 1 = critically damped (no overshoot), <1 bouncy, >1 sluggish
 */
export function update(state: Spring<Vec4>, target: Vec4, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec4>;
```

#### `spring4.damp`

```ts
/** Critically-damped Vec4 spring (dampingRatio = 1). See {@link update}. */
export function damp(state: Spring<Vec4>, target: Vec4, smoothTime: number, delta: number): Spring<Vec4>;
```

### `math/random`

#### `Isaac32`

```ts
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
```

#### `Isaac64`

```ts
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
```

#### `Mulberry32`

```ts
/**
 * State of a Mulberry32 PRNG: a single 32-bit accumulator that {@link sample}
 * advances on each call. Create one with {@link create}.
 *
 * Unlike a closure-based generator, the state is a plain object — so it can be
 * inspected, cloned (to fork a sequence), or serialised.
 */
export type Mulberry32 = {
    a: number;
};
```

#### `RandomGenerator`

```ts
/** A function that returns a random number in the range [0, 1). */
export type RandomGenerator = () => number;
```

**isaac32**

#### `isaac32.create`

```ts
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
export function create(seed = 0): Isaac32;
```

#### `isaac32.next`

```ts
/**
 * Advances `state` and returns the next raw 32-bit unsigned integer.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns an integer in the range [0, 2^32)
 */
export function next(state: Isaac32): number;
```

#### `isaac32.sample`

```ts
/**
 * Advances `state` and returns the next number in the range [0, 1).
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns a number in the range [0, 1)
 */
export function sample(state: Isaac32): number;
```

#### `isaac32.seed`

```ts
/**
 * Generates a random 32-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): number;
```

**isaac64**

#### `isaac64.create`

```ts
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
export function create(seed: bigint = 0n): Isaac64;
```

#### `isaac64.next`

```ts
/**
 * Advances `state` and returns the next raw 64-bit unsigned integer.
 *
 * This reassembles a `bigint` from the two lanes, so it allocates; for a value
 * in [0, 1) prefer {@link sample}, which stays in `number` arithmetic.
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns an integer in the range [0, 2^64)
 */
export function next(state: Isaac64): bigint;
```

#### `isaac64.sample`

```ts
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
export function sample(state: Isaac64): number;
```

#### `isaac64.seed`

```ts
/**
 * Generates a random 64-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): bigint;
```

**mulberry32**

#### `mulberry32.create`

```ts
/**
 * Creates Mulberry32 PRNG state seeded with `seed`.
 *
 * Mulberry32 is a simple, fast, and effective PRNG that passes statistical tests
 * and has good distribution properties.
 *
 * @param seed the seed value (32-bit integer)
 * @returns state to pass to {@link sample}
 */
export function create(seed: number): Mulberry32;
```

#### `mulberry32.next`

```ts
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
export function next(state: Mulberry32): number;
```

#### `mulberry32.sample`

```ts
/**
 * Advances `state` and returns the next number in the range [0, 1).
 *
 * @param state PRNG state created with {@link create}, mutated in place
 * @returns a number in the range [0, 1)
 */
export function sample(state: Mulberry32): number;
```

#### `mulberry32.seed`

```ts
/**
 * Generates a random 32-bit unsigned integer seed, suitable for use with
 * {@link create}.
 */
export function seed(): number;
```

**random**

#### `random.float`

```ts
/**
 * Returns a random float in the range [min, max).
 * @param random the random generator to use
 * @param min the minimum value (inclusive)
 * @param max the maximum value (exclusive)
 */
export function float(random: RandomGenerator, min: number, max: number): number;
```

#### `random.int`

```ts
/**
 * Returns a random integer in the range [min, max] (inclusive).
 * @param random the random generator to use
 * @param min the minimum value (inclusive)
 * @param max the maximum value (inclusive)
 */
export function int(random: RandomGenerator, min: number, max: number): number;
```

#### `random.bool`

```ts
/**
 * Returns a random boolean.
 * @param random the random generator to use
 * @param chance the probability of returning true, in the range [0, 1]. Defaults to 0.5.
 */
export function bool(random: RandomGenerator, chance = 0.5): boolean;
```

#### `random.sign`

```ts
/**
 * Returns a random sign, either 1 or -1.
 * @param random the random generator to use
 * @param plusChance the probability of returning 1, in the range [0, 1]. Defaults to 0.5.
 */
export function sign(random: RandomGenerator, plusChance = 0.5): number;
```

#### `random.choice`

```ts
/**
 * Returns a random item from an array.
 * @param random the random generator to use
 * @param items the array to choose from
 * @throws if the array is empty
 */
export function choice<T>(random: RandomGenerator, items: T[]): T;
```

#### `random.vec2`

```ts
/**
 * Writes a random unit-length Vec2 into out.
 * @param out the receiving vector
 * @param random the random generator to use
 * @returns out
 */
export function vec2(out: Vec2, random: RandomGenerator): Vec2;
```

#### `random.vec3`

```ts
/**
 * Writes a random unit-length Vec3 into out.
 * @param out the receiving vector
 * @param random the random generator to use
 * @returns out
 */
export function vec3(out: Vec3, random: RandomGenerator): Vec3;
```

#### `random.vec4`

```ts
/**
 * Writes a random unit-length Vec4 into out.
 * @param out the receiving vector
 * @param random the random generator to use
 * @returns out
 */
export function vec4(out: Vec4, random: RandomGenerator): Vec4;
```

#### `random.quat`

```ts
/**
 * Writes a random unit quaternion into out.
 * @param out the receiving quaternion
 * @param random the random generator to use
 * @returns out
 */
export function quat(out: Quat, random: RandomGenerator): Quat;
```

### `math/noise`

#### `FractalOptions`

```ts
// Fractal combinators: helpers that layer octaves of ANY base noise source into
// the richer fields used for terrain, clouds, and marble. They are generic - the
// `sample` callback receives the current octave's frequency and returns the base
// noise at your coordinates scaled by it, so the same helper works with any
// generator at any dimension:
//
//   fbm((f) => simplex2d.sample(gen, x * f, y * f), { octaves: 5 })
//   fbm((f) => simplex3d.sample(gen, x * f, y * f, z * f))
/** Options for the fractal (multi-octave) noise helpers. */
export type FractalOptions = {
    /** number of octaves to sum (default 4) */
    octaves?: number;
    /** frequency of the first octave (default 1) */
    frequency?: number;
    /** frequency multiplier between octaves (default 2) */
    lacunarity?: number;
    /** amplitude multiplier between octaves (default 0.5) */
    gain?: number;
};
```

#### `fbm`

```ts
/**
 * Fractional Brownian motion: sums octaves of a noise source at increasing
 * frequency and decreasing amplitude - the workhorse for natural-looking
 * heightmaps and clouds. Given a source in [-1, 1], returns a value in [-1, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized noise value
 */
export function fbm(sample: (frequency: number) => number, options?: FractalOptions): number;
```

#### `ridged`

```ts
/**
 * Ridged multifractal: like {@link fbm}, but each octave is folded to
 * `1 - abs(noise)`, filling the field with sharp ridges - the classic mountain
 * range / canyon look. Given a source in [-1, 1], returns a value in [0, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized ridged value
 */
export function ridged(sample: (frequency: number) => number, options?: FractalOptions): number;
```

#### `billow`

```ts
/**
 * Billow noise: like {@link fbm}, but each octave is folded to `2*abs(noise) - 1`,
 * giving puffy, rounded, cloud-like lobes. Given a source in [-1, 1], returns a
 * value in [-1, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized billow value
 */
export function billow(sample: (frequency: number) => number, options?: FractalOptions): number;
```

#### `domainWarp2`

```ts
/**
 * Domain warping (2D): offsets a point by a noise-derived vector, so feeding the
 * result back into a noise source bends and swirls it - marble, meandering
 * terrain, organic distortion. The two axes sample the warp noise at
 * decorrelated offsets so they don't move in lockstep.
 *
 * @param out the receiving Vec2 (the warped point)
 * @param sample the warp noise source, sampled at (x, y)
 * @param x x coordinate
 * @param y y coordinate
 * @param amount displacement scale (default 1)
 * @returns out
 */
export function domainWarp2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, amount = 1): Vec2;
```

#### `domainWarp3`

```ts
/**
 * Domain warping (3D): offsets a point by a noise-derived vector so a noise
 * source sampled at the result is bent and swirled. See {@link domainWarp2}.
 *
 * @param out the receiving Vec3 (the warped point)
 * @param sample the warp noise source, sampled at (x, y, z)
 * @param x x coordinate
 * @param y y coordinate
 * @param z z coordinate
 * @param amount displacement scale (default 1)
 * @returns out
 */
export function domainWarp3(out: Vec3, sample: (x: number, y: number, z: number) => number, x: number, y: number, z: number, amount = 1): Vec3;
```

#### `curl2`

```ts
/**
 * Curl of a 2D scalar noise potential - a divergence-free (incompressible) flow
 * field. Particles advected through it swirl like a fluid and never converge to
 * sinks or fly apart, which is why it's the cheap go-to for procedural smoke /
 * flow. Given a scalar potential psi(x, y), the flow is (d psi/dy, -d psi/dx),
 * with the derivatives taken by central differences of step `eps`.
 *
 * @param out the receiving Vec2 (the flow velocity)
 * @param sample the scalar potential noise, sampled at (x, y)
 * @param x x coordinate
 * @param y y coordinate
 * @param eps finite-difference step (default 1e-4)
 * @returns out
 */
export function curl2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, eps = 1e-4): Vec2;
```

#### `curl3`

```ts
/**
 * Curl of a 3D noise vector potential - a divergence-free 3D flow field for
 * volumetric smoke / fluid motion. The three potential components reuse a single
 * `sample` at large, decorrelating offsets, and the flow is their curl,
 * `∇ × psi`, with derivatives taken by central differences of step `eps`.
 *
 * @param out the receiving Vec3 (the flow velocity)
 * @param sample the scalar potential noise, sampled at (x, y, z)
 * @param x x coordinate
 * @param y y coordinate
 * @param z z coordinate
 * @param eps finite-difference step (default 1e-4)
 * @returns out
 */
export function curl3(out: Vec3, sample: (x: number, y: number, z: number) => number, x: number, y: number, z: number, eps = 1e-4): Vec3;
```

#### `Permutation`

```ts
// Adapated from https://github.com/josephg/noisejs
//
// ```
// A speed-improved perlin and simplex noise algorithms for 2D.
//
// Based on example code by Stefan Gustavson (stegu@itn.liu.se).
// Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
// Better rank ordering method by Stefan Gustavson in 2012.
// Converted to Javascript by Joseph Gentle.
//
// Version 2012-03-09
//
// This code was placed in the public domain by its original author,
// Stefan Gustavson. You may use it as you see fit, but
// attribution is appreciated.
// ```
/**
 * Seeded permutation and gradient tables that back a noise generator.
 *
 * All noise variants (simplex/perlin, 2D/3D/4D) share this same table shape, so
 * each generator type is a structural alias of this. `gradP` holds the 3D
 * gradients (used by 2D and 3D noise); `gradP4` holds the 4D gradients.
 */
export type Permutation = {
    perm: number[];
    gradP: Vec3[];
    gradP4: Vec4[];
};
```

**perlin2d**

#### `perlin2d.Perlin2DGenerator`

```ts
/** A seeded 2D Perlin noise generator. Create one with {@link create}. */
export type Perlin2DGenerator = Permutation;
```

#### `perlin2d.create`

```ts
/**
 * Creates a 2D Perlin noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Perlin2DGenerator;
```

#### `perlin2d.sample`

```ts
/**
 * Samples 2D Perlin noise.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @returns The noise value at (x, y)
 */
export function sample({ perm, gradP }: Perlin2DGenerator, x: number, y: number): number;
```

**perlin3d**

#### `perlin3d.Perlin3DGenerator`

```ts
/** A seeded 3D Perlin noise generator. Create one with {@link create}. */
export type Perlin3DGenerator = Permutation;
```

#### `perlin3d.create`

```ts
/**
 * Creates a 3D Perlin noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Perlin3DGenerator;
```

#### `perlin3d.sample`

```ts
/**
 * Samples 3D Perlin noise.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns The noise value at (x, y, z)
 */
export function sample({ perm, gradP }: Perlin3DGenerator, x: number, y: number, z: number): number;
```

**simplex2d**

#### `simplex2d.Simplex2DGenerator`

```ts
/** A seeded 2D simplex noise generator. Create one with {@link create}. */
export type Simplex2DGenerator = Permutation;
```

#### `simplex2d.create`

```ts
/**
 * Creates a 2D simplex noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Simplex2DGenerator;
```

#### `simplex2d.sample`

```ts
/**
 * Samples 2D simplex noise, returning a value in the interval [-1, 1].
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @returns The noise value at (x, y)
 */
export function sample({ perm, gradP }: Simplex2DGenerator, x: number, y: number): number;
```

**simplex3d**

#### `simplex3d.Simplex3DGenerator`

```ts
/** A seeded 3D simplex noise generator. Create one with {@link create}. */
export type Simplex3DGenerator = Permutation;
```

#### `simplex3d.create`

```ts
/**
 * Creates a 3D simplex noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Simplex3DGenerator;
```

#### `simplex3d.sample`

```ts
/**
 * Samples 3D simplex noise, returning a value in the interval [-1, 1].
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns The noise value at (x, y, z)
 */
export function sample({ perm, gradP }: Simplex3DGenerator, x: number, y: number, z: number): number;
```

**simplex4d**

#### `simplex4d.Simplex4DGenerator`

```ts
/** A seeded 4D simplex noise generator. Create one with {@link create}. */
export type Simplex4DGenerator = Permutation;
```

#### `simplex4d.create`

```ts
/**
 * Creates a 4D simplex noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Simplex4DGenerator;
```

#### `simplex4d.sample`

```ts
/**
 * Samples 4D simplex noise, returning a value in the interval [-1, 1].
 *
 * The fourth axis is commonly used as time (for animated 3D noise) or as a wrap
 * dimension (map a coordinate around a circle in w for seamless looping).
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @returns The noise value at (x, y, z, w)
 */
export function sample({ perm, gradP4 }: Simplex4DGenerator, x: number, y: number, z: number, w: number): number;
```

**worley2d**

#### `worley2d.Worley2DGenerator`

```ts
/** A seeded 2D Worley (cellular) noise generator. Create one with {@link create}. */
export type Worley2DGenerator = Permutation;
```

#### `worley2d.create`

```ts
/**
 * Creates a 2D Worley noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Worley2DGenerator;
```

#### `worley2d.sample`

```ts
/**
 * Samples 2D Worley (cellular) noise: the Euclidean distance to the nearest of a
 * set of feature points, one scattered per unit cell. Gives organic cell / scale
 * / caustic patterns; values are roughly in [0, 1] (0 right at a feature point,
 * rising between them). Threshold it for cracks, cells, or region masks.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @returns The distance to the nearest feature point (F1)
 */
export function sample({ perm }: Worley2DGenerator, x: number, y: number): number;
```

**worley3d**

#### `worley3d.Worley3DGenerator`

```ts
/** A seeded 3D Worley (cellular) noise generator. Create one with {@link create}. */
export type Worley3DGenerator = Permutation;
```

#### `worley3d.create`

```ts
/**
 * Creates a 3D Worley noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Worley3DGenerator;
```

#### `worley3d.sample`

```ts
/**
 * Samples 3D Worley (cellular) noise: the Euclidean distance to the nearest of a
 * set of feature points, one scattered per unit cell. Values are roughly in
 * [0, 1] (0 right at a feature point). Threshold a 3D field for cave networks,
 * ore pockets, or volumetric cell structures.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns The distance to the nearest feature point (F1)
 */
export function sample({ perm }: Worley3DGenerator, x: number, y: number, z: number): number;
```

### `math/color`

#### `Color`

```ts
/** A linear-sRGB color: [r, g, b] floats in [0, 1]. */
export type Color = [
    r: number,
    g: number,
    b: number
];
```

#### `ColorInput`

```ts
/** Accepted input types for creating or parsing a Color. */
export type ColorInput = string // '#f00', '#ff0000', 'red', 'rgb(255,0,0)', 'hsl(0,100%,50%)'
 | number // 0xff0000 integer (sRGB gamma)
 | [
    number,
    number,
    number
]; // [r, g, b] linear floats [0, 1]
```

#### `HSL`

```ts
/** A hue-saturation-lightness color: [h, s, l], all in [0, 1] (hue wraps). */
export type HSL = [
    hue: number,
    saturation: number,
    lightness: number
];
```

**color**

#### `color.create`

```ts
/** Create a new Color initialized to black [0, 0, 0]. */
export function create(): Color;
```

#### `color.fromValues`

```ts
/** Create a new Color with the given linear r, g, b values. */
export function fromValues(r: number, g: number, b: number): Color;
```

#### `color.clone`

```ts
/** Create a new Color that is a copy of `c`. */
export function clone(c: Color): Color;
```

#### `color.copy`

```ts
/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Color, src: Color): Color;
```

#### `color.set`

```ts
/** Set the linear r, g, b components of `out` directly. Returns `out`. */
export function set(out: Color, r: number, g: number, b: number): Color;
```

#### `color.setScalar`

```ts
/** Set all three channels of `out` to the same linear value `s` (a gray). Returns `out`. */
export function setScalar(out: Color, s: number): Color;
```

#### `color.setFromSRGB`

```ts
/**
 * Set `out` from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
 * Converts from sRGB gamma space to linear. Returns `out`.
 */
export function setFromSRGB(out: Color, srgb: [
    number,
    number,
    number
]): Color;
```

#### `color.fromSRGB`

```ts
/** Create a new Color from an sRGB gamma-encoded [r, g, b] array with values in [0, 1]. */
export function fromSRGB(srgb: [
    number,
    number,
    number
]): Color;
```

#### `color.toSRGB`

```ts
/** Write the sRGB gamma-encoded [r, g, b] of a linear Color into `out` (values [0, 1]). */
export function toSRGB(out: [
    number,
    number,
    number
], c: Color): [
    number,
    number,
    number
];
```

#### `color.toCSS`

```ts
/** Create a CSS `rgb(...)` string in sRGB gamma space (for HTML/canvas use). */
export function toCSS(c: Color): string;
```

#### `color.toHex`

```ts
/** Convert to a 0xRRGGBB integer in sRGB gamma space. */
export function toHex(c: Color): number;
```

#### `color.toHexString`

```ts
/** Convert to a 6-digit sRGB hex string without a leading '#', e.g. 'ff8800'. */
export function toHexString(c: Color): string;
```

#### `color.add`

```ts
/** Add `a + b` component-wise into `out`. Returns `out`. */
export function add(out: Color, a: Color, b: Color): Color;
```

#### `color.addScalar`

```ts
/** Add scalar `s` to each channel of `a` into `out`. Returns `out`. */
export function addScalar(out: Color, a: Color, s: number): Color;
```

#### `color.sub`

```ts
/** Subtract `a - b` component-wise into `out`. Returns `out`. */
export function sub(out: Color, a: Color, b: Color): Color;
```

#### `color.multiply`

```ts
/** Multiply `a * b` component-wise into `out` (tinting). Returns `out`. */
export function multiply(out: Color, a: Color, b: Color): Color;
```

#### `color.multiplyScalar`

```ts
/** Scale each channel of `a` by `s` into `out` (brightness). Returns `out`. */
export function multiplyScalar(out: Color, a: Color, s: number): Color;
```

#### `color.lerp`

```ts
/** Linearly interpolate from `a` to `b` by `t` into `out` (physically-correct blend). Returns `out`. */
export function lerp(out: Color, a: Color, b: Color, t: number): Color;
```

#### `color.clamp`

```ts
/** Clamp each channel of `c` to [0, 1] into `out`. Returns `out`. */
export function clamp(out: Color, c: Color): Color;
```

#### `color.equals`

```ts
/** Whether `a` and `b` are equal, within an optional per-channel `epsilon` (default exact). */
export function equals(a: Color, b: Color, epsilon = 0): boolean;
```

#### `color.luminance`

```ts
/** Relative luminance in [0, 1] (Rec. 709 weights, on linear light). */
export function luminance(c: Color): number;
```

**colorspace**

#### `colorspace.srgbToLinear`

```ts
/** Convert a single sRGB gamma-encoded channel [0, 1] to linear light [0, 1]. */
export function srgbToLinear(c: number): number;
```

#### `colorspace.linearToSrgb`

```ts
/** Convert a single linear light channel [0, 1] to sRGB gamma-encoded [0, 1]. */
export function linearToSrgb(c: number): number;
```

#### `colorspace.linearSrgbToLinearDisplayP3`

```ts
/**
 * Convert a linear-sRGB Color to linear Display-P3 primaries, into `out`. Returns `out`.
 * (Both spaces share the sRGB transfer curve; this changes only the primaries.)
 */
export function linearSrgbToLinearDisplayP3(out: Color, c: Color): Color;
```

#### `colorspace.linearDisplayP3ToLinearSrgb`

```ts
/**
 * Convert a linear Display-P3 Color to linear-sRGB primaries, into `out`. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1] — clamp if needed.
 */
export function linearDisplayP3ToLinearSrgb(out: Color, c: Color): Color;
```

**hsl**

#### `hsl.create`

```ts
/** Create a new HSL initialized to [0, 0, 0] (black). */
export function create(): HSL;
```

#### `hsl.fromValues`

```ts
/** Create a new HSL with the given h, s, l values (all in [0, 1]). */
export function fromValues(h: number, s: number, l: number): HSL;
```

#### `hsl.clone`

```ts
/** Create a new HSL that is a copy of `a`. */
export function clone(a: HSL): HSL;
```

#### `hsl.copy`

```ts
/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: HSL, src: HSL): HSL;
```

#### `hsl.set`

```ts
/** Set the h, s, l components of `out` directly. Returns `out`. */
export function set(out: HSL, h: number, s: number, l: number): HSL;
```

#### `hsl.fromColor`

```ts
/** Write the HSL of a linear Color into `out`. Returns `out`. */
export function fromColor(out: HSL, c: Color): HSL;
```

#### `hsl.toColor`

```ts
/** Write the linear Color of an HSL into `out`. Returns `out`. */
export function toColor(out: Color, a: HSL): Color;
```

#### `hsl.lerp`

```ts
/**
 * Interpolate from `a` to `b` by `t` into `out`, taking the shortest path around
 * the hue wheel (so e.g. 350°→10° passes through 0°, not all the way back).
 * Returns `out`.
 */
export function lerp(out: HSL, a: HSL, b: HSL, t: number): HSL;
```

#### `hsl.offset`

```ts
/**
 * Offset `a` by (dh, ds, dl) into `out`: hue wraps into [0, 1), saturation and
 * lightness are clamped to [0, 1]. Returns `out`.
 */
export function offset(out: HSL, a: HSL, dh: number, ds: number, dl: number): HSL;
```



## Acknowledgements:

- The vec*, quat*, mat* code started life as a port of mathcat, which started as a TypeScript port of glMatrix (https://glmatrix.net/)
- The simplex noise is adapted from https://github.com/josephg/noisejs
