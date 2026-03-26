import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { COLORS, FONTS, CHANNEL_COLORS, CATEGORY_COLORS } from '../constants/theme';
import { PAGE_SIZE } from '../constants/enums';

interface Props {
  transactions: Transaction[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ` +
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} IST`
  );
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

const TD: React.CSSProperties = {
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
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 28, height: 28, fontSize: 12,
      border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
      borderRadius: 4,
      background: active ? COLORS.accent : COLORS.surface,
      color: active ? '#fff' : disabled ? COLORS.muted : COLORS.text,
      fontWeight: active ? 700 : 400,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: FONTS.ui,
    }}
  >
    {label}
  </button>
);

export const TransactionTable: React.FC<Props> = ({ transactions }) => {
  const [page, setPage] = useState(1);

  // Reset to page 1 when filtered list changes
  useEffect(() => { setPage(1); }, [transactions]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = transactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Build visible page number window (max 5 shown)
  const pageNums: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    let s = Math.max(1, safePage - 2);
    let e = Math.min(totalPages, safePage + 2);
    if (safePage <= 3)                    { s = 1; e = 5; }
    else if (safePage >= totalPages - 2)  { s = totalPages - 4; e = totalPages; }
    for (let i = s; i <= e; i++) pageNums.push(i);
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1020 }}>
          <thead>
            <tr>
              {['TXN ID', 'Timestamp', 'Amount', 'Channel', 'Type', 'Payee', 'New Payee', 'Category', 'City'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((tx, i) => {
              const rowBg = tx.isFlaggedGT ? '#FFFBEB' : (i % 2 === 0 ? COLORS.surface : '#FAFAFA');
              const ch    = CHANNEL_COLORS[tx.channel]           ?? { bg: '#F3F4F6', text: '#374151' };
              const cat   = CATEGORY_COLORS[tx.merchantCategory] ?? { bg: '#F3F4F6', text: '#374151' };
              return (
                <tr key={tx.id} style={{ background: rowBg }}>
                  {/* TXN ID */}
                  <td style={{ ...TD, width: 108 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {tx.isFlaggedGT && (
                        <span
                          title="Ground-truth fraud"
                          style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.danger, display: 'inline-block', flexShrink: 0 }}
                        />
                      )}
                      <span style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.accent, fontWeight: 500 }}>
                        {tx.id}
                      </span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td style={{ ...TD, width: 150, fontSize: 11, color: COLORS.muted, whiteSpace: 'nowrap' }}>
                    {formatTimestamp(tx.timestamp)}
                  </td>

                  {/* Amount */}
                  <td style={{
                    ...TD, width: 108, fontWeight: 700,
                    color: tx.type === 'Debit' ? COLORS.danger : COLORS.success,
                    fontFamily: FONTS.mono, fontSize: 11.5, whiteSpace: 'nowrap',
                  }}>
                    {tx.type === 'Debit' ? '−' : '+'}{formatINR(tx.amount)}
                  </td>

                  {/* Channel */}
                  <td style={{ ...TD, width: 130 }}>
                    <span style={{ background: ch.bg, color: ch.text, fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                      {tx.channel}
                    </span>
                  </td>

                  {/* Type */}
                  <td style={{ ...TD, width: 58 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tx.type === 'Debit' ? COLORS.danger : COLORS.success }}>
                      {tx.type}
                    </span>
                  </td>

                  {/* Payee */}
                  <td style={TD}>
                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                      {tx.payeeName}
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                      {tx.payeeId}
                    </div>
                  </td>

                  {/* New Payee */}
                  <td style={{ ...TD, width: 82, textAlign: 'center' }}>
                    {tx.isNewPayee
                      ? <span style={{ background: '#FEF3C7', color: '#78350F', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 3 }}>NEW</span>
                      : <span style={{ background: '#F0FDF4', color: '#14532D', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 3 }}>KNOWN</span>
                    }
                  </td>

                  {/* Category */}
                  <td style={{ ...TD, width: 120 }}>
                    <span style={{ background: cat.bg, color: cat.text, fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                      {tx.merchantCategory}
                    </span>
                  </td>

                  {/* City */}
                  <td style={{ ...TD, width: 85, color: COLORS.muted, fontSize: 11.5 }}>{tx.city}</td>
                </tr>
              );
            })}

            {slice.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                  No transactions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderTop: `1px solid ${COLORS.border}`, background: '#F8FAFC',
      }}>
        <span style={{ fontSize: 11.5, color: COLORS.muted }}>
          Page <strong style={{ color: COLORS.text }}>{safePage}</strong> of{' '}
          <strong style={{ color: COLORS.text }}>{totalPages}</strong>
          {' · '}{transactions.length} records
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          <PBtn label="«" onClick={() => setPage(1)}                               disabled={safePage === 1} />
          <PBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))}         disabled={safePage === 1} />
          {pageNums.map(p => (
            <PBtn key={p} label={String(p)} onClick={() => setPage(p)} disabled={false} active={p === safePage} />
          ))}
          <PBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
          <PBtn label="»" onClick={() => setPage(totalPages)}                       disabled={safePage === totalPages} />
        </div>
      </div>
    </div>
  );
};
