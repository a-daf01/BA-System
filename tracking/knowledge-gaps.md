# Knowledge gaps

**Every question you ask gets logged here.** You do not have to remember to do it —
`scripts/log-question.js` catches the raw prompt on a hook, and Claude Code turns the
raw capture into the entries below.

Two files, two jobs:

- `tracking/questions-log.md` — the raw inbox. Automatic, unsorted, never deleted.
- **this file** — the curated record. What you didn't know, the answer, and whether
  it has stuck yet.

## Status meanings

| Status | Means |
|---|---|
| `open` | Answered once. Not yet revisited. Assume it has not stuck. |
| `queued` | Promoted into `tracking/review-queue.md`. Spaced repetition owns it now. |
| `known` | Recalled correctly at 4–5 confidence on a later review. |

Only `known` items are safe to stop looking at. An `open` item is exposure, not
retention — which is the exact failure this whole system exists to prevent.

---

## 2026-08-12 — Day 1

### Northwind is not one database

**Gap:** Assumed the Microsoft `sql-server-samples` repo was the file to download.
**Answer:** That repo holds `instnwnd.sql`, a SQL Server script. DB Browser for SQLite
cannot open it. The SQLite build is a separate `.db` file from
`jpwhite3/northwind-SQLite3`. Same schema, different engine.
**Why it matters:** Naming the engine, not just the dataset, is basic data-source
literacy. An interviewer asking "what have you queried?" expects you to know which
dialect you were writing.
**Status:** `queued`

### Table names containing spaces

**Gap:** Didn't know `SELECT * FROM Order Details` fails.
**Answer:** A name with a space must be delimited — `[Order Details]` or
`"Order Details"`. Northwind's line-item table is the case you will hit daily.
**Status:** `queued`

### Revenue is derived, not stored

**Gap:** Expected a revenue column.
**Answer:** `UnitPrice * Quantity * (1 - Discount)`, computed per line and summed.
Discount is a fraction, not a percentage.
**Why it matters:** This is the single most common "top N products by revenue"
interview question, and it is testing whether you notice the discount.
**Status:** `queued`

### Power BI has no SQLite connector

**Gap:** Assumed Power BI could open the `.db` directly.
**Answer:** It cannot. Two routes: export CSV from DB Browser (2 min, no install), or
install a third-party SQLite ODBC driver and use Get Data → ODBC. CSV was the right
call for Day 1 — `reference/datasets.md` explicitly says not to lose a day to setup.
**Status:** `queued` — **asked twice on Day 1.** Re-teach candidate at the Day 05
checkpoint if it comes back a third time.

### Aggregating in a Power BI visual

**Gap:** Didn't know how a bar chart counts rows.
**Answer:** Drop a field into the axis, then set its aggregation — `Count` on `OrderID`
grouped by `ShipCountry` gives orders per country. The visual aggregates; you do not
pre-aggregate the data.
**Status:** `queued`

### "Remove errors" in Power Query

**Gap:** Date columns loaded with errors. Clicked Transform → Remove Errors, it went away,
and he wrote down that he has no idea what it did. Flagging that himself is the right
instinct.
**Answer:** Remove Errors **deletes every row** where that column failed to convert. It
does not repair anything. The dates that would not parse are now silently missing from
the dataset, and every count and total downstream is quietly wrong by that many rows.
**What to do instead:** click the error cell to see the actual value first. Usually it is
a format Power BI guessed wrong — fix it with Change Type → Using Locale (`en-GB` for UK
date formats) and the rows come back.
**Why it matters:** "I removed the errors" is a genuinely bad answer in a BA interview.
Knowing how many rows you dropped and why is the job.
**Status:** `queued`

### ROUND is not an alternative to SUM

**Gap:** Read somewhere that "it might be better practice to use ROUND instead of SUM".
**Answer:** They are unrelated. `SUM()` aggregates many rows into one total. `ROUND()`
trims decimal places on a single value. You do not choose between them — you nest them:
`ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2)`.
The advice he half-remembered is about presenting money to 2dp, not about replacing the
aggregate.
**Status:** `queued`

### SELECT TOP 5 is not SQL

**Gap:** Looked up a solution using `SELECT TOP 5`, which failed in DB Browser.
**Answer:** `TOP` is SQL Server syntax. SQLite, Postgres and MySQL use `LIMIT 5` at the
end of the query. His original instinct — LIMIT — was right, and the looked-up answer was
written for a different engine.
**Worth noting:** he diagnosed and fixed this himself without being told. That is the
skill, not the fact.
**Status:** `queued` at interval 3

