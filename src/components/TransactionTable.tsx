import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { FlagResult } from '../types/alert';
import { COLORS, FONTS, CHANNEL_COLORS, CATEGORY_COLORS, SEVERITY_COLORS } from '../constants/theme';
import { PAGE_SIZE } from '../constants/enums';
import { buildSRLPreview } from '../engine/srlPreview';
import { loadRules } from '../data/seedRules';

interface Props {
  transactions: Transaction[];
  flagResults?: FlagResult[];
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

const SEV_RANK: Record<string, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
const SEV_BORDER: Record<string, string> = {
  Critical: COLORS.danger,
  High:     '#EA580C',
  Medium:   COLORS.warning,
  Low:      COLORS.accent,
};

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

const TD_BASE: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 12,
  color: COLORS.text,
  borderBottom: `1px solid ${COLORS.border}`,
  verticalAlign: 'middle',
};

interface PBtnProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  active?: boolean;
}

const PBtn: React.FC<PBtnProps> = ({ label, onClick, disabled, active = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 28, height: 28, fontSize: 12,
    border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
    borderRadius: 4,
    background: active ? COLORS.accent : COLORS.surface,
    color: active ? '#fff' : disabled ? COLORS.muted : COLORS.text,
    fontWeight: active ? 700 : 400,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: FONTS.ui,
  }}>
    {label}
  </button>
);

// ── Slide-over Panel ──────────────────────────────────────────────────────────
interface SlideOverProps {
  tx: Transaction;
  alerts: FlagResult[];
  onClose: () => void;
}

