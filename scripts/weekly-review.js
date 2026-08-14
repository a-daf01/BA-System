'use strict';
// Weekly checkpoint. Reads progress.md + review-queue.md, applies the rules in
// CLAUDE.md, rewrites the due dates in review-queue.md, and prints a plain
// summary of the week and what it changed.
//
//   node scripts/weekly-review.js            (current week)
//   node scripts/weekly-review.js 2          (force week 2)
//   node scripts/weekly-review.js --dry      (report only, write nothing)
//
// Confidence per item: the queue line carries up to two scores, oldest first.
// When an item has no score of its own, the daily confidence logged for the day
// it fell due is used. You never rate items individually, which is the point.

const L = require('./lib');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const forced = args.find((a) => /^[1-4]$/.test(a));

function main() {
  const start = L.getStartDate();
  const schedule = L.buildSchedule(start);
  const now = L.today();
  const dayNo = Math.min(28, Math.max(1, L.dayNumberFor(start, now)));
  const week = forced ? +forced : Math.min(4, Math.ceil(dayNo / 7));
  const days = schedule.filter((s) => Math.ceil(s.day / 7) === week);

  const progressMd = L.read(L.P.progress);
  const rows = L.parseProgress(progressMd);
  const parked = L.parkingLot(progressMd);
  const plan = L.parsePlan(L.read(L.P.month1));
  const planByBlock = Object.fromEntries(plan.map((d) => [d.block, d]));

  // --- what happened this week --------------------------------------------
  let deskExpected = 0, deskMissed = 0, phoneMissed = 0, deskDoneOnly = 0, unlogged = 0;
  const confs = [];
  const notes = [];
  const backfilled = [];   // done, but after the day it was set for
  const stillOpen = [];    // elapsed, not done, not written off — still catchable

  // Days that have not happened yet are not misses. Only judge elapsed days.
  const elapsed = days.filter((s) => s.date <= now);

  for (const s of elapsed) {
    const r = rows[s.day];
    const hasDesk = (planByBlock[s.block]?.desk.length || 0) > 0;
    if (hasDesk) deskExpected++;
    if (r && r.lateBy > 0) backfilled.push({ day: s.day, lateBy: r.lateBy, date: r.date, done: r.done });
    // Anything not finished and not deliberately written off is still open.
    // Backfilling it later is the intended move, so it is not scored as a miss
    // here — it is listed, and it stops being listed when it is done or logged
    // as a miss on purpose.
    if (s.date < now && L.dayOutstanding(r)) stillOpen.push(s.day);
    if (!r || !r.logged) { unlogged++; continue; }
    const deskOk = /^[YP]$/.test(r.desk);
    const phoneOk = /^[YP]$/.test(r.phone);
    if (hasDesk && !deskOk) deskMissed++;
    if (!phoneOk) phoneMissed++;
    if (deskOk && !phoneOk) deskDoneOnly++;
    if (r.conf) confs.push({ day: s.day, conf: r.conf });
    if (r.note) notes.push(`D${String(s.day).padStart(2, '0')}: ${r.note}`);
  }

  const avgConf = confs.length ? (confs.reduce((a, b) => a + b.conf, 0) / confs.length) : null;

  // --- reschedule the queue ------------------------------------------------
  const f = L.readQueueFile();
  const confByDate = {};
  for (const s of schedule) {
    const r = rows[s.day];
    if (!r || !r.conf) continue;
    confByDate[L.iso(s.date)] = r.conf;
    // A day done late scores the date the work actually happened too, so items
    // that fell due around the backfill are graded from it rather than from a
    // date on which nothing was learned.
    if (r.done) confByDate[r.done] = r.conf;
  }

  // Days that have been logged at all, whether or not they carry a confidence.
  // An item that fell due on a logged-but-unscored day was not reviewed; an item
  // that fell due on a day never logged is simply still waiting.
  const loggedDates = new Set();
  for (const s of schedule) {
    const r = rows[s.day];
    if (r && r.logged) { loggedDates.add(L.iso(s.date)); if (r.done) loggedDates.add(r.done); }
  }

  const changes = { advanced: [], repeated: [], dropped: [], untouched: 0, promoted: [], carried: [] };

  function reschedule(item, permanent) {
    const due = L.toDate(item.due);
    if (!due || due > now) { changes.untouched++; return item; }

    // Score for this review: the item's own most recent score, else the daily
    // confidence logged on the day it fell due. Never the week average.
    //
    // Grading an item from an average is grading work that was never described,
    // and every future interval derives from that number. A day with no logged
    // confidence produces no score here — the item is either carried forward
    // untouched (the day was logged as done-but-unscored, or written off) or
    // left alone entirely (the day has not been logged yet, so it is still
    // legitimately waiting to be reviewed).
    let conf = item.hist.length ? item.hist[item.hist.length - 1] : null;
    let derived = false;
    if (conf === null) {
      conf = confByDate[item.due] ?? null;
      derived = true;
    }
    if (conf === null) {
      if (loggedDates.has(item.due)) {
        // The day happened and was logged without a score. Move the item on at
        // its current interval so it stops sitting permanently overdue, but
        // record nothing — no evidence, no score.
        item.due = L.iso(L.addDays(now, item.interval));
        changes.carried.push({ prompt: item.prompt, interval: item.interval });
        return item;
      }
      changes.untouched++;
      return item;
    }

    const before = item.interval;
    if (permanent) {
      item.interval = 30; // permanent items never leave the 30-day cycle
    } else if (conf >= 4) {
      item.interval = L.nextInterval(before);
    } else if (conf === 3) {
      item.interval = before;
    } else {
      item.interval = L.prevInterval(before);
    }
    item.due = L.iso(L.addDays(now, item.interval));
    if (derived) item.hist = [...item.hist, conf].slice(-2);
    else item.hist = item.hist.slice(-2);

    const rec = { prompt: item.prompt, conf, from: before, to: item.interval };
    if (permanent) { /* no bucket */ }
    else if (conf >= 4) changes.advanced.push(rec);
    else if (conf === 3) changes.repeated.push(rec);
    else changes.dropped.push(rec);
    return item;
  }

  f.queue = f.queue.map((i) => reschedule(i, false));
  f.permanent = f.permanent.map((i) => reschedule(i, true));

  // --- cap the daily load at 8 --------------------------------------------
  changes.promoted = L.capDailyLoad(f.queue, 8);
  L.sortQueue(f.queue);
  if (!dry) L.writeQueueFile(f, f.queue, f.permanent);

  // --- weak items worth a re-teach block -----------------------------------
  const weakTwice = f.queue.filter((i) => i.hist.length >= 2 && i.hist.every((c) => c <= 2));
  const strongTwice = f.queue.filter((i) => i.hist.length >= 2 && i.hist.every((c) => c >= 4));

  // --- report --------------------------------------------------------------
  const line = (s) => console.log(s);
  line('');
  line(`WEEK ${week}  (Days ${days[0].day} to ${days[days.length - 1].day}, ${L.iso(days[0].date)} to ${L.iso(days[days.length - 1].date)})`);
  line('='.repeat(60));
  line('');

  if (elapsed.length < days.length) {
    line(`${days.length - elapsed.length} day(s) of this week have not happened yet and are not counted.`);
  }
  if (!elapsed.length) {
    line('This week has not started. Nothing to review.');
  } else if (unlogged === elapsed.length) {
    line('Nothing logged this week at all. There is no data to adjust from.');
    line('Log the misses in tracking/progress.md and re-run. Honest data or nothing.');
  } else {
    line(`Logged: ${elapsed.length - unlogged} of ${elapsed.length} elapsed days.` + (unlogged ? `  ${unlogged} unlogged.` : ''));
    line(`Desk blocks missed: ${deskMissed} of ${deskExpected}.`);
    line(`Phone blocks missed: ${phoneMissed} of ${elapsed.length}.`);
    line(avgConf ? `Average confidence: ${avgConf.toFixed(1)}.` : 'No confidence scores logged.');
    if (backfilled.length) {
      const lag = backfilled.reduce((a, b) => a + b.lateBy, 0) / backfilled.length;
      line(`Done late: ${backfilled.length} day(s), on average ${lag.toFixed(1)} day(s) after schedule.`);
    }
    if (stillOpen.length) {
      line(`Still open: ${stillOpen.map((d) => 'D' + String(d).padStart(2, '0')).join(' ')}.`);
    }
  }
  line('');

  line('VERDICT');
  if (deskDoneOnly >= 1) {
    line(`  ${deskDoneOnly} day(s) with desk done and phone skipped. That is the dangerous pattern.`);
    line('  The phone block is where retention happens. Desk without phone is learning you will lose.');
  }
  if (deskMissed >= 2) {
    line(`  ${deskMissed} desk blocks missed. The week was too heavy.`);
    line(`  Cut next week's desk blocks by about 20 percent. Do not carry the backlog forward.`);
  }
  if (backfilled.length) {
    const lag = backfilled.reduce((a, b) => a + b.lateBy, 0) / backfilled.length;
    const worst = Math.max(...backfilled.map((b) => b.lateBy));
    line(`  ${backfilled.length} day(s) backfilled. The work happened, so this is not a miss.`);
    if (lag >= 3 || worst >= 5) {
      line(`  But the lag is ${lag.toFixed(1)} days on average, worst ${worst}. At that distance the review`);
      line('  intervals stop matching when you actually learned the material, which is the');
      line('  one thing this system exists to get right. Reflow the queue, and treat this');
      line('  as a signal the daily load is landing at the wrong time of day for you.');
    } else {
      line('  Lag is short enough that the review intervals still line up. Carry on.');
    }
  }
  if (stillOpen.length >= 3) {
    line(`  ${stillOpen.length} elapsed days are still open. That is a backlog, and a backlog you`);
    line('  cannot see the end of is the thing that gets systems abandoned. Pick the two');
    line('  most recent, backfill those, and write the rest off in progress.md as misses.');
    line('  Do not try to clear all of them.');
  }
  if (elapsed.length && deskMissed < 2 && deskDoneOnly === 0 && unlogged === 0 && stillOpen.length < 3) {
    line('  Week held. Nothing needs reducing.');
  }
  if (avgConf !== null && avgConf < 2.5) {
    line(`  Average confidence ${avgConf.toFixed(1)}. Material is not landing. Expect more repeats than advances.`);
  }
  line('');

  line('QUEUE CHANGES');
  line(`  Advanced to a longer interval: ${changes.advanced.length}`);
  line(`  Repeated at the same interval: ${changes.repeated.length}`);
  line(`  Dropped back an interval:      ${changes.dropped.length}`);
  line(`  Promoted to protect the 8-item cap: ${changes.promoted.length}`);
  line(`  Carried forward unscored:      ${changes.carried.length}`);
  line(`  Not due yet, untouched:        ${changes.untouched}`);
  if (changes.carried.length) {
    line('    (fell due on a day logged without a confidence score — moved on, not graded)');
  }
  for (const c of changes.dropped.slice(0, 8)) line(`    down  ${c.from} -> ${c.to}d  conf ${c.conf}  ${c.prompt}`);
  line('');

  if (weakTwice.length) {
    line('SCORED 1 OR 2 TWICE. These need a dedicated re-teach block next week,');
    line('displacing something lower priority:');
    for (const i of weakTwice) line(`  - ${i.prompt}`);
    line('');
  }
  if (strongTwice.length) {
    line(`SCORED 4 OR 5 TWICE. Pushed out to a long interval, stop surfacing daily: ${strongTwice.length} item(s).`);
    line('');
  }
  if (parked.length >= 3) {
    line(`PARKING LOT has ${parked.length} items. Schedule one as a Sunday deep dive so it stops nagging:`);
    for (const p of parked.slice(0, 5)) line(`  - ${p}`);
    line('');
  }
  if (backfilled.length) {
    line('DONE LATE');
    for (const b of backfilled) {
      line(`  D${String(b.day).padStart(2, '0')}  set for ${b.date}, done ${b.done}  (+${b.lateBy}d)`);
    }
    line('  node scripts/catch-up.js --reflow moves these days\' review items to follow the work.');
    line('');
  }
  if (stillOpen.length) {
    line(`STILL OPEN (elapsed, not done, not written off): ${stillOpen.length}`);
    line(`  ${stillOpen.map((d) => 'D' + String(d).padStart(2, '0')).join(' ')}`);
    line('  Open the dashboard, arrow back to the day, and either do it or tap Write it off.');
    line('');
  }
  if (notes.length) {
    line('NOTES YOU LEFT');
    for (const n of notes) line(`  ${n}`);
    line('');
  }

  const dueToday = f.queue.filter((i) => i.due <= L.iso(now)).length;
  line(`Review queue: ${f.queue.length} active items, ${f.permanent.length} permanent. ${dueToday} due today.`);
  line(dry ? 'Dry run. tracking/review-queue.md was not written.' : 'tracking/review-queue.md updated.');
  line('');
  line('What this script does not do: edit plan/month-01.md. Adjusting the coming');
  line('week is a judgement call, so it is stated above and left to you and Claude Code.');
  line('');

  if (!dry) {
    try {
      require('./build-snapshot.js').run(true);
      console.log('Offline snapshot in index.html refreshed.');
    } catch (e) {
      console.log('Snapshot refresh skipped: ' + e.message);
    }
  }
}

main();
