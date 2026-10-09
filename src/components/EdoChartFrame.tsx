import React from 'react';

export type EdoViewMode = 'radial' | 'linear';

interface ViewSwitcherProps {
  value: EdoViewMode;
  onChange: (mode: EdoViewMode) => void;
}

/** Radial / linear pill switcher shared by the EDO charts. */
export const EdoViewSwitcher: React.FC<ViewSwitcherProps> = ({ value, onChange }) => {
  const options: { id: EdoViewMode; label: string }[] = [
    { id: 'radial', label: 'Radial Wheel (دائري)' },
    { id: 'linear', label: 'Interval Ladder (خطي)' },
  ];
  return (
    <div role="tablist" aria-label="Chart view" className="flex items-center gap-1 bg-surface/90 border border-line p-1 rounded-xl">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            value === o.id ? 'bg-amber-500 text-on-accent font-bold shadow-md' : 'text-ink-muted hover:text-ink-strong'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

interface StatCardProps {
  label: string;
  children: React.ReactNode;
}

export const EdoStatCard: React.FC<StatCardProps> = ({ label, children }) => (
  <div className="bg-canvas/60 border border-line rounded-xl p-3">
    <span className="text-ink-faint font-mono block text-[10px] uppercase tracking-wide">{label}</span>
    {children}
  </div>
);
