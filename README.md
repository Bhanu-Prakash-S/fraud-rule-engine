# Fraud Rule Engine Simulator

An internal analyst tool that mimics how fraud analysts write, test, and evaluate
transaction monitoring rules in systems like **Falcon / EFRM** used in Financial
Crime Prevention (FCPG) teams.

---

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
src/
├── types/
│   ├── transaction.ts         ← Transaction interface (strict TS)
│   ├── rule.ts                ← Rule, RuleCondition, TransactionField, Operator
│   └── alert.ts               ← FlagResult interface
├── data/
│   ├── transactions.ts        ← 54 mock transactions (10 GT-flagged + 4 IMPS FP bait)
│   └── seedRules.ts           ← 3 seed rules + localStorage helpers
├── engine/
│   ├── ruleEngine.ts          ← evaluateRules() + AuditEntry log + getRuleAuditLog()
│   └── srlPreview.ts          ← Converts Rule → SRL text (Falcon syntax)
├── components/
│   ├── FilterBar.tsx           ← Channel / Category / Type / Payee filters
│   ├── TransactionTable.tsx   ← Paginated ledger + slide-over inspector + flag borders
│   ├── RuleBuilder.tsx        ← Multi-condition rule builder + SRL preview
│   ├── RuleLibrary.tsx        ← Saved rule cards (edit / toggle / delete)
│   └── AlertsQueue.tsx        ← Alert table with FP toggle
├── pages/
│   ├── TransactionsPage.tsx   ← Phase 1 ledger view
│   ├── RuleBuilderPage.tsx    ← Two-column: builder (60%) + library (40%)
│   ├── AlertsPage.tsx         ← Run All Rules + alerts queue
│   └── DashboardPage.tsx      ← MIS dashboard: KPIs, charts, CSV export, audit log
└── constants/
    ├── theme.ts               ← Colors, fonts, spacing, badge color maps
    └── enums.ts               ← Channel, Category, Type + PAGE_SIZE
```

---

## Phase 1 — Transaction Ledger

54 mock transactions (50 normal + 4 IMPS false-positive bait) with 10 ground-truth fraud patterns:

| TXN IDs      | Pattern                                            | Why Suspicious              |
|--------------|----------------------------------------------------|-----------------------------|
| TXN-001–004  | High-value UPI (>₹50k) to **new payees**, 01–04h   | Late-night account takeover |
| TXN-005–007  | 3× sub-₹500 IMPS to same payee within **9 min**    | Card-testing / velocity     |
| TXN-008, 010 | Debits to **Crypto Exchange** merchants            | Mule network cash-out       |
| TXN-009      | Debit to **Gaming** merchant (WinZO)               | High-risk merchant category |
| TXN-051–054  | Legitimate sub-₹500 IMPS debits (canteen etc.)    | **Intentional FP bait for RULE-002** |

---

## Phase 2 — Rule Builder

- **Multi-condition builder** with context-aware value editors per field type
- **AND / OR** logical join pills between conditions
- **Live SRL Preview** rendered in JetBrains Mono (Falcon/EFRM syntax)
- **Rule Library** — persisted to localStorage; edit / active-toggle / delete
- **3 seed rules** auto-loaded on first launch:

| Rule ID   | Name                          | Scenario             | Severity | Expected Precision |
|-----------|-------------------------------|----------------------|----------|--------------------|
| RULE-001  | Late Night High Value UPI     | Late Night Fraud     | Critical | 100% (green)       |
| RULE-002  | Rapid Small IMPS Debits       | Velocity Abuse       | Medium   | ~43% (red ⚠)      |
| RULE-003  | High-Risk Merchant Category   | Suspicious Merchant  | High     | 100% (green)       |

---

## Phase 3 — Rule Engine + Alerts Queue

- **evaluateRules()** — pure function mirroring SRL evaluation in Falcon/EFRM
- **14 total alerts** from seed rules: 4 + 7 + 3 (RULE-002 catches 4 legitimate txns)
- **Slide-over inspector** on each transaction row: all fields + triggered rules + SRL
- **Cross-tab state**: running rules on Alerts tab immediately flags rows in Transactions tab

---

## Phase 4 — MIS Dashboard

- **4 KPI cards**: transactions monitored, alerts raised, confirmed FPs, flag rate
- **Rule Performance Table**: hit rate %, precision % (color-coded green/amber/red)
- **3 SVG charts**: channel breakdown (horizontal bars), hourly distribution (vertical bars with late-night spike shading), severity donut
- **CSV export**: `EFRM_Alert_Report_YYYY-MM-DD.csv` (RBI Format — simulated)
- **Rule Audit Trail**: every create/edit/delete/toggle logged with timestamp and analyst ID
- All charts are **pure SVG** — no external chart libraries

---

## Design System

| Token       | Value                  |
|-------------|------------------------|
| Primary     | `#1E3A5F` (deep navy)  |
| Accent      | `#2563EB` (action blue)|
| Danger      | `#DC2626`              |
| Warning     | `#D97706`              |
| Success     | `#16A34A`              |
| UI Font     | Inter                  |
| Mono Font   | JetBrains Mono         |
| Amounts     | Indian format ₹X,XX,XXX|
| Timestamps  | DD MMM YYYY, HH:MM IST |

---

## Domain Glossary

| Term          | Meaning                                              |
|---------------|------------------------------------------------------|
| Falcon / EFRM | Real bank fraud monitoring systems this app simulates|
| SRL           | Scenario Rule Language — Falcon's rule syntax        |
| FCPG          | Financial Crime Prevention Group                     |
| False Positive| Legitimate transaction wrongly flagged               |
| Hit Rate      | % of transactions a rule flags                       |
| Precision     | % of flags that are genuinely suspicious             |
| Rule Threshold| Numeric boundary in a rule condition                 |
| Payee         | Recipient of the transaction                         |
| Scenario      | Named fraud pattern (e.g. "Late Night High Value")   |

---