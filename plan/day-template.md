# Day template — for generating month 2 and beyond

Every day must follow this shape. No exceptions — an unspecified day is a skipped day.

```markdown
## Day NN — [Theme]
**Theme:** One line. What this day is actually for.

**Open:** `workspace/day-NN-something.md`

**DESK (60–75 min)**
- [ ] XX min — Concrete task with a named deliverable
  1. Sub-step, with the answer it should produce *(expected: 22 rows)*
  2. Sub-step, with the answer it should produce
- [ ] XX min — Concrete task with a named deliverable
- [ ] XX min — Concrete task with a named deliverable

**PHONE (20–30 min)**
- [ ] 10 min — Review queue
- [ ] XX min — Doable lying down, no keyboard: reading, watching, recall, voice notes, job ads

**Say It Out Loud:** One sentence in business language, as you'd say it to a hiring manager.

**Adds to review queue:** A full question he has to answer aloud · A second full question · A third
```

## Constraints

- **Desk block never exceeds 75 min.** He does exactly what's written — overwriting a day is as harmful as underwriting it.
- **Phone block is never optional.** It's where retention happens, and it's the block he'll be tempted to drop.
- **Every task names a deliverable.** "Practice SQL" is a failed instruction. "Write 15 queries escalating from single filter to NULL handling" is a real one.
- **`Open:` names the file the day writes into, and that file must already exist**, prefilled with the questions and the structure. No day starts on a blank page. The dashboard renders this above the task list.
- **Every task that produces a number carries the number.** A row count, a total, a top row. Self-checking is what makes a day feel finished instead of ambiguous, and ambiguity is what gets abandoned.
- **Verify every data exercise against the real dataset before writing it.** Two separate days shipped tasks Northwind could not support. Run the query first.
- **`Adds to review queue` holds full questions, never topic labels.** `scripts/seed-queue.js` copies these lines straight into the queue, so a stub written here becomes a stub he can't answer on a phone. Two or three per day, maximum — the daily cap is 5–8 including repeats from earlier intervals.
- **Every 7th day is phone-only consolidation**, and ends with a *boss fight*: one spoken, no-notes challenge that uses the whole week. Recovery is written in deliberately.
- **Say It Out Loud on every single day.** It's the interview-readiness mechanism and the easiest thing to lose when regenerating.
- **Weight month 2 toward:** lowest confidence scores in `tracking/progress.md`, anything in the "couldn't defend in an interview" list, unresolved `open` items in `tracking/knowledge-gaps.md`, and gaps surfaced by real interview feedback in `tracking/applications.md`.
