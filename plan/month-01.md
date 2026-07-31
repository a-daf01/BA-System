# Month 01 — Days 1 to 28

**Goal by Day 28:** two portfolio artifacts live, CV rewritten in analyst language, 15+ applications submitted, agency relationships open, and the ability to talk fluently about SQL, data modelling and BI in business terms.

**Every day:** DESK block (60–75 min) + PHONE block (20–30 min) + one Say It Out Loud + one line in `tracking/progress.md`.

**Sundays (Days 7, 14, 21, 28) are phone-only consolidation days.** Deliberate. You said you'd do exactly what's written and no more — so recovery is written in.

**Datasets: see `reference/datasets.md`.** All free and public. Northwind for SQL fundamentals, Contoso for star schemas and Power BI, UK public data for portfolio pieces. Download them on Day 1 and never think about sourcing data again.

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
- [ ] 40 min — 15 queries escalating: single filter → multiple conditions → IN / BETWEEN / LIKE → NULL handling → multi-column sorting.
- [ ] 20 min — Rewrite 3 of them as **business questions**, e.g. "which customers ordered in the last 30 days but not the 30 before?"

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 1. Read, cover, say aloud.

**Say It Out Loud:** "A WHERE clause is where most reporting errors hide — wrong filter logic makes every number downstream wrong, and it still looks fine."

**Adds to review queue:** NULL handling · LIKE vs = · filter logic as an error source

---

## Day 3 — SQL: JOINs
**Theme:** The single most important SQL skill for a BSA. *Dataset: Northwind.*

**DESK (75 min)**
- [ ] 40 min — INNER vs LEFT on Customers → Orders. Find customers with no orders. Prove the difference with row counts.
- [ ] 20 min — Three-table join: Orders → OrderDetails → Products. Break one deliberately and observe.
- [ ] 15 min — Write in plain English: when does a LEFT JOIN silently inflate row counts, and how would you detect it?

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one joins video. Close it, re-explain aloud without replaying.

**Say It Out Loud:** "If a report's totals suddenly doubled, my first check is whether a join is fanning out rows against a one-to-many relationship."

**Adds to review queue:** INNER vs LEFT · row fan-out · join direction

---

## Day 4 — CV rewrite, part 1
**Theme:** You currently read as a builder. You need to read as an analyst.

**DESK (70 min)**
- [ ] 25 min — List every piece of work you've done, paid or unpaid. Raw list, no editing, no judgement about whether it "counts".
- [ ] 45 min — Rewrite each in **analyst language**, using vocabulary from the ads you read on Day 1. Every bullet: what the business problem was → what you did → what changed.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Read 3 more BI Analyst ads. Steal phrasing.

**Say It Out Loud:** "Most of what I've built was requirements analysis, data structuring and reporting — I just wasn't using those words for it."

**Adds to review queue:** your 3 strongest CV bullets

---

## Day 5 — SQL: aggregation
*Dataset: Northwind.*

**DESK (65 min)**
- [ ] 35 min — COUNT / SUM / AVG / MIN / MAX with GROUP BY. Ten queries, three with multiple grouping columns.
- [ ] 15 min — HAVING vs WHERE. One query needing both; explain in writing why each clause sits where it does.
- [ ] 15 min — Single query: "which product categories generate the most revenue, and which have the highest average order value?"

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 1, second pass. Cover and recall.

**Say It Out Loud:** "WHERE filters rows before grouping; HAVING filters groups after. Getting that backwards is one of the most common reporting bugs."

**Adds to review queue:** WHERE vs HAVING · GROUP BY with multiple columns

---

## Day 6 — CV finish + agency outreach
**Theme:** Pipeline goes live today. Nothing is ready. Do it anyway.

**DESK (75 min)**
- [ ] 30 min — Finish the CV. One page ideally, two maximum.
- [ ] 20 min — Rewrite LinkedIn headline and About to match.
- [ ] 25 min — Write **one** recruiter outreach message. Send to five: Circle Recruitment, Harnham, Robert Half, Bristow Holland, Hays. Log in `tracking/applications.md`.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Job alerts on Reed, CWJobs, Indeed, LinkedIn. All three geographies.

