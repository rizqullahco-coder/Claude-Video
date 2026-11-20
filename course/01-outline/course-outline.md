# AI for Accountants: Close Your Books Faster with Claude

**Brand:** BrightLedger Academy (placeholder — swap for your own name, colours and logo)
**Language:** English · **Currency in examples:** RM · **Format:** 4 modules, 19 video lessons (5–8 min each), 4 quizzes, 4 workbooks, practice files, capstone, certificate
**Total video time:** about 2 hours · **Suggested pace:** one module per week

## Who it's for

Accountants, bookkeepers, accounts executives and accounting students who know the basics (debits and credits, reconciliations, month-end) but have not yet used AI in their daily work. No coding needed.

## What students will be able to do

1. Clean, standardise and categorise a messy ledger with Claude in minutes, not hours.
2. Run a month-end close with AI help: checklist, bank reconciliation, accruals and prepayments.
3. Turn a trial balance into clear management reports with variance commentary a business owner understands.
4. Write reusable prompts (the **BRIEF** method) for everyday accounting tasks.
5. Check AI output properly and keep client data safe.
6. Complete one full month-end close as a portfolio project to show employers or clients.

## The practice company

Every lesson uses the same fictional business, so students build one complete set of books across the course:

**Kopi Mesra Sdn Bhd** — a two-outlet café in Petaling Jaya. Financial year starts 1 January. The course works on **March 2026**. Bank: a current account with ~140 transactions a month. Practice files are in `04-datasets/`.

## The BRIEF prompt method (taught in Lesson 1.2, used everywhere)

| Letter | Means | Example |
|---|---|---|
| **B** | Background | "I'm the accountant for a small café. This is the March ledger export." |
| **R** | Request | "Find duplicates, missing categories and inconsistent vendor names." |
| **I** | Instructions & rules | "Use only the accounts in the attached chart of accounts. Don't change amounts." |
| **E** | Expected output | "A table: row number, issue, suggested fix. Then a cleaned file." |
| **F** | Fact-check | "List anything you're unsure about. Show totals before and after so I can tie out." |

---

## Module 1 — Ledgers: clean books fast (Week 1)

**Goal:** Turn a messy ledger export into clean, categorised, review-ready data.

| # | Lesson | Length | Students learn to | Practice file |
|---|---|---|---|---|
| 1.1 | **Clean a messy ledger in 10 minutes** *(sample video)* | 5 min | Upload a ledger, ask Claude for an issues list, check its totals | `M1_ledger_march_messy.xlsx` |
| 1.2 | The BRIEF method: prompting like an accountant | 7 min | Write prompts with background, rules and a fact-check step | — |
| 1.3 | Standardise vendor names and map to the chart of accounts | 7 min | Group spelling variants ("GRAB*FOOD", "Grab Food MY") and assign GL accounts | `M1_chart_of_accounts.xlsx` |
| 1.4 | Find duplicates, gaps and odd entries | 6 min | Spot double postings, missing references, round-sum and weekend items | `M1_ledger_march_messy.xlsx` |
| 1.5 | Keep data safe and check Claude's work | 6 min | Anonymise client data, follow firm policy, tie out totals, sample-check | — |

**Workbook 1:** BRIEF prompt planner, ledger clean-up checklist, before/after tie-out sheet, data-safety checklist.

### Quiz 1 (pass mark 6/8)

1. What is the safest first thing to ask Claude after uploading a ledger?
   a) "Fix everything" b) **"List the issues you find and don't change anything yet"** c) "Post the journals" d) "Delete duplicates"
2. In BRIEF, the **F** step means:
   a) Format b) Finalise c) **Fact-check — ask Claude to flag uncertainty and show totals to tie out** d) File
3. After cleaning, total debits were RM 412,880 before and RM 409,260 after. What should you do?
   a) Accept it b) **Find which rows changed and confirm each removal was a true duplicate** c) Ask Claude to force them to match d) Ignore it, it's under 1%
4. Which is the best way to share client data with an AI tool?
   a) Paste everything including IC numbers b) **Follow your firm's AI policy and remove personal identifiers you don't need** c) Email it to yourself first d) Only use screenshots
