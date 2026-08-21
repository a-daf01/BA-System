# Day Reviews

**Was it right or wrong? This is the file that answers that.**

One recap per day you have done work for. Every query in here was **run against
`data/northwind.db`** — nothing is marked from reading it.

You do not write in this file. Say *"I finished day N"* and it gets written before the push.

## Why it exists

You said it on 21 August: *"i literally just realised i have not been checking whether ive
been doing things right or wrong this entire time."*

That was true, and it was the biggest hole in the system. You were logging confidence
scores against work nobody had marked. Day 8 scored a 5 with two silently wrong queries in
it — the row counts matched, so nothing looked off.

**The dangerous answer is not the one that errors. It is the one that returns the right
number of rows and the wrong numbers inside them.** Every recap has a section for exactly
those.

## How to read one

- **Bottom line** — one sentence. Read this even if you read nothing else.
- **Scoreboard** — every task, marked.
- **Silent defects** — looked right, wasn't. This is the section that matters.
- **What I changed** — what went into the queue or the plan because of this day.

---

## Day 01 — Setup and honest baseline
**Wed 12 Aug · confidence 4 · 3 of 5 unaided, 2 looked up**

### Bottom line
A fair baseline, honestly logged. You solved the first three cold and looked up the last
two — and then re-derived both without the answer in front of you, which is the part that
actually counts.

### Scoreboard
- **Q1–Q3** — correct, unaided.
- **Q4** customers with more than 10 orders — **looked up `HAVING`**, then rewrote it your
  own way and it ran. Returns **92 of 93 customers**.
- **Q5** top 5 products by revenue — **looked up**. You spotted `SELECT TOP 5` is SQL Server
  and re-derived the `LIMIT 5` version yourself. Top row **Côte de Blaye, £53,265,895.24**. Correct.
- **Power BI bar chart** — built. `Remove errors` used without understanding it.

### What went right
- You wrote `SELECT TOP 5` from a looked-up answer, **noticed it failed in SQLite, and
  fixed it yourself**. That is the single best thing in this day: you tested the answer
  rather than trusting it.
- You corrected your own misreading of `SUM()` in the same session — first thinking it was
  the multiplication, then realising it adds the already-multiplied line values.

### What went wrong
- Nothing was wrong. Two were unknown, which is not the same thing.

### The thing worth knowing
Your Q4 returns **92 of the 93 customers**. The SQL is right and the *business answer is
useless* — a threshold of 10 on this data separates nobody from nobody. This build of
Northwind has 16,282 orders across 93 customers, so every customer has at least 154. Picking
a threshold you have never seen the data behind is the actual skill, and it is now a queue item.

### What I changed
- Queued: `HAVING` vs `WHERE`, `TOP` vs `LIMIT`, what `SUM()` actually does, Power Query
  *remove errors*, and the "pick a threshold on unseen data" question.

---

## Day 02 — SQL: filtering and shaping
**Thu 13 Aug · confidence 4 · 13 of 15 correct**

### Bottom line
Strong day. Two genuine slips, one silent — and the silent one is still the most
professionally dangerous thing you have written all month.

### Scoreboard
- **Q1, Q2, Q5–Q8, Q10–Q12, Q14** — correct.
- **Q3** orders in 1997 — returned nothing. **You were right and the exercise was wrong.**
  This database runs **2012‑07‑10 to 2023‑10‑28**. There are no 1997 orders. You said *"I
  think its just a trick question"* and moved on; the correct instinct was to check the
  range, but the doubt was well placed.
- **Q4** — `Discontinued IS 0` returned 69 rows. **Works, but only in SQLite.** `IS` is a
  null-safe comparison here; on SQL Server or Postgres this is a syntax error.
- **Q9** `BETWEEN '2016-01-01' AND '2016-03-31'` — **350 rows. The right answer is 357.**
- **Q13** conditional aggregation — your attempt was not valid SQL. Looked up the
  `SUM(CASE WHEN … THEN 1 ELSE 0 END)` pattern. Reference answer: **16,282 orders, 21
  unshipped.**
- **Q15** — `LIMIT 20` applied, correct.

### Silent defects — looked right, wasn't
**Q9 lost seven orders and told you nothing.** `OrderDate` is a `DATETIME`. `BETWEEN … AND
'2016-03-31'` means *up to midnight at the start of 31 March*, so every order placed during
that day is excluded. You get 350 instead of 357, no error, no warning.

The fix is `>= '2016-01-01' AND < '2016-04-01'`. **Never use `BETWEEN` on a datetime column.**
If this were a revenue report, you would have under-reported a day and had no way to know.

### What went right
- You wrote business questions for queries 6, 11 and 13 without being pushed, and question
  11 — *"why are we getting reports about customers not receiving orders in time?"* — is
  genuinely the question a manager would ask. That is the BA half of the job and it is
  already working.
