import { Rule } from '../types/rule';

export const STORAGE_KEY = 'fcpg_rules_v1';

export const SEED_RULES: Rule[] = [
  {
    id: 'RULE-001',
    name: 'Late Night High Value UPI',
    description: 'Flags high-value UPI transfers to new payees during overnight hours — a common account-takeover indicator.',
    scenario: 'Late Night Fraud',
    severity: 'Critical',
    isActive: true,
    createdAt: '2025-01-01T09:00:00',
    conditions: [
      { id: 'c1', field: 'amount',     operator: '>',  value: 50000,  logicalJoin: 'AND' },
      { id: 'c2', field: 'channel',    operator: '=',  value: 'UPI',  logicalJoin: 'AND' },
      { id: 'c3', field: 'isNewPayee', operator: '=',  value: true,   logicalJoin: 'AND' },
      { id: 'c4', field: 'hour',       operator: '>=', value: 1,      logicalJoin: 'AND' },
      { id: 'c5', field: 'hour',       operator: '<=', value: 4,      logicalJoin: 'AND' },
    ],
  },
  {
    id: 'RULE-002',
    name: 'Rapid Small IMPS Debits',
    description: 'Catches sub-₹500 IMPS debit bursts — a card-testing / velocity-abuse pattern. Intentionally broad; expect false positives.',
    scenario: 'Velocity Abuse',
    severity: 'Medium',
    isActive: true,
    createdAt: '2025-01-01T09:05:00',
    conditions: [
      { id: 'c1', field: 'amount',  operator: '<', value: 500,    logicalJoin: 'AND' },
      { id: 'c2', field: 'channel', operator: '=', value: 'IMPS', logicalJoin: 'AND' },
      { id: 'c3', field: 'type',    operator: '=', value: 'Debit', logicalJoin: 'AND' },
    ],
  },
  {
    id: 'RULE-003',
    name: 'High-Risk Merchant Category',
    description: 'Flags any debit to Crypto Exchange or Gaming merchants — categories associated with mule network cash-out activity.',
    scenario: 'Suspicious Merchant',
    severity: 'High',
    isActive: true,
    createdAt: '2025-01-01T09:10:00',
    conditions: [
      { id: 'c1', field: 'merchantCategory', operator: 'in', value: ['Crypto Exchange', 'Gaming'], logicalJoin: 'AND' },
    ],
  },
];

/** Load rules from localStorage, or seed defaults on first run */
export function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Rule[];
  } catch {
    // corrupted — fall through to seed
  }
  saveRules(SEED_RULES);
  return SEED_RULES;
}

export function saveRules(rules: Rule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}
