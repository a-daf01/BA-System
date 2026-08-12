'use strict';
// The brain dump: unstructured notes during the day, digested at the end of it.
//
//   node scripts/braindump.js                 show what is in today's dump
//   node scripts/braindump.js "text"          append a line
//   node scripts/braindump.js --archive       move today into the archive
//
// The file promises "no format". This script must therefore accept anything:
// prose, pasted SQL, no heading, no bullets. An earlier version only counted
// "- " lines under a dated heading and reported a full page of real notes as
// empty. Content is anything that is not the template header.
//
// Digesting is Claude Code's job, not this script's. See CLAUDE.md.

const fs = require('fs');
const path = require('path');
const L = require('./lib');

const DUMP = path.join(__dirname, '..', 'tracking', 'braindump.md');
const ARCHIVE = path.join(__dirname, '..', 'tracking', 'braindump-archive.md');

const HEADER = `# Brain dump

**Type whatever, whenever. No format, no structure, no editing.** Prose, bullets, pasted
SQL, half-sentences — all fine. Solutions that worked, things that blanked, questions,
frustrations.

Say **"I'm done"** at the end of the day and Claude Code digests it: struggles become
review-queue items, open questions get answered, tangents go to the parking lot, and the
day's log line gets written. Then this file is emptied into
\`tracking/braindump-archive.md\` so tomorrow starts blank.

Nothing here is ever graded. "No idea what I was doing for 40 minutes" is more useful to
the system than writing nothing.

---
`;

const ARCHIVE_HEADER = `# Brain dump archive

Digested days, newest first. Kept so a weekly or Month 2 review can read back over what
the days actually felt like, not just the confidence scores.

---
`;

const heading = () => {
  const t = L.today();
  let n;
  try { n = L.dayNumberFor(L.getStartDate(), t); } catch { n = 0; }
  return `## ${L.iso(t)}${n >= 1 && n <= 28 ? ` — Day ${String(n).padStart(2, '0')}` : ''}`;
};

const read = () => (fs.existsSync(DUMP) ? fs.readFileSync(DUMP, 'utf8') : '');

// Everything the user typed, with the template header stripped. Deliberately
// dumb: if it is not the header, it counts.
function content(md) {
  let body = md;
  if (body.startsWith('# Brain dump')) {
    const i = body.indexOf('\n---');
    if (i !== -1) body = body.slice(i + 4);
  }
  return body.trim();
}

const lineCount = (s) => s.split(/\r?\n/).filter((l) => l.trim()).length;

function append(text) {
  const md = read();
  const base = md.trim() ? md.replace(/\s*$/, '\n') : HEADER;
  const needsHeading = !content(base).includes(heading());
  fs.writeFileSync(DUMP, base + (needsHeading ? `\n${heading()}\n\n` : '') + `- ${text.trim()}\n`, 'utf8');
  console.log('Added to', L.iso(L.today()) + '.');
}

function show() {
  const body = content(read());
  if (!body) {
    console.log('Nothing dumped today. Open tracking/braindump.md and type, or:');
    console.log('  node scripts/braindump.js "whatever you\'re thinking"');
    return;
  }
  console.log(`${lineCount(body)} non-empty lines in tracking/braindump.md.\n`);
  console.log(body);
  console.log(`\nSay "I'm done" to Claude Code to digest this.`);
}

function archive() {
  const body = content(read());
  if (!body) {
    console.log('Nothing to archive.');
    return;
  }
  // Stamp the day if the user never wrote a heading themselves.
  const block = (body.includes(heading()) ? body : `${heading()}\n\n${body}`).replace(/\s*$/, '\n');

  let arch = fs.existsSync(ARCHIVE) ? fs.readFileSync(ARCHIVE, 'utf8') : ARCHIVE_HEADER;
  const at = arch.indexOf('\n---');
  const cut = at === -1 ? arch.length : at + 4;
  arch = arch.slice(0, cut) + '\n' + block + arch.slice(cut);
  fs.writeFileSync(ARCHIVE, arch, 'utf8');

  fs.writeFileSync(DUMP, HEADER, 'utf8');
  console.log(`Archived ${lineCount(body)} lines. tracking/braindump.md is blank again.`);
}

const arg = process.argv.slice(2);
if (!arg.length) show();
else if (arg[0] === '--archive') archive();
else append(arg.join(' '));
