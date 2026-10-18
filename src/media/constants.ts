export const TARGET_BYTES = 19_800_000;
export const MAX_ATTEMPTS = 6;

export type ResolutionChoice = 'original' | '1080' | '720' | '360';

export interface VideoInfo {
  width: number;
  height: number;
  duration: number;
  codec: string | null;
  frameRate: number | null;
  hasAudio: boolean;
}
