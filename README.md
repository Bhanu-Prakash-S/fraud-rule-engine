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
│   └── rule.ts                ← Rule, RuleCondition, TransactionField, Operator
├── data/
│   ├── transactions.ts        ← 50 mock transactions (10 GT-flagged)
│   └── seedRules.ts           ← 3 seed rules + localStorage helpers
├── engine/
│   └── srlPreview.ts          ← Converts Rule → SRL text (Falcon syntax)
├── components/
│   ├── FilterBar.tsx           ← Channel / Category / Type / Payee filters
│   ├── TransactionTable.tsx   ← Paginated transaction ledger (10/page)
│   ├── RuleBuilder.tsx        ← Multi-condition rule builder + SRL preview
│   └── RuleLibrary.tsx        ← Saved rule cards (edit / toggle / delete)
├── pages/
│   ├── TransactionsPage.tsx   ← Phase 1 ledger view
│   └── RuleBuilderPage.tsx    ← Two-column: builder (60%) + library (40%)
└── constants/
    ├── theme.ts               ← Colors, fonts, spacing, badge color maps
    └── enums.ts               ← Channel, Category, Type + PAGE_SIZE
```

---

## Phase 1 — Transaction Ledger

50 mock transactions with 10 ground-truth fraud patterns:

| TXN IDs      | Pattern                                            | Why Suspicious              |
|--------------|----------------------------------------------------|-----------------------------|
| TXN-001–004  | High-value UPI (>₹50k) to **new payees**, 01–04h   | Late-night account takeover |
| TXN-005–007  | 3× sub-₹500 IMPS to same payee within **9 min**    | Card-testing / velocity     |
| TXN-008, 010 | Debits to **Crypto Exchange** merchants            | Mule network cash-out       |
| TXN-009      | Debit to **Gaming** merchant (WinZO)               | High-risk merchant category |

---

## Phase 2 — Rule Builder

- **Multi-condition builder** with context-aware value editors per field type
- **AND / OR** logical join pills between conditions
- **Live SRL Preview** rendered in JetBrains Mono (Falcon/EFRM syntax)
- **Rule Library** — persisted to localStorage; edit / active-toggle / delete
- **3 seed rules** auto-loaded on first launch:

| Rule ID   | Name                          | Scenario             | Severity |
|-----------|-------------------------------|----------------------|----------|
| RULE-001  | Late Night High Value UPI     | Late Night Fraud     | Critical |
| RULE-002  | Rapid Small IMPS Debits       | Velocity Abuse       | Medium   |
| RULE-003  | High-Risk Merchant Category   | Suspicious Merchant  | High     |

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

*Phase 2 complete — Rule Builder. Awaiting Phase 3 — Rule Evaluation Engine.*









