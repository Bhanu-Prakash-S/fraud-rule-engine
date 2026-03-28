// ── SVG: Hourly Distribution (vertical bar chart) ─────────────────────────────

import { COLORS, FONTS } from "../constants/theme";

interface HourlyChartProps {
  data: Record<number, number>;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  const W = 520, H = 180;
  const padL = 28, padR = 8, padT = 10, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = Math.max(...Object.values(data), 1);
  const barW   = plotW / 24 - 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {/* Y grid lines */}
      {[0, maxVal].map(v => {
        const y = padT + plotH - (v / maxVal) * plotH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={COLORS.border} strokeWidth={0.5} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={COLORS.muted} fontFamily={FONTS.mono}>{v}</text>
          </g>
        );
      })}

      {/* Bars */}
      {Array.from({ length: 24 }, (_, h) => {
        const count  = data[h] ?? 0;
        const x      = padL + h * (plotW / 24) + 1;
        const barH   = count > 0 ? Math.max(3, (count / maxVal) * plotH) : 0;
        const y      = padT + plotH - barH;
        const isSpike = h >= 1 && h <= 4;
        return (
          <g key={h}>
            <rect
              x={x} y={y} width={barW} height={barH} rx={2}
              fill={isSpike ? COLORS.danger : COLORS.primary}
              opacity={count > 0 ? 1 : 0}
            />
            {count > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={9} fontWeight={700} fill={isSpike ? COLORS.danger : COLORS.primary} fontFamily={FONTS.mono}>
                {count}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis labels — every 4 hours */}
      {[0, 4, 8, 12, 16, 20, 23].map(h => {
        const x = padL + h * (plotW / 24) + barW / 2;
        return (
          <text key={h} x={x} y={H - 6} textAnchor="middle" fontSize={9} fill={COLORS.muted} fontFamily={FONTS.mono}>
            {String(h).padStart(2, '0')}h
          </text>
        );
      })}

      {/* X axis baseline */}
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={COLORS.border} strokeWidth={0.5} />

      {/* Late night shading */}
      {[1, 2, 3, 4].map(h => (
        <rect
          key={h}
          x={padL + h * (plotW / 24)}
          y={padT}
          width={plotW / 24}
          height={plotH}
          fill="#DC2626"
          opacity={0.06}
        />
      ))}

      {/* Late night label */}
      <text x={padL + 2.5 * (plotW / 24)} y={padT + 10} textAnchor="middle" fontSize={8} fill={COLORS.danger} opacity={0.7} fontFamily={FONTS.ui}>
        1–4h
      </text>
    </svg>
  );
};
