"""Module 1, Lesson 1.1 - Clean a messy ledger in 10 minutes (sample lesson).

Run from repo root:
  VOICE_MODEL=/path/en-us-libritts-high.onnx python3 course/src/video/lesson_1_1.py <work_dir>
"""
import sys
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).parent))
import engine  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
TITLE = "Clean a messy ledger in 10 minutes"

ws = openpyxl.load_workbook(ROOT / "04-datasets" / "M1_ledger_march_messy.xlsx").active
LEDGER = {i: r for i, r in enumerate(ws.iter_rows(min_row=2, values_only=True), 2)}

TICK = '<div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'


def money(v):
    return "" if v is None else f"{v:,.2f}"


def sheet(rows, marks, title="M1_ledger_march_messy.xlsx", fx_rows=None):
    """marks: {(row, col): (cls, cue, offset)}; col index 0..5"""
    h = [f'<div class="card sheet"><div class="bar"><span class="x">X</span>{title}</div><table>',
         "<tr><th></th><th>Date</th><th>Ref</th><th>Description</th><th>Acct</th><th>Debit</th><th>Credit</th></tr>"]
    for rn in rows:
        d, ref, desc, acct, dr, cr = LEDGER[rn]
        cells = [d.strftime("%d/%m"), ref or "", desc, acct or "", money(dr), money(cr)]
        tr = f'<tr {fx_rows[rn]}>' if fx_rows and rn in fx_rows else "<tr>"
        h.append(tr + f'<td class="rn">{rn}</td>')
        for ci, c in enumerate(cells):
            cls = "n" if ci >= 4 else ""
            if (rn, ci) in marks:
                mc, cue, off = marks[(rn, ci)]
                h.append(f'<td class="{cls}"><span class="mark {mc}" data-fx="mark" data-c="{cue}" data-o="{off}" data-d="0.5">&nbsp;{c or "&nbsp;?&nbsp;"}&nbsp;</span></td>')
            else:
                h.append(f'<td class="{cls}">{c}</td>')
        h.append("</tr>")
    h.append("</table></div>")
    return "".join(h)


def step_header(n, title, cue=0):
    return (f'<div data-fx="left" data-c="{cue}" data-o="-0.2"><span class="step"><b>{n}</b>Step {n} of 5</span></div>'
            f'<div class="h2" style="margin-top:22px" data-fx="up" data-c="{cue}" data-o="0">{title}</div>')


SCENES = []

# ------------------------------------------------------------------ 0 intro
SCENES.append({
    "id": "00_intro", "cls": "dark", "captions": True, "pre": 1.6, "post": 1.4, "min": 6.5,
    "lines": [("Module 1, Lesson 1. Clean a messy ledger in 10 minutes.",
               "Module one, lesson one. Clean a messy ledger in ten minutes.")],
    "html": f"""
<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 170px">
  <div style="display:flex;align-items:center;gap:22px" data-fx="pop" data-c="0" data-o="-1.4" data-d="0.8">
    <div style="width:74px;height:74px;border-radius:20px;background:var(--amber);transform:rotate(45deg);display:grid;place-items:center">
      <div style="width:30px;height:30px;border-radius:8px;background:var(--deep)"></div></div>
    <div style="font:700 40px Inter;color:#fff;letter-spacing:.01em;margin-left:16px">BrightLedger Academy</div>
  </div>
  <div style="font:700 30px Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--amber);margin-top:90px" data-fx="up" data-c="0" data-o="-0.9">AI for Accountants &nbsp;·&nbsp; Module 1 &nbsp;·&nbsp; Lesson 1</div>
  <div style="font:800 128px/1 'Inter Display';letter-spacing:-.03em;color:#fff;margin-top:26px;max-width:1500px" data-fx="up" data-c="0" data-o="-0.6" data-d="0.8">Clean a messy ledger<br><span style="color:var(--amber)">in 10 minutes</span></div>
  <div style="height:6px;background:var(--amber);border-radius:3px;margin-top:56px;width:calc(560px * var(--p,0))" data-fx="bar" data-c="0" data-o="-0.2" data-d="1.4"></div>
</div>""",
})

