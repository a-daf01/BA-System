# Month 01 — Days 1 to 28

**Goal by Day 28:** two portfolio artifacts live, CV rewritten in analyst language, 15+ applications submitted, agency relationships open, and the ability to talk fluently about SQL, data modelling and BI in business terms.

**Every day:** DESK block (60–75 min) + PHONE block (20–30 min) + one Say It Out Loud + one line in `tracking/progress.md`.

**Sundays (Days 7, 14, 21, 28) are phone-only consolidation days.** Deliberate. You said you'd do exactly what's written and no more — so recovery is written in.

**Every day names the file it writes into.** Nothing in this month starts on a blank page. If a day says `workspace/day-08-subqueries.sql`, that file already exists with the questions in it — open it and type underneath.

**Every SQL task carries the answer it should produce.** A row count, a total, a top row. You are not meant to wonder whether you got it right — check, and if it doesn't match, that mismatch is the lesson. Model answers are in `reference/answers/`, and every one of them says *open me second*.

**One dataset, all month.** Northwind for SQL (Days 2–10), the same Northwind exported to CSV for Power BI (Days 11–17), UK public data for the two portfolio pieces. There is no second database to install. `reference/datasets.md` has the detail.

**This Northwind is not the textbook one.** It has been re-dated to 2012–2023 and inflated to 16,282 orders and 609,283 detail lines, and it carries five verified traps that will silently give you a wrong number rather than an error. `reference/dataset-profile.md` is the full audit — row counts, the traps, the real data quality defects, every reference total, and a list of what this data *cannot* support. **If a query returns something that surprises you, check that file before assuming you're wrong.**

---

# WEEK 1 — Baseline, SQL core, pipeline live

## Day 1 — Setup and honest baseline
**Theme:** Find out what you actually know.

**DESK (70 min)**
- [ ] 20 min — Install Power BI Desktop and DB Browser for SQLite. Download Northwind. Confirm you can run `SELECT * FROM Customers`. Nothing else.
- [ ] 30 min — **Baseline test.** Against Northwind, nothing looked up: (1) filter customers by country, (2) join orders to customers, (3) count orders per customer, (4) customers with more than 10 orders, (5) top 5 products by revenue. Record which you got right first time.
- [ ] 20 min — Load Northwind Orders into Power BI. Build one bar chart. Note every point where you had to look something up.

**PHONE (20 min)**
- [ ] 10 min — Read `reference/target-roles.md` end to end.
- [ ] 10 min — Reed, "BI Analyst", Peterborough +20 miles. Read 5 ads. Don't apply. Notice repeated words.

**Say It Out Loud:** "I'm targeting Business Systems Analyst and BI Analyst roles — turning business questions into queries and dashboards people act on."

**Adds to review queue:** nothing. Today is measurement.

**Why:** you said you don't know what you know. This is the only day that answers that, and everything after is calibrated to it. Be honest in the notes — a flattering baseline produces a useless plan.

---

## Day 2 — SQL: filtering and shaping
*Dataset: Northwind.*

**DESK (60 min)**
- [ ] 40 min — Write these 15 queries against Northwind, in order. Build each one `FROM` first, `SELECT` last.
  1. All customers in Germany. *(11 rows)*
  2. All products with a unit price above 20. *(37 rows)*
  3. All orders placed in 2016. *(1,506 rows. Not 1997 — check the date range before you trust an empty result.)*
  4. Products above 20 that are **not** discontinued. *(31 rows. If you get 69 you dropped a condition.)*
  5. Customers in Germany **or** France. *(22 rows)*
  6. Products under 10 **or** above 100, that are not discontinued. *(Watch the brackets — this is the one that goes wrong.)*
  7. Rewrite 5 using `IN`, and add Spain. *(27 rows)*
  8. Products priced `BETWEEN` 10 and 30. *(37 rows)*
  9. Orders placed in Q1 2016. Write it with `BETWEEN` first, then count again using `>= '2016-01-01' AND < '2016-04-01'`. *(357 is right. BETWEEN gives 350. Work out where the 7 went before moving on.)*
  10. Customers whose company name starts with "B". Then customers whose name contains "market".
  11. Orders that were never shipped (`ShippedDate` is empty). *(21 rows)*
  12. Customers with no `Region`. Try `= NULL` first and watch it return nothing. *(2 rows)*
  13. Count of unshipped orders next to the count of all orders. *(21 and 16,282, one query, no subquery)*
  14. All products sorted by `CategoryID` ascending, then `UnitPrice` descending.
  15. Non-discontinued products sorted by `SupplierID`, then `ProductName`, first 20 rows only.
- [ ] 20 min — Take queries **6, 11 and 13**. For each, write the one-sentence question a manager would have asked to make you write it. Not a description of the SQL — the business question behind it.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 1. Read, cover, say aloud.

**Say It Out Loud:** "A WHERE clause is where most reporting errors hide — wrong filter logic makes every number downstream wrong, and it still looks fine."

**Adds to review queue:** Why does `= NULL` return nothing, and what do you use instead? · You wrote 'B%' and '%market%'. Say what each wildcard does, and name one case where LIKE is the wrong tool · Read "products above 20 that are not discontinued" aloud. How many conditions is that, and what is the five-second check that catches a dropped one?

---

## Day 3 — SQL: JOINs
**Theme:** The single most important SQL skill for a BSA. *Dataset: Northwind.*

**Open:** `workspace/day-03-joins.sql`

**DESK (75 min)**
- [ ] 25 min — INNER vs LEFT on Customers → Orders. Row counts both ways, and one sentence on why they are identical here.
- [ ] 15 min — Three-table join: Orders → OrderDetails → Products. Count the rows. *(609,283 — from 16,282 orders. That number is the whole lesson.)*
- [ ] 20 min — **Row fan-out, with the real numbers.** Run these three and write down what changed.
  1. `SELECT COUNT(*), ROUND(SUM(Freight),2) FROM Orders;` *(16,282 | 4,047,470.50)*
  2. `SELECT COUNT(*) FROM [Order Details];` *(609,283)*
  3. The same freight total over `Orders JOIN [Order Details]`. *(609,283 | 206,911,676.00 — 51× too big)*
  4. Write the detection rule: count rows before the join and after. If it grew, every measure from the left table is now multiplied.
