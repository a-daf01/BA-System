# Month 01 — Days 1 to 28

**Goal by Day 28:** two portfolio artifacts live, CV rewritten in analyst language, 15+ applications submitted, agency relationships open, and the ability to talk fluently about SQL, data modelling and BI in business terms.

**Every day:** DESK block (60–75 min) + PHONE block (20–30 min) + one Say It Out Loud + one line in `tracking/progress.md`.

**Sundays (Days 7, 14, 21, 28) are phone-only consolidation days.** Deliberate. You said you'd do exactly what's written and no more — so recovery is written in.

**Every day names the file it writes into.** Nothing in this month starts on a blank page. If a day says `workspace/day-08-subqueries.sql`, that file already exists with the questions in it — open it and type underneath.

**Every SQL task carries the answer it should produce.** A row count, a total, a top row. You are not meant to wonder whether you got it right — check, and if it doesn't match, that mismatch is the lesson. Model answers are in `reference/answers/`, and every one of them says *open me second*.

**One dataset, all month.** Northwind for SQL (Days 2–10), the same Northwind exported to CSV for Power BI (Days 11–17), UK public data for the two portfolio pieces. There is no second database to install. `reference/datasets.md` has the detail.

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

**Adds to review queue:** Order 10273 carries £48.00 of freight and has 5 product lines. Joined to [Order Details] that order's freight sums to £240.00. Say the rule that predicts the 240 before you run it · You ranked customers by freight two ways. Joined through [Order Details] the top 5 ended IT, B's Beverages, Hungry Coyote, Morgenstern, Piccolo; straight from Orders, positions 4 and 5 were two different companies. Say why inflated numbers still change *who* is top, and what that costs if you send it · Northwind holds 93 customers but only 92 distinct company names, and one CustomerID has a trailing space. Say what breaks if you GROUP BY the company name instead of the key, and how you'd word that as a defect for a stakeholder

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
- [ ] 30 min — Assemble the CV from Step 2 of the workspace file. One page ideally, two maximum. Section order is in the workspace file — don't redesign it.
- [ ] 20 min — Rewrite the LinkedIn headline and About to match. The headline formula and a worked example are in the workspace file.
- [ ] 25 min — Send the recruiter message. The draft is already written in `tracking/cv-workspace.md` — change the name and send it to five, then tick them off in `tracking/applications.md`.
  1. Circle Recruitment
  2. Harnham
  3. Robert Half
  4. Bristow Holland
  5. Hays Specialist Recruitment

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Set job alerts on Reed, CWJobs, Indeed and LinkedIn. All three geographies: Peterborough +20, Cambridge +20, London remote.

**Say It Out Loud:** "I'm a CS graduate with hands-on SQL and Power BI moving into business systems analysis, looking in Peterborough, Cambridge and remote-London."

**Adds to review queue:** Your 30-second self-introduction, out loud and timed

**Why now:** recruiters work on month-long horizons. Contact them week 1, they're warm by week 4. Waiting until you feel ready costs a month.

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

**DESK (65 min)**
- [ ] 30 min — Draw Northwind's schema **from the database itself**, not from a diagram you found. Eleven tables carry data. The workspace file has the table list and a blank grid to fill.
  1. For each table: name the primary key.
  2. For each table: name every foreign key and what it points at.
  3. Mark the cardinality on each relationship — one-to-one, one-to-many, many-to-many.
  4. Find the one many-to-many and name the junction table that resolves it. *(Employees ↔ Territories, resolved by EmployeeTerritories, 49 rows)*
- [ ] 20 min — Normalisation. Write, in the workspace file, why `Orders` and `[Order Details]` are two tables and not one. Then list four concrete things that break if you flatten them into one.
- [ ] 15 min — The other side of the argument: two costs of over-normalising when the job is reporting. Tie one of them to something you actually hit on Day 3.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 3. Cover and recall — this tier is your differentiator.

**Say It Out Loud:** "Normalisation protects integrity on the transactional side, but reporting usually wants denormalised structures — knowing which side you're on is the job."

**Adds to review queue:** Point at Northwind: name one primary key, one foreign key, and say what breaks if the foreign key is not enforced · Say the cardinality of Customers→Orders and of Orders→[Order Details] using the words "one to many", then say which of the two caused your £206m freight number · Explain 3NF to a non-technical manager in two sentences, without using the words "normal form"

---

## Day 11 — Data modelling: design the star
**Theme:** Turning a transactional schema into a reporting one. This is the Business Systems Analyst job in a single exercise, and tomorrow you build what you design today.

**Open:** `workspace/day-11-star-schema.md`

**DESK (70 min)**
- [ ] 25 min — **Write the grain statement first.** One sentence: "one row in my fact table represents ______." Get this wrong and everything downstream is wrong. The workspace file has three candidate grains for Northwind — pick one and justify it in two lines.
- [ ] 30 min — Design the star on paper. The workspace file has the slots; fill them.
  1. Name the fact table and list every column in it. Measures and foreign keys only — no descriptions.
  2. Name each dimension and its columns. *(You should land on five: product, customer, employee, shipper, date.)*
  3. For each Northwind column, say which side it goes on and why. `UnitPrice` is the one worth arguing about — decide and write your reasoning.
  4. Say where `Categories` and `Suppliers` go. Folding them into the product dimension makes a star; leaving them separate makes a snowflake. Pick one and name the trade.