**Say It Out Loud:** "I'm a CS graduate with hands-on SQL and Power BI moving into business systems analysis, looking in Peterborough, Cambridge and remote-London."

**Adds to review queue:** your 30-second self-introduction

**Why now:** recruiters work on month-long horizons. Contact them week 1, they're warm by week 4. Waiting until you feel ready costs a month.

---

## Day 7 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep, all of week 1.
- [ ] 10 min — Read your CV aloud. Anything you couldn't defend goes in progress notes.
- [ ] 10 min — Read 5 new job ads. Add unfamiliar terms to the glossary.

**Say It Out Loud:** 60-second summary of week 1, as if answering "so what have you been working on?"

**Weekly checkpoint:** Claude Code reviews `tracking/progress.md` and adjusts week 2.

---

# WEEK 2 — SQL depth, data modelling, Power BI foundations

## Day 8 — SQL: subqueries and CTEs
*Dataset: Northwind.*

**DESK (70 min)**
- [ ] 30 min — Subqueries in WHERE and SELECT. Five each.
- [ ] 30 min — Rewrite three as CTEs (`WITH ... AS`). Note which you'd rather debug in six months.
- [ ] 10 min — One paragraph: when do you choose a CTE over a subquery?

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 2.

**Say It Out Loud:** "I use CTEs over nested subqueries because readable SQL is maintainable SQL, and reporting logic always gets handed over eventually."

**Adds to review queue:** CTE syntax · subquery vs CTE tradeoff

---

## Day 9 — SQL: window functions
**Theme:** What separates "can query" from "can analyse." *Dataset: Northwind.*

**DESK (75 min)**
- [ ] 30 min — ROW_NUMBER, RANK, DENSE_RANK. Build "top 3 products per category" — the classic interview question.
- [ ] 30 min — Running totals and moving averages: `SUM() OVER (PARTITION BY ... ORDER BY ...)`.
- [ ] 15 min — LAG / LEAD. Month-on-month change on order volume.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one window functions video. Re-explain aloud after.

**Say It Out Loud:** "Window functions let me calculate rankings and running totals without collapsing my rows — exactly what management reporting needs."

**Adds to review queue:** PARTITION BY · top-N-per-group pattern · LAG/LEAD

---

## Day 10 — Data modelling: relational foundations
**Theme:** Named explicitly in senior BSA ads. *Dataset: Northwind.*

**DESK (65 min)**
- [ ] 25 min — PKs, FKs, cardinality. Draw Northwind's full schema on paper from the database itself — don't look up a diagram.
- [ ] 25 min — Normalisation to 3NF. Explain in writing why Orders and OrderDetails are split. Then flatten them into one table and list what breaks.
- [ ] 15 min — Two costs of over-normalising for reporting.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary Tier 3.

**Say It Out Loud:** "Normalisation protects integrity on the transactional side, but reporting usually wants denormalised structures — knowing which side you're on is the job."

**Adds to review queue:** PK/FK · cardinality · 3NF · normalise vs denormalise tradeoff

---

## Day 11 — Data modelling: dimensional
**Theme:** Star schema, reference vs transactional, data marts. All named in real BSA ads. *Dataset: Contoso — switch today, it's purpose-built for this.*

**DESK (70 min)**
- [ ] 25 min — Load Contoso. Identify fact tables and dimension tables. Why is each what it is?
- [ ] 25 min — Compare Contoso to Northwind. One is built for transactions, one for reporting. Write down five concrete differences.
- [ ] 20 min — Classify Contoso's tables as reference vs transactional. Then define "reporting data mart" in a paragraph, as you'd explain it to a non-technical manager.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Re-read the BSA requirements in `reference/target-roles.md`. Count how much of today's vocabulary appears.

