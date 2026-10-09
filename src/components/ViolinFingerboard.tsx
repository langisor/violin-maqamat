import React, { useState } from 'react';
import { MaqamScale, TuningSystem, ViolinTuningPreset, ARABIC_NOTE_DICTIONARY } from '../types/maqam';
import { audioEngine } from '../services/audioEngine';

interface FingerboardProps {
  currentMaqam: MaqamScale;
  tuningSystem: TuningSystem;
  violinTuning: ViolinTuningPreset;
  activePlayingNote: string | null;
  onNoteTrigger: (noteKey: string, freq: number) => void;
}

export type AccidentalNaming = 'sharps' | 'flats' | 'halfflats' | 'arabic';
export type PlayMode = 'bow' | 'pizzicato';
export type HandPosition = '1st' | '2nd' | '3rd' | '4th' | 'all';
export type ScaleFilterMode = 'all-notes' | 'maqam-only';
export type PositionFilter = HandPosition;

export interface BoardNote {
  id: string;
  stringIndex: number; // 0 (IV) to 3 (I)
  stringName: string;
  noteKey: string;
  sharpName: string;
  flatName: string;
  halfFlatName: string;
  arabicName: string;
  semitoneIndex: number; // 0 to 12
  isQuarterTone: boolean;
  baseMidi: number;
  quarterOffset: number;
  commaOffset: number;
  x: number;
  y: number;
  fingerTape?: 'open' | '1st' | '2nd-neutral' | '2nd' | '3rd' | '4th' | 'other';
}

const ENHARMONIC_MAP: Record<string, string> = {
  'c#': 'db',
  'db': 'c#',
  'd#': 'eb',
  'eb': 'd#',
  'f#': 'gb',
  'gb': 'f#',
  'g#': 'ab',
  'ab': 'g#',
  'a#': 'bb',
  'bb': 'a#',
};

