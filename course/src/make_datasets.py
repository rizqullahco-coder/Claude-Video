"""Generate the Kopi Mesra Sdn Bhd practice files (fictional company).

Run: python3 course/src/make_datasets.py
Writes .xlsx files to course/04-datasets/ and prints the facts the lesson
scripts rely on (row counts, planted issues, totals).
"""
import json
import random
from datetime import date, timedelta
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

OUT = Path(__file__).resolve().parents[1] / "04-datasets"
OUT.mkdir(parents=True, exist_ok=True)
rnd = random.Random(2026)

TEAL = "0F4C5C"
HEAD_FILL = PatternFill("solid", fgColor=TEAL)
HEAD_FONT = Font(bold=True, color="FFFFFF")


def write_sheet(ws, headers, rows, widths=None, money_cols=()):
    ws.append(headers)
    for c in ws[1]:
        c.fill = HEAD_FILL
        c.font = HEAD_FONT
        c.alignment = Alignment(vertical="center")
    for r in rows:
        ws.append(r)
    for i, h in enumerate(headers, 1):
        w = (widths or {}).get(h, max(12, len(h) + 4))
        ws.column_dimensions[get_column_letter(i)].width = w
    for col in money_cols:
        idx = headers.index(col) + 1
        for row in ws.iter_rows(min_row=2, min_col=idx, max_col=idx):
            for c in row:
                c.number_format = "#,##0.00"
    ws.freeze_panes = "A2"


# ---------------------------------------------------------------- chart of accounts
COA = [
    ("1000", "Cash at Bank - Current Account", "Asset"),
    ("1010", "Petty Cash", "Asset"),
    ("1100", "Trade Receivables", "Asset"),
    ("1200", "Inventory - Food & Beverage", "Asset"),
    ("1300", "Prepayments", "Asset"),
    ("1310", "Rental Deposit", "Asset"),
    ("1500", "Kitchen Equipment", "Asset"),
    ("1510", "Accumulated Depreciation - Equipment", "Asset"),
    ("2000", "Trade Payables", "Liability"),
    ("2100", "Accruals", "Liability"),
    ("2200", "SST Payable", "Liability"),
    ("2300", "EPF / SOCSO / EIS Payable", "Liability"),
    ("2500", "Bank Loan", "Liability"),
    ("3000", "Share Capital", "Equity"),
    ("3100", "Retained Earnings", "Equity"),
    ("4000", "Sales - Dine-in", "Revenue"),
    ("4010", "Sales - Delivery Platforms", "Revenue"),
    ("4020", "Sales - Catering", "Revenue"),
    ("4900", "Interest Income", "Revenue"),
    ("5000", "Cost of Sales - Coffee Beans & Tea", "Cost of Sales"),
    ("5010", "Cost of Sales - Dairy", "Cost of Sales"),
    ("5020", "Cost of Sales - Bakery & Food", "Cost of Sales"),
    ("5030", "Packaging", "Cost of Sales"),
    ("6000", "Salaries & Wages", "Expense"),
    ("6010", "EPF / SOCSO / EIS - Employer", "Expense"),
    ("6100", "Rent", "Expense"),
    ("6110", "Electricity & Water", "Expense"),
    ("6120", "Internet & Phone", "Expense"),
    ("6200", "Delivery Platform Commission", "Expense"),
    ("6210", "Card & E-wallet Fees", "Expense"),
    ("6220", "Bank Charges", "Expense"),
    ("6300", "Repairs & Maintenance", "Expense"),
    ("6310", "Cleaning & Supplies", "Expense"),
    ("6400", "Marketing", "Expense"),
    ("6500", "Software Subscriptions", "Expense"),
    ("6600", "Professional Fees", "Expense"),
    ("6700", "Depreciation", "Expense"),
    ("6800", "Loan Interest", "Expense"),
    ("9999", "Suspense", "Suspense"),
]

