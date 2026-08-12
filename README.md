# BA System

A 28-day operating system for landing a **Business Systems Analyst / BI Analyst** role in the UK, built around one constraint: **things do not stick unless they are revisited.**

Open one page, do exactly what it says, tick two blocks, close it. No decisions.

The markdown files are the source of truth. `index.html` reads them. The scripts write them back. Nothing else exists.

---

## Setup, once

```bash
git clone <your-repo-url>
cd ba-system
```

**1. Set your start date.** Open `tracking/config.md` and set `START_DATE` to the date of Day 1.

```
START_DATE: 2026-08-03
```

If that is not a Monday it still works. See "Start date" below.

**2. Seed the review queue.**

```bash
node scripts/seed-queue.js
```

This reads every `Adds to review queue:` line in `plan/month-01.md` and writes `tracking/review-queue.md` with each item at interval 1, due the day after it is introduced. Run once. Re-run any time you change `START_DATE`.

**3. Open the dashboard.** Double-click `index.html`, or push to GitHub and turn on Pages.

That is setup. Node 18 or newer, no `npm install`, no dependencies.

---

## Daily use

1. Open the dashboard. The **today card** is the whole screen. Everything else is quiet.
2. Do the **desk** block, tick tasks as you go.
3. Do the **phone** block. This is the one you will want to skip. It is the one that matters.
4. Say the **Say It Out Loud** line aloud. Actually aloud.
5. Tap a **confidence** score, 1 to 5. Honestly.
6. Tap **Copy today's log line**, paste it into `tracking/progress.md`. Or hand it to Claude Code and say "sync this".

Tangent trying to eat the session? Type it in the parking lot box, tap **Park it**, carry on. Under five seconds.

The indicator at the top says **synced** or **N unsynced**. Unsynced means the dashboard is holding ticks that are not in the markdown files yet. **Export all unsaved** dumps every pending line at once.

---

## When you miss a day

You will. The system is built for it, and none of it costs you visible progress.

**To go back and do it:** tap the **←** arrow on the today card until you reach the day. The card shows that day's blocks exactly as it did on the day, ticking works the same, and a banner tells you how far back you are. Tap **Today** to jump forward again. You can never navigate into the future — seeing days that have not happened is the paralysis this layout exists to avoid.

**It gets logged as late, not missed.** Ticking a past day stamps the date you actually did it:

```
D02 | 2026-08-04 | desk:Y phone:Y | conf:3 | done:2026-08-06 | note:
```

Second column is when it was scheduled, `done:` is when it happened. The field only appears when those differ. The weekly review reads it and counts that day as **backfilled, not missed**, so it never triggers the "week was too heavy, cut next week" rule for work you actually did. What it does report is the lag — how far your learning is drifting from your review schedule.

**If you are not going to do it, close it.** Tap **Write it off** on that day. It stops appearing in the catch-up list, the streak counter does not reset, and the weekly review treats it as a logged miss, which is honest data. Either it gets done or it gets closed. Nothing sits in limbo.

**The Not finished card** lists elapsed days that are neither done nor written off, most recent first, capped at six. If there are three or more it tells you to backfill the last one or two and write off the rest, rather than trying to clear a backlog.

### catch-up.js

```bash
node scripts/catch-up.js                  # what is outstanding, and the next move
node scripts/catch-up.js --log-misses     # write every unlogged elapsed day as a miss
node scripts/catch-up.js --reflow         # re-date review items to follow the actual work
node scripts/catch-up.js --restart-today  # move Day 1 to today and reseed
```

`--reflow` is the one that matters for retention. It does two things:

- A day you did late has its review items re-dated from the day you actually did it, so the 1/3/7/14/30 intervals measure from when you met the material.
- A day you have **not** done has its review items **held**: `due:hold`, invisible on the dashboard, until that day is done. Being asked to recall something you have never seen produces a false confidence-1 and corrupts the queue.

Run it after backfilling, and after `--log-misses`.

`--restart-today` is for one situation only: you never actually started. It moves `START_DATE` to today, blanks the log, and reseeds the queue, so nothing is behind. It refuses to run if there is real activity logged.

---

## Weekly, on Days 7, 14, 21 and 28

```bash
node scripts/weekly-review.js
```

Reads `tracking/progress.md` and `tracking/review-queue.md`, reschedules every due item, and prints what the week actually looked like. It says plainly when a week was too heavy, when the phone blocks are being dropped, and which items are not sticking.

---

## Scripts

All Node, no dependencies, all run from the repo root.

| Command | What it does |
|---|---|
| `node scripts/seed-queue.js` | Builds `tracking/review-queue.md` from the plan. Run once at setup, and again after changing `START_DATE`. Rebuilds every due date. |
| `node scripts/sync-progress.js paste.txt` | Writes copied log lines into `tracking/progress.md`. Replaces the row for that day, never duplicates it. Lines starting with `- ` go to the parking lot. Also reads stdin, so `node scripts/sync-progress.js` then paste then Ctrl+Z works. |
| `node scripts/catch-up.js` | Missed days. Reports what is still open. `--log-misses` writes unlogged elapsed days as misses, `--reflow` re-dates review items to follow the work you actually did, `--restart-today` moves Day 1 to today. |
| `node scripts/weekly-review.js` | The weekly checkpoint. `--dry` reports without writing. Pass a week number to force one, for example `node scripts/weekly-review.js 2`. |
| `node scripts/new-month.js` | Generates `plan/month-02.md` from `plan/day-template.md`, weighted by your weakest confidence scores. `--dry` prints the weighting only. |
| `node scripts/build-snapshot.js` | Refreshes the offline copy inside `index.html`. `weekly-review.js` calls it for you. |

