'use strict';
// Shared helpers for every script in this folder.
// The same schedule + parse logic is mirrored in index.html so the dashboard and
// the scripts can never disagree about what day it is.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = {
  config: path.join(ROOT, 'tracking', 'config.md'),
  progress: path.join(ROOT, 'tracking', 'progress.md'),
  queue: path.join(ROOT, 'tracking', 'review-queue.md'),
  cards: path.join(ROOT, 'tracking', 'review-cards.md'),
  reviewLog: path.join(ROOT, 'tracking', 'review-log.md'),
  notes: path.join(ROOT, 'tracking', 'notes.md'),
  timeLog: path.join(ROOT, 'tracking', 'time-log.md'),
  dayReviews: path.join(ROOT, 'tracking', 'day-reviews.md'),
  apps: path.join(ROOT, 'tracking', 'applications.md'),
  month1: path.join(ROOT, 'plan', 'month-01.md'),
  month2: path.join(ROOT, 'plan', 'month-02.md'),
  template: path.join(ROOT, 'plan', 'day-template.md'),
  index: path.join(ROOT, 'index.html'),
  week: path.join(ROOT, 'week.html'),
  day: path.join(ROOT, 'day.html'),
  gaps: path.join(ROOT, 'tracking', 'knowledge-gaps.md'),
};

const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s, 'utf8');

// --- dates -----------------------------------------------------------------
// Parsed as local dates. Never use Date(string) directly: it treats
// YYYY-MM-DD as UTC and shifts the day for anyone west of Greenwich.
function toDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}
function iso(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

// --- config ----------------------------------------------------------------
// Minutes a day may ask for. Standing values are 75 and 30; tracking/config.md
// can raise them for a deliberate, dated sprint. Read rather than hardcoded so
// the ceiling is one edit away from being put back.
function getCeilings() {
  const md = read(P.config);
  const num = (key, dflt) => {
    const m = new RegExp('^' + key + ':\\s*(\\d+)', 'm').exec(md);
    return m ? +m[1] : dflt;
  };
  const until = /^SPRINT_UNTIL:\s*(\S+)/m.exec(md);
  const active = until && toDate(until[1]) && toDate(until[1]) >= today();
  return {
    desk: active ? num('DESK_CEILING', 75) : 75,
    phone: active ? num('PHONE_CEILING', 30) : 30,
    sprint: !!active,
    until: until ? until[1] : null,
  };
}

function getStartDate() {
  const m = /^START_DATE:\s*(\S+)/m.exec(read(P.config));
  const d = m ? toDate(m[1]) : null;
  if (!d) throw new Error('START_DATE missing or malformed in tracking/config.md');
  return d;
}

// --- schedule --------------------------------------------------------------
// Day numbers follow the calendar. Consolidation blocks (7/14/21/28) are
// assigned to the four Sundays in the run; the other 24 blocks fill the rest in
// order. Any 28-day window contains exactly four Sundays, so this always fits.
const CONSOLIDATION = [7, 14, 21, 28];

function buildSchedule(startDate) {
  const regular = [];
  for (let i = 1; i <= 28; i++) if (!CONSOLIDATION.includes(i)) regular.push(i);
  let ci = 0, ri = 0;
  const out = [];
  for (let n = 1; n <= 28; n++) {
    const date = addDays(startDate, n - 1);
    const sunday = date.getDay() === 0;
    const block = (sunday && ci < CONSOLIDATION.length) ? CONSOLIDATION[ci++] : regular[ri++];
    out.push({ day: n, date, block, sunday });
  }
  return out;
}
function dayNumberFor(startDate, date) {
  const n = daysBetween(startDate, date) + 1;
  return n;
}
function blockDate(schedule, blockNo) {
  const e = schedule.find((x) => x.block === blockNo);
  return e ? e.date : null;
}

// --- plan parsing ----------------------------------------------------------
// Returns [{ block, title, theme, desk:[], phone:[], sayItOutLoud, adds:[] }]
function parsePlan(md) {
  const days = [];
  let cur = null, mode = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    const head = /^##\s+Day\s+(\d+)\s*[-—–]?\s*(.*)$/.exec(line);
    if (head) {
      cur = { block: +head[1], title: head[2].trim(), theme: '', open: '', desk: [], phone: [], say: '', adds: [] };
      days.push(cur);
      mode = null;
      continue;
    }
    if (!cur) continue;

    if (/^\*\*DESK/i.test(line)) { mode = 'desk'; continue; }
    if (/^\*\*PHONE/i.test(line)) { mode = 'phone'; continue; }

    const theme = /^\*\*Theme:\*\*\s*(.*)$/i.exec(line);
    if (theme) { cur.theme = theme[1].trim(); mode = null; continue; }

    // The file this day writes into. Rendered as the first thing on the day
    // card, because "what do I open" was a real source of friction.
    const open = /^\*\*Open:\*\*\s*(.*)$/i.exec(line);
    if (open) { cur.open = open[1].trim(); mode = null; continue; }

    const say = /^\*\*Say It Out Loud:\*\*\s*(.*)$/i.exec(line);
    if (say) { cur.say = say[1].trim(); mode = null; continue; }

    const adds = /^\*\*Adds to review queue:\*\*\s*(.*)$/i.exec(line);
    if (adds) {
      cur.adds = splitAdds(adds[1]);
      mode = null;
      continue;
    }
    // An indented list line belongs to the task above it. Tested against the
    // raw line, not the trimmed one, because indentation is the only thing
    // separating a sub-item from a top-level task.
    const sub = /^\s{2,}(?:\d+[.)]|[-*])\s+(.+)$/.exec(raw);
    if (sub && mode && cur[mode].length) {
      cur[mode][cur[mode].length - 1].subs.push(sub[1].trim());
      continue;
    }

    // Any other bold label ends the current task list. Stops the Day 28
    // "Targets" checkboxes being read as phone tasks.
    if (/^\*\*/.test(line)) { mode = null; continue; }

    const task = /^-\s*\[[ xX]\]\s*(.*)$/.exec(line);
    if (task && mode) cur[mode].push({ text: task[1].trim(), subs: [] });
  }
  return days;
}