5. "GRAB*FOOD 8812", "Grab Food MY" and "GRABFOOD" should be:
   a) Three vendors b) **One standardised vendor name** c) Deleted d) Moved to suspense
6. Claude suggests an account that isn't in your chart of accounts. Best fix?
   a) Create the account b) **Add the rule "use only accounts from the attached chart" and re-run** c) Use suspense for everything d) Accept it
7. Two rows have the same date, amount and reference. They are:
   a) Definitely duplicates b) **Possible duplicates to check against source documents** c) Fine d) Errors in the bank
8. Who is responsible for the final numbers?
   a) Claude b) The software vendor c) **You, the accountant** d) Nobody

---

## Module 2 — Closing: reconcile a month (Week 2)

**Goal:** Close March for Kopi Mesra with a reconciled bank, accruals and prepayments, and a short close memo.

| # | Lesson | Length | Students learn to | Practice file |
|---|---|---|---|---|
| 2.1 | Build a month-end checklist with Claude | 5 min | Turn a vague process into a dated, owner-assigned checklist | — |
| 2.2 | Bank reconciliation: match bank to ledger | 8 min | Match by amount, date window and reference; list unmatched items | `M2_bank_statement_march.xlsx`, `M2_cashbook_march.xlsx` |
| 2.3 | Explain reconciling items | 6 min | Classify timing differences, bank charges, errors; draft adjustments | same |
| 2.4 | Accruals and prepayments: draft the journals | 7 min | Calculate accruals and prepayment releases, draft journals for review | `M2_accruals_prepayments.xlsx` |
| 2.5 | Tie-outs and the close memo | 6 min | Run final checks and write a one-page close memo | — |

**Workbook 2:** Month-end checklist template, bank rec template, reconciling-items log, journal review sheet, close memo template.

### Quiz 2 (pass mark 6/8)

1. A cheque issued on 30 March clears the bank on 3 April. At 31 March it is:
   a) An error b) **An unpresented cheque (timing difference)** c) A bank charge d) A deposit in transit
2. The best matching rule to give Claude for bank-to-ledger matching is:
   a) Match by description only b) **Match on amount, then date within ±3 days, then reference** c) Match anything close d) Match by row order
3. Bank charges of RM 45 appear only on the bank statement. You should:
   a) Ignore them b) **Record them in the ledger** c) Ask the bank to reverse them d) Put them in suspense forever
4. Rent of RM 6,000 for April–June was paid in March. At 31 March this is:
   a) An accrual b) **A prepayment** c) Revenue d) A liability
5. Electricity for March, RM 2,350, will be billed in April. At 31 March you:
   a) Do nothing b) **Accrue RM 2,350** c) Prepay it d) Write it off
6. Claude drafts a journal entry. Before posting you must:
   a) Post immediately b) **Check accounts, amounts, period and that debits equal credits** c) Ask Claude if it's right d) Delete the narrative
7. After the reconciliation, adjusted bank balance and adjusted cashbook balance should:
   a) Differ by bank charges b) **Be equal** c) Be close d) Be zero
8. A close memo should include:
   a) Every transaction b) **Key balances, adjustments made, open items and who reviewed** c) Only the profit figure d) Claude's chat history

---

## Module 3 — Reports that read well (Week 3)

**Goal:** Produce a one-page management report with variance commentary and a simple dashboard.

| # | Lesson | Length | Students learn to | Practice file |
|---|---|---|---|---|
| 3.1 | From trial balance to P&L and balance sheet | 7 min | Map a TB to statements and check they balance | `M3_trial_balance_march.xlsx` |
| 3.2 | Budget vs actual: variance analysis | 7 min | Calculate variances, set materiality, find the drivers | `M3_budget_vs_actual.xlsx` |
| 3.3 | Write management commentary that reads well | 6 min | Turn numbers into plain-English, owner-friendly explanations | — |
| 3.4 | Charts and a one-page dashboard | 6 min | Choose the right chart; ask Claude to build a clean dashboard | — |
| 3.5 | Tailor the report: owner, banker, auditor | 5 min | Rewrite the same results for different readers | — |

