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

## 2026-08-13 — Day 2

### Your Northwind has no 1997 orders — the plan was wrong, not you

**Gap:** Query 3 returned nothing. Concluded "I think it's just a trick question."
**Answer:** It wasn't a trick, and your SQL was right. `jpwhite3/northwind-SQLite3`
re-dates the classic dataset. Verified range: **2012-07-10 to 2023-10-28, 16,282
orders.** The original Microsoft Northwind runs 1996–1998; this build does not. The
plan's Day 2 and Day 9 blocks were written against the original dates and have been
corrected.
**What you did right:** on query 9 you tested a different year, got results, and said
"I don't think there's no 1997 orders." That instinct — suspect the data before
concluding the query is broken — is the right one.
**The habit to make automatic:** before deciding a filter is wrong, run
`SELECT MIN(OrderDate), MAX(OrderDate) FROM Orders;`. Three seconds, and it tells you
whether you're querying wrong or querying an assumption.
**Why it matters:** "the report came back empty" is a ticket you will be handed
constantly. Half the time the filter is fine and the data doesn't cover the period.
**Status:** `queued`

### BETWEEN on a datetime column silently drops the last day

**Gap:** Query 9 — `WHERE OrderDate BETWEEN '2016-01-01' AND '2016-03-31'`. It ran, it
returned rows, you moved on.
**Answer:** It returned **350 orders. The correct answer is 357.** `OrderDate` stores a
full timestamp (`2016-03-31 14:22:00`), and as a string that sorts *after* `'2016-03-31'`.
So every order placed on the last day of the range was excluded — 7 of them.
**The fix:** use a half-open range, never `BETWEEN`, on anything with a time component:

```sql
WHERE OrderDate >= '2016-01-01' AND OrderDate < '2016-04-01'
```

**Why it matters:** this is the most dangerous class of bug in reporting. The query
doesn't error. The number looks plausible. Q1 revenue is quietly 2% light and nobody
finds out until someone reconciles it. If you can explain this in an interview you will
sound like someone who has shipped a report, not someone who has done a course.
**Status:** `queued`

### Two queries answered a question you weren't asked

**Gap:** Query 4 asked for *products above 20 that are not discontinued* — you wrote only
the discontinued condition. **69 rows returned; the answer is 31.** Query 15 asked for
*non-discontinued* products sorted and limited to 20 — the filter is missing there too.
**Answer:** Both queries are syntactically perfect. Neither answers the question. The
SQL wasn't the failure; reading the requirement was.
**The habit:** before writing, count the conditions in the sentence. "Products above 20
that are not discontinued" is two. Your `WHERE` should have two. It's a five-second check
and it catches this every time.
**Why it matters:** this is the actual job. A BSA who writes elegant SQL against a
misread requirement produces a confident, wrong report — which is worse than no report.
In an interview, "how do you make sure you've built what was asked for?" is a question
you will get, and this is your honest answer to it.
**Status:** `queued`

### Conditional aggregation — the CASE-inside-SUM pattern

**Gap:** Query 13, the only one you couldn't finish. You wrote
`COUNT(SELECT * FROM Orders WHERE ShippedDate IS NULL)` with a `GROUP BY OrderID`, then
said: *"I genuinely don't know how I am supposed to come up with these solutions."*
**Answer:** The blocker is a specific, nameable one — you reached for a second query
because you were thinking of it as two questions. It's one pass over the table with two
different counters:

```sql
SELECT COUNT(OrderID) AS TotalOrders,
       SUM(CASE WHEN ShippedDate IS NULL THEN 1 ELSE 0 END) AS UnshippedOrders
FROM Orders;
```

Read the `CASE` as: *for each row, put a 1 in the bucket if it's unshipped, else a 0.*
`SUM` then adds the bucket up. Counting a subset of rows alongside all of them is
**always** this shape.
**The recognition trigger** — this is what you said you were missing: any time the ask
contains **"X out of Y", "how many of them", or "% that are"**, it's conditional
aggregation. Not a subquery.
**The `GROUP BY OrderID` tell:** you grouped by the primary key, which makes one group
per row and aggregates nothing. If you find yourself grouping by an ID that's unique,
you don't want a `GROUP BY` at all.
**On your own answer:** verified — 16,282 total, 21 unshipped.
**Status:** `queued` — this is the Day 1 "translating logic into SQL" gap in a new
costume. Second appearance. Re-teach candidate at the Day 7 checkpoint if it returns.

