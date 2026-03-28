import React, { useState } from 'react';
import { Transaction, Channel, MerchantCategory } from '../types/transaction';
import { RuleTestResult, testSingleTransaction } from '../engine/ruleEngine';
import { loadRules } from '../data/seedRules';
import { COLORS, FONTS, SEVERITY_COLORS } from '../constants/theme';
import { CHANNELS, MERCHANT_CATEGORIES } from '../constants/enums';

// ── Default test transaction ──────────────────────────────────────────────────
function defaultTestTx(): Partial<Transaction> & { timestamp: string } {
  return {
    id:               'TEST-001',
    timestamp:        new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    amount:           75000,
    channel:          'UPI',
    type:             'Debit',
    payeeName:        'Test Payee',
    payeeId:          'testpayee@upi',
    isNewPayee:       true,
    merchantCategory: 'P2P',
    customerAge:      365,
    city:             'Mumbai',
    isFlaggedGT:      false,
  };
}

// ── Shared input style ────────────────────────────────────────────────────────
const IB: React.CSSProperties = {
  height: 32, fontSize: 12, padding: '0 8px',
  border: `1px solid ${COLORS.border}`, borderRadius: 4,
  background: COLORS.surface, color: COLORS.text,
  fontFamily: FONTS.ui, outline: 'none', width: '100%',
};

const SL: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, color: COLORS.muted,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 4, display: 'block',
};

