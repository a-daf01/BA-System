'use strict';
// Seeds tracking/review-queue.md from every "Adds to review queue:" line in
// plan/month-01.md. Each item enters at interval 1, due the day after the day
// that introduces it. Permanent 30-day items are kept and given due dates.
//
//   node scripts/seed-queue.js
//
// Safe to re-run. It rebuilds every due date from START_DATE, so run it again
// after changing tracking/config.md.

const L = require('./lib');

function main() {
  const start = L.getStartDate();
  const schedule = L.buildSchedule(start);
  const plan = L.parsePlan(L.read(L.P.month1));
  const f = L.readQueueFile();

  const permanentNorm = f.permanent.map((p) => L.normalise(p.prompt));
  const seen = new Set();
  const queue = [];
  let skipped = 0;

  for (const day of plan) {
    for (const item of day.adds) {
      const n = L.normalise(item);
      if (!n) continue;
      // An item already covered by a permanent 30-day entry does not need a
      // second copy in the daily queue.
      if (permanentNorm.some((p) => p === n || p.includes(n) || n.includes(p))) { skipped++; continue; }
      if (seen.has(n)) { skipped++; continue; }
      seen.add(n);

      const d = L.blockDate(schedule, day.block);
      // If this item is already in the queue, keep its interval and its scores.
      // Re-running mid-month must not reset a month of review history back to
      // interval 1 — that silently throws away the only data the system has.
      const existing = f.queue.find((q) => L.normalise(q.prompt) === n);
      queue.push({
        interval: existing ? existing.interval : 1,
        due: existing ? existing.due : L.iso(L.addDays(d, 1)),
        prompt: item,
        hist: existing ? existing.hist : [],
        block: day.block,
      });
    }
  }

  // Items that did not come from the plan — gaps promoted out of a brain dump
  // or a question Ahmed asked — are kept exactly as they are, intervals and
  // scores intact. The plan is the source of truth for its own items only.
  // Without this, re-running after a START_DATE change silently deletes every
  // item the system learned about him, which is the opposite of the point.
  const planNorm = new Set(queue.map((q) => L.normalise(q.prompt)));
  const kept = f.queue.filter((q) => !planNorm.has(L.normalise(q.prompt)));
  for (const k of kept) queue.push(k);

  // No day gets more than 7 items. An overlong review block is the first thing
  // he skips, and skipping it is the failure this whole system exists to stop.
  const promoted = L.capDailyLoad(queue, 7);
  queue.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));

  // Permanent items start one interval out from the day their subject lands,
  // or from Day 28 if the plan never introduces them explicitly.
  const lastDay = schedule[schedule.length - 1].date;
  for (const p of f.permanent) {
    p.interval = 30;
    if (!p.due) p.due = L.iso(L.addDays(lastDay, 1));
  }

  L.writeQueueFile(f, queue.map(({ block, ...rest }) => rest), f.permanent);

  // Report
  const byDate = {};
  for (const q of queue) byDate[q.due] = (byDate[q.due] || 0) + 1;
  const busiest = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];

  console.log(`Seeded ${queue.length} items into tracking/review-queue.md.`);
  console.log(`Skipped ${skipped} duplicates or items already covered by a permanent entry.`);
  if (promoted.length) console.log(`Promoted ${promoted.length} item(s) to a longer interval to keep every day under 7.`);
  console.log(`${f.permanent.length} permanent items kept on the 30-day cycle.`);
  console.log(`Day 1 is ${L.iso(start)} (${start.toDateString().slice(0, 3)}).`);
  if (busiest) console.log(`Heaviest seeded day: ${busiest[0]} with ${busiest[1]} items.`);
  console.log('The dashboard shows due-today items only. The full queue stays out of sight on purpose.');
}

main();
