# Config

Set this once. Everything else derives from it: the dashboard, every script, every due date.

```
START_DATE: 2026-08-03
```

`START_DATE` is the calendar date of **Day 1**. Format `YYYY-MM-DD`.

---

## What happens if START_DATE is not a Monday

`plan/month-01.md` puts the phone-only consolidation blocks on Days 7, 14, 21 and 28
because it assumes a Monday start. If you start on any other weekday, those blocks
would land mid-week, which defeats the point of them.

So the system reassigns instead of leaving them stranded:

- Day numbers always follow the calendar. Day 1 is `START_DATE`, Day 28 is 27 days later.
  This is what you log in `tracking/progress.md`, and it never changes.
- Any 28-day run contains exactly four Sundays. The four consolidation blocks are
  assigned to those four Sundays, in order.
- The 24 regular blocks fill the remaining 24 days, in order.

Start on a Monday and the mapping is one to one: Day 7 gets block 7, Day 14 gets
block 14, and so on. Start on any other day and the dashboard tells you which plan
block today is using, so there is nothing to work out.

---

## Changing it later

If you restart, change `START_DATE` and re-run:

```
node scripts/seed-queue.js
```

That rebuilds every due date in `tracking/review-queue.md` from the new anchor.