function splitAdds(s) {
  const t = s.trim();
  if (!t || /^nothing\b/i.test(t)) return [];
  return t.split('·').map((x) => x.replace(/\.$/, '').trim()).filter(Boolean);
}

// --- progress parsing ------------------------------------------------------
// D01 | 2026-08-01 | desk:Y phone:Y | conf:3 | note:
// D01 | 2026-08-01 | desk:Y phone:Y | conf:3 | done:2026-08-05 | note:
//
// The optional `done:` field is the date the work actually happened, written
// only when it is not the day's own date. That is the whole late-work record:
// second column = when it was scheduled, done = when it got done. Lines
// without it are days done on the day, and every pre-existing line still
// parses unchanged.
const LOG_RE = /^D(\d{2})\s*\|\s*([^|]*)\|\s*desk:(\S*)\s+phone:(\S*)\s*\|\s*conf:(\S*)\s*\|(?:\s*done:([^|]*)\|)?\s*note:(.*)$/;

// The fenced block under "## Log". Scoped deliberately: the Format section
// higher up the file contains a worked D01 example, and reading or rewriting
// that as if it were real data corrupts the documentation.
function logBlock(md) {
  const i = md.indexOf('## Log');
  if (i === -1) return null;
  const m = /```[^\n]*\n([\s\S]*?)```/.exec(md.slice(i));
  if (!m) return null;
  return { body: m[1], start: i + m.index, end: i + m.index + m[0].length };
}

function parseProgress(md) {
  const rows = {};
  const b = logBlock(md);
  for (const raw of (b ? b.body : md).split(/\r?\n/)) {
    const m = LOG_RE.exec(raw.trim());
    if (!m) continue;
    const conf = /^[1-5]$/.test(m[5]) ? +m[5] : null;
    const date = m[2].trim();
    const done = (m[6] || '').trim();
    const sd = toDate(date), dd = toDate(done);
    rows[+m[1]] = {
      day: +m[1],
      date,
      desk: m[3].toUpperCase(),
      phone: m[4].toUpperCase(),
      conf,
      done: done || null,
      lateBy: (sd && dd) ? Math.max(0, daysBetween(sd, dd)) : 0,
      note: m[7].trim(),
      // A row is logged only once it carries a date or a real mark. The blank
      // template rows for Sundays already read "desk:-", which is the plan
      // saying there is no desk block, not you saying you did it.
      logged: !!(date || /^[YNP]$/.test(m[3].toUpperCase()) || /^[YNP]$/.test(m[4].toUpperCase())),
    };
  }
  return rows;
}

