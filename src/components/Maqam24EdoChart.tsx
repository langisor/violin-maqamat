import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MaqamScale, TuningSystem, ARABIC_NOTE_DICTIONARY } from '../types/maqam';
import { audioEngine } from '../services/audioEngine';
import { areNotesEquivalent } from './ViolinFingerboard';
import { useTheme } from '../context/ThemeContext';
import { CHART_PALETTES } from '../theme/chartPalette';
import { getFrequencyForNoteName, noteToQuarterTones } from '../utils/pitch';
import { EdoChartConfig, EdoDegree, prepareSvg, renderLinearChart, renderRadialChart } from '../utils/edoChartRenderers';
import { EdoStatCard, EdoViewMode, EdoViewSwitcher } from './EdoChartFrame';

interface Maqam24EdoChartProps {
  currentMaqam: MaqamScale;
  tuningSystem: TuningSystem;
  activePlayingNote: string | null;
  onNoteTrigger: (noteKey: string, freq: number) => void;
}

const QUARTER_CENTS = 50;
const CONFIG: EdoChartConfig = {
  divisions: 24,
  unit: 'q',
  majorEvery: 2, // every semitone is emphasised
  labelEvery: 4, // numeric label every whole tone
  hubTitle: '24-EDO QUARTER-TONES',
  idPrefix: 'edo24',
};

// Interval naming in the 24-EDO (Cairo 1932) quarter-tone system
const getIntervalName = (quarters: number): string => {
  switch (quarters) {
    case 1: return "Rub' Tone / ربع تون (Quarter-tone 50¢)";
    case 2: return 'Nisf Tone / نصف تون (Semitone 100¢)';
    case 3: return 'Thalathat Arba\' / ثلاثة أرباع (Neutral 2nd 150¢)';
    case 4: return 'Tone / تون (Whole tone 200¢)';
    case 5: return 'Khamsat Arba\' / خمسة أرباع (Wide 2nd 250¢)';
    default: return quarters >= 6 ? "Za'id / زائد (Augmented 2nd 300¢)" : `${quarters} Quarter-tones`;
  }
};

