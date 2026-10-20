import React, { useEffect, useState } from 'react';
import { MaqamScale, TuningSystem } from '../types/maqam';
import { Maqam24EdoChart } from './Maqam24EdoChart';

interface EdoChartSectionProps {
  currentMaqam: MaqamScale;
  tuningSystem: TuningSystem;
  activePlayingNote: string | null;
  onNoteTrigger: (noteKey: string, freq: number) => void;
}

type EdoTab = '24' | '12';

/** Switches between the parallel 24-EDO chart; follows the active tuning system. */
export const EdoChartSection: React.FC<EdoChartSectionProps> = (props) => {
 
  const [tab,setTab]=useState<EdoTab>(props.tuningSystem==='12-TET' ? '12' : '24')

  // When the player changes tuning system, bring the matching analysis forward.
  useEffect(() => {
    if (props.tuningSystem === '12-TET') setTab('12');
    else if (props.tuningSystem === '24-EDO') setTab('24');
  }, [props.tuningSystem]);

  const tabs: { id: EdoTab; label: string; sub: string }[] = [
    { id: '24', label: '24-EDO', sub: 'Quarter-tones · أرباع' },
  {id: '12',label: '12-TET',sub: 'Half-tones · انصاف'}
 
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

       <Maqam24EdoChart {...props} />
    </div>
  );
};
