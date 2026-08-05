'use strict';
// Missed days. What is still open, what to do about it, and how to keep the
// review queue honest when work happens later than it was scheduled.
//
//   node scripts/catch-up.js                 what is outstanding, and the next move
//   node scripts/catch-up.js --log-misses    write elapsed unlogged days as misses
//   node scripts/catch-up.js --reflow        re-date review items to follow the work
//   node scripts/catch-up.js --restart-today move Day 1 to today and reseed
//
// The rule behind all of it: a day you did late still counts as done. A day
// you never did is a miss, and a logged miss is worth more than a blank row.
// What must not happen is material coming due for review before you have met
// it — that is the one failure this system exists to prevent, and it is what
// --reflow fixes.

const L = require('./lib');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);

const pad = (n) => String(n).padStart(2, '0');
const D = (n) => 'D' + pad(n);

function load() {
  const start = L.getStartDate();
  const schedule = L.buildSchedule(start);
  const now = L.today();
  const progressMd = L.read(L.P.progress);
  const rows = L.parseProgress(progressMd);
  const plan = L.parsePlan(L.read(L.P.month1));
  const planByBlock = Object.fromEntries(plan.map((d) => [d.block, d]));
  return { start, schedule, now, progressMd, rows, plan, planByBlock };
}

// Elapsed days, split by what they need.
function survey(s) {
  const elapsed = s.schedule.filter((e) => e.date < s.now);
  const openDays = [], unlogged = [], late = [], writtenOff = [];
  for (const e of elapsed) {
    const r = s.rows[e.day];
    if (!r || !r.logged) unlogged.push(e);
    if (r && r.lateBy > 0) late.push({ entry: e, row: r });
    if (L.dayWrittenOff(r)) writtenOff.push(e);
    else if (L.dayOutstanding(r)) openDays.push(e);
  }
  return { elapsed, openDays, unlogged, late, writtenOff };
}

// --- status ----------------------------------------------------------------

function status(s) {
  const v = survey(s);
  const todayN = L.dayNumberFor(s.start, s.now);
  const f = L.readQueueFile();
  const overdue = f.queue.filter((i) => L.toDate(i.due) && i.due < L.iso(s.now));
  const held = f.queue.filter((i) => !L.toDate(i.due));

  console.log('');
  console.log(`Day 1 was ${L.iso(s.start)}. Today is ${L.iso(s.now)}, ` +
    (todayN < 1 ? 'before Day 1.' : todayN > 28 ? 'past Day 28.' : `Day ${pad(todayN)} of 28.`));
  console.log('='.repeat(64));
  console.log('');

  if (!v.elapsed.length) {
    console.log('No days have elapsed yet. Nothing to catch up on.');
    console.log('');
    return;
  }

  console.log(`Elapsed days: ${v.elapsed.length}.  Done or written off: ${v.elapsed.length - v.openDays.length}.  Still open: ${v.openDays.length}.`);
  if (v.late.length) console.log(`Already backfilled: ${v.late.length} day(s), logged with the date you actually did them.`);
  console.log('');

  if (v.openDays.length) {
    console.log('STILL OPEN');
    for (const e of v.openDays) {
      const r = s.rows[e.day];
      const day = s.planByBlock[e.block];
      const behind = L.daysBetween(e.date, s.now);
      const state = !r || !r.logged ? 'never logged' : `partial (desk:${r.desk || '-'} phone:${r.phone || '-'})`;
      console.log(`  ${D(e.day)}  ${L.iso(e.date)}  ${behind}d ago  ${state}`);
      console.log(`        ${(day && day.title) || 'plan block ' + e.block}`);
    }
    console.log('');
  }

  if (overdue.length) {
    console.log(`REVIEW QUEUE: ${overdue.length} item(s) overdue, oldest ${overdue.map((i) => i.due).sort()[0]}.`);
    if (v.openDays.length) {
      console.log('  Some of those belong to days you have not done yet, so they are asking you to');
      console.log('  recall material you have not met. Run --reflow to hold those back.');
    }
    console.log('');
  }
  if (held.length) {
    console.log(`${held.length} item(s) currently held, waiting on the day that introduces them.`);
    console.log('');
  }

  console.log('WHAT TO DO');
  if (!v.openDays.length) {
    console.log('  Nothing outstanding. Do today and stop reading this.');
  } else if (v.openDays.length === v.elapsed.length && v.elapsed.length >= 2) {
    console.log('  Every elapsed day is open, which means you have not actually started.');
    console.log('  Do not backfill a run you never began. Move Day 1 to today:');
    console.log('');
    console.log('      node scripts/catch-up.js --restart-today');
    console.log('');
    console.log('  Then open the dashboard and do Day 1. Nothing is behind after that.');
  } else if (v.openDays.length <= 2) {
    console.log('  Open the dashboard, tap the arrow to go back to the day, do it, tick it.');
    console.log('  It logs with the date you actually did it, and the weekly review counts');
    console.log('  it as a backfill rather than a miss. Then:');
    console.log('');
    console.log('      node scripts/catch-up.js --reflow');
  } else {
    console.log(`  ${v.openDays.length} open days is a backlog, and backlogs you cannot see the end of are`);
    console.log('  what kill this. Do not try to clear it. Backfill the two most recent:');
    console.log(`      ${v.openDays.slice(-2).map((e) => D(e.day)).join(' and ')}`);
    console.log('  and write the rest off as misses, which costs you nothing visible:');
    console.log('');
    console.log('      node scripts/catch-up.js --log-misses');
    console.log('      node scripts/catch-up.js --reflow');
  }
  console.log('');
}

