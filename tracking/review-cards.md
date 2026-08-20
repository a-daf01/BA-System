# Review cards

**The back of every card in `tracking/review-queue.md`.** The queue holds the schedule —
what is due, when. This file holds what you actually need when the prompt is in front of
you and you cannot place it.

Every card has three parts:

- **From** — where this came from, so you can locate it in your own week rather than
  meeting it cold.
- **Hint** — a nudge towards the shape of the answer. Not the answer.
- **Answer** — the full thing, with the reasoning, not just the fact.

## How to use it

On the dashboard, tap a review item to open its card. You get **From** and **Hint**
immediately, and the answer sits behind one more tap.

That extra tap is deliberate and it is the whole mechanism. **Reading an answer produces
the feeling of knowing without the knowing.** Say your version out loud first, in full
sentences, then reveal and mark yourself. If you were close, that is a hit. If you blanked,
that is data — it goes in the day's confidence score, which is what moves the interval.

The tick box on the left is your place in the block. It is not a per-item score.

## Maintaining this file

Claude Code writes a card for **every** item it adds to the queue, at the same time it adds
it. `node scripts/check.js` fails if a queue item has no card, or if a card is missing its
hint or its answer, so this cannot silently drift.

Numbers in these answers were run against `data/northwind.db`, not remembered. If the
database is ever rebuilt, they have to be re-run.

---

## SQL — clauses and order of operations

### Why does WHERE COUNT(*) > 10 fail, and what do you use instead?

**From:** Day 1 baseline test. You tried it on "customers with more than 10 orders" and got an error.
**Hint:** Think about what the database has finished doing at the moment each clause runs.
**Answer:**
`WHERE` runs **before** rows are grouped. At that moment `COUNT(*)` does not exist yet — there are no groups to count, only individual rows. So the database rejects it.

`HAVING` runs **after** `GROUP BY` has built the groups, which is the first moment an aggregate has a value.

```sql
SELECT CustomerID, COUNT(*) AS orders
FROM Orders
GROUP BY CustomerID
HAVING COUNT(*) > 180;
```

The one-line version for an interview: **WHERE filters rows, HAVING filters groups.**

The logical order the database evaluates in is `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`. Nearly every "why can't I use that here" question in SQL is answered by pointing at that list.

### Why does SELECT TOP 5 fail in SQLite, and what replaces it?

**From:** Day 1, your first attempt at "show me the top 5".
**Hint:** `TOP` is not standard SQL. It belongs to one vendor.
**Answer:**
`TOP` is **T-SQL — Microsoft SQL Server only.** SQLite does not have it, and neither do Postgres, MySQL or Oracle before 12c. SQLite uses `LIMIT`:

```sql
SELECT ProductName, UnitPrice
FROM Products
ORDER BY UnitPrice DESC
LIMIT 5;
```

Two things that matter more than the keyword:

- **`LIMIT` without `ORDER BY` is meaningless.** It returns 5 arbitrary rows, not the top 5 — and it may return different rows on different runs. "Top" is a statement about ordering; the limit only truncates.
- **`OFFSET` paginates.** `LIMIT 5 OFFSET 5` gives rows 6–10, which is how you page through results.

Know the dialect map, because being asked to move a query between engines is a normal Tuesday:

- **SQL Server:** `SELECT TOP 5 ...`, or `OFFSET ... FETCH NEXT 5 ROWS ONLY`.
- **SQLite, Postgres, MySQL:** `LIMIT 5`.
- **Oracle:** `FETCH FIRST 5 ROWS ONLY` (12c+), or `ROWNUM` before that.

The ANSI-standard form is `FETCH FIRST n ROWS ONLY` — worth naming if someone asks what is actually portable.

### In a GROUP BY query, what does SUM() do, and where does the multiplication actually happen?

**From:** Day 1, writing revenue for the first time.
**Hint:** Two separate steps, and they happen in a fixed order. One is per row, one is per group.
**Answer:**
The multiplication happens **per row, before any grouping**. The sum happens **per group, after**.

```sql
SUM(od.UnitPrice * od.Quantity * (1 - od.Discount))
```

Read it inside out. For each detail line the database works out that line's revenue. Only then does `SUM` collapse every line in the group into one number.

This matters because it is the reason you cannot fix a wrong total by moving brackets. `SUM(UnitPrice) * SUM(Quantity)` is a completely different — and meaningless — number: it multiplies the sum of all prices by the sum of all quantities.

Say it as: **"the expression is evaluated row by row, then the aggregate collapses the rows."**

### Say the order you build a SQL query in, and why it is not the order it reads in.

**From:** Day 2, after you wrote clauses in reading order and kept having to restart.
**Hint:** Reading order starts with what you want. Building order starts with where it lives.
**Answer:**
It **reads** `SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY`.

It **executes** — and you should **build** — `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`.

Build it in execution order:

- **FROM / JOIN** — what tables, at what grain? Run it. Check the row count is what you expect.
- **WHERE** — cut rows down before anything expensive. Run it again.
- **GROUP BY** — decide the grain of the answer.
- **HAVING** — filter the groups.
- **SELECT** — only now pick the columns.
- **ORDER BY** — last, cosmetic.

Why it works: each step is checkable on its own. If you write `SELECT` first you have committed to columns before you know what the join is doing to your rows, and a fan-out will not show up until the total is already wrong.

### Say why `A OR B AND C` is not `(A OR B) AND C`, and which operator binds tighter.

**From:** Day 2, a multi-condition WHERE that returned far more rows than you expected.
**Hint:** Same rule as arithmetic. One of the two is the multiplication.
**Answer:**
**AND binds tighter than OR.** `A OR B AND C` is read by the database as `A OR (B AND C)`.

It is exactly like `2 + 3 * 4` being 14, not 20. AND is the multiplication, OR is the addition.

The damage case: `WHERE Country = 'UK' OR Country = 'France' AND OrderDate >= '2023-01-01'` returns **every UK order ever**, plus French orders from 2023 — because the date filter only attaches to the France branch. It looks like it worked. It returns a plausible number. It is wrong.

The rule to actually live by: **once a WHERE clause contains both AND and OR, bracket it, always** — even when you are sure. Brackets cost nothing and the failure is silent.

### Read "products above 20 that are not discontinued" aloud. How many conditions is that, and what is the five-second check that catches a dropped one?

**From:** Day 2, translating a plain-English request into a WHERE clause.
**Hint:** Count the things the sentence asks for, then count the things your query does.
**Answer:**
**Two conditions.** "above 20" is one, "not discontinued" is the other.

```sql
SELECT ProductName, UnitPrice
FROM Products
WHERE UnitPrice > 20 AND Discontinued = '0';
```

That returns **31 rows** in this database.

The five-second check: **count the conditions in the sentence, then count the conditions in your WHERE clause, and make sure the two numbers match.** Say them out loud as a list — "above twenty; not discontinued; that's two."

Almost every wrong query a stakeholder ever receives is a dropped condition, not broken syntax. Broken syntax errors. A dropped condition returns a confident number that is too big.

### You wrote `Discontinued IS 0` and it worked. Say why, and why that same query fails on SQL Server.

**From:** Day 2, filtering the Products table.
**Hint:** `IS` is not a general comparison operator. SQLite is being unusually generous.
**Answer:**
In standard SQL, `IS` exists for one job: **`IS NULL` and `IS NOT NULL`.** Comparing a value uses `=`.

**SQLite extends it** — it lets `IS` act as an equality test that also treats two NULLs as equal. So `Discontinued IS 0` runs, and returns rows. On **SQL Server, Postgres, MySQL and Oracle** the same line is a syntax error.

There is a second trap sitting underneath it in this database. `Discontinued` is stored as **TEXT**, not an integer — `'0'` for 69 products and `'1'` for 8. So the query you want is:

```sql
WHERE Discontinued = '0'
```

Portable habit: **`=` to compare values, `IS` only with NULL.** Anything an engine lets you get away with is something the next engine will not.

### Why does `= NULL` return nothing, and what do you use instead?

**From:** Day 2, trying to find rows with a missing value.
**Hint:** NULL is not a value. It is the absence of one, and two absences are not equal.
**Answer:**
NULL means **unknown**. Comparing anything to an unknown gives **unknown**, not true or false — and `WHERE` only keeps rows where the condition is **true**. So `WHERE ShippedDate = NULL` returns zero rows, silently, forever.

Use the null-specific operators:

```sql
WHERE ShippedDate IS NULL       -- 21 orders in this database
WHERE ShippedDate IS NOT NULL
```

The knock-on effects worth naming in an interview:

- `NULL = NULL` is **not** true. Two unknowns are not the same unknown.
- Aggregates skip NULLs: `AVG(col)` divides by the count of non-null rows, not all rows.
- `COUNT(col)` skips NULLs; `COUNT(*)` does not. That difference has produced a lot of wrong denominators.

### You wrote 'B%' and '%market%'. Say what each wildcard does, and name one case where LIKE is the wrong tool

**From:** Day 2, pattern-matching on company names.
**Hint:** One anchors, the other floats. And think about what a leading wildcard does to an index.
**Answer:**
`%` matches **any run of characters, including none**. `_` matches **exactly one character**.

- `'B%'` — starts with B. Anchored at the front.
- `'%market%'` — contains "market" anywhere. Anchored at neither end.

When LIKE is the wrong tool:

- **A leading `%` cannot use an index.** `'%market%'` forces a full scan of the column. On 609,283 detail lines that is the difference between instant and a coffee break. Fine for exploring, not fine in a report that runs nightly.
- **Matching a set of exact values.** `IN ('UK','France','Germany')` is clearer and faster than three LIKEs.
- **Structured text** — postcodes, IDs, dates stored as strings. Use a proper function or fix the data type. A LIKE pattern that encodes a format is a data-modelling problem wearing a disguise.

Also: LIKE is case-insensitive for ASCII in SQLite, and case-**sensitive** in Postgres. Never assume it travels.

### Why does SELECT * FROM [Order Details] fail, and what are the two ways to fix it?

**From:** Day 1, the first time you queried the line-items table.
**Hint:** Look at the table name itself, character by character.
**Answer:**
The table name **contains a space**. Unquoted, the parser reads `Order` as the table and then hits `Details` with no idea what to do with it.

Two fixes:

```sql
SELECT * FROM [Order Details];   -- brackets: SQL Server and SQLite
SELECT * FROM "Order Details";   -- double quotes: the ANSI standard, works nearly everywhere
```

Backticks (`` `Order Details` ``) are the MySQL version. SQLite accepts all three, which is why it is a bad place to learn what is portable.

The BA point worth making out loud: **a space in an object name is a data-modelling defect, not a quirk.** It leaks into every query, every ETL job and every BI tool downstream. When you see one in a client's warehouse, that is a finding.

### Which Northwind download works with DB Browser for SQLite, and why does the sql-server-samples one not?

**From:** Day 1 setup, when the first download would not open.
**Hint:** Same dataset, two completely different kinds of file.
**Answer:**
You need a **`.db` file** — the SQLite build, from `jpwhite3/northwind-SQLite3`.

Microsoft's `sql-server-samples` repo ships **`instnwnd.sql`**: a T-SQL *script* that builds the database when you run it against a SQL Server instance. It is instructions, not data. DB Browser for SQLite has nothing to execute them with, and the T-SQL dialect inside it is not SQLite anyway.

Same schema, different engine, different artifact. The transferable habit: **name the engine, not just the dataset.** "I've queried Northwind" invites "in what?" — and "the SQLite build, 16,282 orders, re-dated to 2012–2023" is a much better second sentence than "um".

### Is ROUND an alternative to SUM? Say what each one does and how you would use both in one query.

**From:** Day 1, when you asked whether one could replace the other.
**Hint:** One collapses many rows into one. The other changes a single number's precision.
**Answer:**
They are not alternatives — they do unrelated jobs, and they usually appear together.