- You looked up the `IN` operator and then **solved it yourself rather than copying** the
  worked answer.

### What I changed
- Queued: the `BETWEEN` datetime trap, `IS` vs `=`, conditional aggregation with `CASE`,
  operator precedence, `LIKE` wildcards, and *"your 1997 query returned nothing — say the one
  line of SQL you run before deciding a filter is wrong."*
- Fixed the plan: the 1997 date filter was removed, and `reference/dataset-profile.md` was
  written so no future exercise assumes textbook Northwind again.

---

## Day 03 — SQL: JOINs
**Fri 14 Aug · confidence 5 · self-scored "easy" — with two wrong answers inside it**

### Bottom line
You scored this a 5 and two of the three answers were wrong. Not because the SQL failed —
because it produced a believable result for the wrong reason. **This is the day the whole
marking habit exists for.**

### Scoreboard
- **Task 1** customers with no orders — you wrote `INNER JOIN … WHERE o.OrderID IS NULL`,
  got **0 rows**, and concluded *"I guess there are no customers with no orders"*.
- **Task 2** three-table join — **609,283 rows**, which is exactly the number of line items.
  Correct, and you noted you already knew it well.
- **Task 3** fan-out — you described **LEFT JOIN behaviour**, not row multiplication.

### Silent defects — looked right, wasn't
**Task 1 gave the right answer through a query that could never have produced it.** An
`INNER JOIN` only keeps rows that matched, so `o.OrderID IS NULL` after an inner join is
**always zero rows, on every database that has ever existed**. It cannot find customers with
no orders — it cannot find anything.

The conclusion happened to be true (this build has no orphan customers), which is worse than
being wrong: you got confirmation for a method that does not work.

**Task 3 answered a different question.** Fan-out is not "a LEFT JOIN also returns unmatched
rows". It is **one row on the one-side being multiplied by every matching row on the
many-side**, so every measure attached to the one-side gets counted repeatedly. Concretely
in this database: Orders holds £4,047,470 of freight; join it to `[Order Details]` and the
same `SUM(Freight)` returns **£206,911,676**. Fifty times too big, no error.

### What you got right that I initially wrote off
Your note said: *"I tried it with LEFT join and it did nothing different."* **You were
correct.** Both return **95 rows**, because the date filter sits in the `WHERE` clause, and
a `WHERE` on the right-hand table silently converts a LEFT JOIN back into an inner one. Move
the same filter into the `ON` and you get **130 rows**. You had found a real and subtle
thing and read it as a non-result.

### What I changed
- Queued: the `INNER JOIN + IS NULL` impossibility, fan-out with the real freight numbers,
  and the `WHERE`-cancels-a-LEFT-JOIN behaviour with the 95-vs-130 counts.
- Day 4 was built as a dedicated JOIN-repair day to re-test all of this. **It was written
  off**, so the fan-out answer has still never been re-tested. It is the oldest unresolved
  item in the system.

---

## Day 06 — SQL: aggregation
**Mon 17 Aug · confidence 4 · 7 correct, 1 partial, 3 with defects**

### Bottom line
The `GROUP BY` mechanics are solid and you self-corrected three times without help. But
three queries returned the right *shape* with wrong *numbers* or wrong *labels*, and none of
them errored.

### Scoreboard
- **Q1** customers per country — first grouped by `CompanyName` (92 rows), **caught it
  yourself**, regrouped by `Country`. **22 rows, USA top with 13.** Correct.
- **Q2** revenue per product — 77 rows, Côte de Blaye top. **Total is wrong.** See below.
- **Q3** average price per category — **8 rows, Meat/Poultry £54.01.** Correct.
- **Q4** highest and lowest price — **263.50 and 2.50.** Correct.
- **Q5** orders per employee — 9 rows, Peacock top with 1,908. **Name column wrong.** See below.
- **Q6** quantity per product — first used `COUNT` (8,040), **caught it yourself**, switched
  to `SUM`. **206,213 for Louisiana Hot Spiced Okra.** Correct.
- **Q7** average order value — the version you looked up returns **£27,538.79**, correct.
  Your own attempt returned **£67,707.68** and you knew it was wrong.
- **Q8** orders per country per year — first wrote `SELECT *` with a `GROUP BY`, **caught it
  yourself**, added `COUNT(*)`. **252 rows.** Correct.
- **Q9** revenue per category per year — **96 rows.** Correct.
- **Q10** orders per employee per shipper — 27 rows. **Join is broken.** See below.
- **Task 2** categories above £4m in 2023 — **5 rows, correct**: Beverages, Confections,
  Meat/Poultry, Dairy, Condiments.