// --- log misses ------------------------------------------------------------

function logMisses(s) {
  const v = survey(s);
  const b = L.logBlock(s.progressMd);
  if (!b) { console.log('No "## Log" code block in tracking/progress.md. Nothing written.'); return; }

  // Only days that were never logged at all. A partial day is a real record and
  // is left alone — you either finish it or write it off by hand.
  const targets = v.unlogged;
  if (!targets.length) { console.log('Every elapsed day is already logged. Nothing written.'); return; }

  let body = b.body;
  let n = 0;
  for (const e of targets) {
    const hasDesk = ((s.planByBlock[e.block] || {}).desk || []).length > 0;
    const line = L.formatLogLine({
      day: e.day, date: L.iso(e.date),
      desk: hasDesk ? 'N' : '-', phone: 'N',
      conf: '', done: '', note: 'not done',
    });
    const re = new RegExp(`^${D(e.day)}\\s*\\|.*$`, 'm');
    if (re.test(body)) { body = body.replace(re, line); n++; }
  }
  const md = s.progressMd.slice(0, b.start) + '```\n' + body + '```' + s.progressMd.slice(b.end);
  L.write(L.P.progress, md);

  console.log(`Wrote ${n} day(s) to tracking/progress.md as misses:`);
  console.log(`  ${targets.map((e) => D(e.day)).join(' ')}`);
  console.log('');
  console.log('A logged miss is not a failure, it is data. The streak counter does not reset,');
  console.log('and the weekly review can now tell an overloaded week from an unlogged one.');
  console.log('If you still intend to do one of these, just do it in the dashboard — ticking it');
  console.log('overwrites the miss with a backfill.');
  console.log('');
  snapshot();
}

// --- reflow ----------------------------------------------------------------
// Move each day's review items so they follow the day the work actually
// happened. Items belonging to a day that has not happened at all are held:
// due is set to "hold", and nothing surfaces them until the day is done.

