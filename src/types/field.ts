import { CHANNELS, MERCHANT_CATEGORIES } from '../constants/enums';
import { Operator, Rule, TransactionField } from './rule';

// ── Field metadata ────────────────────────────────────────────
export type FieldKind = 'numeric' | 'string' | 'boolean' | 'enum_channel' | 'enum_category' | 'enum_type';

export const FIELD_META: Record<TransactionField, { label: string; kind: FieldKind }> = {
  amount:             { label: 'Amount (₹)',          kind: 'numeric' },
  customerAge:        { label: 'Customer Age (days)',  kind: 'numeric' },
  hour:               { label: 'Hour (0–23)',          kind: 'numeric' },
  channel:            { label: 'Channel',              kind: 'enum_channel' },
  merchantCategory:   { label: 'Merchant Category',   kind: 'enum_category' },
  type:               { label: 'Txn Type',             kind: 'enum_type' },
  city:               { label: 'City',                 kind: 'string' },
  isNewPayee:         { label: 'Is New Payee',         kind: 'boolean' },
};

export const ALL_FIELDS = Object.keys(FIELD_META) as TransactionField[];

export function opsForKind(kind: FieldKind): Operator[] {
  switch (kind) {
    case 'numeric':                         return ['>', '<', '>=', '<=', '=', '!='];
    case 'boolean':                         return ['='];
    case 'string':                          return ['=', '!=', 'in', 'not in'];
    case 'enum_channel':
    case 'enum_category':
    case 'enum_type':                       return ['=', '!=', 'in', 'not in'];
  }
}

export function defaultValueForField(field: TransactionField, op: Operator): Rule['conditions'][0]['value'] {
  const { kind } = FIELD_META[field];
  if (op === 'in' || op === 'not in') return [];
  if (kind === 'numeric')              return 0;
  if (kind === 'boolean')              return true;
  if (kind === 'enum_channel')         return CHANNELS[0];
  if (kind === 'enum_category')        return MERCHANT_CATEGORIES[0];
  if (kind === 'enum_type')            return 'Debit';
  return '';
}