### Silent defects — looked right, wasn't
**Q2 used the wrong revenue formula.** You wrote `SUM((UnitPrice * Quantity) - Discount)`.
`Discount` is a **rate**, not an amount — 0.15 means 15%, not 15 pence. Subtracting it from
a line total is meaningless. Your figure: **£53,274,481.60**. Correct: **£53,265,895.24**.
Off by **£8,586**, on the right number of rows, with the right product on top. The formula
is `UnitPrice * Quantity * (1 - Discount)` and you used it correctly everywhere else that
day, which is what makes this a slip rather than a gap.

**Q5 printed `Peacock Peacock`.** `CONCAT(e.LastName, ' ', e.LastName)` — last name twice.
The count of 1,908 was right, so the query passed every check except reading it. You also
grouped by the concatenated name rather than `EmployeeID`, which would silently merge two
employees who happen to share a name.

**Q10 has no join condition at all.** `JOIN Employees e ON o.EmployeeID = o.EmployeeID` —
both sides are the *same table*, so that condition is true for every pair of rows. It is a
cross join: **146,538 rows** instead of 16,282. It still returned 27 rows because the
`GROUP BY` collapsed it, and 27 is exactly what was expected. You also output the *year*
instead of the employee, so the query does not answer the question asked.

### What went right
**You caught three of your own mistakes before finishing** — Q1's grouping, Q6's COUNT, and
Q8's missing aggregate. That is real self-checking and it is new this week.

Your `WHERE OrderYear = '2023'` in Task 2 **worked**, which surprises most people: SQLite
lets you filter on a `SELECT` alias, and almost nothing else does. Same family as the
`Discontinued IS 0` slip on Day 2 — code that runs here and fails in an interview.

### What I changed
- Queued: the self-join defect (with the 146,538 figure), and the average-of-averages
  problem behind your £67,707.68.
- Left out on purpose, given the backlog: the `GROUP BY Total_Revenue` error you already
  fixed yourself, and the duplicated `LastName`.

---

## Day 08 — SQL: subqueries and CTEs
**Tue 19 Aug, done Wed 20 Aug · confidence 5 · 6 correct, 2 partial, 2 wrong**

### Bottom line
Your best day mechanically — and your note *"i dont think i have ever been this confident
with SQL ever"* is fair. Two answers were still wrong, and the confidence is exactly why
they need saying out loud.

### Scoreboard
- **Q1** products above average price — **25 rows, average £28.87.** Correct.
- **Q2** customers who ordered since **1 October** — you filtered from **1 August**. Both
  numbers are right for their own question: **88 since August, 58 since October.** Wrong
  question answered.
- **Q3** churn list — **5 rows.** Correct, after you fixed `NOT` to `NOT IN` yourself.
- **Q4** freight above average — **8,025 rows, average £248.59.** Correct.
- **Q5** products supplied from Germany — 9 rows, but you selected **supplier** columns, so
  you returned suppliers repeated rather than the products. Right count, wrong subject.
- **Q6** every product with the overall average beside it — **77 rows.** Correct.
- **Q7** every customer with their order count — **93 rows, ALFKI 163.** The answer is
  right; you wrote a `GROUP BY`, not a subquery.
- **Q8** products per category — **8 rows.** Correct.
- **Q9** most recent order per employee — **wrong.** See below.
- **Q10** line items per order — **16,282 rows.** Correct.

### Silent defects — looked right, wasn't
**Q9 gave all nine employees the same date.** Same broken join as Day 6 Q10:
`ON o.EmployeeID = o.EmployeeID`. Every employee came back with **2023‑10‑28**, which is the
latest order in the entire company. The real answers are nine different dates — Nancy
Davolio's is **2023‑10‑19**.

Nine rows were expected. Nine rows came back. **One distinct date instead of nine**, and
nothing flagged it. You wrote this same typo twice in three days, which is why it is now a
review card rather than a footnote.

### Your own question, answered
*"i dont understand how this is a subquery or did i not do what was asked?"* — you did not,
and you were right to ask. Q7 wanted a **correlated subquery**: `SELECT c.CustomerID,
(SELECT COUNT(*) FROM Orders o WHERE o.CustomerID = c.CustomerID) FROM Customers c`. It runs
once per customer row. Your `GROUP BY` gets the same 93 rows here **only because every
customer happens to have orders** — the subquery version would still return a customer with
zero, and the `GROUP BY` version silently drops them.

### What went right
- You wrote `NOT (SELECT …)`, saw it fail, worked out `NOT IN`, and then judged the result:
  *"which to be honest is cleaner and makes more sense"*. That is the composition skill you
  have been saying you lack, happening in writing.
- You doubted a number against a stated expectation instead of shipping it. The instinct was
  right even though the conclusion was backwards — **your SQL was fine, the date was wrong**.

### What I changed
- Queued for 22–26 Aug: the self-join defect, `NOT` vs `NOT IN`, the misread date condition
  (third occurrence this week), and the average-of-averages.
- Confidence corrected from 4 to **5** — your own tap, which the phone had and the log did not.

---