**Say It Out Loud:** "A star schema keeps measures in a fact table and descriptive attributes in dimensions, so the model stays fast and the business can slice it themselves."

**Adds to review queue:** fact vs dimension · star vs snowflake · reference vs transactional data · data mart

---

## Day 12 — Power BI: Power Query
**Theme:** Where 80% of real Power BI work happens. *Dataset: a messy UK public CSV.*

**DESK (75 min)**
- [ ] 20 min — Download a genuinely messy dataset from data.gov.uk or ONS. Government CSVs are structurally awful, and that's the point.
- [ ] 40 min — Clean it in Power Query: remove columns, change types, split columns, replace values, remove duplicates, unpivot. Each transformation at least once.
- [ ] 15 min — Open Applied Steps. Rename every step meaningfully.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Watch one Power Query video.

**Say It Out Loud:** "Power Query is where I control data quality before it reaches the model — and naming the applied steps means someone else can audit what I did."

**Adds to review queue:** unpivot · applied steps · type changes as an error source

---

## Day 13 — Power BI: the data model
*Dataset: Contoso.*

**DESK (70 min)**
- [ ] 30 min — Build Contoso's star schema properly in Model view.
- [ ] 25 min — Cardinality and filter direction. Set one wrong on purpose. Watch a visual produce nonsense. Fix it.
- [ ] 15 min — Build a date dimension and mark it as a date table.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary sweep: everything from week 2.

**Say It Out Loud:** "Most broken Power BI reports aren't broken visuals — they're broken relationships in the model underneath."

**Adds to review queue:** cardinality in Power BI · filter direction · date dimension

---

## Day 14 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep.
- [ ] 10 min — Say aloud, no notes: fact vs dimension table, and why it matters commercially.
- [ ] 10 min — Check applications. Recruiter replies get answered today.

**Say It Out Loud:** 90-second summary of weeks 1–2, as an interview answer.

**Weekly checkpoint:** Claude Code adjusts week 3.

---

# WEEK 3 — DAX, dashboards, portfolio artifact 1

## Day 15 — DAX: measures vs calculated columns
*Dataset: Contoso.*

**DESK (70 min)**
- [ ] 25 min — Five measures and five calculated columns on the same data. Observe where each is evaluated.
- [ ] 30 min — SUM, AVERAGE, COUNTROWS, DISTINCTCOUNT, DIVIDE. Use DIVIDE instead of `/` and find out why.
- [ ] 15 min — The rule for measure vs column, in your own words.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Watch one DAX fundamentals video.

**Say It Out Loud:** "Calculated columns compute once at refresh and sit in memory; measures compute at query time in filter context. The wrong choice gives you a slow report or a wrong one."

**Adds to review queue:** measure vs calculated column · DIVIDE vs / · filter context (intro)

---

## Day 16 — DAX: CALCULATE and filter context
**Theme:** The hardest concept in Power BI. Expect discomfort. *Dataset: Contoso.*

**DESK (75 min)**
- [ ] 35 min — CALCULATE with simple filter arguments. Ten variations.
- [ ] 25 min — ALL, ALLEXCEPT, FILTER. Build a "% of total" measure.
- [ ] 15 min — Explain filter context in writing, under 100 words, no jargon.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Second pass on filter context, different source. This one genuinely needs two.

**Say It Out Loud:** "CALCULATE modifies the filter context a measure evaluates in. That's the whole idea — everything else in DAX is a variation on it."

**Adds to review queue:** CALCULATE · ALL vs ALLEXCEPT · % of total pattern · filter context (deep)

---

## Day 17 — DAX: time intelligence
*Dataset: Contoso.*

**DESK (70 min)**
- [ ] 30 min — YTD, QTD, MTD against your date dimension.
- [ ] 25 min — SAMEPERIODLASTYEAR. Build a year-on-year variance measure.
- [ ] 15 min — Unmark your date table and watch time intelligence fail. Understand exactly why.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: reporting and KPI terms.