### What SUM() actually does

**Gap:** Assumed `SUM()` was performing the multiplication in
`SUM(UnitPrice * Quantity * (1 - Discount))`.
**Answer:** The multiplication happens per row, inside the brackets, before SUM sees it.
SUM then collapses all those per-row results into one number per `GROUP BY` group. He
worked this out unprompted mid-dump.
**Status:** `queued` at interval 3

### Translating logic into SQL — the actual method

**Gap:** Named this himself as the blocker: "the maths itself isn't an issue, it's turning
that logic into SQL." Attributed it to ADHD or a personal deficit.
**Answer:** It is neither — it is that **SQL is not written in the order it is read.**
The clauses execute in a different order than they appear, so writing top-to-bottom means
composing in an order the language does not think in.

Build in execution order instead:

| Step | Clause | The question it answers |
|---|---|---|
| 1 | `FROM` / `JOIN` | Which tables hold this? |
| 2 | `WHERE` | Which rows do I throw away first? |
| 3 | `GROUP BY` | What am I counting *per*? |
| 4 | `HAVING` | Which groups do I throw away? |
| 5 | `SELECT` | What do I want to see? |
| 6 | `ORDER BY` / `LIMIT` | How is it sorted and how many? |

On question 5 he had already done step 1 correctly and unaided — he identified Products
and Order Details before looking anything up. The block was that he then tried to start
writing at `SELECT`, which is step 5 of 6.
**Status:** `queued` at interval 3, on the Day 05 consolidation day

### HAVING vs WHERE

**Gap:** Couldn't write "customers with more than 10 orders" — question 4 of the Day 1
baseline test.
**Answer:** `WHERE` filters individual rows *before* grouping. `HAVING` filters grouped
results *after* aggregation. `WHERE COUNT(*) > 10` fails because no groups exist yet at
the point `WHERE` runs.
**Also surfaced:** every non-aggregated column in the `SELECT` must appear in `GROUP BY`.
SQLite tolerates breaking this; SQL Server and Postgres reject it, so write it strictly.
And a plain `JOIN` drops customers with zero orders — correct for this question, wrong
if the ask were "including zeros", which needs `LEFT JOIN` and `COUNT(o.OrderID)`.
**Why it matters:** This is the standard screening question for whether someone actually
writes SQL or has only read about it. Expect it in an interview.
**Status:** `queued`

### One config value drives every date in this system

**Gap:** Didn't know what changing `START_DATE` would touch.
**Answer:** `tracking/config.md` is the single anchor. Every due date, day number and
dashboard state derives from it. Changing it needs `node scripts/seed-queue.js` to
rebuild the queue.
**Second-order effect:** Starting on a Wednesday moved the four phone-only
consolidation blocks onto the Sundays inside the run — D05, D12, D19, D26 — because
the plan assumes a Monday start.
**Status:** `open` — system operation, not interview material. Not queued on purpose.

### Pushed does not mean merged

**Gap:** Believed work done in an earlier Claude Code session was live because it had
been pushed. It was on branch `claude/backfill-missed-days-logging-wqw9kg`, not `main`.
**Answer:** `git fetch --all` then `git branch -a` shows remote branches you do not
have locally. A branch is only in `main` once merged. `git log --all --oneline --graph`
shows the divergence at a glance.
**Why it matters:** You lost a week of a working feature to this. It will happen again
across sessions.
**Status:** `open`

### Merge conflicts in generated files

**Gap:** Didn't know what to do when both branches changed `index.html`.
**Answer:** The conflict was the baked-in snapshot blob — generated output, not source.
Correct move is to resolve arbitrarily then **re-run the generator**
(`node scripts/build-snapshot.js`), never to hand-pick lines from either side.
**Status:** `open`

### Updating the installed phone app

**Gap:** Unclear how the home-screen app picks up a push.
**Answer:** It is a PWA pointed at GitHub Pages, with no service worker. Reopening it
refetches. There is no store update and no build step.
**Status:** `open`

---

## How this file gets maintained

Claude Code appends to it at the end of any session where you asked something you
didn't already know, and promotes the job-relevant ones into the review queue. The
rules are in `CLAUDE.md`. You are not expected to write in this file yourself.
