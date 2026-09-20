import { describe, expect, it } from 'vitest';
import { createPromoWorld } from '../src/world';
import { Time } from '../src/time/traits';
import { Edit, Sequence } from '../src/sequence/traits';
import { sequenceFilm } from '../src/sequence/systems';
import { advanceTime } from '../src/time/systems';
import { updateForms } from '../src/forms/systems';
import { Geometry, Study } from '../src/forms/traits';
import { beat, drop, dropBeats, easeCuts, exposureFrames, filmDuration, finalExposureFrames, markAt, markHold, openingBeats, openingCuts, shutterCuts, sweepTime, titleBeats } from '../src/sequence/cuts';

describe('motion studies', () => {
  it('builds to a sustained fast cadence, accelerates again, and shows every study once', () => {
    const world = createPromoWorld();
    const { cuts } = world.get(Edit)!;
    const forms = cuts.filter(cut => cut.form >= 0).map(cut => cut.form);
    expect(forms).toHaveLength(27);
    expect(new Set(forms).size).toBe(forms.length);
    expect([...forms].sort((a, b) => a - b)).toEqual(world.query(Study).map(entity => entity.get(Study)!.index).sort((a, b) => a - b));
    // The film's length follows from the cuts.
    const duration = world.get(Time)!.duration;
    expect(duration).toBeCloseTo(filmDuration(cuts));
    expect(duration).toBeCloseTo(cuts[cuts.length - 1].at + dropBeats * beat + sweepTime + titleBeats * beat + markHold);
    // The opening cuts breathe, ease into the beat with growing steps, then hold one constant beat.
    for (let i = 0; i < openingCuts; i++) expect(cuts[i + 1].at - cuts[i].at).toBeCloseTo(openingBeats * beat);
    let previousStep = 0;
    for (let i = openingCuts; i < openingCuts + easeCuts; i++) {
      const step = (cuts[i].at - cuts[i - 1].at) - (cuts[i + 1].at - cuts[i].at);
      expect(step).toBeGreaterThanOrEqual(previousStep - 1e-9);
      previousStep = step;
    }
    for (let i = openingCuts + easeCuts - 1; i < cuts.length - 1; i++) expect(cuts[i + 1].at - cuts[i].at).toBeCloseTo(beat);
    // The type lands, holds, then the mark takes its place and holds for at least a second.
    expect(markAt).toBeCloseTo(drop + sweepTime + titleBeats * beat);
    expect(duration - cuts[cuts.length - 1].at).toBeGreaterThanOrEqual(markAt + 1);
    // Full exposures until the shutter cuts, which flash briefly and hold dark for the rest of the
    // beat, tightening from the first shutter cut to the last.
    const shutterStart = cuts.length - 1 - shutterCuts;
    for (let i = 0; i < shutterStart; i++) expect(cuts[i].exposure).toBeCloseTo(cuts[i + 1].at - cuts[i].at);
    expect(cuts[shutterStart].exposure * 60).toBeCloseTo(exposureFrames);
    expect(cuts[cuts.length - 2].exposure * 60).toBeCloseTo(finalExposureFrames);
    for (let i = shutterStart + 1; i < cuts.length - 1; i++) expect(cuts[i].exposure).toBeLessThanOrEqual(cuts[i - 1].exposure + 1e-9);
    // The first shutter cut is fully open, so the effect ramps in rather than switching on.
    expect(cuts[shutterStart].exposure).toBeCloseTo(beat);
    expect(finalExposureFrames).toBeLessThan(beat * 30);
    // The imprint rows step by five, so the shutter count must be coprime with five to visit every row.
    expect(shutterCuts % 5).not.toBe(0);
    world.set(Time, { elapsed: cuts[cuts.length - 1].at + markAt });
    sequenceFilm(world);
    expect(world.get(Sequence)!.reveal).toBe(true);
    world.destroy();
  });

  it('can seek each study reproducibly within its preallocated geometry', () => {
    const world = createPromoWorld();
    const cuts = world.get(Edit)!.cuts;
    for (let i = 0; i < cuts.length - 1; i++) {
      const cut = cuts[i];
      world.set(Time, { elapsed: (cut.at + cuts[i + 1].at) / 2 });
      sequenceFilm(world);
      updateForms(world);
      const shown = world.get(Sequence)!.index;
      const entity = world.query(Study, Geometry).find(entity => entity.get(Study)!.index === shown)!;
      const mesh = entity.get(Geometry)!;
      expect(mesh.count).toBeGreaterThan(30);
      expect(mesh.count).toBeLessThanOrEqual(mesh.positions.length / 3);
      const snapshot = mesh.positions.slice(0, mesh.count * 3);
      expect(snapshot.every(Number.isFinite)).toBe(true);
      expect(mesh.faceCount * 3).toBeLessThanOrEqual(mesh.faces.length);
      expect(mesh.faces.subarray(0, mesh.faceCount * 3).every(index => index < mesh.count)).toBe(true);
      updateForms(world);
      expect(mesh.positions.slice(0, mesh.count * 3)).toEqual(snapshot);
    }
    world.destroy();
  });

  it('shows the cut\'s own study on the first pulse and recalls other screens on later pulses', () => {
    const world = createPromoWorld();
    const cuts = world.get(Edit)!.cuts;
    const last = cuts.length - 2;
    const screens = new Set<number>();
    for (let frame = 0; frame < Math.round((cuts[last + 1].at - cuts[last].at) * 60); frame++) {
      world.set(Time, { elapsed: cuts[last].at + frame / 60 });
      sequenceFilm(world);
      const sequence = world.get(Sequence)!;
      if (frame === 0) expect(sequence.index).toBe(cuts[last].form);
      if (sequence.open) screens.add(sequence.index);
      expect(sequence.pulseLocal).toBeLessThanOrEqual(sequence.exposure * 2 + 1e-9);
    }
    expect(screens.size).toBeGreaterThan(3);
    // Cuts before the shutter never strobe.
    world.set(Time, { elapsed: cuts[1].at + (cuts[2].at - cuts[1].at) * 0.9 });
    sequenceFilm(world);
    expect(world.get(Sequence)!.pulse).toBe(0);
    expect(world.get(Sequence)!.open).toBe(true);
    world.destroy();
  });

  it('keeps the accent color to highlights in every study', () => {
    const world = createPromoWorld();
    const cuts = world.get(Edit)!.cuts;
    for (let i = 0; i < cuts.length - 1; i++) {
      for (const phase of [0.1, 0.5, 0.9]) {
        world.set(Time, { elapsed: cuts[i].at + (cuts[i + 1].at - cuts[i].at) * phase });
        sequenceFilm(world);
        updateForms(world);
        const shown = world.get(Sequence)!.index;
        const mesh = world.query(Study, Geometry).find(entity => entity.get(Study)!.index === shown)!.get(Geometry)!;
        let emphasis = 0;
        // Only the cut's accent counts; spectrum inks (3 and up) are deliberate per-part colours.
        for (let v = 0; v < mesh.count; v++) if (mesh.ink[v] === 2) emphasis++;
        expect(emphasis / mesh.count, `study ${shown}`).toBeLessThanOrEqual(0.3);
      }
    }
    world.destroy();
  });

  it('sequences a valid screen at every frame, including before the first cut and past the end', () => {
    const world = createPromoWorld();
    const { duration } = world.get(Time)!;
    const cuts = world.get(Edit)!.cuts;
    const times = [-0.01, -1e-9, 0, duration, duration + 1];
    for (let t = 0; t <= duration; t += 1 / 120) times.push(t);
    for (const cut of cuts) times.push(cut.at - 1e-9, cut.at, cut.at + 1e-9);
    for (const t of times) {
      world.set(Time, { elapsed: t });
      sequenceFilm(world);
      const sequence = world.get(Sequence)!;
      expect(Number.isInteger(sequence.index), `t=${t}`).toBe(true);
      expect(sequence.pulse, `t=${t}`).toBeGreaterThanOrEqual(0);
    }
    world.destroy();
  });

  it('lights the pillars inside the camera frustum and dims the rest', () => {
    const world = createPromoWorld();
    const cuts = world.get(Edit)!.cuts;
    const cut = cuts.findIndex(cut => cut.form === 26);
    world.set(Time, { elapsed: cuts[cut].at + 0.1 });
    sequenceFilm(world);
    updateForms(world);
    const mesh = world.query(Study, Geometry).find(entity => entity.get(Study)!.index === 26)!.get(Geometry)!;
    const ink = mesh.ink.subarray(0, mesh.count);
    expect(ink.filter(value => value === 2).length).toBeGreaterThan(24);
    expect(ink.filter(value => value === 0).length).toBeGreaterThan(200);
    world.destroy();
  });

  it('pauses and holds the final frame without automatically repeating', () => {
    const world = createPromoWorld();
    const duration = world.get(Time)!.duration;
    world.set(Time, { elapsed: duration - 0.1, playing: false });
    advanceTime(world, 0.2);
    expect(world.get(Time)!.elapsed).toBe(duration - 0.1);
    world.set(Time, { playing: true });
    advanceTime(world, 0.2);
    expect(world.get(Time)!.elapsed).toBe(duration);
    expect(world.get(Time)!.playing).toBe(false);
    advanceTime(world, 1);
    expect(world.get(Time)!.elapsed).toBe(duration);
    world.destroy();
  });
});
