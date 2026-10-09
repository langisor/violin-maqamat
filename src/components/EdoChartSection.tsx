import React, { useEffect, useState } from 'react';
import { MaqamScale, TuningSystem } from '../types/maqam';
import { Maqam24EdoChart } from './Maqam24EdoChart';
import { Maqam53EdoChart } from './Maqam53EdoChart';

interface EdoChartSectionProps {
  currentMaqam: MaqamScale;
  tuningSystem: TuningSystem;
  activePlayingNote: string | null;
  onNoteTrigger: (noteKey: string, freq: number) => void;
}

type EdoTab = '24' | '53';

/** Switches between the parallel 24-EDO and 53-EDO charts; follows the active tuning system. */
export const EdoChartSection: React.FC<EdoChartSectionProps> = (props) => {
  const [tab, setTab] = useState<EdoTab>(props.tuningSystem === '53-EDO' ? '53' : '24');

  // When the player changes tuning system, bring the matching analysis forward.
  useEffect(() => {
    if (props.tuningSystem === '53-EDO') setTab('53');
    else if (props.tuningSystem === '24-EDO') setTab('24');
  }, [props.tuningSystem]);

  const tabs: { id: EdoTab; label: string; sub: string }[] = [
    { id: '24', label: '24-EDO', sub: 'Quarter-tones · أرباع' },
    { id: '53', label: '53-EDO', sub: 'Commas · كومات' },
  ];

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Microtonal analysis system" className="inline-flex bg-surface/90 border border-line rounded-2xl p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-left transition-all cursor-pointer ${
              tab === t.id ? 'bg-amber-500 text-on-accent shadow-md' : 'text-ink-muted hover:text-ink-strong hover:bg-raised'
            }`}
          >
            <span className="block text-sm font-bold font-mono leading-tight">{t.label}</span>
            <span className={`block text-[10px] leading-tight ${tab === t.id ? 'text-on-accent/70' : 'text-ink-faint'}`}>{t.sub}</span>
          </button>
        ))}
      </div>

      {tab === '24' ? <Maqam24EdoChart {...props} /> : <Maqam53EdoChart {...props} />}
    </div>
  );
};
