'use strict';
// Takes log lines copied out of the dashboard and writes them into
// tracking/progress.md. Existing lines for the same day are replaced, not
// duplicated. Lines starting with "- " go to the parking lot.
//
//   node scripts/sync-progress.js paste.txt
//   node scripts/sync-progress.js            (then paste, then Ctrl+Z / Ctrl+D)
//
// Accepted input, one per line:
//   D01 | 2026-08-03 | desk:Y phone:Y | conf:3 | note:
//   D01 | 2026-08-03 | desk:Y phone:Y | conf:3 | done:2026-08-05 | note:
//   R | 2026-08-03 | 4 | the review prompt you graded
//   N | 2026-08-03 14:32 | D08 desk 2.3 | what you typed under that task
//   T | 2026-08-03 | D08 desk 2.3 | 612 | 14:20-14:31 | budget:10
//   - tangent I parked
//
// An `R` line is one graded review card. It reschedules that item in
// tracking/review-queue.md from the date you actually reviewed it, and records
// the score in tracking/review-log.md. Lines already in that log are skipped,
// so pasting the same export twice cannot advance an item twice.
//
// An `N` line is a working note, filed under the task it was typed against in
// tracking/notes.md, stamped with the time it was logged. Line breaks travel as
// the pilcrow character, because the export has to survive being one line in a
// clipboard.
//
// A `T` line is a stopwatch reading, carrying the running total for that task on
// that day against the minutes the plan asked for. Latest reading wins.
//
// The optional `done:` field marks work finished after the day it was set for.
// It is written by the dashboard when you backfill a day, and it is what the
// weekly review reads to tell a backfill apart from a miss.

const fs = require('fs');
const L = require('./lib');