- **`SUM()`** is an **aggregate**: many rows in, one number out. It changes the grain.
- **`ROUND()`** is a **scalar function**: one number in, one number out. It changes precision only.

Nested, outermost last:

```sql
SELECT ca.CategoryName,
       ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2) AS revenue
FROM [Order Details] od
JOIN Products p   ON p.ProductID  = od.ProductID
JOIN Categories ca ON ca.CategoryID = p.CategoryID
GROUP BY ca.CategoryName;
```

Round **after** summing, never before. Rounding each of 609,283 lines and then adding them up accumulates the rounding error 609,283 times.

Presentation point: rounding in SQL bakes the decision into the data. Rounding in Power BI leaves the underlying value intact and formats it for display. **Prefer formatting in the BI layer** — you can always change a format, you cannot un-round a stored number.

### A stakeholder wants "countries where we have more than 5 customers". Say which clause the `> 5` goes in, and what error you get if you put it in the other one

**From:** Day 5 aggregation work, and it is the same shape as the Day 1 error you hit.
**Hint:** "Countries where we have more than five" is a statement about a group, not a row.
**Answer:**
`HAVING`. The `> 5` is a fact about a **country**, and a country only exists as a thing to count once `GROUP BY` has built it.

```sql
SELECT Country, COUNT(*) AS customers
FROM Customers
GROUP BY Country
HAVING COUNT(*) > 5
ORDER BY customers DESC;
```

Five countries qualify: **USA 13, Germany 11, France 11, Brazil 9, UK 7.**

Put it in `WHERE` and you get *"misuse of aggregate function COUNT()"* in SQLite, or *"aggregates are not allowed in WHERE"* in most other engines — because at `WHERE` time the groups do not exist yet.

The listening skill: **"countries where we have more than 5 customers" is one sentence containing two grains.** "Customers" is the row grain, "countries" is the answer grain. Any time a request names two nouns like that, you are writing a GROUP BY.

### "Categories whose 2023 revenue was above £4m." Say why the year filter cannot go in HAVING, and why the £4m filter cannot go in WHERE

**From:** Day 5, the request that needs both clauses at once.
**Hint:** One condition is true or false about a single line. The other is only true or false about a whole category.
**Answer:**
They filter at two different grains, so they live in two different clauses.

- **The year** is a property of a **row** — one order has one date. Filter it in `WHERE`, before grouping, so the rows that get summed are already the right ones.
- **The £4m** is a property of a **group** — no single line is "above £4m in 2023". It only exists after `SUM`. So it goes in `HAVING`.

```sql
SELECT ca.CategoryName,
       ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2) AS rev_2023
FROM [Order Details] od
JOIN Orders o     ON o.OrderID    = od.OrderID
JOIN Products p   ON p.ProductID  = od.ProductID
JOIN Categories ca ON ca.CategoryID = p.CategoryID
WHERE o.OrderDate >= '2023-01-01' AND o.OrderDate < '2024-01-01'
GROUP BY ca.CategoryName
HAVING SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) > 4000000
ORDER BY rev_2023 DESC;
```

Five categories clear it: **Beverages £6.76m, Confections £4.92m, Meat/Poultry £4.74m, Dairy £4.22m, Condiments £4.16m.**

Putting the year in `HAVING` also costs you performance — you would sum every year for every category and then throw most of it away.

### Write the SQL for Northwind customers with more than 180 orders, then say what it tells the business. (Every customer in this build has at least 154, so a threshold of 10 would return all 93 and tell you nothing — say how you'd pick a threshold on data you'd never seen.)

**From:** Day 1, "customers with more than 10 orders" — the question that returned all 93 rows.
**Hint:** The SQL is the easy half. The interesting half is where the number in the filter comes from.
**Answer:**
```sql
SELECT c.CustomerID, c.CompanyName, COUNT(*) AS orders
FROM Customers c
JOIN Orders o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CompanyName
HAVING COUNT(*) > 180
ORDER BY orders DESC;
```

**28 of 93 customers** clear 180. The range across all customers is **154 to 210** — which is why `> 10` returns everyone and answers nothing.

How to pick a threshold on unfamiliar data — this is the actual BA answer:

- **Profile before you filter.** `SELECT MIN(n), MAX(n), AVG(n)` over the counts, or just look at the distribution. Thirty seconds, and it stops you shipping a filter that does nothing.
- **Ask what decision hangs on it.** "Top 20 for the account-management pilot" is a rank, not a threshold. "Customers we'd class as strategic" needs the business's own definition, not yours.
- **Prefer a rank or a percentile to a magic number** when nobody can define one. `ORDER BY orders DESC LIMIT 20` is defensible; `> 180` invites "why 180?" and you need an answer.

Say out loud: **"a filter that removes nothing is a bug, even though it runs clean."**

### "Count of unshipped orders next to the count of all orders." Write it — one query, no subquery. Then say what phrase in a request tells you to reach for this pattern.

**From:** Day 5 aggregation, on the 21 orders in this database that never shipped.
**Hint:** Put the condition inside the aggregate instead of in the WHERE clause.
**Answer:**
This is **conditional aggregation**. `WHERE` cannot do it, because `WHERE` would remove the rows you still need for the "all orders" half.

```sql
SELECT COUNT(*) AS all_orders,
       SUM(CASE WHEN ShippedDate IS NULL THEN 1 ELSE 0 END) AS unshipped
FROM Orders;
```

Returns **16,282 and 21**.

`COUNT(CASE WHEN ShippedDate IS NULL THEN 1 END)` works too — COUNT ignores NULLs, so the ELSE is unnecessary there. The `SUM(CASE...)` form is the one to remember because it generalises to sums of money, not just counts.

**The trigger phrase is "next to" — and its relatives: "alongside", "as a percentage of", "split by ... on the same row", "compared with the total".** Any request where two different filters have to appear on **one row** is conditional aggregation. Two filters on two rows is just `GROUP BY`.

This is also the SQL ancestor of `CALCULATE` in DAX. Same idea: change the filter for one number without changing it for the others.

## SQL — joins and fan-out

### You wrote `INNER JOIN Orders ... WHERE o.OrderID IS NULL` and got 0 rows. Say why that returns 0 on every database that has ever existed, and what you should have written

**From:** Day 3, trying to find customers with no orders.
**Hint:** Ask what an INNER JOIN has already done to the rows before your WHERE clause ever sees them.
**Answer:**
An `INNER JOIN` **only emits rows where the match succeeded.** So `o.OrderID` is guaranteed non-null in every row it produces. Asking for `o.OrderID IS NULL` after an inner join is asking for rows that the join, by definition, did not create. Zero rows. Always. Everywhere.

The anti-join pattern needs a **LEFT JOIN**, which keeps unmatched left rows and fills the right side with NULLs:

```sql
SELECT c.CustomerID, c.CompanyName
FROM Customers c
LEFT JOIN Orders o ON o.CustomerID = c.CustomerID
WHERE o.OrderID IS NULL;
```

**Important for this database:** that still returns 0 rows here, and that is not your mistake. Referential integrity in this build is perfect — zero orphans on all ten foreign-key paths, and every one of the 93 customers has orders. The pattern is right; the data has nothing for it to find.

To make it bite here, the anti-join needs a **date or attribute condition**, which is the lapsed-customer shape:

```sql
SELECT c.CustomerID, c.CompanyName
FROM Customers c
LEFT JOIN Orders o
  ON o.CustomerID = c.CustomerID
 AND o.OrderDate >= '2023-01-01'
WHERE o.OrderID IS NULL;
```

Note where the date sits — in the `ON`, not the `WHERE`. That is the next card.

### "Every customer, and their order count since Oct 2023." One version returns 93 customers, the other 58. Say which clause the date filter is in, in each — and why the 58 version is the wrong answer to that question

**From:** Day 4, the JOIN repair block.
**Hint:** A LEFT JOIN keeps unmatched rows right up until something tests a column from the right-hand table.
**Answer:**
- **93 rows — filter in the `ON`.** The date becomes part of the match condition. Customers with no qualifying order still appear, with NULL/0 against them.
- **58 rows — filter in the `WHERE`.** The WHERE runs *after* the join. For a non-matching customer the Orders columns are all NULL, so `o.OrderDate >= '2023-10-01'` evaluates to unknown, the row is dropped, and **the LEFT JOIN has silently become an INNER JOIN.**

```sql
-- Correct for "every customer": 93 rows
SELECT c.CompanyName, COUNT(o.OrderID) AS orders_since_oct
FROM Customers c
LEFT JOIN Orders o
  ON o.CustomerID = c.CustomerID
 AND o.OrderDate >= '2023-10-01'
GROUP BY c.CustomerID, c.CompanyName;
```

The question said **"every customer"**. The 58-row version answers a different question — "customers who ordered since October" — and quietly deletes the 35 that a retention analysis is entirely about.

The rule: **on a LEFT JOIN, conditions on the right-hand table go in the ON. Conditions on the left-hand table go in the WHERE.** Also use `COUNT(o.OrderID)`, not `COUNT(*)` — `COUNT(*)` counts the NULL placeholder row and reports 1 for a customer with nothing.

### Orders holds 16,282 rows and £4,047,470 of freight. Join it to [Order Details] and freight comes back £206,911,676. Say what happened, and the one check that catches it before you send the report

**From:** Day 3, the first big wrong number you produced.
**Hint:** Freight is stored once per order. How many times does the join make that row appear?
**Answer:**
**Row fan-out.** `Orders` → `[Order Details]` is one-to-many. Every order row is duplicated once per line item, and `Freight` — an **order-level** value — is duplicated with it. Summing it then counts the same £48 once for every product on the order.

This build averages **37.4 lines per order** (609,283 detail rows against 16,282 orders), so freight inflates about **51×**: £4.05m becomes £206.9m.

The check, and it takes ten seconds: **`SELECT COUNT(*)` before the join and after it.** 16,282 → 609,283 is a 37× jump, which tells you immediately that any order-level column you sum afterwards is now wrong.

The fix is to aggregate at the right grain — either sum freight from `Orders` alone, or aggregate the detail lines first and join to the result:

```sql
SELECT SUM(Freight) FROM Orders;   -- £4,047,470.50, the real number
```

The habit to state in an interview: **"I check the row count either side of every join. A total that moves when a join is added is a fan-out until proven otherwise."**

### Order 10273 carries £48.00 of freight and has 5 product lines. Join Orders to [Order Details] and that order's freight sums to £240.00. Say the rule that predicts the 240 before you run it

**From:** Day 3, the single-order version of the £206m problem — small enough to check by hand.
**Hint:** It is one multiplication, and you can do it in your head.
**Answer:**
**Freight × number of line items.** 48 × 5 = **240**.

That is the whole rule, and it is worth being able to say instantly: **a one-to-many join multiplies every column on the "one" side by that row's own match count.**

Two consequences that matter more than the arithmetic:

- **The multiplier is per row, not global.** Order 10273 is multiplied by 5; an order with 40 lines is multiplied by 40. So you cannot "correct" an inflated total by dividing by an average.
- **It is why rankings move**, not just totals. See the freight-ranking card.

Being able to predict a wrong number before running the query is the difference between checking your work and hoping. Pick one small entity, work out what it should be by hand, and compare. That is the whole of data validation in one sentence.

### You ranked customers by freight two ways. Joined through [Order Details] the top 5 ended IT, B's Beverages, Hungry Coyote, Morgenstern, Piccolo; straight from Orders, positions 4 and 5 were two different companies. Say why inflated numbers still change *who* is top, and what that costs if you send it

**From:** Day 3, after the £206m freight number.
**Hint:** If everyone were inflated by the same factor, the order would survive. Ask whether they are.
**Answer:**
Each customer is multiplied by **its own average line count**, not by a shared constant. A customer with big baskets is inflated harder than one with small baskets, so the ranking scrambles.

