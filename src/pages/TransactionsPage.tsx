import React, { useState, useMemo } from 'react';
import { FilterBar, Filters } from '../components/FilterBar';
import { TransactionTable } from '../components/TransactionTable';
import { TRANSACTIONS } from '../data/transactions';
import { COLORS, FONTS } from '../constants/theme';

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({ channel: '', category: '', type: '', payee: '' });

  const filtered = useMemo(() => TRANSACTIONS.filter(tx => {
    if (filters.channel  && tx.channel !== filters.channel)                                    return false;
    if (filters.category && tx.merchantCategory !== filters.category)                          return false;
    if (filters.type     && tx.type !== filters.type)                                          return false;
    if (filters.payee    && !tx.payeeName.toLowerCase().includes(filters.payee.toLowerCase())) return false;
    return true;
  }), [filters]);

  const stats = {
    fraud:       TRANSACTIONS.filter(t => t.isFlaggedGT).length,
    debits:      TRANSACTIONS.filter(t => t.type === 'Debit').length,
    totalVol:    TRANSACTIONS.reduce((s, t) => t.type === 'Debit' ? s + t.amount : s, 0),
    newPayee:    TRANSACTIONS.filter(t => t.isNewPayee).length,
    cryptoGame:  TRANSACTIONS.filter(t => t.merchantCategory === 'Crypto Exchange' || t.merchantCategory === 'Gaming').length,
  };

  const pills = [
    { label: 'Total Transactions', value: TRANSACTIONS.length, color: COLORS.accent },
    { label: 'GT-Flagged Fraud',   value: stats.fraud,         color: COLORS.danger },
    { label: 'New Payee Txns',     value: stats.newPayee,      color: COLORS.warning },
    { label: 'Crypto / Gaming',    value: stats.cryptoGame,    color: '#7C3AED' },
  ];

  return (
    <div style={{ fontFamily: FONTS.ui, background: COLORS.background, minHeight: '100vh' }}>

      {/* ── Status Bar ── */}
      <div style={{
        background: COLORS.primary, color: '#fff',
        padding: '9px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, background: '#DC2626', color: '#fff',
            padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em',
          }}>
            LIVE SIM
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
            FCPG Transaction Monitoring — EFRM Simulation Mode
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>|</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Monitoring {TRANSACTIONS.length} transactions across 6 channels
          </span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 11, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
          <span>GT Fraud: <strong style={{ color: '#FCA5A5' }}>{stats.fraud}</strong></span>
          <span>Debits: <strong style={{ color: '#93C5FD' }}>{stats.debits}</strong></span>
          <span>Debit Vol: <strong style={{ color: '#6EE7B7', fontFamily: FONTS.mono }}>{formatINR(stats.totalVol)}</strong></span>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 18px' }}>

        {/* Summary pills + legend */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {pills.map(s => (
            <div key={s.label} style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: 5,
              padding: '8px 14px',
            }}>
              <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: FONTS.mono, lineHeight: 1.15 }}>
                {s.value}
              </div>
            </div>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: COLORS.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.danger, display: 'inline-block' }} />
              GT fraud row
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ background: '#FFFBEB', border: `1px solid #FEF3C7`, display: 'inline-block', width: 16, height: 11, borderRadius: 2 }} />
              Amber row = GT-flagged
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ marginBottom: 10 }}>
          <FilterBar filters={filters} onChange={setFilters} shown={filtered.length} total={TRANSACTIONS.length} />
        </div>

        {/* Ledger table */}
        <TransactionTable transactions={filtered} />

        {/* Footer */}
        <div style={{ marginTop: 10, fontSize: 11, color: COLORS.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span>Fraud Rule Engine Simulator — Phase 1: Transaction Ledger · Falcon/EFRM Simulation</span>
          <span style={{ fontFamily: FONTS.mono }}>Dataset: TXN-001 → TXN-050 · January 2025 · INR</span>
        </div>
      </div>
    </div>
  );
};