function reflow(s) {
  const f = L.readQueueFile();
  const byPrompt = new Map();
  for (const i of f.queue) byPrompt.set(L.normalise(i.prompt), i);

  const moved = [], released = [];
  const origin = new Map();   // queue item -> the day that introduces it

  for (const e of s.schedule) {
    const day = s.planByBlock[e.block];
    if (!day || !day.adds.length) continue;
    const r = s.rows[e.day];

    // When the material was actually met: the backfill date if it was done
    // late, otherwise the day's own date. Null if it has not been done.
    const learned = L.dayComplete(r) ? (r.done || r.date) : null;
    const elapsed = e.date < s.now;

    for (const add of day.adds) {
      const item = byPrompt.get(L.normalise(add));
      if (!item) continue;                       // covered by a permanent entry
      origin.set(item, { day: e.day, off: L.dayWrittenOff(r) });
      if (item.hist.length) continue;            // already reviewed, leave it alone

      if (learned) {
        const base = L.toDate(learned);
        if (!base) continue;
        const target = L.iso(L.addDays(base, item.interval));
        if (!L.toDate(item.due)) {
          item.due = target; released.push({ prompt: item.prompt, due: target });
        } else if (item.due <= learned) {
          const from = item.due;
          item.due = target;
          if (from !== target) moved.push({ prompt: item.prompt, from, to: target });
        }
      } else if (elapsed && L.toDate(item.due)) {
        item.due = 'hold';
      }
    }
  }

  const promoted = L.capDailyLoad(f.queue, 8);
  L.sortQueue(f.queue);
  L.writeQueueFile(f, f.queue, f.permanent);

  // Reported from the file's final state, not from what this run changed, so
  // running it twice tells you the same thing rather than an empty second time.
  const held = f.queue.filter((i) => !L.toDate(i.due))
    .map((i) => ({ prompt: i.prompt, ...(origin.get(i) || { day: 0, off: false }) }))
    .sort((a, b) => a.day - b.day);
  const waiting = held.filter((h) => !h.off);
  const dropped = held.filter((h) => h.off);

  console.log('');
  console.log(`Held, waiting on a day you can still do: ${waiting.length}`);
  for (const h of waiting.slice(0, 10)) console.log(`  ${D(h.day)}  ${h.prompt}`);
  if (waiting.length > 10) console.log(`  ... and ${waiting.length - 10} more`);
  console.log(`Held, on days you wrote off: ${dropped.length}`);
  for (const h of dropped.slice(0, 10)) console.log(`  ${D(h.day)}  ${h.prompt}`);
  if (dropped.length > 10) console.log(`  ... and ${dropped.length - 10} more`);
  console.log(`Released (day now done, scheduled from when you did it): ${released.length}`);
  for (const r of released.slice(0, 10)) console.log(`  due ${r.due}  ${r.prompt}`);
  console.log(`Re-dated to follow a backfill: ${moved.length}`);
  for (const m of moved.slice(0, 10)) console.log(`  ${m.from} -> ${m.to}  ${m.prompt}`);
  console.log(`Promoted to protect the 8-item daily cap: ${promoted.length}`);
  console.log('');
  console.log('tracking/review-queue.md updated. Held items carry due:hold and stay invisible');
  console.log('on the dashboard until the day that teaches them is done, then run this again.');
  if (dropped.length) {
    console.log('');
    console.log(`${dropped.length} of them sit on days you wrote off, so that material never landed.`);
    console.log('The queue is for what you have met, not for what you owe, so it will not ask for');
    console.log('these. They are month 2 input instead: say so at the Day 28 checkpoint.');
  }
  console.log('');
  snapshot();
}

// --- restart ---------------------------------------------------------------

function restartToday(s) {
  const anyActivity = Object.values(s.rows).some(
    (r) => /^[YP]$/.test(r.desk) || /^[YP]$/.test(r.phone) || r.conf);
  if (anyActivity && !has('--force')) {
    console.log('There is real activity logged in tracking/progress.md.');
    console.log('Moving Day 1 would renumber work you have already done.');
    console.log('Backfill the open days instead, or re-run with --force if you truly want to reset.');
    return;
  }

  const today = L.iso(s.now);
  const cfg = L.read(L.P.config);
  L.write(L.P.config, cfg.replace(/^START_DATE:\s*\S+/m, `START_DATE: ${today}`));

  // Blank the log block, so no day carries a date from the old run.
  const md = L.read(L.P.progress);
  const b = L.logBlock(md);
  if (b) {
    const schedule = L.buildSchedule(s.now);
    const plan = L.parsePlan(L.read(L.P.month1));
    const byBlock = Object.fromEntries(plan.map((d) => [d.block, d]));
    const body = schedule.map((e) => {
      const hasDesk = ((byBlock[e.block] || {}).desk || []).length > 0;
      return L.formatLogLine({ day: e.day, date: '', desk: hasDesk ? '' : '-', phone: '', conf: '', done: '', note: '' });
    }).join('\n') + '\n';
    L.write(L.P.progress, md.slice(0, b.start) + '```\n' + body + '```' + md.slice(b.end));
  }

  console.log(`START_DATE is now ${today}. Today is Day 01.`);
  console.log('Reseeding the review queue from the new anchor.');
  console.log('');
  require('child_process').execFileSync(process.execPath,
    [require('path').join(__dirname, 'seed-queue.js')], { stdio: 'inherit' });
  console.log('');
  console.log('Nothing is behind any more. Open the dashboard and do Day 1.');
  snapshot();
}

function snapshot() {
  try { require('./build-snapshot.js').run(true); console.log('Offline snapshot in index.html refreshed.'); }
  catch (e) { console.log('Snapshot refresh skipped: ' + e.message); }
}

// --- main ------------------------------------------------------------------

const s = load();
if (has('--restart-today')) restartToday(s);
else if (has('--log-misses')) logMisses(s);
else if (has('--reflow')) reflow(s);
else status(s);
