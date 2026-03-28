// ── SVG: Severity Donut ───────────────────────────────────────────────────────

import { COLORS, FONTS } from "../constants/theme";

interface DonutChartProps {
  data: { label: string; count: number; color: string; textColor: string }[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const cx = 90, cy = 90, outerR = 72, innerR = 44;
  const total = data.reduce((s, d) => s + d.count, 0);

  function donutSegment(startDeg: number, endDeg: number): string {
    // Cap to avoid degenerate arcs
    const safEnd = Math.min(endDeg, startDeg + 359.9);
    const toRad  = (d: number) => ((d - 90) * Math.PI) / 180;
    const ox1 = cx + outerR * Math.cos(toRad(startDeg));
    const oy1 = cy + outerR * Math.sin(toRad(startDeg));
    const ox2 = cx + outerR * Math.cos(toRad(safEnd));
    const oy2 = cy + outerR * Math.sin(toRad(safEnd));
    const ix1 = cx + innerR * Math.cos(toRad(safEnd));
    const iy1 = cy + innerR * Math.sin(toRad(safEnd));
    const ix2 = cx + innerR * Math.cos(toRad(startDeg));
    const iy2 = cy + innerR * Math.sin(toRad(startDeg));
    const large = (safEnd - startDeg) > 180 ? 1 : 0;
    return [
      `M ${ox1} ${oy1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');
  }

  if (total === 0) {
    return (
      <svg viewBox="0 0 260 180" style={{ width: '100%' }}>
        <circle cx={cx} cy={cy} r={outerR} fill="#F1F5F9" />
        <circle cx={cx} cy={cy} r={innerR} fill="white" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill={COLORS.muted}>No data</text>
      </svg>
    );
  }

  const segments: { path: string; color: string; label: string; count: number; textColor: string }[] = [];
  let cursor = 0;
  for (const d of data) {
    if (d.count === 0) continue;
    const sweep = (d.count / total) * 360;
    segments.push({ path: donutSegment(cursor, cursor + sweep), color: d.color, label: d.label, count: d.count, textColor: d.textColor });
    cursor += sweep;
  }

  return (
    <svg viewBox="0 0 260 180" style={{ width: '100%' }}>
      {segments.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 6}  textAnchor="middle" fontSize={20} fontWeight={700} fill={COLORS.text} fontFamily={FONTS.mono}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9}  fill={COLORS.muted} fontFamily={FONTS.ui}>alerts</text>

      {/* Legend */}
      {data.filter(d => d.count > 0).map((d, i) => (
        <g key={d.label} transform={`translate(192, ${28 + i * 32})`}>
          <rect x={0} y={0} width={14} height={14} rx={3} fill={d.color} />
          <text x={18} y={11} fontSize={11} fontWeight={700} fill={COLORS.text} fontFamily={FONTS.ui}>{d.label}</text>
          <text x={18} y={23} fontSize={10} fill={COLORS.muted} fontFamily={FONTS.mono}>{d.count} ({Math.round((d.count / total) * 100)}%)</text>
        </g>
      ))}
    </svg>
  );
};