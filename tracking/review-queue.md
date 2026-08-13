# Review Queue

**This is the most important file in the system.** Your stated problem isn't learning — it's that things vanish when you stop revisiting them. This file is the fix.

## How it works

Intervals: **1 → 3 → 7 → 14 → 30 days.**

Every item you learn enters at interval 1. When you review it:

| Confidence | What happens |
|---|---|
| 4–5 | Advance to next interval |
| 3 | Repeat current interval |
| 1–2 | Drop back one interval |

Claude Code maintains the `due` dates. You just review what's listed as due today and mark confidence.

**Daily load is capped at 5–8 items.** If it grows past that, Claude Code promotes your strongest items rather than making the block longer. An overlong review block is the first thing you'll skip, and skipping it is the failure mode this whole system exists to prevent.

## How to actually review (this matters)

Do **not** re-read the answer. That produces the illusion of knowing.

For each item:
1. Read the prompt only.
2. Say the answer **out loud**, in full sentences, in business language.
3. *Then* check.
4. Score honestly.

Saying it aloud is not optional dressing — it's the same skill the interview tests. Silent recognition is not recall.

---

## Queue

Format: `[interval] due:YYYY-MM-DD | prompt | last-conf`

```
[3] due:2026-08-17 | Write the SQL for top 5 Northwind products by revenue. Say why Discount changes the answer. | 4
[3] due:2026-08-17 | Why does WHERE COUNT(*) > 10 fail, and what do you use instead? | 4
[3] due:2026-08-17 | In Power Query, what does Remove Errors actually do to your rows, and why is that dangerous in an analysis? | 4
[3] due:2026-08-18 | Which Northwind download works with DB Browser for SQLite, and why does the sql-server-samples one not? | 4
[3] due:2026-08-18 | Why does SELECT * FROM Order Details fail, and what are the two ways to fix it? | 4
[3] due:2026-08-18 | Is ROUND an alternative to SUM? Say what each one does and how you would use both in one query. | 4
[1] due:2026-08-14 | "Count of unshipped orders next to the count of all orders." Write it. One query, no subquery — then say what phrase in a request tells you to reach for this pattern. | 
[1] due:2026-08-14 | Your query 9 returned 350 orders. The right answer was 357. Say what BETWEEN did to the last day of the range, and what you write instead. | 
[1] due:2026-08-14 | Read this aloud: "products above 20 that are not discontinued". How many conditions is that? How many did you write? What is the five-second check that catches it? | 
[1] due:2026-08-14 | Query 12 told you to try `= NULL` first and watch it return nothing. Say why it returns nothing, and what you use instead. | 
[1] due:2026-08-14 | How do you get Northwind data into Power BI, given there is no SQLite connector? | 
[1] due:2026-08-14 | In a Power BI bar chart, how do you show orders per country without pre-aggregating the data? | 
[1] due:2026-08-15 | INNER vs LEFT | 
[1] due:2026-08-15 | row fan-out | 
[1] due:2026-08-15 | join direction | 
[1] due:2026-08-15 | Write the SQL for Northwind customers with more than 10 orders, then say what it tells the business. | 
[3] due:2026-08-15 | Why does SELECT TOP 5 fail in SQLite, and what replaces it? | 
[3] due:2026-08-15 | In a GROUP BY query, what does SUM() do and where does the multiplication actually happen? | 
[1] due:2026-08-16 | your 3 strongest CV bullets | 
[1] due:2026-08-16 | You wrote `Discontinued IS 0` and it worked. Say why, and why that same query fails on SQL Server. | 
[1] due:2026-08-16 | "I think it's just a trick question." Your 1997 query returned nothing. Say the one line of SQL you run before deciding a filter is wrong. | 
[3] due:2026-08-16 | You wrote 'B%' and '%market%'. Say what each wildcard does, and name one case where LIKE is the wrong tool. | 
[3] due:2026-08-16 | "The brackets got me at first." Say why `A OR B AND C` is not `(A OR B) AND C`, and which one binds tighter. | 
[3] due:2026-08-16 | Say the order you build a SQL query in, and why it is not the order it reads in. | 
[1] due:2026-08-18 | WHERE vs HAVING | 
[1] due:2026-08-18 | GROUP BY with multiple columns | 
[1] due:2026-08-20 | CTE syntax | 
[1] due:2026-08-20 | subquery vs CTE tradeoff | 
[1] due:2026-08-21 | PARTITION BY | 
[1] due:2026-08-21 | top-N-per-group pattern | 
[1] due:2026-08-21 | LAG/LEAD | 
[1] due:2026-08-22 | PK/FK | 
[1] due:2026-08-22 | cardinality | 
[1] due:2026-08-22 | 3NF | 
[1] due:2026-08-22 | normalise vs denormalise tradeoff | 
[1] due:2026-08-23 | fact vs dimension | 
[1] due:2026-08-23 | star vs snowflake | 
[1] due:2026-08-23 | reference vs transactional data | 
[1] due:2026-08-23 | data mart | 
[1] due:2026-08-25 | unpivot | 
[1] due:2026-08-25 | applied steps | 
[1] due:2026-08-25 | type changes as an error source | 
[1] due:2026-08-26 | cardinality in Power BI | 
[1] due:2026-08-26 | filter direction | 
[1] due:2026-08-26 | date dimension | 
[1] due:2026-08-27 | measure vs calculated column | 
[1] due:2026-08-27 | DIVIDE vs / | 
[1] due:2026-08-27 | filter context (intro) | 
[1] due:2026-08-28 | ALL vs ALLEXCEPT | 
[1] due:2026-08-28 | % of total pattern | 
[1] due:2026-08-28 | filter context (deep) | 
[1] due:2026-08-29 | YTD/QTD/MTD | 
[1] due:2026-08-29 | SAMEPERIODLASTYEAR | 
[1] due:2026-08-29 | marked date table | 
[1] due:2026-08-30 | your portfolio 1 business question | 
[1] due:2026-09-02 | portfolio 1 two-minute walkthrough | 
[1] due:2026-09-03 | BRD vs FRD vs SRS | 
[1] due:2026-09-03 | functional vs non-functional | 
[1] due:2026-09-04 | user story format | 
[1] due:2026-09-04 | Given/When/Then | 
[1] due:2026-09-04 | UAT pass/fail criteria | 
[1] due:2026-09-05 | as-is/to-be | 
[1] due:2026-09-05 | gap analysis | 
[1] due:2026-09-05 | your root-cause story | 
[1] due:2026-09-08 | portfolio 2 walkthrough | 
[1] due:2026-09-09 | the 8 technical answers | 
```

*(Claude Code populates this as you progress. Items are added by the "Adds to review queue" line at the bottom of each day in `plan/month-01.md`.)*

---

## Permanent items — never leave the queue

These stay on a 30-day cycle indefinitely, because they're what interviews actually test:

```
[30] due:2026-08-31 | Your 30-second self-introduction | 
[30] due:2026-08-31 | Portfolio 1 — full 2-minute walkthrough | 
[30] due:2026-08-31 | Portfolio 2 — full 2-minute walkthrough | 
[30] due:2026-08-31 | Your root-cause investigation story | 
[30] due:2026-08-31 | All 6 STAR stories | 
[30] due:2026-08-31 | What is a star schema and why does it matter commercially? | 
[30] due:2026-08-31 | What does CALCULATE do in DAX? | 
```
