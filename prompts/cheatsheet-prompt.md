# Cheat sheet prompt — paste into ChatGPT

One-shot prompt. It contains every fact about this system, so ChatGPT needs no access to the repo.

Paste the whole block below, including the reference section. Output is a single-page cheat sheet.

---

````
You are writing a one-page reference card. Output it in Markdown. Nothing else — no
preamble, no "here's your cheat sheet", no closing offer to revise.

WHO IT IS FOR
Ahmed. ADHD. He built the system described below and now needs a card that lets him
operate it without re-reading the docs. He forgets anything he does not revisit, and
he does not read walls of text — he scans. He will keep this open on a phone.

HARD FORMATTING RULES (these are the deliverable, not decoration)
- Bottom line first in every section. Never build up to the point.
- No paragraph longer than two sentences. Most lines should be one.
- Bullets, tables and headers over prose. If something can be a table, make it a table.
- Bold the single word or phrase that matters in each bullet.
- Every command, filename and format string in `code formatting`.
- No filler: no "it's important to note", no "as you can see", no motivational lines.
- Scannable on a phone screen. Short lines beat wide ones.
- Do not invent, improve, or add features. Use ONLY the facts in the reference below.
  If something is not stated there, leave it out.

REQUIRED SECTIONS, IN THIS ORDER
1. **The 10-second daily loop** — the six steps, numbered, nothing else. This is the
   part he reads most, so it goes first and stays tight.
2. **My dates** — a small table of the key dates and the four phone-only Sundays.
3. **Where everything lives** — file tree with a one-line purpose each.
4. **The dashboard** — every button and what it does, as a table. Include what is
   visible on screen and what each control changes.
5. **Log line format** — the exact string, both variants, with each field explained.
   Show a filled example of each.
6. **Commands** — every script with its flags, as a table: command / what it does /
   when to run it.
7. **The review queue** — how spaced repetition actually runs here: the intervals,
   the confidence rules, the daily cap, the queue line format, and `due:hold`.
8. **"I missed a day"** — a decision table. Situation in the left column, exact action
   in the right. This must cover: did it late, not going to do it, several days behind,
   never actually started.
9. **Capture and digest** — the brain dump, the automatic questions log, and the
   knowledge-gaps record. Make clear which of the three he writes in (one) and which
   maintain themselves (two). Include the end-of-day trigger phrase.
10. **Weekly checkpoint** — when, the command, and what each rule triggers.
11. **Prompts I paste elsewhere** — the daily prompt, the weekly prompt, and the note
    about keeping the tutor chat separate.
12. **The five rules** — verbatim, condensed to one line each.
13. **Troubleshooting** — the offline-vs-live behaviour, and the sync indicator.

End with a single line marked 👉 giving the one thing to do if he is ever unsure
where he stands. One action, not a menu.

===================== REFERENCE FACTS — USE ONLY THESE =====================

## What the system is
A 28-day operating system for landing a Business Systems Analyst / BI Analyst role in
the UK (Peterborough, Cambridge, remote-London). Target band £35–45k regional, £45k+
London/remote. Application target for the month: 15.
Built around one constraint: things do not stick unless revisited.
Practice data is public only: Northwind, Contoso, UK public datasets. There is no
personal or company dataset.
Daily ceiling, never exceeded: 75 min desk + 30 min phone.
Desk = learning. Phone = remembering. Phone tasks are doable lying down, no keyboard.

## My dates (already configured)
- `START_DATE: 2026-08-12`. Day 1 = Wed 12 Aug 2026. Day 28 = Tue 8 Sep 2026.
- Start was a Wednesday, not a Monday, so the four phone-only consolidation blocks
  were reassigned to the Sundays inside the run:
  - D05 = Sun 16 Aug, runs plan block 7
  - D12 = Sun 23 Aug, runs plan block 14
  - D19 = Sun 30 Aug, runs plan block 21
  - D26 = Sun 6 Sep, runs plan block 28
- Day numbers always follow the calendar. Log by day number (D05), not block number.
  The dashboard shows which plan block the day is using, so nothing needs working out.
- Live dashboard: https://a-daf01.github.io/BA-System/ — installed to the phone home
  screen. Repo: github.com/a-daf01/BA-System

