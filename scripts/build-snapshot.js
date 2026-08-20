'use strict';
// Bakes a copy of the markdown files into index.html and week.html between the
// SNAPSHOT markers, so the dashboard still works when you open it by double-clicking.
//
// Why this exists: browsers block fetch() on file:// URLs. On GitHub Pages or
// any local server the dashboard reads the real files and this snapshot is
// ignored entirely. Offline it falls back to the snapshot and says so on screen.
//
//   node scripts/build-snapshot.js
//
// weekly-review.js calls this automatically, so in normal use you never run it.

const L = require('./lib');

const START = '<!-- SNAPSHOT:START -->';
const END = '<!-- SNAPSHOT:END -->';

function run(quiet) {
  const snap = {
    generatedAt: L.iso(L.today()),
    files: {
      'tracking/config.md': L.read(L.P.config),
      'plan/month-01.md': L.read(L.P.month1),
      'tracking/progress.md': L.read(L.P.progress),
      'tracking/review-queue.md': L.read(L.P.queue),
      'tracking/review-cards.md': L.read(L.P.cards),
      'tracking/review-log.md': L.read(L.P.reviewLog),
      'tracking/notes.md': L.read(L.P.notes),
      'tracking/time-log.md': L.read(L.P.timeLog),
      'tracking/applications.md': L.read(L.P.apps),
      'tracking/knowledge-gaps.md': L.read(L.P.gaps),
    },
  };

  const json = JSON.stringify(snap).replace(/<\//g, '<\\/');
  const block = `${START}\n<script type="application/json" id="snapshot">${json}</script>\n${END}`;

  // Both pages get the same snapshot. week.html reads the same files and has to
  // survive being opened off the disk exactly as the dashboard does.
  const pages = [['index.html', L.P.index], ['week.html', L.P.week]];
  for (const [name, file] of pages) {
    const html = L.read(file);
    const s = html.indexOf(START);
    const e = html.indexOf(END);
    if (s === -1 || e === -1) throw new Error(`SNAPSHOT markers not found in ${name}`);
    L.write(file, html.slice(0, s) + block + html.slice(e + END.length));
  }
  if (!quiet) {
    const kb = Math.round(json.length / 1024);
    console.log(`Snapshot rebuilt (${kb} KB) into index.html and week.html, dated ${snap.generatedAt}.`);
  }
}

module.exports = { run };
if (require.main === module) run(false);
