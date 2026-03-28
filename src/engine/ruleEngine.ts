import { Transaction } from '../types/transaction';
import { Rule, RuleCondition } from '../types/rule';
import { FlagResult } from '../types/alert';

// ── Audit Log ─────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'TOGGLE_ACTIVE'
  | 'TOGGLE_INACTIVE';

export interface AuditEntry {
  id: string;
  timestamp: string;       // ISO 8601
  action: AuditAction;
  ruleId: string;
  ruleName: string;
  analyst: string;         // hardcoded "Analyst" in simulation
  detail: string;          // human-readable change description
}

/** Module-level session audit log — cleared on page refresh (by design). */
const _auditLog: AuditEntry[] = [];
let _auditSeq = 1;

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'analyst'>): void {
  _auditLog.unshift({
    ...entry,
    id:        `AUDIT-${String(_auditSeq++).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    analyst:   'Analyst (Simulation)',
  });
}

export function getRuleAuditLog(): AuditEntry[] {
  return [..._auditLog];
}

// ── Rule Evaluation Engine ────────────────────────────────────────────────────

/**
 * evaluateRules — mirrors SRL scenario evaluation in Falcon/EFRM.
 *
 * In Falcon, each active Scenario Rule is independently executed against
 * every transaction in the monitoring window. Conditions are evaluated
 * left-to-right using the logicalJoin (AND/OR) attached to each condition,
 * which links it to the next condition in the chain. A match produces one
 * Alert record per rule per transaction.
 *
 * This function replicates that behaviour in-memory:
 *   - Only active rules are evaluated.
 *   - The `hour` virtual field is derived at runtime from the transaction timestamp.
 *   - One FlagResult is emitted per (transaction × rule) match.
 *   - isFalsePositive is set automatically based on ground-truth labels.
 *
 * @param transactions  - Full set of transactions to evaluate
 * @param rules         - Analyst-authored rules (seed + custom)
 * @returns             - Sorted array of FlagResult (Critical first)
 */
export function evaluateRules(
  transactions: Transaction[],
  rules: Rule[],
): FlagResult[] {
  const activeRules = rules.filter(r => r.isActive);
  const results: FlagResult[] = [];
  let alertSeq = 1;

  for (const tx of transactions) {
    const txHour = new Date(tx.timestamp).getHours();

    for (const rule of activeRules) {
      if (ruleMatches(tx, txHour, rule)) {
        results.push({
          alertId:           `ALERT-${String(alertSeq++).padStart(3, '0')}`,
          transactionId:     tx.id,
          ruleId:            rule.id,
          ruleName:          rule.name,
          severity:          rule.severity,
          scenario:          rule.scenario,
          isFalsePositive:   !tx.isFlaggedGT,
          markedFPByAnalyst: false,
          timestamp:         new Date().toISOString(),
        });
      }
    }
  }

  const SEV_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  results.sort((a, b) => {
    const sd = (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4);
    if (sd !== 0) return sd;
    return a.transactionId.localeCompare(b.transactionId);
  });

  return results;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function ruleMatches(tx: Transaction, txHour: number, rule: Rule): boolean {
  const { conditions } = rule;
  if (conditions.length === 0) return false;

  let result = evalCondition(tx, txHour, conditions[0]);
  for (let i = 1; i < conditions.length; i++) {
    const join = conditions[i - 1].logicalJoin;
    const next = evalCondition(tx, txHour, conditions[i]);
    result = join === 'AND' ? result && next : result || next;
  }
  return result;
}

function evalCondition(tx: Transaction, txHour: number, cond: RuleCondition): boolean {
  const { field, operator, value } = cond;
  const txValue: unknown = field === 'hour' ? txHour : tx[field as keyof Transaction];

  if (operator === 'in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.some(v => String(txValue) === String(v));
  }
  if (operator === 'not in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.every(v => String(txValue) !== String(v));
  }
  if (typeof txValue === 'boolean') {
    const target = value === true || value === 'true';
    if (operator === '=')  return txValue === target;
    if (operator === '!=') return txValue !== target;
    return false;
  }
  if (typeof txValue === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    switch (operator) {
      case '>':  return txValue >  num;
      case '<':  return txValue <  num;
      case '>=': return txValue >= num;
      case '<=': return txValue <= num;
      case '=':  return txValue === num;
      case '!=': return txValue !== num;
    }
  }
  const txStr  = String(txValue);
  const valStr = String(value);
  if (operator === '=')  return txStr === valStr;
  if (operator === '!=') return txStr !== valStr;
  return false;
}

// ── Live Rule Test helper ─────────────────────────────────────────────────────

export interface ConditionResult {
  field: string;
  operator: string;
  ruleValue: string;
  txValue:   string;
  passed:    boolean;
}

export interface RuleTestResult {
  rule:       Rule;
  fired:      boolean;
  conditions: ConditionResult[];
}

/**
 * testSingleTransaction — evaluates one manually-constructed transaction
 * against all active rules, returning per-condition pass/fail details.
 * Used by the Live Rule Test panel to simulate real-time EFRM evaluation.
 */
export function testSingleTransaction(
  tx: Transaction,
  rules: Rule[],
): RuleTestResult[] {
  const txHour = new Date(tx.timestamp).getHours();
  const activeRules = rules.filter(r => r.isActive);

  return activeRules.map(rule => {
    const condResults: ConditionResult[] = rule.conditions.map(cond => {
      const rawTxVal: unknown = cond.field === 'hour'
        ? txHour
        : tx[cond.field as keyof Transaction];

      const passed = evalConditionBool(rawTxVal, cond.operator, cond.value);

      const ruleVal = Array.isArray(cond.value)
        ? `[${(cond.value as string[]).join(', ')}]`
        : String(cond.value);

      return {
        field:     cond.field,
        operator:  cond.operator,
        ruleValue: ruleVal,
        txValue:   String(rawTxVal),
        passed,
      };
    });

    const fired = ruleMatches(tx, txHour, rule);

    return { rule, fired, conditions: condResults };
  });
}

function evalConditionBool(
  txValue: unknown,
  operator: string,
  value:   Rule['conditions'][0]['value'],
): boolean {
  if (operator === 'in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.some(v => String(txValue) === String(v));
  }
  if (operator === 'not in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.every(v => String(txValue) !== String(v));
  }
  if (typeof txValue === 'boolean') {
    const target = value === true || value === 'true';
    if (operator === '=')  return txValue === target;
    if (operator === '!=') return txValue !== target;
    return false;
  }
  if (typeof txValue === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    if (operator === '>')  return txValue >  num;
    if (operator === '<')  return txValue <  num;
    if (operator === '>=') return txValue >= num;
    if (operator === '<=') return txValue <= num;
    if (operator === '=')  return txValue === num;
    if (operator === '!=') return txValue !== num;
  }
  const txStr  = String(txValue);
  const valStr = String(value);
  if (operator === '=')  return txStr === valStr;
  if (operator === '!=') return txStr !== valStr;
  return false;
}








// import { Transaction } from '../types/transaction';
// import { Rule, RuleCondition } from '../types/rule';
// import { FlagResult } from '../types/alert';

// // ── Audit Log ─────────────────────────────────────────────────────────────────

// export type AuditAction =
//   | 'CREATE'
//   | 'UPDATE'
//   | 'DELETE'
//   | 'TOGGLE_ACTIVE'
//   | 'TOGGLE_INACTIVE';

// export interface AuditEntry {
//   id: string;
//   timestamp: string;       // ISO 8601
//   action: AuditAction;
//   ruleId: string;
//   ruleName: string;
//   analyst: string;         // hardcoded "Analyst" in simulation
//   detail: string;          // human-readable change description
// }

// /** Module-level session audit log — cleared on page refresh (by design). */
// const _auditLog: AuditEntry[] = [];
// let _auditSeq = 1;

// export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'analyst'>): void {
//   _auditLog.unshift({
//     ...entry,
//     id:        `AUDIT-${String(_auditSeq++).padStart(3, '0')}`,
//     timestamp: new Date().toISOString(),
//     analyst:   'Analyst (Simulation)',
//   });
// }

// export function getRuleAuditLog(): AuditEntry[] {
//   return [..._auditLog];
// }

// // ── Rule Evaluation Engine ────────────────────────────────────────────────────

// /**
//  * evaluateRules — mirrors SRL scenario evaluation in Falcon/EFRM.
//  *
//  * In Falcon, each active Scenario Rule is independently executed against
//  * every transaction in the monitoring window. Conditions are evaluated
//  * left-to-right using the logicalJoin (AND/OR) attached to each condition,
//  * which links it to the next condition in the chain. A match produces one
//  * Alert record per rule per transaction.
//  *
//  * This function replicates that behaviour in-memory:
//  *   - Only active rules are evaluated.
//  *   - The `hour` virtual field is derived at runtime from the transaction timestamp.
//  *   - One FlagResult is emitted per (transaction × rule) match.
//  *   - isFalsePositive is set automatically based on ground-truth labels.
//  *
//  * @param transactions  - Full set of transactions to evaluate
//  * @param rules         - Analyst-authored rules (seed + custom)
//  * @returns             - Sorted array of FlagResult (Critical first)
//  */
// export function evaluateRules(
//   transactions: Transaction[],
//   rules: Rule[],
// ): FlagResult[] {
//   const activeRules = rules.filter(r => r.isActive);
//   const results: FlagResult[] = [];
//   let alertSeq = 1;

//   for (const tx of transactions) {
//     const txHour = new Date(tx.timestamp).getHours();

//     for (const rule of activeRules) {
//       if (ruleMatches(tx, txHour, rule)) {
//         results.push({
//           alertId:           `ALERT-${String(alertSeq++).padStart(3, '0')}`,
//           transactionId:     tx.id,
//           ruleId:            rule.id,
//           ruleName:          rule.name,
//           severity:          rule.severity,
//           scenario:          rule.scenario,
//           isFalsePositive:   !tx.isFlaggedGT,
//           markedFPByAnalyst: false,
//           timestamp:         new Date().toISOString(),
//         });
//       }
//     }
//   }

//   const SEV_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
//   results.sort((a, b) => {
//     const sd = (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4);
//     if (sd !== 0) return sd;
//     return a.transactionId.localeCompare(b.transactionId);
//   });

//   return results;
// }

// // ── Internal helpers ──────────────────────────────────────────────────────────

// function ruleMatches(tx: Transaction, txHour: number, rule: Rule): boolean {
//   const { conditions } = rule;
//   if (conditions.length === 0) return false;

//   let result = evalCondition(tx, txHour, conditions[0]);
//   for (let i = 1; i < conditions.length; i++) {
//     const join = conditions[i - 1].logicalJoin;
//     const next = evalCondition(tx, txHour, conditions[i]);
//     result = join === 'AND' ? result && next : result || next;
//   }
//   return result;
// }

// function evalCondition(tx: Transaction, txHour: number, cond: RuleCondition): boolean {
//   const { field, operator, value } = cond;
//   const txValue: unknown = field === 'hour' ? txHour : tx[field as keyof Transaction];

//   if (operator === 'in') {
//     const arr = Array.isArray(value) ? value : [String(value)];
//     return arr.some(v => String(txValue) === String(v));
//   }
//   if (operator === 'not in') {
//     const arr = Array.isArray(value) ? value : [String(value)];
//     return arr.every(v => String(txValue) !== String(v));
//   }
//   if (typeof txValue === 'boolean') {
//     const target = value === true || value === 'true';
//     if (operator === '=')  return txValue === target;
//     if (operator === '!=') return txValue !== target;
//     return false;
//   }
//   if (typeof txValue === 'number') {
//     const num = typeof value === 'number' ? value : Number(value);
//     switch (operator) {
//       case '>':  return txValue >  num;
//       case '<':  return txValue <  num;
//       case '>=': return txValue >= num;
//       case '<=': return txValue <= num;
//       case '=':  return txValue === num;
//       case '!=': return txValue !== num;
//     }
//   }
//   const txStr  = String(txValue);
//   const valStr = String(value);
//   if (operator === '=')  return txStr === valStr;
//   if (operator === '!=') return txStr !== valStr;
//   return false;
// }