- [ ] 15 min — **The trap you will actually meet at work.** "Every customer, with orders placed since 1 Oct 2023." Write it twice.
  1. Date filter in `WHERE`. *(58 customers)*
  2. Date filter in the `ON`. *(93 customers, 35 of them zero)*
  3. Say out loud why `WHERE` on the right-hand table demotes a LEFT JOIN to an INNER JOIN — and why the 35 it deleted are exactly the customers a churn report exists to find.

> **Note, 2026-08-14.** The original Day 3 said "find customers with no orders". This
> build has **zero orphan rows anywhere** — no unmatched customers, products, suppliers
> or orders — so that exercise proves nothing here, the same way the 1997 date filter
> couldn't on Day 2. The filtered-join task above replaces it and is the more useful
> skill anyway.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one joins video. Close it, re-explain aloud without replaying.

**Say It Out Loud:** "If a report's totals suddenly doubled, my first check is whether a join is fanning out rows against a one-to-many relationship."

**Adds to review queue:** You wrote `INNER JOIN Orders ... WHERE o.OrderID IS NULL` and got 0 rows. Say why that returns 0 on every database that has ever existed, and what you should have written · Orders holds 16,282 rows and £4,047,470 of freight. Join it to [Order Details] and freight comes back £206,911,676. Say what happened, and the one check that catches it before you send the report · "Every customer, and their order count since Oct 2023." One version returns 93 customers, the other 58. Say which clause the date filter is in, in each — and why the 58 version is the wrong answer to that question

---

## Day 4 — JOIN repair + the defect nobody found
**Theme:** Day 3 scored a 5 with two wrong answers in it. Prove it or drop the score. *Dataset: Northwind.*

**Open:** `workspace/day-04-joins-repair.sql` and `tracking/cv-workspace.md`

> **Rewritten 2026-08-15.** Day 4 was "CV rewrite, part 1" — Steps 1 and 2 of
> `tracking/cv-workspace.md`. **He wrote the CV before Day 4 ran**, so that work is
> done and it is in `data/Ahmed_Dafalla_Business_Analyst_CV.pdf`. Step 3 is the only
> part still outstanding and it takes 15 minutes. The freed 55 minutes go to SQL,
> which is what he asked for and what the Day 3 note says he needs.

**DESK (70 min)**

- [ ] 15 min — **CV Step 3 only.** Open `tracking/cv-workspace.md`, go to Step 3, and pick the **three strongest bullets from the CV you already wrote**. Write each one out in problem → action → change shape. Then read each aloud and ask *could I survive two follow-up questions on this?* The 40 percent dashboard figure is the one to stress-test first — if you can't say where the number came from, it comes off the CV.
- [ ] 15 min — **The lapsed-customer query you got right by accident.** Section 1 of the SQL file. "Which customers have not ordered since 1 Oct 2023?" Write it three ways: INNER + `IS NULL` *(0 rows)*, LEFT with the date in `ON` *(35 rows)*, LEFT with the date in `WHERE` *(0 rows)*. Then write the rule down in your own words.
- [ ] 20 min — **Fan-out, small enough to count.** Section 2. Order 10273 carries **£48.00** of freight across **5** product lines; joined to `[Order Details]` it sums to **£240.00**. Then predict ALFKI's numbers before running them *(163 orders, £35,907.25 → 5,325 rows, £1,677,372.50)*. Then rank the top 5 customers by freight both ways — **positions 4 and 5 are different customers.** Write one sentence on what that costs if a manager acts on the wrong list. Finish with the fix: aggregate in a subquery, then join *(B's Beverages, 210 orders, £54,797.25)*.
- [ ] 20 min — **Find the real defect.** Section 3. This database has **93 customers and 92 distinct company names**. Find the duplicate, find the trailing space, and write the two-sentence defect note a stakeholder would read. Then answer the follow-up: what would you change so it can't recur?

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Read 3 BI Analyst ads on Reed. Don't apply. Add any repeated phrase to the vocabulary list in `tracking/cv-workspace.md`.

**Say It Out Loud:** "A joined query that returns more rows than it started with has multiplied every measure on the one side — and it doesn't just inflate the totals, it re-orders the ranking."

**Adds to review queue:** You ranked customers by freight two ways. Joined through [Order Details] the top 5 ended IT, B's Beverages, Hungry Coyote, Morgenstern, Piccolo; straight from Orders, positions 4 and 5 were two different companies. Say why inflated numbers still change *who* is top, and what that costs if you send it

> **Written off 2026-08-17**, as calendar D04. This block never ran. Where its four
> tasks went, decided at the Day 7 checkpoint:
>
> - **CV Step 3 — dropped as noise.** The 15 Aug career-profile rewrite covered it, and
>   block 6 finishes the CV.
> - **Lapsed-customer query — stays live in the queue**, not here. He attempted it
>   anyway and misread the result *(tried LEFT JOIN, "it did nothing different" — which
>   is the trap, because the date filter was in the WHERE)*. That queue item is dated
>   and it has a card behind it.
> - **Fan-out on 10273 — stays live in the queue.** The concept was met on Day 3 and the
>   D03 note records the answer as wrong, so it is retention, not new material.
> - **The 93/92 defect — moved to Day 10**, where it fits the relational-model theme
>   better than it fitted here. Its queue item is on `hold` until that day runs.
>
> The freight-ranking item above stays held. Its lesson is already carried by the two
> live fan-out items, so it is month 2 input rather than a gap.

---

## Day 5 — SQL: aggregation
**Theme:** Every management report is a GROUP BY. *Dataset: Northwind.*

**Open:** `workspace/day-05-aggregation.sql`