### `IS` works where `=` belongs, but only in SQLite

**Gap:** Wrote `WHERE Country IS 'Germany'`-style comparisons — `Discontinued IS 0` on
query 4, `OrderDate IS 1997` on query 3.
**Answer:** SQLite lets `IS` stand in for `=`. **SQL Server, Postgres and MySQL reject
it.** `IS` is for null-comparison only — `IS NULL`, `IS NOT NULL` — because `= NULL` is
never true. Everything else takes `=`.
**Why it matters:** you're learning on the most permissive engine in common use. Habits
it tolerates will fail on your first day in a job running SQL Server. Write it strictly
now.
**Status:** `queued`

### Things you got right unaided — logged so they don't quietly rot

Not gaps. Queued at interval 3 because working once is exposure, not retention.

- **Bracket precedence, query 6.** `AND` binds tighter than `OR`, so the OR pair needs
  its own parentheses. You flagged that the brackets nearly got you and then fixed it
  yourself. You also read "under 10 / above 100" as `UnitsInStock` where the plan meant
  price — defensible, arguably the better business read, but **say the assumption out
  loud next time.** Stating an ambiguous requirement back is a BA skill in itself.
- **`IN`, query 7.** Looked up the operator, not the answer, then wrote it yourself.
  That's the right way to be stuck.
- **`LIKE` wildcards, query 10.** `'B%'` for prefix, `'%market%'` for contains.
- **`ORDER BY` multi-column, queries 14 and 15.** Correct, and yes — `ASC` is the
  default, you were right to leave it off.
- **`strftime('%Y', OrderDate) = '1997'`.** The right tool for year extraction in SQLite.
  Note it's a string comparison, so `'1997'` in quotes.

### The three business questions

Query 11 — *"Why are we getting reports about customers not receiving their orders in
time? How long does it take our orders to get shipped from order date?"* — is the
strongest of the three. It's a real question with a follow-up metric attached, which is
what a manager actually sounds like.

Query 6 hedged across two different reports (restocking vs. storage cost). Pick one and
commit — a BA who offers the stakeholder two interpretations is asking them to do the
analysis.

Query 13 you called a guess: *"what's the percentage of unshipped orders compared to all
our orders."* It isn't a guess, it's correct, and it's exactly why the conditional
aggregation pattern exists. Trust that instinct more than you did.

**Status:** `open` — not queued separately; carried by the Day 6 and Day 20 write-up work.

---

## 2026-08-14 — Day 3

### You got the right answer from a query that could never have produced it

**Gap:** Task 1. You wrote `INNER JOIN Orders o ... WHERE o.OrderID IS NULL`, got 0 rows,
and concluded *"I guess there are no customers with no orders."*
**Answer:** The conclusion is correct. **The query is not evidence for it.** An INNER JOIN
only emits rows where a match was found, so `o.OrderID` is guaranteed non-null in every
row it returns. `WHERE o.OrderID IS NULL` on an INNER JOIN returns 0 rows on **every
database that has ever existed**, whatever the data says. It is a structurally empty
query.

Verified on your file: the LEFT JOIN version also returns 0. This build genuinely has no
orphan customers — and no orphan products, suppliers, employees or orders either. It is
fully dense. So the plan's task couldn't demonstrate the difference, and it has been
corrected in `plan/month-01.md`.

**What you did right:** your written explanation of *why* it needs a LEFT JOIN — "it forces
a list of every single customer even if they don't have orders, then the WHERE filters out
the ones with orders" — is exactly right. You explained the correct method and then typed a
different one. That's the gap: not the concept, the gap between saying it and writing it.
**Why it matters:** this is the dangerous shape of error. Nothing errored, the number was
plausible, and you drew a business conclusion from it. In a job that conclusion goes in an
email. **Rule: a query that returns 0 rows needs a second query proving 0 is possible.**
**Status:** `queued` at interval 1

### Row fan-out is not "LEFT JOIN adds unmatched rows"

**Gap:** Task 3 asked when a join silently inflates row counts. You answered that a LEFT
JOIN adds customers who have no orders, detectable by checking for NULLs.
**Answer:** That's the definition of a LEFT JOIN, not inflation — those extra rows are
ones you asked for, and there is one per unmatched customer. **Fan-out is a different
thing and it happens on INNER JOINs too.** Joining across a one-to-many relationship
*multiplies* the rows on the "one" side, once per child row:

