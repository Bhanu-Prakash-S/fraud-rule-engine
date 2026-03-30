import React, { useState } from 'react';
import { FlagResult } from '../types/alert';
import { AlertsQueue } from '../components/AlertsQueue';
import { evaluateRules } from '../engine/ruleEngine';
import { TRANSACTIONS } from '../data/transactions';
import { loadRules } from '../data/seedRules';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';

interface AlertsPageProps {
  flagResults: FlagResult[];
  onRunRules: (results: FlagResult[]) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ flagResults, onRunRules }) => {
  // const [alerts,    setAlerts]    = useState<FlagResult[]>(flagResults);
  const [running,   setRunning]   = useState(false);
  const [lastRun,   setLastRun]   = useState<string | null>(flagResults.length > 0 ? 'Previously run' : null);

  // Keep local copy in sync with prop (e.g. analyst FP toggles from parent)
  const [localAlerts, setLocalAlerts] = useState<FlagResult[]>(flagResults);

  const handleRun = () => {
    setRunning(true);
    // Micro-delay so the button state visually updates before the sync compute
    setTimeout(() => {
      const rules   = loadRules();
      const results = evaluateRules(TRANSACTIONS, rules);
      setLocalAlerts(results);
      onRunRules(results);
      setLastRun(new Date().toISOString());
      setRunning(false);
    }, 80);
  };

  const handleMarkFP = (alertId: string) => {
    setLocalAlerts(prev => {
      const updated = prev.map(a =>
        a.alertId === alertId ? { ...a, markedFPByAnalyst: !a.markedFPByAnalyst } : a
      );
      onRunRules(updated); // keep parent in sync
      return updated;
    });
  };

  // Sync incoming prop when parent re-runs (e.g. from Rules tab triggering a run)
  React.useEffect(() => {
    if (flagResults.length > 0) setLocalAlerts(flagResults);
  }, [flagResults]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeRuleCount   = loadRules().filter(r => r.isActive).length;
  const flaggedTxns       = new Set(localAlerts.map(a => a.transactionId)).size;
  const analystFP         = localAlerts.filter(a => a.markedFPByAnalyst).length;
  const truePositives     = localAlerts.filter(a => !a.isFalsePositive).length;
  const coverage          = TRANSACTIONS.length > 0
    ? Math.round((flaggedTxns / TRANSACTIONS.length) * 100)
    : 0;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtRunTime(iso: string | null) {
    if (!iso || iso === 'Previously run') return iso ?? '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`;
  }

  const sevCounts = localAlerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.severity] = (acc[a.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

      {/* ── Sub-header ── */}
      <div style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>Alerts Queue — EFRM Simulator</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: COLORS.muted }}>
            Execute all active rules against the transaction set and review flagged alerts.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastRun && (
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              Last run: <span style={{ fontFamily: FONTS.mono }}>{fmtRunTime(lastRun)}</span>
            </span>
          )}
          <button
            onClick={handleRun}
            disabled={running}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 700,
              borderRadius: 5, border: 'none', fontFamily: FONTS.ui,
              background: running ? COLORS.muted : COLORS.accent,
              color: '#fff', cursor: running ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'background 0.15s',
            }}
          >
            <span>{running ? '⏳' : '▶'}</span>
            {running ? 'Running…' : 'Run All Rules'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── Summary strip ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Rules Active',        value: activeRuleCount,   color: COLORS.accent },
            { label: 'Txns Flagged',         value: flaggedTxns,       color: COLORS.danger },
            { label: 'Total Alerts',         value: localAlerts.length, color: '#7C3AED' },
            { label: 'True Positives',       value: truePositives,     color: COLORS.success },
            { label: 'Analyst-Marked FP',   value: analystFP,         color: COLORS.warning },
            { label: 'Rule Coverage',        value: `${coverage}%`,    color: '#0891B2' },
          ].map(s => (
            <div key={s.label} style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: 5, padding: '8px 14px',
            }}>
              <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: FONTS.mono, lineHeight: 1.2 }}>{s.value}</div>
            </div>
          ))}

          {/* Severity breakdown */}
          {localAlerts.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {(['Critical','High','Medium','Low'] as const).map(sev => {
                const cnt = sevCounts[sev] ?? 0;
                if (!cnt) return null;
                const sc = SEVERITY_COLORS[sev];
                return (
                  <span key={sev} style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 4 }}>
                    {cnt} {sev}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Alert summary text ── */}
        {localAlerts.length > 0 && (
          <div style={{
            background: '#FFFBEB', border: `1px solid #FDE68A`,
            borderRadius: 5, padding: '9px 14px',
            fontSize: 12, color: '#78350F', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>⚠</span>
            <span>
              <strong>{flaggedTxns} transactions flagged</strong> across {localAlerts.length} alerts
              {' · '}<strong>{activeRuleCount} rules active</strong>
              {' · '}<strong>{analystFP > 0 ? `${analystFP} analyst-marked FP` : 'No analyst FP marks'}</strong>
              {' · '}Rule coverage: <strong>{coverage}%</strong> of the monitoring set
            </span>
          </div>
        )}

        {/* ── Alerts Queue ── */}
        <AlertsQueue alerts={localAlerts} onMarkFP={handleMarkFP} />

        {/* Footer */}
        <div style={{ marginTop: 10, fontSize: 11, color: COLORS.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span>Fraud Rule Engine Simulator — Phase 3: Alerts Queue · Falcon/EFRM Simulation</span>
          <span style={{ fontFamily: FONTS.mono }}>Dataset: TXN-001 → TXN-050 · January 2025 · INR</span>
        </div>
      </div>
    </div>
  );
};