# vendor -> (account, spelling variants, typical amount range, frequency per month)
VENDORS = {
    "Biji Kopi Roasters": ("5000", ["Biji Kopi Roasters", "BIJI KOPI ROASTERS SDN BHD", "Biji Kopi Roaster"], (1800, 3200), 6),
    "Farm Fresh Dairy": ("5010", ["Farm Fresh Dairy", "FARMFRESH DAIRY", "Farm Fresh"], (600, 1400), 9),
    "Roti Emas Bakery": ("5020", ["Roti Emas Bakery", "ROTI EMAS", "Roti Emas Bakery Sdn Bhd"], (400, 950), 10),
    "PackRight Supplies": ("5030", ["PackRight Supplies", "PACKRIGHT"], (300, 800), 3),
    "Grab Food": ("6200", ["Grab Food", "GRAB*FOOD 8812", "Grab Food MY", "GRABFOOD"], (900, 1900), 5),
    "foodpanda": ("6200", ["foodpanda", "FOODPANDA MALAYSIA", "Food Panda"], (500, 1200), 4),
    "TNB": ("6110", ["TNB", "TENAGA NASIONAL BHD"], (2100, 2600), 1),
    "Air Selangor": ("6110", ["Air Selangor", "AIR SELANGOR SDN BHD"], (180, 320), 1),
    "TM Unifi": ("6120", ["TM Unifi", "UNIFI BIZ"], (219, 219), 1),
    "Bersih Clean Services": ("6310", ["Bersih Clean Services", "BERSIH CLEAN SVC"], (450, 450), 2),
    "Meta Ads": ("6400", ["Meta Ads", "FACEBK ADS", "META PLATFORMS"], (300, 700), 3),
    "Kiraan Cloud POS": ("6500", ["Kiraan Cloud POS", "KIRAAN POS"], (189, 189), 1),
    "Sejuk Aircond Repair": ("6300", ["Sejuk Aircond Repair", "SEJUK AIRCOND"], (350, 900), 1),
}

MARCH = [date(2026, 3, d) for d in range(1, 32)]


def money(lo, hi):
    return round(rnd.uniform(lo, hi), 2)


# ---------------------------------------------------------------- Module 1: messy ledger
rows = []
ref_n = 3001
for vendor, (acct, variants, (lo, hi), freq) in VENDORS.items():
    days = sorted(rnd.sample(range(1, 32), freq))
    for d in days:
        rows.append({
            "date": date(2026, 3, d),
            "ref": f"PV{ref_n}",
            "desc": rnd.choice(variants),
            "vendor": vendor,
            "acct": acct,
            "debit": money(lo, hi) if lo != hi else float(lo),
            "credit": 0.0,
        })
        ref_n += 1
# fixed monthly items
rows += [
    {"date": date(2026, 3, 1), "ref": "PV2990", "desc": "RENT MAR - SS2 OUTLET", "vendor": "Teguh Properties", "acct": "6100", "debit": 8500.0, "credit": 0.0},
    {"date": date(2026, 3, 1), "ref": "PV2991", "desc": "RENT MAR - DAMANSARA OUTLET", "vendor": "Teguh Properties", "acct": "6100", "debit": 7200.0, "credit": 0.0},
    {"date": date(2026, 3, 27), "ref": "PY0326", "desc": "SALARIES MARCH", "vendor": "Payroll", "acct": "6000", "debit": 38650.0, "credit": 0.0},
    {"date": date(2026, 3, 27), "ref": "PY0327", "desc": "EPF SOCSO EIS EMPLOYER MAR", "vendor": "Payroll", "acct": "6010", "debit": 5124.5, "credit": 0.0},
]
# daily sales (credits)
for d in MARCH:
    rows.append({"date": d, "ref": f"SR{d:%m%d}A", "desc": "POS DAILY SALES - DINE IN", "vendor": "POS", "acct": "4000",
                 "debit": 0.0, "credit": money(2300, 3700) * (1.25 if d.weekday() >= 5 else 1)})