Straight from `Orders`, positions 4 and 5 are **Ricardo Adocicados** and **Gourmet Lanchonetes**. Joined through `[Order Details]` they are **Morgenstern Gesundkost** and **Piccolo und mehr**. Same data, same "correct" SQL, different names in the top five.

Why this is the dangerous version of the fan-out bug:

- A total that is obviously 51× too big **gets caught**. Someone says "we don't spend £207m on postage."
- A **ranking** looks completely plausible. Every name on it is a real customer. Nothing about it invites a second look.

What it costs: the top-5 list is what drives action — who gets the account manager, who gets the discount, who gets called. Send the wrong two names and the business spends real money on the wrong accounts, and nobody finds out from the report itself.

The check is the same one: **row count before and after the join**, plus sanity-check one entity by hand.

### Say the cardinality of Customers→Orders and of Orders→[Order Details] using the words "one to many", then say which of the two caused your £206m freight number

**From:** Day 10, the relational model block, tying the vocabulary to the bug you already hit.
**Hint:** Both are one-to-many. Only one of them was in the path between freight and the grain you summed at.
**Answer:**
- **Customers → Orders is one-to-many.** One customer has many orders; each order has exactly one customer.
- **Orders → [Order Details] is one-to-many.** One order has many line items; each line belongs to exactly one order.

**Orders → [Order Details] caused the £206m.** `Freight` lives on `Orders`. Joining to the detail lines pushed the grain down to one row per product per order, duplicating the freight value 37 times on average.

`Customers → Orders` was innocent here, but it does exactly the same thing to any customer-level column — a credit limit, a region, a contract value. The mechanism is identical, and it would inflate by ~175× (16,282 orders / 93 customers).

Say the general rule out loud: **"joining down a one-to-many relationship duplicates every attribute on the one side. Anything I sum after that has to belong to the new grain, or be aggregated before the join."**

## SQL — dates

### Your 1997 query returned nothing and you called it a trick question. Say the one line of SQL you run before deciding a filter is wrong.

**From:** Day 2. The exercise asked for 1997 data; this database has none.
**Hint:** Before arguing with the filter, ask the data what it actually contains.
**Answer:**
```sql
SELECT MIN(OrderDate), MAX(OrderDate), COUNT(*) FROM Orders;
```

Range: **2012-07-10 to 2023-10-28**, 16,282 orders. There is no 1997 in this build — it has been re-dated. Textbook Northwind is 1996–1998 with 830 orders; this one is not textbook Northwind.

The point is not the date range. It is the **order of suspicion**. When a query returns zero rows, the instinct is to assume the query is broken. Half the time the data is simply not there, and you can find that out in one line.

Run this before every date-filtered exercise, every time, on any new dataset:

```sql
SELECT COUNT(*), MIN(col), MAX(col) FROM t;
```

That is also the first thing to say when a stakeholder reports "the report is empty". **Empty is an answer.** Distinguishing "no matching data" from "broken query" in the first thirty seconds is most of what makes an analyst quick.

### Your Q1 2016 query returned 350 orders using BETWEEN. The right answer is 357. Say what BETWEEN did to the last day of the range, and what you write instead.

**From:** Day 2, your first date-range filter.
**Hint:** What time of day is `'2016-03-31'` when the database converts it for comparison?
**Answer:**
`BETWEEN '2016-01-01' AND '2016-03-31'` is inclusive of both endpoints — but the upper endpoint is read as **`2016-03-31 00:00:00`**. Every order placed *during* 31 March, with any time on it, is after that instant and gets dropped. **7 orders lost.**

Write a half-open range instead:

```sql
WHERE OrderDate >= '2016-01-01' AND OrderDate < '2016-04-01'
```

`>= start AND < the day after the end`. It is correct whether or not the column carries a time, and it stays correct if someone adds times later.

The nastier detail in this specific database: it holds **two date formats in the same column**. The original 830 orders are date-only (`2017-03-31`), the 15,452 generated ones are timestamps (`2017-03-31 14:22:07`). So on Q1 2017, `BETWEEN` loses 8 orders but **two orders on 31 March survive** — because they are date-only rows that match the literal exactly.

**Same query, same day, two different behaviours depending on which row it hits.** That is the argument for never using BETWEEN on dates, in any database, ever.

### `WHERE OrderDate >= '2023'` returns all 16,282 orders. `WHERE OrderDate >= '2023-01-01'` returns 1,132. Say what the database did with the bare '2023', and why this is more dangerous than a query that errors.

**From:** Day 2, and it is the single most dangerous behaviour in this database.
**Hint:** The column is declared DATETIME. In SQLite that gives it a type affinity, and the affinity is not "text".
**Answer:**
`OrderDate` is declared `DATETIME`, which in SQLite gives the column **NUMERIC affinity**. The literal `'2023'` converts cleanly to the integer 2023. The stored values are TEXT and cannot convert to a number, so they stay TEXT — and **SQLite sorts all TEXT above all NUMERIC**. Every row is therefore "greater than" 2023.

```sql
WHERE OrderDate >= '2023'       -- 16,282 rows. ALL of them.
WHERE OrderDate >= '2023-01-01' -- 1,132 rows.  Correct.
WHERE OrderDate <  '2013'       -- 0 rows.
WHERE OrderDate <  '2013-01-01' -- 654 rows.    Correct.
```

Why it is worse than an error: **an error stops you.** This returns instantly, with no warning, and hands you a number that looks like an answer. You would only catch it by knowing roughly what 2023 should be — and on a client's data you never do.

Defences:

- Always a full `YYYY-MM-DD` literal. Never a bare year.
- For year grouping use `strftime('%Y', OrderDate)`, which is explicit about the conversion.
- Sanity-check every filter by its row count. "The filter returned every row" is a red flag, not a result.

### 2022 was £39.7m and 2023 was £33.1m. Say why that is not a 17% fall, and how you would check for it on a dataset you had never seen

**From:** Day 17 time intelligence, using this database's real yearly totals.
**Hint:** Count the months in each year before comparing them.
**Answer:**
**2023 is a partial year.** The data ends **28 October 2023** — roughly ten months against twelve. Comparing it to a full 2022 is comparing ten months to twelve and calling the missing two a decline.

Annualised, 2023 is running at about £39.7m — **flat**, which matches every other year in the series (£38–41m from 2013 onwards). 2012 has the same problem at the other end: it starts 10 July, which is why it shows £18.8m.

How to catch it on unfamiliar data, in this order:

- **`SELECT MIN(date), MAX(date)` first, always.** Ten seconds, and it settles it.
- **Plot the counts, not just the totals.** A partial period shows up as a cliff at one end, not a trend.
- **Compare like periods.** YTD against YTD to the same cut-off date, not year against year.
- **Ask when the extract was taken.** A "decline" that starts exactly at the extract date is not a decline.

The interview version: **"the first thing I check on any time series is whether the first and last periods are complete, because a partial period at either end reads as a trend and it isn't one."**

## SQL — subqueries, CTEs and window functions

### Name the two things a CTE gives you that a subquery does not, and one case where the plain subquery is still the better call

**From:** Day 8, subqueries and CTEs.
**Hint:** One benefit is about reading it, the other is about using it more than once.
**Answer:**
- **Readability and order.** A CTE is named and sits at the top, so the query reads top-to-bottom in the order the work happens. A nested subquery reads inside-out, and three levels deep nobody can follow it — including you, in a fortnight.
- **Reuse.** A CTE can be referenced **multiple times** in the same query. An inline subquery has to be written out again each time it is needed.

There is a third, and it is the one that gets you hired: **recursion.** `WITH RECURSIVE` walks hierarchies — Northwind's `Employees.ReportsTo` chain, a bill of materials, an org tree. A plain subquery cannot do it at all.

When the plain subquery is better:

- **A single scalar value used once.** `WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM Products)` is clearer inline. Naming it in a CTE adds ceremony and no meaning.
- **A simple `EXISTS` / `IN` existence check.** Same argument.

The honest framing: **CTEs are for structure, not speed.** In most engines the optimiser flattens both to the same plan. Choose on readability, and say so — "I use CTEs when the query has steps I'd want to name" is a much better answer than "CTEs are faster", which is not reliably true.

### Say the difference between a correlated and an uncorrelated subquery, and which one runs once per row

**From:** Day 8.
**Hint:** The question is whether the inner query can be run on its own, or whether it needs a value from the outer one.
**Answer:**
- **Uncorrelated** — the inner query is self-contained. You could copy it out, run it alone, and get an answer. The database runs it **once** and reuses the result.

  ```sql
  WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM Products)
  ```

- **Correlated** — the inner query references a column from the outer query, so it cannot run alone. Conceptually it runs **once per outer row**.

  ```sql
  SELECT c.CompanyName
  FROM Customers c
  WHERE EXISTS (SELECT 1 FROM Orders o
                WHERE o.CustomerID = c.CustomerID
                  AND o.OrderDate >= '2023-01-01');
  ```

  `o.CustomerID = c.CustomerID` is the correlation.

**The correlated one runs once per row** — that is the answer to the question as asked, and it is why it is the performance risk. On 93 customers it is nothing. On a million-row table it is a million executions.

Say the caveat too, because it shows you have actually used them: **modern optimisers frequently rewrite a correlated subquery into a join or a semi-join**, so the "once per row" model is the logical behaviour, not always the physical plan. Read the plan before you optimise on instinct.

### Why is `NOT IN` dangerous when the inner query can return a NULL, and what do you write instead?

**From:** Day 8, and it is the classic SQL interview trap.
**Hint:** Trace what `x NOT IN (1, 2, NULL)` actually evaluates to, condition by condition.
**Answer:**
`x NOT IN (1, 2, NULL)` expands to `x <> 1 AND x <> 2 AND x <> NULL`. That last comparison is **unknown**, never false — and `AND` with unknown can never produce true. So the whole condition is unknown for every row, and **`NOT IN` returns zero rows** the moment a single NULL appears in the list.

No error. No warning. An empty result set that looks like "there are none".

Write `NOT EXISTS` instead — it is null-safe, because it tests for the existence of a matching row rather than comparing values:

```sql
SELECT c.CustomerID
FROM Customers c
WHERE NOT EXISTS (
  SELECT 1 FROM Orders o
  WHERE o.CustomerID = c.CustomerID
    AND o.OrderDate >= '2023-01-01'
);
```

A `LEFT JOIN ... WHERE right.key IS NULL` anti-join is equally safe.

If you must keep `NOT IN`, add `WHERE col IS NOT NULL` to the inner query — but `NOT EXISTS` is the habit worth building, because it is correct without you having to remember why.

### "Rank products by revenue within each category." Say which clause does the "within each category" part, and why GROUP BY cannot do this job

**From:** Day 9, window functions.
**Hint:** You need every product row to survive and still know where it sits inside its category.
**Answer:**
**`PARTITION BY`**, inside the `OVER()` clause.

```sql
SELECT ca.CategoryName, p.ProductName,
       SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS revenue,
       RANK() OVER (PARTITION BY ca.CategoryName
                    ORDER BY SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) DESC) AS rank_in_cat
FROM [Order Details] od
JOIN Products p    ON p.ProductID  = od.ProductID
JOIN Categories ca ON ca.CategoryID = p.CategoryID
GROUP BY ca.CategoryName, p.ProductName;
```

`GROUP BY` cannot do it because **`GROUP BY` collapses rows** — it gives you one row per category, and the individual products are gone. Ranking needs both things at once: the detail rows *and* an aggregate computed across the group they belong to.

That is the whole distinction, and it is the sentence to say out loud: **`GROUP BY` collapses rows; a window function adds a column to rows that survive.** `PARTITION BY` is "group by, but without losing the rows".

