import React from 'react';
import { COLORS, FONTS } from '../constants/theme';
import { CHANNELS, MERCHANT_CATEGORIES, TXN_TYPES } from '../constants/enums';

export interface Filters {
  channel: string;
  category: string;
  type: string;
  payee: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  shown: number;
  total: number;
}

const selectStyle: React.CSSProperties = {
  height: 32,
  fontSize: 12,
  padding: '0 8px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 4,
  background: COLORS.surface,
  color: COLORS.text,
  fontFamily: FONTS.ui,
  cursor: 'pointer',
  outline: 'none',
  minWidth: 140,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  color: COLORS.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 3,
  display: 'block',
};

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, shown, total }) => (
  <div style={{
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    flexWrap: 'wrap',
  }}>
    <div>
      <span style={labelStyle}>Channel</span>
      <select style={selectStyle} value={filters.channel}
        onChange={e => onChange({ ...filters, channel: e.target.value })}>
        <option value="">All Channels</option>
        {CHANNELS.map(c => <option key={c}>{c}</option>)}
      </select>
    </div>

    <div>
      <span style={labelStyle}>Category</span>
      <select style={selectStyle} value={filters.category}
        onChange={e => onChange({ ...filters, category: e.target.value })}>
        <option value="">All Categories</option>
        {MERCHANT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
    </div>

    <div>
      <span style={labelStyle}>Type</span>
      <select style={{ ...selectStyle, minWidth: 110 }} value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}>
        <option value="">Debit &amp; Credit</option>
        {TXN_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
    </div>

    <div>
      <span style={labelStyle}>Payee Name</span>
      <input
        style={{ ...selectStyle, minWidth: 200 }}
        type="text"
        placeholder="Search payee…"
        value={filters.payee}
        onChange={e => onChange({ ...filters, payee: e.target.value })}
      />
    </div>

    <div style={{ marginLeft: 'auto', fontSize: 12, color: COLORS.muted, alignSelf: 'center', paddingBottom: 2 }}>
      Showing <strong style={{ color: COLORS.text }}>{shown}</strong> of{' '}
      <strong style={{ color: COLORS.text }}>{total}</strong> transactions
    </div>
  </div>
);