export const Maqam24EdoChart: React.FC<Maqam24EdoChartProps> = ({
  currentMaqam,
  tuningSystem,
  activePlayingNote,
  onNoteTrigger,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<EdoViewMode>('radial');
  const [selectedNode, setSelectedNode] = useState<EdoDegree | null>(null);

  // Quarter-tone positions are read straight from the note names (Ed = E half-flat, etc.),
  // so unlike the 53-EDO chart no separate step table is required.
  const degreesData = useMemo<EdoDegree[]>(() => {
    const notes = currentMaqam.scaleNotes;
    const tonicPos = noteToQuarterTones(notes[0]) ?? 0;
    let prev = 0;
    return notes.map((note, idx) => {
      const pos = noteToQuarterTones(note);
      let cumUnits = pos === null ? prev : pos - tonicPos;
      if (idx === notes.length - 1 && cumUnits >= 24) cumUnits = 24; // octave degree
      const step = idx === 0 ? 0 : Math.max(0, cumUnits - prev);
      prev = cumUnits;
      return {
        degree: idx + 1,
        noteName: note,
        arabicName: ARABIC_NOTE_DICTIONARY[note]?.arabic || '',
        stepUnits: step,
        cumUnits,
        cents: cumUnits * QUARTER_CENTS,
        isTonic: idx === 0,
        isGhammaz: idx === 4,
        jinsType: idx <= 3 ? 'asl' : 'far',
        intervalName: getIntervalName(step),
        angleRad: (cumUnits / 24) * 2 * Math.PI - Math.PI / 2,
      };
    });
  }, [currentMaqam]);

  const ghammaz = degreesData[4];
  const stepSequence = degreesData.slice(1).map((d) => d.stepUnits);
  const totalQuarters = stepSequence.reduce((a, b) => a + b, 0);

  useEffect(() => setSelectedNode(null), [currentMaqam]);

  const handlePlayDegree = (d: EdoDegree) => {
    setSelectedNode(d);
    const freq = getFrequencyForNoteName(d.noteName, tuningSystem);
    audioEngine.playNote(freq, 1.0);
    onNoteTrigger(d.noteName, freq);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = viewMode === 'radial' ? 560 : 380;
    prepareSvg(svg, width, height, CONFIG.idPrefix, `24-EDO ${viewMode} chart for Maqam ${currentMaqam.name}`);

    const args = {
      svg, width, height, data: degreesData, cfg: CONFIG, palette: CHART_PALETTES[theme],
      maqamName: currentMaqam.name,
      maqamArabicName: currentMaqam.arabicName,
      qararName: currentMaqam.tonicArabicName,
      ghammazName: currentMaqam.ghammazArabicName,
      isActive: (n: string) => areNotesEquivalent(activePlayingNote, n),
      onPlay: handlePlayDegree,
    };
    if (viewMode === 'radial') renderRadialChart(args);
    else renderLinearChart(args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, degreesData, activePlayingNote, theme, tuningSystem]);

  return (
    <section
      aria-label="24-EDO quarter-tone analysis"
      className="bg-panel-deep border border-amber-950/70 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_var(--glow-cyan)] backdrop-blur-md space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
              Microtonal Interval Theory
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full font-mono">
              Cairo 1932 · 24-EDO
            </span>
          </div>
          <h3 className="text-xl font-bold text-ink-strong flex items-center gap-2 mt-0.5">
            <span>24-EDO Quarter-Tone Step &amp; Tonic Pitch Analysis</span>
            <span className="text-sm font-serif text-amber-300 font-normal">دائرة أرباع الصوت</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            1 Octave = 24 quarter-tones (50¢ each). Click any node to audition its pitch and interval.
          </p>
        </div>
        <EdoViewSwitcher value={viewMode} onChange={setViewMode} />
      </div>

      <div className="relative flex justify-center items-center overflow-x-auto py-2">
        <svg ref={svgRef} className="w-full max-w-4xl h-auto drop-shadow-xl select-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-line text-xs">
        <EdoStatCard label="Auditioned Degree">
          {selectedNode ? (
            <div className="mt-1">
              <span className="font-bold text-amber-300 text-sm">{selectedNode.noteName}</span>{' '}
              <span className="text-ink font-serif">({selectedNode.arabicName})</span>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                Distance: {selectedNode.cumUnits} quarter-tones ({selectedNode.cents}¢)
              </div>
              {selectedNode.stepUnits > 0 && (
                <div className="text-[11px] text-ink-muted mt-0.5">
                  Step: +{selectedNode.stepUnits}q · {selectedNode.intervalName}
                </div>
              )}
            </div>
          ) : (
            <span className="text-ink-muted text-[11px]">Click any degree on the chart above to inspect.</span>
          )}
        </EdoStatCard>

        <EdoStatCard label="24-EDO Step Sequence">
          <div className="font-mono text-amber-400 text-sm font-bold mt-1">{stepSequence.join(' - ')}</div>
          <span className="text-ink-muted text-[10px] block mt-0.5">
            Total = {totalQuarters} quarter-tones = {totalQuarters * QUARTER_CENTS}¢
            {totalQuarters === 24
              ? ' (pure octave)'
              : ` — upper degree sits ${(24 - totalQuarters) * QUARTER_CENTS}¢ below the octave`}
          </span>
        </EdoStatCard>

        <EdoStatCard label="Tonic Polarities">
          <div className="text-[11px] text-ink mt-1 space-y-0.5">
            <div>
              Qarar (0q): <strong className="text-amber-400">{currentMaqam.tonicArabicName}</strong>
            </div>
            <div>
              Ghammaz ({ghammaz?.cumUnits ?? 14}q): <strong className="text-cyan-400">{currentMaqam.ghammazArabicName}</strong>{' '}
              ({ghammaz?.cents ?? 700}¢)
            </div>
          </div>
        </EdoStatCard>
      </div>
    </section>
  );
};
