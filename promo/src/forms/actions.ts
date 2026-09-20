import type { World } from 'koota';
import type { Cut } from '../sequence/traits';
import { Geometry, Study } from './traits';

/** Spawns only the studies the edit uses; the rest stay defined here and in `forms` for swapping in. */
export function spawnStudies(world: World, cuts: Cut[]) {
  const used = new Set(cuts.map(cut => cut.form));
  [
    ['Continuity', 'M(u, v) = ((R + v cos ½u) cos u, (R + v cos ½u) sin u, v sin ½u)'],
    ['Resonance', 'z = sin(kr₁ − ωt) + sin(kr₂ − ωt)'],
    ['Strange attraction', 'ẋ = σ(y − x)    ẏ = x(ρ − z) − y    ż = xy − βz'],
    ['Natural order', 'θₙ = nπ(3 − √5)     yₙ = 1 − 2n/N'],
    ['Coherent chaos', 'f(p) = Σ aⁱ noise(2ⁱp + t)'],
    ['Entanglement', 'T(t) = ((2 + cos 3t) cos 2t, (2 + cos 3t) sin 2t, sin 3t)'],
    ['Superposition', 'f(t) = Σ sin((2n − 1)t) / (2n − 1)'],
    ['Orbital mechanics', 'q = [u sin(θ/2), cos(θ/2)]     p′ = qpq⁻¹'],
    ['The circumcircle', 'OA = OB = OC = R'],
    ['Flow field', 'ṗ = (cos θ(p), sin θ(p))'],
    ['Inverse kinematics', '‖pᵢ₊₁ − pᵢ‖ = ℓᵢ'],
    ['Spring dynamics', 'mẍ + cẋ + k(x − x₀) = 0'],
    ['Triangulation', 'P = ⋃ Tᵢ     |T| = n − 2'],
    ['Signed distance', 'd(p) = ± min ‖p − q‖,  q ∈ ∂P'],
    ['Convex hull', 'conv(P) = {Σ λᵢpᵢ : λᵢ ≥ 0, Σ λᵢ = 1}'],
    ['Elastic collisions', 'E = ½ Σ mᵢ‖vᵢ‖² = constant'],
    ['Dual quaternions', 'q̂ = normalize((1 − t)q̂₀ + tq̂₁)'],
    ['The shape of time', 'x(t) = a + (b − a) f(t)'],
    ['Discrete landscapes', 'h(x, z) = ⌊s · noise(x, z)⌋'],
    ['Pythagorean theorem', 'a² + b² = c²'],
    ['Infinite perimeter', 'D = log 4 / log 3'],
    ['Fourier epicycles', 'z(t) = Σ aₙ eⁱⁿᵗ'],
    ['Minimal surfaces', 'H(u, v) = (v cos u, cu, v sin u)'],
    ['Lissajous figures', 'x = sin(at + δ)     y = sin(bt)'],
    ['Bézier curves', 'B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃'],
    ['Self-similarity', 'D = log 3 / log 2'],
    ['Frustum culling', 'nᵢ · p + dᵢ ≥ 0     i = 1 … 6'],
    ['Chladni patterns', 'cos(3x) cos(5y) − a cos(5x) cos(3y) = 0'],
    ['Phyllotaxis', 'rₙ = c√n     θₙ = nπ(3 − √5)'],
    ['Saddle surface', 'y = a(x² − z²)'],
    ['Polar rose', 'r = a cos(5θ)'],
    ['Catenary curves', 'y = a cosh(x/a)'],
    ['Modular multiplication', 'θ ↦ aθ  (mod 2π)'],
    ['Superellipsoid', '|x|ᵖ + |y|ᵖ + |z|ᵖ = rᵖ'],
    ['Catenoid', 'r = a cosh(y/a)'],
    ['Conical surface', 'x² + z² = k²y²'],
    ['Hyperboloid', 'x² + z² − y² = 1'],
    ['Ellipsoid', 'x²/a² + y²/b² + z²/c² = 1'],
    ['Enneper surface', 'E(u,v) = (u − u³/3 + uv², v − v³/3 + vu², u² − v²)'],
    ['Torus', '(√(x² + z²) − R)² + y² = r²'],
    ['Archimedean spiral', 'r = aθ'],
    ['Logarithmic spiral', 'r = aeᵇθ'],
    ['Lemniscate', '(x² + y²)² = a²(x² − y²)'],
    ['Cardioid', 'r = a(1 − cos θ)'],
    ['Astroid', '|x|²ᐟ³ + |y|²ᐟ³ = a²ᐟ³'],
    ['Deltoid', 'z(t) = 2eⁱᵗ + e⁻²ⁱᵗ'],
    ['Nephroid', 'z(t) = 3eⁱᵗ − e³ⁱᵗ'],
    ['Cycloid', 'x = a(t − sin t)     y = a(1 − cos t)'],
    ['Circle involute', 'x = cos t + t sin t     y = sin t − t cos t'],
    ['Spherical spiral', 'x² + y² + z² = r²'],
    ['Conical helix', 'H(t) = (at cos kt, bt, at sin kt)'],
    ['Double helix', 'H±(t) = (±cos t, ct, ±sin t)'],
    ['Tetrahedral symmetry', 'V − E + F = 2'],
    ['Octahedral symmetry', 'V − E + F = 2'],
    ['Constrained kinematics', '‖pᵢ₊₁ − pᵢ‖ = ℓᵢ     ∠(bᵢ, bᵢ₋₁) ≤ θᵢ'],
    ['Convex hull', 'conv(P) = ⋂ { H : P ⊂ H }'],
  ].forEach(([title, equation], index) => {
    if (!used.has(index)) return;
    world.spawn(Study({ index, title, equation, planar: index >= 8 && index !== 16 && index !== 22 && index !== 26 && index !== 29 && index !== 33 && (index < 34 || (index >= 40 && index <= 48)) }), Geometry);
  });
}
