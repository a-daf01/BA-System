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
2. Tap it if you can't place it — you get **where it came from** and a **hint**, not the answer.
3. Say the answer **out loud**, in full sentences, in business language.
4. *Then* tap **Show answer** and see whether you were right.
5. Tap the tick box and move on.

Saying it aloud is not optional dressing — it's the same skill the interview tests. Silent recognition is not recall.

**The answer to every item is on the back of the card.** It lives in
`tracking/review-cards.md` and the dashboard shows it inline — where the question came
from, a hint, and the full answer with the reasoning. You should never have to go and
find anything. If an item has no card, that's a bug: say so and it gets written.

**The answer sits behind one extra tap on purpose.** Reading it first produces the feeling
of knowing without the knowing, and that feeling is exactly what has cost you a degree's
worth of material before. Say your version out loud, then reveal.

**Every prompt is answerable from the prompt alone.** No "see Day 4", no "query 9",
no bare topic labels. If a line ever sends you to another file to work out what it
is asking, that's a bug — say so and it gets fixed, because a review block with
friction in it is a review block that doesn't happen.

**Tapping an item is not scoring it.** It's your place in the block, it clears itself overnight, and it never reaches `progress.md`. You score **once**, at the end of the day, on the 1–5 buttons — that single number is what moves everything that fell due. Rating items one at a time would be friction, and friction is what gets this dropped.

---

## Queue

Format: `[interval] due:YYYY-MM-DD | prompt | last-conf`

