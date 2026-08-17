'use strict';
// Health check for the whole system. Catches the failures that have actually
// happened here, before they cost a day.
//
//   node scripts/check.js            everything
//   node scripts/check.js --tomorrow just tomorrow's block, for the end-of-day digest
//
// Exits 1 if anything FAILs, so it can gate a commit.

const fs = require('fs');
const path = require('path');
const L = require('./lib');

const ROOT = path.join(__dirname, '..');
const onlyTomorrow = process.argv.includes('--tomorrow');

let fails = 0, warns = 0;
const fail = (m) => { fails++; console.log('  FAIL  ' + m); };
const warn = (m) => { warns++; console.log('  warn  ' + m); };
const ok = (m) => console.log('  ok    ' + m);

function section(title) { console.log('\n' + title); console.log('-'.repeat(title.length)); }

const start = L.getStartDate();
const schedule = L.buildSchedule(start);
const plan = L.parsePlan(L.read(L.P.month1));
const planByBlock = Object.fromEntries(plan.map((d) => [d.block, d]));
const todayNo = Math.min(28, Math.max(1, L.dayNumberFor(start, L.today())));

// Which plan blocks to check. --tomorrow narrows it to the next day's block.
let blocks = plan.map((d) => d.block);
if (onlyTomorrow) {
  const entry = schedule[Math.min(27, todayNo)];      // tomorrow, 0-indexed
  if (!entry) { console.log('Month 1 is finished. Nothing to check.'); process.exit(0); }
  blocks = [entry.block];
  console.log(`Checking tomorrow: Day ${String(entry.day).padStart(2, '0')} (${L.iso(entry.date)}), plan block ${entry.block}.`);
}

// --- 1. every day is specified ---------------------------------------------
section('Day structure');
const VAGUE = /\b(practice|explore|look at|get familiar|play (?:around )?with|revise|study|work on)\b/i;
for (const b of blocks) {
  const d = planByBlock[b];
  if (!d) { fail(`plan block ${b} is missing entirely`); continue; }
  const tag = `Day ${String(b).padStart(2, '0')}`;

  const mins = (list) => list.reduce((a, t) => {
    const m = /^(\d+)\s*min/.exec(t.text); return a + (m ? +m[1] : 0);
  }, 0);
  const desk = mins(d.desk), phone = mins(d.phone);

  if (desk > 75) fail(`${tag}: desk block is ${desk} min, over the 75 min ceiling`);
  if (desk > 0 && phone > 30) fail(`${tag}: phone block is ${phone} min, over the 30 min ceiling`);
  if (!d.say) fail(`${tag}: no Say It Out Loud line`);
  if (desk > 0 && !d.desk.length) fail(`${tag}: desk block has no tasks`);
  if (!d.phone.length) fail(`${tag}: phone block has no tasks`);

  for (const t of d.desk.concat(d.phone)) {
    if (VAGUE.test(t.text) && !/\d/.test(t.text)) {
      warn(`${tag}: task reads as vague — "${t.text.slice(0, 60)}"`);
    }
  }
}
if (!fails) ok(`${blocks.length} block(s) within time limits, all with a Say It Out Loud line`);

// --- 2. the Open: file exists and is not empty ------------------------------
section('Workspace files');
for (const b of blocks) {
  const d = planByBlock[b];
  if (!d || !d.open) continue;
  const tag = `Day ${String(b).padStart(2, '0')}`;
  const refs = d.open.match(/`([^`]+)`/g) || [];
  if (!refs.length) { warn(`${tag}: Open: line names no file in backticks`); continue; }
  for (const r of refs) {
    const rel = r.replace(/`/g, '').trim();
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) fail(`${tag}: Open: names ${rel}, which does not exist`);
    else if (fs.statSync(full).size < 200) fail(`${tag}: ${rel} exists but is essentially empty`);
    else ok(`${tag}: ${rel}`);
  }
}

