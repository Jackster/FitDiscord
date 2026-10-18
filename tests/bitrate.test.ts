import { describe, expect, it } from 'vitest';
import { calculateAudioBitrate, calculateRetryBitrate, calculateTotalBitrate, calculateVideoBitrate, formatBytes, formatDuration } from '../src/media/bitrate';
import { TARGET_BYTES } from '../src/media/constants';

describe('Discord size and bitrate budgeting', () => {
  it('uses an exact decimal 19.8 MB target', () => {
    expect(TARGET_BYTES).toBe(19_800_000);
    expect(formatBytes(TARGET_BYTES)).toBe('19.80 MB');
  });
  it.each([10, 60, 300, 1800])('calculates the bitrate budget for %s seconds', (seconds) => {
    expect(calculateTotalBitrate(seconds)).toBe(Math.floor(TARGET_BYTES * 8 * 0.98 / seconds));
  });
  it('reserves a sensible share for audio and subtracts it from video', () => {
    const total = calculateTotalBitrate(60);
    const audio = calculateAudioBitrate(total, true);
    expect(audio).toBe(128_000);
    expect(calculateVideoBitrate(total, audio)).toBe(total - audio);
    expect(calculateAudioBitrate(total, false)).toBe(0);
    expect(calculateVideoBitrate(total, 0)).toBe(total);
  });
  it('reduces the next bitrate after an oversize result', () => {
    const next = calculateRetryBitrate(1_000_000, TARGET_BYTES, 21_000_000, 1);
    expect(next).toBe(Math.floor(1_000_000 * TARGET_BYTES / 21_000_000 * 0.98));
  });
  it('formats duration consistently', () => {
    expect(formatDuration(272)).toBe('04:32');
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});
