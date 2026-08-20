# Review Log

**Every review you have ever graded, with the date and the score you gave it.**

You do not write in this file. The dashboard collects grades on your phone, the
export button hands you the lines, and `node scripts/sync-progress.js` writes them
here and reschedules `tracking/review-queue.md` from them.

## Why this file exists

Until 20 August, ticking a review item on the dashboard stored nothing that survived
the day. The tick was a scroll position — it never reached a file, so it never moved
a due date, and an item you recalled perfectly stayed overdue forever.

That is fixed. A graded review is now a permanent record, and this is where it lives.

## What it is for

- **Idempotency.** A line already in here is never applied twice, so you can re-paste
  the same export as many times as you like without double-advancing an item.
- **Evidence.** The weekly checkpoint marks a gap `known` only on evidence of recall.
  This file is that evidence — the actual score, on the actual date.
- **Honest history.** `tracking/review-queue.md` keeps only the last two scores per
  item, because that is all the scheduler needs. This keeps all of them.

## Format

```
2026-08-19 | 4 | the exact prompt, as it appears in the queue
```

Date is when you reviewed it. Score is the 1–5 confidence you gave that item — not
the day's confidence, the item's own. Grading three buttons on the dashboard maps to
**Got it = 4**, **Shaky = 3**, **Missed = 1**.

---

## Log

```
```