### How the spaced repetition actually runs

Intervals are **1, 3, 7, 14, 30 days**. On review:

| Confidence | Result |
|---|---|
| 4 or 5 | Advance to the next interval |
| 3 | Repeat the current interval |
| 1 or 2 | Drop back one interval |

You never score items one by one. That would be friction, and friction is how this gets abandoned. Instead each queue line carries up to two past scores in its last field (`| 3,4`), and when an item has no score of its own the script uses the daily confidence you logged on the day it fell due.

The daily load is capped at **8 items**. If a day goes over, the strongest items are promoted to longer intervals rather than the block being made longer. The dashboard shows **due-today items only**, never the full queue.

---

## Start date

Day numbers always follow the calendar. Day 1 is `START_DATE`, Day 28 is 27 days later, and that is what you log in `tracking/progress.md`.

`plan/month-01.md` puts the phone-only consolidation blocks on Days 7, 14, 21 and 28, which assumes a Monday start. If you start on another weekday:

- Any 28-day run contains exactly four Sundays.
- The four consolidation blocks go to those four Sundays, in order.
- The other 24 blocks fill the remaining days, in order.

The dashboard tells you which plan block today is using, so there is nothing to work out. Start on a Monday and the mapping is one to one.

---

## Reading the files live vs offline

Browsers block `fetch()` on `file://` URLs. So:

- **On GitHub Pages, or any local server**, the dashboard reads the markdown files live. This is the real mode.
- **Double-clicked from disk**, it falls back to the last version this device loaded, or to a snapshot baked into `index.html`. It says so at the bottom of the page.

For a live local view without GitHub:

```bash
python -m http.server 8000     # then open http://localhost:8000
```

If you edit the plan and want the offline snapshot to match, run `node scripts/build-snapshot.js`.

---

## Putting it on GitHub

```bash
git remote add origin git@github.com:<you>/ba-system.git
git branch -M main
git push -u origin main
```

**GitHub Pages:** repo → Settings → Pages → Source `Deploy from a branch` → branch `main`, folder `/ (root)` → Save. A minute later the dashboard is at `https://<you>.github.io/ba-system/`.

Pages is what makes the dashboard a real page rather than a file. Two things depend on it: `fetch()` is blocked on `file://`, so only a served page reads the markdown live, and you need a URL before a phone can open anything.

### Installing it to your home screen

The page ships a web app manifest and icons, so it installs like an app. No store, no download.

- **iPhone:** open the Pages URL in **Safari** (not Chrome) → Share → *Add to Home Screen*.
- **Android:** open it in Chrome → three dots → *Install app* or *Add to Home screen*.

It then opens fullscreen with no address bar, and keeps working offline from the last version it loaded.

Note that Pages makes the repo's contents public. Nothing here holds anything private beyond your own progress, but if you would rather it were not indexed, keep the repo private and use the local server instead.

---

## Using it from your phone with the Claude app

1. Push the repo to GitHub.
2. In the Claude app: **Settings → Connectors → GitHub**, connect your account, and grant access to this repo.
3. Start a chat and say: *"Use my ba-system repo."*

Then the daily prompt is:

```
Read tracking/progress.md, tell me today's day number and blocks from
plan/month-01.md. Nothing else. No commentary, no alternatives.
```

And the weekly one:

```
Run the weekly review. Apply the rules in CLAUDE.md, update the review queue,
adjust next week if the data says I'm overloaded, and tell me plainly how the
week actually went.
```

`CLAUDE.md` is read automatically and holds the rules for how the system adapts.

For the tutor and the Day 28 mock interview, use `prompts/tutor-prompt.md` in a **separate** chat. Keep the tutor and the system operator apart.

---

## Files

```
ba-system/
├── index.html                    ← the dashboard
├── manifest.webmanifest          ← lets it install to a phone home screen
├── icon-180.png / icon-512.png   ← app icon
├── README.md                     ← you are here
├── START-HERE.md                 ← the original four-step setup
├── CLAUDE.md                     ← operating rules for Claude Code
├── LICENSE
├── plan/
│   ├── month-01.md               ← the 28-day plan, fully specified
│   └── day-template.md           ← format for generating month 2+
├── tracking/
│   ├── config.md                 ← START_DATE. Set once
│   ├── progress.md               ← the one file you write to daily
│   ├── review-queue.md           ← spaced repetition, the retention engine
│   └── applications.md           ← job pipeline
├── reference/
│   ├── target-roles.md
│   ├── datasets.md
│   ├── glossary.md
│   └── portfolio.md
├── prompts/
│   └── tutor-prompt.md
└── scripts/
    ├── lib.js                    ← shared parsing and date logic
    ├── seed-queue.js
    ├── sync-progress.js
    ├── catch-up.js               ← missed days: backfill, write off, reflow
    ├── weekly-review.js
    ├── new-month.js
    └── build-snapshot.js
```

---

## Rules

1. **Never skip the phone block to do more desk work.** Desk is learning, phone is remembering. You know which one you are bad at.
2. **Never redesign the plan mid-week.** Write the problem in the progress note and let the weekly checkpoint handle it. Redesigning is procrastination wearing a productive hat.
3. **Park tangents.** One box, one button, move on.
4. **Confidence 1 or 2 is useful data, not failure.** It is how the queue knows what to bring back. Flattering yourself breaks the system.
5. **Missing a day is fine. Missing the log is not.** The streak counter never resets to zero, so a miss costs you nothing visible. Log it. Then either go back and do it late, or write it off. Both are real answers. Leaving it undecided is the only wrong one.
