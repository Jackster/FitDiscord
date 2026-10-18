import { ALL_FORMATS, BlobSource, BufferTarget, canEncodeAudio, canEncodeVideo, Conversion, Input, Mp4OutputFormat, Output, Quality } from 'mediabunny';
import { calculateAudioBitrate, calculateRetryBitrate, calculateTotalBitrate, calculateVideoBitrate } from '../media/bitrate';
import { MAX_ATTEMPTS, TARGET_BYTES } from '../media/constants';
import { getOutputDimensions } from '../media/resolution';
import type { ResolutionChoice } from '../media/constants';

interface StartMessage { type: 'start'; file: File; duration: number; width: number; height: number; frameRate: number | null; resolution: ResolutionChoice; keepAudio: boolean; }

self.onmessage = async ({ data }: MessageEvent<StartMessage>) => {
  if (data.type !== 'start') return;
  const { file, duration, width, height, frameRate, resolution, keepAudio } = data;
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    let total = calculateTotalBitrate(duration);
    let audioBitrate = calculateAudioBitrate(total, keepAudio);
    let videoBitrate = calculateVideoBitrate(total, audioBitrate);
    const dimensions = getOutputDimensions(width, height, resolution);
    if (!(await canEncodeVideo('avc', { width: dimensions.width, height: dimensions.height, frameRate: frameRate ?? undefined, quality: new Quality({ bitrate: videoBitrate }), hardwareAcceleration: 'prefer-hardware' }))) {
      throw new Error('This browser or device cannot encode H.264 video at the selected resolution. Try a smaller resolution or use current Chrome or Edge.');
    }
    if (keepAudio && !(await canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48_000, quality: new Quality({ bitrate: audioBitrate }) }))) {
      throw new Error('This browser or device cannot encode AAC audio. Try Chrome or Edge, or turn off Keep audio.');
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      self.postMessage({ type: 'progress', stage: attempt > 1 ? 'optimising' : 'encoding', progress: 0, attempt, attempts: MAX_ATTEMPTS, videoBitrate, audioBitrate });
      const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
      const conversion = await Conversion.init({
        input,
        output,
        tracks: 'primary',
        video: { codec: 'avc', width: dimensions.width, height: dimensions.height, fit: 'contain', quality: new Quality({ bitrate: videoBitrate }), hardwareAcceleration: 'prefer-hardware', allowTransformationMetadata: false },
        audio: keepAudio ? { codec: 'aac', bitrate: audioBitrate } : { discard: true },
      });
      if (!conversion.isValid) throw new Error('The selected video tracks cannot be encoded by this browser.');
      conversion.onProgress = (progress) => self.postMessage({ type: 'progress', stage: 'encoding', progress, attempt, attempts: MAX_ATTEMPTS, videoBitrate, audioBitrate });
      await conversion.execute();
      const buffer = output.target.buffer;
      if (!buffer) throw new Error('The browser did not produce an output file.');
      const blob = new Blob([buffer], { type: 'video/mp4' });
      if (blob.size <= TARGET_BYTES) {
        self.postMessage({ type: 'complete', blob, bytes: blob.size, width: dimensions.width, height: dimensions.height });
        return;
      }
      if (attempt === MAX_ATTEMPTS) throw new Error(`This video could not be reduced below ${TARGET_BYTES.toLocaleString()} bytes after ${MAX_ATTEMPTS} attempts. Try a lower resolution.`);
      self.postMessage({ type: 'oversize', bytes: blob.size, attempt: attempt + 1 });
      total = calculateRetryBitrate(total, TARGET_BYTES, blob.size, attempt);
      audioBitrate = calculateAudioBitrate(total, keepAudio);
      videoBitrate = calculateVideoBitrate(total, audioBitrate);
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Compression failed.' });
  } finally {
    input.dispose();
  }
};
