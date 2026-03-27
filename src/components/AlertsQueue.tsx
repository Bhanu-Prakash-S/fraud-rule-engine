import React, { useState } from 'react';
import { FlagResult } from '../types/alert';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ` +
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`
  );
}

interface AlertsQueueProps {
  alerts: FlagResult[];
  onMarkFP: (alertId: string) => void;
}

const TH: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: 10.5,
  fontWeight: 700,
  color: COLORS.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  background: '#F8FAFC',
  borderBottom: `1.5px solid ${COLORS.border}`,
  whiteSpace: 'nowrap',
  textAlign: 'left',
};

export const AlertsQueue: React.FC<AlertsQueueProps> = ({ alerts, onMarkFP }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (alerts.length === 0) {
    return (
      <div style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 6, padding: '40px 20px', textAlign: 'center',
        color: COLORS.muted, fontSize: 13,
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
        No alerts generated yet. Click <strong>▶ Run All Rules</strong> to evaluate the transaction set.
      </div>
    );
  }

  const sevOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const sorted = [...alerts].sort((a, b) =>
    (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4)
  );

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              {['Alert ID', 'TXN ID', 'Rule Triggered', 'Scenario', 'Severity', 'Time', 'FP Status', 'Action'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((alert, i) => {
              const sc      = SEVERITY_COLORS[alert.severity];
              const isFP    = alert.markedFPByAnalyst || alert.isFalsePositive && alert.markedFPByAnalyst;
              const muted   = alert.markedFPByAnalyst;
              const hovered = hoveredId === alert.alertId;
              const rowBg   = muted
                ? '#FAFAFA'
                : hovered
                  ? '#F8FAFF'
                  : i % 2 === 0 ? COLORS.surface : '#FAFAFA';

              // Left severity border colour
              const borderCol = {
                Critical: COLORS.danger,
                High:     '#EA580C',
                Medium:   COLORS.warning,
                Low:      COLORS.accent,
              }[alert.severity] ?? COLORS.border;

              const TD: React.CSSProperties = {
                padding: '8px 10px',
                fontSize: 12,
                color: muted ? COLORS.muted : COLORS.text,
                borderBottom: `1px solid ${COLORS.border}`,
                verticalAlign: 'middle',
                textDecoration: muted ? 'line-through' : 'none',
              };

              return (
                <tr
                  key={alert.alertId}
                  style={{ background: rowBg, borderLeft: `3px solid ${muted ? COLORS.border : borderCol}` }}
                  onMouseEnter={() => setHoveredId(alert.alertId)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Alert ID */}
                  <td style={{ ...TD, width: 95 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 500, color: muted ? COLORS.muted : COLORS.accent }}>
                      {alert.alertId}
                    </span>
                  </td>

                  {/* TXN ID */}
                  <td style={{ ...TD, width: 90 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 500, color: muted ? COLORS.muted : COLORS.text }}>
                      {alert.transactionId}
                    </span>
                  </td>

                  {/* Rule name */}
                  <td style={{ ...TD }}>
                    <div style={{ fontWeight: 500 }}>{alert.ruleName}</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 1 }}>{alert.ruleId}</div>
                  </td>

                  {/* Scenario */}
                  <td style={{ ...TD, fontSize: 11.5, fontStyle: 'italic', color: muted ? COLORS.muted : COLORS.muted }}>
                    {alert.scenario}
                  </td>

                  {/* Severity */}
                  <td style={{ ...TD, width: 88 }}>
                    {!muted ? (
                      <span style={{
                        background: sc.bg, color: sc.text,
                        fontSize: 10.5, fontWeight: 800,
                        padding: '2px 8px', borderRadius: 3,
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}>
                        {alert.severity.toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, color: COLORS.muted }}>{alert.severity}</span>
                    )}
                  </td>

                  {/* Time */}
                  <td style={{ ...TD, width: 150, fontSize: 11, whiteSpace: 'nowrap' }}>
                    {formatTimestamp(alert.timestamp)}
                  </td>

                  {/* FP Status */}
                  <td style={{ ...TD, width: 110, textDecoration: 'none' }}>
                    {alert.markedFPByAnalyst ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#F3F4F6', color: COLORS.muted, padding: '2px 8px', borderRadius: 3 }}>
                        FP — Analyst
                      </span>
                    ) : alert.isFalsePositive ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#FEF9C3', color: '#713F12', padding: '2px 8px', borderRadius: 3 }}>
                        Likely FP
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#FEF2F2', color: '#991B1B', padding: '2px 8px', borderRadius: 3 }}>
                        True Positive
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td style={{ ...TD, width: 150, textDecoration: 'none' }}>
                    <button
                      onClick={() => onMarkFP(alert.alertId)}
                      style={{
                        fontSize: 10.5, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 3,
                        border: `1px solid ${alert.markedFPByAnalyst ? COLORS.border : COLORS.warning}`,
                        background: alert.markedFPByAnalyst ? COLORS.surface : '#FFF7ED',
                        color: alert.markedFPByAnalyst ? COLORS.muted : '#92400E',
                        cursor: 'pointer', fontFamily: FONTS.ui,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {alert.markedFPByAnalyst ? '↩ Unmark FP' : '⚑ Mark as FP'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px', borderTop: `1px solid ${COLORS.border}`, background: '#F8FAFC',
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: COLORS.muted,
      }}>
        <span><strong style={{ color: COLORS.text }}>{alerts.length}</strong> alerts</span>
        <span>Analyst-marked FP: <strong style={{ color: COLORS.warning }}>{alerts.filter(a => a.markedFPByAnalyst).length}</strong></span>
        <span>True positives: <strong style={{ color: COLORS.success }}>{alerts.filter(a => !a.isFalsePositive).length}</strong></span>
        <span style={{ marginLeft: 'auto', fontFamily: FONTS.mono }}>Sorted by severity · Critical first</span>
      </div>
    </div>
  );
};
