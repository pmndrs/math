import { lerp } from 'math';
import type { Cut } from './traits';

// The single place to adjust the film's timing. Everything else, including the film's length, the
// timeline control and the tests, derives from these values.

/** Every cut lasts one beat, in seconds. Kept to whole frames at 60 fps. */
export const beat = 22 / 60;
/** The opening cuts get room to breathe: this many cuts, at this many beats each. */
export const openingCuts = 2;
export const openingBeats = 2;
/** Then this many cuts ease from the opening pace into the beat, shallow at first and quick at the end. */
export const easeCuts = 5;
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
/** Beats of stillness after the last exposure, holding the partial type, before it sweeps closed. */
export const dropBeats = 0;
/** How far the frame pushes in across the shutter section before releasing on the landing. */
export const pushIn = 0.08;
/** Seconds the field's contours take to converge into the solid type after the drop. */
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
    // Twenty-seven studies. The first five demo the package's headline features: frustum culling,
    // constrained 3D FABRIK, closed-form springs, the 3D convex hull and dual quaternions. The
    // other interactive studies follow, then the 3D forms through the shutter section. Studies not
    // listed here stay defined in `forms` and can be swapped in by index.
    const forms = [
        26, 54, 11, 55, 16,
        7, 18, 10, 3, 15, 2, 14, 5, 13, 0, 9,
        22, 12, 4, 8, 17, 33, 39, 37, 51, 52, 53,
    ];
    const pulse = Math.round(beat * 60);
    // A constant pace after the opening. The shutter is purely an exposure change: the closing cuts
    // strobe each study on and off while the particles gather into the title. The pulses shorten
    // as it builds, so the flicker quickens without the beat changing.
    const first = forms.length - shutterCuts;
    let frame = 0;
    const cuts: Cut[] = forms.map((form, index) => {
        const eased = (index - openingCuts + 1) / easeCuts;
        const frames = index < openingCuts ? pulse * openingBeats
            : index < openingCuts + easeCuts ? Math.round(pulse * lerp(openingBeats, 1, eased * eased))
            : pulse;
        const cut: Cut = {
            at: frame / 60,
            form,
            exposure:
                index < first
                    ? frames / 60
                    : lerp(exposureFrames, finalExposureFrames, ramp((index - first) / (shutterCuts - 1))) / 60,
        };
        frame += frames;
        return cut;
    });
    cuts.push({ at: frame / 60, form: -1, exposure: Infinity });
    return cuts;
}

/** The film's length: the last cut plus the drop, the inversion, the type's hold and the mark's hold. */
export function filmDuration(cuts: Cut[]): number {
    return cuts[cuts.length - 1].at + markAt + markHold;
}
