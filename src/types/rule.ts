export type TransactionField =
  | 'amount'
  | 'channel'
  | 'isNewPayee'
  | 'merchantCategory'
  | 'customerAge'
  | 'hour'
  | 'city'
  | 'type';

export type Operator =
  | '>'
  | '<'
  | '>='
  | '<='
  | '='
  | '!='
  | 'in'
  | 'not in';

export type LogicalJoin = 'AND' | 'OR';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RuleCondition {
  id: string;
  field: TransactionField;
  operator: Operator;
  value: string | number | boolean | string[];
  logicalJoin: LogicalJoin; // logical join to the NEXT condition
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  scenario: string;
  severity: Severity;
  conditions: RuleCondition[];
  createdAt: string;
  isActive: boolean;
}
