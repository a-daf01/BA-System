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
[1] due:2026-08-05 | NULL handling | 
[1] due:2026-08-05 | LIKE vs = | 
[1] due:2026-08-05 | filter logic as an error source | 
[1] due:2026-08-06 | INNER vs LEFT | 
[1] due:2026-08-06 | row fan-out | 
[1] due:2026-08-06 | join direction | 
[1] due:2026-08-07 | your 3 strongest CV bullets | 
[1] due:2026-08-08 | WHERE vs HAVING | 
[1] due:2026-08-08 | GROUP BY with multiple columns | 
[1] due:2026-08-11 | CTE syntax | 
[1] due:2026-08-11 | subquery vs CTE tradeoff | 
[1] due:2026-08-12 | PARTITION BY | 
[1] due:2026-08-12 | top-N-per-group pattern | 
[1] due:2026-08-12 | LAG/LEAD | 
[1] due:2026-08-13 | PK/FK | 
[1] due:2026-08-13 | cardinality | 
[1] due:2026-08-13 | 3NF | 
[1] due:2026-08-13 | normalise vs denormalise tradeoff | 
[1] due:2026-08-14 | fact vs dimension | 
[1] due:2026-08-14 | star vs snowflake | 
[1] due:2026-08-14 | reference vs transactional data | 
[1] due:2026-08-14 | data mart | 
[1] due:2026-08-15 | unpivot | 
[1] due:2026-08-15 | applied steps | 
[1] due:2026-08-15 | type changes as an error source | 
[1] due:2026-08-16 | cardinality in Power BI | 
[1] due:2026-08-16 | filter direction | 
[1] due:2026-08-16 | date dimension | 
[1] due:2026-08-18 | measure vs calculated column | 
[1] due:2026-08-18 | DIVIDE vs / | 
[1] due:2026-08-18 | filter context (intro) | 
[1] due:2026-08-19 | ALL vs ALLEXCEPT | 
[1] due:2026-08-19 | % of total pattern | 
[1] due:2026-08-19 | filter context (deep) | 
[1] due:2026-08-20 | YTD/QTD/MTD | 
[1] due:2026-08-20 | SAMEPERIODLASTYEAR | 
[1] due:2026-08-20 | marked date table | 
[1] due:2026-08-21 | your portfolio 1 business question | 
[1] due:2026-08-23 | portfolio 1 two-minute walkthrough | 
[1] due:2026-08-25 | BRD vs FRD vs SRS | 
[1] due:2026-08-25 | functional vs non-functional | 
[1] due:2026-08-26 | user story format | 
[1] due:2026-08-26 | Given/When/Then | 
[1] due:2026-08-26 | UAT pass/fail criteria | 
[1] due:2026-08-27 | as-is/to-be | 
[1] due:2026-08-27 | gap analysis | 
[1] due:2026-08-27 | your root-cause story | 
[1] due:2026-08-29 | portfolio 2 walkthrough | 
[1] due:2026-08-30 | the 8 technical answers | 
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