- [ ] 15 min — Classify every Northwind table as **reference** or **transactional**, then write "reporting data mart" in a paragraph as you'd explain it to a non-technical manager.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Re-read the BSA requirements in `reference/target-roles.md`. Count how many phrases from today appear in them.

**Say It Out Loud:** "A star schema keeps measures in a fact table and descriptive attributes in dimensions, so the model stays fast and the business can slice it themselves."

**Adds to review queue:** State the grain of your Northwind fact table in one sentence, then say what you did with Freight and why · Draw a star and a snowflake in the air and say the one structural difference, then why BI tools generally prefer the star · What is a data mart, and how is it different from a warehouse? Answer as if a hiring manager asked it

---

## Day 12 — Power BI: Power Query
**Theme:** Where 80% of real Power BI work happens, and where you already know you have a gap. *Dataset: a messy UK public CSV.*

**Open:** `workspace/day-12-power-query.md`

**DESK (75 min)**
- [ ] 15 min — Get a messy CSV. `data.gov.uk`, search **"local authority spending over £500"**. Take the **first result** that is a `.csv`, is over 1,000 rows, and has a date column. Do not look past the third candidate.
  1. **Hard stop at 15 minutes.** If it is fighting you, use `data/csv/Orders.csv` instead and log the swap in the brain dump. The exercise is the transformations, not the sourcing.
- [ ] 40 min — Clean it. Each of these at least once, in this order:
  1. Remove unneeded columns.
  2. Change a column type — and when one throws errors, **click the error cell and read the actual value before doing anything else.**
  3. Fix that type properly with Change Type → Using Locale (`en-GB` for UK dates). Note how many rows came back.
  4. Split a column.
  5. Replace values.
  6. Remove duplicates — record the row count before and after.
  7. Unpivot a set of columns into rows.
- [ ] 20 min — Open Applied Steps, rename every step to what it actually did, then write two sentences in the workspace file: what **Remove Errors** does to your rows, and why "I removed the errors" is a bad answer in an interview.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Watch one Power Query video.

**Say It Out Loud:** "Power Query is where I control data quality before it reaches the model — and naming the applied steps means someone else can audit what I did."

**Adds to review queue:** What does Remove Errors actually do to your rows, and what do you do instead? · What is unpivot for, and what shape of data tells you that you need it?

---

## Day 13 — Power BI: build the model
**Theme:** Build the star you designed on Day 11. *Dataset: Northwind CSVs — already exported to `data/csv/`.*

**Open:** `workspace/day-13-power-bi-model.md`

**DESK (70 min)**
- [ ] 10 min — Load the data. Power BI → Get Data → **Folder** → `data/csv` → Combine and Load. Keep Orders, OrderDetails, Products, Customers, Employees, Shippers, Categories.
  1. *If Folder import gives you trouble, load the seven CSVs individually. Same result, two extra minutes.*
- [ ] 30 min — Build the relationships in Model view to match your Day 11 design.
  1. Set every relationship's cardinality explicitly. Do not accept the auto-detected one without reading it.
  2. Check the filter direction arrow on each. Single, pointing from the one side to the many side.
  3. Fold Categories into Products with a merge — or leave it separate and note that you have built a snowflake.
- [ ] 15 min — **Break it on purpose.** Set one relationship to both-directional, put a visual on screen, and watch the number change. Write down what it showed and why. Then fix it.
- [ ] 15 min — Build a date dimension and **mark it as a date table**. Northwind spans 2012-07-10 to 2023-10-28, so it needs to cover 2012 to 2023 with no gaps.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary sweep: everything from week 2, covered and recalled.

**Say It Out Loud:** "Most broken Power BI reports aren't broken visuals — they're broken relationships in the model underneath."

**Adds to review queue:** You set one relationship to both-directional and the number on screen changed. Say what happened, and how you would spot it on a model someone else built · Say what cardinality and filter direction each control in Power BI, and which way the arrow should point on a fact-to-dimension relationship

---

## Day 14 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep. Aloud, then check.
- [ ] 10 min — **Week 2 boss fight.** No notes, under 2 minutes: your Northwind star schema. The grain, the fact table, the five dimensions, and one design decision you made and why.
- [ ] 10 min — Applications check. Any recruiter reply gets answered today, not tomorrow.

**Say It Out Loud:** 90-second summary of weeks 1–2, as an interview answer.

**Weekly checkpoint:** Claude Code adjusts week 3.

---

# WEEK 3 — DAX, dashboards, portfolio artifact 1

## Day 15 — DAX: measures vs calculated columns
*Dataset: your Northwind model from Day 13.*