for d in [MARCH[i] for i in range(2, 31, 7)]:
    rows.append({"date": d, "ref": f"SR{d:%m%d}G", "desc": "GRAB FOOD PAYOUT", "vendor": "Grab Food", "acct": "4010", "debit": 0.0, "credit": money(3800, 5200)})
    rows.append({"date": d, "ref": f"SR{d:%m%d}F", "desc": "FOODPANDA PAYOUT", "vendor": "foodpanda", "acct": "4010", "debit": 0.0, "credit": money(1900, 2900)})
rows.append({"date": date(2026, 3, 18), "ref": "INV0412", "desc": "CATERING - SYARIKAT MAJU CORPORATE EVENT", "vendor": "Syarikat Maju", "acct": "4020", "debit": 0.0, "credit": 6800.0})

for r in rows:
    r["credit"] = round(r["credit"], 2)
rows.sort(key=lambda r: (r["date"], r["ref"]))

# --- plant issues
clean_rows = [dict(r) for r in rows]
issues = {"duplicates": [], "missing_account": [], "missing_ref": [], "odd": []}

# 6 duplicates: copy existing expense rows (same date, ref, amount)
exp_rows = [r for r in rows if r["debit"] > 0 and r["vendor"] not in ("Payroll",)]
for r in rnd.sample(exp_rows, 6):
    dup = dict(r)
    dup["dup"] = True
    rows.append(dup)
    issues["duplicates"].append((r["ref"], r["debit"]))
# 14 rows with blank account
cands = [r for r in rows if not r.get("dup") and r["debit"] > 0 and r["acct"] not in ("6100", "6000", "6010")]
for r in rnd.sample(cands, 14):
    r["blank_acct"] = True
    issues["missing_account"].append(r["ref"])
# 3 missing refs
for r in rnd.sample([r for r in rows if not r.get("dup") and not r.get("blank_acct") and r["debit"] > 0], 3):
    issues["missing_ref"].append((r["desc"], r["debit"]))
    r["ref"] = ""
# odd entries: round-sum cash withdrawal on a Sunday with vague description, and a personal-looking item
rows.append({"date": date(2026, 3, 15), "ref": "PV3999", "desc": "CASH WITHDRAWAL", "vendor": "?", "acct": "9999", "debit": 5000.0, "credit": 0.0, "odd": True})
rows.append({"date": date(2026, 3, 22), "ref": "PV4000", "desc": "LAZADA - HOME AIR FRYER", "vendor": "Lazada", "acct": "6310", "debit": 459.0, "credit": 0.0, "odd": True})
issues["odd"] = ["PV3999 RM5,000 round-sum cash withdrawal on a Sunday posted to Suspense",
                 "PV4000 RM459 home air fryer - possible personal expense"]
rows.sort(key=lambda r: (r["date"], r["ref"] or "zz"))

wb = Workbook()
ws = wb.active
ws.title = "GL Export March 2026"
data = []
for r in rows:
    data.append([r["date"], r["ref"] or None, r["desc"], None if r.get("blank_acct") else r["acct"],
                 r["debit"] or None, r["credit"] or None])
write_sheet(ws, ["Date", "Reference", "Description", "Account", "Debit (RM)", "Credit (RM)"], data,
            widths={"Description": 44, "Date": 12}, money_cols=("Debit (RM)", "Credit (RM)"))
for row in ws.iter_rows(min_row=2, min_col=1, max_col=1):
    row[0].number_format = "dd/mm/yyyy"
wb.save(OUT / "M1_ledger_march_messy.xlsx")

wb = Workbook()
ws = wb.active
ws.title = "Chart of Accounts"
write_sheet(ws, ["Code", "Account name", "Type"], COA, widths={"Account name": 42})
wb.save(OUT / "M1_chart_of_accounts.xlsx")

variant_count = len({r["desc"] for r in rows if r["vendor"] in VENDORS and r["debit"] > 0})
facts = {
    "ledger_rows": len(rows),
    "duplicates": len(issues["duplicates"]),
    "duplicate_value": round(sum(a for _, a in issues["duplicates"]), 2),
    "missing_account": len(issues["missing_account"]),
    "missing_ref": len(issues["missing_ref"]),
    "odd": issues["odd"],
    "vendors": len(VENDORS),
    "vendor_spellings": variant_count,
    "total_debits_messy": round(sum(r["debit"] for r in rows), 2),
    "total_credits": round(sum(r["credit"] for r in rows), 2),
    "total_debits_after_dup_removal": round(sum(r["debit"] for r in rows if not r.get("dup")), 2),
}

