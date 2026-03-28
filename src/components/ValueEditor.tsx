import React from 'react';
import { RuleCondition, TransactionField, Operator } from '../types/rule';
import { CHANNELS, MERCHANT_CATEGORIES } from '../constants/enums';
import { COLORS, FONTS } from "../constants/theme";
import { FIELD_META } from '../types/field';


const inputBase: React.CSSProperties = {
  height: 32, fontSize: 12, padding: '0 8px',
  border: `1px solid ${COLORS.border}`, borderRadius: 4,
  background: COLORS.surface, color: COLORS.text,
  fontFamily: FONTS.ui, outline: 'none',
};


interface ChipSelectProps {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}

const ChipSelect: React.FC<ChipSelectProps> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 0' }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            fontSize: 11, padding: '2px 9px', borderRadius: 12,
            border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
            background: active ? COLORS.accent : COLORS.surface,
            color: active ? '#fff' : COLORS.muted,
            cursor: 'pointer', fontFamily: FONTS.ui, fontWeight: active ? 600 : 400,
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};



// ── Value editor — context-aware ─────────────────────────────
interface ValueEditorProps {
  field: TransactionField;
  operator: Operator;
  value: RuleCondition['value'];
  onChange: (v: RuleCondition['value']) => void;
}

export const ValueEditor: React.FC<ValueEditorProps> = ({ field, operator, value, onChange }) => {
  const { kind } = FIELD_META[field];

  if (operator === 'in' || operator === 'not in') {
    let options: string[] = [];
    if (kind === 'enum_channel')   options = [...CHANNELS];
    else if (kind === 'enum_category') options = [...MERCHANT_CATEGORIES];
    else if (kind === 'enum_type') options = ['Debit', 'Credit'];
    else options = [];
    return (
      <ChipSelect
        options={options}
        selected={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
      />
    );
  }

  if (kind === 'boolean') {
    const bv = value === true || value === 'true';
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {([true, false] as const).map(opt => (
          <button key={String(opt)} onClick={() => onChange(opt)} style={{
            ...inputBase, width: 56, cursor: 'pointer', textAlign: 'center',
            background: bv === opt ? COLORS.accent : COLORS.surface,
            color: bv === opt ? '#fff' : COLORS.muted,
            border: `1px solid ${bv === opt ? COLORS.accent : COLORS.border}`,
            fontWeight: bv === opt ? 600 : 400,
          }}>
            {opt ? 'true' : 'false'}
          </button>
        ))}
      </div>
    );
  }

  if (kind === 'enum_channel') {
    return (
      <select style={{ ...inputBase, minWidth: 130, cursor: 'pointer' }} value={String(value)}
        onChange={e => onChange(e.target.value)}>
        {CHANNELS.map(c => <option key={c}>{c}</option>)}
      </select>
    );
  }

  if (kind === 'enum_category') {
    return (
      <select style={{ ...inputBase, minWidth: 150, cursor: 'pointer' }} value={String(value)}
        onChange={e => onChange(e.target.value)}>
        {MERCHANT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
    );
  }

  if (kind === 'enum_type') {
    return (
      <select style={{ ...inputBase, minWidth: 100, cursor: 'pointer' }} value={String(value)}
        onChange={e => onChange(e.target.value)}>
        <option>Debit</option>
        <option>Credit</option>
      </select>
    );
  }

  if (kind === 'numeric') {
    return (
      <input type="number" style={{ ...inputBase, width: 100, textAlign: 'right' }}
        value={Number(value)}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    );
  }

  // string
  return (
    <input type="text" style={{ ...inputBase, minWidth: 140 }}
      value={String(value)}
      placeholder="value…"
      onChange={e => onChange(e.target.value)}
    />
  );
};
