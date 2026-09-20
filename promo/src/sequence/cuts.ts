import { lerp } from 'math';
import type { Cut } from './traits';

// The single place to adjust the film's timing. Everything else, including the film's length, the
// timeline control and the tests, derives from these values.

/** Every cut lasts one beat, in seconds. Kept to whole frames at 60 fps. */
export const beat = 22 / 60;
/** How many closing cuts run as shutter exposures that build the title. Keep it coprime with five. */
export const shutterCuts = 21;
/**
 * Frames the shutter stays open per pulse on the first shutter cut: the whole beat, so the strobe
 * grows in from nothing. Within a cut the study pulses on and off at this length, so shorter
 * exposures also mean faster flicker.
 */
export const exposureFrames = Math.round(beat * 60);
/** Frames per pulse on the last shutter cut. Exposures tighten toward it along `ramp`. */
export const finalExposureFrames = 2;
/** The build-up curve shared by the exposure tightening and the push-in. Linear: steady from the first shutter cut. */
export const ramp = (t: number) => t;
/** Dark frames between pulses, as a multiple of the pulse length. One gives an even strobe. */
export const strobeGap = 1;
/** Which screen each extra pulse recalls: this many cuts further along the edit, wrapping around. */
export const strobeStride = 11;
/** How much thicker the last pulses' title bands are than the first, so the fill keeps pace with the strobe. */
export const bandGrowth = 4;
/** Frames over which each cut's band of title ink prints, ending as the first pulse closes. */
export const pressFrames = 2;
/** Beats of stillness after the last exposure, holding the partial type, before it sweeps closed. */
export const dropBeats = 0;
/** How far the frame pushes in across the shutter section before releasing on the landing. */
export const pushIn = 0.08;
/** Seconds the pressure front takes to close the type after the drop. */
export const sweepTime = 0.42;
/** Beats the finished type holds before the pmndrs mark cuts in. */
export const titleBeats = 8;
/** Seconds the mark holds before the film ends. */
export const markHold = 1.7;

/** Seconds of stillness before the sweep. */
export const drop = dropBeats * beat;
/** Local time within the final cut at which the mark replaces the type. */
export const markAt = drop + sweepTime + titleBeats * beat;

export function createCuts(): Cut[] {
    // Twenty-seven studies. The first five demo the package's headline features: constrained 3D
    // FABRIK, frustum culling, closed-form springs, the 3D convex hull and dual quaternions. The
    // other interactive studies follow, then the 3D forms through the shutter section. Studies not
    // listed here stay defined in `forms` and can be swapped in by index.
    const forms = [
        54, 26, 11, 55, 16,
        7, 18, 10, 3, 15, 2, 14, 5, 13, 0, 9,
        22, 12, 4, 8, 17, 33, 39, 37, 51, 52, 53,
    ];
    const pulse = Math.round(beat * 60);
    // A constant pace throughout. The shutter is purely an exposure change: the closing cuts strobe
    // each study on and off while its imprint settles into the title. The pulses shorten as the
    // title fills, so the flicker quickens without the beat changing.
    const first = forms.length - shutterCuts;
    const cuts: Cut[] = forms.map((form, index) => ({
        at: (index * pulse) / 60,
        form,
        exposure:
            index < first
                ? beat
                : lerp(exposureFrames, finalExposureFrames, ramp((index - first) / (shutterCuts - 1))) / 60,
    }));
    cuts.push({ at: (forms.length * pulse) / 60, form: -1, exposure: Infinity });
    return cuts;
}

/** The film's length: the last cut plus the drop, the type sweep, its hold and the mark's hold. */
export function filmDuration(cuts: Cut[]): number {
    return cuts[cuts.length - 1].at + markAt + markHold;
}