# ---------------------------------------------------------------- Module 2: bank rec
opening_bank = 84250.00
cash_rows = [r for r in clean_rows]  # cashbook = clean ledger cash movements
cashbook = []
bal = opening_bank
for r in sorted(cash_rows, key=lambda r: (r["date"], r["ref"])):
    amt_in, amt_out = r["credit"], r["debit"]
    bal = round(bal + amt_in - amt_out, 2)
    cashbook.append([r["date"], r["ref"], r["desc"], amt_in or None, amt_out or None, bal])
cb_close = bal

# bank statement: same items, but with timing differences, bank charges, and one error
bank = []
unpresented = [r for r in cash_rows if r["debit"] > 0 and r["date"] >= date(2026, 3, 29)][:2]
unpresented.append(next(r for r in cash_rows if r["vendor"] == "Sejuk Aircond Repair"))
in_transit = [r for r in cash_rows if r["ref"] == "SR0331A"]
bank_only = [
    (date(2026, 3, 31), "BANK SERVICE CHARGE", 0, 45.00),
    (date(2026, 3, 31), "MERCHANT CARD FEES MAR", 0, 612.40),
    (date(2026, 3, 25), "INTEREST CREDIT", 18.20, 0),
]
transposed = next(r for r in cash_rows if r["vendor"] == "Roti Emas Bakery")
b = opening_bank
items = []
for r in cash_rows:
    if r in unpresented or r in in_transit:
        continue
    lag = 0 if r["credit"] else rnd.choice([0, 1, 1, 2])
    d = min(r["date"] + timedelta(days=lag), date(2026, 3, 31))
    amt_out = r["debit"]
    if r is transposed:  # cashbook recorded wrong: bank shows true amount
        pass
    items.append((d, r["desc"][:30].upper(), r["credit"], amt_out))
items += bank_only
items.sort(key=lambda x: x[0])
for d, desc, i, o in items:
    b = round(b + i - o, 2)
    bank.append([d, desc, i or None, o or None, b])
bank_close = b

# transposition error in cashbook: alter the cashbook amount of one bakery payment
true_amt = transposed["debit"]
s = f"{true_amt:.2f}"
digits = s.replace(".", "")
swapped = digits[:-4] + digits[-3] + digits[-4] + digits[-2:]
wrong_amt = int(swapped) / 100
for row in cashbook:
    if row[1] == transposed["ref"]:
        row[4] = wrong_amt
bal = opening_bank
for row in cashbook:
    bal = round(bal + (row[3] or 0) - (row[4] or 0), 2)
    row[5] = bal
cb_close = bal

wb = Workbook()
ws = wb.active
ws.title = "Bank Statement Mar 2026"
write_sheet(ws, ["Date", "Description", "Credit (RM)", "Debit (RM)", "Balance (RM)"], bank,
            widths={"Description": 34}, money_cols=("Credit (RM)", "Debit (RM)", "Balance (RM)"))
wb.save(OUT / "M2_bank_statement_march.xlsx")
wb = Workbook()
ws = wb.active
ws.title = "Cashbook Mar 2026"
write_sheet(ws, ["Date", "Reference", "Description", "Receipts (RM)", "Payments (RM)", "Balance (RM)"], cashbook,
            widths={"Description": 44}, money_cols=("Receipts (RM)", "Payments (RM)", "Balance (RM)"))
wb.save(OUT / "M2_cashbook_march.xlsx")

facts["bank_rec"] = {
    "opening": opening_bank, "bank_close": bank_close, "cashbook_close": cb_close,
    "unpresented": [(r["ref"], r["debit"]) for r in unpresented],
    "in_transit": [(r["ref"], r["credit"]) for r in in_transit],
    "bank_only": [(d, x, i, o) for d, x, i, o in bank_only],
    "transposition": {"ref": transposed["ref"], "true": true_amt, "cashbook": wrong_amt},
}

