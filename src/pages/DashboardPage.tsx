import React, { useMemo } from 'react';
import { FlagResult } from '../types/alert';
import { TRANSACTIONS } from '../data/transactions';
import { loadRules } from '../data/seedRules';
import { getRuleAuditLog, AuditEntry } from '../engine/ruleEngine';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';

interface DashboardPageProps {
  flagResults: FlagResult[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`;
}

function exportCSV(flagResults: FlagResult[]): void {
  const headers = [
    'Alert ID','Transaction ID','Rule ID','Rule Name','Scenario',
    'Severity','Is False Positive','Marked FP by Analyst','Alert Timestamp',
  ];
  const rows = flagResults.map(f => [
    f.alertId,
    f.transactionId,
    f.ruleId,
    `"${f.ruleName.replace(/"/g, '""')}"`,
    `"${f.scenario.replace(/"/g, '""')}"`,
    f.severity,
    f.isFalsePositive,
    f.markedFPByAnalyst,
    f.timestamp,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `EFRM_Alert_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── SVG: Channel Breakdown (horizontal bars) ──────────────────────────────────

interface ChannelChartProps {
  data: { channel: string; count: number }[];
}

const ChannelChart: React.FC<ChannelChartProps> = ({ data }) => {
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

// ── SVG: Hourly Distribution (vertical bar chart) ─────────────────────────────

interface HourlyChartProps {
  data: Record<number, number>;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
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

// ── SVG: Severity Donut ───────────────────────────────────────────────────────

interface DonutChartProps {
  data: { label: string; count: number; color: string; textColor: string }[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
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

// ── Audit Log ─────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CREATE:           { bg: '#F0FDF4', text: '#14532D', label: 'CREATE'  },
  UPDATE:           { bg: '#EFF6FF', text: '#1E3A8A', label: 'UPDATE'  },
  DELETE:           { bg: '#FEE2E2', text: '#7F1D1D', label: 'DELETE'  },
  TOGGLE_ACTIVE:    { bg: '#F0FDF4', text: '#14532D', label: 'ACTIVATE' },
  TOGGLE_INACTIVE:  { bg: '#FEF9C3', text: '#713F12', label: 'SUSPEND'  },
};

const AuditLog: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: COLORS.muted, fontSize: 12, fontStyle: 'italic' }}>
        No rule changes recorded this session. Create, edit, delete or toggle a rule to generate audit entries.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.map((e, i) => {
        const ac = ACTION_COLORS[e.action] ?? { bg: '#F3F4F6', text: '#374151', label: e.action };
        return (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 14px',
            background: i % 2 === 0 ? COLORS.surface : '#FAFAFA',
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            {/* Timestamp */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.muted, whiteSpace: 'nowrap', minWidth: 160, paddingTop: 1 }}>
              {fmtDate(e.timestamp)}
            </span>
            {/* Action badge */}
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 3, background: ac.bg, color: ac.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {ac.label}
            </span>
            {/* Rule reference */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.accent, whiteSpace: 'nowrap' }}>{e.ruleId}</span>
            {/* Rule name */}
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, flexShrink: 0 }}>{e.ruleName}</span>
            {/* Detail */}
            <span style={{ fontSize: 11.5, color: COLORS.muted, flex: 1 }}>{e.detail}</span>
            {/* Analyst */}
            <span style={{ fontSize: 10.5, color: COLORS.muted, whiteSpace: 'nowrap' }}>{e.analyst}</span>
            {/* Audit ID */}
            <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.border, whiteSpace: 'nowrap' }}>{e.id}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const SL: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, color: COLORS.muted,
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ flagResults }) => {
  const rules      = loadRules();
  const auditLog   = getRuleAuditLog();
  const txnMap     = useMemo(() => new Map(TRANSACTIONS.map(t => [t.id, t])), []);

  // ── KPI metrics ──────────────────────────────────────────────────────────
  const totalTxns     = TRANSACTIONS.length;
  const totalAlerts   = flagResults.length;
  const confirmedFPs  = flagResults.filter(f => f.isFalsePositive).length;
  const flaggedTxns   = new Set(flagResults.map(f => f.transactionId)).size;
  const flagRate      = totalTxns > 0 ? ((flaggedTxns / totalTxns) * 100).toFixed(1) : '0.0';

  // ── Rule performance ──────────────────────────────────────────────────────
  const rulePerf = rules.map(rule => {
    const ruleAlerts = flagResults.filter(f => f.ruleId === rule.id);
    const flags      = ruleAlerts.length;
    const fps        = ruleAlerts.filter(f => f.isFalsePositive).length;
    const hitRate    = totalTxns > 0 ? (flags / totalTxns) * 100 : 0;
    const precision  = flags > 0 ? ((flags - fps) / flags) * 100 : null;
    return { rule, flags, fps, hitRate, precision };
  });

  // ── Channel breakdown ──────────────────────────────────────────────────────
  const channelCounts: Record<string, number> = {};
  for (const f of flagResults) {
    const tx = txnMap.get(f.transactionId);
    if (tx) channelCounts[tx.channel] = (channelCounts[tx.channel] ?? 0) + 1;
  }
  const channelData = Object.entries(channelCounts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count);

  // ── Hourly distribution ────────────────────────────────────────────────────
  const hourlyData: Record<number, number> = {};
  for (const f of flagResults) {
    const tx = txnMap.get(f.transactionId);
    if (tx) {
      const h = new Date(tx.timestamp).getHours();
      hourlyData[h] = (hourlyData[h] ?? 0) + 1;
    }
  }

  // ── Severity distribution ──────────────────────────────────────────────────
  const sevCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const f of flagResults) sevCounts[f.severity] = (sevCounts[f.severity] ?? 0) + 1;
  const donutData = [
    { label: 'Critical', count: sevCounts.Critical, color: SEVERITY_COLORS.Critical.dot, textColor: '#fff' },
    { label: 'High',     count: sevCounts.High,     color: SEVERITY_COLORS.High.dot,     textColor: '#fff' },
    { label: 'Medium',   count: sevCounts.Medium,   color: SEVERITY_COLORS.Medium.dot,   textColor: '#fff' },
    { label: 'Low',      count: sevCounts.Low,       color: SEVERITY_COLORS.Low.dot,     textColor: '#fff' },
  ];

  const hasData = flagResults.length > 0;

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

      {/* ── Sub-header ── */}
      <div style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>
            MIS Dashboard — Rule Performance Analytics
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: COLORS.muted }}>
            Management reporting view · FCPG Fraud Monitoring · EFRM Simulation
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!hasData && (
            <span style={{ fontSize: 11, color: COLORS.warning, fontStyle: 'italic' }}>
              ↗ Run rules on the Alerts Queue tab first to populate this dashboard.
            </span>
          )}
          <button
            onClick={() => exportCSV(flagResults)}
            disabled={!hasData}
            style={{
              padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 5,
              border: `1px solid ${hasData ? COLORS.accent : COLORS.border}`,
              background: hasData ? '#EFF6FF' : COLORS.surface,
              color: hasData ? COLORS.accent : COLORS.muted,
              cursor: hasData ? 'pointer' : 'default',
              fontFamily: FONTS.ui, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>⬇</span>
            Export for Regulatory Reporting (RBI Format — simulated)
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── KPI Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Transactions Monitored', value: totalTxns,           icon: '📋', color: COLORS.accent   },
            { label: 'Total Alerts Raised',           value: totalAlerts,          icon: '🚨', color: COLORS.danger   },
            { label: 'Confirmed False Positives',     value: confirmedFPs,         icon: '⚑',  color: COLORS.warning  },
            { label: 'Overall Flag Rate',             value: `${flagRate}%`,       icon: '📊', color: '#7C3AED'       },
          ].map(k => (
            <div key={k.label} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderTop: `3px solid ${k.color}`,
              borderRadius: 6, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ ...SL }}>{k.label}</span>
                <span style={{ fontSize: 18, opacity: 0.5 }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: k.color, fontFamily: FONTS.mono, lineHeight: 1 }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Rule Performance Table ── */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ ...SL }}>Rule Performance Table</span>
              <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 10 }}>Precision &lt; 50% → review recommended</span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              {rules.filter(r => r.isActive).length} active / {rules.length} total rules
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Rule Name', 'Scenario', 'Severity', 'Flags Raised', 'False Positives', 'Hit Rate %', 'Precision %', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '7px 12px', fontSize: 10.5, fontWeight: 700, color: COLORS.muted,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      background: '#F8FAFC', borderBottom: `1.5px solid ${COLORS.border}`,
                      whiteSpace: 'nowrap', textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rulePerf.map(({ rule, flags, fps, hitRate, precision }, i) => {
                  const sc     = SEVERITY_COLORS[rule.severity];
                  const noData = !hasData || flags === 0;

                  // Precision color coding
                  // let precColor = COLORS.muted;
                  let precColor: typeof COLORS[keyof typeof COLORS] = COLORS.muted;
                  let precBg    = 'transparent';
                  let precLabel = '—';
                  let warnBadge = false;
                  if (precision !== null) {
                    precLabel = `${precision.toFixed(1)}%`;
                    if (precision > 80)       { precColor = COLORS.success;  precBg = '#F0FDF4'; }
                    else if (precision >= 50) { precColor = COLORS.warning;  precBg = '#FFFBEB'; }
                    else                      { precColor = COLORS.danger;   precBg = '#FEF2F2'; warnBadge = true; }
                  }

                  return (
                    <tr key={rule.id} style={{ background: i % 2 === 0 ? COLORS.surface : '#FAFAFA' }}>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: COLORS.text }}>{rule.name}</div>
                        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 1 }}>{rule.id}</div>
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 11.5, color: COLORS.muted, fontStyle: 'italic' }}>
                        {rule.scenario}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
                        <span style={{ background: sc.bg, color: sc.text, fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 3 }}>
                          {rule.severity.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}`, fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: noData ? COLORS.muted : COLORS.text }}>
                        {noData ? '—' : flags}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}`, fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: noData ? COLORS.muted : fps > 0 ? COLORS.danger : COLORS.success }}>
                        {noData ? '—' : fps}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}`, fontFamily: FONTS.mono, fontSize: 13, color: noData ? COLORS.muted : COLORS.text }}>
                        {noData ? '—' : `${hitRate.toFixed(1)}%`}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
                        {noData ? (
                          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>—</span>
                        ) : (
                          <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: precColor, background: precBg, padding: '2px 8px', borderRadius: 3 }}>
                            {precLabel}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
                        {noData ? (
                          <span style={{ fontSize: 11, color: COLORS.muted }}>No run data</span>
                        ) : warnBadge ? (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: '#FEE2E2', color: COLORS.danger, padding: '3px 9px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            ⚠ Review Recommended
                          </span>
                        ) : !rule.isActive ? (
                          <span style={{ fontSize: 11, color: COLORS.muted }}>Inactive</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.success }}>● Performing</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 14 }}>

          {/* Channel Breakdown */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ ...SL, display: 'block', marginBottom: 12 }}>Channel Breakdown</div>
            {hasData && channelData.length > 0 ? (
              <ChannelChart data={channelData} />
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted, fontSize: 12 }}>
                Run rules to populate
              </div>
            )}
          </div>

          {/* Hourly Distribution */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ ...SL }}>Hourly Flag Distribution</span>
              <span style={{ fontSize: 10, color: COLORS.danger, fontWeight: 600 }}>
                ▮ Red = late-night spike zone (01–04h)
              </span>
            </div>
            {hasData ? (
              <HourlyChart data={hourlyData} />
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted, fontSize: 12 }}>
                Run rules to populate
              </div>
            )}
          </div>

          {/* Severity Donut */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ ...SL, display: 'block', marginBottom: 12 }}>Severity Distribution</div>
            <DonutChart data={donutData} />
          </div>
        </div>

        {/* ── Rule Audit Log ── */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ ...SL }}>Rule Change Audit Trail</span>
              {auditLog.length > 0 && (
                <span style={{ fontSize: 10.5, fontFamily: FONTS.mono, color: COLORS.muted }}>
                  {auditLog.length} {auditLog.length === 1 ? 'entry' : 'entries'} this session
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: COLORS.muted, lineHeight: 1.5 }}>
              In production Falcon environments, all rule changes require documented audit trails for compliance and RBI inspection.
            </p>
          </div>
          <AuditLog entries={auditLog} />
        </div>

        {/* Footer */}
        <div style={{ fontSize: 11, color: COLORS.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span>Fraud Rule Engine Simulator — Phase 4: MIS Dashboard · Falcon/EFRM Simulation</span>
          <span style={{ fontFamily: FONTS.mono }}>
            Dataset: TXN-001 → TXN-0{TRANSACTIONS.length} · January 2025 · INR
          </span>
        </div>
      </div>
    </div>
  );
};
