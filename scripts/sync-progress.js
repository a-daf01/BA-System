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
//   - tangent I parked

const fs = require('fs');
const L = require('./lib');

const LOG_RE = /^D(\d{2})\s*\|.*\|\s*desk:\S*\s+phone:\S*\s*\|\s*conf:\S*\s*\|\s*note:/;

function apply(input) {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const logs = new Map();
  let parks = [];

  for (const line of lines) {
    const m = LOG_RE.exec(line);
    if (m) { logs.set(+m[1], line); continue; }
    if (/^-\s+\S/.test(line)) { parks.push(line.replace(/^-\s+/, '')); continue; }
    console.log(`Ignored (not a log line): ${line}`);
  }

  if (!logs.size && !parks.length) {
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

  const rows = L.parseProgress(md);
  const done = Object.values(rows).filter((r) => /^[YP]$/.test(r.desk) || /^[YP]$/.test(r.phone)).length;
  console.log(`${done} of 28 days now have activity logged.`);
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
