# 🛡️ FCPG EFRM Rule Engine Simulator

A desktop-grade analyst tool that simulates how fraud analysts write, test, and evaluate transaction monitoring rules in systems like **Falcon / EFRM** used in Financial Crime Prevention (FCPG) teams at banks.

Built as a realistic internal-tool simulation — not a consumer app. Every design and UX decision mirrors how a real fraud analyst workbench operates.

---

## 🔗 Live Demo

**[https://yourusername.github.io/fraud-rule-engine](https://yourusername.github.io/fraud-rule-engine)**

> Replace the URL above with your actual GitHub Pages link after deployment.

---

## 📸 Overview

| Tab | Description |
|---|---|
| 📋 **Transactions** | Paginated ledger of 54 synthetic INR transactions with filters and a slide-over inspector |
| ⚙️ **Rule Builder** | Multi-condition SRL rule authoring with live Falcon/EFRM syntax preview and a live rule tester |
| 🚨 **Alerts Queue** | Run all active rules against the dataset, review flags, and mark false positives |
| 📊 **MIS Dashboard** | Rule performance analytics, SVG charts, audit trail, and CSV export |

---

## ✨ Features

### Transaction Ledger
- 54 realistic mock INR transactions seeded with deliberate fraud patterns
- 10 ground-truth fraud transactions (`isFlaggedGT: true`) across 3 fraud archetypes:
  - Late-night high-value UPI transfers to new payees (01:00–04:00 IST)
  - Rapid sub-₹500 IMPS debit succession (card-testing pattern)
  - Debits to Crypto Exchange and Gaming merchants (mule network cash-out)
- 4 intentional false-positive bait transactions (legitimate sub-₹500 IMPS) to demonstrate Rule 2's imprecision
- Filters by Channel, Merchant Category, Transaction Type, and Payee Name
- Paginated 10 per page with colored left-border severity indicators on flagged rows
- Click-to-inspect slide-over panel showing all transaction fields, triggered rules, and the SRL snippet

### Rule Builder
- Multi-condition rule builder with **context-aware value editors** per field type:
  - Numeric inputs for `amount`, `customerAge`, `hour`
  - Single-select dropdowns for `channel`, `merchantCategory`, `type`
  - Boolean toggle for `isNewPayee`
  - Multi-select chip pickers for `in` / `not in` operators
- AND / OR logical join pills between conditions
- Live **SRL Preview** panel (Falcon/EFRM Scenario Rule Language syntax) rendered in JetBrains Mono
- Conflict detection — warns if a new rule shares ≥2 conditions with an existing active rule
- Rule Library with Edit / Active Toggle / Delete per rule, with per-card Hit Rate and Precision badges (visible after a rule run)
- **Live Rule Test** panel — simulate an incoming transaction manually and see which rules fire with per-condition pass/fail breakdown

### Alerts Queue
- `evaluateRules()` pure function mirrors SRL scenario evaluation in Falcon/EFRM
- One alert generated per (transaction × rule) match
- `isFalsePositive` set automatically from ground-truth labels
- Analyst **Mark as FP** toggle per alert (strikes through row, updates dashboard metrics)
- Summary strip: transactions flagged, total alerts, analyst-marked FPs, rule coverage %
- Severity breakdown badges (Critical → Low)

### MIS Dashboard
- 4 KPI cards: Transactions Monitored, Alerts Raised, Confirmed FPs, Flag Rate %
- **Rule Performance Table** with Hit Rate % and Precision % — color-coded:
  - > 80% Precision → green
  - 50–80% → amber
  - < 50% → red + ⚠ Review Recommended
- 3 pure SVG charts (no external chart libraries):
  - **Channel Breakdown** — horizontal bar chart of alerts by payment channel
  - **Hourly Distribution** — vertical bar chart with late-night spike shading (01–04h)
  - **Severity Donut** — proportional severity breakdown with legend
- **Rule Audit Trail** — session log of every rule create / edit / delete / toggle action
- **CSV Export** — downloads `EFRM_Alert_Report_YYYY-MM-DD.csv` (RBI Format — simulated)
- Collapsible **About This Project** panel mapping each UI component to its real FCPG environment equivalent

### App Shell
- Onboarding modal on first launch (localStorage-gated, shown once)
- Sticky navy top navbar with shield icon, tab navigation, and Alerts badge counter
- "SIMULATION MODE" amber pill indicator

---

## 🗂️ Seed Rules

Three rules are pre-loaded into localStorage on first launch:

| Rule | Scenario | Severity | Expected Precision |
|---|---|---|---|
| Late Night High Value UPI | Late Night Fraud | Critical | 100% — all 4 hits are confirmed fraud |
| Rapid Small IMPS Debits | Velocity Abuse | Medium | ~43% — catches 7 txns but 4 are legitimate (by design) |
| High-Risk Merchant Category | Suspicious Merchant | High | 100% — Crypto Exchange and Gaming debits |

---

## 🧱 Tech Stack

| Technology | Usage |
|---|---|
| **React 18** | UI framework — hooks, functional components, lifted state |
| **TypeScript (strict)** | Strict mode throughout, no `any` types, explicit return annotations |
| **Pure SVG Charts** | Channel bars, hourly distribution, severity donut — zero chart libraries |
| **localStorage** | Rule persistence and onboarding state — simulates a config database |
| **In-memory Rule Engine** | `evaluateRules()` is a pure function — deterministic, testable, zero network calls |
| **Inline styles + CSS variables** | All design tokens centralised in `constants/theme.ts` |
| **Inter + JetBrains Mono** | UI font and monospace font (IDs, SRL preview, amounts) |

No backend. No API calls. No external chart libraries. Everything runs in the browser.

---

## 📁 Folder Structure

```
src/
├── types/
│   ├── transaction.ts      ← Transaction interface (strict TS)
│   ├── rule.ts             ← Rule, RuleCondition, Operator, Severity
│   ├── alert.ts            ← FlagResult interface
│   └── field.ts            ← FieldKind, FIELD_META, opsForKind
├── data/
│   ├── transactions.ts     ← 54 mock transactions (10 GT-flagged + 4 IMPS FP bait)
│   └── seedRules.ts        ← 3 seed rules + localStorage helpers
├── engine/
│   ├── ruleEngine.ts       ← evaluateRules(), testSingleTransaction(), audit log
│   └── srlPreview.ts       ← Rule → SRL text (Falcon/EFRM syntax)
├── components/
│   ├── FilterBar.tsx        ← Channel / Category / Type / Payee filters
│   ├── TransactionTable.tsx ← Paginated ledger + slide-over inspector + flag borders
│   ├── RuleBuilder.tsx      ← Multi-condition rule builder + SRL preview
│   ├── RuleLibrary.tsx      ← Saved rule cards (edit / toggle / delete)
│   ├── AlertsQueue.tsx      ← Alert table with FP toggle
│   ├── SlideOverPanel.tsx   ← Transaction detail panel
│   ├── ValueEditor.tsx      ← Context-aware value input per field type
│   └── LiveRuleTest.tsx     ← Manual transaction tester
├── pages/
│   ├── TransactionsPage.tsx ← Ledger view
│   ├── RuleBuilderPage.tsx  ← Builder (60%) + Library (40%) + Live Test
│   ├── AlertsPage.tsx       ← Run All Rules + Alerts Queue
│   └── DashboardPage.tsx    ← MIS dashboard: KPIs, charts, CSV, audit log
├── charts/
│   ├── ChannelChart.tsx     ← Horizontal bar chart (pure SVG)
│   ├── HourlyChart.tsx      ← Vertical bar chart with spike shading (pure SVG)
│   ├── DonutChart.tsx       ← Severity donut (pure SVG)
│   ├── AuditLog.tsx         ← Session audit trail
│   └── AboutPanel.tsx       ← Collapsible project reference panel
└── constants/
    ├── theme.ts             ← Colors, fonts, spacing, severity/channel badge maps
    └── enums.ts             ← Channel, Category, TxnType enums + PAGE_SIZE
```

---

## 🏃 Running Locally

```bash
git clone https://github.com/yourusername/fraud-rule-engine.git
cd fraud-rule-engine
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏦 Domain Glossary

| Term | Meaning |
|---|---|
| Falcon / EFRM | Real bank fraud monitoring systems this app simulates |
| SRL | Scenario Rule Language — Falcon's rule authoring syntax |
| FCPG | Financial Crime Prevention Group |
| False Positive | A legitimate transaction wrongly flagged by a rule |
| Hit Rate | Percentage of transactions a rule flags |
| Precision | Percentage of flags that are genuinely suspicious |
| Rule Threshold | Numeric boundary in a rule condition |
| Payee | Recipient of a transaction |
| Scenario | A named fraud pattern (e.g. "Late Night High Value Transfer") |

---

## ⚠️ Disclaimer

This is a **simulation only**. No real transactions, customer data, or banking systems are involved. All values are entirely synthetic and generated for demonstration purposes.

---