// A day is done when both blocks are satisfied. "-" means the plan has no
// block there (Sundays have no desk block), which counts as satisfied.
const dayComplete = (r) => !!r && /^[Y-]$/.test(r.desk) && /^[Y-]$/.test(r.phone);
// Explicitly logged as not done. Written off on purpose, so it stops nagging.
const dayWrittenOff = (r) =>
  !!r && /^[N-]$/.test(r.desk) && /^[N-]$/.test(r.phone) && (r.desk === 'N' || r.phone === 'N');
// Started but not finished, or never logged at all. This is the backlog.
const dayOutstanding = (r) => !dayComplete(r) && !dayWrittenOff(r);

// The one place a log line is built. index.html mirrors it exactly.
function formatLogLine({ day, date, desk, phone, conf, done, note }) {
  const d = String(done || '').trim();
  const dt = String(date || '').trim();
  return `D${String(day).padStart(2, '0')} | ${dt}${dt ? ' ' : ''}| desk:${desk || ''} phone:${phone || ''}` +
    ` | conf:${conf || ''}` +
    (d && d !== date ? ` | done:${d}` : '') +
    ` | note:${note ? ' ' + note.trim() : ''}`;
}

function parkingLot(md) {
  const sec = /## Parking lot\s*([\s\S]*?)(?:\n---|\n## |$)/.exec(md);
  if (!sec) return [];
  return sec[1].split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^-\s+\S/.test(l))
    .map((l) => l.replace(/^-\s+/, ''));
}

// --- review queue ----------------------------------------------------------
// [1] due:2026-08-05 | prompt | 3
// last-conf may hold up to two scores, oldest first: "2,4"
const Q_RE = /^\[(\d+)\]\s*due:\s*([^|]*)\|([^|]*)\|(.*)$/;

function parseQueueLine(line) {
  const m = Q_RE.exec(line.trim());
  if (!m) return null;
  const hist = m[4].split(',').map((x) => x.trim()).filter((x) => /^[1-5]$/.test(x)).map(Number);
  return { interval: +m[1], due: m[2].trim(), prompt: m[3].trim(), hist };
}
function formatQueueLine(it) {
  return `[${it.interval}] due:${it.due} | ${it.prompt} | ${it.hist.join(',')}`;
}

