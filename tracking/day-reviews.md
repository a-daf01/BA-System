# Day Reviews

**Was it right or wrong?**

Every query in here was **run against `data/northwind.db`**. Nothing is marked from reading it.

You do not write in this file. Say *"I finished day N"* and it gets written before the push.

## Why

You said it on 21 August: *"i literally just realised i have not been checking whether ive
been doing things right or wrong this entire time."* True — eight days of confidence scores
against unmarked work.

**The dangerous answer is not the one that errors. It is the one that returns the right
number of rows and the wrong numbers inside them.** Every recap has a section for those.

---

## Day 01 — Setup and honest baseline
**Wed 12 Aug · conf 4 · 3 unaided, 2 looked up**

### Bottom line
Fair baseline. You looked up two, then re-derived both without the answer in front of you.

### Scoreboard
- **Q1–Q3** — correct, unaided.
- **Q4** customers >10 orders — looked up `HAVING`, rewrote it your own way. Returns **92 of 93**.
- **Q5** top 5 by revenue — looked up. Spotted `TOP 5` is SQL Server, found `LIMIT` yourself.
  **Côte de Blaye, £53,265,895.24.** Correct.
- **Power BI chart** — built. `Remove errors` used without understanding it.

### What went right
- You ran a looked-up answer, **saw it fail in SQLite, and fixed it**. Best thing in the day.
- Corrected your own reading of `SUM()` mid-session.

### Worth knowing
Q4 returns **92 of 93 customers**. SQL right, business answer useless — every customer here
has 154+ orders. Picking a threshold on unseen data is the real skill. Now a queue item.

### What I changed
Queued: `HAVING` vs `WHERE`, `TOP` vs `LIMIT`, what `SUM()` does, Power Query remove-errors,
threshold-picking.

---

## Day 02 — SQL: filtering and shaping
**Thu 13 Aug · conf 4 · 13 of 15 correct**

### Bottom line
Strong day. One silent defect, and it is still the most dangerous thing you have written.

### Scoreboard
- **Q1, Q2, Q5–Q8, Q10–Q12, Q14** — correct.
- **Q3** 1997 orders — **you were right, the exercise was wrong.** This database runs
  **2012‑07‑10 to 2023‑10‑28**.
- **Q4** `Discontinued IS 0` — 69 rows. Works **in SQLite only**; syntax error elsewhere.
- **Q9** `BETWEEN` — **350 rows. Correct answer 357.**
- **Q13** conditional aggregation — attempt was invalid SQL. Looked up `SUM(CASE WHEN…)`.
  **16,282 orders, 21 unshipped.**
- **Q15** — correct.

### Silent defect
**Q9 lost seven orders and said nothing.** `OrderDate` is a `DATETIME`. `BETWEEN … AND
'2016-03-31'` stops at **midnight starting** 31 March, so that whole day is excluded.

Fix: `>= '2016-01-01' AND < '2016-04-01'`. **Never use `BETWEEN` on a datetime column.**

### What went right
- You wrote the business question behind Q11 unprompted — *"why are we getting reports about
  customers not receiving orders in time?"* That is the BA half, already working.
- Looked up `IN`, then **solved it yourself** instead of copying.

### What I changed
Queued: the `BETWEEN` trap, `IS` vs `=`, `CASE` aggregation, operator precedence, `LIKE`.
Fixed the plan: 1997 filter removed, `reference/dataset-profile.md` written.

---

## Day 03 — SQL: JOINs
**Fri 14 Aug · conf 5 · two of three answers wrong**

### Bottom line
You scored this a 5 and two answers were wrong — both produced believable results for the
wrong reason. **This is the day the marking habit exists for.**

### Scoreboard
- **Task 1** customers with no orders — `INNER JOIN … WHERE o.OrderID IS NULL`, **0 rows**,
  concluded there are none.
- **Task 2** three-table join — **609,283 rows**, exactly the line-item count. Correct.
- **Task 3** fan-out — described **LEFT JOIN behaviour**, not row multiplication.

### Silent defects
**Task 1 cannot work.** An `INNER JOIN` only keeps matched rows, so `IS NULL` after one is
**always zero, on every database ever built**. The conclusion happened to be true, which is
worse — you got confirmation for a method that finds nothing.

**Task 3 answered a different question.** Fan-out is **one row on the one-side multiplied by
every match on the many-side**. Here: Orders holds **£4,047,470** of freight; join it to
`[Order Details]` and the same `SUM` returns **£206,911,676**. Fifty times too big, no error.

### Where you were right
*"I tried it with LEFT join and it did nothing different."* **Correct.** Both return **95
rows**, because the date filter sits in `WHERE` — and a `WHERE` on the right-hand table
silently turns a LEFT JOIN back into an inner one. Move it into `ON`: **130 rows.** You found
something subtle and read it as a non-result.

### What I changed
Queued: the `INNER JOIN + IS NULL` impossibility, fan-out with the freight numbers, and the
95-vs-130 `WHERE`-cancels-LEFT-JOIN case. Day 4 was built to re-test all of it and **was
written off** — the fan-out answer has still never been re-tested.

---

