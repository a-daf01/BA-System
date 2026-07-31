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
  apps: path.join(ROOT, 'tracking', 'applications.md'),
  month1: path.join(ROOT, 'plan', 'month-01.md'),
  month2: path.join(ROOT, 'plan', 'month-02.md'),
  template: path.join(ROOT, 'plan', 'day-template.md'),
  index: path.join(ROOT, 'index.html'),
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
      cur = { block: +head[1], title: head[2].trim(), theme: '', desk: [], phone: [], say: '', adds: [] };
      days.push(cur);
      mode = null;
      continue;
    }
    if (!cur) continue;

    if (/^\*\*DESK/i.test(line)) { mode = 'desk'; continue; }
    if (/^\*\*PHONE/i.test(line)) { mode = 'phone'; continue; }

    const theme = /^\*\*Theme:\*\*\s*(.*)$/i.exec(line);
    if (theme) { cur.theme = theme[1].trim(); mode = null; continue; }

    const say = /^\*\*Say It Out Loud:\*\*\s*(.*)$/i.exec(line);
    if (say) { cur.say = say[1].trim(); mode = null; continue; }

    const adds = /^\*\*Adds to review queue:\*\*\s*(.*)$/i.exec(line);
    if (adds) {
      cur.adds = splitAdds(adds[1]);
      mode = null;
      continue;
    }
    // Any other bold label ends the current task list. Stops the Day 28
    // "Targets" checkboxes being read as phone tasks.
    if (/^\*\*/.test(line)) { mode = null; continue; }

    const task = /^-\s*\[[ xX]\]\s*(.*)$/.exec(line);
    if (task && mode) cur[mode].push(task[1].trim());
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
const LOG_RE = /^D(\d{2})\s*\|\s*([^|]*)\|\s*desk:(\S*)\s+phone:(\S*)\s*\|\s*conf:(\S*)\s*\|\s*note:(.*)$/;

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
    rows[+m[1]] = {
      day: +m[1],
      date: m[2].trim(),
      desk: m[3].toUpperCase(),
      phone: m[4].toUpperCase(),
      conf,
      note: m[6].trim(),
      logged: !!(m[2].trim() || m[3] || m[4]),
    };
  }
  return rows;
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

const INTERVALS = [1, 3, 7, 14, 30];
function nextInterval(i) { const k = INTERVALS.indexOf(i); return INTERVALS[Math.min(k + 1, INTERVALS.length - 1)]; }
function prevInterval(i) { const k = INTERVALS.indexOf(i); return INTERVALS[Math.max(k - 1, 0)]; }

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
  getStartDate, buildSchedule, dayNumberFor, blockDate, CONSOLIDATION,
  parsePlan, splitAdds, parseProgress, parkingLot, logBlock,
  readQueueFile, writeQueueFile, parseQueueLine, formatQueueLine,
  INTERVALS, nextInterval, prevInterval,
  countApplications, normalise,
};