// Splits review-queue.md into { head, queue[], mid, permanent[], tail } so we
// can rewrite the two fenced blocks and leave every word of prose untouched.
function readQueueFile() {
  const md = read(P.queue);
  const fences = [];
  const re = /```[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md))) fences.push({ start: m.index, end: re.lastIndex, body: m[1] });
  if (fences.length < 2) throw new Error('review-queue.md: expected two fenced blocks (Queue, Permanent)');
  const qf = fences[fences.length - 2];
  const pf = fences[fences.length - 1];
  const toItems = (body) => body.split(/\r?\n/).map(parseQueueLine).filter(Boolean);
  return {
    md,
    qf, pf,
    queue: toItems(qf.body),
    permanent: toItems(pf.body),
  };
}
function writeQueueFile(f, queue, permanent) {
  const block = (items) => '```\n' + items.map(formatQueueLine).join('\n') + '\n```';
  const out =
    f.md.slice(0, f.qf.start) + block(queue) +
    f.md.slice(f.qf.end, f.pf.start) + block(permanent) +
    f.md.slice(f.pf.end);
  write(P.queue, out);
}

// --- review log ------------------------------------------------------------
// tracking/review-log.md is the append-only record of every graded review:
//
//   2026-08-19 | 4 | the exact prompt
//
// It exists because the dashboard cannot write files. A grade tapped on the
// phone lives in localStorage until it is exported and synced, and this file is
// what "already synced" means - the dashboard diffs against it, so re-pasting
// the same export cannot advance an item twice.
const RL_RE = /^(\d{4}-\d{2}-\d{2})\s*\|\s*([1-5])\s*\|\s*(.+)$/;

function reviewLogBlock(md) {
  const i = md.indexOf('## Log');
  if (i === -1) return null;
  const m = /```[^\n]*\n([\s\S]*?)```/.exec(md.slice(i));
  if (!m) return null;
  return { body: m[1], start: i + m.index, end: i + m.index + m[0].length };
}

function parseReviewLog(md) {
  const b = reviewLogBlock(md);
  const out = [];
  for (const raw of (b ? b.body : '').split(/\r?\n/)) {
    const m = RL_RE.exec(raw.trim());
    if (m) out.push({ date: m[1], conf: +m[2], prompt: m[3].trim() });
  }
  return out;
}

// One review of one item on one date. Re-grading the same item on the same day
// is an edit, not a second review, so the key deliberately ignores the score.
const reviewKey = (date, prompt) => date + ' ' + normalise(prompt);

function appendReviewLog(entries) {
  const md = read(P.reviewLog);
  const b = reviewLogBlock(md);
  if (!b) throw new Error('review-log.md: no "## Log" fenced block');
  const seen = new Set(parseReviewLog(md).map((e) => reviewKey(e.date, e.prompt)));
  const fresh = entries.filter((e) => {
    const k = reviewKey(e.date, e.prompt);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (!fresh.length) return 0;
  const lines = fresh
    .sort((a, b2) => (a.date < b2.date ? -1 : a.date > b2.date ? 1 : 0))
    .map((e) => e.date + ' | ' + e.conf + ' | ' + e.prompt);
  const body = (b.body.replace(/\s*$/, '') + '\n' + lines.join('\n') + '\n').replace(/^\n+/, '');
  write(P.reviewLog, md.slice(0, b.start) + '```\n' + body + '```' + md.slice(b.end));
  return fresh.length;
}

// Apply one graded review to a queue item, exactly as weekly-review.js would:
// 4-5 advances, 3 repeats, 1-2 drops back, and the next due date counts from
// the day the review actually happened rather than from today.
function applyReview(item, conf, date, permanent) {
  const before = item.interval;
  if (permanent) item.interval = 30;
  else if (conf >= 4) item.interval = nextInterval(before);
  else if (conf === 3) item.interval = before;
  else item.interval = prevInterval(before);
  const base = toDate(date) || today();
  item.due = iso(addDays(base, item.interval));
  item.hist = [...item.hist, conf].slice(-2);
  return { prompt: item.prompt, conf, from: before, to: item.interval, due: item.due };
}

// --- working notes ---------------------------------------------------------
// tracking/notes.md is everything typed under a task while the work was being
// done. Structure is deliberately plain markdown, because he reads it:
//
//   ## 2026-08-20
//
//   #### D08 desk 2.3
//   the note, as many lines as it needs
//
// Keyed on date + context, one note per task per day. Re-exporting an edited
// note replaces the body rather than appending a second copy, so fixing a typo
// on the phone does not litter the file.
function parseNotes(md) {
  const out = {};
  let date = null, ctx = null, entries = null, cur = null;
  const closeEntry = () => {
    if (cur) { cur.text = cur.text.join('\n').replace(/^\s+|\s+$/g, ''); entries.push(cur); }
    cur = null;
  };
  const flush = () => {
    closeEntry();
    if (date && ctx) out[date + ' ' + normalise(ctx)] = { date, context: ctx, entries };
    ctx = null; entries = null;
  };
  for (const line of String(md).split(/\r?\n/)) {
    const d = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/.exec(line);
    if (d) { flush(); date = d[1]; continue; }
    const c = /^####\s+(.+?)\s*$/.exec(line);
    if (c) { flush(); ctx = c[1]; entries = []; continue; }
    if (!ctx) continue;
    const e = /^\*\*(\d{2}:\d{2})\*\*\s+—\s+([\s\S]*)$/.exec(line);
    if (e) { closeEntry(); cur = { time: e[1], text: [e[2]] }; continue; }
    if (cur) cur.text.push(line);
    else if (line.trim()) { cur = { time: '', text: [line] }; }   // pre-timestamp notes
  }
  flush();
  return out;
}

const noteKey = (date, context) => date + ' ' + normalise(context);

// One entry per line typed, each stamped with the time it was logged. He asked
// for this directly: "make it so the notes I can enter and log them ... so you
// know exactly when I did them without having to ask." An entry is identified by
// its time within a context, so re-exporting edits rather than duplicating.
function renderNote(n) {
  return n.entries
    .slice()
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    .map((e) => (e.time ? `**${e.time}** — ${e.text}` : e.text))
    .join('\n\n');
}

function writeNotes(entries) {
  const md = read(P.notes);
  const cut = md.indexOf('\n---\n');
  if (cut === -1) throw new Error('notes.md: no "---" separator after the preamble');
  const head = md.slice(0, cut + 5);
  const existing = parseNotes(md.slice(cut + 5));

  let changed = 0;
  for (const e of entries) {
    const text = String(e.text || '').replace(/\s+$/, '');
    if (!text) continue;
    const k = noteKey(e.date, e.context);
    const bucket = (existing[k] ||= { date: e.date, context: e.context, entries: [] });
    const time = e.time || '';
    const hit = bucket.entries.find((x) => x.time === time);
    if (hit) {
      if (hit.text === text) continue;
      hit.text = text;
    } else {
      bucket.entries.push({ time, text });
    }
    changed++;
  }
  if (!changed) return 0;

  const byDate = {};
  for (const n of Object.values(existing)) (byDate[n.date] ||= []).push(n);

  let body = '';
  for (const date of Object.keys(byDate).sort()) {
    body += '\n## ' + date + '\n';
    for (const n of byDate[date].sort((a, b) => a.context.localeCompare(b.context))) {
      body += '\n#### ' + n.context + '\n\n' + renderNote(n) + '\n';
    }
  }
  write(P.notes, head + body);
  return changed;
}

// --- time log --------------------------------------------------------------
// tracking/time-log.md, one line per task per day:
//
//   2026-08-20 | D08 desk 2 | 612 | 14:20-14:31 | budget:10
//
// Seconds are what the stopwatch measured, budget is the minutes the plan asked
// for. Both are kept because the interesting number is the ratio, and the plan
// gets rewritten every month.
const T_RE = /^(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*([^|]*?)\s*\|\s*budget:(\d*)\s*$/;

function timeLogBlock(md) {
  const i = md.indexOf('## Log');
  if (i === -1) return null;
  const m = /```[^\n]*\n([\s\S]*?)```/.exec(md.slice(i));
  if (!m) return null;
  return { body: m[1], start: i + m.index, end: i + m.index + m[0].length };
}

function parseTimeLog(md) {
  const out = {};
  const b = timeLogBlock(md);
  for (const raw of (b ? b.body : '').split(/\r?\n/)) {
    const m = T_RE.exec(raw.trim());
    if (!m) continue;
    out[m[1] + ' ' + normalise(m[2])] = {
      date: m[1], context: m[2].trim(), seconds: +m[3],
      span: m[4].trim(), budget: m[5] ? +m[5] : null,
    };
  }
  return out;
}

// Latest reading wins: a task worked on twice in a day reports its running
// total, not two rows that have to be added up later.
function writeTimeLog(rows) {
  const md = read(P.timeLog);
  const b = timeLogBlock(md);
  if (!b) throw new Error('time-log.md: no "## Log" fenced block');
  const existing = parseTimeLog(md);

  let changed = 0;
  for (const r of rows) {
    const k = r.date + ' ' + normalise(r.context);
    const prev = existing[k];
    if (prev && prev.seconds === r.seconds && prev.span === r.span) continue;
    existing[k] = r;
    changed++;
  }
  if (!changed) return 0;

  const lines = Object.values(existing)
    .sort((a, c) => (a.date === c.date ? a.context.localeCompare(c.context) : a.date < c.date ? -1 : 1))
    .map((r) => `${r.date} | ${r.context} | ${r.seconds} | ${r.span} | budget:${r.budget == null ? '' : r.budget}`);
  write(P.timeLog, md.slice(0, b.start) + '```\n' + lines.join('\n') + '\n```' + md.slice(b.end));
  return changed;
}


// --- review cards ----------------------------------------------------------
// tracking/review-cards.md holds the flash-card back of every queue item:
//
//   ### <the prompt, copied exactly>
//   **From:** where this came from, so he can place it
//   **Hint:** a nudge, not the answer
//   **Answer:**
//   ...markdown, as many lines as it needs...
//
// Kept in its own file on purpose. seed-queue, weekly-review and catch-up all
// rewrite the fenced blocks in review-queue.md, and anything living inside
// those blocks would be destroyed on the next rewrite.
//
// Keyed on the normalised prompt so an edit to punctuation or casing does not
// silently orphan a card. A prompt with no card still reviews — it just has no
// back — which is the safe direction to fail in.
function parseCards(md) {
  const out = {};
  const parts = String(md || '').split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const prompt = (nl === -1 ? part : part.slice(0, nl)).trim();
    let body = nl === -1 ? '' : part.slice(nl + 1);
    // A `## ` section heading ends the card. Without this the section title
    // below a card gets swallowed into that card's answer.
    const cut = body.search(/^##\s/m);
    if (cut !== -1) body = body.slice(0, cut);
    if (!prompt) continue;
    const from = /^\*\*From:\*\*\s*(.*)$/m.exec(body);
    const hint = /^\*\*Hint:\*\*\s*(.*)$/m.exec(body);
    const ai = body.search(/^\*\*Answer:\*\*\s*$/m);
    let answer = '';
    if (ai !== -1) answer = body.slice(ai).replace(/^\*\*Answer:\*\*\s*\n?/, '').trim();
    out[normalise(prompt)] = {
      prompt,
      from: from ? from[1].trim() : '',
      hint: hint ? hint[1].trim() : '',
      answer,
    };
  }
  return out;
}

