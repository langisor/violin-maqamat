import * as d3 from 'd3';
import type { ChartPalette } from '../theme/chartPalette';

/**
 * Shared D3 renderers for the equal-division-of-the-octave (EDO) analysis charts.
 * Maqam53EdoChart and Maqam24EdoChart each derive their own degree data and copy,
 * then delegate the drawing here so both stay visually and behaviourally identical.
 */

export interface EdoDegree {
  degree: number;
  noteName: string;
  arabicName: string;
  stepUnits: number; // interval from previous degree, in EDO steps
  cumUnits: number; // cumulative steps from tonic (0 … divisions)
  cents: number;
  isTonic: boolean;
  isGhammaz: boolean;
  jinsType: 'asl' | 'far';
  intervalName: string;
  angleRad: number;
}

export interface EdoChartConfig {
  divisions: number; // 53 or 24
  unit: string; // 'k' (comma) or 'q' (quarter-tone)
  majorEvery: number; // emphasised tick spacing
  labelEvery: number; // numeric ring label spacing
  hubTitle: string;
  idPrefix: string; // keeps SVG filter ids unique when several charts share a page
}

export interface EdoRenderArgs {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  data: EdoDegree[];
  cfg: EdoChartConfig;
  palette: ChartPalette;
  maqamName: string;
  maqamArabicName: string;
  qararName: string;
  ghammazName: string;
  isActive: (noteName: string) => boolean;
  onPlay: (d: EdoDegree) => void;
}

/** Adds focus + keyboard activation so the SVG nodes are reachable without a mouse. */
const makeInteractive = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sel: d3.Selection<SVGGElement, EdoDegree, any, any>,
  onPlay: (d: EdoDegree) => void,
) => {
  sel
    .style('cursor', 'pointer')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => `Play degree ${d.degree}, ${d.noteName}`)
    .on('click', (_, d) => onPlay(d))
    .on('keydown', (event: KeyboardEvent, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onPlay(d);
      }
    });
};

export const prepareSvg = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
  idPrefix: string,
  label: string,
) => {
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'group').attr('aria-label', label);
  const filter = svg.append('defs').append('filter').attr('id', `${idPrefix}-glow`);
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
  const merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'coloredBlur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');
};

