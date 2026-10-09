import React, { useState, useMemo } from 'react';
import { X, Play, Check, Music, ArrowRight, Sparkles, Layers, RefreshCw, Copy } from 'lucide-react';
import { MaqamScale, TuningSystem, ARABIC_NOTE_DICTIONARY } from '../types/maqam';
import { AJNAS_DATASET, JinsDefinition } from '../data/ajnas';
import { MAQAM_DATASET } from '../data/maqamat';
import { audioEngine } from '../services/audioEngine';

interface MaqamBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tuningSystem: TuningSystem;
  onApplyMaqam: (builtScale: MaqamScale) => void;
}

interface SelectedJinsSlot {
  jinsId: string;
  tonicNote: string;
}

export const MaqamBuilderDrawer: React.FC<MaqamBuilderDrawerProps> = ({
  isOpen,
  onClose,
  tuningSystem,
  onApplyMaqam,
}) => {
  // Selected Jins slots (Slot 1: Root Asl, Slot 2: Secondary Far', Slot 3: Optional)
  const [slot1, setSlot1] = useState<SelectedJinsSlot>({ jinsId: 'rast', tonicNote: 'C4' });
  const [slot2, setSlot2] = useState<SelectedJinsSlot>({ jinsId: 'rast', tonicNote: 'G4' });
  const [includeSlot3, setIncludeSlot3] = useState<boolean>(false);
  const [slot3, setSlot3] = useState<SelectedJinsSlot>({ jinsId: 'nahwand', tonicNote: 'C5' });

  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Available notes for tonics (covering both central and lower registers)
  const AVAILABLE_TONIC_NOTES = [
    'C3', 'D3', 'Ed3', 'F3', 'G3', 'A3', 'Bb3', 'Bd3', 
    'C4', 'D4', 'Ed4', 'F4', 'G4', 'A4', 'Bd4', 'C5'
  ];

  // Pitch helper for constructing scale notes from intervals
  const notePitchMap: Record<string, number> = {
    'C3': 48, 'C#3': 49, 'Db3': 49, 'Cd3': 48.5,
    'D3': 50, 'D#3': 51, 'Eb3': 51, 'Ed3': 51.5,
    'E3': 52,
    'F3': 53, 'F#3': 54, 'Gb3': 54, 'Fd3': 53.5,
    'G3': 55, 'G#3': 56, 'Ab3': 56, 'Gd3': 55.5,
    'A3': 57, 'Bb3': 58, 'Ad3': 57.5,
    'B3': 59, 'Bd3': 58.5,
    'C4': 60, 'C#4': 61, 'Db4': 61, 'Cd4': 60.5,
    'D4': 62, 'D#4': 63, 'Eb4': 63,
    'Ed4': 63.5,
    'E4': 64,
    'F4': 65, 'F#4': 66, 'Gb4': 66, 'Fd4': 65.5,
    'G4': 67, 'G#4': 68, 'Ab4': 68, 'Gd4': 67.5,
    'A4': 69, 'A#4': 70, 'Bb4': 70, 'Ad4': 69.5,
    'B4': 71, 'Bd4': 70.5,
    'C5': 72, 'C#5': 73, 'Db5': 73, 'Cd5': 72.5,
    'D5': 74, 'Eb5': 75, 'Ed5': 75.5,
    'E5': 76, 'F5': 77, 'F#5': 78, 'G5': 79
  };

  // Convert note name to frequency
  const getFrequency = (noteName: string): number => {
    const isQuarter = noteName.includes('d');
    const cleanName = noteName.replace('d', '');
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const match = cleanName.match(/^([A-G][#b]?)([0-9])$/);
    if (!match) return 440;

    const basePitch = match[1];
    const oct = parseInt(match[2], 10);
    const midi = (oct + 1) * 12 + (noteMap[basePitch] || 0);
    const commaOffset = isQuarter ? -2 : 0;

    return audioEngine.calculateFrequency(midi, isQuarter ? -1 : 0, tuningSystem, commaOffset);
  };

  // Compute scale based on selected Jins slots
  const builtScaleResult = useMemo(() => {
    const jins1 = AJNAS_DATASET.find(j => j.id === slot1.jinsId) || AJNAS_DATASET[0];
    const jins2 = AJNAS_DATASET.find(j => j.id === slot2.jinsId) || AJNAS_DATASET[0];
    const jins3 = includeSlot3 ? AJNAS_DATASET.find(j => j.id === slot3.jinsId) : null;

    // Build the combined 53-comma intervals
    const combinedCommas: number[] = [
      ...jins1.commasSequence,
      // If there is a disjunction between Jins 1 and Jins 2 (fasila / whole tone step)
      ...(jins1.type === 'trichord' && slot2.tonicNote === 'G4' ? [9] : []),
      ...jins2.commasSequence,
      ...(jins3 ? jins3.commasSequence : [])
    ];

    // Trim or standardize to octave interval sequence (sum ~ 53 commas)
    let totalCommas = combinedCommas.reduce((a, b) => a + b, 0);
    if (totalCommas < 53) {
      combinedCommas.push(53 - totalCommas);
    } else if (totalCommas > 53 && combinedCommas.length > 7) {
      combinedCommas.length = 7;
      totalCommas = combinedCommas.reduce((a, b) => a + b, 0);
      if (totalCommas < 53) combinedCommas.push(53 - totalCommas);
    }

    // Try finding matching predefined Maqam
    let matchedMaqam: MaqamScale | undefined = undefined;

    // Heuristic match based on (Jins Asl + Jins Far + Tonic)
    matchedMaqam = MAQAM_DATASET.find(m => {
      const matchAsl = m.jinsAsl.name.toLowerCase().includes(jins1.id);
      const matchFar = m.jinsFar.name.toLowerCase().includes(jins2.id);
      const matchTonic = m.tonicNote.toLowerCase() === slot1.tonicNote.toLowerCase();
      return matchAsl && matchFar && matchTonic;
    });

    // Fallback: match by Jins Asl & Far regardless of exact transposition
    if (!matchedMaqam) {
      matchedMaqam = MAQAM_DATASET.find(m => {
        const matchAsl = m.jinsAsl.name.toLowerCase().includes(jins1.id);
        const matchFar = m.jinsFar.name.toLowerCase().includes(jins2.id);
        return matchAsl && matchFar;
      });
    }

    // Derive scale notes
    let notes: string[] = [];
    if (matchedMaqam && matchedMaqam.tonicNote.toLowerCase() === slot1.tonicNote.toLowerCase()) {
      notes = [...matchedMaqam.scaleNotes];
    } else {
      // Calculate notes step by step from tonic using note pitch map
      const tonicMidi = notePitchMap[slot1.tonicNote] || 60;
      let currentMidi = tonicMidi;
      notes.push(slot1.tonicNote);

      combinedCommas.forEach(commas => {
        const semitones = commas * (12 / 53);
        currentMidi += semitones;
        // Find closest note from notePitchMap
        let closestNote = 'C5';
        let minDiff = 999;
        Object.entries(notePitchMap).forEach(([k, v]) => {
          const diff = Math.abs(v - currentMidi);
          if (diff < minDiff) {
            minDiff = diff;
            closestNote = k;
          }
        });
        if (!notes.includes(closestNote)) {
          notes.push(closestNote);
        }
      });

      // Ensure 8 notes
      if (notes.length < 8) {
        notes.push('C5');
      }
    }

    // Construct full MaqamScale object
    const builtMaqam: MaqamScale = {
      id: matchedMaqam ? matchedMaqam.id : `custom-${jins1.id}-${jins2.id}`,
      name: matchedMaqam ? matchedMaqam.name : `${jins1.name.replace('Jins ', '')} / ${jins2.name.replace('Jins ', '')}`,
      arabicName: matchedMaqam ? matchedMaqam.arabicName : `${jins1.arabicName.replace('جنس ', '')} + ${jins2.arabicName.replace('جنس ', '')}`,
      family: (matchedMaqam ? matchedMaqam.family : 'Rast') as MaqamScale['family'],
      tonicNote: slot1.tonicNote,
      tonicArabicName: ARABIC_NOTE_DICTIONARY[slot1.tonicNote]?.arabic || `${slot1.tonicNote}`,
      ghammazArabicName: ARABIC_NOTE_DICTIONARY[slot2.tonicNote]?.arabic || `${slot2.tonicNote}`,
      scaleNotes: notes.slice(0, 8),
      commas53Sequence: combinedCommas.slice(0, 7),
      jinsAsl: jins1,
      jinsFar: jins2,
      sayrNotes: matchedMaqam ? matchedMaqam.sayrNotes : `Custom modal exploration starting on ${slot1.tonicNote} (${jins1.name}), modulating at ${slot2.tonicNote} to ${jins2.name}.`,
    };

    // Calculate quarter-tone intervals between consecutive scale degrees (24-EDO)
    const scaleNotes = builtMaqam.scaleNotes;
    interface QuarterStep {
      stepIndex: number;
      fromNote: string;
      toNote: string;
      quarters: number;
      cents: number;
      label: string; // e.g. "4", "3(half-flat)", "3", "2", "6"
      title: string;
      isHalfFlat: boolean;
    }

    const quarterSteps: QuarterStep[] = [];
    for (let i = 0; i < scaleNotes.length - 1; i++) {
      const fromNote = scaleNotes[i];
      const toNote = scaleNotes[i + 1];
      const p1 = notePitchMap[fromNote] ?? 60;
      let p2 = notePitchMap[toNote] ?? 62;
      let diff = p2 - p1;
      if (diff <= 0) diff += 12;

      const quarters = Math.round(diff * 2);
      const cents = quarters * 50;

      const isTargetHalfFlat = toNote.includes('d');
      const isSourceHalfFlat = fromNote.includes('d');

      let label = `${quarters}`;
      let title = '';

      if (quarters === 4) {
        label = '4';
        title = 'Whole Tone (بعد كامل - 200¢)';
      } else if (quarters === 3) {
        if (isTargetHalfFlat) {
          label = '3(half-flat)';
          title = '3/4 Tone to Half-Flat (ثلاثة أرباع البعد - 150¢)';
        } else {
          label = '3';
          title = '3/4 Tone (ثلاثة أرباع البعد - 150¢)';
        }
      } else if (quarters === 2) {
        label = '2';
        title = 'Semitone / Half Tone (نصف بعد - 100¢)';
      } else if (quarters === 6) {
        label = '6';
        title = 'Augmented 2nd (بعد طنيني زائد - 300¢)';
      } else if (quarters === 1) {
        label = '1(quarter-tone)';
        title = 'Quarter-Tone (ربع بعد - 50¢)';
      } else if (quarters === 5) {
        label = '5';
        title = '5/4 Tone (بعد زائد - 250¢)';
      } else {
        label = `${quarters}`;
        title = `${quarters} Quarter-Tones (${cents}¢)`;
      }

      quarterSteps.push({
        stepIndex: i + 1,
        fromNote,
        toNote,
        quarters,
        cents,
        label,
        title,
        isHalfFlat: quarters === 3 || isTargetHalfFlat || isSourceHalfFlat,
      });
    }

    // Formula representation e.g. R(C3) - 4 - 3(half-flat) - 4 - ....
    const tonicKey = builtMaqam.tonicNote;
    const quarterFormula = `R(${tonicKey}) - ${quarterSteps.map(s => s.label).join(' - ')}`;

    return {
      builtMaqam,
      matchedMaqam,
      jins1,
      jins2,
      jins3,
      combinedCommas: combinedCommas.slice(0, 7),
      quarterSteps,
      quarterFormula,
    };
  }, [slot1, slot2, slot3, includeSlot3]);

  // Copy formula to clipboard
  const handleCopyFormula = () => {
    navigator.clipboard.writeText(builtScaleResult.quarterFormula);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  // Audition scale playback
  const handlePlayBuiltScale = () => {
    if (isPlayingScale) return;
    setIsPlayingScale(true);

    const notes = builtScaleResult.builtMaqam.scaleNotes;
    notes.forEach((note, index) => {
      setTimeout(() => {
        const freq = getFrequency(note);
        audioEngine.playNote(freq, 0.65);

        if (index === notes.length - 1) {
          setTimeout(() => setIsPlayingScale(false), 700);
        }
      }, index * 550);
    });
  };

  const handleApplyToApp = () => {
    onApplyMaqam(builtScaleResult.builtMaqam);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      {/* Drawer Panel */}
      <div className="w-full max-w-2xl bg-[#090d16] border-l border-amber-900/40 text-stone-100 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
              <Layers className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Maqam Builder</span>
                <span className="text-xs font-serif text-amber-300 font-normal">بناء وتركيب المقامات</span>
              </h2>
              <p className="text-xs text-stone-400">Assemble Root &amp; Secondary Ajnas to analyze or discover matching Maqamat.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          {/* Matched Maqam Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            builtScaleResult.matchedMaqam
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                {builtScaleResult.matchedMaqam ? 'Standard Maqam Detected' : 'Custom Hybrid Maqam'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {builtScaleResult.builtMaqam.family} Family
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {builtScaleResult.builtMaqam.name}
                </h3>
                <span className="text-lg font-serif text-amber-300">
                  {builtScaleResult.builtMaqam.arabicName}
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-stone-400">Tonic Qarar</div>
                <div className="text-sm font-bold text-amber-400">
                  {builtScaleResult.builtMaqam.tonicArabicName}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              {builtScaleResult.builtMaqam.sayrNotes}
            </p>
          </div>

          {/* Jins Selection Slots */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Order &amp; Combine Ajnas (الأجناس)</span>
            </h4>

            {/* Slot 1: Jins Asl (Root) */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-sm font-bold text-emerald-400">Jins Asl (Root Jins / جنس الأصل)</span>
                </div>
                <span className="text-xs font-serif text-stone-400">
                  {builtScaleResult.jins1.arabicName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Select Jins</label>
                  <select
                    value={slot1.jinsId}
                    onChange={(e) => setSlot1(prev => ({ ...prev, jinsId: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {AJNAS_DATASET.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.name} ({j.arabicName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Root Tonic Degree</label>
                  <select
                    value={slot1.tonicNote}
                    onChange={(e) => setSlot1(prev => ({ ...prev, tonicNote: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {AVAILABLE_TONIC_NOTES.map(note => (
                      <option key={note} value={note}>
                        {note} ({ARABIC_NOTE_DICTIONARY[note]?.arabic || note})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                {builtScaleResult.jins1.description}
              </p>
            </div>

            {/* Slot 2: Jins Far' (Secondary) */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-stone-950 text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-sm font-bold text-cyan-400">Jins Far&apos; (Secondary Jins / جنس الفرع)</span>
                </div>
                <span className="text-xs font-serif text-stone-400">
                  {builtScaleResult.jins2.arabicName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Select Jins</label>
                  <select
                    value={slot2.jinsId}
                    onChange={(e) => setSlot2(prev => ({ ...prev, jinsId: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {AJNAS_DATASET.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.name} ({j.arabicName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">Modulation / Ghammaz Degree</label>
                  <select
                    value={slot2.tonicNote}
                    onChange={(e) => setSlot2(prev => ({ ...prev, tonicNote: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {AVAILABLE_TONIC_NOTES.map(note => (
                      <option key={note} value={note}>
                        {note} ({ARABIC_NOTE_DICTIONARY[note]?.arabic || note})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                {builtScaleResult.jins2.description}
              </p>
            </div>
          </div>

          {/* Resulting Notes & Degrees */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Resulting Scale Notes (درجات السلم المركب)
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {builtScaleResult.builtMaqam.scaleNotes.map((note, idx) => {
                const arabicData = ARABIC_NOTE_DICTIONARY[note];
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center bg-stone-950/80 border border-stone-800 rounded-xl p-2 text-center"
                  >
                    <span className="text-[10px] text-stone-500 font-mono">Deg {idx + 1}</span>
                    <span className="text-sm font-bold text-amber-300">{note}</span>
                    <span className="text-[10px] text-stone-400 font-serif leading-tight">
                      {arabicData?.arabic ? arabicData.arabic.split(' ')[0] : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24-EDO Quarter-Intervals (أبعاد أرباع التون) */}
          <div className="bg-stone-950/80 border border-amber-900/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                  𝄳
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Quarter-Intervals (أبعاد أرباع التون)</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      24-EDO
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Standard Arabic scale intervals (4 = whole tone, 3 = 3/4 neutral tone / half-flat)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-1 rounded-full font-semibold">
                  Total: {builtScaleResult.quarterSteps.reduce((acc, s) => acc + s.quarters, 0)} Quarters (1200¢)
                </span>
                <button
                  type="button"
                  onClick={handleCopyFormula}
                  className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 text-stone-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Copy scale formula to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Prominent Formula Bar as requested: e.g. R(C3) - 4 - 3(half-flat) - 4 - .... */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-stone-900/90 to-amber-950/30 border border-amber-500/50 rounded-xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin shadow-inner">
              <div className="font-mono text-sm sm:text-base font-bold text-amber-300 tracking-wider select-all whitespace-nowrap flex items-center gap-1.5">
                <span className="text-amber-400 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  R({builtScaleResult.builtMaqam.tonicNote})
                </span>
                <span className="text-stone-500">-</span>
                {builtScaleResult.quarterSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className={step.label.includes('half-flat') ? 'text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30' : 'text-stone-200'}>
                      {step.label}
                    </span>
                    {idx < builtScaleResult.quarterSteps.length - 1 && (
                      <span className="text-stone-500">-</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Interactive Step-by-Step Chain Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-stone-300">
                Detailed Interval Steps (تفصيل الأبعاد بين درجات السلم):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {builtScaleResult.quarterSteps.map((step) => (
                  <div
                    key={step.stepIndex}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      step.isHalfFlat
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-stone-900/60 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-950 text-stone-400 border border-stone-700 text-[10px] font-mono flex items-center justify-center font-bold">
                        {step.stepIndex}
                      </span>
                      <div className="font-semibold text-white">
                        <span>{step.fromNote}</span>
                        <span className="text-stone-500 mx-1.5">➔</span>
                        <span>{step.toNote}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        step.label.includes('half-flat')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : step.quarters === 4
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({step.cents}¢)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference info for classical 53-EDO Commas */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
              <span>Classical 53-EDO Commas: {builtScaleResult.combinedCommas.join(' - ')}k</span>
              <span className="font-mono">Total = {builtScaleResult.combinedCommas.reduce((a, b) => a + b, 0)} Commas</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePlayBuiltScale}
            disabled={isPlayingScale}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isPlayingScale
                ? 'bg-amber-600/40 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-stone-900 border-stone-700 text-stone-200 hover:bg-stone-800 hover:border-stone-600'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlayingScale ? 'Auditioning Scale...' : 'Audition Scale (استماع)'}</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Violin (تطبيق على الكمان)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
