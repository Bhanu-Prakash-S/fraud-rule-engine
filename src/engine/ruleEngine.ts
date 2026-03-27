import { Transaction } from '../types/transaction';
import { Rule, RuleCondition } from '../types/rule';
import { FlagResult } from '../types/alert';

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
    // Derive virtual `hour` field (0–23) from timestamp
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

  // Sort: Critical → High → Medium → Low, then by transactionId
  const SEV_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  results.sort((a, b) => {
    const sd = (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4);
    if (sd !== 0) return sd;
    return a.transactionId.localeCompare(b.transactionId);
  });

  return results;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Evaluate all conditions of a rule against a single transaction.
 * Conditions are chained left-to-right using each condition's logicalJoin
 * (which joins it to the NEXT condition).
 */
function ruleMatches(tx: Transaction, txHour: number, rule: Rule): boolean {
  const { conditions } = rule;
  if (conditions.length === 0) return false;

  let result = evalCondition(tx, txHour, conditions[0]);

  for (let i = 1; i < conditions.length; i++) {
    const join  = conditions[i - 1].logicalJoin; // join between [i-1] and [i]
    const next  = evalCondition(tx, txHour, conditions[i]);
    result = join === 'AND' ? result && next : result || next;
  }

  return result;
}

/**
 * Evaluate a single condition against a transaction.
 * The special `hour` field is derived from txHour rather than tx itself.
 */
function evalCondition(tx: Transaction, txHour: number, cond: RuleCondition): boolean {
  const { field, operator, value } = cond;

  // Resolve the transaction field value (with `hour` as a runtime-derived field)
  const txValue: unknown = field === 'hour'
    ? txHour
    : tx[field as keyof Transaction];

  // Multi-value operators
  if (operator === 'in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.some(v => String(txValue) === String(v));
  }
  if (operator === 'not in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return arr.every(v => String(txValue) !== String(v));
  }

  // Boolean equality
  if (typeof txValue === 'boolean') {
    const target = value === true || value === 'true';
    if (operator === '=')  return txValue === target;
    if (operator === '!=') return txValue !== target;
    return false;
  }

  // Numeric comparison
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

  // String equality
  const txStr = String(txValue);
  const valStr = String(value);
  if (operator === '=')  return txStr === valStr;
  if (operator === '!=') return txStr !== valStr;

  return false;
}