## File tree
```
ba-system/
├── index.html                    the dashboard
├── manifest.webmanifest          lets it install to a phone home screen
├── icon-180.png / icon-512.png   app icon
├── README.md                     how the system works day to day
├── START-HERE.md                 the original four-step setup
├── CLAUDE.md                     operating rules for Claude Code
├── LICENSE
├── plan/
│   ├── month-01.md               the 28-day plan, every day fully specified
│   └── day-template.md           format for generating month 2+
├── tracking/
│   ├── config.md                 START_DATE. Set once
│   ├── progress.md               the one file written to daily
│   ├── review-queue.md           spaced repetition, the retention engine
│   ├── braindump.md              unstructured daily notes, digested each evening
│   ├── braindump-archive.md      digested days, kept for later review
│   ├── questions-log.md          every prompt, captured automatically by a hook
│   ├── knowledge-gaps.md         curated record of what he did not know
│   └── applications.md           job pipeline + agency contacts
├── reference/
│   ├── target-roles.md           salaries, titles, where to search
│   ├── datasets.md               every dataset used, all free and public
│   ├── glossary.md               BA/BSA terminology for interviews
│   └── portfolio.md              the two portfolio artifacts
├── prompts/
│   ├── tutor-prompt.md           tutor + Day 28 mock interview prompts
│   └── cheatsheet-prompt.md      this prompt
└── scripts/
    ├── lib.js                    shared parsing and date logic
    ├── braindump.js
    ├── log-question.js
    ├── seed-queue.js
    ├── sync-progress.js
    ├── catch-up.js
    ├── weekly-review.js
    ├── new-month.js
    └── build-snapshot.js
```
The markdown files are the source of truth. `index.html` reads them. The scripts write
them back. Node 18+, no dependencies, no npm install. All scripts run from repo root.

## Daily use, the six steps
1. Open the dashboard. The today card is the whole screen.
2. Do the DESK block, tick tasks as you go.
3. Do the PHONE block. The one you will want to skip, the one that matters.
4. Say the "Say it out loud" line aloud. Actually aloud.
5. Tap a confidence score 1–5. Honestly.
6. Tap "Copy today's log line", paste into `tracking/progress.md` — or hand it to
   Claude Code and say "sync this".
Tangent eating the session? Type it in the parking lot box, tap "Park it", carry on.

## Dashboard controls
- Header shows "synced" or "N unsynced". Unsynced = the dashboard holds ticks not yet
  written to the markdown files.
- Theme toggle button in the header.
- Today card: day number, date, title, theme line, DESK section, PHONE section, each
  task a large tap-target checkbox.
- "Say it out loud" rendered prominently, styled differently from tasks.
- "How well did it stick?" — five large tap buttons, 1 to 5. No dropdown.
- ← arrow: step back through elapsed days to open and finish a missed one.
- → arrow: forward, but never past today. Disabled at today.
- "Today" button: jump back to the current day.
- "Write it off": closes a day you are not going to do. Toggles to "Undo write-off".
- "Copy today's log line" (reads "Copy Day NN's log line" when viewing a past day).
- "Export all unsaved": dumps every pending log line at once.
- "Not finished" card: elapsed days that are neither done nor written off, most recent
  first, capped at six.
- "Due for review today" panel: due-today items only, never the full queue.
- "Where you are": progress rings for month completion, review queue health, and
  applications submitted vs target.
- "The full 28 days": collapsed by default.
- Parking lot: one text box, one "Park it" button. Appends to the progress.md parking lot.
- Streak counter shows "days active" and "days this week". It NEVER resets to zero on
  a miss. A miss costs no visible progress.

## Log line format
The only file written to daily. Should take 10 seconds.
Normal day:
```
D01 | 2026-08-12 | desk:Y phone:Y | conf:3 | note:
```
Day done late — carries the extra `done:` field:
```
D02 | 2026-08-13 | desk:Y phone:Y | conf:3 | done:2026-08-16 | note:
```
Fields:
- `D01` — day number, always two digits.
- Second column — the date the day was SCHEDULED.
- `desk:` / `phone:` — `Y` done, `N` not done, `P` partial, `-` the plan gives no block
  that day (the four Sundays already carry `desk:-`).
- `conf:` — 1 to 5, how well today's material stuck.
  - 1 = didn't understand it
  - 2 = followed along but couldn't redo it alone
  - 3 = could redo it with a reference open
  - 4 = could redo it from memory
  - 5 = could teach it
