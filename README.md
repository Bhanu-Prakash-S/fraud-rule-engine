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

Open [http://localhost:3000](http://localhost:3000) to view in the browser.

---

## Folder Structure

```
src/
├── types/
│   └── transaction.ts         ← Transaction interface (strict TS)
├── data/
│   └── transactions.ts        ← 50 mock transactions (10 GT-flagged)
├── engine/                    ← Rule evaluation logic (Phase 2+)
├── components/
│   ├── FilterBar.tsx           ← Channel / Category / Type / Payee filters
│   └── TransactionTable.tsx   ← Paginated transaction ledger (10/page)
├── pages/
│   └── TransactionsPage.tsx   ← Full-width FCPG ledger view
└── constants/
    ├── theme.ts               ← Colors, fonts, spacing, channel/category badge maps
    └── enums.ts               ← Channel, Category, Type lists + PAGE_SIZE
```

---

## Ground-Truth Fraud Patterns

| TXN IDs      | Pattern                                           | Why Suspicious              |
|--------------|---------------------------------------------------|-----------------------------|
| TXN-001–004  | High-value UPI (>₹50k) to **new payees**, 01–04h  | Late-night account takeover |
| TXN-005–007  | 3× sub-₹500 IMPS to same payee within **9 min**   | Card-testing / velocity     |
| TXN-008, 010 | Debits to **Crypto Exchange** merchants           | Mule network cash-out       |
| TXN-009      | Debit to **Gaming** merchant (WinZO)              | High-risk merchant category |

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

*Phase 1 complete — Transaction Ledger. Awaiting Phase 2 — Rule Builder.*
