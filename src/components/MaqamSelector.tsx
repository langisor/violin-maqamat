import React from 'react';
import { MaqamScale, TuningSystem, ViolinTuningPreset } from '../types/maqam';
import { MAQAM_FAMILIES, MAQAM_DATASET } from '../data/maqamat';

interface MaqamSelectorProps {
  currentMaqam: MaqamScale;
  onSelectMaqam: (maqam: MaqamScale) => void;
  tuningSystem: TuningSystem;
  onSelectTuningSystem: (system: TuningSystem) => void;
  violinTuning: ViolinTuningPreset;
  onSelectViolinTuning: (preset: ViolinTuningPreset) => void;
  isPlayingScale: boolean;
  onPlayScale: () => void;
  isDroneOn: boolean;
  onToggleDrone: () => void;
}

export const MaqamSelector: React.FC<MaqamSelectorProps> = ({
  currentMaqam,
  onSelectMaqam,
  tuningSystem,
  onSelectTuningSystem,
  violinTuning,
  onSelectViolinTuning,
  isPlayingScale,
  onPlayScale,
  isDroneOn,
  onToggleDrone,
}) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Top Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Maqam Family & Scale Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Select Maqam (المقام)
          </label>
          <select
            value={currentMaqam.id}
            onChange={(e) => {
              const found = MAQAM_DATASET.find(m => m.id === e.target.value);
              if (found) onSelectMaqam(found);
            }}
            aria-label="Select Maqam"
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            {MAQAM_FAMILIES.map(family => (
              <optgroup key={family} label={`Family: ${family}`}>
                {MAQAM_DATASET.filter(m => m.family === family).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.arabicName})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 2. Microtonal Tuning System */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Microtonal Tuning (الدوزان)
          </label>
          <select
            value={tuningSystem}
            onChange={(e) => onSelectTuningSystem(e.target.value as TuningSystem)}
            aria-label="Microtonal Tuning System"
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="24-EDO">24-EDO (Modern 1/4 Tone - Cairo 1932)</option>
            <option value="53-EDO">53-EDO (Classical Offtonic / Comma System)</option>
            <option value="12-TET">12-TET (Standard Western Temperament)</option>
          </select>
        </div>

        {/* 3. Violin Open String Tuning */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Violin Peg Tuning (تسوية الكمان)
          </label>
          <select
            value={violinTuning}
            onChange={(e) => onSelectViolinTuning(e.target.value as ViolinTuningPreset)}
            aria-label="Violin Peg Tuning"
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="arabic">Arabic Classical: G3 - D4 - G4 - D5 (الكمان العربي)</option>
            <option value="standard">Western Classical: G3 - D4 - A4 - E5</option>
          </select>
        </div>
      </div>

      {/* Maqam Quick Family Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-stone-500 font-medium whitespace-nowrap pr-2">Quick Families:</span>
        {MAQAM_FAMILIES.map(family => {
          const isCurrent = currentMaqam.family === family;
          return (
            <button
              key={family}
              type="button"
              onClick={() => {
                const firstInFamily = MAQAM_DATASET.find(m => m.family === family);
                if (firstInFamily) onSelectMaqam(firstInFamily);
              }}
              className={`px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap font-medium cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              {family}
            </button>
          );
        })}
      </div>

      {/* Control Action Buttons: Audition Scale & Drone */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPlayScale}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
              isPlayingScale
                ? 'bg-amber-400 text-stone-950 font-bold ring-2 ring-white shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-amber-500/20'
            }`}
          >
            <span>{isPlayingScale ? '■ Stop Sayr (إيقاف)' : '▶ Play Scale (عزف السلم)'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDrone}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-95 cursor-pointer ${
              isDroneOn
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDroneOn ? 'bg-rose-500 animate-ping' : 'bg-stone-500'}`} />
            <span>{isDroneOn ? 'Stop Tonic Drone' : 'Tonic Drone (قرار)'}</span>
          </button>
        </div>

        {/* Master Tuning Info */}
        <div className="text-xs text-stone-400 flex items-center gap-2 font-mono">
          <span>Qarar: <strong className="text-amber-400">{currentMaqam.tonicArabicName}</strong></span>
          <span>•</span>
          <span>Ghammaz: <strong className="text-cyan-400">{currentMaqam.ghammazArabicName}</strong></span>
        </div>
      </div>
    </div>
  );
};
