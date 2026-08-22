# Time Log

**How long each task actually took, against how long the plan asked for.**

You do not write in this file. The stopwatch on the dashboard runs while a task is open,
and the export carries the readings here.

## Why this exists

You asked for it on 2026-08-20: *"timers and stopwatches to get a better sense of time and
create urgency but also so we can analyse how well I do or how easy it gets or how long it
takes me to do each section."*

All three of those need the same data, and none of them work on memory of how long
something felt.

- **Urgency.** A countdown against the stated budget is visible pressure. A task that says
  "10 min" with nothing counting is a suggestion.
- **Calibration.** If the plan says 10 and you reliably take 25, the plan is wrong, not you,
  and the day gets rebuilt rather than you losing the evening.
- **Progress.** SQL exercises getting faster at a constant confidence is the clearest
  evidence of fluency there is, and it is the one thing a confidence score cannot show.

## Format

```
2026-08-20 | D08 desk 2 | 612 | 14:20-14:31 | budget:10
```

Date · which task · seconds measured · when you were on it · minutes the plan asked for.

One line per task per day, carrying the running total. A task picked up twice reports the
sum, not two rows to add up.

## What it will not do

- **It does not judge you for being slow.** Over budget is information about the estimate.
- **It stops counting at three times the budget**, so a timer left running overnight cannot
  poison the analysis. Anything past that is discarded and the row is marked.
- **It never becomes a target.** Racing the clock to beat a number produces work you cannot
  recall a day later, which is the opposite of what this system is for.

---

## Log

```
2026-08-21 | D09 desk 1 | 1764 | 11:20-12:14 | budget:30
2026-08-21 | D09 desk 2 | 2214 | 14:44-12:13 | budget:30
```
