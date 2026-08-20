# START HERE

Everything you need is in this folder. Read this file, do the four steps, then never read this file again.

---

## What this is

A 28-day system to get you into a **Business Systems Analyst / BI Analyst** role in the UK — Peterborough, Cambridge, or remote-London.

Built around one constraint: **things don't stick unless you revisit them.** That's why the review queue exists and why every day has a spoken component.

**Target salary band:** £35–45k regional, £45k+ London/remote.
**The gap between you and it:** demonstrable SQL + Power BI, spoken in business language, with evidence attached.

---

## The four steps

### 1. Unzip somewhere permanent
Not Downloads. Somewhere you'll keep it — this becomes a GitHub repo.

### 2. Open Claude Code in that folder, paste PROMPT 1 (below)
It builds the repo, the dashboard, and the helper scripts.

### 3. Push to GitHub
Claude Code will walk you through it. Once it's up, connect the repo in the Claude app so you can run it from your phone.

### 4. Set your start date
In `tracking/config.md`, set START_DATE. Everything derives from it.

Then: Day 1.

---

## PROMPT 1 — Build it (paste into Claude Code)

```
I'm building a personal job-readiness system as a GitHub repo I'll access from my
phone via the Claude app. The markdown files in this folder are the spec and the
source of truth. Read all of them first before writing anything.

CONTEXT
I'm training for Business Systems Analyst / BI Analyst roles in the UK (Peterborough,
Cambridge, remote-London). I have ADHD. The system's entire purpose is to remove
decisions and make retention automatic. Two failure modes to design against:
(1) I forget anything I don't revisit, (2) I abandon systems that add friction.

TASK
Turn this into a working, GitHub-ready repo with a visual dashboard.

1. REPO SETUP
- Initialise git, add .gitignore (node_modules, .DS_Store, *.pbix, data/)
- Keep all existing markdown files exactly as they are - they're the data layer
- Write a root README.md: setup, daily use, how to connect the repo to the Claude
  app for mobile access
- Add an MIT LICENSE

2. VISUAL DASHBOARD - /index.html
Single self-contained HTML file. No build step, no framework, no npm install. Must
open by double-clicking locally AND work on GitHub Pages. Mobile-first: I'll use it
on my phone more than my laptop.

Reads the markdown files as source of truth (fetch + parse):
- plan/month-01.md         -> daily tasks
- tracking/progress.md     -> completion log
- tracking/review-queue.md -> items due today
- tracking/applications.md -> pipeline

ADHD-SPECIFIC DESIGN REQUIREMENTS (these are the point, not decoration):
- TODAY dominates the screen. One card, unmissable, nothing competing with it.
  Everything else is secondary and visually quieter.
- Future days collapsed by default. Seeing 28 days at once is paralysing.
- DESK and PHONE blocks as separate sections with distinct colours, each task a
  large tap-target checkbox.
- The "Say It Out Loud" line rendered prominently and styled differently from
  tasks - it's what I'm most likely to skip and it matters most.
- Confidence rating: five large tap buttons (1-5). No dropdown.
- Streak counter that NEVER resets to zero on a miss. Show "days active" and
  "days this week". A broken streak must not erase visible progress.
- Progress rings for: month completion, review queue health, applications
  submitted vs target (15).
- A "due for review today" panel pulling from the review queue.
- Parking lot input - one text box, one button, appends to progress.md parking
  lot. Must take under 5 seconds to use.
- Dark mode default, high contrast, generous whitespace, large type. No dense
  tables on mobile.
- Zero animation beyond simple state transitions.

STATE HANDLING (get this right):
A static page can't commit to git. So:
- localStorage for instant ticking, so the UI responds immediately
- A "Copy today's log line" button outputting the exact progress.md format:
  D01 | 2026-08-01 | desk:Y phone:Y | conf:3 | note:
- An "Export all unsaved progress" button that dumps every pending line at once
- A subtle indicator when localStorage has entries not yet written to the
  markdown files, so I know to sync

3. CLAUDE CODE HELPERS - /scripts/
Small node or shell scripts, documented in the README:
- sync-progress: takes copied log lines, appends to tracking/progress.md
- weekly-review: reads progress.md + review-queue.md, applies the spaced
  repetition rules in CLAUDE.md (1/3/7/14/30 day intervals; confidence 4-5
  advances, 3 repeats, 1-2 drops back), rewrites review-queue.md with updated due
  dates, and prints a plain-English summary of the week and what it changed
- new-month: generates plan/month-02.md from plan/day-template.md, weighted by
  weakest confidence scores

4. TWO GAPS IN THE SPEC - fix these too
a) START DATE ANCHOR
   Add tracking/config.md with a START_DATE field I set once. Every script and
   index.html derives the current day number from it. If START_DATE isn't a
   Monday, shift the phone-only consolidation days so they still land on Sundays
   and renumber accordingly, rather than leaving them mid-week.

b) SEED THE REVIEW QUEUE
   Write scripts/seed-queue that parses every "Adds to review queue:" line in
   plan/month-01.md and writes tracking/review-queue.md with each item scheduled
   at interval 1, due the day after it's introduced. Keep the permanent 30-day
   items already in the file. Run once at setup.
   index.html must show due-today items ONLY, never the full queue. Seeing the
   whole backlog is exactly the paralysis this is meant to avoid.

5. CONSTRAINTS
- No external dependencies in index.html. Everything inline or vanilla JS.
- Don't restructure or rewrite the markdown files. They're deliberate.
- Don't add features I didn't ask for. Extra options are friction.
- Every file you create must be editable from a phone. Keep them short.

Start by reading CLAUDE.md - it contains the operating rules for how this system
adapts, and the dashboard must not contradict them.
```