const INTERVALS = [1, 3, 7, 14, 30];
function nextInterval(i) { const k = INTERVALS.indexOf(i); return INTERVALS[Math.min(k + 1, INTERVALS.length - 1)]; }
function prevInterval(i) { const k = INTERVALS.indexOf(i); return INTERVALS[Math.max(k - 1, 0)]; }

// Keep any one day's review block under the cap by promoting the strongest
// items to a longer interval, never by letting the block grow. Repeated passes,
// because a promoted item can overflow the day it lands on. Items without a
// real due date (held back, see catch-up.js) are not scheduled, so they are
// not counted against any day.
function capDailyLoad(queue, cap = 8) {
  const promoted = [];
  const score = (i) => (i.hist.length ? i.hist[i.hist.length - 1] : 3);
  for (let pass = 0; pass < 12; pass++) {
    const byDate = {};
    for (const i of queue) if (toDate(i.due)) (byDate[i.due] ||= []).push(i);
    let changed = false;
    for (const date of Object.keys(byDate).sort()) {
      const bucket = byDate[date];
      if (bucket.length <= cap) continue;
      bucket.sort((a, b) => score(b) - score(a));       // strongest move first
      for (const it of bucket.slice(0, bucket.length - cap)) {
        const before = it.interval;
        it.interval = nextInterval(before);
        it.due = iso(addDays(toDate(date), it.interval));
        promoted.push({ prompt: it.prompt, from: before, to: it.interval });
        changed = true;
      }
    }
    if (!changed) break;
  }
  return promoted;
}