# ------------------------------------------------------------------ 1 hook
hook_rows = [4, 5, 6, 7, 8, 9, 11, 15, 16, 17, 18, 19]
hook_marks = {
    (5, 3): ("amberm", 2, 1.7), (19, 3): ("amberm", 2, 1.9),          # blank account
    (4, 2): ("amberm", 2, 0.4), (11, 2): ("amberm", 2, 0.6), (17, 2): ("amberm", 2, 0.8), (18, 2): ("amberm", 2, 1.0),  # spellings
    (7, 4): ("", 2, 3.4), (8, 4): ("", 2, 3.6), (15, 4): ("", 2, 3.8), (16, 4): ("", 2, 4.0),  # duplicates
}
SCENES.append({
    "id": "01_hook",
    "lines": [
        "It's the first working day of April.",
        ("Kopi Mesra, a two-outlet café, has just sent you their March ledger export.",
         "Kopi Mesra, a two outlet cafe, has just sent you their March ledger export."),
        "101 rows. Vendor names spelled three different ways. Blank account codes. And somewhere in there, a few transactions posted twice.",
        "Cleaning this by hand could take you an afternoon.",
        "In this lesson, we'll do it with Claude in about 10 minutes, and we'll check every number along the way.",
    ],
    "html": f"""
<div class="row" style="align-items:flex-start;gap:56px">
  <div style="width:1110px" data-fx="up" data-c="1" data-o="-0.2" data-d="0.8">{sheet(hook_rows, hook_marks)}</div>
  <div class="col" style="flex:1;gap:26px;padding-top:10px">
    <div class="kicker" data-fx="fade" data-c="0">1 April, 9:02 am</div>
    <div class="h2" style="font-size:58px" data-fx="up" data-c="0" data-o="0.2">New email from Kopi Mesra</div>
    <div class="col" style="gap:14px;margin-top:6px">
      <div data-fx="right" data-c="2" data-o="0.2"><span class="pill amber">25 spellings of 13 vendors</span></div>
      <div data-fx="right" data-c="2" data-o="1.6"><span class="pill amber">Blank account codes</span></div>
      <div data-fx="right" data-c="2" data-o="3.3"><span class="pill red">Posted twice?</span></div>
    </div>
    <div class="card" style="padding:26px 30px;margin-top:20px;display:flex;align-items:center;gap:26px" data-fx="up" data-c="3">
      <div style="font:800 64px 'Inter Display';color:var(--coral)"><span class="strike" data-fx="strike" data-c="4" data-o="0.4" data-d="0.5">4 hrs</span></div>
      <div style="font:800 64px 'Inter Display';color:var(--green)" data-fx="pop" data-c="4" data-o="0.9">10 min</div>
    </div>
  </div>
</div>""",
})

# ------------------------------------------------------------------ 2 objectives
objs = ["Upload a ledger and get a clear list of issues, without changing anything yet",
        "Check Claude's findings by tying out the totals",
        "Ask for a clean, categorised file you can review and use"]
cards = "".join(
    f'<div class="card" style="flex:1;padding:44px 40px;min-height:420px" data-fx="up" data-c="{i+1}" data-o="-0.1">'
    f'<div style="font:800 96px \'Inter Display\';color:var(--amber);line-height:1">0{i+1}</div>'
    f'<div style="font:600 38px/1.35 Inter;margin-top:30px;color:var(--ink)">{o}</div></div>' for i, o in enumerate(objs))
SCENES.append({
    "id": "02_objectives",
    "lines": [
        "By the end of this lesson, you'll be able to do three things.",
        "Upload a ledger and get a clear list of issues, without Claude changing anything yet.",
        "Check Claude's findings by tying out the totals.",
        "And ask for a clean, categorised file you can review and use.",
    ],
    "html": f"""
<div class="kicker" data-fx="fade" data-c="0">What you'll learn</div>
<div class="h2" style="margin-top:18px" data-fx="up" data-c="0" data-o="0.1">By the end of this lesson, you can:</div>
<div class="row" style="margin-top:64px;gap:36px">{cards}</div>""",
})

# ------------------------------------------------------------------ 3 step 1 prepare
checks = [("Check your firm's AI policy", 1), ("Remove data you don't need: names, IC numbers, bank account numbers", 2),
          ("Practise with the fictional Kopi Mesra file", 3)]
