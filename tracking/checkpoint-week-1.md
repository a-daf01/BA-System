# Week 1 checkpoint — prepared 2026-08-17, to run 2026-08-18

**Run this tomorrow, after Day 7's desk block and after the review queue.** Not before.
The whole point is to judge the week on complete data, and today Day 6 is still unlogged
and 21 review items are still outstanding.

---

## Run these three, in this order

```
node scripts/weekly-review.js          # grades the queue, rewrites due dates
node scripts/catch-up.js --reflow      # re-dates anything that moved
node scripts/check.js                  # full system check, not just tomorrow
```

Then tell Claude Code you have done Day 7, give it the confidence score, and ask for the
week 2 adjustment. Everything below is the input it should read first.

---

## Where week 1 actually landed

Readings taken 2026-08-17, before Day 6 was logged and before tonight's reviews.

| | |
|---|---|
| Days elapsed | 6 of 7 |
| Done | D01, D02, D03 — all desk **and** phone |
| Written off | **D04** (JOIN repair), **D05** (Sunday consolidation) |
| Unlogged | **D06** — today. Self-scored **4** when asked; the line goes in tonight |
| Confidence so far | 4, 4, 5 → average **4.3** |
| Desk blocks missed | 1 of 5 |
| Review queue | 67 active, 8 permanent, **2 held**, **21 due now** |
| Applications submitted | **0 of 15** |

### What the numbers say before anyone interprets them

- **The desk work is holding.** Three full days plus today, average confidence 4.3, and
  Day 2 was 13/15 queries correct unaided. This is not someone struggling with the material.
- **The gap is the phone block, and it is the whole story.** 21 items due is roughly three
  missed review sessions. Retention is the one thing this system exists to protect, and it
  is the thing that has slipped. Say this plainly at the checkpoint; do not soften it.
- **The pipeline has not started.** 0 of 15 applications, and the target is 15 by Day 28.
  Day 7 is the day that changes — it is the whole block.
- **Two days were written off in one week.** Not a crisis at this ratio, but the reason
  matters: both were weekend days. Worth asking whether the weekend slot is real.

---

## Decisions already made, so they do not get re-litigated

Written off does not mean the material vanished. This is where D04 and D05 went:

| Was | Now |
|---|---|
| D04 · CV Step 3 | **Moved into Day 7's desk block.** 10 min. The queue already asks him to say the three bullets aloud, so it had to happen |
| D04 · Lapsed-customer query | **Stays live in the queue.** He attempted it anyway and misread the result — see the 17 Aug entry in `knowledge-gaps.md` |
| D04 · Fan-out on order 10273 | **Stays live in the queue.** Met on Day 3, answered wrong, never re-tested |
| D04 · Freight ranking two ways | **Held.** Its lesson is carried by the two live fan-out items. Month 2 input |
| D04 · The 93/92 defect | **Moved to Day 10**, the relational-model day, as a 10-min task. Queue item held until then |
| D05 · Week 1 boss fight | **Moved into Day 7's phone block.** 10 min, and it ends on the fan-out half he got wrong |
| D05 · Week 1 queue sweep | **Absorbed by tonight's reviews and this checkpoint** |

---

## The four questions to answer tomorrow

Answer these with evidence, not impressions. That is what the checkpoint is for.

### 1. Is the phone block failing, or is the slot wrong?

The desk work is getting done and the phone work is not. That is the specific pattern
`CLAUDE.md` calls the dangerous one. Before cutting anything, establish which it is:

- If the reviews **did** happen tonight and the backlog drains, the slot is fine and week 1
  was just disrupted by two written-off days. Change nothing.
- If they did not, the phone block is landing at a time that does not exist in his day, and
  the fix is to **move it, not shrink it**.

### 2. Does week 2's desk load need cutting?

The rule is a 20% cut after **two or more missed desk blocks**. Week 1 missed one, plus one
Sunday with no desk block at all. **On the arithmetic, no cut is due.** Do not cut on
sentiment — say the number and move on.

### 3. Has the fan-out gap actually closed?

This is the one piece of material with a recorded wrong answer that has never been
re-tested. Day 3 was scored **5** with two wrong answers inside it, and the day built to
repair that got written off.

Tomorrow's phone block ends on it deliberately. **Take that result seriously** — if he
stalls, it is a confidence 2 regardless of what the rest of the day scored, and it needs a
dedicated re-teach block in week 2, displacing something lower priority.

### 4. Do the flash cards change the review behaviour?

The cards went live today: every item now carries where it came from, a hint, and the full
answer. The stated reason he skipped items was not knowing what they were asking.

**Tonight is the first real test of that.** Ask directly whether he opened any cards, and
whether the hint was enough. If items are still being skipped with the cards in place, the
problem is the slot or the length, not the content — and that changes which lever to pull.

---

## What must not happen at this checkpoint

- **No invented confidence scores.** Items that fell due on D04 and D05 carry no score and
  must stay unscored. `weekly-review.js` moves them on as "carried forward unscored", which
  is correct. Grading them from the week average would corrupt every interval downstream.
- **No counting D04 and D05 as failures twice.** They are in the arithmetic. They are closed
  questions everywhere else.
- **No expanding the review block to clear the backlog.** The cap is 5–8. If the queue is
  still over, promote the strongest items to longer intervals — do not make the block longer.
- **No adding to week 2 without removing something.** 75 min desk, 30 min phone, per day.
  The four Sunday consolidation blocks stay phone-only.