### Describe the top-N-per-group pattern out loud, and say why you cannot filter on the rank in the same SELECT

**From:** Day 9.
**Hint:** Order of operations again. When does SELECT run relative to WHERE?
**Answer:**
The pattern is **two steps**: compute the rank in an inner query or CTE, then filter on it in an outer one.

```sql
WITH ranked AS (
  SELECT ca.CategoryName, p.ProductName,
         SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS revenue,
         ROW_NUMBER() OVER (PARTITION BY ca.CategoryName
                            ORDER BY SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) DESC) AS rn
  FROM [Order Details] od
  JOIN Products p    ON p.ProductID  = od.ProductID
  JOIN Categories ca ON ca.CategoryID = p.CategoryID
  GROUP BY ca.CategoryName, p.ProductName
)
SELECT * FROM ranked WHERE rn <= 3;
```

You cannot write `WHERE rn <= 3` in the same SELECT because **`WHERE` runs before `SELECT`**, and window functions are evaluated at `SELECT` time. At `WHERE` time `rn` does not exist yet. It is the same shape as the `WHERE COUNT(*) > 10` error, one clause further along.

Know the three ranking functions and the difference, because it gets asked:

- **`ROW_NUMBER()`** — always 1,2,3. Ties broken arbitrarily. Use it when you need exactly N rows.
- **`RANK()`** — ties share a rank and leave a gap: 1,1,3.
- **`DENSE_RANK()`** — ties share a rank, no gap: 1,1,2.

"Top 3 per category" with `ROW_NUMBER` gives exactly 3. With `RANK` it can give 4 if two products tie. Say which you chose and why.

### Your 2016 month-on-month query returned NULL for January. Say why, and what you show a stakeholder instead of a blank cell

**From:** Day 9, your first LAG query.
**Hint:** What is the previous month, for the first month in the window?
**Answer:**
`LAG()` looks one row back inside the partition. **For the first row there is no previous row**, so it returns NULL — and any arithmetic on NULL is NULL, so the change and the percentage are both blank.

January 2016 has **113 orders**, and no December 2015 inside the window to compare against.

What to do about it — and the choice matters more than the syntax:

- **Show a blank, labelled.** "—" with a footnote saying the prior period is outside the range. Honest, and usually right.
- **`LAG(x, 1, 0)`** supplies a default of 0. **Be careful**: this turns "unknown" into "we sold nothing in December", which is a lie, and produces an infinite or 100% growth figure.
- **Widen the window.** Pull December 2015 into the query and filter it out of the display. Now January has a real comparator.

What **not** to do is `COALESCE(pct_change, 0)`. Zero means "no change", and you have just told the business that January was flat when you actually do not know.

The general principle, worth saying in an interview: **a null in a report is a statement about what you know. Replacing it with a number replaces knowledge with a guess, and the stakeholder cannot tell which they are looking at.**

## Data quality and choosing the right column

### Northwind holds 93 customers but only 92 distinct company names, and one CustomerID has a trailing space. Say what breaks if you GROUP BY the company name instead of the key, and how you'd word that as a defect for a stakeholder

**From:** the database profile — a real defect in this build, not a made-up one.
**Hint:** Two different customers, one label. What happens to their numbers when you group by the label?
**Answer:**
`'Val2 '` and `'VALON'` are two separate customer records **both called `IT`**. Group by `CompanyName` and they merge into one row — two customers' revenue added together under a single name.

What breaks:

- **Counts are wrong.** 92 rows instead of 93. Nobody notices one missing customer.
- **The merged row is inflated** and could easily rank top, which sends a decision the wrong way.
- **It cannot be un-picked downstream.** Once the grouping has happened the two are indistinguishable.

Always `GROUP BY` the **key** and carry the name along for display:

```sql
GROUP BY c.CustomerID, c.CompanyName
```

The trailing space in `CustomerID = 'Val2 '` is a second, separate defect: joins on trimmed versus untrimmed values silently fail, and it is invisible on screen.

Worded for a stakeholder — no jargon, impact first:

> Two customer records share the company name "IT", and one customer ID has a trailing space. Any report grouped by company name will combine those two customers into a single row, overstating that row and understating our customer count by one. Both records also have no address or country and a contact name of "Val2", which suggests they are test data. Recommendation: confirm whether they are real, and until then report by customer ID rather than name.

That paragraph — **what, so what, recommendation** — is the shape of every defect you will ever raise.

### Rank revenue by country using Customers.Country and then using Orders.ShipCountry: positions 2 and 3 swap between Germany and France. Both queries are correct SQL. Say what question each one actually answers, and what you'd ask the stakeholder before picking.

**From:** the database profile. 13,832 of 16,282 orders ship to a different country than the customer is registered in.
**Hint:** One column is about who pays. The other is about where the box goes.
**Answer:**
- **`Customers.Country`** is where the customer is **registered** — the billing or account country. It answers *"which markets are our customers in?"*
- **`Orders.ShipCountry`** is where the goods were **delivered**. It answers *"where is our product actually going?"*

The numbers, from this database:

- **By `Customers.Country`:** 1 USA £62.6m · 2 **France £53.3m** · 3 **Germany £51.2m**
- **By `Orders.ShipCountry`:** 1 USA £63.9m · 2 **Germany £59.1m** · 3 **France £49.1m**

Positions 2 and 3 swap. **Neither query is wrong.** They answer different questions, and 85% of orders disagree.

What to ask the stakeholder — and asking is the answer here, not picking:

- **"What decision does this feed?"** Sales-territory targets and account ownership follow the billing country. Logistics, tax, duty and delivery SLAs follow the ship-to country.
- **"Is this going alongside another report?"** If finance already publishes by billing country, matching them matters more than being theoretically right.

Then **write the choice on the face of the report**: "Revenue by customer billing country". A titled assumption is a decision. An untitled one is a trap for whoever reads it next.

This is the single most useful BA reflex there is: **when two columns could answer the question, the ambiguity is in the request, not the data.**

### Northwind's top 5 products by revenue come back in the same order whether you apply Discount or ignore it, and the total only moves 0.02%. Say why you apply it anyway.

**From:** Day 5. `Discount = 0` on 608,445 of 609,283 lines — 99.86% of them.
**Hint:** The reason is not statistical. It is about what the number is defined to mean.
**Answer:**
Because **revenue is defined as net of discount**, and you calculate what the business has defined, not what happens to move the number.

Total revenue with discount is **£448,386,633.17**; ignoring it, £448,475,298.72. A 0.02% gap, and the top-5 ranking is identical either way.

The reasons to include it regardless:

- **Correctness is not conditional on materiality.** "It didn't make much difference" is not a defence when someone reconciles your figure against finance and it is out by £88,665.
- **Materiality is a property of today's data.** If a promotion runs next quarter and 30% of lines carry a discount, the query you wrote silently becomes wrong. Nobody re-checks a query that has been running fine.
- **It is a definition you can be asked to defend.** "Revenue is unit price × quantity, net of line discount" is a sentence. "I left the discount out because it was small" is not.

The honest lesson from this dataset is the opposite of the usual one: **it teaches you to apply the business rule, not to hunt for the variable that swings the answer.**

One detail that gets people: `Discount` is stored as a **fraction** — 0.15 means 15%. `(1 - Discount)`, never `(1 - Discount/100)`.

### Point at Northwind: name one primary key, one foreign key, and say what breaks if the foreign key is not enforced

**From:** Day 10, the relational model block.
**Hint:** Pick a concrete example from the schema you have actually queried, then describe an order that points at a customer who does not exist.
**Answer:**
- **Primary key:** `Customers.CustomerID`. Uniquely identifies one customer; cannot be null; never reused.
- **Foreign key:** `Orders.CustomerID` → `Customers.CustomerID`. Each order points at exactly one customer.
- A **composite** example worth knowing: `[Order Details]` is keyed on `OrderID + ProductID` together — one row per product per order.

If the foreign key is not enforced you get **orphans**: order rows whose `CustomerID` matches no customer. What then breaks:

- **Inner joins silently drop them.** Revenue by customer excludes those orders, and the total no longer reconciles to revenue by month. Two reports, two answers, no error anywhere.
- **Counts disagree** depending on which table you count from.
- **Power BI relationships break or produce a blank row** to catch the unmatched keys.
- Nobody can tell whether the customer was deleted or never existed — the audit trail is gone.

Worth saying about **this** database: integrity here is **perfect** — zero orphans on all ten FK paths. That is why every anti-join on raw keys returns 0 rows, and it is a real property of the build, not a mistake you made.

### Explain 3NF to a non-technical manager in two sentences, without using the words "normal form"

**From:** Day 10.
**Hint:** Store each fact once, in the place it belongs to.
**Answer:**
> Every fact is stored exactly once, in the table it belongs to — a customer's address lives with the customer, not copied onto every order they place. That way, when the address changes, you change it in one place, and no report can ever disagree with another about what it is.

That is the whole thing. It is about **update consistency**, not tidiness.

Have the follow-ups ready, because this is where the interview goes:

- **The cost:** more tables, more joins, slower reads.
- **The trade:** transactional systems normalise, because writes must be safe and consistent. Analytical systems **deliberately denormalise** into star schemas, because reads must be fast and a warehouse is loaded once and read a thousand times.
- **The BA-level point:** "we normalise where we write and denormalise where we read" — that sentence tells an interviewer you understand why both exist, which is worth more than being able to recite the definitions.

## Data modelling and BI

### State the grain of your Northwind fact table in one sentence, then say what you did with Freight and why

**From:** Day 11, star schema design.
**Hint:** Grain is one sentence beginning "one row per…". Freight is the thing that does not fit it.
**Answer:**
> **One row per product per order** — the grain of `[Order Details]`, 609,283 rows.

**Freight does not belong at that grain.** It is charged once per order, so it lives at the order grain. Put it on the line-item fact table and every sum of it is inflated ~37× — the £4.0m → £206.9m bug.

The options, and being able to name the trade is the point:

- **Leave it on an order-header fact table** — a second fact at the order grain, sharing the same dimensions. Cleanest, and the standard answer.
- **Allocate it across the lines** — split £48 across 5 lines by value or quantity. Now it sums correctly, but every line carries an allocated figure that is not a real charge, and you must document the allocation rule.
- **Drop it** — legitimate if nobody asks about shipping cost. Say so explicitly rather than leaving it out silently.

The rule underneath all of it: **a measure can only live on a fact table whose grain it is actually recorded at.** Getting that wrong is the most common modelling error there is, and it never errors — it just inflates.

### Draw a star and a snowflake in the air and say the one structural difference, then why BI tools generally prefer the star

**From:** Day 11.
**Hint:** The difference is whether a dimension is allowed to point at another dimension.
**Answer:**
**Star:** one fact table in the middle, dimensions around it, **each dimension one join from the fact**. Dimensions are denormalised — Product carries its category name right on it.

**Snowflake:** the dimensions are normalised, so a dimension points at another dimension. Product → Category → Department. More tables, more hops.

Why BI tools prefer the star:

- **Fewer joins at query time.** Every extra hop is work on every visual refresh.
- **Simpler for the person building the report.** They see "Category" on the Product table, not a chain to traverse.
- **Predictable filter propagation.** In Power BI, filters flow from the one side to the many side. A star has one clear path from every dimension to the fact; a snowflake has chains, and chains are where ambiguity and bidirectional-filter workarounds creep in.
- **Storage is not the constraint.** Repeating "Beverages" 200,000 times costs almost nothing under columnar compression. Saving that space was a 1990s concern.

When a snowflake is right: a genuinely huge dimension, or one shared across several models where maintaining it in one place matters more than the extra hop.

### What is a data mart, and how is it different from a warehouse? Answer as if a hiring manager asked it

