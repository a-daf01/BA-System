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

**If you're not going to do it, write it off.** Tap *Write it off* on that day in the dashboard, or run `node scripts/catch-up.js --log-misses`. A written-off day stops appearing in the catch-up list. That is the point: either it gets done or it gets closed, and nothing sits in limbo.

---

## Log

```
D01 | | desk: phone: | conf: | note:
D02 | | desk: phone: | conf: | note:
D03 | | desk: phone: | conf: | note:
D04 | | desk: phone: | conf: | note:
D05 | | desk: phone: | conf: | note:
D06 | | desk: phone: | conf: | note:
D07 | | desk:- phone: | conf: | note:
D08 | | desk: phone: | conf: | note:
D09 | | desk: phone: | conf: | note:
D10 | | desk: phone: | conf: | note:
D11 | | desk: phone: | conf: | note:
D12 | | desk: phone: | conf: | note:
D13 | | desk: phone: | conf: | note:
D14 | | desk:- phone: | conf: | note:
D15 | | desk: phone: | conf: | note:
D16 | | desk: phone: | conf: | note:
D17 | | desk: phone: | conf: | note:
D18 | | desk: phone: | conf: | note:
D19 | | desk: phone: | conf: | note:
D20 | | desk: phone: | conf: | note:
D21 | | desk:- phone: | conf: | note:
D22 | | desk: phone: | conf: | note:
D23 | | desk: phone: | conf: | note:
D24 | | desk: phone: | conf: | note:
D25 | | desk: phone: | conf: | note:
D26 | | desk: phone: | conf: | note:
D27 | | desk: phone: | conf: | note:
D28 | | desk:- phone: | conf: | note:
```

---

## Parking lot

Tangents that tried to eat a session. Write it here, move on. Claude Code will schedule one as a Sunday deep-dive if this list hits 3+.

- 

---

## Things I couldn't defend in an interview

When you hit something you've "learned" but couldn't explain out loud, it goes here. This list is the highest-value input to your review queue.

- 