- `done:` — the date the work ACTUALLY happened. Written only when it differs from the
  scheduled date, so days done on the day look exactly as they always did.
- `note:` — optional. Leave blank most days.
A logged miss looks like:
```
D09 | 2026-08-20 | desk:N phone:N | conf:- | note: didn't happen
```

## Review queue / spaced repetition
Intervals: 1, 3, 7, 14, 30 days.
- Confidence 4 or 5 → advance to the next interval
- Confidence 3 → repeat the current interval
- Confidence 1 or 2 → drop back one interval
Daily load capped at 8 items. If a day goes over, the strongest items are promoted to
longer intervals rather than the block being made longer.
Items are never scored one by one — that is friction. Each queue line carries up to two
past scores in its last field. When an item has no score of its own, the script uses the
daily confidence logged on the day it fell due.
Queue line format:
```
[3] due:2026-08-19 | Explain a LEFT JOIN to a non-technical stakeholder | 3,4
```
`[3]` = current interval in days. `due:` = next due date. Then the prompt. Then up to
two past confidence scores, oldest first.
`due:hold` = the item belongs to a day that has not happened yet. Hidden on the
dashboard. Being asked to recall material never met produces a false confidence-1 and
corrupts the queue.
The dashboard shows due-today items only. The full queue stays out of sight on purpose.

## Scripts
- `node scripts/seed-queue.js` — builds `tracking/review-queue.md` from every "Adds to
  review queue:" line in the plan. Run once at setup, and again after changing
  START_DATE. Rebuilds every due date. Safe to re-run.
- `node scripts/sync-progress.js paste.txt` — writes copied log lines into
  `tracking/progress.md`. Replaces the row for that day, never duplicates. Lines
  starting with `- ` go to the parking lot. Also reads stdin: run it with no argument,
  paste, then Ctrl+Z.
- `node scripts/catch-up.js` — reports what is still outstanding and the next move.
  - `--log-misses` writes every unlogged elapsed day as a miss
  - `--reflow` re-dates review items to follow the work actually done
  - `--restart-today` moves Day 1 to today, blanks the log, reseeds the queue. For one
    situation only: never actually started. Refuses to run if real activity is logged.
- `node scripts/weekly-review.js` — the weekly checkpoint. `--dry` reports without
  writing. Pass a week number to force one: `node scripts/weekly-review.js 2`.
- `node scripts/new-month.js` — generates `plan/month-02.md` from
  `plan/day-template.md`, weighted by weakest confidence scores. `--dry` prints the
  weighting only.
- `node scripts/build-snapshot.js` — refreshes the offline copy inside `index.html`.
  `weekly-review.js` calls it automatically.

## Missed days
The system is built for it. None of it costs visible progress.
- To go back and do it: tap ← on the today card until you reach the day. The card shows
  that day's blocks exactly as it did on the day. Ticking works the same. A banner shows
  how far back you are. Tap "Today" to jump forward. You can never navigate into the
  future — seeing days that have not happened is the paralysis the layout exists to avoid.
- Doing it late logs it as late, not missed. The weekly review counts a `done:` day as
  backfilled, so it never triggers the "week was too heavy" reduction for work actually
  done. It reports the lag instead.
- Not going to do it: tap "Write it off". It stops appearing in the catch-up list, the
  streak does not reset, and the weekly review treats it as a logged miss — honest data.
- Three or more days open: backfill the last one or two and write off the rest. Do not
  try to clear the whole backlog.
- Run `node scripts/catch-up.js --reflow` after backfilling and after `--log-misses`.
  `--reflow` re-dates a late day's review items from when the work happened, and holds
  items belonging to days that never happened.
- Either it gets done or it gets closed. Leaving it undecided is the only wrong answer.

## Capture and digest
Three files. He types in ONE of them; the other two maintain themselves.

`tracking/braindump.md` — the only one he writes in. Unstructured notes during the day:
solutions, struggles, half-thoughts, questions, frustrations. No format, fragments fine,
nothing graded. Commands:
- `node scripts/braindump.js` — show today's entries
- `node scripts/braindump.js "text"` — append a line without opening the file
- `node scripts/braindump.js --archive` — move today into the archive
He can also just open the file and type.

