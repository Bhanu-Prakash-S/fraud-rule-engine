// ── About This Project panel ──────────────────────────────────────────────────

import { useState } from "react";
import { COLORS, FONTS } from "../constants/theme";

export const AboutPanel: React.FC = () => {
  const [open, setOpen] = useState(false);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement => (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.muted, minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11.5, color: COLORS.text, flex: 1 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: '#F8FAFC', border: 'none',
          borderBottom: open ? `1px solid ${COLORS.border}` : 'none',
          cursor: 'pointer', fontFamily: FONTS.ui,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            About This Project
          </span>
          <span style={{ fontSize: 11, color: COLORS.muted, fontStyle: 'italic' }}>
            FCPG component mapping + tech stack reference
          </span>
        </div>
        <span style={{ fontSize: 13, color: COLORS.muted, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>
          ▶
        </span>
      </button>

      {open && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Component mapping */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Component → Real FCPG Environment Mapping
            </div>
            <Row label="Transaction Ledger (Tab 1)" value="Mirrors the transaction monitoring feed in Falcon/EFRM — the raw events that flow through the rule engine in real time. In production, this is a streaming feed from core banking and payment rails." />
            <Row label="Rule Builder (Tab 2)" value="Replicates the SRL (Scenario Rule Language) authoring workflow used by fraud analysts in Falcon. Analysts define conditions, set severity levels, and assign scenarios — all of which map directly to the config objects ingested by the EFRM engine." />
            <Row label="SRL Preview Panel" value='The live SRL snippet rendered in the builder mirrors what Falcon stores in its rule repository. In production, rules like SCENARIO "Late Night Fraud" SEVERITY HIGH IF amount > 50000 AND channel = "UPI" are compiled and deployed to the evaluation cluster.' />
            <Row label="Alerts Queue (Tab 3)" value="Models the EFRM alert queue — the primary workspace for fraud analysts. In production this feeds into a case management system (e.g. Actimize, NICE) where alerts are assigned, investigated, and resolved. The Mark as FP action mirrors analyst dispositions." />
            <Row label="Rule Audit Trail" value="In production Falcon environments, all rule changes are immutably logged for RBI inspection and internal compliance review. Changes require dual authorisation above a risk threshold — this panel simulates that log." />
            <Row label="MIS Dashboard (Tab 4)" value="Mirrors the weekly/monthly performance packs prepared by the FCPG MIS team for presentation to senior management. Hit Rate, Precision, and False Positive Rate are the core KPIs reviewed in rule governance forums." />
            <Row label="Live Rule Test" value="Simulates EFRM's real-time single-transaction evaluation mode — used by analysts during rule authoring to validate logic before deploying to production monitoring. Prevents misconfigured rules from causing alert floods." />
            <Row label="CSV Export (RBI Format)" value="In production, alert data is exported in regulator-prescribed formats for submission to the Financial Intelligence Unit (FIU-IND) and RBI under PMLA obligations. This simulation approximates that export pipeline." />
          </div>

          {/* SRL analogy */}
          <div style={{ background: '#0F172A', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              SRL (Scenario Rule Language) — Falcon Analogy
            </div>
            <pre style={{ margin: 0, fontFamily: FONTS.mono, fontSize: 12, color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{`SCENARIO "Late Night High Value Transfer"
  SEVERITY CRITICAL

IF    amount > 50000
AND   channel = 'UPI'
AND   isNewPayee = true
AND   hour >= 1
AND   hour <= 4
THEN  FLAG

-- This rule fires on 4 transactions in the simulation dataset
-- All 4 are confirmed fraud (Precision = 100%)
-- Contrast with RULE-002 which has Precision ~43% → review recommended`}</pre>
          </div>

          {/* Tech stack */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Tech Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'React 18', detail: 'UI framework — hooks, functional components, lifted state' },
                { label: 'TypeScript (strict)', detail: 'Strict mode throughout — no any types, explicit return annotations' },
                { label: 'Pure SVG Charts', detail: 'Channel bars, hourly distribution, severity donut — no external chart libs' },
                { label: 'localStorage', detail: 'Rule persistence and onboarding state — simulates a config database' },
                { label: 'In-memory Engine', detail: 'evaluateRules() is a pure function — deterministic, testable, zero network calls' },
                { label: 'Inline styles', detail: 'All design tokens in constants/theme.ts — no CSS modules or Tailwind dependency' },
              ].map(t => (
                <div key={t.label} style={{
                  background: '#F8FAFC', border: `1px solid ${COLORS.border}`,
                  borderRadius: 4, padding: '8px 12px', maxWidth: 280,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>{t.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