**From:** Day 11.
**Hint:** Scope and audience. One serves the organisation, the other serves a department.
**Answer:**
> A data warehouse is the organisation-wide, integrated store — every source, conformed and historised, serving everyone. A data mart is a **subset shaped for one department or subject area** — the finance mart, the sales mart — modelled for the questions that team actually asks.

The distinctions that matter in practice:

- **Scope.** Warehouse = enterprise. Mart = one business function.
- **Audience.** Warehouse serves data teams and downstream systems. Mart serves a named group of report users.
- **Build direction.** *Top-down* (Inmon): build the normalised warehouse first, then carve marts out of it. *Bottom-up* (Kimball): build conformed marts first, and the warehouse emerges as the union of them. Naming Kimball and Inmon here is cheap and lands well.
- **The risk.** Marts built independently drift — two teams define "active customer" differently and the numbers stop matching. **Conformed dimensions** are the answer, and being able to say that word in context is worth having.

Keep it to about twenty seconds unless they push. Then offer the risk, because that is the BA half of the answer rather than the textbook half.

### Say what cardinality and filter direction each control in Power BI, and which way the arrow should point on a fact-to-dimension relationship

**From:** Day 13, building the Power BI model.
**Hint:** One describes what the data is. The other decides which way a filter travels.
**Answer:**
- **Cardinality** describes the **shape of the data**: one-to-many, many-to-one, one-to-one, many-to-many. It is a statement of fact about the keys. Almost everything in a star is **one-to-many, dimension → fact**.
- **Cross-filter direction** decides **which way a filter travels**. Single or Both.

**The arrow should point from the dimension to the fact.** Single direction. Selecting "Beverages" on the Product dimension filters the sales fact down to beverage rows. That is what you want, and it is what every visual assumes.

Why single, as a default you should defend:

- **It is unambiguous.** Filters travel one way, so there is exactly one path from any dimension to the fact.
- **It is faster.** Bidirectional relationships force the engine to evaluate filters in both directions.
- **It prevents ambiguity errors.** With several dimensions set to Both, Power BI can find two paths between tables and either refuse the model or pick one arbitrarily.

Many-to-many with a bridge table is where you occasionally need Both — Northwind's `EmployeeTerritories` is the only true many-to-many junction in this database. Even then, prefer `CROSSFILTER()` inside a specific measure over changing the model globally.

### You set one relationship to both-directional and the number on screen changed. Say what happened, and how you would spot it on a model someone else built

**From:** Day 13.
**Hint:** You opened a second route for the filter to travel, and something started filtering something it never used to.
**Answer:**
Setting a relationship to **Both** lets the filter travel back up from the fact table into the dimension — and from there, potentially, out into a *different* dimension. A visual that was showing all products suddenly shows only products that appear in the filtered fact rows, so counts drop and totals move.

Three specific ways it bites:

- **Blank rows vanish.** A dimension member with no fact rows disappears from a slicer, so "0 sales" categories silently stop being reportable.
- **Ambiguity.** Two bidirectional paths between the same tables and the engine either errors on the model or picks one, so the number depends on a choice you did not make.
- **It is invisible in the report.** Nothing on the page says a relationship is bidirectional.

How to spot it on someone else's model, in order:

- **Model view.** A bidirectional relationship has arrowheads on **both** ends of the line. Scan for them first — it takes ten seconds.
- **Manage relationships** lists cross-filter direction for every relationship in one table.
- **Grep the measures for `CROSSFILTER`** — a per-measure override is often a sign that someone was fighting the model rather than fixing it.
- **Sanity check**: put a plain `COUNTROWS` of a dimension on the page with no filters and see whether it matches the table's real row count.

The rule: **single direction by default, both only where a bridge table genuinely requires it, and documented when you do.**

### Power BI has no SQLite connector. Say the two routes for getting Northwind into it, and which one this repo already did for you.

**From:** Day 1, when you asked how to import northwind.db into Power BI — twice.
**Hint:** Either you teach Power BI to speak SQLite, or you hand it a format it already reads.
**Answer:**
**Route 1 — ODBC.** Install a SQLite ODBC driver, create a DSN, and connect with **Get Data → ODBC**. Keeps the live database as the source, so a refresh picks up changes. Costs: a driver install, 32/64-bit mismatches, and it will not work on Power BI Service refresh without a gateway.

**Route 2 — export to CSV** and use **Get Data → Text/CSV** (or a folder). No driver, works everywhere, and it is a snapshot rather than a live connection.

**This repo already did route 2**: `python scripts/export-csv.py` writes `data/csv/`. That is what Day 13 loads.

Two things to know before you import:

- **Exclude `Categories.Picture`.** It is a BLOB and Power BI will choke on it.
- **`OrderDate` holds two formats** in one column — 830 date-only rows and 15,452 timestamps. Power Query will throw type errors on it. That is real, it is in the data, and it is the Day 12 exercise rather than a mistake.

For an interview: the general answer is **"if there's no native connector, either use ODBC or land the data in a format the tool reads — and which one you pick depends on whether you need a live refresh."**

### In a Power BI bar chart, how do you show orders per country without pre-aggregating the data?

**From:** Day 13.
**Hint:** The visual aggregates for you. You choose the field and the aggregation, not the SQL.
**Answer:**
Drop **Country** on the axis and **OrderID** into Values, then set the aggregation on that field to **Count** (or `Count (Distinct)`). Power BI groups by the axis field and aggregates the value field — the `GROUP BY` is implicit in the visual.

The thing to actually understand: **a Power BI visual is a GROUP BY.** Axis fields are the grouping columns; Values are the aggregates. That is why pre-aggregating in SQL is usually wrong — it throws away the detail the model needs to answer the *next* question, and you end up with one table per chart.

Two refinements worth knowing:

- **Write a measure instead of relying on implicit aggregation.** `Orders = COUNTROWS(Orders)` is explicit, reusable, and shows up in the model rather than being hidden in one visual's settings.
- **Watch the default.** Power BI defaults numeric columns to **Sum**. Drop `OrderID` in and you get the sum of the ID numbers — a large, meaningless figure. That is the "why did it default to Sum?" question you already hit: Power BI decides from the **data type**, not the meaning. IDs are numbers, so it sums them.

Set IDs to "Do not summarize" in the model to stop it happening again.

### In Power Query, what does Remove Errors actually do to your rows, and why is that dangerous in an analysis?

**From:** Day 12, Power Query cleaning.
**Hint:** It is not a repair. Ask what happens to the row, not to the cell.
**Answer:**
**It deletes the entire row.** Every row where the selected column holds an error value is removed from the table — silently, with no count, no log and nothing on the report to say it happened.

Why that is dangerous:

- **Errors are not random.** They cluster exactly where the data is unusual — a different date format, a foreign character set, a legacy import. So you are systematically deleting one subset and reporting on the rest as though it were everything.
- **In this database that is concrete:** `OrderDate` carries 830 date-only rows among 15,452 timestamps. Remove Errors on a date conversion could drop the entire original 830-order history — the oldest data — and the report would simply show a shorter time series.
- **Nothing reconciles.** Your row count no longer matches the source and there is no artefact explaining the gap.

What to do instead:

- **Keep Errors** first, on a duplicate query, to *see* what is failing and how many rows.
- **Replace Errors** with null, so the rows survive and the gap is visible and countable.
- **Fix the conversion** — set the locale, split the column, or handle both formats explicitly.
- If you genuinely must drop rows, **count them first and put the number in the documentation.**

The principle: **never let a cleaning step remove data without telling anyone.** "How many rows did we lose, and were they special?" is the question that separates an analyst from a button-presser.

### What does Remove Errors actually do to your rows, and what do you do instead?

**From:** Day 12 — the same trap, asked again later to check it stuck.
**Hint:** Whole row, not the cell. And the alternative keeps the row while making the gap visible.
**Answer:**
**Remove Errors deletes the whole row**, not just the offending cell — silently, and with no record of how many went.

Instead, in order of preference:

- **Keep Errors** on a copy of the query to see what is failing and how many rows are affected.
- **Replace Errors → null.** The row survives, the gap is visible, and `COUNTROWS` still reconciles to the source.
- **Fix the cause** — set the locale on the type conversion, split the column, or handle both formats.
- **If you must drop rows, count them first** and record the number in the report documentation.

The one-liner: **"Remove Errors is data loss with a tidy-sounding name."** Replace, then reconcile, then explain the gap.

### What is unpivot for, and what shape of data tells you that you need it?

**From:** Day 12.
**Hint:** Look at the column headers. If they are values rather than attributes, the table is the wrong way round.
**Answer:**
Unpivot turns **columns into rows** — wide to long. It converts a spreadsheet layout into a relational one.

**The tell is column headers that are data.** `Jan | Feb | Mar`, or `2021 | 2022 | 2023`, or one column per product. Those are *values of an attribute*, not attributes, and they should be rows in a `Month` column.

Wide:

```
Customer | Jan | Feb | Mar
ACME     | 100 | 120 |  90
```

Unpivoted:

```
Customer | Month | Value
ACME     | Jan   | 100
ACME     | Feb   | 120
ACME     | Mar   |  90
```

Why it matters for BI specifically:

- **You cannot write one measure over twelve columns.** Long form gives you one `Value` column to sum and one `Month` column to slice by.
- **A new month means a new column** in wide form, which breaks every visual and every measure. In long form it is just more rows.
- **You cannot relate a wide table to a date dimension.** There is no date column to join on.

In Power Query the practical move is **Unpivot Other Columns** — select the columns you want to keep as keys, then unpivot the rest. That way next year's column is picked up automatically instead of being dropped.

## DAX

### When can SUM not do the job, so you need SUMX? Give the Northwind revenue example

**From:** Day 15, DAX basics.
**Hint:** SUM takes a column. What if the thing you need to add up does not exist as a column?
**Answer:**
`SUM` can only add up **an existing column**. When the value has to be **calculated per row first**, you need `SUMX` — an iterator that walks the table, evaluates an expression for each row, and then sums the results.

Northwind revenue is the canonical case. There is no `Revenue` column — it is price × quantity × (1 − discount), computed per line:

```dax
Revenue = SUMX(
    'Order Details',
    'Order Details'[UnitPrice] * 'Order Details'[Quantity] * (1 - 'Order Details'[Discount])
)
```

`SUM('Order Details'[UnitPrice]) * SUM('Order Details'[Quantity])` is a completely different and meaningless number — the same mistake as in SQL, one layer up.

The general rule: **if the expression involves more than one column on the same row, you need an X function.** `SUMX`, `AVERAGEX`, `MAXX`, `COUNTX` all follow the same pattern — table first, expression second.

The performance note, if asked: iterators do more work than plain aggregations, so do not reach for `SUMX` when `SUM` would do. But correctness comes first, and here `SUM` is not an option.

### Measure or calculated column? Say the rule, then say which of your ten you would delete first if the model got slow

**From:** Day 15.
**Hint:** When is each one evaluated, and where does each one live?
**Answer:**
- A **calculated column** is computed **at refresh**, row by row, and **stored in the model**. It takes memory. It can be used on an axis, in a slicer, or as a relationship key.
- A **measure** is computed **at query time**, in the filter context of the visual. It stores nothing and cannot go on an axis.

The rule: **if it is a number you aggregate, make it a measure. If it is an attribute you slice or group by, make it a calculated column** — and better still, compute it upstream in Power Query or SQL, where it costs nothing at refresh.

Which to delete first when the model gets slow: **the calculated columns with high cardinality** — a column with a near-unique value per row compresses badly and is usually the single biggest thing in the model. A calculated column on the fact table is the prime suspect; one on a 77-row Products dimension is irrelevant.

The order to work through:

- High-cardinality calculated columns on the **fact** table.
- Anything that duplicates something already available by a relationship (a category name copied onto the fact instead of reached through the Product dimension).
- Columns nobody uses. **Unused columns still cost memory** — check with a model-size tool before assuming.

