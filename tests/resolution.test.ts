import { describe, expect, it } from 'vitest';
import { getOutputDimensions } from '../src/media/resolution';

describe('resolution fitting', () => {
  it.each([
    [3840, 2160, '1080', 1920, 1080],
    [2560, 1440, '720', 1280, 720],
    [1920, 1080, '360', 640, 360],
    [1080, 1920, '360', 360, 640],
    [640, 360, '1080', 640, 360],
    [853, 481, 'original', 852, 480],
  ] as const)('fits %sx%s to %s', (width, height, choice, expectedWidth, expectedHeight) => {
    expect(getOutputDimensions(width, height, choice)).toEqual({ width: expectedWidth, height: expectedHeight });
  });
});