# accruals & prepayments
wb = Workbook()
ws = wb.active
ws.title = "Accruals & Prepayments"
ap = [
    ["Electricity March (TNB) - bill arrives mid April", "Accrual", 2350.00, "6110", "Estimate from Feb bill + 4%"],
    ["Accounting fee Q1 - invoice in April", "Accrual", 3000.00, "6600", "Engagement letter RM12,000 p.a."],
    ["Casual staff overtime 28-31 March", "Accrual", 1180.00, "6000", "Timesheets approved 1 April"],
    ["Insurance policy paid Jan, 12 months", "Prepayment release", 4800.00, "6310", "RM4,800 / 12 = RM400 per month"],
    ["Pest control contract paid March for Apr-Jun", "Prepayment", 1350.00, "6310", "Paid in March, covers next 3 months"],
    ["POS annual licence paid Feb, 12 months", "Prepayment release", 2268.00, "6500", "RM2,268 / 12 = RM189 per month"],
]
write_sheet(ws, ["Item", "Type", "Amount (RM)", "Expense account", "Notes"], ap,
            widths={"Item": 48, "Notes": 40, "Type": 20}, money_cols=("Amount (RM)",))
wb.save(OUT / "M2_accruals_prepayments.xlsx")

# ---------------------------------------------------------------- Module 3: TB and budget
def acct_total(code, side):
    return round(sum(r[side] for r in clean_rows if r["acct"] == code), 2)

pl = {}
for code, name, typ in COA:
    if typ == "Revenue":
        pl[code] = acct_total(code, "credit")
    elif typ in ("Expense", "Cost of Sales"):
        pl[code] = acct_total(code, "debit")
# month-end adjustments
pl["6110"] += 2350
pl["6600"] += 3000
pl["6000"] += 1180
pl["6310"] += 400
pl["6500"] += 189
pl["6210"] = pl.get("6210", 0) + 612.40
pl["6220"] = pl.get("6220", 0) + 45
pl["6700"] = 1850.00
pl["6800"] = 920.00
pl["4900"] = 18.20
pl = {k: round(v, 2) for k, v in pl.items()}
rev = sum(v for k, v in pl.items() if k.startswith("4"))
exp = sum(v for k, v in pl.items() if not k.startswith("4"))
profit = round(rev - exp, 2)

adj_bank = round(bank_close - sum(a for _, a in facts["bank_rec"]["unpresented"]) + sum(a for _, a in facts["bank_rec"]["in_transit"]), 2)
facts["bank_rec"]["adjusted_balance"] = adj_bank
bs = {"1000": adj_bank, "1010": 800.00, "1100": 6800.00, "1200": 14320.00, "1300": 1350 + 3600 + 1701,
      "1310": 31400.00, "1500": 128000.00, "1510": -38850.00,
      "2000": -18640.00, "2100": -(2350 + 3000 + 1180), "2200": -5210.00, "2300": -9460.00, "2500": -95000.00,
      "3000": -100000.00}
bs_total = round(sum(bs.values()), 2)
bs["3100"] = round(-(bs_total - profit) , 2)  # retained earnings b/f balancing figure
tb = []
names = {c: n for c, n, _ in COA}
for code, name, typ in COA:
    if code in pl:
        v = pl[code]
        v = -v if code.startswith("4") else v
    elif code in bs:
        v = bs[code]
    else:
        continue
    if v == 0:
        continue
    tb.append([code, name, v if v > 0 else None, -v if v < 0 else None])
td = round(sum(r[2] or 0 for r in tb), 2)
tc = round(sum(r[3] or 0 for r in tb), 2)
wb = Workbook()
ws = wb.active
ws.title = "Trial Balance 31 Mar 2026"
write_sheet(ws, ["Code", "Account", "Debit (RM)", "Credit (RM)"], tb, widths={"Account": 42},
            money_cols=("Debit (RM)", "Credit (RM)"))
ws.append(["", "TOTAL", td, tc])
for c in ws[ws.max_row]:
    c.font = Font(bold=True)
    c.number_format = "#,##0.00"
