import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index';

describe('maath', () => {
    it('exposes a version', () => {
        expect(VERSION).toBe('0.10.8');
    });
});
