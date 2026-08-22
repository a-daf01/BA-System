# Progress Log

**This is the only file you write to daily. It should take 10 seconds.**

## Format

One line per day. Copy the template, fill it, done.

```
D01 | 2026-08-01 | desk:Y phone:Y | conf:3 | note:
```

- `desk:` / `phone:` — `Y` done, `N` not done, `P` partial
- `conf:` — 1 to 5, how well today's material stuck. **Be honest.** This is the number Claude Code uses to reschedule your review queue. Flattering yourself here breaks the system.
  - 1 = didn't understand it
  - 2 = followed along but couldn't redo it alone
  - 3 = could redo it with a reference open
  - 4 = could redo it from memory
  - 5 = could teach it
- `note:` — optional. Leave blank most days. Use it when something genuinely didn't work.

**If you miss a day, log the miss.** `D09 | 2026-08-09 | desk:N phone:N | conf:- | note: didn't happen`. The system adapts to honest data and breaks on gaps.

## Doing a day late

Missed days don't vanish. Open the dashboard, tap the back arrow until you reach the day, and do it. The line then carries a `done:` field — the date you actually did it:

```
D02 | 2026-08-04 | desk:Y phone:Y | conf:3 | done:2026-08-06 | note:
```

Second column is when it was **scheduled**. `done:` is when it **happened**. The field only appears when those differ, so a day done on the day looks exactly as it always did.

This matters because the weekly review reads it. A day with `done:` set counts as **backfilled, not missed** — it does not trigger the "week was too heavy, cut next week" rule. What it does do is tell you how far your learning is drifting from the review schedule, and `node scripts/catch-up.js --reflow` moves that day's review items so they follow the work instead of a date on which nothing happened.

**If you're not going to do it, write it off.** A written-off day stops appearing in the catch-up list. That is the point: either it gets done or it gets closed, and nothing sits in limbo.

**But the dashboard cannot write to this file.** Tapping *Write it off* records it on that device only, and the header then shows **"N unsynced"** — that counter is the whole warning. It is not written off until the line lands here. Three ways, any one of them is enough:

- Tap **Copy log line** (or **Copy all unsynced**) and paste it into the block below.
- Run `node scripts/catch-up.js --log-misses`, which writes every elapsed unlogged day as a miss.
- Tell Claude Code, which is the one that costs you nothing.

This is not a detail. Days 4 and 5 were written off on the phone on 16 August and were still listed as open — and still firing review items — until 17 August, because the tap never reached this file.

---

## Log

```
D01 | 2026-08-12 | desk:Y phone:Y | conf:4 | note: baseline test - got 1,2,3 unaided; looked up 4 (HAVING) and 5 (revenue). Self-corrected TOP->LIMIT and SUM. Power Query remove-errors not understood.
D02 | 2026-08-13 | desk:Y phone:Y | conf:4 | note: 13/15 queries correct. Q13 conditional aggregation failed - looked up CASE/SUM. Q4 and Q15 dropped a stated condition. Q9 BETWEEN silently lost the last day (350 vs 357). Everything unnoted was recalled from courses ~a year old.
D03 | 2026-08-14 | desk:Y phone:Y | conf:5 | note: joins done, called it easy. INNER+IS NULL returned the right answer via a query that could not have produced it. Fan-out answer wrong - described LEFT JOIN behaviour, not row multiplication. Flagged system friction; system rebuilt same day.
D04 | 2026-08-15 | desk:N phone:N | conf: | note: written off 17 Aug. CV step 3 was covered by the 15 Aug career-profile rewrite; the three SQL exercises (lapsed-customer, fan-out on 10273, the 93/92 defect) were not done. Fan-out and the lapsed-customer query stay live in the queue - both were met on D03. The 93/92 defect is held, never seen.
D05 | 2026-08-16 | desk:- phone:N | conf: | note: written off 17 Aug. Sunday consolidation, phone only. The week-1 boss fight moved into D07's phone block; the rest is absorbed by the D07 checkpoint.
D06 | 2026-08-17 | desk:Y phone:Y | conf:4 | note: SQL aggregation. Done on the day, logged 20 Aug because the dashboard cannot write to the repo and the tap never reached this file.
D07 | 2026-08-18 | desk:N phone:N | conf: | note: written off 20 Aug. CV finish + agency outreach not done. The outreach half is the part that produces interviews - parked, not lost.
D08 | 2026-08-19 | desk:Y phone:Y | conf:5 | done:2026-08-20 | note: subqueries and CTEs, done in full one day late. Self-scored 5 - "i dont think i have ever been this confident with SQL ever".
D09 | 2026-08-20 | desk:P phone:N | conf: | done:2026-08-21 | note: window functions, backfilled 21 Aug. Both desk exercises attempted with 14 notes; ROW_NUMBER/RANK/DENSE_RANK explained correctly unaided. Running total and moving average both looked up. Phone block not done. UNSCORED - he was not asked, and a number nobody gave is not evidence.
D10 | 2026-08-21 | desk:N phone:N | conf: | note: written off 22 Aug. Relational foundations - keys, normalisation, the 93/92 defect. Its material is carried into D11, which cannot be done without it.
D11 | | desk: phone: | conf: | note:
D12 | | desk:- phone: | conf: | note:
D13 | | desk: phone: | conf: | note:
D14 | | desk: phone: | conf: | note:
D15 | | desk: phone: | conf: | note:
D16 | | desk: phone: | conf: | note:
D17 | | desk: phone: | conf: | note:
D18 | | desk: phone: | conf: | note:
D19 | | desk:- phone: | conf: | note:
D20 | | desk: phone: | conf: | note:
D21 | | desk: phone: | conf: | note:
D22 | | desk: phone: | conf: | note:
D23 | | desk: phone: | conf: | note:
D24 | | desk: phone: | conf: | note:
D25 | | desk: phone: | conf: | note:
D26 | | desk:- phone: | conf: | note:
D27 | | desk: phone: | conf: | note:
D28 | | desk: phone: | conf: | note:
```

---

## Parking lot

Tangents that tried to eat a session. Write it here, move on. Claude Code will schedule one as a Sunday deep-dive if this list hits 3+.

- ~~**Full friction audit of Days 5–28**~~ (raised Day 3) — **closed 2026-08-17.** Mostly done by `reference/dataset-profile.md` on 15 Aug, which audited the whole database and invalidated the exercises it could not support. What remained is now mechanical: `node scripts/check.js` fails on a vague task, a day over budget, a missing workspace file, a review day over the cap, and a queue item with no card. It does not need a session of its own.
  - *(The slot it was booked into never existed. It said "Day 7 (Sunday)", but Day 7 is a Tuesday — the Sunday was Day 5, which was written off.)*
- **D07's agency outreach never happened** (written off 20 Aug) — the CV half was already covered by the 15 Aug career-profile rewrite, but contacting Circle, Harnham, Robert Half, Bristow Holland and Hays was not. This is the only block in month 1 that produces interviews, and the pipeline is at 0 of 15. Needs a slot, not a rewrite. The self-introduction it fed is already a permanent queue item, so the recall side is covered.

---

## Things I couldn't defend in an interview

When you hit something you've "learned" but couldn't explain out loud, it goes here. This list is the highest-value input to your review queue.

- 