chk = "".join(f'<div class="row" style="gap:24px;align-items:center" data-fx="left" data-c="{c}">{TICK}'
              f'<div style="font:600 38px/1.3 Inter">{t}</div></div>' for t, c in checks)
SCENES.append({
    "id": "03_prepare",
    "lines": [
        "Step one. Prepare the file safely.",
        "Before you upload anything, check your firm's policy on using AI tools.",
        "Remove anything you don't need, like customer names, IC numbers, or bank account numbers.",
        "For this course, you'll use the Kopi Mesra practice file. It's a fictional company, so it's safe to upload.",
        "Download it from the lesson resources. It's called M1 ledger March messy.",
    ],
    "html": f"""
{step_header(1, "Prepare the file safely")}
<div class="row" style="margin-top:70px;gap:80px;align-items:center">
  <div class="col" style="gap:40px;flex:1.3">{chk}</div>
  <div class="card" style="flex:.8;padding:44px;display:flex;flex-direction:column;align-items:center;gap:26px" data-fx="pop" data-c="4">
    <div style="width:130px;height:156px;border-radius:16px;background:#1F7A4D;display:grid;place-items:center;font:800 54px Inter;color:#fff;box-shadow:12px 12px 0 #CFE3D8">X</div>
    <div class="mono" style="font-size:28px;font-weight:600;color:var(--teal);text-align:center">M1_ledger_march_messy.xlsx</div>
    <span class="pill green">Practice data · safe to upload</span>
  </div>
</div>""",
})

# ------------------------------------------------------------------ 4 step 2 first prompt
P1 = "I'm the accountant for Kopi Mesra Sdn Bhd, a café. The attached file is their March 2026 general ledger export."
P2 = " Review it and list every issue you find: duplicate entries, missing account codes, missing references, inconsistent vendor names, and anything unusual."
P3 = " Don't change the data yet."
P4 = " Show the results as a table: row, reference, issue, suggested fix. Finish with total debits and total credits, and tell me anything you're unsure about."
SCENES.append({
    "id": "04_prompt",
    "lines": [
        "Step two. Upload the file and give Claude a clear first instruction.",
        "Open Claude, attach the spreadsheet, and type a prompt like this.",
        "First, the background: who you are, and what the file is.",
        "Then the request: find the problems, and name the kinds of problems you care about.",
        "And one important rule: don't change anything yet. We want a list first, so we stay in control.",
        "Now look at the last part. We ask for the totals, and for anything Claude is unsure about. That's the fact-check habit, and you'll use it in every lesson.",
    ],
    "html": f"""
<div class="row" style="gap:70px">
  <div class="col" style="width:560px;flex:none">
    {step_header(2, "Upload and ask for an issues list")}
    <div class="col" style="gap:20px;margin-top:56px">
      <div data-fx="left" data-c="2"><span class="pill grey" style="font-size:24px">① Background</span></div>
      <div data-fx="left" data-c="3"><span class="pill amber" style="font-size:24px">② Request</span></div>
      <div data-fx="left" data-c="4"><span class="pill red" style="font-size:24px">③ Rule: don't change yet</span></div>
      <div data-fx="left" data-c="5"><span class="pill green" style="font-size:24px">④ Output + fact-check</span></div>
    </div>
  </div>
  <div class="card chat" style="flex:1;align-self:flex-start" data-fx="up" data-c="1" data-o="-0.3">
    <div class="top"><span class="spark"></span>Claude<span class="tag">New chat</span></div>
    <div class="body">
      <div class="attach" data-fx="pop" data-c="1" data-o="1.2"><span class="ic">XLS</span>M1_ledger_march_messy.xlsx</div>
      <div class="prompt"><span class="seg" data-fx="type" data-c="2" data-o="-0.3" data-d="2.6">{P1}</span><span class="seg" data-fx="type" data-c="3" data-o="-0.2" data-d="3.6">{P2}</span><span class="seg" style="background:var(--coral-soft);font-weight:700" data-fx="type" data-c="4" data-o="0.6" data-d="0.8">{P3}</span><span class="seg" data-fx="type" data-c="5" data-o="-0.2" data-d="3.6">{P4}</span></div>
    </div>
  </div>
</div>""",
})

