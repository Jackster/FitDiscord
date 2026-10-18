import { TARGET_BYTES } from './constants';

const CONTAINER_OVERHEAD = 0.02;

export function calculateTotalBitrate(durationSeconds: number, targetBytes = TARGET_BYTES): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.floor((targetBytes * 8 * (1 - CONTAINER_OVERHEAD)) / durationSeconds);
}

export function calculateAudioBitrate(totalBitrate: number, keepAudio: boolean): number {
  if (!keepAudio || totalBitrate <= 0) return 0;
  return Math.min(128_000, Math.max(48_000, Math.floor(totalBitrate * 0.2)));
}

export function calculateVideoBitrate(totalBitrate: number, audioBitrate: number): number {
  return Math.max(25_000, totalBitrate - audioBitrate);
}

export function calculateRetryBitrate(oldBitrate: number, targetBytes: number, actualBytes: number, attempt: number): number {
  if (actualBytes <= targetBytes) return oldBitrate;
  const safety = Math.max(0.92, 0.98 - Math.max(0, attempt - 1) * 0.01);
  return Math.max(25_000, Math.floor(oldBitrate * (targetBytes / actualBytes) * safety));
}

export function formatBytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
