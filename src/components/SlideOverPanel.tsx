import { COLORS, FONTS, SEVERITY_COLORS } from "../constants/theme";
import { buildSRLPreview } from "../engine/srlPreview";
import React from 'react';
import { Transaction } from '../types/transaction';
import { FlagResult } from '../types/alert';
import { loadRules } from '../data/seedRules';

// ── Slide-over Panel ──────────────────────────────────────────────────────────
interface SlideOverProps {
  tx: Transaction;
  alerts: FlagResult[];
  onClose: () => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ` +
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} IST`
  );
}
export const SlideOverPanel: React.FC<SlideOverProps> = ({ tx, alerts, onClose }) => {
  const rules = loadRules();

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, color: COLORS.muted,
        minWidth: 120, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: 1, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: COLORS.text, flex: 1 }}>{value}</span>
    </div>
  );

  const hour = new Date(tx.timestamp).getHours();

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 480, background: COLORS.surface,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 50, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ background: COLORS.primary, color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {alerts.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, background: COLORS.danger, color: '#fff', padding: '1px 7px', borderRadius: 3, letterSpacing: '0.08em' }}>
                  {alerts.length} ALERT{alerts.length > 1 ? 'S' : ''}
                </span>
              )}
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 600 }}>{tx.id}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Transaction Detail — EFRM Inspector</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Transaction fields */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Transaction Details</div>
            <Field label="Amount"    value={<span style={{ fontFamily: FONTS.mono, fontWeight: 700, color: tx.type === 'Debit' ? COLORS.danger : COLORS.success }}>{tx.type === 'Debit' ? '−' : '+'}{formatINR(tx.amount)}</span>} />
            <Field label="Timestamp" value={formatTimestamp(tx.timestamp)} />
            <Field label="Hour (IST)" value={`${String(hour).padStart(2,'0')}:${String(new Date(tx.timestamp).getMinutes()).padStart(2,'0')}`} />
            <Field label="Channel"   value={tx.channel} />
            <Field label="Type"      value={tx.type} />
            <Field label="Payee"     value={<><div style={{ fontWeight: 500 }}>{tx.payeeName}</div><div style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: COLORS.muted }}>{tx.payeeId}</div></>} />
            <Field label="New Payee" value={
              tx.isNewPayee
                ? <span style={{ background: '#FEF3C7', color: '#78350F', fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 3 }}>YES — First transaction with this payee</span>
                : <span style={{ background: '#F0FDF4', color: '#14532D', fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 3 }}>Known Payee</span>
            } />
            <Field label="Category"  value={tx.merchantCategory} />
            <Field label="City"      value={tx.city} />
            <Field label="Acct Age"  value={`${tx.customerAge} days`} />
            <Field label="GT Label"  value={
              tx.isFlaggedGT
                ? <span style={{ color: COLORS.danger, fontWeight: 700 }}>⚠ Confirmed Fraud</span>
                : <span style={{ color: COLORS.success, fontWeight: 700 }}>✓ Legitimate</span>
            } />
          </div>

          {/* Triggered rules */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              {alerts.length > 0 ? `Triggered Rules (${alerts.length})` : 'Rule Matches'}
            </div>

            {alerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map(alert => {
                  const sc   = SEVERITY_COLORS[alert.severity];
                  const rule = rules.find(r => r.id === alert.ruleId);
                  const srl  = rule ? buildSRLPreview(rule) : '';
                  return (
                    <div key={alert.alertId} style={{ border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${sc.dot}`, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 3 }}>{alert.severity.toUpperCase()}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.text, flex: 1 }}>{alert.ruleName}</span>
                        <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>{alert.ruleId}</span>
                      </div>
                      {alert.scenario && (
                        <div style={{ padding: '0 12px 6px', fontSize: 11, color: COLORS.muted, fontStyle: 'italic' }}>Scenario: {alert.scenario}</div>
                      )}
                      {srl && (
                        <div style={{ background: '#0F172A', padding: '8px 12px' }}>
                          <pre style={{ margin: 0, fontFamily: FONTS.mono, fontSize: 10.5, color: '#94A3B8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {srl}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: '#F0FDF4', border: `1px solid #BBF7D0`, borderRadius: 5, padding: '12px 14px', fontSize: 12, color: '#14532D' }}>
                ✓ No active rules triggered for this transaction.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