### What does DIVIDE do that `/` does not?

**From:** Day 15.
**Hint:** The difference only shows up when the denominator is zero or blank.
**Answer:**
`DIVIDE` handles **division by zero and by blank** gracefully. `/` throws an error, which surfaces in the visual as `Infinity`, `NaN`, or an error banner across the whole report.

```dax
Margin % = DIVIDE([Profit], [Revenue])            -- blank when Revenue is 0
Margin % = DIVIDE([Profit], [Revenue], 0)         -- 0 instead of blank
```

The third argument is the alternate result. **Omit it and you get BLANK, which is usually what you want** — blank means "not applicable here", and a blank row is filtered out of most visuals rather than plotted as zero.

Two things worth adding:

- **`DIVIDE` is also faster** in the engine than `IF(denominator = 0, BLANK(), a/b)`, because the check is built into the function rather than being a DAX branch.
- **Choosing the third argument is a reporting decision, not a technical one.** Returning 0 for "no revenue this month" plots a point at zero and reads as a real value. Returning blank plots nothing. Pick deliberately, and be able to say why.

Use `DIVIDE` for every ratio, without exception. It costs nothing and it removes an entire class of report failure.

### Say what CALCULATE does to filter context in one sentence — the version you would say to a manager, not to an analyst

**From:** Day 16.
**Hint:** It changes the filters that a number is calculated under. That is the whole thing.
**Answer:**
> CALCULATE lets me work out a number under **different filters from the rest of the chart** — so on a page filtered to this month, I can still show last year's total next to it.

That is the manager version. Keep it there unless they push.

The analyst version, if they do: **CALCULATE evaluates an expression in a modified filter context.** Its filter arguments *replace* filters on the same column that came from the visual, rather than adding to them — which is why `CALCULATE([Sales], Product[Category] = "Beverages")` shows beverages even on a page filtered to a different category.

Two things that make the answer land:

- **The SQL parallel:** it is the same idea as `SUM(CASE WHEN ... THEN ... END)` — change the filter for one number without changing it for the others.
- **`ALL` removes filters; `KEEPFILTERS` makes the argument add to the existing filter rather than replace it.** Knowing those two modifiers is what separates having read about CALCULATE from having used it.

Almost every time-intelligence function is `CALCULATE` with a date filter underneath, which is worth saying — it makes the whole family look like one idea rather than twenty.

### Your % of total has to sum to 100. Say where ALL goes to make that true, and what ALLEXCEPT would have given you instead

**From:** Day 16, CALCULATE.
**Hint:** The denominator has to ignore the filter that the numerator is subject to.
**Answer:**
`ALL` goes **in the denominator**, inside `CALCULATE`, to strip the filter the visual is applying:

```dax
% of Total =
DIVIDE(
    [Revenue],
    CALCULATE([Revenue], ALL('Product'[Category]))
)
```

The numerator is filtered to the current row's category; the denominator ignores that filter and returns the grand total. The column sums to 100%.

Without `ALL`, numerator and denominator are filtered identically and **every row shows 100%** — a classic and instantly recognisable symptom.

`ALLEXCEPT` would have given you **% of a subtotal instead of % of the grand total**:

```dax
CALCULATE([Revenue], ALLEXCEPT('Product', 'Product'[Department]))
```

That removes every filter on the Product table **except** Department, so each row is expressed as a percentage of its own department. The column then sums to 100% **within each department**, not across the report.

Neither is wrong — they answer different questions. "What share of total sales is this?" is `ALL`. "What share of its department is this?" is `ALLEXCEPT`. **Say which one the stakeholder asked for before you write it**, because both produce a plausible-looking percentage.

### Say what YTD, QTD and MTD each give you, and what breaks the moment the date table is unmarked

**From:** Day 17, time intelligence.
**Hint:** All three are running totals from the start of a period. The second half of the question is about why they need a proper date table.
**Answer:**
All three are **running totals from the start of a period to the current date in context**:

- **YTD** — 1 January to today.
- **QTD** — start of the current quarter to today.
- **MTD** — start of the current month to today.

```dax
Revenue YTD = TOTALYTD([Revenue], 'Date'[Date])
```

What breaks without a **marked date table**:

- **Time intelligence functions fail or return wrong results.** They need a contiguous, gap-free column of dates covering every date in the model, marked as the date table, to know what "the previous period" even means.
- **Gaps produce silent holes.** If the date column comes from the fact table, only dates with transactions exist. A month with no sales does not appear, so a running total skips it and a month-on-month comparison compares the wrong two periods.
- **Partial years lie.** This database ends 28 October 2023 — a YTD comparison against a full 2022 shows a fake decline unless you compare to the same cut-off date.

The rule: **always build a separate Date dimension, one row per day, covering full years, and mark it as the date table.** It is the single most common cause of "the time intelligence isn't working", and it is a thirty-second fix once you know to look.

## Career, portfolio and BA practice

### Say your three strongest CV bullets aloud from memory, in the problem → action → change shape

**From:** Day 4, after rewriting the CV in analyst language.
**Hint:** Each bullet is three beats: what was wrong, what you did, what measurably changed. No adjectives.
**Answer:**
This one has no model answer — they are **your** bullets, and they live in your CV and `data/career_profile.json`. What the card can give you is the standard to mark yourself against.

A bullet passes if it has all three beats:

- **Problem** — what was broken or slow, stated as a business fact, not a technology.
- **Action** — what *you* did. "I", not "we", and a verb an interviewer can picture.
- **Change** — what moved, with a number, or an honest qualitative outcome if there is no number.

Mark yourself down if any of these appear:

- **A tool list with no outcome.** "Built a dashboard in Power BI" is an activity, not a result.
- **"We".** An interviewer cannot hire the team.
- **A metric you cannot defend.** If they ask "how did you measure that?" and you have no answer, take the number out. Your `career_profile.json` already has a `do_not_claim` section for exactly this reason.
- **Adjectives doing the work.** "Significantly improved" means nothing. "Cut it from two days to two hours" means something.

Say all three aloud, timed. If a bullet takes more than fifteen seconds to say, it is two bullets.

### Your 30-second self-introduction, out loud and timed

**From:** Day 6, interview preparation.
**Hint:** Where you are now, what you have actually built, what you are moving towards. Thirty seconds, not sixty.
**Answer:**
Your words, not mine — but here is the structure to mark yourself against, and the timing is part of the test.

**The four beats:**

- **Who you are now**, in one line. CS graduate, British national, relocating to Peterborough, targeting business systems analysis.
- **The evidence.** One or two concrete things you have built — SQL against a 600,000-row dataset, a Power BI model with a documented grain — not a list of technologies.
- **The bridge.** Why development experience makes you a better analyst, not a career switcher apologising. You have shipped things that other people had to use; that is requirements work whether it was called that or not.
- **The ask.** What kind of role, stated plainly.

**Marking:**

- **Over 40 seconds** — cut it. Nobody listens past 40.
- **Any sentence that could be said by anyone else** — cut it.
- **Ends on a question or a clear statement of intent**, not a trailing "so, yeah".
- **No apologising for the gap or the switch.** State the direction, not the deficit.

Record it once on your phone and listen back. You will cut a third of it immediately.

### Your portfolio 1 business question, in one sentence, with the metric in it

**From:** Day 18, portfolio 1.
**Hint:** One sentence, one metric, one decision that hangs on the answer.
**Answer:**
Yours to write — the card's job is to tell you when it is good enough.

A portfolio business question passes when it has:

- **A named metric.** "Revenue net of discount", "orders shipped late as a percentage of shipped orders". Not "performance", not "insights".
- **A named population and period.** Which customers, which years.
- **A decision attached.** "…so that account management can prioritise the top 20" — if nothing changes based on the answer, it is a chart, not an analysis.
- **One sentence.** If it needs two, it is two questions and you should pick one.

Fails: "Analysing Northwind sales data." No metric, no decision, no period. That is a description of an activity.

Watch what this dataset **cannot** support, so you do not build a question it cannot answer: no seasonality exists, shipper and employee performance are uniform noise by construction, and discount is essentially absent. Pick a question the data can actually answer — late delivery at 23.1%, category concentration, or customer ranking are all real.

### State the grain of your portfolio 1 fact table, and name the two model decisions you would defend

**From:** Day 18.
**Hint:** "One row per…". Then the two choices someone could reasonably have made differently.
**Answer:**
Yours to state, but the grain sentence must begin **"one row per…"** and name exactly what one row is. "One row per product per order" is a grain. "Sales data" is not.

The two decisions to have ready — pick whichever you actually made:

- **Where Freight sits.** Order grain, not line grain. If you allocated it across lines, say the allocation rule and why.
- **Billing country or ship-to country** for any geography. They disagree on 85% of orders here and the ranking changes.
- **Whether discount is applied.** It should be, because revenue is defined net of discount — even though it only moves the total 0.02%.
- **How the date dimension is built** — separate table, one row per day, marked as the date table, covering full years including the partial 2012 and 2023.

For each one the answer has the same three parts: **what you chose, what the alternative was, and what would have gone wrong if you had chosen it.** That third part is what makes it sound like a decision instead of a default.

### Portfolio 1 — the full two-minute walkthrough, then answer the follow-up: how do you know that number is right?

**From:** Day 20, portfolio consolidation.
**Hint:** Business question first, model second, finding third, caveat last. The follow-up is about validation, not confidence.
**Answer:**
Yours to deliver. Structure and marking:

**The two minutes:**

- **The question** — one sentence, with the metric. (~15s)
- **The data and the model** — source, row counts, grain, the one modelling decision worth naming. (~30s)
- **The finding** — the number, and what it means commercially. (~45s)
- **What you would do next, and what the analysis does not cover.** (~30s)

**The follow-up — "how do you know that number is right?" — is the real question**, and most candidates have nothing. Have three concrete answers ready:

- **Row counts either side of every join.** 16,282 orders → 609,283 detail lines; anything order-level summed after that join is wrong, and I checked.
- **Hand-checked one entity.** Order 10273: £48 freight, 5 lines, and I confirmed the joined version returns £240 — so I knew what the fan-out would do before I trusted the total.
- **Reconciled to an independent total.** Revenue by category sums to the same grand total as revenue by year. Two paths, one number.

Then the honest caveat, unprompted: **2012 and 2023 are partial years, so any year-on-year comparison excludes them or annualises them.** Volunteering a limitation is the strongest thing you can do in this answer.

### Portfolio 2 — the two-minute walkthrough, ending on requirement-to-visual traceability

**From:** Day 26, portfolio 2.
**Hint:** The distinctive part is the traceability — every visual on the page maps back to a numbered requirement.
**Answer:**
Yours to deliver. What makes this walkthrough different from portfolio 1 is that it is a **requirements** story, not just an analysis story.

**Structure:**

- **The business problem and who has it.** Named stakeholder group, not "the business". (~20s)
- **How you gathered and wrote the requirements** — the elicitation, then the documented output: numbered functional requirements, and non-functional ones with measurable thresholds. (~40s)
- **How the solution meets them.** (~30s)
- **Traceability, and finish here.** (~30s)

**The traceability close** is the bit to actually rehearse:

> Every visual on this page maps to a numbered requirement, and every requirement maps to at least one visual. FR-03 says the user must be able to compare late deliveries by country — that is this chart. NFR-02 says the page must render in under five seconds on the full dataset — that is why the fact table is aggregated at order grain rather than line grain.

Then the closing line that shows you understand why it matters: **"the point of the matrix is that when a requirement changes, I know exactly what breaks — and when someone asks why a chart exists, there is an answer other than 'it looked useful'."**

### BRD vs FRD vs SRS — what each one states, who reads it, and what goes wrong when two of them get merged

