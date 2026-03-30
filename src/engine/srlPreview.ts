import { Rule, RuleCondition } from '../types/rule';

function formatValue(cond: RuleCondition): string {
  const { value, operator } = cond;

  if (operator === 'in' || operator === 'not in') {
    const arr = Array.isArray(value) ? value : [String(value)];
    return `[${arr.map(v => `'${v}'`).join(', ')}]`;
  }

  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number')  return String(value);
  return `'${value}'`;
}

function conditionToSRL(cond: RuleCondition): string {
  const { field, operator} = cond;

  // Special case: BETWEEN expansion is handled at rule level for hour ranges
  return `${field} ${operator} ${formatValue(cond)}`;
}

/** Render a Rule as pseudo-SRL (Falcon/EFRM Scenario Rule Language) */
export function buildSRLPreview(rule: Partial<Rule>): string {
  const name      = rule.name        || '<Rule Name>';
  const scenario  = rule.scenario    || '<Scenario>';
  const severity  = rule.severity    || 'Medium';
  const conds     = rule.conditions  || [];

  const lines: string[] = [];

  lines.push(`SCENARIO "${scenario}"`);
  lines.push(`  SEVERITY ${severity.toUpperCase()}`);
  lines.push('');

  if (conds.length === 0) {
    lines.push('-- No conditions defined yet --');
  } else {
    conds.forEach((cond, i) => {
      const prefix = i === 0 ? 'IF' : cond.logicalJoin;
      lines.push(`${prefix} ${conditionToSRL(cond)}`);
    });
  }

  lines.push('THEN FLAG');
  lines.push('');
  lines.push(`-- Rule: "${name}"`);
  if (rule.description) {
    lines.push(`-- ${rule.description}`);
  }

  return lines.join('\n');
}