wb.save(OUT / "M3_trial_balance_march.xlsx")

budget = {"4000": 105000, "4010": 36000, "4020": 4000, "5000": 15500, "5010": 9800, "5020": 6500, "5030": 1600,
          "6000": 39500, "6010": 5200, "6100": 15700, "6110": 4800, "6120": 219, "6200": 10500, "6210": 650,
          "6220": 50, "6300": 400, "6310": 1400, "6400": 2000, "6500": 380, "6600": 3000, "6700": 1850, "6800": 920}
bva = []
for code, bud in budget.items():
    act = pl.get(code, 0)
    var = act - bud if code.startswith("4") else bud - act
    bva.append([code, names[code], bud, act, round(var, 2), round(var / bud, 4) if bud else None])
wb = Workbook()
ws = wb.active
ws.title = "Budget vs Actual Mar 2026"
write_sheet(ws, ["Code", "Account", "Budget (RM)", "Actual (RM)", "Variance (RM) +fav/-adv", "Variance %"], bva,
            widths={"Account": 40, "Variance (RM) +fav/-adv": 24}, money_cols=("Budget (RM)", "Actual (RM)", "Variance (RM) +fav/-adv"))
for row in ws.iter_rows(min_row=2, min_col=6, max_col=6):
    row[0].number_format = "0.0%"
wb.save(OUT / "M3_budget_vs_actual.xlsx")
facts["tb"] = {"debits": td, "credits": tc, "revenue": round(rev, 2), "expenses": round(exp, 2), "profit": profit}

# ---------------------------------------------------------------- Module 4: capstone April pack
wb = Workbook()
ws = wb.active
ws.title = "README"
for line in [
    "KOPI MESRA SDN BHD - CAPSTONE PACK - APRIL 2026 (fictional company for practice)",
    "",
    "Your task: close April 2026 from raw data to management report.",
    "1. Clean the 'GL Export Apr' sheet (duplicates, vendor names, missing accounts, odd items).",
    "2. Reconcile 'Bank Apr' to the cleaned cash movements. Opening bank balance = March closing bank balance.",
    "3. Post accruals and prepayment releases from 'Month-end info'.",
    "4. Prepare the TB, P&L, balance sheet movement and budget vs actual vs 'Budget Apr'.",
    "5. Write a one-page report and a close memo. Use the Workbook 4 checklist.",
]:
    ws.append([line])
ws.column_dimensions["A"].width = 100
ws["A1"].font = Font(bold=True, color=TEAL, size=13)

rnd2 = random.Random(4)
apr_rows = []
ref_n = 5001
for vendor, (acct, variants, (lo, hi), freq) in VENDORS.items():
    for d in sorted(rnd2.sample(range(1, 31), freq)):
        apr_rows.append([date(2026, 4, d), f"PV{ref_n}", rnd2.choice(variants), acct, round(rnd2.uniform(lo, hi), 2) if lo != hi else float(lo), None])
        ref_n += 1
apr_rows += [[date(2026, 4, 1), "PV4990", "RENT APR - SS2 OUTLET", "6100", 8500.0, None],
             [date(2026, 4, 1), "PV4991", "RENT APR - DAMANSARA OUTLET", "6100", 7200.0, None],
             [date(2026, 4, 27), "PY0426", "SALARIES APRIL", "6000", 39880.0, None],
             [date(2026, 4, 27), "PY0427", "EPF SOCSO EIS EMPLOYER APR", "6010", 5287.9, None]]
for d in range(1, 31):
    dt = date(2026, 4, d)
    apr_rows.append([dt, f"SR04{d:02d}A", "POS DAILY SALES - DINE IN", "4000", None, round(rnd2.uniform(2400, 3900) * (1.25 if dt.weekday() >= 5 else 1), 2)])
for d in (2, 9, 16, 23, 30):
    apr_rows.append([date(2026, 4, d), f"SR04{d:02d}G", "GRAB FOOD PAYOUT", "4010", None, round(rnd2.uniform(4000, 5400), 2)])
    apr_rows.append([date(2026, 4, d), f"SR04{d:02d}F", "FOODPANDA PAYOUT", "4010", None, round(rnd2.uniform(2000, 3000), 2)])
