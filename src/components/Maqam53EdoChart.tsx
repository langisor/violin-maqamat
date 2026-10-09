import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MaqamScale, TuningSystem, ARABIC_NOTE_DICTIONARY } from '../types/maqam';
import { audioEngine } from '../services/audioEngine';
import { areNotesEquivalent } from './ViolinFingerboard';

interface Maqam53EdoChartProps {
  currentMaqam: MaqamScale;
  tuningSystem: TuningSystem;
  activePlayingNote: string | null;
  onNoteTrigger: (noteKey: string, freq: number) => void;
}

interface DegreeNode {
  degree: number;
  noteName: string;
  arabicName: string;
  stepCommas: number; // Interval from previous note
  cumCommas: number;  // Cumulative commas from tonic (0 to 53)
  cents: number;      // Exact cents = cumCommas * (1200 / 53)
  isTonic: boolean;
  isGhammaz: boolean;
  jinsType: 'asl' | 'far' | 'other';
  intervalName: string;
  angleRad: number;
}

export const Maqam53EdoChart: React.FC<Maqam53EdoChartProps> = ({
  currentMaqam,
  tuningSystem,
  activePlayingNote,
  onNoteTrigger,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<'radial' | 'linear'>('radial');
  const [selectedNode, setSelectedNode] = useState<DegreeNode | null>(null);

  // Interval naming helper in 53-EDO Ottoman/Arab theory
  const getIntervalArabicName = (commas: number): string => {
    if (commas >= 11) return "Bu'd Fatish / بُعْد فَاتِش (Augmented 2nd)";
    if (commas === 9) return 'Tanini / طَنِيني (Major 2nd ~204¢)';
    if (commas === 8) return 'Mujannab Kabir / مُجَنَّب كبير (Minor 2nd ~181¢)';
    if (commas === 7) return 'Mujannab Mutawassit / مُجَنَّب متوسط (Sikah ~158¢)';
    if (commas === 6) return 'Mujannab Saghir / مُجَنَّب صغير (Neutral 2nd ~136¢)';
    if (commas === 5) return 'Baqiyyah / بَقِيَّة (Diatonic Semitone ~113¢)';
    if (commas === 4) return 'Limma / فَضْلَة (Minor Semitone ~91¢)';
    return `${commas} Commas`;
  };

  // Calculate cumulative scale degrees and 53-EDO data
  const degreesData = useMemo<DegreeNode[]>(() => {
    const rawSeq = currentMaqam.commas53Sequence || [9, 7, 6, 9, 9, 7, 6];
    const notes = currentMaqam.scaleNotes;
    const nodes: DegreeNode[] = [];

    let cum = 0;
    notes.forEach((note, idx) => {
      const step = idx === 0 ? 0 : rawSeq[idx - 1] || 9;
      cum += step;
      // Clamp at 53 for octave degree
      const normalizedCum = idx === 0 ? 0 : idx === notes.length - 1 ? 53 : cum;
      const cents = Math.round(normalizedCum * (1200 / 53));
      const isTonic = idx === 0;
      const isGhammaz = idx === 4;

      let jinsType: DegreeNode['jinsType'] = 'other';
      if (idx <= 3) jinsType = 'asl';
      else if (idx >= 4) jinsType = 'far';

      const arabicData = ARABIC_NOTE_DICTIONARY[note];
      // Angle: 0 commas at top (-90 degrees), proceeding clockwise
      const angleRad = (normalizedCum / 53) * 2 * Math.PI - Math.PI / 2;

      nodes.push({
        degree: idx + 1,
        noteName: note,
        arabicName: arabicData?.arabic || '',
        stepCommas: step,
        cumCommas: normalizedCum,
        cents,
        isTonic,
        isGhammaz,
        jinsType,
        intervalName: getIntervalArabicName(step),
        angleRad,
      });
    });

    return nodes;
  }, [currentMaqam]);

  // Convert note string like "C4", "Ed4" into frequency
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

    return audioEngine.calculateFrequency(
      midi,
      isQuarter ? -1 : 0,
      tuningSystem,
      commaOffset
    );
  };

  const handlePlayDegree = (d: DegreeNode) => {
    setSelectedNode(d);
    const freq = getFrequency(d.noteName);
    audioEngine.playNote(freq, 1.0);
    onNoteTrigger(d.noteName, freq);
  };

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = viewMode === 'radial' ? 560 : 380;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // Glow filters
    const filter = defs.append('filter').attr('id', 'd3-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    if (viewMode === 'radial') {
      renderRadialChart(svg, width, height, degreesData);
    } else {
      renderLinearChart(svg, width, height, degreesData);
    }
  }, [viewMode, degreesData, activePlayingNote]);

  // --- 1. RADIAL PITCH WHEEL (53-EDO) ---
  const renderRadialChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number,
    data: DegreeNode[]
  ) => {
    const cx = width / 2;
    const cy = height / 2;
    const outerR = 210;
    const innerR = 145;

    const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

    // Outer Background Ring (53 ticks)
    g.append('circle')
      .attr('r', outerR + 24)
      .attr('fill', '#090d16')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5);

    // Inner Center Hub
    g.append('circle')
      .attr('r', innerR - 25)
      .attr('fill', '#0c1220')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2);

    // Draw all 53 equal comma ticks
    for (let c = 0; c < 53; c++) {
      const angle = (c / 53) * 2 * Math.PI - Math.PI / 2;
      const isMajorComma = c % 9 === 0;
      const tickInner = outerR + 10;
      const tickOuter = outerR + (isMajorComma ? 22 : 16);

      const x1 = Math.cos(angle) * tickInner;
      const y1 = Math.sin(angle) * tickInner;
      const x2 = Math.cos(angle) * tickOuter;
      const y2 = Math.sin(angle) * tickOuter;

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', isMajorComma ? '#38bdf8' : '#334155')
        .attr('stroke-width', isMajorComma ? 1.8 : 0.8)
        .attr('opacity', isMajorComma ? 0.9 : 0.4);

      // Comma index numbers on every 5th or major comma
      if (c % 9 === 0 || c === 0) {
        const textX = Math.cos(angle) * (outerR + 35);
        const textY = Math.sin(angle) * (outerR + 35);
        g.append('text')
          .attr('x', textX)
          .attr('y', textY + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748b')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .text(c === 0 ? '0/53' : `${c}c`);
      }
    }

    // Ajnas Circular Arcs (Jins Asl in Emerald, Jins Far' in Cyan)
    const arcGenerator = d3.arc<DegreeNode>()
      .innerRadius(innerR - 10)
      .outerRadius(outerR + 6);

    // Jins Asl segment (Degrees 1 to 4)
    if (data.length >= 4) {
      const d1 = data[0];
      const d4 = data[3];
      const aslArc = d3.arc()({
        innerRadius: innerR - 8,
        outerRadius: outerR + 4,
        startAngle: (d1.cumCommas / 53) * 2 * Math.PI,
        endAngle: (d4.cumCommas / 53) * 2 * Math.PI,
      });

      g.append('path')
        .attr('d', aslArc || '')
        .attr('fill', 'rgba(16, 185, 129, 0.12)')
        .attr('stroke', 'rgba(16, 185, 129, 0.45)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3');
    }

    // Jins Far segment (Degrees 5 to 8)
    if (data.length >= 8) {
      const d5 = data[4];
      const d8 = data[7];
      const farArc = d3.arc()({
        innerRadius: innerR - 8,
        outerRadius: outerR + 4,
        startAngle: (d5.cumCommas / 53) * 2 * Math.PI,
        endAngle: (d8.cumCommas / 53) * 2 * Math.PI,
      });

      g.append('path')
        .attr('d', farArc || '')
        .attr('fill', 'rgba(6, 182, 212, 0.12)')
        .attr('stroke', 'rgba(6, 182, 212, 0.45)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3');
    }

    // Tonic Chords: Connect Tonic (Degree 1) to each scale degree
    const tonicNode = data[0];
    const tonicX = Math.cos(tonicNode.angleRad) * (innerR + 15);
    const tonicY = Math.sin(tonicNode.angleRad) * (innerR + 15);

    data.slice(1).forEach(d => {
      const targetX = Math.cos(d.angleRad) * (innerR + 15);
      const targetY = Math.sin(d.angleRad) * (innerR + 15);

      const isGhammazLine = d.isGhammaz;

      // Chord connecting line from tonic
      g.append('line')
        .attr('x1', tonicX)
        .attr('y1', tonicY)
        .attr('x2', targetX)
        .attr('y2', targetY)
        .attr('stroke', isGhammazLine ? '#06b6d4' : 'rgba(245, 158, 11, 0.25)')
        .attr('stroke-width', isGhammazLine ? 2.2 : 1.2)
        .attr('stroke-dasharray', isGhammazLine ? 'none' : '3 3')
        .attr('opacity', isGhammazLine ? 0.9 : 0.6);
    });

    // Outer perimeter polygon connecting the scale degrees in order
    const lineGenerator = d3.line<DegreeNode>()
      .x(d => Math.cos(d.angleRad) * innerR)
      .y(d => Math.sin(d.angleRad) * innerR)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'rgba(245, 158, 11, 0.05)')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2);

    // Degree Nodes around the circumference
    const nodeGroups = g.selectAll('.degree-node')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'degree-node')
      .attr('transform', d => {
        const nx = Math.cos(d.angleRad) * innerR;
        const ny = Math.sin(d.angleRad) * innerR;
        return `translate(${nx}, ${ny})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_, d) => handlePlayDegree(d));

    // Animated glow ring on active playing note
    nodeGroups.filter(d => areNotesEquivalent(activePlayingNote, d.noteName))
      .append('circle')
      .attr('r', 28)
      .attr('fill', 'none')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#d3-glow)')
      .attr('opacity', 0.9);

    // Node outer circle
    nodeGroups.append('circle')
      .attr('r', d => d.isTonic ? 22 : d.isGhammaz ? 20 : 18)
      .attr('fill', d => {
        const isActive = areNotesEquivalent(activePlayingNote, d.noteName);
        if (isActive) return '#fbbf24';
        if (d.isTonic) return '#f59e0b';
        if (d.isGhammaz) return '#06b6d4';
        return d.jinsType === 'asl' ? '#059669' : '#0891b2';
      })
      .attr('stroke', d => {
        const isActive = areNotesEquivalent(activePlayingNote, d.noteName);
        if (isActive) return '#ffffff';
        if (d.isTonic) return '#fde68a';
        if (d.isGhammaz) return '#a5f3fc';
        return '#e2e8f0';
      })
      .attr('stroke-width', 2.5)
      .attr('filter', d => d.isTonic || d.isGhammaz ? 'url(#d3-glow)' : 'none');

    // Note name inside node
    nodeGroups.append('text')
      .attr('y', -2)
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        const isActive = areNotesEquivalent(activePlayingNote, d.noteName);
        return isActive || d.isTonic || d.isGhammaz ? '#0f172a' : '#ffffff';
      })
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .text(d => d.noteName);

    // Degree number badge underneath node text
    nodeGroups.append('text')
      .attr('y', 9)
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        const isActive = areNotesEquivalent(activePlayingNote, d.noteName);
        return isActive || d.isTonic || d.isGhammaz ? '#0f172a' : '#cbd5e1';
      })
      .attr('font-size', '8.5px')
      .attr('font-weight', '600')
      .attr('font-family', 'monospace')
      .text(d => `deg ${d.degree}`);

    // Outer label: Comma distance and interval
    nodeGroups.append('text')
      .attr('x', d => Math.cos(d.angleRad) * 36)
      .attr('y', d => Math.sin(d.angleRad) * 36 + 4)
      .attr('text-anchor', d => {
        const cos = Math.cos(d.angleRad);
        if (Math.abs(cos) < 0.25) return 'middle';
        return cos > 0 ? 'start' : 'end';
      })
      .attr('fill', '#fbbf24')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .text(d => `${d.cumCommas}k (${d.cents}¢)`);

    // Center Display Hub
    g.append('text')
      .attr('y', -26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('letter-spacing', '2px')
      .text('53-EDO COMMAS');

    g.append('text')
      .attr('y', 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text(`Maqam ${currentMaqam.name}`);

    g.append('text')
      .attr('y', 26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-family', 'serif')
      .attr('font-size', '15px')
      .text(`مقام ${currentMaqam.arabicName}`);

    g.append('text')
      .attr('y', 46)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(`Qarar: ${currentMaqam.tonicArabicName} • Ghammaz: ${currentMaqam.ghammazArabicName}`);
  };

  // --- 2. LINEAR COMMAS STEPPING LADDER ---
  const renderLinearChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number,
    data: DegreeNode[]
  ) => {
    const margin = { top: 50, right: 60, bottom: 65, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Scale: 0 to 53 commas
    const xScale = d3.scaleLinear().domain([0, 53]).range([0, chartWidth]);

    // X Axis with comma steps
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 9, 16, 22, 31, 40, 47, 53])
      .tickFormat(d => `${d}k`);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .attr('color', '#475569')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Horizontal baseline
    g.append('line')
      .attr('x1', 0)
      .attr('y1', chartHeight)
      .attr('x2', chartWidth)
      .attr('y2', chartHeight)
      .attr('stroke', '#334155')
      .attr('stroke-width', 2);

    // Chords linking each degree back to Tonic (x=0)
    data.forEach((d, i) => {
      const x = xScale(d.cumCommas);
      const barHeight = chartHeight * 0.75 - (i % 2 === 0 ? 0 : 25);

      // Vertical line to note node
      g.append('line')
        .attr('x1', x)
        .attr('y1', chartHeight)
        .attr('x2', x)
        .attr('y2', chartHeight - barHeight)
        .attr('stroke', d.isTonic ? '#f59e0b' : d.isGhammaz ? '#06b6d4' : '#334155')
        .attr('stroke-width', d.isTonic || d.isGhammaz ? 2 : 1.2)
        .attr('stroke-dasharray', d.isTonic ? 'none' : '3 3');

      // Step interval label between previous note and this note
      if (i > 0) {
        const prevX = xScale(data[i - 1].cumCommas);
        const midX = (prevX + x) / 2;

        g.append('rect')
          .attr('x', midX - 16)
          .attr('y', chartHeight - 20)
          .attr('width', 32)
          .attr('height', 16)
          .attr('rx', 4)
          .attr('fill', '#1e293b')
          .attr('stroke', '#334155');

        g.append('text')
          .attr('x', midX)
          .attr('y', chartHeight - 9)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fcd34d')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .text(`+${d.stepCommas}k`);
      }

      // Note Node Group
      const nodeG = g.append('g')
        .attr('transform', `translate(${x}, ${chartHeight - barHeight})`)
        .style('cursor', 'pointer')
        .on('click', () => handlePlayDegree(d));

      const isActive = areNotesEquivalent(activePlayingNote, d.noteName);

      if (isActive) {
        nodeG.append('circle')
          .attr('r', 24)
          .attr('fill', 'none')
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 2.5)
          .attr('filter', 'url(#d3-glow)');
      }

      nodeG.append('circle')
        .attr('r', d.isTonic ? 18 : d.isGhammaz ? 16 : 14)
        .attr('fill', d.isTonic ? '#f59e0b' : d.isGhammaz ? '#06b6d4' : '#059669')
        .attr('stroke', isActive ? '#ffffff' : '#e2e8f0')
        .attr('stroke-width', 2);

      nodeG.append('text')
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .attr('fill', d.isTonic || d.isGhammaz ? '#0f172a' : '#ffffff')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(d.noteName);

      // Comma text above
      nodeG.append('text')
        .attr('y', -24)
        .attr('text-anchor', 'middle')
        .attr('fill', '#38bdf8')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(`${d.cumCommas}k`);

      // Arabic name below
      nodeG.append('text')
        .attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-family', 'serif')
        .text(d.arabicName.split(' ')[0]);
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#050811] border border-cyan-950/70 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.14)] backdrop-blur-md space-y-4"
    >
      {/* Header and Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
              Microtonal Interval Theory
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
              Offtonic 53-EDO
            </span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <span>53-EDO Comma Step &amp; Tonic Pitch Analysis</span>
            <span className="text-sm font-serif text-amber-300 font-normal">دائرة كومات المقام</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            1 Octave = 53 commas (~22.64¢/comma). Click any node to audition its exact pitch and intervals.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('radial')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              viewMode === 'radial'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Radial Wheel (دائري)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('linear')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              viewMode === 'linear'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Interval Ladder (خطي)
          </button>
        </div>
      </div>

      {/* D3 Render Container */}
      <div className="relative flex justify-center items-center overflow-x-auto py-2">
        <svg
          ref={svgRef}
          className="w-full max-w-4xl h-auto drop-shadow-xl select-none"
        />
      </div>

      {/* Degree Inspector & Selected Info Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800/80 text-xs">
        {/* Selected or Active Degree Info */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-stone-500 font-mono block text-[10px] uppercase">Auditioned Degree</span>
          {selectedNode ? (
            <div className="mt-1">
              <span className="font-bold text-amber-300 text-sm">{selectedNode.noteName}</span>{' '}
              <span className="text-stone-300 font-serif">({selectedNode.arabicName})</span>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                Distance: {selectedNode.cumCommas} commas ({selectedNode.cents}¢)
              </div>
            </div>
          ) : (
            <span className="text-stone-400 text-[11px]">Click any degree on the chart above to inspect.</span>
          )}
        </div>

        {/* 53-EDO Step Sequence */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-stone-500 font-mono block text-[10px] uppercase">53-Comma Step Sequence</span>
          <div className="font-mono text-amber-400 text-sm font-bold mt-1">
            {currentMaqam.commas53Sequence ? currentMaqam.commas53Sequence.join(' - ') : '9 - 7 - 6 - 9 - 9 - 7 - 6'}
          </div>
          <span className="text-stone-400 text-[10px] block mt-0.5">
            Total = 53 commas = 1200.0 Cents (Pure Octave)
          </span>
        </div>

        {/* Tonic & Dominant Relationship */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
          <span className="text-stone-500 font-mono block text-[10px] uppercase">Tonic Polarities</span>
          <div className="text-[11px] text-stone-300 mt-1 space-y-0.5">
            <div>
              Qarar (0k): <strong className="text-amber-400">{currentMaqam.tonicArabicName}</strong>
            </div>
            <div>
              Ghammaz (31k): <strong className="text-cyan-400">{currentMaqam.ghammazArabicName}</strong> (~702¢)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
