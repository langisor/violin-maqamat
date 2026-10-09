import type { AppTheme } from '../context/ThemeContext';

/** Colors used by the D3 charts (SVG attributes can't read Tailwind classes). */
export interface ChartPalette {
  wheelBg: string;
  hubBg: string;
  ring: string;
  tickMinor: string;
  tickMajor: string;
  tickLabel: string;
  textMuted: string;
  textOnNode: string;
  textOnNodeSub: string;
  textOnAccentNode: string;
  accent: string;
  accentText: string;
  accentGlow: string;
  cyan: string;
  cyanText: string;
  aslNode: string;
  farNode: string;
  aslFill: string;
  aslStroke: string;
  farFill: string;
  farStroke: string;
  chord: string;
  nodeRing: string;
  tonicRing: string;
  ghammazRing: string;
  activeStroke: string;
  pillBg: string;
  pillStroke: string;
  pillText: string;
  axis: string;
  arabicLabel: string;
}

export const CHART_PALETTES: Record<AppTheme, ChartPalette> = {
  dark: {
    wheelBg: '#090d16',
    hubBg: '#0c1220',
    ring: '#1e293b',
    tickMinor: '#334155',
    tickMajor: '#38bdf8',
    tickLabel: '#64748b',
    textMuted: '#94a3b8',
    textOnNode: '#ffffff',
    textOnNodeSub: '#cbd5e1',
    textOnAccentNode: '#0f172a',
    accent: '#f59e0b',
    accentText: '#fbbf24',
    accentGlow: '#fbbf24',
    cyan: '#06b6d4',
    cyanText: '#38bdf8',
    aslNode: '#059669',
    farNode: '#0891b2',
    aslFill: 'rgba(16, 185, 129, 0.12)',
    aslStroke: 'rgba(16, 185, 129, 0.45)',
    farFill: 'rgba(6, 182, 212, 0.12)',
    farStroke: 'rgba(6, 182, 212, 0.45)',
    chord: 'rgba(245, 158, 11, 0.25)',
    nodeRing: '#e2e8f0',
    tonicRing: '#fde68a',
    ghammazRing: '#a5f3fc',
    activeStroke: '#ffffff',
    pillBg: '#1e293b',
    pillStroke: '#334155',
    pillText: '#fcd34d',
    axis: '#475569',
    arabicLabel: '#94a3b8',
  },
  light: {
    wheelBg: '#ffffff',
    hubBg: '#f6f0e4',
    ring: '#d9d0bd',
    tickMinor: '#b9ad98',
    tickMajor: '#0e7490',
    tickLabel: '#78716c',
    textMuted: '#57534e',
    textOnNode: '#ffffff',
    textOnNodeSub: '#f5f5f4',
    textOnAccentNode: '#1c1917',
    accent: '#d97706',
    accentText: '#b45309',
    accentGlow: '#f59e0b',
    cyan: '#0891b2',
    cyanText: '#0e7490',
    aslNode: '#047857',
    farNode: '#0e7490',
    aslFill: 'rgba(5, 150, 105, 0.12)',
    aslStroke: 'rgba(5, 150, 105, 0.55)',
    farFill: 'rgba(8, 145, 178, 0.12)',
    farStroke: 'rgba(8, 145, 178, 0.55)',
    chord: 'rgba(180, 83, 9, 0.30)',
    nodeRing: '#ffffff',
    tonicRing: '#92400e',
    ghammazRing: '#155e75',
    activeStroke: '#1c1917',
    pillBg: '#f6f0e4',
    pillStroke: '#d9d0bd',
    pillText: '#92400e',
    axis: '#a8a29e',
    arabicLabel: '#57534e',
  },
};