**Say It Out Loud:** "Time intelligence only works against a properly marked date dimension — that's the first thing I check when year-on-year numbers look wrong."

**Adds to review queue:** YTD/QTD/MTD · SAMEPERIODLASTYEAR · marked date table

---

## Day 18 — Portfolio 1: scope and model
**Theme:** Build something real on UK public data. This becomes what you talk about in every interview.

*Pick one domain from `reference/datasets.md` and commit. NHS or local government data is strongest — you're targeting NHS and Civil Service employers, and a UK hiring manager recognises the source immediately.*

**DESK (75 min)**
- [ ] 20 min — **Define the business question first.** One sentence. Not "a dashboard about NHS data" — something like "which trusts show the widest gap between referral volume and treatment capacity, and is it widening?"
- [ ] 20 min — Download and clean in Power Query.
- [ ] 35 min — Build the model: star schema, relationships, date dimension.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Look at 3 well-made public Power BI dashboards for layout ideas.

**Say It Out Loud:** Your business question. More than one sentence means it isn't sharp enough yet.

**Adds to review queue:** your portfolio 1 business question

---

## Day 19 — Portfolio 1: measures and visuals
**DESK (75 min)**
- [ ] 30 min — The 6–8 measures that answer your question. No more. Restraint is the skill being demonstrated.
- [ ] 35 min — Build the dashboard. One page: headline number, trend, breakdown, detail.
- [ ] 10 min — Remove one visual. There's always one not earning its place.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Read 3 ads focusing only on how they describe dashboard work. Steal the phrasing for tomorrow.

**Say It Out Loud:** "The dashboard answers one question well rather than twenty badly."

---

## Day 20 — Portfolio 1: the write-up
**Theme:** The artifact isn't the dashboard. It's the dashboard *plus* your explanation.

**DESK (70 min)**
- [ ] 35 min — One-page case study in `reference/portfolio.md`: business problem, approach, data model decisions and *why*, findings, what you'd do next.
- [ ] 20 min — Screenshot dashboard and model view.
- [ ] 15 min — Add to CV and LinkedIn as a named project.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Practise the 2-minute version aloud. Twice.

**Say It Out Loud:** The full 2-minute walkthrough. This is an interview answer — treat it as one.

**Adds to review queue:** portfolio 1 two-minute walkthrough

---

## Day 21 — SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (35 min)**
- [ ] 15 min — Full review queue sweep.
- [ ] 10 min — Walk through portfolio 1 aloud, no notes.
- [ ] 10 min — Applications check. Target 8+ submitted. If short, week 4 front-loads applications.

**Weekly checkpoint:** Claude Code adjusts week 4.

---

# WEEK 4 — BA artifacts, second portfolio piece, interview readiness

## Day 22 — Requirements documentation
**Theme:** BRD is the most-named artifact across every job ad collected.

*Scenario: you're the BSA for the organisation behind your portfolio 1 dataset. They want a new recurring report built on it.*

**DESK (70 min)**
- [ ] 25 min — BRD vs FRD vs SRS. What goes in each, who reads each.
- [ ] 30 min — Write a real one-page BRD for that requirement: business objective, scope, stakeholders, requirements, success criteria, assumptions.
- [ ] 15 min — Functional vs non-functional. Add three NFRs (refresh frequency, access control, performance).

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: requirements terminology, full sweep.

**Say It Out Loud:** "A BRD states what the business needs and why; an FRD states what the system must do to deliver it. Conflating them is where scope creep starts."

**Adds to review queue:** BRD vs FRD vs SRS · functional vs non-functional

---

## Day 23 — User stories, acceptance criteria, UAT
*Same scenario.*

**DESK (70 min)**
- [ ] 25 min — Six user stories, "As a… I want… so that…"
- [ ] 25 min — Acceptance criteria for each, Given/When/Then.
- [ ] 20 min — A UAT scenario set with explicit pass/fail criteria.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Glossary: agile and delivery terms.