```
[1] due:2026-08-14 | Read "products above 20 that are not discontinued" aloud. How many conditions is that, and what is the five-second check that catches a dropped one? | 
[1] due:2026-08-14 | Why does `= NULL` return nothing, and what do you use instead? | 
[1] due:2026-08-14 | You wrote 'B%' and '%market%'. Say what each wildcard does, and name one case where LIKE is the wrong tool | 
[3] due:2026-08-15 | Why does SELECT TOP 5 fail in SQLite, and what replaces it? | 
[3] due:2026-08-15 | In a GROUP BY query, what does SUM() do, and where does the multiplication actually happen? | 
[1] due:2026-08-15 | Write the SQL for Northwind customers with more than 180 orders, then say what it tells the business. (Every customer in this build has at least 154, so a threshold of 10 would return all 93 and tell you nothing — say how you'd pick a threshold on data you'd never seen.) | 
[1] due:2026-08-15 | You wrote `INNER JOIN Orders ... WHERE o.OrderID IS NULL` and got 0 rows. Say why that returns 0 on every database that has ever existed, and what you should have written | 
[1] due:2026-08-15 | Orders holds 16,282 rows and £4,047,470 of freight. Join it to [Order Details] and freight comes back £206,911,676. Say what happened, and the one check that catches it before you send the report | 
[1] due:2026-08-15 | "Every customer, and their order count since Oct 2023." One version returns 93 customers, the other 58. Say which clause the date filter is in, in each — and why the 58 version is the wrong answer to that question | 
[1] due:2026-08-16 | You wrote `Discontinued IS 0` and it worked. Say why, and why that same query fails on SQL Server. | 
[1] due:2026-08-16 | Your 1997 query returned nothing and you called it a trick question. Say the one line of SQL you run before deciding a filter is wrong. | 
[3] due:2026-08-16 | Say why `A OR B AND C` is not `(A OR B) AND C`, and which operator binds tighter. | 
[3] due:2026-08-16 | Say the order you build a SQL query in, and why it is not the order it reads in. | 
[1] due:2026-08-16 | Say your three strongest CV bullets aloud from memory, in the problem → action → change shape | 
[1] due:2026-08-16 | Order 10273 carries £48.00 of freight and has 5 product lines. Join Orders to [Order Details] and that order's freight sums to £240.00. Say the rule that predicts the 240 before you run it | 
[3] due:2026-08-17 | Why does WHERE COUNT(*) > 10 fail, and what do you use instead? | 4
[3] due:2026-08-17 | In Power Query, what does Remove Errors actually do to your rows, and why is that dangerous in an analysis? | 4
[3] due:2026-08-17 | "Count of unshipped orders next to the count of all orders." Write it — one query, no subquery. Then say what phrase in a request tells you to reach for this pattern. | 
[3] due:2026-08-17 | Your Q1 2016 query returned 350 orders using BETWEEN. The right answer is 357. Say what BETWEEN did to the last day of the range, and what you write instead. | 
[3] due:2026-08-17 | Power BI has no SQLite connector. Say the two routes for getting Northwind into it, and which one this repo already did for you. | 
[3] due:2026-08-17 | In a Power BI bar chart, how do you show orders per country without pre-aggregating the data? | 
[3] due:2026-08-18 | Which Northwind download works with DB Browser for SQLite, and why does the sql-server-samples one not? | 4
[3] due:2026-08-18 | Why does SELECT * FROM [Order Details] fail, and what are the two ways to fix it? | 4
[3] due:2026-08-18 | Is ROUND an alternative to SUM? Say what each one does and how you would use both in one query. | 4
[1] due:2026-08-18 | A stakeholder wants "countries where we have more than 5 customers". Say which clause the `> 5` goes in, and what error you get if you put it in the other one | 
[1] due:2026-08-18 | "Categories whose 2023 revenue was above £4m." Say why the year filter cannot go in HAVING, and why the £4m filter cannot go in WHERE | 
[1] due:2026-08-19 | Northwind's top 5 products by revenue come back in the same order whether you apply Discount or ignore it, and the total only moves 0.02%. Say why you apply it anyway. | 
[1] due:2026-08-19 | `WHERE OrderDate >= '2023'` returns all 16,282 orders. `WHERE OrderDate >= '2023-01-01'` returns 1,132. Say what the database did with the bare '2023', and why this is more dangerous than a query that errors. | 
[1] due:2026-08-20 | Rank revenue by country using Customers.Country and then using Orders.ShipCountry: positions 2 and 3 swap between Germany and France. Both queries are correct SQL. Say what question each one actually answers, and what you'd ask the stakeholder before picking. | 
[1] due:2026-08-21 | "Rank products by revenue within each category." Say which clause does the "within each category" part, and why GROUP BY cannot do this job | 
[1] due:2026-08-21 | Describe the top-N-per-group pattern out loud, and say why you cannot filter on the rank in the same SELECT | 
[1] due:2026-08-21 | Your 2016 month-on-month query returned NULL for January. Say why, and what you show a stakeholder instead of a blank cell | 
[1] due:2026-08-21 | Name the two things a CTE gives you that a subquery does not, and one case where the plain subquery is still the better call | 
[1] due:2026-08-21 | Why is `NOT IN` dangerous when the inner query can return a NULL, and what do you write instead? | 
[1] due:2026-08-21 | Say the difference between a correlated and an uncorrelated subquery, and which one runs once per row | 
[1] due:2026-08-22 | Point at Northwind: name one primary key, one foreign key, and say what breaks if the foreign key is not enforced | 
[1] due:2026-08-22 | Say the cardinality of Customers→Orders and of Orders→[Order Details] using the words "one to many", then say which of the two caused your £206m freight number | 
[1] due:2026-08-22 | Explain 3NF to a non-technical manager in two sentences, without using the words "normal form" | 
[1] due:2026-08-23 | State the grain of your Northwind fact table in one sentence, then say what you did with Freight and why | 
[1] due:2026-08-23 | Draw a star and a snowflake in the air and say the one structural difference, then why BI tools generally prefer the star | 
[1] due:2026-08-23 | What is a data mart, and how is it different from a warehouse? Answer as if a hiring manager asked it | 
[1] due:2026-08-25 | What does Remove Errors actually do to your rows, and what do you do instead? | 
[1] due:2026-08-25 | What is unpivot for, and what shape of data tells you that you need it? | 
[1] due:2026-08-26 | You set one relationship to both-directional and the number on screen changed. Say what happened, and how you would spot it on a model someone else built | 
[1] due:2026-08-26 | Say what cardinality and filter direction each control in Power BI, and which way the arrow should point on a fact-to-dimension relationship | 
[1] due:2026-08-27 | When can SUM not do the job, so you need SUMX? Give the Northwind revenue example | 
[1] due:2026-08-27 | Measure or calculated column? Say the rule, then say which of your ten you would delete first if the model got slow | 
[1] due:2026-08-27 | What does DIVIDE do that `/` does not? | 
[1] due:2026-08-28 | Say what CALCULATE does to filter context in one sentence — the version you would say to a manager, not to an analyst | 
[1] due:2026-08-28 | Your % of total has to sum to 100. Say where ALL goes to make that true, and what ALLEXCEPT would have given you instead | 
[1] due:2026-08-29 | 2022 was £39.7m and 2023 was £33.1m. Say why that is not a 17% fall, and how you would check for it on a dataset you had never seen | 
[1] due:2026-08-29 | Say what YTD, QTD and MTD each give you, and what breaks the moment the date table is unmarked | 
[1] due:2026-08-30 | Your portfolio 1 business question, in one sentence, with the metric in it | 
[1] due:2026-08-30 | State the grain of your portfolio 1 fact table, and name the two model decisions you would defend | 
[1] due:2026-09-02 | Portfolio 1 — the full two-minute walkthrough, then answer the follow-up: how do you know that number is right? | 
[1] due:2026-09-03 | BRD vs FRD vs SRS — what each one states, who reads it, and what goes wrong when two of them get merged | 
[1] due:2026-09-03 | What makes a non-functional requirement testable? Give one of your three, with its number in it | 
[1] due:2026-09-04 | Give one of your user stories in full As-a / I-want / So-that form, then its Given/When/Then criteria including the missing-data case | 
[1] due:2026-09-04 | What happens at UAT when the business signs off without actually testing, and how do you stop that? | 
[1] due:2026-09-05 | Your root-cause story — the full 90-second STAR version, timed | 
[1] due:2026-09-05 | What is gap analysis, and name one gap your portfolio 1 work does not close | 
[1] due:2026-09-08 | Portfolio 2 — the two-minute walkthrough, ending on requirement-to-visual traceability | 
[1] due:2026-09-09 | All six STAR stories, timed, no notes | 
[1] due:2026-09-09 | The eight technical answers, no notes | 
[1] due:hold | Your 30-second self-introduction, out loud and timed | 
[1] due:hold | You ranked customers by freight two ways. Joined through [Order Details] the top 5 ended IT, B's Beverages, Hungry Coyote, Morgenstern, Piccolo; straight from Orders, positions 4 and 5 were two different companies. Say why inflated numbers still change *who* is top, and what that costs if you send it | 
[1] due:hold | Northwind holds 93 customers but only 92 distinct company names, and one CustomerID has a trailing space. Say what breaks if you GROUP BY the company name instead of the key, and how you'd word that as a defect for a stakeholder | 
```

