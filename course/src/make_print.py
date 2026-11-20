"""Build the printable materials (workbooks, prompt pack, certificate) as HTML, then PDF via Playwright.

Run: python3 course/src/make_print.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
F = json.loads((ROOT / "04-datasets" / "_facts.json").read_text())
WB = ROOT / "03-workbooks"
CERT = ROOT / "05-certificate"
WB.mkdir(exist_ok=True)
CERT.mkdir(exist_ok=True)

BRAND = "BrightLedger Academy"
COURSE = "AI for Accountants: Close Your Books Faster with Claude"


def rm(v):
    return f"RM {v:,.2f}"


CSS = """
@page { size: A4; margin: 0; }
:root { --teal:#0F4C5C; --deep:#0A2F38; --amber:#E9A23B; --amber-soft:#FBE7C4; --cream:#FBF6EC; --ink:#12262B; --muted:#5B6F73; --line:#DCD4C4; --coral:#D9644A; --green:#2E8B62; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: var(--ink); font-size: 10.5pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; min-height: 297mm; padding: 18mm 18mm 20mm; position: relative; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.foot { position: absolute; bottom: 9mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; font-size: 8pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 3mm; }
.cover { background: var(--deep); color: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 24mm 20mm; }
.logo { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 13pt; }
.logo i { width: 22px; height: 22px; background: var(--amber); border-radius: 6px; transform: rotate(45deg); display: inline-block; position: relative; }
.logo i::after { content: ''; position: absolute; inset: 7px; background: var(--deep); border-radius: 2px; }
.cover .k { color: var(--amber); font-weight: 700; letter-spacing: .14em; text-transform: uppercase; font-size: 10pt; }
.cover h1 { font-family: 'Inter Display', 'Inter'; font-size: 44pt; line-height: 1.02; letter-spacing: -.02em; margin-top: 6mm; }
.cover .sub { color: #BFD3D6; font-size: 13pt; margin-top: 6mm; max-width: 140mm; }
.cover .band { height: 3px; width: 60mm; background: var(--amber); margin-top: 10mm; }
.cover .meta { color: #BFD3D6; font-size: 9.5pt; }
h2 { font-family: 'Inter Display', 'Inter'; color: var(--teal); font-size: 20pt; letter-spacing: -.01em; margin-bottom: 2mm; }
h3 { color: var(--teal); font-size: 12pt; margin: 6mm 0 2mm; }
.kick { color: #B77A1E; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; font-size: 8.5pt; margin-bottom: 1mm; }
p { margin: 2mm 0; }
.lead { color: var(--muted); font-size: 11pt; }
table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9.5pt; }
th { background: var(--teal); color: #fff; text-align: left; padding: 2.2mm 2.5mm; font-weight: 600; }
td { border-bottom: 1px solid var(--line); padding: 2.6mm 2.5mm; vertical-align: top; }
td.blank { height: 9mm; }
td.n, th.n { text-align: right; font-family: 'JetBrains Mono', monospace; }
.box { border: 1.2px solid var(--line); border-radius: 3mm; padding: 4mm 5mm; margin: 3mm 0; background: #fff; }
.box.amber { background: var(--amber-soft); border-color: #EFD196; }
.box.teal { background: #E6F0F0; border-color: #C3DADB; }
.lines div { border-bottom: 1px solid var(--line); height: 8.5mm; }
.chk { list-style: none; }
.chk li { padding: 1.6mm 0 1.6mm 8mm; position: relative; border-bottom: 1px dashed #E6DFD1; }
.chk li::before { content: ''; position: absolute; left: 0; top: 2.4mm; width: 4mm; height: 4mm; border: 1.4px solid var(--teal); border-radius: 1mm; }
pre { font-family: 'JetBrains Mono', monospace; font-size: 8.8pt; white-space: pre-wrap; background: #F4F1EA; border-left: 3px solid var(--amber); padding: 3mm 4mm; border-radius: 2mm; margin: 2mm 0; line-height: 1.45; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.small { font-size: 8.5pt; color: var(--muted); }
.brief td:first-child { width: 30mm; font-weight: 700; color: var(--teal); }
"""


def doc(title, pages):
    body = []
    for i, (kind, html) in enumerate(pages, 1):
        if kind == "cover":
            body.append(f'<section class="page cover">{html}</section>')
        else:
            body.append(f'<section class="page">{html}<div class="foot"><span>{BRAND} · {title}</span><span>Page {i}</span></div></section>')
    return f'<!doctype html><html><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head><body>{"".join(body)}</body></html>'


def cover(module, title, sub):
    return ("cover", f"""<div class="logo"><i></i>{BRAND}</div>
<div><div class="k">{module}</div><h1>{title}</h1><div class="sub">{sub}</div><div class="band"></div></div>
<div class="meta">{COURSE}<br>Practice company: Kopi Mesra Sdn Bhd (fictional). Name: ______________________________</div>""")


def blank_rows(cols, n, widths=None):
    head = "".join(f'<th style="width:{widths[i]}">{c}</th>' if widths else f"<th>{c}</th>" for i, c in enumerate(cols))
    rows = "".join("<tr>" + "".join('<td class="blank"></td>' for _ in cols) + "</tr>" for _ in range(n))
    return f"<table><tr>{head}</tr>{rows}</table>"


def checklist(items):
    return '<ul class="chk">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


BRIEF = """<table class="brief"><tr><th>Letter</th><th>Means</th><th>Write yours</th></tr>
<tr><td>B · Background</td><td>Who you are, the business, what the file is</td><td class="blank" style="height:16mm"></td></tr>
<tr><td>R · Request</td><td>The job, and the kinds of problems or outputs you care about</td><td class="blank" style="height:16mm"></td></tr>
<tr><td>I · Instructions</td><td>Rules: accounts to use, what not to change, standards to follow</td><td class="blank" style="height:16mm"></td></tr>
<tr><td>E · Expected output</td><td>Table, file, memo; columns and order</td><td class="blank" style="height:16mm"></td></tr>
<tr><td>F · Fact-check</td><td>Totals to tie out; ask Claude to flag anything it's unsure about</td><td class="blank" style="height:16mm"></td></tr></table>"""

PROMPTS = {
    "1.1 Issues list": "I'm the accountant for Kopi Mesra Sdn Bhd, a café. The attached file is their March 2026 general ledger export.\nReview it and list every issue you find: duplicate entries, missing account codes, missing references, inconsistent vendor names, and anything unusual.\nDon't change the data yet.\nShow the results as a table: row, reference, issue, suggested fix. Finish with total debits and total credits, and tell me anything you're unsure about.",
    "1.1 Clean file": "Thanks. Now create a cleaned version of the file:\n• Use only accounts from the attached chart of accounts\n• Add a column with the standard vendor name\n• Flag duplicates, don't delete them\n• Don't change any amounts\n• Add a Status column: OK, Review, or Possible duplicate\nShow total debits and credits before and after so I can tie out.",
    "1.3 Vendor map": "Group every vendor name in the attached ledger that refers to the same supplier (for example 'GRAB*FOOD 8812' and 'Grab Food MY').\nReturn a table: variant as written, standard name, suggested account code from the attached chart of accounts, confidence (high/medium/low).\nOnly use accounts that exist in the chart. List low-confidence matches separately for me to decide.",
    "1.4 Duplicates and odd items": "Check the attached ledger for: exact duplicates (same date, reference and amount), near duplicates (same amount and vendor within 3 days), missing references, round-sum amounts, weekend postings and anything posted to Suspense.\nDon't delete anything. Give me a table: row, type of issue, why it's suspicious, what document I should check.",
    "1.5 Anonymise": "Before I share this file, list every column that may contain personal or sensitive data (names, IC numbers, phone numbers, bank account numbers, addresses). Suggest how to mask each one so the accounting analysis still works.",
    "2.1 Month-end checklist": "I close the books monthly for a two-outlet café with one bank account, delivery-platform sales, payroll and accruals. Build a month-end checklist in close order with columns: task, owner, due (working day 1-5), evidence to keep. Keep it to 20 tasks or fewer.",
    "2.2 Bank rec matching": "Attached are the March bank statement and the March cashbook. Match them using these rules, in order: 1) same amount, 2) date within ±3 days, 3) similar description.\nReturn three tables: matched items, items only in the bank, items only in the cashbook. Show closing balances from both files and the difference. Don't guess matches; list uncertain ones separately.",
    "2.3 Reconciling items": "For each unmatched item, classify it as: timing difference (unpresented payment or deposit in transit), bank-only item to record (charges, fees, interest), or error (amount or posting mistake). For errors, show the likely cause, e.g. transposed digits. Then prepare the bank reconciliation statement: balance per bank, ± timing differences = adjusted bank; balance per cashbook, ± adjustments = adjusted cashbook. They must agree.",
    "2.4 Accruals and prepayments": "Using the attached list of month-end items, draft journal entries for 31 March 2026. For each: date, debit account, credit account, amount, narrative, calculation. Use only accounts from the attached chart. Check that total debits equal total credits and show the check.",
    "2.5 Close memo": "Write a one-page month-end close memo for March 2026 using the information below. Sections: key balances, adjustments made, reconciliations completed, open items with owners, checks performed. Plain English, no more than 300 words. [paste your notes]",
    "3.1 TB to statements": "Map each account in the attached trial balance to the Profit & Loss or the Balance Sheet, grouped as: Revenue, Cost of sales, Operating expenses, Finance costs, Assets, Liabilities, Equity. Then produce a summarised P&L and balance sheet. Show that the TB balances and that profit agrees to the change in equity.",
    "3.2 Variance analysis": "Using the attached budget vs actual, flag variances bigger than RM 1,000 or 10%. For each, show: amount, %, favourable or adverse, and three possible business reasons I should confirm with the owner. Don't state reasons as facts.",
    "3.3 Commentary": "Write management commentary on the top three variances for the café owner. For each use: What happened (numbers), Why (only the reasons I confirm below), So what (impact on profit or cash), Now what (one action). Under 200 words, no jargon. Confirmed reasons: [paste]",
    "3.4 Dashboard": "Create a one-page dashboard for March from the attached data: revenue by channel (column chart), gross margin %, top 5 expenses (bar chart), budget vs actual for profit, and three key messages. Use clear labels and RM values.",
    "3.5 Tailor": "Rewrite this management report for [the café owner / a bank credit officer / the external auditor]. Keep all numbers identical. Change only emphasis, length and tone to fit the reader. [paste report]",
    "4.x Capstone kickoff": "I'm closing April 2026 for Kopi Mesra Sdn Bhd. Attached is the capstone pack. Read the README sheet and give me a step-by-step plan for the close, with the checks I should do after each step. Don't do the work yet.",
}


def prompt_blocks(keys):
    return "".join(f"<h3>{k}</h3><pre>{PROMPTS[k]}</pre>" for k in keys)


br = F["bank_rec"]
unp = sum(a for _, a in br["unpresented"])
dit = sum(a for _, a in br["in_transit"])
tr = br["transposition"]
tdiff = round(tr["cashbook"] - tr["true"], 2)

# ------------------------------------------------------------------ Workbook 1
wb1 = [
    cover("Workbook 1 · Week 1", "Ledgers:<br>clean books fast", "Exercises, templates and checklists for Lessons 1.1 to 1.5."),
    ("p", f"""<div class="kick">Start here</div><h2>How to use this workbook</h2>
<p class="lead">Watch each lesson, then do the matching exercise here with the practice files. Print it, or fill it in on screen.</p>
<div class="box teal"><b>Practice files for this module</b><br>M1_ledger_march_messy.xlsx · M1_chart_of_accounts.xlsx<br>
<span class="small">Kopi Mesra Sdn Bhd is fictional, so these files are safe to upload to Claude.</span></div>
<h3>Golden rules</h3>{checklist(["Ask for a list of issues before asking Claude to change anything.", "Give rules: which accounts to use, what must not change.", "Always tie out totals before and after.", "Check uncertain items against source documents.", "Never upload real client data unless your firm's AI policy allows it, and remove what you don't need.", "You sign off on the numbers, not Claude."])}
<h3>The BRIEF prompt planner</h3><p>Use this every time you write a new prompt. Lesson 1.2 explains each step.</p>{BRIEF}"""),
    ("p", f"""<div class="kick">Lesson 1.1 · Exercise</div><h2>Clean a messy ledger</h2>
<p>Upload <b>M1_ledger_march_messy.xlsx</b> to Claude and run these two prompts, in order.</p>{prompt_blocks(["1.1 Issues list", "1.1 Clean file"])}
<h3>Tie-out sheet</h3>
<table><tr><th>Check</th><th class="n">Your figure (RM)</th><th>Agrees?</th></tr>
<tr><td>Total debits, original file</td><td class="blank"></td><td class="blank"></td></tr>
<tr><td>Value of rows flagged as duplicates</td><td class="blank"></td><td class="blank"></td></tr>
<tr><td>Total debits after removing confirmed duplicates</td><td class="blank"></td><td class="blank"></td></tr>
<tr><td>Difference (should equal duplicates value)</td><td class="blank"></td><td class="blank"></td></tr>
<tr><td>Total credits, original vs cleaned (should not change)</td><td class="blank"></td><td class="blank"></td></tr></table>"""),
    ("p", f"""<div class="kick">Lessons 1.3 · 1.4</div><h2>Vendors, duplicates and odd items</h2>
<h3>Vendor standardisation sheet</h3>{blank_rows(["Name as written", "Standard name", "Account", "Confidence"], 5)}
<h3>Duplicate and odd-item review log</h3>{blank_rows(["Row / Ref", "Date", "Amount", "Issue", "Source checked?", "Decision"], 4)}
{prompt_blocks(["1.3 Vendor map", "1.4 Duplicates and odd items"])}"""),
    ("p", f"""<div class="kick">Lesson 1.5</div><h2>Data safety and review checklist</h2>
<h3>Before you upload</h3>{checklist(["I have checked my firm's policy on AI tools and client data.", "I removed names, IC numbers, phone numbers and bank account numbers that I don't need.", "I am using an approved account or workspace, not a personal one, for client work.", "The file contains only the period and columns needed for the task."])}
<h3>Before you rely on the output</h3>{checklist(["Totals tie out to the original file.", "Every account used exists in the chart of accounts.", "Amounts were not changed unless I asked.", "Items Claude marked as uncertain have been checked against source documents.", "I can explain every change to a reviewer or auditor."])}
{prompt_blocks(["1.5 Anonymise"])}
<div class="box amber"><b>Answer key (practice file)</b><br>
{F['ledger_rows']} rows · {F['duplicates']} possible duplicates worth {rm(F['duplicate_value'])} · {F['missing_account']} rows with no account · {F['missing_ref']} payments with no reference · {F['vendor_spellings']} spellings of {F['vendors']} vendors · 2 unusual items: {F['odd'][0]}; {F['odd'][1]}.<br>
Total debits original {rm(F['total_debits_messy'])}; after removing duplicates {rm(F['total_debits_after_dup_removal'])}; total credits {rm(F['total_credits'])} (unchanged).</div>"""),
]

# ------------------------------------------------------------------ Workbook 2
wb2 = [
    cover("Workbook 2 · Week 2", "Closing:<br>reconcile a month", "Checklist, bank reconciliation, journals and close memo templates for Lessons 2.1 to 2.5."),
    ("p", f"""<div class="kick">Lesson 2.1</div><h2>Month-end checklist</h2>
<p class="lead">Generate a draft with the prompt below, then make it yours.</p>{prompt_blocks(["2.1 Month-end checklist"])}
{blank_rows(["#", "Task", "Owner", "Due (WD)", "Evidence", "Done"], 12, ["7%", "38%", "14%", "11%", "20%", "10%"])}"""),
    ("p", f"""<div class="kick">Lessons 2.2 · 2.3</div><h2>Bank reconciliation</h2>
<p>Files: <b>M2_bank_statement_march.xlsx</b> and <b>M2_cashbook_march.xlsx</b>.</p>{prompt_blocks(["2.2 Bank rec matching", "2.3 Reconciling items"])}
<div class="two"><table><tr><th colspan="2">Bank side</th></tr><tr><td>Balance per bank statement</td><td class="blank"></td></tr><tr><td>Add: deposits in transit</td><td class="blank"></td></tr><tr><td>Less: unpresented payments</td><td class="blank"></td></tr><tr><td><b>Adjusted bank balance</b></td><td class="blank"></td></tr></table>
<table><tr><th colspan="2">Cashbook side</th></tr><tr><td>Balance per cashbook</td><td class="blank"></td></tr><tr><td>Less: bank charges and fees</td><td class="blank"></td></tr><tr><td>Add: interest received</td><td class="blank"></td></tr><tr><td>± Errors corrected</td><td class="blank"></td></tr><tr><td><b>Adjusted cashbook balance</b></td><td class="blank"></td></tr></table></div>
<h3>Reconciling items log</h3>{blank_rows(["Date", "Description", "Amount", "Type", "Action / journal"], 3)}"""),
    ("p", f"""<div class="kick">Lessons 2.4 · 2.5</div><h2>Journals and the close memo</h2>
<p>File: <b>M2_accruals_prepayments.xlsx</b>.</p>{prompt_blocks(["2.4 Accruals and prepayments"])}
<h3>Journal review sheet</h3>{blank_rows(["Dr account", "Cr account", "Amount", "Narrative", "Period ✓", "Calc ✓"], 7)}
{prompt_blocks(["2.5 Close memo"])}
<h3>Close memo outline</h3>{checklist(["Key balances: bank, receivables, payables, accruals", "Adjustments made, with amounts", "Reconciliations completed and who reviewed them", "Open items, owners and due dates", "Checks performed"])}"""),
    ("p", f"""<div class="kick">Answer key</div><h2>Check your bank reconciliation</h2>
<table><tr><th>Bank side</th><th class="n">RM</th></tr>
<tr><td>Balance per bank statement, 31 March</td><td class="n">{br['bank_close']:,.2f}</td></tr>
<tr><td>Add: deposit in transit ({', '.join(r for r, _ in br['in_transit'])})</td><td class="n">{dit:,.2f}</td></tr>
<tr><td>Less: unpresented payments ({', '.join(r for r, _ in br['unpresented'])})</td><td class="n">({unp:,.2f})</td></tr>
<tr><td><b>Adjusted bank balance</b></td><td class="n"><b>{br['adjusted_balance']:,.2f}</b></td></tr></table>
<table><tr><th>Cashbook side</th><th class="n">RM</th></tr>
<tr><td>Balance per cashbook, 31 March</td><td class="n">{br['cashbook_close']:,.2f}</td></tr>
<tr><td>Less: bank service charge</td><td class="n">(45.00)</td></tr>
<tr><td>Less: merchant card fees</td><td class="n">(612.40)</td></tr>
<tr><td>Add: interest credit</td><td class="n">18.20</td></tr>
<tr><td>Add: transposition error on {tr['ref']} (recorded {tr['cashbook']:,.2f}, actual {tr['true']:,.2f})</td><td class="n">{tdiff:,.2f}</td></tr>
<tr><td><b>Adjusted cashbook balance</b></td><td class="n"><b>{br['cashbook_close'] - 45 - 612.40 + 18.20 + tdiff:,.2f}</b></td></tr></table>
<h3>Accruals and prepayments at 31 March</h3>
<table><tr><th>Item</th><th>Dr</th><th>Cr</th><th class="n">RM</th></tr>
<tr><td>Electricity March</td><td>6110 Electricity & Water</td><td>2100 Accruals</td><td class="n">2,350.00</td></tr>
<tr><td>Accounting fee Q1</td><td>6600 Professional Fees</td><td>2100 Accruals</td><td class="n">3,000.00</td></tr>
<tr><td>Casual staff overtime</td><td>6000 Salaries & Wages</td><td>2100 Accruals</td><td class="n">1,180.00</td></tr>
<tr><td>Insurance release (4,800 / 12)</td><td>6310 Cleaning & Supplies*</td><td>1300 Prepayments</td><td class="n">400.00</td></tr>
<tr><td>Pest control Apr–Jun paid in March</td><td>1300 Prepayments</td><td>6310 Cleaning & Supplies</td><td class="n">1,350.00</td></tr>
<tr><td>POS licence release (2,268 / 12)</td><td>6500 Software Subscriptions</td><td>1300 Prepayments</td><td class="n">189.00</td></tr></table>
<p class="small">*The practice chart has no insurance account; a good answer flags this and suggests adding one, rather than forcing it.</p>"""),
]

# ------------------------------------------------------------------ Workbook 3
t = F["tb"]
wb3 = [
    cover("Workbook 3 · Week 3", "Reports that<br>read well", "Statement mapping, variance analysis and commentary templates for Lessons 3.1 to 3.5."),
    ("p", f"""<div class="kick">Lesson 3.1</div><h2>From trial balance to statements</h2>
<p>File: <b>M3_trial_balance_march.xlsx</b>.</p>{prompt_blocks(["3.1 TB to statements"])}
{blank_rows(["Statement line", "TB accounts included", "Amount (RM)", "Ties to TB?"], 9)}
<div class="box amber"><b>Check:</b> TB debits = credits = {rm(t['debits'])}. March revenue {rm(t['revenue'])}, expenses {rm(t['expenses'])}, profit {rm(t['profit'])}.</div>"""),
    ("p", f"""<div class="kick">Lesson 3.2</div><h2>Budget vs actual</h2>
<p>File: <b>M3_budget_vs_actual.xlsx</b>. Materiality for this exercise: RM 1,000 or 10%.</p>{prompt_blocks(["3.2 Variance analysis"])}
{blank_rows(["Account", "Budget", "Actual", "Var RM", "Var %", "Fav/Adv", "Reason to confirm"], 8)}"""),
    ("p", f"""<div class="kick">Lessons 3.3 · 3.4 · 3.5</div><h2>Commentary that reads well</h2>
<div class="box teal"><b>What · Why · So what · Now what</b><br>
<b>What:</b> Dine-in sales were RM 99,819, RM 5,181 (4.9%) below budget.<br>
<b>Why:</b> [only reasons the owner confirmed, e.g. the Damansara outlet closed 3 days for repairs].<br>
<b>So what:</b> Gross profit was about RM 3,500 lower than planned.<br>
<b>Now what:</b> Schedule repairs on Mondays, the quietest day.</div>
{prompt_blocks(["3.3 Commentary", "3.4 Dashboard", "3.5 Tailor"])}
<h3>Audience checklist</h3>
<table><tr><th>Reader</th><th>Wants to know</th><th>Length</th></tr>
<tr><td>Owner</td><td>Profit, cash, what to do next</td><td>1 page</td></tr>
<tr><td>Banker</td><td>Cash flow, profitability, ability to repay</td><td>1–2 pages + statements</td></tr>
<tr><td>Auditor</td><td>Policies, judgements, reconciliations, evidence</td><td>Detailed, referenced</td></tr></table>"""),
]

# ------------------------------------------------------------------ Workbook 4
wb4 = [
    cover("Workbook 4 · Week 4", "Portfolio:<br>one full close", "The capstone brief, rubric and portfolio template for Lessons 4.1 to 4.4."),
    ("p", f"""<div class="kick">Lesson 4.1</div><h2>Capstone brief: Kopi Mesra, April 2026</h2>
<p class="lead">Close April from raw data to a management report, using everything from Modules 1–3.</p>
<p>File: <b>M4_capstone_april_pack.xlsx</b> (README, GL Export Apr, Bank Apr, Month-end info, Budget Apr).</p>
{prompt_blocks(["4.x Capstone kickoff"])}
<h3>Submit these 5 items</h3>{checklist(["Cleaned April ledger with a status column and tie-out", "Bank reconciliation for 30 April (adjusted balances agree)", "Month-end journals with narratives and calculations", "One-page management report with dashboard and commentary on the top 3 variances", "Close memo: open items and checks performed"])}"""),
    ("p", f"""<div class="kick">Assessment</div><h2>Rubric and self-review</h2>
<table><tr><th>Area</th><th>Pass standard</th><th>Self-check</th></tr>
<tr><td>Clean ledger</td><td>All duplicates found, vendors standardised, every row mapped to a valid account, totals tie out</td><td class="blank"></td></tr>
<tr><td>Bank reconciliation</td><td>Adjusted balances agree; every reconciling item explained (including March items clearing in April)</td><td class="blank"></td></tr>
<tr><td>Journals</td><td>Accruals, prepayment releases, depreciation and interest correct and balanced, with narratives</td><td class="blank"></td></tr>
<tr><td>Report</td><td>P&L and balance sheet agree to TB; commentary covers the top 3 variances using What/Why/So what/Now what</td><td class="blank"></td></tr>
<tr><td>Review</td><td>Close memo lists open items and checks performed; the RM 3,000 transfer to the director is raised as a query</td><td class="blank"></td></tr></table>
<h3>Certificate requirements</h3>{checklist(["Passed Quizzes 1–4 (6 out of 8 or better)", "Submitted all 5 capstone items", "Met the pass standard in every rubric area"])}"""),
    ("p", f"""<div class="kick">Lesson 4.4</div><h2>Your prompt library and portfolio</h2>
<h3>My top prompts</h3>{blank_rows(["Task", "Prompt name", "Where saved", "Time saved"], 6)}
<h3>Portfolio one-pager</h3>
<div class="box"><b>Project:</b> Month-end close, Kopi Mesra Sdn Bhd (fictional), April 2026<br>
<b>What I did:</b> <div class="lines"><div></div><div></div></div>
<b>Tools:</b> Claude, Excel / Google Sheets<br><b>Results:</b> <div class="lines"><div></div><div></div></div>
<b>What I checked and how:</b> <div class="lines"><div></div><div></div></div></div>
<p class="small">Use only the practice company in your portfolio, never real client data.</p>"""),
]

# ------------------------------------------------------------------ Prompt pack
pp = [cover("Bonus", "Claude prompt pack<br>for accountants", "16 copy-ready prompts from the course, built with the BRIEF method."),
      ("p", f'<div class="kick">Module 1 · Ledgers</div><h2>Clean books fast</h2>{prompt_blocks([k for k in PROMPTS if k.startswith("1.")])}'),
      ("p", f'<div class="kick">Module 2 · Closing</div><h2>Reconcile a month</h2>{prompt_blocks([k for k in PROMPTS if k.startswith("2.")])}'),
      ("p", f'<div class="kick">Modules 3–4 · Reports and capstone</div><h2>Reports that read well</h2>{prompt_blocks([k for k in PROMPTS if k[0] in "34"])}')]

docs = {
    WB / "Workbook-1_Ledgers.html": doc("Workbook 1 · Ledgers", wb1),
    WB / "Workbook-2_Closing.html": doc("Workbook 2 · Closing", wb2),
    WB / "Workbook-3_Reports.html": doc("Workbook 3 · Reports", wb3),
    WB / "Workbook-4_Portfolio.html": doc("Workbook 4 · Portfolio", wb4),
    WB / "Claude-Prompt-Pack.html": doc("Prompt pack", pp),
}

# ------------------------------------------------------------------ Certificate
CERT_HTML = """<!doctype html><html><head><meta charset="utf-8"><title>Certificate of Completion</title><style>
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 297mm; height: 210mm; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #12262B; }
.c { position: relative; width: 297mm; height: 210mm; background: #FBF6EC; overflow: hidden; }
.side { position: absolute; left: 0; top: 0; bottom: 0; width: 74mm; background: #0A2F38; color: #fff; padding: 18mm 12mm; display: flex; flex-direction: column; justify-content: space-between; }
.side .dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.08) 1.2px, transparent 1.2px); background-size: 6mm 6mm; }
.logo { position: relative; display: flex; flex-direction: column; gap: 6mm; }
.mark { width: 16mm; height: 16mm; background: #E9A23B; border-radius: 4mm; transform: rotate(45deg); position: relative; margin-left: 2mm; }
.mark::after { content: ''; position: absolute; inset: 5mm; background: #0A2F38; border-radius: 1.4mm; }
.logo b { font-size: 15pt; line-height: 1.2; }
.seal { position: relative; width: 44mm; height: 44mm; border-radius: 50%; border: 1.4mm solid #E9A23B; display: grid; place-items: center; text-align: center; color: #E9A23B; font-weight: 800; font-size: 9pt; letter-spacing: .12em; line-height: 1.5; }
.seal::before { content: ''; position: absolute; inset: 2.2mm; border-radius: 50%; border: .4mm dashed rgba(233,162,59,.6); }
.main { position: absolute; left: 74mm; right: 0; top: 0; bottom: 0; padding: 22mm 22mm 18mm 24mm; display: flex; flex-direction: column; }
.k { color: #B77A1E; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; font-size: 10pt; }
h1 { font-family: 'Inter Display', 'Inter'; font-size: 40pt; letter-spacing: -.02em; color: #0F4C5C; line-height: 1; margin-top: 4mm; }
.to { margin-top: 13mm; color: #5B6F73; font-size: 11pt; }
.name { margin-top: 3mm; height: 20mm; border-bottom: .5mm solid #0F4C5C; font-family: 'Inter Display', 'Inter'; font-weight: 700; font-size: 32pt; color: #12262B; display: flex; align-items: flex-end; padding-bottom: 2mm; outline: none; }
.for { margin-top: 8mm; font-size: 11.5pt; color: #3A4D51; line-height: 1.55; max-width: 180mm; }
.for b { color: #0F4C5C; }
.skills { margin-top: 5mm; display: flex; flex-wrap: wrap; gap: 2.5mm; }
.skills span { background: #fff; border: .3mm solid #E4DDCF; border-radius: 10mm; padding: 1.4mm 4mm; font-size: 9pt; font-weight: 600; color: #0F4C5C; }
.foot { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10mm; align-items: end; }
.foot div { border-top: .3mm solid #9FB0B3; padding-top: 2mm; font-size: 8.5pt; color: #5B6F73; }
.foot div b { display: block; color: #12262B; font-size: 10pt; height: 6mm; overflow: hidden; }
.disc { position: absolute; bottom: 6mm; left: 98mm; right: 22mm; font-size: 6.5pt; color: #8A9A9D; }
.noprint { position: fixed; top: 10px; right: 10px; font: 13px Inter; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.15); }
@media print { .noprint { display: none; } }
</style></head><body>
<div class="noprint">Click the name, date or ID to edit, then print to PDF (A4 landscape).</div>
<div class="c">
  <div class="side"><div class="dots"></div>
    <div class="logo"><div class="mark"></div><b>BrightLedger<br>Academy</b></div>
    <div class="seal">CERTIFIED<br>COMPLETION<br>2026</div>
  </div>
  <div class="main">
    <div class="k">Certificate of Completion</div>
    <h1>AI for Accountants</h1>
    <div style="font-size:14pt;color:#0F4C5C;font-weight:600;margin-top:2mm">Close Your Books Faster with Claude</div>
    <div class="to">This certifies that</div>
    <div class="name" contenteditable="true" id="n">__NAME__</div>
    <div class="for">has completed all four modules, passed every module quiz, and submitted a full month-end close capstone
      meeting the standards of the <b>AI for Accountants</b> programme, including:</div>
    <div class="skills"><span>Ledger clean-up</span><span>Bank reconciliation</span><span>Accruals &amp; prepayments</span><span>Variance analysis</span><span>Management reporting</span><span>Responsible AI use</span></div>
    <div class="foot">
      <div><b contenteditable="true">__DATE__</b>Date of completion</div>
      <div><b contenteditable="true">__ID__</b>Certificate ID</div>
      <div><b>&nbsp;</b>Lead instructor</div>
    </div>
  </div>
  <div class="disc">Issued by BrightLedger Academy. An independent training course; not issued, sponsored or endorsed by Anthropic. Claude is a product of Anthropic.</div>
</div>
<script>
const q = new URLSearchParams(location.search);
for (const [k, id] of [['name','n']]) if (q.get(k)) document.getElementById(id).textContent = q.get(k);
</script>
</body></html>"""

cert_files = {
    CERT / "certificate-template.html": CERT_HTML.replace("__NAME__", "").replace("__DATE__", "").replace("__ID__", ""),
    CERT / "_certificate-sample.html": CERT_HTML.replace("__NAME__", "Nur Aisyah binti Rahman").replace("__DATE__", "18 December 2026").replace("__ID__", "BLA-AIA-2026-0042"),
}

for p, html in {**docs, **cert_files}.items():
    p.write_text(html)

jobs = [{"html": str(p), "pdf": str(p.with_suffix(".pdf")), "landscape": False} for p in docs]
jobs += [{"html": str(CERT / "certificate-template.html"), "pdf": str(CERT / "Certificate-blank.pdf"), "landscape": True},
         {"html": str(CERT / "_certificate-sample.html"), "pdf": str(CERT / "Certificate-sample.pdf"), "png": str(CERT / "Certificate-sample.png"), "landscape": True}]
Path("/tmp/print_jobs.json").write_text(json.dumps(jobs))
subprocess.run(["node", str(Path(__file__).parent / "pdf.cjs"), "/tmp/print_jobs.json"], check=True)
(CERT / "_certificate-sample.html").unlink()
print("ok")