**From:** Day 22, the BRD block.
**Hint:** Why, what, and how — in that order, for three different audiences.
**Answer:**
- **BRD — Business Requirements Document.** **Why.** The business need, objectives, scope, success measures. Read by sponsors and senior stakeholders. Deliberately solution-free.
- **FRD — Functional Requirements Document.** **What** the system must do to meet the BRD. Read by the delivery team and by testers. Each requirement numbered and testable.
- **SRS — Software Requirements Specification.** **What and how**, in technical detail — interfaces, data, constraints, non-functionals. Read by developers and architects.

What goes wrong when they merge — and this is the part interviewers are actually listening for:

- **Solution creep into the BRD.** The moment "we need a Power BI dashboard" appears in a business requirements document, the solution has been chosen before the problem was agreed, and every alternative is now off the table without anyone deciding.
- **The sponsor stops reading.** Bury the business case in field-level specification and the person who signs it off skims and signs. Later, "that isn't what we asked for."
- **Traceability collapses.** If the business need and the functional detail are in one document, you cannot show which requirement serves which objective, and scope arguments become unwinnable.

The one-liner: **"the BRD is the contract with the business, the FRD is the contract with the delivery team, and mixing them means neither party has actually agreed to anything."**

In agile settings, say the equivalent out loud too — the BRD's job is done by the product vision and epics, the FRD's by user stories and acceptance criteria. Different artefacts, same three questions.

### What makes a non-functional requirement testable? Give one of your three, with its number in it

**From:** Day 22.
**Hint:** A number and a condition. "Fast" is not a requirement.
**Answer:**
A non-functional requirement is testable when it has **a measurable threshold and the conditions it is measured under**. Someone must be able to run a test and get a pass or a fail with no argument.

The pattern: **metric + threshold + condition + population.**

> **NFR-02:** The sales dashboard must render the default view in under 5 seconds on the full 609,283-row dataset, over a standard corporate connection, for the 95th percentile of users.

Every part is doing work. Drop "on the full dataset" and it passes on a filtered sample. Drop "95th percentile" and one slow user fails it. Drop the number and it is an opinion.

Fails, and why:

- **"The dashboard must be fast."** No metric, no threshold. Untestable, so it will never be tested.
- **"The system should be user-friendly."** Not measurable. Rewrite as a task-completion target: "a new user must complete the monthly report in under 3 minutes without training."
- **"The system must be secure."** Rewrite as specific controls: authentication method, row-level security, audit retention period.

Your three should cover **performance, availability or security, and usability**, each with its own number. Say one aloud with its number in it — the number is what proves you wrote a requirement rather than a wish.

### Give one of your user stories in full As-a / I-want / So-that form, then its Given/When/Then criteria including the missing-data case

**From:** Day 23, user stories.
**Hint:** The So-that is the half that gets dropped, and the missing-data case is the one nobody writes.
**Answer:**
Yours to write. The shape and the marking:

> **As a** regional sales manager, **I want** to filter the revenue dashboard by ship-to country, **so that** I can see which delivery markets are growing and set next quarter's targets.

Acceptance criteria in Given/When/Then:

> **Given** I am on the revenue dashboard, **when** I select one or more countries in the country slicer, **then** every visual on the page updates to show only orders shipped to those countries, and the page title shows the active selection.

> **Given** I select a country with no orders in the chosen period, **when** the page refreshes, **then** the visuals show "No data for this selection" rather than a blank page or a zero.

Marking:

- **The So-that must be a business outcome**, not a restatement of the want. "So that I can filter by country" is a fail.
- **The role must be specific.** "As a user" tells you nothing about what they need.
- **The missing-data case is the one that matters.** Blank, zero and "no data" mean three different things to a reader, and a chart that shows 0 where the truth is "unknown" is actively misleading. Writing that criterion is the single clearest signal that you have shipped something people used.

One more worth adding if they push: a negative or permission case — what a user who should not see a region actually sees.

### What happens at UAT when the business signs off without actually testing, and how do you stop that?

**From:** Day 23.
**Hint:** The sign-off still happens. The testing just moves to production, where it is expensive.
**Answer:**
The defects do not go away — **they surface in production**, where they cost more, damage trust, and land as "the system is broken" rather than "requirement 14 was misunderstood". And because sign-off was given, the conversation becomes about blame instead of about the fix.

Three specific consequences:

- **Rework at the worst time**, after go-live, under pressure, with real users watching.
- **The requirement itself never gets validated.** Sign-off was meant to confirm the requirement was right, not just that the build matched it. A silent sign-off skips both.
- **Adoption collapses.** Users who first meet the system in production, with defects in it, do not come back.

How to stop it:

- **Give them scripted scenarios with expected results**, not "have a look and let us know". Most non-testing is not laziness, it is not knowing what to do.
- **Book the time in their calendar and be in the room.** UAT that is homework does not happen.
- **Use their own data and their own real tasks**, not sample data. People engage with their own numbers.
- **Require evidence to close a case** — a screenshot, a tick against a numbered scenario. Sign-off becomes a record of what was actually exercised.
- **Track coverage against requirements** and show the gaps. "Nine of fourteen requirements have been tested" is a fact that moves people.

The line to say: **"sign-off is not the goal — evidence that the requirement was met is the goal, and sign-off is what you get afterwards."**

### Your root-cause story — the full 90-second STAR version, timed

**From:** Day 24, root-cause analysis.
**Hint:** Symptom, trace, calculation, configuration, cause, fix. Ninety seconds means you cannot narrate the whole week.
**Answer:**
Yours to tell. Structure, timing, and what a good one does:

- **Situation** (~15s) — the symptom as the business saw it. "The freight figure on the report came out at £206m against an expected £4m."
- **Task** (~10s) — what you were responsible for finding out.
- **Action** (~45s) — **the trace, in order.** This is the whole story and where most people rush. Row counts either side of the join → 16,282 became 609,283 → freight is an order-level column being duplicated once per line → confirmed on a single order by hand, 10273, £48 × 5 lines = £240.
- **Result** (~20s) — the fix, and the control that stops it recurring: check row counts either side of every join, and sanity-check one entity by hand.

What makes it good:

- **It shows a method, not a lucky guess.** The interviewer is listening for whether you had a next step at each point.
- **It has a number in it that you can defend**, and a hand-check that proves you did not just trust the output.
- **It ends on prevention.** A root-cause story that ends at "so I fixed it" is half an answer.

Time it. Over two minutes and you are narrating; under sixty seconds and you have skipped the trace, which is the only part they care about.

### What is gap analysis, and name one gap your portfolio 1 work does not close

**From:** Day 24.
**Hint:** Current state, future state, and the difference between them. The second half needs honesty about your own work.
**Answer:**
**Gap analysis compares where you are now with where you need to be, and defines the work to close the difference.** Current state, target state, gap, and the actions to bridge it — with each action owned and prioritised.

The BA framing: it is not just a list of missing features. A gap has a **size and an impact**, and part of the analysis is deciding which gaps are worth closing at all. Some are accepted deliberately.

A real gap in portfolio 1, and pick one you can defend:

- **No cost or margin data.** The analysis is revenue-only, so it can say what sells but not what is profitable. A high-revenue, low-margin category would look like a success.
- **No customer segmentation beyond geography.** There is no industry, size or contract type in this data, so "our best customers" can only mean "highest revenue".
- **The time series is not usable end to end.** 2012 starts in July and 2023 ends in October, so any year-on-year view has to exclude or annualise both.

Naming a limitation in your own work unprompted is one of the strongest moves available in an interview. It reads as judgement, not weakness — and it stops them finding it first.

### All six STAR stories, timed, no notes

**From:** Day 27, interview preparation.
**Hint:** Six stories, each under two minutes, each with a number in the Result.
**Answer:**
Yours — the card is the marking scheme.

**The six should cover distinct competencies**, or you will tell the same story three times:

- A **root-cause / debugging** story (you have this one — the £206m freight).
- A **stakeholder disagreement or pushback** story.
- A **requirements** story — ambiguity clarified before build.
- A **delivery under pressure** story.
- A **mistake you made**, and what changed afterwards.
- An **influence without authority** story.

**Marking each one:**

- **Under two minutes.** Time it. Anything over gets cut, not compressed.
- **Result has a number**, or an honest qualitative outcome you can defend.
- **"I", not "we", in the Action.** They are hiring you.
- **Situation under 20 seconds.** Most people spend a minute on context nobody needs.
- **No story used twice** across the six.

Say all six back to back once. The sixth is always the worst — that is the one to rewrite.

### The eight technical answers, no notes

**From:** Day 27.
**Hint:** These are the eight that get asked in every BA/BI screen. You have cards for all of them.
**Answer:**
The eight, and where the full answer lives in this file:

- **WHERE vs HAVING** — WHERE filters rows before grouping, HAVING filters groups after.
- **INNER vs LEFT JOIN, and the anti-join pattern** — and why the filter goes in the ON, not the WHERE.
- **Row fan-out** — one-to-many joins duplicate the one side; check row counts either side.
- **NULL handling** — `IS NULL`, why `= NULL` returns nothing, why `NOT IN` breaks on a NULL.
- **Window functions vs GROUP BY** — GROUP BY collapses rows, a window function adds a column to rows that survive.
- **Star schema and grain** — one row per what, and why the fact grain decides where a measure can live.
- **CALCULATE** — evaluates an expression in a modified filter context; the manager version is "a number under different filters from the rest of the chart".
- **Data quality and validation** — row counts, hand-checking one entity, reconciling two independent paths to the same total.

**Marking:** each answer in under 60 seconds, each with **one concrete example from this dataset** attached. An abstract definition is worth very little; "revenue by category and revenue by year reconcile to the same £448m, which is how I knew the join was clean" is worth a lot.

If any of the eight takes more than one attempt, that is the one to put back on a 1-day interval.

## Permanent items

### Your 30-second self-introduction. Out loud, timed, no notes.

**From:** the permanent set — the eight things interviews actually test, on a 30-day cycle from Day 28.
**Hint:** Four beats: who you are now, the evidence, the bridge, the ask. Under 40 seconds.
**Answer:**
Yours, and the marking is the same as the Day 6 version:

- **Who you are now** — CS graduate, relocating to Peterborough, targeting business systems analysis.
- **The evidence** — one or two concrete builds, with a number in them, not a technology list.
- **The bridge** — why development experience makes you a better analyst, stated as a strength.
- **The ask** — the role you want, plainly.

**Over 40 seconds, cut it. No apologising for the switch. No sentence that anyone else could say.**

Because this one is permanent, the thing to watch is drift: after a few months it grows back to 60 seconds and picks up filler. Re-time it every cycle rather than assuming it is still tight.

### Portfolio 1 — the full two-minute walkthrough, ending on what you would do differently.

**From:** the permanent set.
**Hint:** Question, model, finding, limitation — and this version ends on your own critique.
**Answer:**
Same structure as the Day 20 walkthrough: question (~15s), data and model (~30s), finding (~45s), and then the close.

**This version's close is what you would do differently**, and it needs to be a real answer:

- **A modelling decision you would change** — where freight sits, which country column, whether to build the date dimension differently.
- **A question you would ask the stakeholder earlier**, and what it would have saved.
- **Something the data could not support** — no cost data, so no margin view; partial first and last years.

What makes it land: **name the trade-off, not a regret.** "I'd put freight on a separate order-grain fact table rather than allocating it, because the allocation rule was arbitrary and nobody asked for shipping cost at line level" is a decision. "I'd have spent more time on it" is not.

Have one sentence ready for **"why didn't you do that in the first place?"** The honest answer — that you found the fan-out after building, and the rebuild was not worth it for a portfolio piece — is a fine answer, said confidently.

### Portfolio 2 — the full two-minute walkthrough, ending on requirement-to-visual traceability.

**From:** the permanent set.
**Hint:** This is the requirements story, not the analysis story. Finish on the matrix.
**Answer:**
Structure: problem and stakeholder (~20s), how requirements were elicited and documented (~40s), how the solution meets them (~30s), traceability close (~30s).

