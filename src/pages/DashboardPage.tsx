import React, { useMemo } from 'react';
import { FlagResult } from '../types/alert';
import { TRANSACTIONS } from '../data/transactions';
import { loadRules } from '../data/seedRules';
import { getRuleAuditLog } from '../engine/ruleEngine';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';
import { DonutChart } from '../charts/DonutChart';
import { HourlyChart } from '../charts/HourlyChart';
import { ChannelChart } from '../charts/ChannelChart';
import { AuditLog } from '../charts/AuditLog';
import { AboutPanel } from '../charts/AboutPanel';


interface DashboardPageProps {
  flagResults: FlagResult[];
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

        {/* ── About This Project (collapsible) ── */}
        <AboutPanel />
        
        {/* Footer */}
        <div style={{ fontSize: 11, color: COLORS.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span>Fraud Rule Engine Simulator · Falcon/EFRM Simulation</span>
          <span style={{ fontFamily: FONTS.mono }}>
            Dataset: TXN-001 → TXN-0{TRANSACTIONS.length} · January 2025 · INR
          </span>
        </div>
      </div>
    </div>
  );
};
