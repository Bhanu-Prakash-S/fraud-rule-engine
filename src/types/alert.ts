import { Severity } from './rule';

export interface FlagResult {
  alertId: string;              // "ALERT-001" format
  transactionId: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  scenario: string;
  isFalsePositive: boolean;     // true when transaction.isFlaggedGT = false
  markedFPByAnalyst: boolean;   // analyst manually toggled
  timestamp: string;            // ISO — when the alert was generated
}
