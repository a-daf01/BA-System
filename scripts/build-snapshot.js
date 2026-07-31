'use strict';
// Bakes a copy of the markdown files into index.html between the SNAPSHOT
// markers, so the dashboard still works when you open it by double-clicking.
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
      'tracking/applications.md': L.read(L.P.apps),
    },
  };

  const json = JSON.stringify(snap).replace(/<\//g, '<\\/');
  const block = `${START}\n<script type="application/json" id="snapshot">${json}</script>\n${END}`;

  const html = L.read(L.P.index);
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1) throw new Error('SNAPSHOT markers not found in index.html');

  L.write(L.P.index, html.slice(0, s) + block + html.slice(e + END.length));
  if (!quiet) {
    const kb = Math.round(json.length / 1024);
    console.log(`Snapshot rebuilt (${kb} KB) into index.html, dated ${snap.generatedAt}.`);
  }
}

module.exports = { run };
if (require.main === module) run(false);