// ── Component ─────────────────────────────────────────────────────────────────
export const LiveRuleTest: React.FC = () => {
  const [form, setForm] = useState<Partial<Transaction> & { timestamp: string }>(defaultTestTx());
  const [results, setResults] = useState<RuleTestResult[] | null>(null);
  const [ran, setRan] = useState(false);

  const set = (patch: Partial<typeof form>): void =>
    setForm(prev => ({ ...prev, ...patch }));

  const runTest = (): void => {
    const tx: Transaction = {
      id:               'TEST-001',
      timestamp:        new Date(form.timestamp).toISOString(),
      amount:           Number(form.amount ?? 0),
      channel:          (form.channel ?? 'UPI') as Channel,
      type:             (form.type ?? 'Debit') as 'Debit' | 'Credit',
      payeeName:        form.payeeName ?? '',
      payeeId:          form.payeeId ?? '',
      isNewPayee:       form.isNewPayee ?? false,
      merchantCategory: (form.merchantCategory ?? 'P2P') as MerchantCategory,
      customerAge:      Number(form.customerAge ?? 0),
      city:             form.city ?? '',
      isFlaggedGT:      false,
    };
    const rules   = loadRules();
    const outcome = testSingleTransaction(tx, rules);
    setResults(outcome);
    setRan(true);
  };

  const firedCount = results?.filter(r => r.fired).length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Form ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <span style={SL}>Amount (₹)</span>
          <input
            type="number"
            style={IB}
            value={form.amount ?? ''}
            onChange={e => set({ amount: e.target.value === '' ? 0 : Number(e.target.value) })}
          />
        </div>
        <div>
          <span style={SL}>Channel</span>
          <select style={IB} value={form.channel ?? 'UPI'} onChange={e => set({ channel: e.target.value as Channel })}>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={SL}>Payee Name</span>
          <input
            type="text"
            style={IB}
            placeholder="e.g. Rahul Sharma"
            value={form.payeeName ?? ''}
            onChange={e => set({ payeeName: e.target.value })}
          />
        </div>
        <div>
          <span style={SL}>Merchant Category</span>
          <select
            style={IB}
            value={form.merchantCategory ?? 'P2P'}
            onChange={e => set({ merchantCategory: e.target.value as MerchantCategory })}
          >
            {MERCHANT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={SL}>Txn Type</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Debit', 'Credit'] as const).map(tp => (
              <button key={tp} onClick={() => set({ type: tp })} style={{
                flex: 1, height: 32, fontSize: 12, borderRadius: 4, cursor: 'pointer',
                border: `1px solid ${form.type === tp ? COLORS.accent : COLORS.border}`,
                background: form.type === tp ? COLORS.accent : COLORS.surface,
                color: form.type === tp ? '#fff' : COLORS.muted,
                fontWeight: form.type === tp ? 600 : 400, fontFamily: FONTS.ui,
              }}>{tp}</button>
            ))}
          </div>
        </div>
        <div>
          <span style={SL}>Timestamp</span>
          <input
            type="datetime-local"
            style={IB}
            value={form.timestamp.slice(0, 16)}
            onChange={e => set({ timestamp: e.target.value })}
          />
        </div>
        <div>
          <span style={SL}>Is New Payee</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {([true, false] as const).map(opt => (
              <button key={String(opt)} onClick={() => set({ isNewPayee: opt })} style={{
                flex: 1, height: 32, fontSize: 12, borderRadius: 4, cursor: 'pointer',
                border: `1px solid ${form.isNewPayee === opt ? COLORS.accent : COLORS.border}`,
                background: form.isNewPayee === opt ? COLORS.accent : COLORS.surface,
                color: form.isNewPayee === opt ? '#fff' : COLORS.muted,
                fontWeight: form.isNewPayee === opt ? 600 : 400, fontFamily: FONTS.ui,
              }}>
                {opt ? 'New Payee' : 'Known Payee'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span style={SL}>City</span>
          <input
            type="text"
            style={IB}
            placeholder="e.g. Mumbai"
            value={form.city ?? ''}
            onChange={e => set({ city: e.target.value })}
          />
        </div>
      </div>

      {/* ── Run button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={runTest}
          style={{
            padding: '8px 22px', fontSize: 13, fontWeight: 700, borderRadius: 5,
            border: 'none', background: COLORS.accent, color: '#fff',
            cursor: 'pointer', fontFamily: FONTS.ui,
          }}
        >
          ▶ Test Against All Active Rules
        </button>
        {ran && (
          <span style={{ fontSize: 12, color: firedCount > 0 ? COLORS.danger : COLORS.success, fontWeight: 600 }}>
            {firedCount > 0
              ? `⚠ ${firedCount} rule${firedCount > 1 ? 's' : ''} fired`
              : '✓ No rules triggered'}
          </span>
        )}
      </div>

      {/* ── Results ── */}
      {results && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map(({ rule, fired, conditions }) => {
            const sc = SEVERITY_COLORS[rule.severity];
            return (
              <div key={rule.id} style={{
                border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${fired ? sc.dot : COLORS.border}`,
                borderRadius: 5, overflow: 'hidden',
                opacity: fired ? 1 : 0.65,
              }}>
                {/* Rule header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  background: fired ? '#FFFBEB' : COLORS.surface,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 3,
                    background: fired ? COLORS.danger : '#F3F4F6',
                    color: fired ? '#fff' : COLORS.muted,
                  }}>
                    {fired ? '⚡ FIRED' : '— CLEAR'}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.text }}>{rule.name}</span>
                  <span style={{ background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 3 }}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginLeft: 'auto' }}>{rule.id}</span>
                </div>

                {/* Condition evaluation rows */}
                <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  {conditions.map((cr, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 12px',
                      background: idx % 2 === 0 ? COLORS.surface : '#FAFAFA',
                      borderBottom: idx < conditions.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    }}>
                      {/* Pass/fail indicator */}
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: cr.passed ? COLORS.success : COLORS.danger,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 800,
                      }}>
                        {cr.passed ? '✓' : '✕'}
                      </span>
                      {/* Condition expression */}
                      <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
                        <span style={{ color: COLORS.text, fontWeight: 600 }}>{cr.field}</span>
                        {' '}{cr.operator}{' '}
                        <span style={{ color: COLORS.accent }}>{cr.ruleValue}</span>
                      </span>
                      {/* Arrow + actual value */}
                      <span style={{ fontSize: 10, color: COLORS.muted, marginLeft: 4 }}>→</span>
                      <span style={{
                        fontFamily: FONTS.mono, fontSize: 11, fontWeight: 600,
                        color: cr.passed ? COLORS.success : COLORS.danger,
                        background: cr.passed ? '#F0FDF4' : '#FEF2F2',
                        padding: '1px 6px', borderRadius: 3,
                      }}>
                        {cr.txValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results && results.length === 0 && (
        <div style={{ background: '#FEF3C7', border: `1px solid #FDE68A`, borderRadius: 5, padding: '10px 14px', fontSize: 12, color: '#78350F' }}>
          ⚠ No active rules in the library. Save at least one active rule first.
        </div>
      )}
    </div>
  );
};