**Trigger phrase: say "I'm done" to Claude Code at the end of the day.** It then digests
today's dump:
- Something that blanked or broke → review queue, due tomorrow
- Something he worked out → review queue, due in three days
- An open question → answered now, or parked if it needs its own session
- A tangent → parking lot in `tracking/progress.md`
Then it proposes the day's log line and **asks him for the confidence score — it never
guesses that number**, because it saw a description of the day rather than the day, and an
invented score corrupts every interval derived from it. After he confirms, the day is
archived to `tracking/braindump-archive.md` and the file is blank for tomorrow.

`tracking/questions-log.md` — automatic. Every prompt he types in Claude Code is appended
by a `UserPromptSubmit` hook in `.claude/settings.json` running `scripts/log-question.js`.
It fires whether or not Claude thinks to log anything. Raw inbox, never curated, never
deleted.

`tracking/knowledge-gaps.md` — the curated record, written by Claude Code: what he assumed,
the correct answer, why it matters, and a status.
- `open` = answered once, not yet revisited. Assume it has not stuck.
- `queued` = promoted into the review queue; spaced repetition owns it.
- `known` = recalled at 4–5 confidence on a later review. **Only this one means it stuck.**
Job-relevant gaps (SQL, Power BI, data modelling, BA terminology) get promoted to the
queue as spoken questions. System and git trivia is audited but deliberately left out of
the queue, because the daily cap is 8 items.

## Weekly checkpoint — Days 7, 14, 21, 28
`node scripts/weekly-review.js`
Reads `tracking/progress.md` and `tracking/review-queue.md`, reschedules every due item,
and prints what the week actually looked like. Rules it applies:
- Confidence 1–2 on an item → reschedule at a shorter interval. Twice at 1–2 → a
  dedicated re-teach block goes into the coming week, displacing something lower priority.
- Confidence 4–5 twice running → push to the 30-day interval, stop surfacing it daily.
- Two or more missed DESK blocks in a week → the week was too heavy. Next week's desk
  blocks reduce by ~20%, stated explicitly. Backlog is not carried forward silently.
- Missed PHONE blocks but completed DESK → the dangerous pattern. Flagged directly.
  Retention is the entire point.
- Parking lot has 3+ items → one gets scheduled as a Sunday deep-dive.
- Backfilled days count as done, not missed. Average lag of 3+ days, or any single day
  5+ late, means review intervals no longer match when the material was learned — run
  `--reflow`. A consistent lag is a scheduling problem, not a discipline one.
It does not edit `plan/month-01.md`. Adjusting the coming week is a judgement call.

## Prompts used elsewhere
Daily, in the Claude app with the repo connected:
```
Read tracking/progress.md, tell me today's day number and blocks from
plan/month-01.md. Nothing else. No commentary, no alternatives.
```
Weekly:
```
Run the weekly review. Apply the rules in CLAUDE.md, update the review queue,
adjust next week if the data says I'm overloaded, and tell me plainly how the
week actually went.
```
Tutor and the Day 28 mock interview: `prompts/tutor-prompt.md`, in a SEPARATE chat.
Keep the tutor and the system operator apart.
`CLAUDE.md` is read automatically by Claude Code and holds the adaptation rules.

## The five rules
1. Never skip the phone block to do more desk work. Desk is learning, phone is
   remembering. You know which one you are bad at.
2. Never redesign the plan mid-week. Write the problem in the progress note and let the
   weekly checkpoint handle it. Redesigning is procrastination wearing a productive hat.
3. Park tangents. One box, one button, move on.
4. Confidence 1 or 2 is useful data, not failure. It is how the queue knows what to
   bring back. Flattering yourself breaks the system.
5. Missing a day is fine. Missing the log is not. Log it, then either do it late or
   write it off.

## Offline vs live
Browsers block `fetch()` on `file://` URLs.
- On GitHub Pages, or any local server, the dashboard reads the markdown files live.
  This is the real mode, and the header says "synced".
- Double-clicked from disk, it falls back to the last version that device loaded, or to
  a snapshot baked into `index.html`. It says so at the bottom of the page.
- Local live view without GitHub: `python -m http.server 8000`, then
  http://localhost:8000
- After editing the plan, `node scripts/build-snapshot.js` makes the offline snapshot match.

===================== END OF REFERENCE FACTS =====================
````