// Sorted by due date, with held items last. Keeps the file readable.
function sortQueue(queue) {
  return queue.sort((a, b) => {
    const ad = toDate(a.due), bd = toDate(b.due);
    if (!ad && !bd) return 0;
    if (!ad) return 1;
    if (!bd) return -1;
    return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
  });
}

// --- applications ----------------------------------------------------------
function countApplications(md) {
  const sec = /## Applications\s*([\s\S]*?)(?:\n---|$)/.exec(md);
  if (!sec) return 0;
  let n = 0;
  for (const line of sec[1].split(/\r?\n/)) {
    if (!/^\|/.test(line.trim())) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    if (/^-+$/.test(cells[0]) || /^#$/.test(cells[0])) continue;
    if (cells[2]) n++; // company column filled
  }
  return n;
}

// --- misc ------------------------------------------------------------------
const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

module.exports = {
  P, read, write, toDate, iso, addDays, today, daysBetween,
  getStartDate, getCeilings, buildSchedule, dayNumberFor, blockDate, CONSOLIDATION,
  parsePlan, splitAdds, parseProgress, parkingLot, logBlock, formatLogLine,
  dayComplete, dayWrittenOff, dayOutstanding,
  readQueueFile, writeQueueFile, parseQueueLine, formatQueueLine, parseCards,
  reviewLogBlock, parseReviewLog, appendReviewLog, reviewKey, applyReview,
  parseNotes, writeNotes, noteKey, renderNote,
  timeLogBlock, parseTimeLog, writeTimeLog,
  INTERVALS, nextInterval, prevInterval, capDailyLoad, sortQueue,
  countApplications, normalise,
};
