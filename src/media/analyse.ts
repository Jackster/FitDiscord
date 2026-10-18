import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import type { VideoInfo } from './constants';

export async function analyseVideo(file: File): Promise<VideoInfo> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    if (!(await input.canRead())) throw new Error('This video format is not supported. Try an MP4, MOV, or WebM file.');
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error('No video track was found in this file.');
    const [width, height, duration, codec, audio, frameRate] = await Promise.all([
      track.getDisplayWidth(), track.getDisplayHeight(), input.getDurationFromMetadata(), track.getCodec(),
      input.getPrimaryAudioTrack(), track.computeFrameRateMetrics().catch(() => null),
    ]);
    const accurateDuration = duration ?? await input.computeDuration([track]);
    return { width, height, duration: accurateDuration, codec, hasAudio: Boolean(audio), frameRate: frameRate?.bestGuessFrameRate ?? null };
  } finally {
    input.dispose();
  }
}