# ------------------------------------------------------------------ 5 step 3 issues
issues = [
    ("Possible duplicates", 6, "worth RM 7,133.13", "red", 2),
    ("Rows with no account code", 14, "need a GL account", "amber", 3),
    ("Payments with no reference", 3, "check source documents", "amber", 4),
    ("Spellings for 13 vendors", 25, "standardise names", "grey", 5),
    ("Unusual items", 2, "RM 5,000 Sunday cash withdrawal · home air fryer", "red", 6),
]
tiles = "".join(
    f'<div class="card" style="padding:26px 34px;display:flex;align-items:center;gap:32px" data-fx="left" data-c="{c}" data-o="-0.1">'
    f'<div class="num" style="width:120px;color:var(--{"coral" if col == "red" else "teal"})" data-fx="count" data-to="{n}" data-c="{c}" data-d="0.9">0</div>'
    f'<div class="col" style="gap:6px"><div style="font:700 36px Inter">{t}</div><div style="font:500 26px Inter;color:var(--muted)">{s}</div></div></div>'
    for t, n, s, col, c in issues)
SCENES.append({
    "id": "05_issues",
    "lines": [
        "Step three. Read the issues list.",
        "Here's the summary you should get from the practice file. These are the issues we planted for you to find.",
        ("Six possible duplicates, worth RM 7,133.13.", "Six possible duplicates, worth seven thousand, one hundred and thirty three ringgit."),
        "Fourteen rows with no account code.",
        "Three payments with no reference number.",
        "Twenty-five different spellings for just thirteen vendors.",
        ("And two unusual items: a RM 5,000 cash withdrawal on a Sunday, posted to suspense, and a home air fryer that may be a personal expense.",
         "And two unusual items: a five thousand ringgit cash withdrawal on a Sunday, posted to suspense, and a home air fryer that may be a personal expense."),
        "Claude's wording will be different from this, and that's fine. What matters is that you check it.",
    ],
    "html": f"""
<div class="row" style="gap:70px">
  <div class="col" style="width:560px;flex:none">
    {step_header(3, "Read the issues list")}
    <div class="lead" style="margin-top:40px" data-fx="up" data-c="1">What the practice file should show:</div>
    <div class="card" style="margin-top:40px;padding:26px 30px;background:var(--amber-soft);border-color:#F1D39E" data-fx="up" data-c="7">
      <div style="font:700 30px/1.4 Inter;color:#7A4E0C">Wording will differ.<br>Check every item.</div></div>
  </div>
  <div class="col" style="flex:1;gap:18px">{tiles}</div>
</div>""",
})

# ------------------------------------------------------------------ 6 step 4 tie out
SCENES.append({
    "id": "06_tieout",
    "lines": [
        "Step four. Tie out the totals. Never skip this.",
        ("Total debits in the original file: RM 126,078.67.", "Total debits in the original file are one hundred and twenty six thousand and seventy eight ringgit, sixty seven."),
        ("Take out the six duplicates, and debits drop to RM 118,945.54.", "Take out the six duplicates, and debits drop to one hundred and eighteen thousand, nine hundred and forty five ringgit, fifty four."),
        ("The difference is exactly RM 7,133.13, the value of the duplicates. The numbers agree.",
         "The difference is exactly seven thousand, one hundred and thirty three ringgit, thirteen. That's the value of the duplicates, so the numbers agree."),
        "But before you remove anything, check each duplicate against the source document. Two identical rows aren't always a mistake. Sometimes there really were two deliveries.",
    ],
    "html": f"""
{step_header(4, "Tie out the totals")}
<div class="card" style="margin-top:56px;padding:46px 60px" data-fx="up" data-c="1" data-o="-0.3">
  <div class="row" style="align-items:flex-end;gap:46px;font-family:'JetBrains Mono'">
    <div class="col" style="gap:10px"><div class="label">Debits · original</div>
      <div style="font:700 66px 'JetBrains Mono';color:var(--ink)" data-fx="count" data-c="1" data-o="0.3" data-d="1.4" data-to="126078.67" data-dec="2">0</div></div>
    <div style="font:700 66px 'JetBrains Mono';color:var(--muted)" data-fx="fade" data-c="2">−</div>
    <div class="col" style="gap:10px" data-fx="up" data-c="2"><div class="label">6 duplicates</div>
      <div style="font:700 66px 'JetBrains Mono';color:var(--coral)">7,133.13</div></div>
    <div style="font:700 66px 'JetBrains Mono';color:var(--muted)" data-fx="fade" data-c="2" data-o="1.2">=</div>
    <div class="col" style="gap:10px" data-fx="up" data-c="2" data-o="1.4"><div class="label">Debits · after</div>
      <div style="font:700 66px 'JetBrains Mono';color:var(--teal)">118,945.54</div></div>
    <div data-fx="pop" data-c="3" data-o="2.2" style="margin-bottom:10px;transform-origin:center">{TICK.replace('46px', '64px')}</div>
  </div>
</div>
<div class="row" style="margin-top:40px;gap:28px;align-items:center" data-fx="up" data-c="4">
  <span class="pill red" style="font-size:26px;padding:10px 22px;white-space:nowrap">Before deleting</span>
  <div style="font:600 36px/1.35 Inter">Check each duplicate against the invoice or receipt. Two deliveries can look identical.</div>
</div>""",
})