// --- 3. review queue is answerable -----------------------------------------
section('Review queue');
const qf = L.readQueueFile();
const all = qf.queue.concat(qf.permanent);
for (const item of all) {
  const words = item.prompt.split(/\s+/).filter(Boolean).length;
  if (words < 5) fail(`stub prompt, not a question: "${item.prompt}"`);
  else if (/\b(query|day)\s+\d+\b/i.test(item.prompt) && !/\bYour\b/i.test(item.prompt)) {
    warn(`prompt refers to something by number, may not be self-contained: "${item.prompt.slice(0, 70)}"`);
  }
}
const byDate = {};
for (const q of qf.queue) if (L.toDate(q.due)) (byDate[q.due] ||= []).push(q);
const over = Object.entries(byDate).filter(([, v]) => v.length > 8);
for (const [date, v] of over) fail(`${date} has ${v.length} review items, over the 8 cap`);
if (!over.length) {
  const busiest = Object.entries(byDate).sort((a, b) => b[1].length - a[1].length)[0];
  ok(`${qf.queue.length} items, ${qf.permanent.length} permanent, heaviest day ${busiest ? busiest[0] + ' with ' + busiest[1].length : 'n/a'}`);
}

// Every item needs a card, or it is a question with no back to it. He asked for
// this directly: reading a prompt he cannot place, with no answer attached, is
// what made the block skippable.
const cards = fs.existsSync(L.P.cards) ? L.parseCards(L.read(L.P.cards)) : {};
const missing = all.filter((q) => !cards[L.normalise(q.prompt)]);
const thin = all.filter((q) => {
  const c = cards[L.normalise(q.prompt)];
  return c && (!c.answer || !c.hint);
});
if (!fs.existsSync(L.P.cards)) fail('tracking/review-cards.md is missing entirely');
else if (missing.length) {
  for (const q of missing.slice(0, 8)) fail(`no card for: "${q.prompt.slice(0, 64)}"`);
  if (missing.length > 8) fail(`...and ${missing.length - 8} more items with no card`);
} else if (thin.length) {
  for (const q of thin.slice(0, 8)) fail(`card has no hint or no answer: "${q.prompt.slice(0, 55)}"`);
} else {
  ok(`${all.length} items, all with a From, a Hint and an Answer`);
}
const orphans = Object.values(cards)
  .filter((c) => !all.some((q) => L.normalise(q.prompt) === L.normalise(c.prompt)));
if (orphans.length) warn(`${orphans.length} card(s) match no queue item — a prompt was probably edited`);

// Permanent items must not come due before the work that produces them exists.
const lastDay = L.iso(schedule[27].date);
for (const p of qf.permanent) {
  if (p.due && p.due < lastDay) {
    fail(`permanent item due ${p.due}, before Day 28 (${lastDay}): "${p.prompt.slice(0, 50)}"`);
  }
}

// --- 4. the dataset can actually answer the questions -----------------------
section('Dataset');
const db = path.join(ROOT, 'data', 'northwind.db');
if (!fs.existsSync(db)) {
  warn('data/northwind.db not found. It is gitignored, so this is expected on a fresh clone.');
} else {
  ok('data/northwind.db present');
  const csv = path.join(ROOT, 'data', 'csv');
  if (!fs.existsSync(csv)) warn('data/csv missing — run `python scripts/export-csv.py` before Day 13');
  else ok(`data/csv present (${fs.readdirSync(csv).length} files) — Power BI can read it`);
}

// --- 5. answer keys ---------------------------------------------------------
section('Answer keys');
const ansDir = path.join(ROOT, 'reference', 'answers');
if (!fs.existsSync(ansDir)) warn('reference/answers/ missing');
else {
  for (const f of fs.readdirSync(ansDir)) {
    const body = fs.readFileSync(path.join(ansDir, f), 'utf8');
    if (!/OPEN ME SECOND/i.test(body)) fail(`${f} does not carry the "open me second" warning`);
    else ok(f);
  }
}

// --- report -----------------------------------------------------------------
console.log('\n' + '='.repeat(52));
if (fails) {
  console.log(`${fails} failure(s), ${warns} warning(s). Fix the failures before he hits them.`);
  process.exit(1);
}
console.log(`No failures. ${warns} warning(s).`);
console.log(onlyTomorrow ? 'Tomorrow is ready.' : 'System is consistent.');