for r in rnd2.sample([r for r in apr_rows if r[4]], 4):
    apr_rows.append(list(r))
for r in rnd2.sample([r for r in apr_rows if r[4]], 10):
    r[3] = None
apr_rows.append([date(2026, 4, 12), "PV5999", "TRANSFER TO DIRECTOR", "9999", 3000.0, None])
apr_rows.sort(key=lambda r: (r[0], r[1]))
ws = wb.create_sheet("GL Export Apr")
write_sheet(ws, ["Date", "Reference", "Description", "Account", "Debit (RM)", "Credit (RM)"], apr_rows,
            widths={"Description": 44}, money_cols=("Debit (RM)", "Credit (RM)"))
seen, apr_bank, bb = set(), [], round(bank_close, 2)
apr_items = []
for r in apr_rows:
    key = (r[0], r[1], r[4], r[5])
    if key in seen or r[1] == "PV5999":
        continue
    seen.add(key)
    if r[0] >= date(2026, 4, 29) and r[4]:
        continue  # unpresented at month end
    apr_items.append((min(r[0] + timedelta(days=rnd2.choice([0, 1, 2]) if r[4] else 0), date(2026, 4, 30)), r[2][:30].upper(), r[5] or 0, r[4] or 0))
apr_items += [(date(2026, 4, 12), "IBG TRF - DIRECTOR", 0, 3000.0), (date(2026, 4, 30), "BANK SERVICE CHARGE", 0, 45.0),
              (date(2026, 4, 30), "MERCHANT CARD FEES APR", 0, 640.15)]
# March reconciling items clear in April
for ref, amt in facts["bank_rec"]["unpresented"]:
    apr_items.append((date(2026, 4, 2), f"CHQ CLEARED {ref}", 0, amt))
for ref, amt in facts["bank_rec"]["in_transit"]:
    apr_items.append((date(2026, 4, 1), f"DEPOSIT {ref}", amt, 0))
apr_items.sort(key=lambda x: x[0])
for d, desc, i, o in apr_items:
    bb = round(bb + i - o, 2)
    apr_bank.append([d, desc, i or None, o or None, bb])
ws = wb.create_sheet("Bank Apr")
write_sheet(ws, ["Date", "Description", "Credit (RM)", "Debit (RM)", "Balance (RM)"], apr_bank,
            widths={"Description": 34}, money_cols=("Credit (RM)", "Debit (RM)", "Balance (RM)"))
ws = wb.create_sheet("Month-end info")
write_sheet(ws, ["Item", "Type", "Amount (RM)", "Account", "Notes"], [
    ["Electricity April - bill arrives mid May", "Accrual", 2420.00, "6110", "Estimate"],
    ["Accounting fee - monthly share", "Accrual", 1000.00, "6600", "RM12,000 p.a."],
    ["Insurance release", "Prepayment release", 400.00, "6310", "RM4,800 / 12"],
    ["Pest control release (paid March for Apr-Jun)", "Prepayment release", 450.00, "6310", "RM1,350 / 3"],
    ["POS licence release", "Prepayment release", 189.00, "6500", "RM2,268 / 12"],
    ["Depreciation", "Journal", 1850.00, "6700", "Straight line"],
    ["Loan interest", "Journal", 905.00, "6800", "Per bank loan statement"],
], widths={"Item": 46, "Notes": 30, "Type": 20}, money_cols=("Amount (RM)",))
ws = wb.create_sheet("Budget Apr")
write_sheet(ws, ["Code", "Account", "Budget (RM)"], [[c, names[c], v] for c, v in budget.items()],
            widths={"Account": 40}, money_cols=("Budget (RM)",))
wb.save(OUT / "M4_capstone_april_pack.xlsx")

(OUT / "_facts.json").write_text(json.dumps(facts, indent=2, default=str))
print(json.dumps(facts, indent=2, default=str))