| Query | Rows | SUM(Freight) |
|---|---|---|
| `Orders` alone | 16,282 | £4,047,470.50 |
| `Orders JOIN [Order Details]` | 609,283 | £206,911,676.00 |

Freight is stored **once per order**. After the join it is repeated once per line item, so
the total comes back **51× too big**. Nothing errors. Nothing is NULL. Checking for NULLs
would not have found it.
**Detection:** count rows before the join and after. If the count grew, every measure
coming from the left-hand table is now multiplied and must be aggregated differently
(`SUM(DISTINCT)` won't save you either — aggregate freight on `Orders` separately, or
sum line-level values only).
**Why it matters:** this is the Day 3 Say It Out Loud line — *"if a report's totals
suddenly doubled, my first check is whether a join is fanning out rows"* — and it is one
of the two or three most common questions asked to separate people who have shipped a
report from people who have done a course.
**Status:** `queued` at interval 1

### A WHERE clause on the right-hand table cancels your LEFT JOIN

**Gap:** Not reached — the plan didn't ask for it, and it's the case you'll actually meet.
**Answer:** "Every customer, with orders since 1 Oct 2023." Put the date filter in `WHERE`
and you get **58 customers**; put it in the `ON` and you get **93, with 35 at zero**.
`WHERE o.OrderDate >= …` is evaluated after the join, and a customer with no matching order
has `OrderDate = NULL`, which fails the comparison — so the row is discarded and the LEFT
JOIN has been quietly demoted to an INNER JOIN.
**The rule:** conditions on the **right-hand** table of a LEFT JOIN belong in `ON`.
Conditions on the left-hand table belong in `WHERE`.
**Why it matters:** the 35 customers this deletes are precisely the ones a churn or
re-engagement report exists to find. The report looks fine and answers the opposite question.
**Status:** `queued` at interval 1

### The three-table join — no gap, but nothing was proved either

**Gap:** Task 2 ran and you said *"I kind of remember this quite well already, not sure
what much I can do with it."* The task said "break one deliberately and observe" and that
half didn't happen.
**Answer:** Fair — the instruction was vague about *what* to break and *what* to observe.
The point it was reaching for is the fan-out above: your three-table join returns 609,283
rows from 16,282 orders, and knowing that number is the whole lesson. The extension block
makes that explicit.
**Status:** `open` — covered by the fan-out item, not queued separately.

### The system itself is creating friction — logged, not dismissed

**Gap:** *"wtf is Query 9 or Query 12"* — review prompts referencing work by number, and
bare stub prompts like `INNER vs LEFT` with nothing to actually answer.
**Answer:** Correct complaint, and it was a real defect. A review prompt has to be
answerable from the prompt alone; if it sends you back to another file, the review doesn't
get done.

**What was done about it, same day:** every queue item across all 28 days rewritten as a
self-contained spoken question; every day given an `Open:` file that already exists with
the questions in it; every SQL exercise verified against the real database and given the
answer it should produce; Contoso dropped so there is no second dataset to install;
`scripts/check.js` added so these can't come back silently.
**Status:** `open` — system operation, deliberately not queued. Not what you're hired for.

### Two bugs found in the system's own code while fixing the above

Not your gaps — logged because they were silently corrupting your data and you would
have had no way to see it.

**`weekly-review.js` was inventing confidence scores.** When a review item fell due on a
day you hadn't logged, it graded that item from the *week average* rather than leaving it
alone. It did this to three of your items during this session — awarding them a 4 you
never gave — and every future interval for those items would have derived from that
invented number. Fixed: no score, no grading. An item that falls due on an unlogged day is
now left untouched, and one that falls due on a logged-but-unscored day is carried forward
at its current interval with nothing recorded.

**The dashboard's "full 28 days" list rendered `[object Object]` for every task.** It had
been passing the task object where a string was expected since sub-steps were added. The
today card was fine, which is why it went unnoticed — but the one place you'd look to see
what's coming was unreadable. Fixed, and sub-steps now nest underneath.

**Status:** `open` — both fixed. Recorded so the fix isn't silently undone later.

---

## How this file gets maintained

Claude Code appends to it at the end of any session where you asked something you
didn't already know, and promotes the job-relevant ones into the review queue. The
rules are in `CLAUDE.md`. You are not expected to write in this file yourself.