// --- 1. RADIAL PITCH WHEEL ---------------------------------------------------
export const renderRadialChart = ({
  svg, width, height, data, cfg, palette: P, maqamName, maqamArabicName, qararName, ghammazName, isActive, onPlay,
}: EdoRenderArgs) => {
  const { divisions: N, unit, majorEvery, labelEvery } = cfg;
  const glow = `url(#${cfg.idPrefix}-glow)`;
  const outerR = 210;
  const innerR = 145;
  const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

  g.append('circle').attr('r', outerR + 24).attr('fill', P.wheelBg).attr('stroke', P.ring).attr('stroke-width', 1.5);
  g.append('circle').attr('r', innerR - 25).attr('fill', P.hubBg).attr('stroke', P.ring).attr('stroke-width', 2);

  // Equal-division ticks
  for (let c = 0; c < N; c++) {
    const angle = (c / N) * 2 * Math.PI - Math.PI / 2;
    const major = c % majorEvery === 0;
    const r1 = outerR + 10;
    const r2 = outerR + (major ? 22 : 16);
    g.append('line')
      .attr('x1', Math.cos(angle) * r1).attr('y1', Math.sin(angle) * r1)
      .attr('x2', Math.cos(angle) * r2).attr('y2', Math.sin(angle) * r2)
      .attr('stroke', major ? P.tickMajor : P.tickMinor)
      .attr('stroke-width', major ? 1.8 : 0.8)
      .attr('opacity', major ? 0.9 : 0.5);

    if (c % labelEvery === 0) {
      g.append('text')
        .attr('x', Math.cos(angle) * (outerR + 35))
        .attr('y', Math.sin(angle) * (outerR + 35) + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', P.tickLabel)
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(c === 0 ? `0/${N}` : `${c}${unit}`);
    }
  }

  // Jins arcs (lower = asl / emerald, upper = far' / cyan)
  const arc = (from: EdoDegree, to: EdoDegree) =>
    d3.arc()({
      innerRadius: innerR - 8,
      outerRadius: outerR + 4,
      startAngle: (from.cumUnits / N) * 2 * Math.PI,
      endAngle: (to.cumUnits / N) * 2 * Math.PI,
    }) || '';

  if (data.length >= 4) {
    g.append('path').attr('d', arc(data[0], data[3]))
      .attr('fill', P.aslFill).attr('stroke', P.aslStroke).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');
  }
  if (data.length >= 8) {
    g.append('path').attr('d', arc(data[4], data[7]))
      .attr('fill', P.farFill).attr('stroke', P.farStroke).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');
  }

  // Chords from the tonic
  const tonic = data[0];
  const chordR = innerR + 15;
  data.slice(1).forEach((d) => {
    g.append('line')
      .attr('x1', Math.cos(tonic.angleRad) * chordR).attr('y1', Math.sin(tonic.angleRad) * chordR)
      .attr('x2', Math.cos(d.angleRad) * chordR).attr('y2', Math.sin(d.angleRad) * chordR)
      .attr('stroke', d.isGhammaz ? P.cyan : P.chord)
      .attr('stroke-width', d.isGhammaz ? 2.2 : 1.2)
      .attr('stroke-dasharray', d.isGhammaz ? 'none' : '3 3')
      .attr('opacity', d.isGhammaz ? 0.9 : 0.7);
  });

  // Degree polygon
  const poly = d3.line<EdoDegree>()
    .x((d) => Math.cos(d.angleRad) * innerR)
    .y((d) => Math.sin(d.angleRad) * innerR)
    .curve(d3.curveLinearClosed);
  g.append('path').datum(data).attr('d', poly)
    .attr('fill', P.chord).attr('fill-opacity', 0.25).attr('stroke', P.accent).attr('stroke-width', 2);

  // The tonic and the octave degree share one angle; nudge them apart along the tangent so both stay visible.
  const lastIdx = data.length - 1;
  const octaveCoincides = data.length > 1 && data[lastIdx].cumUnits === N;
  const sideOf = (d: EdoDegree): -1 | 0 | 1 =>
    !octaveCoincides ? 0 : d.isTonic ? -1 : d.degree === data[lastIdx].degree ? 1 : 0;

  // Nodes
  const nodes = g.selectAll<SVGGElement, EdoDegree>('g.degree-node')
    .data(data).enter().append('g').attr('class', 'degree-node')
    .attr('transform', (d) => {
      const off = sideOf(d) * 24;
      const x = Math.cos(d.angleRad) * innerR + -Math.sin(d.angleRad) * off;
      const y = Math.sin(d.angleRad) * innerR + Math.cos(d.angleRad) * off;
      return `translate(${x}, ${y})`;
    });
  makeInteractive(nodes, onPlay);

  nodes.filter((d) => isActive(d.noteName)).append('circle')
    .attr('r', 28).attr('fill', 'none').attr('stroke', P.accentGlow).attr('stroke-width', 3)
    .attr('filter', glow).attr('opacity', 0.9);

  const solidText = (d: EdoDegree) => isActive(d.noteName) || d.isTonic || d.isGhammaz;

  nodes.append('circle')
    .attr('r', (d) => (d.isTonic ? 22 : d.isGhammaz ? 20 : 18))
    .attr('fill', (d) => (isActive(d.noteName) ? P.accentGlow : d.isTonic ? P.accent : d.isGhammaz ? P.cyan : d.jinsType === 'asl' ? P.aslNode : P.farNode))
    .attr('stroke', (d) => (isActive(d.noteName) ? P.activeStroke : d.isTonic ? P.tonicRing : d.isGhammaz ? P.ghammazRing : P.nodeRing))
    .attr('stroke-width', 2.5)
    .attr('filter', (d) => (d.isTonic || d.isGhammaz ? glow : 'none'));

  nodes.append('text').attr('y', -2).attr('text-anchor', 'middle')
    .attr('fill', (d) => (solidText(d) ? P.textOnAccentNode : P.textOnNode))
    .attr('font-size', '11px').attr('font-weight', 'bold').attr('font-family', 'sans-serif')
    .style('pointer-events', 'none').text((d) => d.noteName);

  nodes.append('text').attr('y', 9).attr('text-anchor', 'middle')
    .attr('fill', (d) => (solidText(d) ? P.textOnAccentNode : P.textOnNodeSub))
    .attr('font-size', '8.5px').attr('font-weight', '600').attr('font-family', 'monospace')
    .style('pointer-events', 'none').text((d) => `deg ${d.degree}`);

  nodes.append('text')
    .attr('x', (d) => (sideOf(d) ? sideOf(d) * 8 : Math.cos(d.angleRad) * 36))
    .attr('y', (d) => (sideOf(d) ? -34 : Math.sin(d.angleRad) * 36 + 4))
    .attr('text-anchor', (d) => {
      if (sideOf(d)) return sideOf(d) < 0 ? 'end' : 'start';
      const cos = Math.cos(d.angleRad);
      return Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end';
    })
    .attr('fill', P.accentText).attr('font-size', '10px').attr('font-family', 'monospace').attr('font-weight', '600')
    .style('pointer-events', 'none').text((d) => `${d.cumUnits}${unit} (${d.cents}¢)`);

  // Hub
  const hub = (y: number, text: string, attrs: Record<string, string | number>) => {
    const t = g.append('text').attr('y', y).attr('text-anchor', 'middle').text(text);
    Object.entries(attrs).forEach(([k, v]) => t.attr(k, v));
  };
  hub(-26, cfg.hubTitle, { fill: P.textMuted, 'font-size': '11px', 'font-family': 'monospace', 'letter-spacing': '2px' });
  hub(2, `Maqam ${maqamName}`, { fill: P.accent, 'font-size': '20px', 'font-weight': 'bold' });
  hub(26, `مقام ${maqamArabicName}`, { fill: P.cyanText, 'font-family': 'serif', 'font-size': '15px' });
  hub(46, `Qarar: ${qararName} • Ghammaz: ${ghammazName}`, { fill: P.tickLabel, 'font-size': '10px', 'font-family': 'monospace' });
};

// --- 2. LINEAR STEPPING LADDER ----------------------------------------------
export const renderLinearChart = ({
  svg, width, height, data, cfg, palette: P, isActive, onPlay,
}: EdoRenderArgs) => {
  const { divisions: N, unit } = cfg;
  const glow = `url(#${cfg.idPrefix}-glow)`;
  const margin = { top: 50, right: 60, bottom: 65, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleLinear().domain([0, N]).range([0, chartWidth]);
  const tickValues = Array.from(new Set([0, ...data.map((d) => d.cumUnits), N])).sort((a, b) => a - b);

  g.append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x).tickValues(tickValues).tickFormat((v) => `${v}${unit}`))
    .attr('color', P.axis)
    .selectAll('text').attr('fill', P.textMuted).attr('font-size', '10px').attr('font-family', 'monospace');

  g.append('line').attr('x1', 0).attr('y1', chartHeight).attr('x2', chartWidth).attr('y2', chartHeight)
    .attr('stroke', P.tickMinor).attr('stroke-width', 2);

  data.forEach((d, i) => {
    const px = x(d.cumUnits);
    const barHeight = chartHeight * 0.75 - (i % 2 === 0 ? 0 : 25);

    g.append('line').attr('x1', px).attr('y1', chartHeight).attr('x2', px).attr('y2', chartHeight - barHeight)
      .attr('stroke', d.isTonic ? P.accent : d.isGhammaz ? P.cyan : P.tickMinor)
      .attr('stroke-width', d.isTonic || d.isGhammaz ? 2 : 1.2)
      .attr('stroke-dasharray', d.isTonic ? 'none' : '3 3');

    if (i > 0) {
      const midX = (x(data[i - 1].cumUnits) + px) / 2;
      g.append('rect').attr('x', midX - 16).attr('y', chartHeight - 20).attr('width', 32).attr('height', 16)
        .attr('rx', 4).attr('fill', P.pillBg).attr('stroke', P.pillStroke);
      g.append('text').attr('x', midX).attr('y', chartHeight - 9).attr('text-anchor', 'middle')
        .attr('fill', P.pillText).attr('font-size', '9px').attr('font-family', 'monospace').attr('font-weight', 'bold')
        .text(`+${d.stepUnits}${unit}`);
    }

    const active = isActive(d.noteName);
    const nodeG = g.append('g').datum(d).attr('transform', `translate(${px}, ${chartHeight - barHeight})`);
    makeInteractive(nodeG, onPlay);

    if (active) {
      nodeG.append('circle').attr('r', 24).attr('fill', 'none').attr('stroke', P.accentGlow)
        .attr('stroke-width', 2.5).attr('filter', glow);
    }

    nodeG.append('circle')
      .attr('r', d.isTonic ? 18 : d.isGhammaz ? 16 : 14)
      .attr('fill', d.isTonic ? P.accent : d.isGhammaz ? P.cyan : P.aslNode)
      .attr('stroke', active ? P.activeStroke : P.nodeRing).attr('stroke-width', 2);

    nodeG.append('text').attr('y', 4).attr('text-anchor', 'middle')
      .attr('fill', d.isTonic || d.isGhammaz ? P.textOnAccentNode : P.textOnNode)
      .attr('font-size', '10px').attr('font-weight', 'bold').style('pointer-events', 'none').text(d.noteName);

    nodeG.append('text').attr('y', -24).attr('text-anchor', 'middle').attr('fill', P.cyanText)
      .attr('font-size', '9px').attr('font-family', 'monospace').style('pointer-events', 'none')
      .text(`${d.cumUnits}${unit}`);

    nodeG.append('text').attr('y', 28).attr('text-anchor', 'middle').attr('fill', P.arabicLabel)
      .attr('font-size', '10px').attr('font-family', 'serif').style('pointer-events', 'none')
      .text(d.arabicName.split(' ')[0]);
  });
};