**DESK (65 min)**
- [ ] 35 min — Ten queries. Each carries the answer — check every one before moving on.
  1. Customers per country. *(22 rows, USA top with 13)*
  2. Total revenue per product. *(77 rows, Côte de Blaye top at £53,265,895.23)*
  3. Average unit price per category. *(8 rows, Meat/Poultry top at £54.01)*
  4. Highest and lowest unit price in `Products`, in one query. *(2.50 and 263.50)*
  5. Orders per employee. *(9 rows, employee 4 — Margaret Peacock — top with 1,908)*
  6. Total quantity sold per product. *(77 rows, Louisiana Hot Spiced Okra top at 206,213)*
  7. Average order value per customer. *(93 rows. The overall average order is £27,538.79)*
  8. Orders per country, per year. *(252 rows — two columns in the GROUP BY)*
  9. Revenue per category, per year. *(96 rows = 8 categories × 12 years)*
  10. Orders per employee, per shipper. *(27 rows = 9 × 3)*
- [ ] 15 min — **One query that needs WHERE and HAVING together:** categories whose 2023 revenue was above £4m. *(5 rows: Beverages, Confections, Meat/Poultry, Dairy Products, Condiments.)* Then write two sentences — why the year filter cannot go in `HAVING`, and why the £4m filter cannot go in `WHERE`.
  1. ⚠️ **Write the year filter as `>= '2023-01-01' AND < '2024-01-01'`, or as `strftime('%Y', OrderDate) = '2023'`.** If you write `>= '2023'` you get all 16,282 orders and no error — the column is declared `DATETIME`, so a bare `'2023'` is read as the *number* 2023 and every text date sorts above it. Try it once, see the 16,282, then never do it again.
- [ ] 15 min — Business framing. Take query 9 and write the one-sentence question a commercial manager would have asked to make you write it. Then say what you would *do* with the answer.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 1, second pass. Cover the definition, say your version aloud, then check.

**Say It Out Loud:** "WHERE filters rows before grouping; HAVING filters groups after. Getting that backwards is one of the most common reporting bugs."

**Adds to review queue:** A stakeholder wants "countries where we have more than 5 customers". Say which clause the `> 5` goes in, and what error you get if you put it in the other one · "Categories whose 2023 revenue was above £4m." Say why the year filter cannot go in HAVING, and why the £4m filter cannot go in WHERE

---

## Day 6 — CV finish + agency outreach
**Theme:** Pipeline goes live today. Nothing is ready. Do it anyway.

**Open:** `tracking/cv-workspace.md` and `tracking/applications.md`