**Say It Out Loud:** "Acceptance criteria are what make a story testable — without them, 'done' is an opinion."

**Adds to review queue:** user story format · Given/When/Then · UAT pass/fail criteria

---

## Day 24 — As-is / to-be and root cause
**Theme:** Root-cause investigation is your natural strength and it's named directly in BSA ads. Make it articulable.

**DESK (70 min)**
- [ ] 25 min — Map the as-is: how would your portfolio 1 report be produced manually today? Don't fix it. Capture reality.
- [ ] 25 min — Map the to-be with your dashboard in place. Name every gap.
- [ ] 20 min — Take a real discrepancy from your portfolio work — a total that didn't match, a row count that surprised you — and write it up formally: symptom → data trace → calculation logic → model config → root cause → fix.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — Re-read the BSA ads. Every phrase about tracing discrepancies is answered by what you just wrote.

**Say It Out Loud:** "When a report is wrong I trace it back through the data, the calculation logic and the system configuration until I find where it actually diverges. I don't patch the symptom."

**Adds to review queue:** as-is/to-be · gap analysis · your root-cause story

---

## Day 25 — Portfolio 2: build
**Theme:** End-to-end BSA piece — requirement through to reporting. The differentiator.

*Different dataset and domain from portfolio 1. Deliberately.*

**DESK (75 min)**
- [ ] 20 min — Pick the dataset. Write the business question.
- [ ] 25 min — Write the mini-BRD.
- [ ] 30 min — Build the SQL layer.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Applications. Submit two more.

**Say It Out Loud:** "This one shows the full path — requirement, data model, query, report — because that's what a Business Systems Analyst actually does."

---

## Day 26 — Portfolio 2: finish and document
**DESK (75 min)**
- [ ] 35 min — Build the Power BI layer on the SQL.
- [ ] 30 min — Write up in `reference/portfolio.md`, emphasising the requirements-to-reporting path.
- [ ] 10 min — Add to CV and LinkedIn.

**PHONE (20 min)**
- [ ] 10 min — Review queue.
- [ ] 10 min — Practise the 2-minute walkthrough aloud.

**Adds to review queue:** portfolio 2 walkthrough

---

## Day 27 — Interview readiness
**DESK (75 min)**
- [ ] 30 min — Six STAR stories: a data problem solved, a root cause found, translating between technical and non-technical people, a time you were wrong, a time you prioritised, a time you automated something.
- [ ] 25 min — The 8 standard technical answers: INNER vs LEFT JOIN · WHERE vs HAVING · what's a star schema · measure vs calculated column · what does CALCULATE do · how would you investigate a report showing wrong numbers · what's an NFR · how do you prioritise competing requirements.
- [ ] 20 min — Five questions to ask *them*, specific to their data stack and reporting maturity.

**PHONE (25 min)**
- [ ] 10 min — Review queue.
- [ ] 15 min — All 6 STAR stories aloud. Time them. Each under 2 minutes.

**Say It Out Loud:** All six. No notes.

**Adds to review queue:** all 6 STAR stories · the 8 technical answers

---

## Day 28 — SUNDAY: month review (phone only)
**No desk block.**

**PHONE (40 min)**
- [ ] 15 min — Full review queue sweep.
- [ ] 10 min — Mock interview in your other Claude chat. Use `prompts/tutor-prompt.md`.
- [ ] 15 min — Read `tracking/progress.md` from Day 1. Honest month summary: what stuck, what didn't, what you avoided.

**Month checkpoint:** Claude Code generates `plan/month-02.md`, weighted toward weakest confidence scores and whatever interviews revealed.

**Targets:**
- [ ] 15+ applications submitted
- [ ] 5+ agency conversations open
- [ ] 2 portfolio artifacts documented
- [ ] CV and LinkedIn rewritten in analyst language
- [ ] Can explain star schema, filter context and a root-cause investigation aloud, no notes