**Open:** `workspace/day-15-dax-basics.md`

**DESK (70 min)**
- [ ] 30 min — Five measures, then five calculated columns, on the same model.
  1. Measure — Total Revenue. `SUMX` over OrderDetails: quantity × price × (1 − discount). *(Should total £448,386,633.17 with no filters.)*
  2. Measure — Total Quantity.
  3. Measure — Order Count. *(16,282)*
  4. Measure — Average Order Value. *(£27,538.79)*
  5. Measure — Distinct Customer Count. *(93)*
  6. Column — line total on the fact table.
  7. Column — price band (`High` / `Medium` / `Low`) on Products.
  8. Column — order year on the date table.
  9. Column — full name, first and last concatenated, on Employees.
  10. Column — `Yes`/`No` flag for whether a row was discounted. *(Only 0.1% of lines are discounted in this build — worth knowing before you build a discount analysis on it.)*
- [ ] 25 min — `SUM` vs `SUMX`, `COUNTROWS`, `DISTINCTCOUNT`, `DIVIDE`.
  1. Build Average Order Value with `/` and then with `DIVIDE`. Filter the visual down to something that returns no rows and watch what each one does.
  2. Write the one-line rule for when `SUM` cannot do the job and you need `SUMX`.
- [ ] 15 min — The rule for measure vs calculated column, in your own words, in the workspace file. Then say which of your ten above you would delete if the model got slow, and why.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one DAX fundamentals video.

**Say It Out Loud:** "Calculated columns compute once at refresh and sit in memory; measures compute at query time in filter context. The wrong choice gives you a slow report or a wrong one."

**Adds to review queue:** When can SUM not do the job, so you need SUMX? Give the Northwind revenue example · Measure or calculated column? Say the rule, then say which of your ten you would delete first if the model got slow · What does DIVIDE do that `/` does not?

---

## Day 16 — DAX: CALCULATE and filter context
**Theme:** The hardest concept in Power BI. Expect discomfort — that is the day working, not failing.

**Open:** `workspace/day-16-calculate.md`

**DESK (75 min)**
- [ ] 35 min — Ten `CALCULATE` variations on Total Revenue, in order. Each one is one line.
  1. Revenue for Beverages only. *(£92,163,184.18)*
  2. Revenue for customers in Germany.
  3. Revenue for 2016 only. *(£40,568,672)*
  4. Revenue for Beverages **and** Confections together.
  5. Revenue for everything **except** Beverages.
  6. Revenue where unit price is above £50.
  7. Revenue for Beverages in 2016 — two filters at once.
  8. Revenue for Beverages **or** German customers. *(This one needs `FILTER`. Work out why the simple form can't express it.)*
  9. Revenue for the High price band, reusing your Day 15 column.
  10. Put measure 1 in a visual sliced by category, and look at the Confections row. Say which filter won and why.
- [ ] 25 min — `ALL`, `ALLEXCEPT`, `FILTER`. Build a **% of total revenue** measure and put it in a table by category. *(The percentages must sum to 100. If they don't, your `ALL` is in the wrong place.)*
- [ ] 15 min — Explain filter context in writing, under 100 words, no jargon, in the workspace file. Then read it aloud and cut anything a non-technical manager would not follow.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Second pass on filter context from a different source. This concept genuinely needs two explanations — that is not you being slow.

**Say It Out Loud:** "CALCULATE modifies the filter context a measure evaluates in. That's the whole idea — everything else in DAX is a variation on it."

**Adds to review queue:** Say what CALCULATE does to filter context in one sentence — the version you would say to a manager, not to an analyst · Your % of total has to sum to 100. Say where ALL goes to make that true, and what ALLEXCEPT would have given you instead

---

## Day 17 — DAX: time intelligence
*Dataset: your Northwind model.*

**Open:** `workspace/day-17-time-intelligence.md`

**DESK (70 min)**
- [ ] 25 min — YTD, QTD and MTD against your marked date dimension. Put all three in one table sliced by month.
- [ ] 25 min — `SAMEPERIODLASTYEAR`, then a year-on-year variance measure and a YoY % measure. Slice by year. *(2022 £39.7m, 2023 £33.1m.)*
  1. **That 2023 drop is not a drop.** The data stops on 28 Oct 2023, so 2023 is ten months against twelve. Write the sentence you would put on the dashboard so nobody reads it as a collapse in trading.
  2. This is the single most common way a real YoY chart lies. Say out loud how you would check for it on a dataset you had never seen.
- [ ] 20 min — Unmark the date table and watch time intelligence break. Write down exactly what changed and why, then mark it again.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: reporting and KPI terms.

**Say It Out Loud:** "Time intelligence only works against a properly marked date dimension — and before I report a year-on-year fall I check whether the current period is complete."

**Adds to review queue:** 2022 was £39.7m and 2023 was £33.1m. Say why that is not a 17% fall, and how you would check for it on a dataset you had never seen · Say what YTD, QTD and MTD each give you, and what breaks the moment the date table is unmarked

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