**DESK (75 min)**
- [ ] 30 min — **Step 3 then Step 4** of `tracking/cv-workspace.md`. *(Step 3 was Day 4's, which was written off — it takes 10 minutes and the queue already asks you to say these three aloud, so it has to happen.)* Pick your **three strongest bullets** from the six candidates in the table, write each in problem → action → change shape, and run the defend-check on the 40 percent figure. Then assemble the CV in Step 4's section order. One page ideally, two maximum — don't redesign the layout.
- [ ] 20 min — **Step 5.** Rewrite the LinkedIn headline and About to match. The headline formula and a worked example are in the workspace file.
- [ ] 25 min — **Step 6.** Send the recruiter message. The draft and subject line are already written — change the name and send it to five, then tick them off in the send log and mirror into `tracking/applications.md`.
  1. Circle Recruitment
  2. Harnham
  3. Robert Half
  4. Bristow Holland
  5. Hays Specialist Recruitment

**PHONE (30 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Set job alerts on Reed, CWJobs, Indeed and LinkedIn. All three geographies: Peterborough +20, Cambridge +20, London remote.
- [ ] 10 min — **Week 1 boss fight.** *(Moved here from the Sunday block, which was written off.)* No notes, out loud, in under 90 seconds: what a JOIN fan-out is, how you would spot one, and what it does to a report. Then the second half, which is the one you got wrong on Day 3: say why it changes **who** ranks top, not just how big the total is. If you stall on either, that is a confidence-2 and it goes back in the queue.

**Say It Out Loud:** "I'm a CS graduate with hands-on SQL and Power BI moving into business systems analysis, looking in Peterborough, Cambridge and remote-London."

**Adds to review queue:** Your 30-second self-introduction, out loud and timed

**Why now:** recruiters work on month-long horizons. Contact them week 1, they're warm by week 4. Waiting until you feel ready costs a month.

**Weekly checkpoint — this is the last day of week 1.** When the desk block and the review queue are both done, open `tracking/checkpoint-week-1.md`. It carries the week's readings, the decisions already made about the two written-off days, and the four questions to answer. Run the three commands at the top of it, then tell Claude Code you have done Day 7 and give it the confidence score.

---

## Day 7 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep, all of week 1. Say every answer aloud before checking.
- [ ] 10 min — Read your CV aloud. Anything you couldn't defend if asked goes straight into `tracking/braindump.md`.
- [ ] 10 min — **Week 1 boss fight.** No notes, out loud, in under 90 seconds: what a JOIN fan-out is, how you would spot one, and what it does to a report. If you stall, that is a confidence-2 and it goes back in the queue.

**Say It Out Loud:** 60-second summary of week 1, as if answering "so what have you been working on?"

**Weekly checkpoint:** Claude Code reviews `tracking/progress.md` and adjusts week 2.

---

# WEEK 2 — SQL depth, data modelling, the Power BI model

## Day 8 — SQL: subqueries and CTEs
*Dataset: Northwind.*

**Open:** `workspace/day-08-subqueries.sql`

**DESK (70 min)**
- [ ] 30 min — Five subqueries in `WHERE`, then five in `SELECT`. Answers included — check each one.
  1. `WHERE` — products priced above the average product price. *(25 rows. The average is £28.87)*
  2. `WHERE` — customers who placed an order since 1 Oct 2023. *(58 rows)*
  3. `WHERE` — customers who have **not** ordered since 1 Aug 2023 — the churn list. *(5 rows)*
  4. `WHERE` — orders with freight above the average freight. *(8,025 rows. The average is £248.59)*
  5. `WHERE` — products whose supplier is based in Germany. *(9 rows, from 3 German suppliers)*
  6. `SELECT` — every product, with the overall average price beside it. *(77 rows, same £28.87 repeated)*
  7. `SELECT` — every customer, with their total order count. *(93 rows)*
  8. `SELECT` — every category, with how many products it holds. *(8 rows)*
  9. `SELECT` — every employee, with the date of their most recent order. *(9 rows)*
  10. `SELECT` — every order, with how many line items it has. *(16,282 rows)*
- [ ] 30 min — Rewrite queries **3, 7 and 10** as CTEs (`WITH … AS`). Same answers, different shape. Then write one line on which version you would rather be handed in six months.
- [ ] 10 min — One paragraph in the workspace file: when do you choose a CTE over a subquery? Name the two things a CTE gives you that a subquery does not.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 2. Cover and recall.

**Say It Out Loud:** "I use CTEs over nested subqueries because readable SQL is maintainable SQL, and reporting logic always gets handed over eventually."

**Adds to review queue:** Name the two things a CTE gives you that a subquery does not, and one case where the plain subquery is still the better call · Why is `NOT IN` dangerous when the inner query can return a NULL, and what do you write instead? · Say the difference between a correlated and an uncorrelated subquery, and which one runs once per row

---

## Day 9 — SQL: window functions
**Theme:** What separates "can query" from "can analyse." *Dataset: Northwind.*

**Open:** `workspace/day-09-windows.sql`

**DESK (75 min)**
- [ ] 30 min — Ranking. `ROW_NUMBER`, `RANK`, `DENSE_RANK`.
  1. Rank products by revenue within each category. Keep the top 3. *(24 rows — 8 categories × 3. Beverages should come back Côte de Blaye, Ipoh Coffee, Chang.)*
  2. Say why you cannot filter on the rank in the same `SELECT`, and what you wrap it in instead.
  3. Change `ROW_NUMBER` to `RANK` and then `DENSE_RANK` on the same query. Write one line on what would differ if two products tied.
- [ ] 30 min — Running totals and moving averages with `SUM() OVER (…)`.
  1. Monthly order counts for 2016, with a running total. *(12 rows. January 113, December's running total 1,506)*
  2. Three-month moving average of that same monthly count. *(January 113.00, February 111.00, March 119.00)*
  3. Running total of revenue per category, ordered by month — `PARTITION BY` the category.
  4. Every order with a running total of freight for that customer.
- [ ] 15 min — `LAG`. Month-on-month change in order volume across 2016. *(February −4, March +26. January is NULL — say why, and what you'd show a stakeholder instead of a blank.)*

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one window functions video. Close it and re-explain `PARTITION BY` aloud without replaying.

**Say It Out Loud:** "Window functions let me calculate rankings and running totals without collapsing my rows — exactly what management reporting needs."

**Adds to review queue:** "Rank products by revenue within each category." Say which clause does the "within each category" part, and why GROUP BY cannot do this job · Describe the top-N-per-group pattern out loud, and say why you cannot filter on the rank in the same SELECT · Your 2016 month-on-month query returned NULL for January. Say why, and what you show a stakeholder instead of a blank cell

---

## Day 10 — Data modelling: relational foundations
**Theme:** Named explicitly in senior BSA ads. *Dataset: Northwind.*

**Open:** `workspace/day-10-relational-model.md`

**DESK (75 min)**
- [ ] 10 min — **The defect nobody found.** *(Moved here from Day 4, which was written off. It belongs on the keys day anyway.)* Run `SELECT COUNT(*) FROM Customers` and `SELECT COUNT(DISTINCT CompanyName) FROM Customers`. You get **93 and 92**. Find the two rows that share a name *(both are called `IT`)*, and find the one CustomerID with a trailing space. Then write two sentences in the workspace file: what breaks if a report groups by company name instead of the key, and how you would word that as a defect for a stakeholder — what, so what, recommendation.
- [ ] 30 min — Draw Northwind's schema **from the database itself**, not from a diagram you found. Eleven tables carry data. The workspace file has the table list and a blank grid to fill.
  1. For each table: name the primary key.
  2. For each table: name every foreign key and what it points at.
  3. Mark the cardinality on each relationship — one-to-one, one-to-many, many-to-many.
  4. Find the one many-to-many and name the junction table that resolves it. *(Employees ↔ Territories, resolved by EmployeeTerritories, 49 rows)*
  5. **Two tables in this schema hold zero rows** — `CustomerDemographics` and `CustomerCustomerDemo`. Find them, then write one line: what does an empty table in a live schema tell you, and what would you ask the business about it? *(This is a real BSA question, not a trivia one. An unused table is either dead scope, a feature that was never switched on, or something that broke.)*
- [ ] 20 min — Normalisation. Write, in the workspace file, why `Orders` and `[Order Details]` are two tables and not one. Then list four concrete things that break if you flatten them into one.
- [ ] 15 min — The other side of the argument: two costs of over-normalising when the job is reporting. Tie one of them to something you actually hit on Day 3.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 3. Cover and recall — this tier is your differentiator.

**Say It Out Loud:** "Normalisation protects integrity on the transactional side, but reporting usually wants denormalised structures — knowing which side you're on is the job."

**Adds to review queue:** Point at Northwind: name one primary key, one foreign key, and say what breaks if the foreign key is not enforced · Say the cardinality of Customers→Orders and of Orders→[Order Details] using the words "one to many", then say which of the two caused your £206m freight number · Explain 3NF to a non-technical manager in two sentences, without using the words "normal form" · Northwind holds 93 customers but only 92 distinct company names, and one CustomerID has a trailing space. Say what breaks if you GROUP BY the company name instead of the key, and how you'd word that as a defect for a stakeholder

---

## Day 11 — Relational foundations + design the star
**Theme:** Every BI model is a relational model with the arguments already settled. *Dataset: Northwind.*

**Open:** `workspace/day-11-star-schema.md`

**DESK (100 min)**
- [ ] 15 min — **The defect nobody found.** *(Carried from the written-off Day 10. It belongs here.)* Run `SELECT COUNT(*) FROM Customers` and `SELECT COUNT(DISTINCT CompanyName) FROM Customers`. *(93 and 92.)* Find the two rows sharing a name — both are called `IT` — and find the one CustomerID with a trailing space. *(It is `Val2 `.)* Write two sentences in the workspace file: what breaks if a report groups by company name instead of the key, and how you word that as a defect — what, so what, recommendation.
- [ ] 20 min — **Keys and cardinality, on the real tables.** For Customers, Orders and `[Order Details]`, write down the primary key of each, the foreign keys between them, and the cardinality of each relationship. Then check yourself: `SELECT COUNT(*) FROM Orders` is 16,282 and `SELECT COUNT(*) FROM [Order Details]` is 609,283 — say what that ratio tells you about the grain, out loud, before you look at the answer file.
- [ ] 20 min — **Fan-out, closed for good.** *(This is the oldest unresolved item in the system — met Day 3, answered wrong, and the repair day was written off.)* Run `SELECT SUM(Freight) FROM Orders` *(£4,047,470.50)*, then the same sum joined to `[Order Details]` *(£206,911,676.00)*. Write the one sentence that explains the gap, and the one check that catches it before a report goes out.
- [ ] 30 min — **Design the star.** On paper or in the workspace file: one fact table and its dimensions, for "revenue by product, category, customer, employee and month". Name the grain of the fact table in a single sentence before you draw anything. Mark which columns are keys, which are measures, and which are attributes.
- [ ] 15 min — **Pipeline.** Search Reed, CWJobs and LinkedIn on the three searches in `tracking/applications.md`. **Submit two applications.** Log both in the table with date, company, title and source.

**PHONE (40 min)**
- [ ] 25 min — Review queue. **Grade every card, then tap Next 8 and keep going.** The backlog is the target today, not the block.
- [ ] 15 min — Read two BI Analyst job ads end to end. Write down every data-modelling word you cannot define, and check them against `reference/glossary.md`.

**Say It Out Loud:** "A star schema is one fact table at a stated grain, surrounded by dimensions — and the grain is the first thing I decide, because every measure depends on it."

**Adds to review queue:** Point at Northwind: name one primary key, one foreign key, and say what breaks if the foreign key is not enforced · Say the cardinality of Customers→Orders and of Orders→[Order Details] using the words "one to many", then say which of the two caused your £206m freight number · Northwind holds 93 customers but only 92 distinct company names, and one CustomerID has a trailing space. Say what breaks if you GROUP BY the company name instead of the key, and how you'd word that as a defect for a stakeholder · Orders holds 16,282 rows and £4,047,470 of freight. Join it to [Order Details] and freight comes back £206,911,676. Say what happened, and the one check that catches it before you send the report · What is the grain of a fact table, and why is it the first thing you decide?

---

## Day 12 — Power BI: Power Query
**Theme:** The cleaning step is where the defects get caught or shipped. *Dataset: `data/csv/`.*

**Open:** `workspace/day-13-power-query.md`

**DESK (100 min)**
- [ ] 10 min — Load `data/csv/` into Power BI. All eleven files. Confirm the row counts against SQL: Orders 16,282, `Order Details` 609,283, Products 77, Customers 93.
- [ ] 20 min — **"Remove errors", properly this time.** *(You used it on Day 1 and wrote "I don't even understand what the error was or what it did to fix it.")* Find a column with errors, open the error, and say what caused it. Then compare **Remove errors**, **Replace errors** and **Keep errors** — and write one line on which one silently loses data.
- [ ] 25 min — Six transformations, each in its own applied step, named: promote headers, set data types explicitly, trim the `CustomerID` column *(this fixes `Val2 `)*, split a column, merge Orders with Customers, group by to a summary table.
- [ ] 20 min — **Break it on purpose.** Change a source column name, refresh, read the error, then fix it. Write one line on why hardcoded column names make a refresh fragile.
- [ ] 15 min — **The applied-steps trail.** Screenshot your Applied Steps pane and write two sentences on why an auditable transformation list matters to a business analyst more than to a developer.
- [ ] 10 min — **Pipeline.** Submit two more applications. Log them.

**PHONE (40 min)**
- [ ] 20 min — Review queue.
- [ ] 20 min — Watch one Power Query video. Close it, then re-explain **query folding** aloud without replaying.

**Say It Out Loud:** "Power Query gives me an auditable list of every transformation applied — which is the difference between a number I can defend and a number I merely have."

**Adds to review queue:** In Power Query, what is the difference between Remove errors, Replace errors and Keep errors, and which one loses data without telling you? · What is query folding, and why does it matter on a large table?

---

## Day 13 — Power BI: build the model
**Theme:** A model that fights you at DAX time was built wrong at modelling time. *Dataset: `data/csv/`.*

**Open:** `workspace/day-14-power-bi-model.md`

**DESK (100 min)**
- [ ] 25 min — Build the star you designed on Day 11. Fact table plus dimensions, relationships drawn explicitly, every relationship's cardinality and filter direction checked by hand rather than accepted from autodetect.
- [ ] 15 min — **Turn autodetect off and do it again.** Delete every relationship, disable "autodetect during load", and rebuild by hand. Write one line on what autodetect got wrong or right.
- [ ] 20 min — **Build a proper date table** with `CALENDAR`, mark it as the date table, and relate it to the fact. The data spans **2012 to 2023** — your date table must cover all of it.
- [ ] 20 min — Three visuals off the model: revenue by category, revenue by month, top 10 products. Each must return a number you can check against SQL. Total revenue across all years is **£448,386,633.17**; 2023 alone is **£33,054,490.00**.
- [ ] 10 min — **Prove the fan-out is dead.** Put freight on a card visual. If it reads anything near £206m, your relationship grain is wrong. It should read **£4,047,470.50**.
- [ ] 10 min — **Pipeline.** Two more applications. Log them.

**PHONE (40 min)**
- [ ] 20 min — Review queue.
- [ ] 20 min — Re-explain, aloud: why a date table, why one direction, and what a many-to-many relationship costs you.

**Say It Out Loud:** "I model one-to-many with single-direction filters by default, because bidirectional filtering creates ambiguity that shows up later as a number nobody can explain."

**Adds to review queue:** Why does a Power BI model need its own date table rather than the date column already on the fact? · A card visual shows freight as £206m when the database says £4.0m. Say what is wrong with the model, in one sentence

---

## Day 14 — SUNDAY: clear the backlog + agency outreach
**Theme:** The week's material is only yours if you can still produce it cold. *Phone and messages only — no desk block.*

**Open:** `workspace/day-12-outreach.md`

**PHONE (40 min)**
- [ ] 20 min — **Review queue, all of it.** Grade every card due, tap Next 8, repeat until the overdue count is zero. This is the whole point of the day.
- [ ] 10 min — **Agency outreach.** *(Carried from the written-off Day 7. It is the only block in month 1 that produces interviews.)* Message three of the five agencies in `tracking/applications.md` — Circle, Harnham, Robert Half, Bristow Holland, Hays. Two sentences each: what you are targeting, and what you have built. Ask every one: *"for the roles I'm targeting, what's the single biggest gap in my profile right now?"*
- [ ] 10 min — **Week 2 out loud.** Sixty seconds, as if answering "so what have you been working on?" Cover window functions, the star schema and one defect you found. Time it. Anything over ninety seconds gets cut.

**Say It Out Loud:** "I've spent the week on SQL analytics and dimensional modelling — window functions for ranking and running totals, and star schema design for reporting."

**Adds to review queue:** Your 60-second answer to "so what have you been working on?" — out loud, timed, no notes

---

## Day 15 — DAX: measures vs calculated columns
**Theme:** The distinction that separates people who use Power BI from people who understand it.

**Open:** `workspace/day-15-dax-basics.md`

**DESK (100 min)**
- [ ] 20 min — Write the same calculation twice — once as a calculated column, once as a measure. Put both on a visual. Write down what differs, and when each is evaluated.
- [ ] 25 min — Eight measures: total revenue, total quantity, order count, distinct customers, average order value, revenue per customer, average line value, and freight total. **Check three of them against SQL** — total revenue **£448,386,633.17**, order count **16,282**, distinct customers **93**.
- [ ] 20 min — **Break one on purpose.** Write a measure that returns the wrong answer because it aggregates at the wrong grain — average of an average. Then fix it. *(You hit exactly this on Day 6 and could not say why it was wrong.)*
- [ ] 20 min — Format every measure: currency, thousands separators, decimal places. Then write one sentence on why an unformatted number costs you credibility in a meeting.
- [ ] 15 min — **Pipeline.** Two more applications, and reply to any agency that came back.

**PHONE (40 min)**
- [ ] 20 min — Review queue.
- [ ] 20 min — Say aloud, in business language: what a measure is, what a calculated column is, and which one costs memory.

**Say It Out Loud:** "A calculated column is computed once at refresh and stored in the model. A measure is computed at query time, in the filter context of the visual — which is why measures respond to slicers and columns do not."

**Adds to review queue:** Say the difference between a measure and a calculated column, including when each is evaluated and which one costs model memory · Why is the average of an average wrong, and what do you compute instead?

---

## Day 16 — DAX: CALCULATE and filter context
**Theme:** `CALCULATE` is the whole language. Everything else is arithmetic.

**Open:** `workspace/day-16-calculate.md`

**DESK (100 min)**
- [ ] 25 min — Five `CALCULATE` measures with simple filter arguments — revenue for one category, one year, one country, one employee, one shipper. Say aloud what the filter argument *replaces* rather than adds.
- [ ] 25 min — `ALL`, `ALLEXCEPT` and `REMOVEFILTERS`. Build a "% of total" measure and a "% of category" measure. Both must total 100% when you check them.
- [ ] 20 min — **Row context vs filter context.** Write the one measure that needs `SUMX` rather than `SUM`, and say out loud why iterating is required. Revenue is the obvious case: `SUMX([Order Details], UnitPrice * Quantity * (1 - Discount))`.
- [ ] 20 min — **Break it, then explain it.** Put a measure inside a visual filtered two ways that contradict each other. Predict the number before you look, then explain the result you actually got.
- [ ] 10 min — **Pipeline.** Two more applications.

**PHONE (40 min)**
- [ ] 20 min — Review queue.
- [ ] 20 min — Re-explain `CALCULATE` in one sentence, in the words you would use with a manager who does not write DAX.

**Say It Out Loud:** "CALCULATE evaluates an expression in a filter context you modify — and its filter arguments replace the existing filter on that column rather than narrowing it."

**Adds to review queue:** What does CALCULATE do? One sentence, in the words you'd use with a manager · When do you need SUMX instead of SUM, and what is the row context doing?

---

## Day 17 — DAX: time intelligence + close the week
**Theme:** Every management report is a comparison to last year.

**Open:** `workspace/day-17-time-intelligence.md`

**DESK (100 min)**
- [ ] 25 min — `SAMEPERIODLASTYEAR`, `DATEADD`, `TOTALYTD`. Build year-on-year revenue and a YTD measure. Check one against SQL: 2023 revenue is **£33,054,490.00**.
- [ ] 20 min — Build a "% change vs last year" measure and handle the first year correctly — it has no prior year, so decide what a stakeholder sees instead of a blank. *(Same problem as the `LAG` NULL you met on Day 9.)*
- [ ] 20 min — **Prove the date table earns its place.** Break the relationship to your date table and watch the time-intelligence measures fail. Write one line on why.
- [ ] 20 min — **Week close.** In the workspace file, write the three things you could not do on Monday and can do now, with one concrete example each. This is CV and interview material, not journalling.
- [ ] 15 min — **Pipeline.** Two more applications, and update every row's status in `tracking/applications.md`.

**PHONE (40 min)**
- [ ] 20 min — Review queue.
- [ ] 20 min — Say the whole week aloud in two minutes: window functions, the star, Power Query, the model, DAX. Time it.

**Say It Out Loud:** "Time intelligence needs a marked date table with a continuous unbroken date range — without it, SAMEPERIODLASTYEAR has nothing to shift against."

**Adds to review queue:** Name the three functions you'd reach for to compare this year to last, and the one thing the model must have for any of them to work · Your first year has no prior year to compare against. Say what you show a stakeholder instead of a blank cell

---

## Day 18 — Portfolio 1: scope and model
**Theme:** Build something real on UK public data. This becomes what you talk about in every interview.

**Open:** `workspace/portfolio-1.md`

**DESK (75 min)**
- [ ] 20 min — **Define the business question first, in the workspace file.** One sentence, with a metric in it. Not "a dashboard about NHS data" — "which trusts show the widest gap between referral volume and treatment capacity, and is it widening?" The file has four worked examples to react against; stealing one and adapting it is a legitimate move.
  1. Pick your domain and commit: NHS England, data.gov.uk, or ONS. NHS is strongest if NHS jobs are in your pipeline.
  2. **Hard stop at 20 minutes.** A question you can improve later beats an hour of choosing.
- [ ] 20 min — Download it and clean it in Power Query. Name every applied step as you go — you already know why.
- [ ] 35 min — Build the model. Star schema, explicit relationships, date dimension marked. Same moves as Day 13, new data.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Look at 3 published public-sector Power BI dashboards. You are stealing layout, not content.

**Say It Out Loud:** Your business question. If it takes more than one sentence, it isn't sharp enough yet.

**Adds to review queue:** Your portfolio 1 business question, in one sentence, with the metric in it · State the grain of your portfolio 1 fact table, and name the two model decisions you would defend

---

## Day 19 — Portfolio 1: measures and visuals
**Open:** `workspace/portfolio-1.md`

**DESK (75 min)**
- [ ] 30 min — The 6–8 measures that answer your question. **No more.** Restraint is the skill being demonstrated — a hiring manager reads 20 measures as "didn't know what mattered".
- [ ] 35 min — Build the dashboard. One page, four zones: headline number, trend over time, breakdown by dimension, detail table.
- [ ] 10 min — Remove one visual. There is always one not earning its place. Write one line on which you removed and why — that sentence is an interview answer.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Read 3 ads, reading only for how they describe dashboard and reporting work. Copy the phrasing into `workspace/portfolio-1.md` — you write the case study tomorrow and you want their words in it.

**Say It Out Loud:** "The dashboard answers one question well rather than twenty badly."

---

## Day 20 — Portfolio 1: the write-up
**Theme:** The artifact isn't the dashboard. It's the dashboard *plus* your explanation. The write-up is what gets read first.

**Open:** `workspace/portfolio-1.md`, then copy the finished version into `reference/portfolio.md`

**DESK (70 min)**
- [ ] 35 min — Write the one-page case study. The workspace file has the six headings already — fill them.
  1. The business problem, in the stakeholder's words.
  2. The data: source, size, what was wrong with it.
  3. The model, and **why** you made the two decisions you made.
  4. What you found — at least one number that would change a decision.
  5. What you'd do next with more time or better data.
  6. What you'd do differently.
- [ ] 20 min — Screenshot the dashboard and the model view. The model view screenshot is the one that separates you from someone who has only made charts.
- [ ] 15 min — Add it to the CV and LinkedIn as a named project with the business question as the one-line description.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Practise the 2-minute walkthrough aloud. Twice. Time it — going long is the most common failure.

**Say It Out Loud:** The full 2-minute walkthrough. This is an interview answer. Treat it as one.

**Adds to review queue:** Portfolio 1 — the full two-minute walkthrough, then answer the follow-up: how do you know that number is right?

---

## Day 21 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep.
- [ ] 10 min — **Week 3 boss fight.** Walk through portfolio 1 aloud, no notes, under 2 minutes. Then answer the follow-up you'd least like to be asked: "how do you know that number is right?"
- [ ] 10 min — Applications check. Target 8+ submitted by today. If you are short, week 4 front-loads applications and something else gives.

**Say It Out Loud:** The portfolio 1 walkthrough, and the "how do you know that number is right" answer.

**Weekly checkpoint:** Claude Code adjusts week 4.

---

# WEEK 4 — BA artifacts, second portfolio piece, interview readiness

## Day 22 — Requirements documentation
**Theme:** BRD is the most-named artifact across every job ad collected.

*Scenario: you are the BSA for the organisation behind your portfolio 1 dataset. They want the report you built turned into a recurring monthly product.*

**Open:** `workspace/day-22-brd.md` — the BRD template is already in it.

**DESK (70 min)**
- [ ] 20 min — BRD vs FRD vs SRS. Fill the comparison table in the workspace file: what goes in each, who reads each, what goes wrong when they get merged.
- [ ] 35 min — Write the actual one-page BRD against the scenario. Every heading in the template gets content — an empty "Assumptions" section is the most common real-world failure and it is where scope creep starts.
- [ ] 15 min — Add three non-functional requirements: refresh frequency, access control, performance. Each one needs a **number** in it. "Fast" is not an NFR; "renders in under 5 seconds on 3 years of data" is.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: requirements terminology, full sweep.

**Say It Out Loud:** "A BRD states what the business needs and why; an FRD states what the system must do to deliver it. Conflating them is where scope creep starts."

**Adds to review queue:** BRD vs FRD vs SRS — what each one states, who reads it, and what goes wrong when two of them get merged · What makes a non-functional requirement testable? Give one of your three, with its number in it

---

## Day 23 — User stories, acceptance criteria, UAT
*Same scenario as Day 22.*

**Open:** `workspace/day-23-stories.md`

**DESK (70 min)**
- [ ] 25 min — Six user stories, "As a… I want… so that…". At least two from a **different role** than the obvious one — the report consumer is not the only stakeholder. The workspace file lists five roles to draw from.
- [ ] 25 min — Acceptance criteria for each, Given/When/Then. At least one negative case: what should happen when the data is missing.
- [ ] 20 min — A UAT scenario set with explicit pass/fail criteria. Say who signs it off and what happens if they don't.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: agile and delivery terms.

**Say It Out Loud:** "Acceptance criteria are what make a story testable — without them, 'done' is an opinion."

**Adds to review queue:** Give one of your user stories in full As-a / I-want / So-that form, then its Given/When/Then criteria including the missing-data case · What happens at UAT when the business signs off without actually testing, and how do you stop that?

---

## Day 24 — As-is / to-be and root cause
**Theme:** Root-cause investigation is your natural strength and it's named directly in BSA ads. Today makes it articulable.

**Open:** `workspace/day-24-rootcause.md`

**DESK (70 min)**
- [ ] 20 min — Map the as-is: how would your portfolio 1 report be produced manually today? Capture reality including the ugly parts. Do not fix anything yet.
- [ ] 20 min — Map the to-be with your dashboard in place. Name every gap between the two, and mark which gaps your work actually closes and which it doesn't.
- [ ] 30 min — **Write up one real discrepancy formally.** Use the £206m freight number from Day 3 if nothing better came up in portfolio 1 — it is a genuine one and you found it yourself. The six-step structure is in the workspace file:
  1. Symptom — what looked wrong, and who would have noticed.
  2. Data trace — what you checked first, and what it ruled out.
  3. Calculation logic — where the number was actually formed.
  4. Model configuration — what in the structure allowed it.
  5. Root cause — one sentence, no hedging.
  6. Fix, and how you would stop it recurring.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Re-read the BSA ads. Every phrase about "investigating discrepancies" is now answered by a thing you have written down.

**Say It Out Loud:** "When a report is wrong I trace it back through the data, the calculation logic and the system configuration until I find where it actually diverges. I don't patch the symptom."

**Adds to review queue:** Your root-cause story — the full 90-second STAR version, timed · What is gap analysis, and name one gap your portfolio 1 work does not close

---

## Day 25 — Portfolio 2: build
**Theme:** End-to-end BSA piece — requirement through to reporting. This is the differentiator, because most candidates show a dashboard and stop.

*Different dataset and different domain from portfolio 1. Deliberately — two projects in one domain read as one project.*

**Open:** `workspace/portfolio-2.md`

**DESK (75 min)**
- [ ] 15 min — Pick the dataset and write the business question. **Hard stop at 15 minutes** — you have done this once already and the second one is not harder.
- [ ] 25 min — Write the mini-BRD. Half a page. Reuse the Day 22 template; it exists so this takes 25 minutes and not 70.
- [ ] 35 min — Build the SQL layer. Real queries against the real data, saved in `workspace/portfolio-2.sql`, each with the business question it answers written above it as a comment.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Applications. Submit two more. Two, not "some".

**Say It Out Loud:** "This one shows the full path — requirement, data model, query, report — because that's what a Business Systems Analyst actually does."

---

## Day 26 — Portfolio 2: finish and document
**Open:** `workspace/portfolio-2.md`

**DESK (75 min)**
- [ ] 35 min — Build the Power BI layer on top of the SQL. Fewer visuals than portfolio 1 — this piece is carried by the documentation, not the chart count.
- [ ] 30 min — Write it up, emphasising the **requirements-to-reporting path**. Same six headings as portfolio 1, plus one: which requirement each visual traces back to. That traceability line is the thing hiring managers actually ask about.
- [ ] 10 min — Add to CV and LinkedIn.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Practise the 2-minute walkthrough aloud, once for content and once for time.

**Say It Out Loud:** The portfolio 2 walkthrough, ending on the traceability point.

**Adds to review queue:** Portfolio 2 — the two-minute walkthrough, ending on requirement-to-visual traceability

---

## Day 27 — Interview readiness
**Open:** `workspace/day-27-interview.md` — six STAR slots and the eight technical answers, all with prompts.

**DESK (75 min)**
- [ ] 30 min — Six STAR stories. Situation, Task, Action, Result — the Result needs a number or a stated change.
  1. A data problem you solved.
  2. A root cause you found. *(Day 24 wrote this one for you.)*
  3. Translating between technical and non-technical people.
  4. A time you were wrong. *(Day 3 is a real one: right answer, invalid query.)*
  5. A time you prioritised under pressure.
  6. A time you automated something.
- [ ] 25 min — The eight standard technical answers, written out then said aloud.
  1. INNER vs LEFT JOIN — and when a LEFT silently becomes an INNER.
  2. WHERE vs HAVING.
  3. What is a star schema, and why does it matter commercially?
  4. Measure vs calculated column.
  5. What does CALCULATE do?
  6. How would you investigate a report showing wrong numbers?
  7. What is a non-functional requirement, and what makes one testable?
  8. How do you prioritise competing requirements?
- [ ] 20 min — Five questions to ask **them**, specific to data stack and reporting maturity. "Where does your reporting data actually come from, and who owns it?" beats anything about culture.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — All six STAR stories aloud. Time each one. Anything over 2 minutes gets cut, not re-explained.

**Say It Out Loud:** All six. No notes.

**Adds to review queue:** All six STAR stories, timed, no notes · The eight technical answers, no notes

---

## Day 28 — SUNDAY: month review (phone only)
**No desk block.**

**PHONE (40 min)**
- [ ] 15 min — Full review queue sweep.
- [ ] 10 min — Mock interview in your other Claude chat. Use `prompts/tutor-prompt.md`.
- [ ] 15 min — Read `tracking/progress.md` from Day 1. Honest month summary in the brain dump: what stuck, what didn't, what you avoided. **What you avoided is the most useful line** — it is what month 2 gets weighted toward.

**Say It Out Loud:** The 30-second self-introduction, then both portfolio walkthroughs, back to back. That is a screening call.

**Month checkpoint:** Claude Code generates `plan/month-02.md`, weighted toward weakest confidence scores and whatever interviews revealed.

**Targets:**
- [ ] 15+ applications submitted
- [ ] 5+ agency conversations open
- [ ] 2 portfolio artifacts documented
- [ ] CV and LinkedIn rewritten in analyst language
- [ ] Can explain star schema, filter context and a root-cause investigation aloud, no notes