*(Claude Code populates this as you progress. Items are added by the "Adds to review queue" line at the bottom of each day in `plan/month-01.md`.)*

---

## Permanent items — never leave the queue

These stay on a 30-day cycle indefinitely, because they're what interviews actually test.

**They start after Day 28**, deliberately. Every one of them depends on work you
haven't done yet — asking for a portfolio 2 walkthrough in week 3 would produce a
false confidence-1 and corrupt the queue with it.

```
[30] due:2026-09-10 | Your 30-second self-introduction. Out loud, timed, no notes. | 
[30] due:2026-09-10 | Portfolio 1 — the full two-minute walkthrough, ending on what you would do differently. | 
[30] due:2026-09-11 | Portfolio 2 — the full two-minute walkthrough, ending on requirement-to-visual traceability. | 
[30] due:2026-09-11 | Your root-cause story. Symptom, trace, calculation, configuration, cause, fix — in 90 seconds. | 
[30] due:2026-09-12 | All six STAR stories, back to back. Time each one; anything over two minutes gets cut. | 
[30] due:2026-09-12 | What is a star schema, and why does it matter commercially? Answer the "commercially" part properly. | 
[30] due:2026-09-13 | What does CALCULATE do in DAX? One sentence, in the words you'd use with a manager. | 
[30] due:2026-09-13 | A report's totals have doubled overnight. Walk through your first three checks, in order. | 
```
