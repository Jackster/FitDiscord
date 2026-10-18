import type { ResolutionChoice } from './constants';

export function getOutputDimensions(width: number, height: number, choice: ResolutionChoice): { width: number; height: number } {
  if (width < 1 || height < 1) throw new Error('Video dimensions must be positive.');
  const maxHeight = choice === 'original' ? Infinity : Number(choice);
  const constrainedSide = width >= height ? height : width;
  const scale = Math.min(1, maxHeight / constrainedSide);
  const even = (value: number) => Math.max(2, Math.floor(value * scale / 2) * 2);
  return { width: even(width), height: even(height) };
}
