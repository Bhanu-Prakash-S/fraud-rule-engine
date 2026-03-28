// ── SVG: Channel Breakdown (horizontal bars) ──────────────────────────────────

import { COLORS, FONTS } from "../constants/theme";

interface ChannelChartProps {
  data: { channel: string; count: number }[];
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ data }) => {
  const W = 340, H = 220;
  const labelW = 118, barAreaW = W - labelW - 44, padY = 14, barH = 16, gap = 8;
  const maxVal = Math.max(...data.map(d => d.count), 1);

  if (data.length === 0) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={12} fill={COLORS.muted}>No data</text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {data.map((d, i) => {
        const y       = padY + i * (barH + gap);
        const barW    = Math.max(2, (d.count / maxVal) * barAreaW);
        const barX    = labelW;
        return (
          <g key={d.channel}>
            {/* Channel label */}
            <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill={COLORS.muted} fontFamily={FONTS.ui}>
              {d.channel}
            </text>
            {/* Background track */}
            <rect x={barX} y={y} width={barAreaW} height={barH} rx={3} fill="#F1F5F9" />
            {/* Bar */}
            <rect x={barX} y={y} width={barW} height={barH} rx={3} fill={COLORS.primary} />
            {/* Count label */}
            <text x={barX + barW + 6} y={y + barH / 2 + 4} fontSize={11} fontWeight={700} fill={COLORS.text} fontFamily={FONTS.mono}>
              {d.count}
            </text>
          </g>
        );
      })}
      {/* X-axis tick labels */}
      {[0, Math.round(maxVal / 2), maxVal].map(tick => {
        const x = labelW + (tick / maxVal) * barAreaW;
        return (
          <text key={tick} x={x} y={H - 4} textAnchor="middle" fontSize={9} fill={COLORS.muted} fontFamily={FONTS.mono}>
            {tick}
          </text>
        );
      })}
    </svg>
  );
};