**Workbook 3:** Statement mapping sheet, variance analysis template, commentary formula (What / Why / So what / Now what), audience checklist.

### Quiz 3 (pass mark 6/8)

1. A trial balance where total debits ≠ total credits means:
   a) Profit b) **There's an error to find before reporting** c) It's normal mid-month d) Claude made it up
2. Revenue budget RM 120,000, actual RM 108,000. The variance is:
   a) RM 12,000 favourable b) **RM 12,000 adverse (−10%)** c) RM 108,000 d) 12% favourable
3. Materiality in variance analysis helps you:
   a) Hide bad news b) **Focus commentary on variances that matter** c) Change the budget d) Round numbers
4. Good commentary follows:
   a) Numbers only b) **What happened, why, so what, now what** c) A long list of every account d) Jargon
5. To show monthly sales trend, the best chart is:
   a) Pie chart b) **Line or column chart** c) 3D donut d) Table only
6. A bank manager mainly wants to see:
   a) Staff birthdays b) **Cash flow, profitability and ability to repay** c) Coffee recipes d) Every invoice
7. Claude's commentary says "sales fell due to the rainy season." You should:
   a) Keep it b) **Check the reason with the business — Claude can't know it from numbers alone** c) Delete all commentary d) Add more weather
8. Before sending a report you should:
   a) **Tie key figures back to the trial balance** b) Trust the chart c) Ask Claude to approve it d) Skip review

---

## Module 4 — Portfolio: one full close (Week 4)

**Goal:** Complete April for Kopi Mesra from raw data to report, and package it as a portfolio piece.

| # | Lesson | Length | Students learn to | Practice file |
|---|---|---|---|---|
| 4.1 | Capstone brief: Kopi Mesra, April | 4 min | Read the brief and plan the close | `M4_capstone_april_pack.xlsx` |
| 4.2 | Clean and close walkthrough | 8 min | Apply Modules 1–2 end to end | same |
| 4.3 | Report and present | 7 min | Apply Module 3: report, dashboard, commentary | same |
| 4.4 | Your prompt library, portfolio and next steps | 5 min | Save your best prompts; present your work to employers/clients | — |

**Workbook 4:** Capstone brief, submission checklist, self-review rubric, portfolio one-pager template.

### Capstone rubric (used for the certificate)

| Area | Pass standard |
|---|---|
| Clean ledger | All duplicates found, vendors standardised, every row mapped to a valid account, totals tie out |
| Bank reconciliation | Adjusted balances agree; every reconciling item explained |
| Journals | Accruals/prepayments correct, balanced, with narratives |
| Report | P&L and balance sheet agree to TB; commentary covers the top 3 variances using What/Why/So what/Now what |
| Review | Close memo lists open items and the checks performed |

### Quiz 4 — final check (pass mark 6/8)

1. Correct order for a month-end close: **clean → reconcile → adjust → report → review**
2. What proves your bank reconciliation is complete? **Adjusted bank = adjusted cashbook, every item explained**
3. Your P&L profit doesn't match the TB. First step? **Check the mapping of each TB account to the statements**
4. Which prompt habit prevents most AI mistakes? **Giving rules and asking for a fact-check with totals**
5. What should a portfolio piece leave out? **Real client data — use the practice company**
6. Claude gives a confident answer you can't verify. You should: **Treat it as a draft and verify against source data**
7. A reusable prompt library saves time because: **Good prompts work again with new months' data**
8. Completion certificate requirements: **All 4 quizzes passed and capstone submitted against the rubric**

---

## Certificate

**Certificate of Completion — AI for Accountants: Close Your Books Faster with Claude**, issued by BrightLedger Academy. Awarded when the student passes all 4 quizzes and submits the capstone. (It is your academy's certificate, not an Anthropic or "Claude" certification.)

## Production plan

1. ✅ Outline, quizzes, practice files, workbooks, certificate, overview page, **sample video 1.1** — for your approval.
2. After approval: Module 1 videos (1.2–1.5) → Module 2 → Module 3 → Module 4, one module per batch.
