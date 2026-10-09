import React from 'react';
import { MaqamScale, ARABIC_NOTE_DICTIONARY } from '../types/maqam';

interface MaqamInfoCardProps {
  maqam: MaqamScale;
}

export const MaqamInfoCard: React.FC<MaqamInfoCardProps> = ({ maqam }) => {
  return (
    <div className="bg-surface/80 border border-line rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
      {/* Maqam Title & Arabic Heading */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold font-mono">
            {maqam.family} Family
          </span>
          <h3 className="text-2xl font-bold text-ink flex items-center gap-3 mt-0.5">
            <span>Maqam {maqam.name}</span>
            <span className="text-2xl text-amber-400 font-serif font-normal">مقام {maqam.arabicName}</span>
          </h3>
        </div>

        <div className="text-right">
          <div className="text-xs text-ink-muted">Qarar (Tonic / قرار)</div>
          <div className="text-sm font-semibold text-amber-300">{maqam.tonicArabicName}</div>
        </div>
      </div>

      {/* Scale Notes & Degrees */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5">
          Scale Degrees & Arabic Note Names
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {maqam.scaleNotes.map((note, idx) => {
            const arabicData = ARABIC_NOTE_DICTIONARY[note];
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-canvas/80 border border-line rounded-xl px-2.5 py-2.5 min-w-[56px] text-center"
              >
                <span className="text-[10px] text-ink-faint font-mono">Degree {idx + 1}</span>
                <span className="text-base font-bold text-amber-300 my-0.5">{note}</span>
                <span className="text-[11px] text-ink font-serif leading-tight">{arabicData?.arabic || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 53-EDO Comma Breakdown */}
      {maqam.commas53Sequence && (
        <div className="bg-canvas/60 border border-line/80 rounded-xl p-3.5">
          <div className="text-xs font-semibold text-ink flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span>Offtonic 53-EDO Comma Step Intervals</span>
            <span className="font-mono text-amber-400 text-xs tracking-wider bg-surface px-2 py-0.5 rounded border border-line">
              {maqam.commas53Sequence.join(' - ')}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Where 9 commas = whole tone (Tanini, ~204¢), 6–7 commas = neutral second / Sikah (Mujannab, ~136¢–158¢), 
            and 12–13 commas = augmented second in Hijaz (Fadla/Bu&apos;d Fatish, ~272¢).
          </p>
        </div>
      )}

      {/* Ajnas Analysis (Jins Asl vs Jins Far') */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jins Asl */}
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Root Jins (جنس الأصل)</span>
            <span className="text-xs font-serif text-emerald-300">{maqam.jinsAsl.tonicArabicName}</span>
          </div>
          <h5 className="font-bold text-ink text-sm">{maqam.jinsAsl.name}</h5>
          <p className="text-xs text-ink-muted leading-relaxed">{maqam.jinsAsl.description}</p>
        </div>

        {/* Jins Far */}
        <div className="bg-cyan-950/20 border border-cyan-900/40 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Secondary Jins (جنس الفرع)</span>
            <span className="text-xs font-serif text-cyan-300">{maqam.jinsFar.tonicArabicName}</span>
          </div>
          <h5 className="font-bold text-ink text-sm">{maqam.jinsFar.name}</h5>
          <p className="text-xs text-ink-muted leading-relaxed">{maqam.jinsFar.description}</p>
        </div>
      </div>

      {/* Melodic Sayr Path Guide */}
      <div className="bg-canvas/70 border border-line rounded-xl p-4">
        <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>Melodic Pathway (السير والتحليل)</span>
        </h5>
        <p className="text-xs text-ink leading-relaxed">{maqam.sayrNotes}</p>
      </div>
    </div>
  );
};