---

## PROMPT 2 — Daily (use this every day)

```
Read tracking/progress.md, tell me today's day number and blocks from
plan/month-01.md. Nothing else - no commentary, no alternatives.
```

---

## PROMPT 3 — Weekly checkpoint (Days 7, 14, 21, 28)

```
Run the weekly review. Apply the rules in CLAUDE.md, update the review queue,
adjust next week if the data says I'm overloaded, and tell me plainly how the
week actually went.
```

---

## PROMPT 4 — Tutor (separate Claude chat, not Claude Code)

Full version in `prompts/tutor-prompt.md`, including the Day 28 mock interview prompt. Use it whenever you hit something mid-session you don't understand.

---

## What's in the folder

| File | What it's for |
|---|---|
| `START-HERE.md` | This file |
| `CLAUDE.md` | Operating rules for Claude Code — how the system adapts |
| `README.md` | How the system works day to day |
| `plan/month-01.md` | **The 28-day plan.** Every day fully specified |
| `plan/day-template.md` | Format for generating month 2+ |
| `tracking/progress.md` | **The one file you write to daily.** 10 seconds |
| `tracking/review-queue.md` | Spaced repetition — the retention engine |
| `tracking/notes.md` | **Your working, filed under the task.** Type under the thing you are doing |
| `tracking/review-log.md` | Every review you have graded, with the score and the date |
| `tracking/knowledge-gaps.md` | What you didn't know, the answer, and whether it stuck |
| `tracking/cv-workspace.md` | Where the CV gets written, Days 4 and 6 |
| `tracking/applications.md` | Job pipeline + agency contacts |
| **`workspace/`** | **One prefilled file per working day.** You never open a blank page |
| `reference/answers/` | Model SQL. Open me *second* |
| `reference/target-roles.md` | Market research: salaries, titles, where to search |
| `reference/datasets.md` | Every dataset you'll use. All free and public |
| `reference/glossary.md` | BA/BSA terminology for interviews |
| `reference/portfolio.md` | Your two portfolio artifacts |
| `prompts/tutor-prompt.md` | Tutor + mock interview prompts |

---

## The five rules

1. **Never skip the phone block to do more desk work.** Desk is learning, phone is remembering. You know which one you're bad at.
2. **Never redesign the plan mid-week.** Write the problem in the progress note; let the weekly checkpoint handle it. Redesigning is procrastination in disguise.
3. **Park tangents.** Bottom of `progress.md`. Write it, move on.
4. **Confidence 1 or 2 is useful data, not failure.** It's how the queue knows what to bring back. Flattering yourself breaks the system.
5. **Missing a day is fine. Missing the log is not.** Log the miss.

---

## Day 1 starts with a baseline test, not content

You said you don't know what you know. Day 1 measures it across SQL and Power BI, and everything after calibrates to what you find. Be honest in the notes.