export const areNotesEquivalent = (n1?: string | null, n2?: string | null): boolean => {
  if (!n1 || !n2) return false;
  const s1 = n1.trim().toLowerCase();
  const s2 = n2.trim().toLowerCase();
  if (s1 === s2) return true;
  const m1 = s1.match(/^([a-g][#bd]?)([0-9])$/);
  const m2 = s2.match(/^([a-g][#bd]?)([0-9])$/);
  if (m1 && m2 && m1[2] === m2[2]) {
    if (ENHARMONIC_MAP[m1[1]] === m2[1]) return true;
  }
  return false;
};

export const ViolinFingerboard: React.FC<FingerboardProps> = ({
  currentMaqam,
  tuningSystem,
  violinTuning,
  activePlayingNote,
  onNoteTrigger,
}) => {
  const [namingMode, setNamingMode] = useState<AccidentalNaming>('sharps');
  const [playMode, setPlayMode] = useState<PlayMode>('bow');
  const [handPosition, setHandPosition] = useState<HandPosition>('1st');
  const [scaleFilter, setScaleFilter] = useState<ScaleFilterMode>('all-notes');
  const [showQuarterTones, setShowQuarterTones] = useState<boolean>(true);
  const [isStringsReversed, setIsStringsReversed] = useState<boolean>(false);
  const [hoveredNote, setHoveredNote] = useState<BoardNote | null>(null);

  // Define string setup: IV (lowest pitch) down to I (highest pitch), or reversed (I to IV)
  const baseStrings = violinTuning === 'arabic'
    ? [
        { id: 'string-4', name: 'IV', letter: 'G', openNote: 'G3', openMidi: 55, arabic: 'Yakah' },
        { id: 'string-3', name: 'III', letter: 'D', openNote: 'D4', openMidi: 62, arabic: 'Dukah' },
        { id: 'string-2', name: 'II', letter: 'G', openNote: 'G4', openMidi: 67, arabic: 'Nawa' },
        { id: 'string-1', name: 'I', letter: 'D', openNote: 'D5', openMidi: 74, arabic: 'Muhayar' }
      ]
    : [
        { id: 'string-4', name: 'IV', letter: 'G', openNote: 'G3', openMidi: 55, arabic: 'Yakah' },
        { id: 'string-3', name: 'III', letter: 'D', openNote: 'D4', openMidi: 62, arabic: 'Dukah' },
        { id: 'string-2', name: 'II', letter: 'A', openNote: 'A4', openMidi: 69, arabic: 'Husayni' },
        { id: 'string-1', name: 'I', letter: 'E', openNote: 'E5', openMidi: 76, arabic: 'Busalik' }
      ];

  const stringSetup = isStringsReversed ? [...baseStrings].reverse() : baseStrings;

  // Geometric coordinates for tapered fingerboard
  const SVG_WIDTH = 1140;
  const SVG_HEIGHT = 310;
  const NUT_X = 142;
  const NUT_WIDTH = 9;
  const BOARD_START_X = 150;
  const BOARD_END_X = 1110;

  // Board height narrows at Nut (left) and tapers wider towards Bridge (right)
  const NUT_TOP_Y = 56;
  const NUT_BOTTOM_Y = 246;
  const END_TOP_Y = 32;
  const END_BOTTOM_Y = 270;

  // String Y coordinates at Nut and at End
  const STRING_Y_NUT = [80, 126, 174, 222]; // IV, III, II, I
  const STRING_Y_END = [62, 118, 184, 240];

  const getStringY = (stringIndex: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - NUT_X) / (BOARD_END_X - NUT_X)));
    const yNut = STRING_Y_NUT[stringIndex];
    const yEnd = STRING_Y_END[stringIndex];
    return yNut + t * (yEnd - yNut);
  };

  // Semitone column positions (0 = open string at X=85, 1..12 across the neck)
  const SEMITONE_X_COORDS: Record<number, number> = {
    0: 88, // open string pegbox
    1: 215,
    2: 290, // 1st finger
    3: 365,
    4: 440, // 2nd finger
    5: 515, // 3rd finger
    6: 590,
    7: 665, // 4th finger
    8: 740,
    9: 815,
    10: 890,
    11: 965,
    12: 1040,
  };

  // Standard chromatic pitch dictionary
  const PITCH_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const PITCH_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Generate board notes
  const boardNotes: BoardNote[] = [];

  stringSetup.forEach((str, sIdx) => {
    // Semitones 0 to 12
    for (let semitone = 0; semitone <= 12; semitone++) {
      const midi = str.openMidi + semitone;
      const octave = Math.floor(midi / 12) - 1;
      const pitchIdx = midi % 12;

      const sharpName = `${PITCH_NAMES_SHARP[pitchIdx]}${octave}`;
      const flatName = `${PITCH_NAMES_FLAT[pitchIdx]}${octave}`;
      const noteKey = sharpName;
      const arabicEntry = ARABIC_NOTE_DICTIONARY[noteKey] || ARABIC_NOTE_DICTIONARY[flatName];
      const arabicName = arabicEntry?.arabic || '';

      const x = SEMITONE_X_COORDS[semitone] ?? (BOARD_START_X + semitone * 75);
      const y = semitone === 0 ? STRING_Y_NUT[sIdx] : getStringY(sIdx, x);

      let fingerTape: BoardNote['fingerTape'] = 'other';
      if (semitone === 0) fingerTape = 'open';
      else if (semitone === 2) fingerTape = '1st';
      else if (semitone === 4) fingerTape = '2nd';
      else if (semitone === 5) fingerTape = '3rd';
      else if (semitone === 7) fingerTape = '4th';

      boardNotes.push({
        id: `${str.id}-semi-${semitone}`,
        stringIndex: sIdx,
        stringName: str.name,
        noteKey,
        sharpName,
        flatName,
        halfFlatName: sharpName,
        arabicName,
        semitoneIndex: semitone,
        isQuarterTone: false,
        baseMidi: midi,
        quarterOffset: 0,
        commaOffset: Math.round(semitone * (53 / 12)),
        x,
        y,
        fingerTape,
      });

      // Special Arabic Quarter-tones (half-flats): Sikah (Ed4), Awj (Bd4), Iraq (Bd3), etc.
      // Insert intermediate microtonal nodes between steps (e.g. at semitone + 0.5)
      if (showQuarterTones && semitone < 12) {
        let isAuthenticQuarter = false;
        let qName = '';
        let qOffset = 1;

        // Check if this step corresponds to quintessential Arabic quarter tones
        if (str.openNote === 'D4' && semitone === 1) {
          // Ed4 (Sikah) is 1.5 semitones above D4 (between Eb4 and E4)
          isAuthenticQuarter = true;
          qName = 'Ed4';
        } else if ((str.openNote === 'G4' || str.openNote === 'G3') && semitone === 3) {
          // Bd4 (Awj) or Bd3 (Iraq) is 3.5 semitones above G (between Bb and B)
          isAuthenticQuarter = true;
          qName = str.openNote === 'G4' ? 'Bd4' : 'Bd3';
        } else if (str.openNote === 'A4' && semitone === 1) {
          // Bd4 (Awj) on Western A string
          isAuthenticQuarter = true;
          qName = 'Bd4';
        } else if (str.openNote === 'D5' && semitone === 1) {
          // Ed5 (Buzurk)
          isAuthenticQuarter = true;
          qName = 'Ed5';
        } else if (str.openNote === 'G4' && semitone === 1) {
          // Ad4 (nim Ajam)
          isAuthenticQuarter = true;
          qName = 'Ad4';
        }

        if (isAuthenticQuarter) {
          const nextX = SEMITONE_X_COORDS[semitone + 1] || x + 75;
          const qX = (x + nextX) / 2;
          const qY = getStringY(sIdx, qX);
          const arabicQ = ARABIC_NOTE_DICTIONARY[qName]?.arabic || '';

          boardNotes.push({
            id: `${str.id}-quarter-${semitone}`,
            stringIndex: sIdx,
            stringName: str.name,
            noteKey: qName,
            sharpName: qName,
            flatName: qName,
            halfFlatName: qName,
            arabicName: arabicQ,
            semitoneIndex: semitone,
            isQuarterTone: true,
            baseMidi: midi,
            quarterOffset: qOffset,
            commaOffset: Math.round((semitone + 0.5) * (53 / 12)),
            x: qX,
            y: qY,
            fingerTape: '2nd-neutral',
          });
        }
      }
    }
  });

  // Play sound handler (Bow vs Pizzicato)
  const handlePlay = (note: BoardNote) => {
    const freq = audioEngine.calculateFrequency(
      note.baseMidi,
      note.quarterOffset,
      tuningSystem,
      note.commaOffset
    );

    if (playMode === 'bow') {
      audioEngine.playNote(freq, 1.25);
    } else {
      audioEngine.playPizzicato(freq, 1.1);
    }

    onNoteTrigger(note.noteKey, freq);
  };

  // Quick tune open string trigger
  const handleTuneString = (sIdx: number) => {
    const str = stringSetup[sIdx];
    const openNote = boardNotes.find(n => n.stringIndex === sIdx && n.semitoneIndex === 0);
    if (openNote) {
      handlePlay(openNote);
    } else {
      const freq = audioEngine.calculateFrequency(str.openMidi, 0, tuningSystem, 0);
      audioEngine.playNote(freq, 1.2);
      onNoteTrigger(str.openNote, freq);
    }
  };

  // Filtering based on position tabs and scale filter
  const isNoteVisible = (n: BoardNote): boolean => {
    // If active audition note is playing, always keep visible for real-time tracking
    if (activePlayingNote && areNotesEquivalent(activePlayingNote, n.noteKey)) {
      return true;
    }

    // 1. Position range filter (1st, 2nd, 3rd, 4th, or all)
    let inPositionRange = true;
    if (handPosition === '1st') {
      // 1st position: open string (0) through 4th finger (7)
      inPositionRange = n.semitoneIndex <= 7;
    } else if (handPosition === '2nd') {
      // 2nd position: semitones 2 to 9 (plus open strings)
      inPositionRange = (n.semitoneIndex >= 2 && n.semitoneIndex <= 9) || n.semitoneIndex === 0;
    } else if (handPosition === '3rd') {
      // 3rd position: semitones 4 to 11 (plus open strings)
      inPositionRange = (n.semitoneIndex >= 4 && n.semitoneIndex <= 11) || n.semitoneIndex === 0;
    } else if (handPosition === '4th') {
      // 4th position: semitones 6 to 12 (plus open strings)
      inPositionRange = n.semitoneIndex >= 6 || n.semitoneIndex === 0;
    } else if (handPosition === 'all') {
      inPositionRange = true;
    }

    if (!inPositionRange) return false;

    // 2. Note filter (either All (0-12) notes within that position, or Maqam Scale Only)
    if (scaleFilter === 'maqam-only') {
      return currentMaqam.scaleNotes.some(sn => areNotesEquivalent(sn, n.noteKey));
    }

    // 'all-notes': shows all notes within the position
    return true;
  };

  // Format label based on accidental naming preference
  const getNoteDisplayLabel = (n: BoardNote): string => {
    if (n.isQuarterTone) {
      return n.noteKey.replace('d', '𝄳');
    }
    if (namingMode === 'flats') {
      return n.flatName;
    }
    if (namingMode === 'arabic') {
      const shortArabic = n.arabicName.split(' ')[0] || n.sharpName;
      return shortArabic;
    }
    if (namingMode === 'halfflats' && n.noteKey.includes('d')) {
      return n.noteKey.replace('d', '𝄳');
    }
    return n.sharpName;
  };

  return (
    <div className="w-full bg-panel-deep border border-cyan-950/70 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_var(--glow-cyan)] relative overflow-hidden backdrop-blur-xl">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-wide text-ink-strong flex items-center gap-2">
              <span className="text-amber-400">Violin Fingerboard</span>
              <span className="text-xs font-serif text-amber-300 font-normal">لوحة أصابع الكمان</span>
            </h2>
            <span className="text-[11px] bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 px-2.5 py-0.5 rounded-full font-mono">
              {violinTuning === 'arabic'
                ? (isStringsReversed ? 'Arabic (Reversed): D5-G4-D4-G3' : 'Arabic: G3-D4-G4-D5')
                : (isStringsReversed ? 'Western (Reversed): E5-A4-D4-G3' : 'Western: G3-D4-A4-E5')}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Tapered fretless ebony neck with authentic microtone guides and bowing dynamics.
          </p>
        </div>

        {/* Top Right Action Pills (matching image inspiration) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Global Accidental Naming */}
          <button
            type="button"
            onClick={() => {
              const modes: AccidentalNaming[] = ['sharps', 'flats', 'arabic'];
              const next = modes[(modes.indexOf(namingMode) + 1) % modes.length];
              setNamingMode(next);
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase border border-cyan-600/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer active:scale-95"
          >
            Naming: <span className="font-bold text-ink-strong">{namingMode === 'sharps' ? 'Sharps (#)' : namingMode === 'flats' ? 'Flats (♭)' : 'Arabic Names'}</span>
          </button>

          {/* Bow vs Pizzicato */}
          <button
            type="button"
            onClick={() => setPlayMode(prev => prev === 'bow' ? 'pizzicato' : 'bow')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
              playMode === 'bow'
                ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
          >
            <span>{playMode === 'bow' ? '🎻 Bow Mode (قوس)' : '🪕 Pizzicato (نقر)'}</span>
          </button>

          {/* Microtone Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowQuarterTones(prev => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
              showQuarterTones
                ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
                : 'border-line-strong bg-surface text-ink-muted'
            }`}
          >
            <span>{showQuarterTones ? 'Quarter-Tones: On 𝄳' : '12-TET Only'}</span>
          </button>

          {/* Reverse Strings Order Button */}
          <button
            type="button"
            onClick={() => setIsStringsReversed(prev => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              isStringsReversed
                ? 'border-cyan-500/70 bg-cyan-950/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'border-line-strong bg-surface text-ink hover:border-line-strong hover:text-ink-strong'
            }`}
            title="Reverse strings order (G3 D4 G4 D5 <-> D5 G4 D4 G3)"
          >
            <span>⇄ Reverse Strings:</span>
            <span className="font-mono font-bold text-amber-300">
              {isStringsReversed
                ? (violinTuning === 'arabic' ? 'D5 G4 D4 G3' : 'E5 A4 D4 G3')
                : (violinTuning === 'arabic' ? 'G3 D4 G4 D5' : 'G3 D4 A4 E5')}
            </span>
          </button>
        </div>
      </div>

      {/* Tapered Fingerboard SVG Stage */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin select-none">
        <div className="min-w-[980px] relative">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-auto drop-shadow-2xl"
            style={{ minHeight: '270px' }}
          >
            <defs>
              {/* Authentic African Ebony Camber Gradient (arched cylindrical crown across neck) */}
              <linearGradient id="ebonyCamber" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2c2621" />
                <stop offset="3%" stopColor="#1c1815" />
                <stop offset="15%" stopColor="#13100e" />
                <stop offset="46%" stopColor="#1e1915" />
                <stop offset="52%" stopColor="#251f1a" />
                <stop offset="60%" stopColor="#1c1814" />
                <stop offset="85%" stopColor="#13100e" />
                <stop offset="97%" stopColor="#0b0908" />
                <stop offset="100%" stopColor="#040303" />
              </linearGradient>

              {/* Ebony Wood Grain Fiber Pattern */}
              <pattern id="ebonyGrain" width="240" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="7" x2="240" y2="8" stroke="#ffffff" strokeWidth="0.45" strokeOpacity="0.02" />
                <line x1="0" y1="15" x2="240" y2="14" stroke="#000000" strokeWidth="0.8" strokeOpacity="0.5" />
                <line x1="0" y1="24" x2="240" y2="25" stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.018" />
                <line x1="0" y1="33" x2="240" y2="32" stroke="#000000" strokeWidth="0.65" strokeOpacity="0.45" />
              </pattern>

              {/* Carved Flamed Maple Neck Wood Strip (peeking below the ebony board) */}
              <linearGradient id="mapleNeck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3d2314" />
                <stop offset="20%" stopColor="#55321a" />
                <stop offset="40%" stopColor="#3c2212" />
                <stop offset="65%" stopColor="#522f18" />
                <stop offset="85%" stopColor="#381f10" />
                <stop offset="100%" stopColor="#27150a" />
              </linearGradient>

              {/* Pegbox Aged Maple Wood */}
              <linearGradient id="pegboxWood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e120a" />
                <stop offset="45%" stopColor="#140b06" />
                <stop offset="100%" stopColor="#070402" />
              </linearGradient>

              {/* Aged Ivory / Bone Nut Gradient */}
              <linearGradient id="ivoryNut" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#faf6ee" />
                <stop offset="30%" stopColor="#f1e7d4" />
                <stop offset="70%" stopColor="#e2d4bd" />
                <stop offset="100%" stopColor="#baaa8d" />
              </linearGradient>

              {/* Nut Contact Shadow (fading onto ebony fingerboard) */}
              <linearGradient id="nutShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 0, 0, 0.85)" />
                <stop offset="40%" stopColor="rgba(0, 0, 0, 0.4)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </linearGradient>

              {/* Mother-of-Pearl Inlay Dots */}
              <radialGradient id="pearlInlay" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#e2e8f0" />
                <stop offset="85%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>

              {/* Real String Metal Textures */}
              {/* String IV: Wound Silver / Nickel */}
              <linearGradient id="stringG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              {/* String III: Aluminum / Silver Wound */}
              <linearGradient id="stringD" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="35%" stopColor="#e2e8f0" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#71717a" />
              </linearGradient>

              {/* String II: Polished Chrome / Steel */}
              <linearGradient id="stringA" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#f1f5f9" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* String I: High-tensile Golden Steel */}
              <linearGradient id="stringE" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Deep 3D Instrument Drop Shadows */}
              <filter id="neck3DShadow" x="-5%" y="-15%" width="110%" height="145%">
                <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#000000" floodOpacity="0.95" />
              </filter>

              <filter id="stringShadow" x="-5%" y="-20%" width="110%" height="180%">
                <feDropShadow dx="0" dy="2.8" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Layer 1: Ambient Drop Shadow of the Fingerboard */}
            <polygon
              points={`${BOARD_START_X},${NUT_TOP_Y} ${BOARD_END_X},${END_TOP_Y} ${BOARD_END_X},${END_BOTTOM_Y + 14} ${BOARD_START_X},${NUT_BOTTOM_Y + 10}`}
              fill="#000000"
              filter="url(#neck3DShadow)"
              opacity="0.95"
            />

            {/* Layer 2: Pegbox / Open String Area Background (Varnished Maple Trough) */}
            <rect
              x="20"
              y="40"
              width={NUT_X - 20}
              height="230"
              rx="10"
              fill="url(#pegboxWood)"
              stroke="#3a2214"
              strokeWidth="1.8"
            />
            {/* Pegbox inner dark trough */}
            <rect
              x="26"
              y="46"
              width={NUT_X - 32}
              height="218"
              rx="7"
              fill="#080402"
              stroke="#211208"
              strokeWidth="1.2"
            />

            {/* Layer 3: Flamed Maple Neck Wood Strip (Visible below the ebony fingerboard bevel) */}
            <polygon
              points={`${BOARD_START_X},${NUT_BOTTOM_Y - 1} ${BOARD_END_X},${END_BOTTOM_Y - 1} ${BOARD_END_X},${END_BOTTOM_Y + 8} ${BOARD_START_X},${NUT_BOTTOM_Y + 6}`}
              fill="url(#mapleNeck)"
              stroke="#261409"
              strokeWidth="0.8"
            />

            {/* Layer 4: Solid Ebony Fingerboard with Camber Curve */}
            <polygon
              points={`${BOARD_START_X},${NUT_TOP_Y} ${BOARD_END_X},${END_TOP_Y} ${BOARD_END_X},${END_BOTTOM_Y} ${BOARD_START_X},${NUT_BOTTOM_Y}`}
              fill="url(#ebonyCamber)"
              stroke="#3d332a"
              strokeWidth="1.6"
            />

            {/* Layer 5: Wood Grain Texture Overlay */}
            <polygon
              points={`${BOARD_START_X},${NUT_TOP_Y} ${BOARD_END_X},${END_TOP_Y} ${BOARD_END_X},${END_BOTTOM_Y} ${BOARD_START_X},${NUT_BOTTOM_Y}`}
              fill="url(#ebonyGrain)"
              opacity="0.9"
            />

            {/* Layer 6: Top and Bottom Edge Chamfer Highlight Lines */}
            <line
              x1={BOARD_START_X}
              y1={NUT_TOP_Y}
              x2={BOARD_END_X}
              y2={END_TOP_Y}
              stroke="rgba(245, 230, 211, 0.28)"
              strokeWidth="1.6"
            />
            <line
              x1={BOARD_START_X}
              y1={NUT_BOTTOM_Y}
              x2={BOARD_END_X}
              y2={END_BOTTOM_Y}
              stroke="rgba(0, 0, 0, 0.85)"
              strokeWidth="2.4"
            />

            {/* Layer 7: Fretless Intonation Marker Lines across all 12 semitones */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => {
              const xPos = SEMITONE_X_COORDS[s];
              if (!xPos) return null;
              const t = (xPos - NUT_X) / (BOARD_END_X - NUT_X);
              const topY = NUT_TOP_Y + t * (END_TOP_Y - NUT_TOP_Y);
              const botY = NUT_BOTTOM_Y + t * (END_BOTTOM_Y - NUT_BOTTOM_Y);

              const isPrimaryFinger = s === 2 || s === 4 || s === 5 || s === 7;
              const isSikahQuarter = s === 3; // Neutral 2nd in Arabic tradition
              const fingerLabel = s === 2 ? '1' : s === 4 ? '2' : s === 5 ? '3' : s === 7 ? '4' : null;

              return (
                <g key={`fret-marker-${s}`}>
                  {/* Subtle Translucent Finger Tape Guide Band (for primary positions) */}
                  {isPrimaryFinger && (
                    <rect
                      x={xPos - 8}
                      y={topY}
                      width="16"
                      height={botY - topY}
                      fill="rgba(56, 189, 248, 0.06)"
                      rx="2"
                    />
                  )}

                  {/* Fret Marker Line Inlay */}
                  <line
                    x1={xPos}
                    y1={topY}
                    x2={xPos}
                    y2={botY}
                    stroke={
                      isPrimaryFinger
                        ? 'rgba(255, 255, 255, 0.24)'
                        : isSikahQuarter
                        ? 'rgba(245, 158, 11, 0.32)'
                        : 'rgba(255, 255, 255, 0.08)'
                    }
                    strokeWidth={isPrimaryFinger ? 1.2 : isSikahQuarter ? 1.1 : 0.75}
                    strokeDasharray={isSikahQuarter ? '3 2' : 'none'}
                  />

                  {/* Finger Number above neck */}
                  {fingerLabel && (
                    <text
                      x={xPos}
                      y={topY - 11}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                    >
                      {fingerLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Layer 8: Inlaid Mother-of-Pearl Position Dots along the top neck rail */}
            {[
              { s: 3, double: false },  // Minor 3rd
              { s: 5, double: false },  // 3rd Finger (4th)
              { s: 7, double: false },  // 4th Finger (5th)
              { s: 9, double: false },  // Major 6th
              { s: 12, double: true },  // Octave double-dot
            ].map(dot => {
              const xPos = SEMITONE_X_COORDS[dot.s];
              if (!xPos) return null;
              const t = (xPos - NUT_X) / (BOARD_END_X - NUT_X);
              const topY = NUT_TOP_Y + t * (END_TOP_Y - NUT_TOP_Y);

              return (
                <g key={`pearl-dot-${dot.s}`}>
                  {dot.double ? (
                    <>
                      <circle cx={xPos - 4} cy={topY - 4.5} r="2.8" fill="url(#pearlInlay)" stroke="#1a1410" strokeWidth="0.8" />
                      <circle cx={xPos + 4} cy={topY - 4.5} r="2.8" fill="url(#pearlInlay)" stroke="#1a1410" strokeWidth="0.8" />
                    </>
                  ) : (
                    <circle cx={xPos} cy={topY - 4.5} r="3.2" fill="url(#pearlInlay)" stroke="#1a1410" strokeWidth="0.8" />
                  )}
                </g>
              );
            })}

            {/* Layer 9: Nut Contact Drop Shadow onto the Ebony Board */}
            <rect
              x={NUT_X + NUT_WIDTH / 2}
              y={NUT_TOP_Y}
              width="14"
              height={NUT_BOTTOM_Y - NUT_TOP_Y}
              fill="url(#nutShadow)"
            />

            {/* Layer 10: Aged Bone / Ivory Nut */}
            <rect
              x={NUT_X - NUT_WIDTH / 2}
              y={NUT_TOP_Y - 4}
              width={NUT_WIDTH}
              height={NUT_BOTTOM_Y - NUT_TOP_Y + 8}
              rx="3"
              fill="url(#ivoryNut)"
              stroke="#8c775a"
              strokeWidth="1.2"
              className="drop-shadow-md"
            />

            {/* Nut String Notches */}
            {stringSetup.map((str, sIdx) => {
              const yStart = STRING_Y_NUT[sIdx];
              return (
                <circle
                  key={`nut-notch-${str.id}`}
                  cx={NUT_X}
                  cy={yStart}
                  r="2"
                  fill="#24170e"
                  opacity="0.85"
                />
              );
            })}

            {/* Layer 11: Real Metallic Strings with Floating 3D Shadows */}
            {stringSetup.map((str, sIdx) => {
              const yStart = STRING_Y_NUT[sIdx];
              const yEnd = STRING_Y_END[sIdx];
              const gaugeByRegister: Record<string, number> = {
                'IV': 3.8,
                'III': 3.0,
                'II': 2.2,
                'I': 1.5,
              };
              const strokeThickness = gaugeByRegister[str.name] ?? (3.8 - sIdx * 0.75);

              // Select authentic metallic shader according to register
              const stringShader = str.name === 'IV'
                ? 'url(#stringG)'
                : str.name === 'III'
                ? 'url(#stringD)'
                : str.name === 'II'
                ? 'url(#stringA)'
                : 'url(#stringE)';

              return (
                <g key={`string-line-${str.id}`}>
                  {/* Open String Letter on the far left */}
                  <text
                    x="45"
                    y={yStart + 5.5}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="18"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="select-none drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                  >
                    {str.letter}
                  </text>

                  {/* Open String Pegbox wire with shadow */}
                  <line
                    x1="65"
                    y1={yStart + 2}
                    x2={NUT_X}
                    y2={yStart + 2}
                    stroke="rgba(0,0,0,0.85)"
                    strokeWidth={strokeThickness + 1}
                  />
                  <line
                    x1="65"
                    y1={yStart}
                    x2={NUT_X}
                    y2={yStart}
                    stroke={stringShader}
                    strokeWidth={strokeThickness}
                  />

                  {/* 3D Realistic String Drop Shadow directly cast onto the ebony wood */}
                  <line
                    x1={NUT_X + NUT_WIDTH / 2}
                    y1={yStart + 3.2}
                    x2={BOARD_END_X + 10}
                    y2={yEnd + 3.6}
                    stroke="rgba(0, 0, 0, 0.78)"
                    strokeWidth={strokeThickness + 1.2}
                    strokeLinecap="round"
                    filter="url(#stringShadow)"
                  />

                  {/* Vibrating Metallic String Wire */}
                  <line
                    x1={NUT_X + NUT_WIDTH / 2}
                    y1={yStart}
                    x2={BOARD_END_X + 10}
                    y2={yEnd}
                    stroke={stringShader}
                    strokeWidth={strokeThickness}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]"
                  />

                  {/* High Specular Wire Sheen on top of the wire */}
                  <line
                    x1={NUT_X + NUT_WIDTH / 2}
                    y1={yStart - 0.5}
                    x2={BOARD_END_X + 10}
                    y2={yEnd - 0.5}
                    stroke="#ffffff"
                    strokeWidth={Math.max(0.6, strokeThickness * 0.35)}
                    strokeOpacity="0.45"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* Layer 12: Note Pins & Nodes */}
            {boardNotes.filter(isNoteVisible).map((note) => {
              const inMaqam = currentMaqam.scaleNotes.some(sn => areNotesEquivalent(sn, note.noteKey));
              const isTonicNote = areNotesEquivalent(currentMaqam.scaleNotes[0], note.noteKey);
              const isGhammazNote = areNotesEquivalent(currentMaqam.scaleNotes[4], note.noteKey);
              const isActive = areNotesEquivalent(activePlayingNote, note.noteKey);

              const displayLabel = getNoteDisplayLabel(note);
              const isHovered = hoveredNote?.id === note.id;

              // Node radius
              const radius = note.semitoneIndex === 0 ? 15 : note.isQuarterTone ? 13 : 14.5;

              return (
                <g
                  key={note.id}
                  transform={`translate(${note.x}, ${note.y})`}
                  onClick={() => handlePlay(note)}
                  onMouseEnter={() => setHoveredNote(note)}
                  onMouseLeave={() => setHoveredNote(null)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Animated Active Ripple Ring */}
                  {isActive && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      opacity="0.9"
                      className="animate-ping"
                    />
                  )}

                  {/* Pin Drop Shadow */}
                  <circle
                    r={radius}
                    cx="0"
                    cy="2.5"
                    fill="rgba(0, 0, 0, 0.75)"
                    filter="blur(1.5px)"
                  />

                  {/* Node Background Circle (Tactile Ebony / Jewel Inlay) */}
                  <circle
                    r={radius}
                    fill={
                      isActive
                        ? '#fbbf24'
                        : isTonicNote
                        ? '#f59e0b'
                        : isGhammazNote
                        ? '#06b6d4'
                        : inMaqam
                        ? '#059669'
                        : note.isQuarterTone
                        ? '#1c1917'
                        : 'rgba(15, 13, 12, 0.95)'
                    }
                    stroke={
                      isActive
                        ? '#ffffff'
                        : isTonicNote
                        ? '#fde68a'
                        : isGhammazNote
                        ? '#67e8f9'
                        : inMaqam
                        ? '#a7f3d0'
                        : isHovered
                        ? '#38bdf8'
                        : note.isQuarterTone
                        ? '#f59e0b'
                        : '#3e3832'
                    }
                    strokeWidth={isActive || isTonicNote || isGhammazNote ? 2.5 : inMaqam ? 2 : 1.4}
                    className="transition-all duration-150"
                  />

                  {/* Main Note Label */}
                  <text
                    x="0"
                    y={note.semitoneIndex === 0 ? 4 : -1}
                    textAnchor="middle"
                    fill={
                      isActive
                        ? '#090d16'
                        : isTonicNote
                        ? '#18181b'
                        : isGhammazNote
                        ? '#082f49'
                        : inMaqam
                        ? '#ffffff'
                        : note.isQuarterTone
                        ? '#fbbf24'
                        : '#e2e8f0'
                    }
                    fontSize={note.semitoneIndex === 0 ? '11.5' : '10'}
                    fontWeight={isActive || isTonicNote || inMaqam ? 'bold' : '600'}
                    fontFamily="sans-serif"
                    className="select-none pointer-events-none"
                  >
                    {displayLabel}
                  </text>

                  {/* Semitone Index Number Underneath */}
                  {note.semitoneIndex > 0 && !note.isQuarterTone && (
                    <text
                      x="0"
                      y="9.5"
                      textAnchor="middle"
                      fill={
                        isActive || isTonicNote || isGhammazNote
                          ? '#000000'
                          : inMaqam
                          ? '#d1fae5'
                          : '#94a3b8'
                      }
                      fontSize="8"
                      fontWeight="600"
                      fontFamily="monospace"
                      className="select-none pointer-events-none"
                    >
                      {note.semitoneIndex}
                    </text>
                  )}

                  {/* Quarter tone half-flat symbol underneath */}
                  {note.isQuarterTone && (
                    <text
                      x="0"
                      y="8.5"
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                    >
                      𝄳
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Helper instruction line (from image inspiration) */}
      <div className="text-center text-xs text-ink-muted mt-2 mb-4 font-normal">
        Hold a note to sustain in bow mode, or tap to pluck in pizzicato mode. The small number is the semitone position above the open string.
      </div>

      {/* Bottom Bar: Position Selector & Note Display Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-line/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Position Buttons (1-4) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-xs text-ink-muted font-medium whitespace-nowrap">Position:</span>
            {[
              { id: '1st', label: '1st' },
              { id: '2nd', label: '2nd' },
              { id: '3rd', label: '3rd' },
              { id: '4th', label: '4th' },
              { id: 'all', label: 'All (1-4)' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHandPosition(tab.id as HandPosition)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  handPosition === tab.id
                    ? 'bg-blue-600 text-on-solid font-bold shadow-[0_0_12px_rgba(37,99,235,0.6)] ring-1 ring-blue-400'
                    : 'bg-surface border border-line text-ink-muted hover:text-ink-strong hover:bg-raised'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-raised hidden sm:block" />

          {/* 2. Note Display Filter: All (0-12) vs Maqam Scale Only */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScaleFilter('all-notes')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                scaleFilter === 'all-notes'
                  ? 'bg-raised text-on-accent font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)] ring-1 ring-white'
                  : 'bg-surface border border-line text-ink-muted hover:text-ink-strong hover:bg-raised'
              }`}
            >
              All (0-12)
            </button>
            <button
              type="button"
              onClick={() => setScaleFilter('maqam-only')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                scaleFilter === 'maqam-only'
                  ? 'bg-emerald-600 text-on-solid font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400/80 ring-1 ring-emerald-300'
                  : 'bg-surface border border-line text-ink-muted hover:text-ink-strong hover:bg-raised'
              }`}
            >
              Maqam Scale Only
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-ink">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span>Tonic (Qarar)</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink">
            <span className="w-3 h-3 rounded-full bg-cyan-500 border border-cyan-300" />
            <span>Dominant (Ghammaz)</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400" />
            <span>Maqam Degree</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-3 rounded-full bg-surface border border-amber-500" />
            <span>𝄳 Half-Flat</span>
          </div>
        </div>
      </div>

      {/* Tune Open Strings Bar (direct inspiration from image) */}
      <div className="mt-4 pt-3 border-t border-line/80">
        <div className="text-xs text-emerald-400 font-semibold mb-2">
          Tune open strings (دوزان الأوتار المطلقة)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stringSetup.map((str, sIdx) => {
            const isPlayingThisString = activePlayingNote && areNotesEquivalent(activePlayingNote, str.openNote);

            return (
              <button
                key={`tune-${str.id}`}
                type="button"
                onClick={() => handleTuneString(sIdx)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isPlayingThisString
                    ? 'border-amber-400 bg-amber-950/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'border-blue-900/60 bg-blue-950/30 text-ink hover:border-blue-500/80 hover:bg-blue-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">{str.name}</span>
                  <span className="text-sm font-bold text-ink-strong">{str.letter}</span>
                  <span className="text-xs font-mono text-ink-muted">{str.openNote}</span>
                </div>
                <span className="text-xs font-serif text-amber-300/90">{str.arabic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Inspector Status Bar */}
      <div className="mt-4 pt-3 border-t border-line/80 flex flex-wrap items-center justify-between text-xs text-ink-muted gap-2">
        <div>
          {activePlayingNote ? (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-full text-amber-300 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className="font-semibold">Now Sounding: {activePlayingNote}</span>
              {ARABIC_NOTE_DICTIONARY[activePlayingNote]?.arabic && (
                <span className="text-amber-200 font-serif">({ARABIC_NOTE_DICTIONARY[activePlayingNote]?.arabic})</span>
              )}
            </div>
          ) : hoveredNote ? (
            <div className="flex items-center gap-2">
              <span className="text-ink font-medium">Hovered Pitch:</span>
              <span className="text-amber-400 font-bold text-sm">{hoveredNote.noteKey}</span>
              <span className="text-emerald-400 font-serif">
                {hoveredNote.arabicName || ''}
              </span>
              <span className="text-ink-faint font-mono">
                ({audioEngine.calculateFrequency(hoveredNote.baseMidi, hoveredNote.quarterOffset, tuningSystem, hoveredNote.commaOffset).toFixed(1)} Hz)
              </span>
            </div>
          ) : (
            <span>Tap notes above to play with realistic violin dynamics. Open strings can be auditioned below.</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-ink-faint font-mono text-[11px]">
          <span>Mode: {playMode.toUpperCase()}</span>
          <span>•</span>
          <span>Tuning: {tuningSystem}</span>
          <span>•</span>
          <span>A4=440Hz</span>
        </div>
      </div>
    </div>
  );
};
