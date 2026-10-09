import { audioEngine } from '../services/audioEngine';
import { TuningSystem } from '../types/maqam';

const SEMITONES_FROM_C: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Quarter-tone offset implied by an accidental: '#' = +2, 'b' = -2, 'd' (half-flat) = -1. */
const ACCIDENTAL_QUARTERS: Record<string, number> = { '#': 2, b: -2, d: -1 };

export interface ParsedNote {
  letter: string;
  accidental: '#' | 'b' | 'd' | '';
  octave: number;
}

/** Parses names such as "C4", "Ed4" (half-flat), "F#4", "Bb3". */
export const parseNoteName = (name: string): ParsedNote | null => {
  const m = name.match(/^([A-G])([#bd]?)([0-9])$/);
  if (!m) return null;
  return { letter: m[1], accidental: m[2] as ParsedNote['accidental'], octave: parseInt(m[3], 10) };
};

/** Absolute pitch position in 24-EDO quarter-tone steps (C0 = 0). */
export const noteToQuarterTones = (name: string): number | null => {
  const p = parseNoteName(name);
  if (!p) return null;
  return (p.octave * 12 + SEMITONES_FROM_C[p.letter]) * 2 + (p.accidental ? ACCIDENTAL_QUARTERS[p.accidental] : 0);
};

/** Converts a note name into exact Hz for the given tuning system. */
export const getFrequencyForNoteName = (noteName: string, system: TuningSystem): number => {
  const isQuarter = noteName.includes('d');
  const cleanName = noteName.replace('d', '');
  const noteMap: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
    G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  };

  const match = cleanName.match(/^([A-G][#b]?)([0-9])$/);
  if (!match) return 440;

  const midi = (parseInt(match[2], 10) + 1) * 12 + (noteMap[match[1]] ?? 0);
  const commaOffset = isQuarter ? -2 : 0;

  return audioEngine.calculateFrequency(midi, isQuarter ? -1 : 0, system, commaOffset);
};
