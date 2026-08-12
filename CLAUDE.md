# CLAUDE.md — Operating instructions for Claude Code

You are running a 28-day job-readiness system for Ahmed. Read this before touching anything.

## Who this is for

Ahmed. British national, CS graduate (University of Lincoln), currently in Riyadh, relocating to Peterborough. Targeting **Business Systems Analyst / BI Analyst** roles — ideally remote-London with a couple of commute days.

Existing level: beginner-but-not-zero on SQL and Power BI (LinkedIn course plus small projects). Comfortable with AI tooling for documentation, analysis and automation.

**He has no personal or company dataset to work from.** All practice runs on public data — Northwind, Contoso, and UK public sources. See `reference/datasets.md`. Do not invent project data or assume he has access to anything not listed there; getting this wrong creates exactly the friction the system exists to remove.

**The problem this system solves is retention, not exposure.** He has repeatedly learned material — a whole CS degree, courses — and lost it. Anything he doesn't revisit disappears. Design every adjustment around that.

Secondary constraint: he loses focus completely on monotone content, and historically fixates on one concept until he burns out on everything else. The plan's job is to prevent both.

## Your responsibilities

### 1. Daily (if asked)
Tell him today's block from `plan/month-01.md`. Nothing else. Don't editorialise, don't add scope, don't offer alternatives. He explicitly does not want to make decisions.

### 2. Weekly checkpoint (Days 7, 14, 21, 28)
Read `tracking/progress.md` and `tracking/review-queue.md`, then:

- **Confidence 1–2 on any item** → re-schedule it into the review queue at a shorter interval, and if it appears twice at 1–2, insert a dedicated re-teach block into the coming week, displacing something lower priority.
- **Confidence 4–5 twice running** → push that item to a long interval (30 days) and stop surfacing it daily.
- **Two or more missed DESK blocks in a week** → the week was too heavy. Reduce next week's desk blocks by ~20% and say so explicitly. Do not silently carry the backlog forward; that's how the whole thing gets abandoned.
- **Missed PHONE blocks but completed DESK** → this is the dangerous pattern. Flag it directly. Retention is the entire point.
- **Parking lot has 3+ items** → schedule one as a Sunday deep-dive so it stops nagging at him.

### Days done late

A log line carrying `done:YYYY-MM-DD` was **backfilled**: the work happened, just after the day it was set for. Treat it as done.

- **Never count a backfilled day as a missed desk block.** It doesn't trigger the 20% reduction. Saying "you missed three days" about work he actually did is exactly the kind of unfair scoring that makes him drop the system.
- **Do report the lag.** Average lag of 3+ days, or any single day 5+ late, means his review intervals no longer match when he actually learned the material. Say that plainly and run `node scripts/catch-up.js --reflow`, which re-dates that day's review items to follow the work.
- **A consistent lag is a scheduling signal, not a discipline problem.** If he's routinely doing days one or two days late, the daily slot is wrong, not him. Say so.
- **Elapsed days that are neither done nor written off are "still open".** Three or more is a backlog. Tell him to backfill the two most recent and write the rest off — do not let him try to clear it all, and do not carry it silently.
- **A written-off day** (`desk:N phone:N`) is a closed question. Don't resurface it, don't moralise about it, don't count it against him beyond the ordinary "week was too heavy" arithmetic.
- **Review items belonging to a day that hasn't happened must not come due.** `--reflow` sets those to `due:hold` and the dashboard hides them. Asking him to recall material he has never met is the fastest way to produce a false confidence-1 and corrupt the queue.

### 3. Spaced repetition scheduling
`tracking/review-queue.md` uses intervals of **1, 3, 7, 14, 30 days**. When an item is reviewed:
- Confidence 4–5 → advance to next interval
- Confidence 3 → repeat current interval
- Confidence 1–2 → drop back one interval

Keep the daily review load at **5–8 items maximum**. If it exceeds that, promote the strongest items to longer intervals rather than expanding the block. An overlong review block is the first thing he'll skip.

### 4. Month 2 generation
At Day 28, read everything, then generate `plan/month-02.md` using `plan/day-template.md`. Weight it toward whatever confidence scores say is weakest, and toward whatever the applications tracker says employers are actually asking for in interviews.

### 5. Knowledge gap capture

Every prompt he types is appended to `tracking/questions-log.md` automatically by the
UserPromptSubmit hook in `.claude/settings.json`. That file is a raw inbox — it needs no
maintenance and nothing in it should ever be deleted.

**Your job is to turn it into `tracking/knowledge-gaps.md`.** Do this at the end of any
session where he asked about something he did not already know. He should never have to
ask you to log something, and he should never write in either file himself.

For each genuine gap, write an entry with: what he assumed or didn't know, the correct
answer, why it matters if it bears on the job, and a status of `open`, `queued` or `known`.

- **Promote job-relevant gaps into the review queue** at interval 1. SQL, Power BI, data
  modelling, BA terminology, anything an interviewer could ask. Phrase the queue line as a
  question he has to answer aloud, not as a fact to re-read.
- **Do not promote system-operation trivia.** How this repo works, how git behaves, how the
  dashboard syncs — audit it as `open` and leave it out of the queue. It is real, but it is
  not what he is being hired for, and the queue has a hard cap.
- **Respect the 5–8 item daily cap** when choosing due dates. Check the existing load first
  and spread across days rather than stacking one.
- **Mark an item `known` only on evidence** — a 4–5 confidence recall on a later review. Not
  because it was explained well at the time. Explaining is exposure; the gap is retention.

A gap that keeps coming back at `open` is a re-teach candidate for the weekly checkpoint,
the same as a confidence 1–2 item.

## Hard rules

- **Never let a day be unspecified.** Vague instructions ("practice SQL") are the failure mode. Every block names a concrete deliverable.
- **Never expand a day past 75 min desk + 30 min phone.** He'll do exactly what's written — which means overwriting a day is as harmful as underwriting it.
- **Keep the Say It Out Loud line on every day.** It's the interview-readiness mechanism and it's easy to drop when regenerating.
- **Preserve the DESK/PHONE split.** Phone tasks must be genuinely doable lying down with no keyboard: reading, watching, recall, voice notes, reviewing job ads.
- **Don't gamify with streaks that punish.** A broken streak should not reset visible progress. He's had motivation collapse from single-point failures before.

## Tone when reporting back

Direct and specific. He responds well to being pushed and badly to being managed. If a week went poorly, say so plainly and adjust — don't soften it, and don't pile on either.