# ------------------------------------------------------------------ 7 step 5 clean file
P5 = ("Thanks. Now create a cleaned version of the file:\n• Use only accounts from the attached chart of accounts\n"
      "• Add a column with the standard vendor name\n• Flag duplicates, don't delete them\n• Don't change any amounts\n"
      "• Add a Status column: OK, Review, or Possible duplicate")
clean = [("01/03", "PV3007", "Farm Fresh Dairy", "5010", "1,143.51", "OK", "green"),
         ("01/03", "PV3016", "Roti Emas Bakery", "5020", "619.33", "OK", "green"),
         ("01/03", "PV3016", "Roti Emas Bakery", "5020", "619.33", "Possible duplicate", "red"),
         ("04/03", "PV3029", "Grab Food", "6200", "1,574.30", "OK", "green"),
         ("04/03", "PV3043", "Meta Ads", "6400", "575.73", "OK", "green"),
         ("12/03", "—", "Roti Emas Bakery", "5020", "633.99", "Review", "amber"),
         ("15/03", "PV3999", "Cash withdrawal", "9999", "5,000.00", "Review", "amber")]
crows = "".join(
    f'<tr data-fx="up" data-c="3" data-o="{0.25 * i:.2f}"><td>{d}</td><td>{r}</td><td><b>{v}</b></td><td>{a}</td><td class="n">{m}</td>'
    f'<td><span class="pill {pc}" style="font-size:18px">{s}</span></td></tr>' for i, (d, r, v, a, m, s, pc) in enumerate(clean))
SCENES.append({
    "id": "07_clean",
    "lines": [
        "Step five. Ask for the clean file.",
        "Once you've checked the list, reply with clear rules, like this.",
        "Use only accounts from the chart of accounts. Standardise the vendor names. Flag duplicates instead of deleting them. And don't change any amounts.",
        "You get back a cleaned spreadsheet, with a standard vendor name, a suggested account, and a status for every row.",
        "Anything Claude isn't sure about is marked for review, so you make the final call.",
    ],
    "html": f"""
<div class="row" style="gap:56px">
  <div class="col" style="width:640px;flex:none">
    {step_header(5, "Ask for the clean file")}
    <div class="card chat" style="margin-top:40px" data-fx="up" data-c="1">
      <div class="body" style="padding:24px 28px"><div class="prompt" style="margin:0;font-size:25px"><span data-fx="type" data-c="1" data-o="0.6" data-d="6">{P5}</span></div></div>
    </div>
  </div>
  <div class="card sheet" style="flex:1;align-self:flex-start;margin-top:8px" data-fx="up" data-c="3" data-o="-0.3">
    <div class="bar"><span class="x">X</span>M1_ledger_march_clean.xlsx</div>
    <table><tr><th>Date</th><th>Ref</th><th>Vendor (std)</th><th>Acct</th><th>Debit</th><th>Status</th></tr>{crows}</table>
  </div>
</div>""",
})

