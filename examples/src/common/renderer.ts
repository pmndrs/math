import * as g from 'gpucat';

/** Construction options common to both gpucat backends, forwarded as-is. */
export type CreateRendererOptions = {
    /** Enable MSAA antialiasing. */
    antialias?: boolean;
    /** Explicit MSAA sample count. 0 or 1 = no MSAA. Takes precedence over `antialias`. */
    samples?: number;
    /** Premultiplied-alpha (transparent) canvas compositing. Default false (opaque). */
    alpha?: boolean;
    /** Allocate a stencil buffer. Default false. */
    stencil?: boolean;
    /** Canvas to render into. If omitted, the renderer creates one. */
    canvas?: HTMLCanvasElement;
    /** Device pixel ratio applied before the first setSize. */
    pixelRatio?: number;
    /** GPU power-preference hint. */
    powerPreference?: GPUPowerPreference;
};

/** An initialised gpucat renderer — WebGPU when available, otherwise WebGL2. */
export type Renderer = g.WebGPURenderer | g.WebGLRenderer;

// True when the browser exposes WebGPU AND actually hands us an adapter. The
// adapter probe touches no canvas, so a negative result lets us fall through to
// WebGL2 without having acquired a canvas context we can't release.
async function webgpuAvailable(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter != null;
    } catch {
        return false;
    }
}

/**
 * Create and initialise a renderer, preferring WebGPU and falling back to
 * WebGL2. The returned renderer is already `await renderer.init()`-ed, so it's
 * ready to hand to a `RenderPipeline`. Both backends share gpucat's node DSL,
 * so example code is identical regardless of which one you get — read
 * `renderer.backend` ('webgpu' | 'webgl') if you need to branch.
 */
export async function createRenderer(options: CreateRendererOptions = {}): Promise<Renderer> {
    if (await webgpuAvailable()) {
        try {
            const renderer = new g.WebGPURenderer(options);
            await renderer.init();
            return renderer;
        } catch (err) {
            // Adapter was reported but device/context init failed — fall through to WebGL2.
            console.warn('[examples] WebGPU init failed, falling back to WebGL2:', err);
        }
    }

    const renderer = new g.WebGLRenderer(options);
    await renderer.init();
    return renderer;
}