**The close, rehearsed:**

> Every visual maps to a numbered requirement and every requirement maps to at least one visual. FR-03 — compare late deliveries by country — is this chart. NFR-02 — render in under five seconds on the full dataset — is why the fact table sits at order grain rather than line grain.

Then the reason it matters: **"when a requirement changes I know exactly what breaks, and when someone asks why a chart exists there is an answer other than 'it looked useful'."**

The follow-up to expect: **"what did you do when a stakeholder asked for something outside the requirements?"** Have the answer — logged it, sized it, and put it to the sponsor as a change rather than absorbing it quietly. Scope discipline is most of what a BA is for.

### Your root-cause story. Symptom, trace, calculation, configuration, cause, fix — in 90 seconds.

**From:** the permanent set.
**Hint:** The trace is the story. Everything else is framing.
**Answer:**
The £206m freight investigation, in six beats:

- **Symptom** — freight came back at £206,911,676 against an expected £4,047,470.
- **Trace** — row counts either side of the join: 16,282 orders became 609,283 rows.
- **Calculation** — freight is an order-level column, so the join duplicated it once per line item; 37.4 lines per order on average, about 51× on freight.
- **Configuration** — the join was to `[Order Details]`, which is at one row per product per order, not one row per order.
- **Cause** — an order-grain measure summed at line grain. Row fan-out.
- **Fix** — sum freight from `Orders` alone, or aggregate the lines before joining. Verified by hand on order 10273: £48 freight, 5 lines, £240 when joined — exactly as predicted.

**90 seconds, and spend at least half of it on the trace.** The interviewer is testing whether you had a next step at each point, not whether you know what fan-out is.

Finish on the control, not the fix: **"I now check row counts either side of every join, and I hand-check one entity before I trust a total."**

### All six STAR stories, back to back. Time each one; anything over two minutes gets cut.

**From:** the permanent set.
**Hint:** Six distinct competencies, no repeats, a number in every Result.
**Answer:**
The six competencies: root-cause, stakeholder disagreement, requirements ambiguity, delivery pressure, a mistake you made, influence without authority.

**Marking, per story:**

- Under two minutes, timed properly, not estimated.
- Situation under 20 seconds.
- "I" in the Action, not "we".
- A number, or a defensible qualitative outcome, in the Result.
- No competency covered twice.

**Because this is the permanent version, run all six in one sitting.** Individually they are all fine; back to back is where you find that three of them are the same story with different names on it, and that the last one falls apart because you have never actually said it aloud.

The one that comes out worst is the one to rewrite before the next cycle. Not all six — one.

### What is a star schema, and why does it matter commercially? Answer the "commercially" part properly.

**From:** the permanent set. The second half is the half most candidates skip.
**Hint:** Describe the shape in one sentence, then spend the rest of the answer on money and time.
**Answer:**
**The shape, briefly:** one fact table at a stated grain, surrounded by dimension tables, each one join away. Facts are the measurements, dimensions are the things you slice by.

**The commercial half — this is the actual question:**

- **Report build time collapses.** A business user can drag Category against Revenue without knowing SQL. That moves work off the data team and shortens the gap between question and answer from days to minutes.
- **One definition of every number.** Revenue is defined once, in the model. Two departments stop arriving at a meeting with different figures, and the meeting stops being about whose number is right.
- **Query performance is predictable**, so dashboards stay usable as data grows — which is what determines whether people keep using them at all.
- **It is cheaper to change.** A new attribute is a column on a dimension, not a rebuild of every report.

The sentence that answers the question as asked: **"a star schema is what makes self-service actually work — it turns one analyst answering questions into a business answering its own, and it does that by fixing the definitions in the model rather than in each report."**

If they push on the cost: it takes design work up front, it duplicates data, and it requires someone to own the grain and the definitions. That ownership is the BA's job.

### What does CALCULATE do in DAX? One sentence, in the words you'd use with a manager.

**From:** the permanent set.
**Hint:** Different filters from the rest of the chart. Keep it to one sentence unless they push.
**Answer:**
> CALCULATE lets me work out a number under **different filters from the rest of the chart** — so on a page filtered to this month, I can still show last year's total next to it.

Stop there. If they push, the technical version: **it evaluates an expression in a modified filter context**, and its filter arguments *replace* filters on the same column rather than adding to them.

The two modifiers that prove you have used it:

- **`ALL`** removes filters — that is how a % of total gets a denominator that does not shrink with the row.
- **`KEEPFILTERS`** makes the argument add to the existing filter instead of replacing it.

And the framing that ties it to everything else you know: **it is the DAX version of `SUM(CASE WHEN ... END)` in SQL** — change the filter for one number without changing it for the others. Nearly every time-intelligence function is CALCULATE with a date filter underneath, which turns twenty functions into one idea.

### A report's totals have doubled overnight. Walk through your first three checks, in order.

**From:** the permanent set — the "you are on a call and it is broken" question.
**Hint:** Doubled is a very specific number. It points at duplication, and duplication has three usual sources.
**Answer:**
**"Doubled" is a clue, not just a symptom.** Exact doubling means duplication, and duplication has a small number of causes. Say that first — it shows you are reasoning, not guessing.

**Check 1 — row counts, source versus report.** `COUNT(*)` on the source table against the row count feeding the report. If the source doubled, it is a **load problem**: the ETL ran twice, or an incremental load re-inserted the same period. Nothing is wrong with the report at all.

**Check 2 — the joins and the relationships.** If the source count is unchanged, the duplication is happening inside the model. A new row in a dimension makes a previously one-to-many relationship many-to-many, and every fact row now matches twice. Check the grain of every dimension: `COUNT(*)` versus `COUNT(DISTINCT key)`. That is the classic overnight break — someone added a record upstream.

**Check 3 — what changed.** Deployments, model changes, a new relationship, a changed filter direction, an upstream schema change. **Ask "what shipped yesterday?"** before assuming the data is at fault.

Then the answer that separates you: **"and before any of that, I'd ask whether the business actually did twice as much yesterday — because occasionally the number is right."**

Close on prevention: a row-count reconciliation check on the load, and an alert when the daily total moves outside an expected band.

### You wrote `JOIN Employees e ON o.EmployeeID = o.EmployeeID` — twice, once for shippers and once for last-order-per-employee. It returned exactly 9 rows both times and looked right. Say what that join actually did, and why the row count did not give it away
**From:** Day 8 desk 1.9 and Day 6 desk 1.10, your own queries, 20 August.
**Hint:** Read the ON clause again, one side at a time. Which table does each side belong to?
**Answer:**
Both sides of the ON clause are the **same table**: `o.EmployeeID = o.EmployeeID`. That is always true for every row, so there is no join condition at all — it is a **cross join**. Every one of the 16,282 orders is paired with every one of the 9 employees: **146,538 rows**, nine times the data.

The reason it looked fine is the `GROUP BY e.EmployeeID`. Grouping collapsed 146,538 rows back down to 9, so the shape of the answer was right and the row count matched the expected 9 exactly.

**Every value was wrong.** `MAX(o.OrderDate)` for employee 1 came back `2023-10-28`, which is the latest order in the whole company. The real answer is `2023-10-19`. Every employee got handed the same global maximum.

This is the defect worth telling an interviewer about, because it is the dangerous shape: **a wrong number that passes the row-count check**. Aggregation hides fan-out. The check that catches it is to run the query *without* the `GROUP BY` and look at the row count before aggregating — 146,538 against 16,282 orders is the tell.

The fix is one character: `ON o.EmployeeID = e.EmployeeID`.


### You wrote `WHERE ... AND (NOT (SELECT DISTINCT CustomerID FROM Orders WHERE ...))` for the churn list and said you were not sure why it failed. Say why `NOT` cannot take a subquery there, and what `NOT IN` is actually doing instead
**From:** Day 8 desk 1.3, the churn list. Your own words: "im not actually quite sure i understand why not".
**Hint:** What kind of value does `NOT` expect on its right? What kind of thing does that subquery hand back?
**Answer:**
`NOT` is a **boolean** operator. It expects one true/false value. Your subquery returns a **set of rows** — 88 customer IDs — and there is no sensible way to read a list of 88 IDs as true or false, so the comparison is meaningless.

`NOT IN` is a different operator. It is a **membership test**: take this one value, check whether it appears anywhere in that set, then negate the answer. The set is allowed to be a subquery because `IN` is built to consume a set.

The general rule, and it is worth saying in an interview:

- A subquery returning **one value** can sit anywhere a value can — `> (SELECT AVG(...))`.
- A subquery returning **a column of values** needs a set operator — `IN`, `NOT IN`, `ANY`, `ALL`.
- A subquery returning **rows you only want to test for existence** wants `EXISTS` / `NOT EXISTS`.

Your corrected version was right, and you were right that it reads better. **Watch one thing though:** `NOT IN` breaks silently if the inner query can return a `NULL` — the whole result comes back empty. `NOT EXISTS` does not have that problem. That is already a separate card in this queue and it is the reason it is there.


### The exercise asked for customers who ordered since **1 October** 2023. You filtered from 1 August, got 88, and doubted your SQL against the stated 58. Both numbers are correct. Say what actually went wrong, and the one habit that catches it
**From:** Day 8 desk 1.2, 20 August. Also Day 2, where two of fifteen queries dropped a stated condition.
**Hint:** Your SQL was not the problem. Compare the date in the question with the date in your WHERE clause.
**Answer:**
The query was correct. It answered a **different question**. 88 customers have ordered since 1 August; 58 have ordered since 1 October. Both are right; only one was asked.

This is the third time in a week a stated condition has gone missing — Day 2 dropped a condition on questions 4 and 15, and question 3 on this same day used 1 August correctly, which is almost certainly where the date came from.

It matters more than a syntax slip because **nothing catches it**. The SQL runs, returns plausible rows, and the only signal is a number that does not match — and your instinct was to doubt yourself rather than the requirement. In a job, there is no expected number printed next to the request.

The habit: **read the requirement back as a sentence before writing any SQL, and again against your WHERE clause before you send the result.** Say it out loud — "since the first of October" — then point at the date in your query. Ten seconds.

For a stakeholder this is the whole job: the number is only right if it answers the question that was asked.


### Chasing overall average order value, you wrote a CTE that took `AVG(...)` per customer and then `SUM`ed those averages, and said "thats just incorrect but I dont understand why". Say what that actually calculates, and why averaging twice does not work
**From:** Day 6 desk 1.7, overall average order value. Your own words.
**Hint:** Write out what one row of your CTE contains before the outer query touches it.
**Answer:**
Your CTE produced, per customer, the average value of a **single line item** — because the join to `[Order Details]` had already exploded each order into one row per product. The outer `SUM` then added those per-customer averages together, which is a number with no meaning at all: it is neither a total nor an average of anything real.

The correct shape, which is what you found, does the aggregation in **two stages at the right grain**:

```
WITH OrderTotals AS (
  SELECT OrderID, SUM(UnitPrice * Quantity * (1 - Discount)) AS TotalOrderValue
  FROM [Order Details]
  GROUP BY OrderID
)
SELECT ROUND(AVG(TotalOrderValue), 2) FROM OrderTotals;
```

First collapse line items **up to one row per order**. Then average across orders. The grain is the whole point: "average order value" means the unit being averaged is an **order**, so you must be at one-row-per-order before you average.

The general trap is called the **average of averages**, and it is wrong whenever the groups are different sizes — an order with 12 lines and an order with 1 line get equal weight, which silently over-weights small orders.

You also wrote that `WITH ... AS` is "like an IF statement". It is not. It is a **named temporary result set** — closer to declaring a variable that holds a table, and the reason it reads better than a nested subquery is that it gets a name and can be read top to bottom.