const SlideOver: React.FC<SlideOverProps> = ({ tx, alerts, onClose }) => {
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

// ── Main Table ────────────────────────────────────────────────────────────────
export const TransactionTable: React.FC<Props> = ({ transactions, flagResults = [] }) => {
  const [page,      setPage]      = useState(1);
  const [slideOver, setSlideOver] = useState<Transaction | null>(null);

  useEffect(() => { setPage(1); }, [transactions]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = transactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Build txnId → alerts map
  const alertsByTxn = new Map<string, FlagResult[]>();
  for (const fr of flagResults) {
    if (!alertsByTxn.has(fr.transactionId)) alertsByTxn.set(fr.transactionId, []);
    alertsByTxn.get(fr.transactionId)!.push(fr);
  }

  // Page number window
  const pageNums: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    let s = Math.max(1, safePage - 2);
    let e = Math.min(totalPages, safePage + 2);
    if (safePage <= 3)                   { s = 1; e = 5; }
    else if (safePage >= totalPages - 2) { s = totalPages - 4; e = totalPages; }
    for (let i = s; i <= e; i++) pageNums.push(i);
  }

  return (
    <>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1080 }}>
            <thead>
              <tr>
                {['TXN ID', 'Timestamp', 'Amount', 'Channel', 'Type', 'Payee', 'New Payee', 'Category', 'City', 'Alerts'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((tx, i) => {
                const txAlerts  = alertsByTxn.get(tx.id) ?? [];
                const isFlagged = txAlerts.length > 0;
                // const topSev    = txAlerts.reduce<string | null>((best, a) =>
                //   best === null || (SEV_RANK[a.severity] ?? -1) > (SEV_RANK[best] ?? -1) ? a.severity : best
                // , null);

                const topSev = txAlerts.reduce<keyof typeof SEVERITY_COLORS | null>((best, a) =>
                  best === null || (SEV_RANK[a.severity] ?? -1) > (SEV_RANK[best] ?? -1)
                    ? a.severity as keyof typeof SEVERITY_COLORS
                    : best
                , null);

                const borderCol = topSev ? SEV_BORDER[topSev] : 'transparent';
                const rowBg     = tx.isFlaggedGT ? '#FFFBEB' : (i % 2 === 0 ? COLORS.surface : '#FAFAFA');
                const ch        = CHANNEL_COLORS[tx.channel]           ?? { bg: '#F3F4F6', text: '#374151' };
                const cat       = CATEGORY_COLORS[tx.merchantCategory] ?? { bg: '#F3F4F6', text: '#374151' };

                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSlideOver(tx)}
                    style={{ background: rowBg, borderLeft: `4px solid ${isFlagged ? borderCol : 'transparent'}`, cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#EFF6FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}
                  >
                    <td style={{ ...TD_BASE, width: 108 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {tx.isFlaggedGT && <span title="Ground-truth fraud" style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.danger, display: 'inline-block', flexShrink: 0 }} />}
                        <span style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.accent, fontWeight: 500 }}>{tx.id}</span>
                      </div>
                    </td>
                    <td style={{ ...TD_BASE, width: 150, fontSize: 11, color: COLORS.muted, whiteSpace: 'nowrap' }}>{formatTimestamp(tx.timestamp)}</td>
                    <td style={{ ...TD_BASE, width: 108, fontWeight: 700, color: tx.type === 'Debit' ? COLORS.danger : COLORS.success, fontFamily: FONTS.mono, fontSize: 11.5, whiteSpace: 'nowrap' }}>
                      {tx.type === 'Debit' ? '−' : '+'}{formatINR(tx.amount)}
                    </td>
                    <td style={{ ...TD_BASE, width: 130 }}>
                      <span style={{ background: ch.bg, color: ch.text, fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>{tx.channel}</span>
                    </td>
                    <td style={{ ...TD_BASE, width: 58 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: tx.type === 'Debit' ? COLORS.danger : COLORS.success }}>{tx.type}</span>
                    </td>
                    <td style={TD_BASE}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{tx.payeeName}</div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{tx.payeeId}</div>
                    </td>
                    <td style={{ ...TD_BASE, width: 82, textAlign: 'center' }}>
                      {tx.isNewPayee
                        ? <span style={{ background: '#FEF3C7', color: '#78350F', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 3 }}>NEW</span>
                        : <span style={{ background: '#F0FDF4', color: '#14532D', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 3 }}>KNOWN</span>
                      }
                    </td>
                    <td style={{ ...TD_BASE, width: 120 }}>
                      <span style={{ background: cat.bg, color: cat.text, fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>{tx.merchantCategory}</span>
                    </td>
                    <td style={{ ...TD_BASE, width: 85, color: COLORS.muted, fontSize: 11.5 }}>{tx.city}</td>
                    <td style={{ ...TD_BASE, width: 72, textAlign: 'center' }}>
                      {isFlagged && topSev ? (
                        <span style={{ background: SEVERITY_COLORS[topSev].bg, color: SEVERITY_COLORS[topSev].text, fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 3 }}>
                          {txAlerts.length}× {topSev[0]}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10.5, color: COLORS.border }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {slice.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '28px', textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>No transactions match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: `1px solid ${COLORS.border}`, background: '#F8FAFC' }}>
          <span style={{ fontSize: 11.5, color: COLORS.muted }}>
            Page <strong style={{ color: COLORS.text }}>{safePage}</strong> of{' '}
            <strong style={{ color: COLORS.text }}>{totalPages}</strong>
            {' · '}{transactions.length} records
            {flagResults.length > 0 && (
              <> · <span style={{ color: COLORS.danger, fontWeight: 600 }}>{alertsByTxn.size} flagged</span></>
            )}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            <PBtn label="«" onClick={() => setPage(1)}                               disabled={safePage === 1} />
            <PBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))}         disabled={safePage === 1} />
            {pageNums.map(p => <PBtn key={p} label={String(p)} onClick={() => setPage(p)} disabled={false} active={p === safePage} />)}
            <PBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
            <PBtn label="»" onClick={() => setPage(totalPages)}                       disabled={safePage === totalPages} />
          </div>
        </div>
      </div>

      {slideOver && (
        <SlideOver
          tx={slideOver}
          alerts={alertsByTxn.get(slideOver.id) ?? []}
          onClose={() => setSlideOver(null)}
        />
      )}
    </>
  );
};