const LOG_RE = /^D(\d{2})\s*\|.*\|\s*desk:\S*\s+phone:\S*\s*\|\s*conf:\S*\s*\|.*note:/;
const REV_RE = /^R\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([1-5])\s*\|\s*(.+)$/;
const NOTE_RE = /^N\s*\|\s*(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?\s*\|\s*([^|]+?)\s*\|\s*([\s\S]+)$/;
const TIME_RE = /^T\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*([^|]*?)\s*\|\s*budget:(\d*)\s*$/;

function apply(input) {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const logs = new Map();
  const revs = [];
  const notes = [];
  const times = [];
  let parks = [];

  for (const line of lines) {
    const m = LOG_RE.exec(line);
    if (m) { logs.set(+m[1], line); continue; }
    const r = REV_RE.exec(line);
    if (r) { revs.push({ date: r[1], conf: +r[2], prompt: r[3].trim() }); continue; }
    const n = NOTE_RE.exec(line);
    if (n) {
      notes.push({
        date: n[1], time: n[2] || '', context: n[3].trim(),
        text: n[4].split('\u00b6').join('\n').trim(),
      });
      continue;
    }
    const tm = TIME_RE.exec(line);
    if (tm) {
      times.push({
        date: tm[1], context: tm[2].trim(), seconds: +tm[3],
        span: tm[4].trim(), budget: tm[5] ? +tm[5] : null,
      });
      continue;
    }
    if (/^-\s+\S/.test(line)) { parks.push(line.replace(/^-\s+/, '')); continue; }
    console.log(`Ignored (not a log line): ${line}`);
  }

  if (!logs.size && !parks.length && !revs.length && !notes.length && !times.length) {
    console.log('Nothing to sync.');
    return;
  }

  let md = L.read(L.P.progress);
  let replaced = 0;

  // Only touch the fenced block under "## Log". The Format section above it
  // contains a worked D01 example that must not be rewritten.
  const b = L.logBlock(md);
  if (!b) {
    console.log('No "## Log" code block found in tracking/progress.md. Nothing written.');
    return;
  }
  let body = b.body;
  for (const [day, line] of logs) {
    const key = `D${String(day).padStart(2, '0')}`;
    const re = new RegExp(`^${key}\\s*\\|.*$`, 'm');
    if (re.test(body)) { body = body.replace(re, line); replaced++; }
    else console.log(`No ${key} row in the log block, skipped.`);
  }
  md = md.slice(0, b.start) + '```\n' + body + '```' + md.slice(b.end);

  // Re-running the same paste must not duplicate anything.
  const already = new Set(L.parkingLot(md).map(L.normalise));
  const dupes = parks.length;
  parks = parks.filter((p) => !already.has(L.normalise(p)));
  if (dupes - parks.length) console.log(`${dupes - parks.length} parking item(s) already logged, skipped.`);

  if (parks.length) {
    // Append under "## Parking lot", replacing the empty "- " placeholder.
    const idx = md.indexOf('## Parking lot');
    if (idx === -1) {
      console.log('No parking lot section found, parked items not written.');
    } else {
      const after = md.indexOf('\n---', idx);
      const end = after === -1 ? md.length : after;
      // Drop the empty "- " placeholder if it is still there, then append.
      let body = md.slice(idx, end).replace(/\n-[ \t]*(?=\n|$)/g, '');
      const existing = /\n-\s+\S/.test(body);
      body = body.replace(/\s*$/, '') + (existing ? '\n' : '\n\n') +
             parks.map((p) => `- ${p}`).join('\n') + '\n';
      md = md.slice(0, idx) + body + md.slice(end);
    }
  }

  L.write(L.P.progress, md);
  console.log(`Wrote ${replaced} log line(s) and ${parks.length} parking lot item(s) to tracking/progress.md.`);

  if (notes.length) {
    const n = L.writeNotes(notes);
    console.log(n
      ? `Wrote ${n} working note(s) to tracking/notes.md${n < notes.length ? ` (${notes.length - n} unchanged)` : ''}.`
      : `${notes.length} working note(s) already in tracking/notes.md, unchanged.`);
  }

  if (times.length) {
    const n = L.writeTimeLog(times);
    console.log(n
      ? `Wrote ${n} stopwatch reading(s) to tracking/time-log.md.`
      : `${times.length} stopwatch reading(s) already current in tracking/time-log.md.`);
    reportTime(times);
  }

  if (revs.length) applyReviews(revs);

  const rows = L.parseProgress(md);
  const done = Object.values(rows).filter((r) => /^[YP]$/.test(r.desk) || /^[YP]$/.test(r.phone)).length;
  console.log(`${done} of 28 days now have activity logged.`);

  const late = Object.values(rows).filter((r) => r.lateBy > 0).sort((a, b) => a.day - b.day);
  if (late.length) {
    console.log(`${late.length} day(s) recorded as done late:`);
    for (const r of late) {
      console.log(`  D${String(r.day).padStart(2, '0')} scheduled ${r.date}, done ${r.done} (+${r.lateBy}d)`);
    }
    console.log('Run node scripts/catch-up.js --reflow so the review queue follows the work.');
  }
}

// Graded review cards. Each one reschedules its queue item from the date it was
// actually reviewed, not from today - a card you got right on Tuesday is due
// three days after Tuesday, however long the export sat on your phone.
//
// Oldest first, because two grades of the same item in one paste have to
// compound in the order they happened.
function applyReviews(revs) {
  const f = L.readQueueFile();
  const index = new Map();
  for (const it of f.queue) index.set(L.normalise(it.prompt), { item: it, permanent: false });
  for (const it of f.permanent) index.set(L.normalise(it.prompt), { item: it, permanent: true });

  const done = new Set(
    L.parseReviewLog(L.read(L.P.reviewLog)).map((e) => L.reviewKey(e.date, e.prompt)));

  const applied = [], skipped = [], unknown = [];
  for (const r of revs.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))) {
    const key = L.reviewKey(r.date, r.prompt);
    if (done.has(key)) { skipped.push(r); continue; }
    const hit = index.get(L.normalise(r.prompt));
    if (!hit) { unknown.push(r); continue; }
    done.add(key);
    const rec = L.applyReview(hit.item, r.conf, r.date, hit.permanent);
    applied.push({ ...rec, date: r.date });
  }

  if (applied.length) {
    const promoted = L.capDailyLoad(f.queue, 8);
    L.sortQueue(f.queue);
    L.writeQueueFile(f, f.queue, f.permanent);
    L.appendReviewLog(applied.map((a) => ({ date: a.date, conf: a.conf, prompt: a.prompt })));

    const up = applied.filter((a) => a.conf >= 4).length;
    const same = applied.filter((a) => a.conf === 3).length;
    const back = applied.filter((a) => a.conf <= 2).length;
    console.log('');
    console.log(`${applied.length} review(s) applied: ${up} advanced, ${same} repeating, ${back} dropped back.`);
    for (const a of applied) {
      const arrow = a.from === a.to ? `${a.from}d` : `${a.from}d -> ${a.to}d`;
      console.log(`  ${a.conf}  ${arrow.padEnd(12)} next ${a.due}  ${a.prompt}`);
    }
    if (promoted.length) {
      console.log(`${promoted.length} item(s) promoted to protect the 8-a-day cap.`);
    }
  }
  if (skipped.length) console.log(`${skipped.length} review(s) already in tracking/review-log.md, skipped.`);
  if (unknown.length) {
    console.log('');
    console.log(`${unknown.length} graded review(s) match no queue item. Nothing was written for these:`);
    for (const r of unknown) console.log(`  ${r.date} | ${r.conf} | ${r.prompt}`);
    console.log('That usually means the prompt was edited after you graded it. Tell Claude Code.');
  }
  if (applied.length) {
    try { require('./build-snapshot.js').run(true); console.log('Offline snapshot refreshed in index.html and week.html.'); }
    catch (e) { console.log('Snapshot refresh skipped: ' + e.message); }
  }
}

// Say what the timings mean while he is still looking at the terminal. A number
// in a file he has to go and read is a number he will not read.
function reportTime(times) {
  const withBudget = times.filter((t) => t.budget);
  if (!withBudget.length) return;
  const spent = withBudget.reduce((a, t) => a + t.seconds, 0) / 60;
  const planned = withBudget.reduce((a, t) => a + t.budget, 0);
  const pct = Math.round((spent / planned) * 100);
  console.log(`  ${Math.round(spent)} min against a ${planned} min budget (${pct}%).`);
  const over = withBudget
    .filter((t) => t.seconds / 60 > t.budget * 1.5)
    .sort((a, b) => b.seconds - a.seconds);
  for (const t of over.slice(0, 3)) {
    console.log(`  ${Math.round(t.seconds / 60)} min on a ${t.budget} min task: ${t.context}`);
  }
  if (over.length) {
    console.log('  Consistently over on the same kind of task means the estimate is wrong.');
  }
}

const file = process.argv[2];
if (file) {
  apply(fs.readFileSync(file, 'utf8'));
} else {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { buf += d; });
  process.stdin.on('end', () => apply(buf));
}