## Day 06 — SQL: aggregation
**Mon 17 Aug · conf 4 · 7 correct, 1 partial, 3 defects**

### Bottom line
`GROUP BY` is solid and you caught three of your own mistakes. Three queries returned the
right shape with wrong numbers or wrong labels. None errored.

### Scoreboard
- **Q1** customers per country — grouped by `CompanyName` (92), **caught it**, regrouped.
  **22 rows, USA 13.** Correct.
- **Q2** revenue per product — 77 rows. **Total wrong.** Below.
- **Q3** avg price per category — **8 rows, Meat/Poultry £54.01.** Correct.
- **Q4** max/min price — **263.50 and 2.50.** Correct.
- **Q5** orders per employee — 1,908 correct. **Name wrong.** Below.
- **Q6** quantity per product — used `COUNT`, **caught it**, switched to `SUM`. **206,213.** Correct.
- **Q7** avg order value — looked-up version **£27,538.79** correct. Your own: £67,707.68, and
  you knew it was wrong.
- **Q8** orders per country per year — `SELECT *` first, **caught it**. **252 rows.** Correct.
- **Q9** revenue per category per year — **96 rows.** Correct.
- **Q10** orders per employee per shipper — 27 rows. **Join broken.** Below.
- **Task 2** categories over £4m in 2023 — **5 rows.** Correct.

### Silent defects
**Q2 — wrong revenue formula.** `SUM((UnitPrice * Quantity) - Discount)`. `Discount` is a
**rate**: 0.15 means 15%, not 15p. Yours **£53,274,481.60**, correct **£53,265,895.24** —
off by **£8,586**, right row count, right top product. You used the right formula everywhere
else that day, so this is a slip, not a gap.

**Q5 printed `Peacock Peacock`.** `CONCAT(e.LastName, ' ', e.LastName)`. Count was right, so
it passed every check except reading it. Grouping by the name would also merge two employees
who share one.

**Q10 has no join condition.** `ON o.EmployeeID = o.EmployeeID` — same table both sides, true
for every pair. A cross join: **146,538 rows** instead of 16,282, collapsed back to the
expected 27 by `GROUP BY`. You also output the year instead of the employee.

### What went right
**Three self-corrections in one session** — Q1's grouping, Q6's COUNT, Q8's missing
aggregate. That is new this week.

Your `WHERE OrderYear = '2023'` **worked** — SQLite allows filtering on a `SELECT` alias and
almost nothing else does. Same family as `Discontinued IS 0`.

### What I changed
Queued: the self-join defect, and the average-of-averages behind your £67,707.68.
Left out: the `GROUP BY Total_Revenue` error you already fixed, and the duplicated `LastName`.

---

## Day 08 — SQL: subqueries and CTEs
**Tue 19 Aug, done Wed 20 Aug · conf 5 · 6 correct, 2 partial, 2 wrong**

### Bottom line
Best day mechanically. Two answers still wrong — and the confidence is exactly why they need
saying out loud.

### Scoreboard
- **Q1** products above average price — **25 rows, £28.87.** Correct.
- **Q2** customers since **1 October** — you filtered from **1 August**. **88 since Aug, 58
  since Oct.** Both right; wrong question answered.
- **Q3** churn list — **5 rows.** Correct, after fixing `NOT` to `NOT IN` yourself.
- **Q4** freight above average — **8,025 rows, £248.59.** Correct.
- **Q5** German-supplied products — 9 rows, but you selected **supplier** columns. Right
  count, wrong subject.
- **Q6** product with overall average beside it — **77 rows.** Correct.
- **Q7** customers with order count — **93 rows, ALFKI 163.** Right answer, but a `GROUP BY`,
  not a subquery.
- **Q8** products per category — **8 rows.** Correct.
- **Q9** most recent order per employee — **wrong.** Below.
- **Q10** line items per order — **16,282 rows.** Correct.

### Silent defect
**Q9 gave all nine employees the same date.** Same broken join as Day 6 Q10. Every employee
returned **2023‑10‑28**, the latest order in the company. Nancy Davolio's real answer is
**2023‑10‑19**.

Nine rows expected, nine returned, **one distinct date instead of nine**. You wrote this typo
twice in three days — that is why it is a card now.

### Your question, answered
*"i dont understand how this is a subquery or did i not do what was asked?"* — you did not,
and you were right to ask. Q7 wanted a **correlated subquery**:

```
SELECT c.CustomerID,
       (SELECT COUNT(*) FROM Orders o WHERE o.CustomerID = c.CustomerID)
FROM Customers c
```

It runs once per customer row. Your `GROUP BY` matches here **only because every customer has
orders** — the subquery still returns a customer with zero, the `GROUP BY` silently drops them.

### What went right
- You wrote `NOT (SELECT …)`, saw it fail, worked out `NOT IN`, then judged it: *"cleaner and
  makes more sense"*. That is composition — the thing you keep saying you cannot do.
- You doubted a number instead of shipping it. Instinct right, conclusion backwards: **your
  SQL was fine, the date was wrong.**

### What I changed
Queued for 22–26 Aug: the self-join defect, `NOT` vs `NOT IN`, the misread condition (third
this week), average-of-averages. Confidence corrected 4 → **5**, your own tap.

---