# ------------------------------------------------------------------ 8 recap
steps = ["Prepare safely", "Ask for an issues list", "Tie out totals", "Ask for the clean file"]
tl = "".join(
    f'<div class="col" style="flex:1;gap:18px;align-items:flex-start" data-fx="up" data-c="1" data-o="{0.7 * i:.1f}">'
    f'<div style="width:64px;height:64px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font:800 30px Inter">{i+1}</div>'
    f'<div style="font:700 34px/1.25 Inter">{s}</div></div>' for i, s in enumerate(steps))
SCENES.append({
    "id": "08_recap",
    "lines": [
        "Let's recap.",
        "Prepare your file safely. Ask for an issues list first. Tie out the totals. Then ask for the clean file, with clear rules.",
        "Now it's your turn. Download the practice file, run both prompts, and fill in the tie-out sheet in Workbook 1.",
        "Remember: Claude does the heavy lifting, but you're the accountant. You sign off on the numbers.",
        "In the next lesson, you'll learn the BRIEF method: a simple way to write prompts that work every time.",
    ],
    "html": f"""
<div class="kicker" data-fx="fade" data-c="0">Recap</div>
<div class="row" style="margin-top:34px;gap:30px;position:relative">
  <div style="position:absolute;left:32px;right:200px;top:31px;height:4px;background:var(--line)"></div>
  <div style="position:absolute;left:32px;top:31px;height:4px;background:var(--amber);width:calc(76% * var(--p,0))" data-fx="bar" data-c="1" data-d="2.4"></div>
  {tl}
</div>
<div class="row" style="margin-top:70px;gap:36px">
  <div class="card" style="flex:1.3;padding:38px 42px;background:var(--teal);border:none;color:#fff" data-fx="up" data-c="2">
    <div class="kicker" style="color:var(--amber)">Your turn</div>
    <div style="font:600 34px/1.4 Inter;margin-top:16px">Download the practice file, run both prompts, and complete the tie-out sheet in <b>Workbook 1</b>.</div>
  </div>
  <div class="card" style="flex:1;padding:38px 42px" data-fx="up" data-c="3">
    <div class="kicker">Remember</div>
    <div style="font:700 38px/1.3 Inter;margin-top:16px;color:var(--teal)">Claude drafts.<br>You sign off.</div>
  </div>
</div>
<div style="margin-top:36px;font:600 30px Inter;color:var(--muted)" data-fx="up" data-c="4">Next: <span style="color:var(--teal)">Lesson 1.2 · The BRIEF method</span></div>""",
})

# ------------------------------------------------------------------ 9 outro
SCENES.append({
    "id": "09_outro", "cls": "dark", "pre": 0.4, "post": 0.2, "min": 6.0, "captions": False,
    "lines": [],
    "html": """
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  <div style="width:96px;height:96px;border-radius:26px;background:var(--amber);transform:rotate(45deg);display:grid;place-items:center" data-fx="pop" data-o="0.3" data-d="0.8">
    <div style="width:40px;height:40px;border-radius:10px;background:var(--deep)"></div></div>
  <div style="font:800 76px 'Inter Display';color:#fff;margin-top:60px;letter-spacing:-.02em" data-fx="up" data-o="0.6">BrightLedger Academy</div>
  <div style="font:500 34px Inter;color:#BFD3D6;margin-top:18px" data-fx="up" data-o="0.9">AI for Accountants · Close your books faster with Claude</div>
  <div style="font:600 30px Inter;color:var(--amber);margin-top:60px" data-fx="up" data-o="1.3">Up next: Lesson 1.2 · The BRIEF method</div>
  <div style="position:absolute;bottom:46px;font:400 18px Inter;color:#6E8D92" data-fx="fade" data-o="1.6">Kopi Mesra Sdn Bhd is a fictional company. Voice: Piper TTS, LibriTTS dataset (CC BY 4.0). Music: original. Claude is a product of Anthropic; this course is independent.</div>
</div>""",
})

if __name__ == "__main__":
    work = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/lesson_1_1")
    out, total = engine.build("M1-L1.1_clean-a-messy-ledger", SCENES, ROOT / "02-videos", work)
    print(f"done: {out} ({total:.1f}s)")
