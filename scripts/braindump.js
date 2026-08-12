'use strict';
// The brain dump: unstructured notes during the day, digested at the end of it.
//
//   node scripts/braindump.js                 show today's entries
//   node scripts/braindump.js "text"          append a line to today
//   node scripts/braindump.js --archive       move today into the archive
//
// You can also just open tracking/braindump.md and type. The script exists so
// capture from a terminal is one command, not "find the file, find the right
// heading, scroll to the bottom".
//
// Digesting is Claude Code's job, not this script's. See CLAUDE.md.

const fs = require('fs');
const L = require('./lib');
const path = require('path');

const DUMP = path.join(__dirname, '..', 'tracking', 'braindump.md');
const ARCHIVE = path.join(__dirname, '..', 'tracking', 'braindump-archive.md');

const HEADER = `# Brain dump

**Type whatever, whenever. No format, no structure, no editing.** Solutions that worked,
things that blanked, half-thoughts, questions, frustrations. Fragments are fine.

Say **"I'm done"** at the end of the day and Claude Code digests it: struggles become
review-queue items, open questions get answered, tangents go to the parking lot, and the
day's log line gets proposed for you to confirm. Then this file is emptied into
\`tracking/braindump-archive.md\` so tomorrow starts blank.

Nothing here is ever graded. Writing "no idea what I was doing for 40 minutes" is more
useful to the system than writing nothing.

---

`;

const ARCHIVE_HEADER = `# Brain dump archive

Digested days, newest first. Kept so a weekly or Month 2 review can read back over what
the days actually felt like, not just the confidence scores.

---

`;

function todayHeading() {
  const t = L.today();
  const n = L.dayNumberFor(L.getStartDate(), t);
  const day = n >= 1 && n <= 28 ? ` — Day ${String(n).padStart(2, '0')}` : '';
  return `## ${L.iso(t)}${day}`;
}

function readDump() {
  if (!fs.existsSync(DUMP)) return HEADER;
  return fs.readFileSync(DUMP, 'utf8');
}

// Returns { start, end, body } for today's section, or null if absent.
function findToday(md) {
  const h = todayHeading();
  const i = md.indexOf(h);
  if (i === -1) return null;
  const after = md.slice(i + h.length);
  const next = after.search(/\n## /);
  const end = next === -1 ? md.length : i + h.length + next;
  return { start: i, end, body: md.slice(i + h.length, end) };
}

function entriesOf(body) {
  return body.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^-\s+\S/.test(l));
}

function append(text) {
  let md = readDump();
  const sec = findToday(md);
  const line = `- ${text.trim()}\n`;
  if (sec) {
    md = md.slice(0, sec.end).replace(/\s*$/, '\n') + line + md.slice(sec.end);
  } else {
    md = md.replace(/\s*$/, '\n') + `\n${todayHeading()}\n\n` + line;
  }
  fs.writeFileSync(DUMP, md, 'utf8');
  console.log('Added to', L.iso(L.today()) + '.');
}

function show() {
  const sec = findToday(readDump());
  const items = sec ? entriesOf(sec.body) : [];
  if (!items.length) {
    console.log(`Nothing dumped today. Open tracking/braindump.md, or:`);
    console.log(`  node scripts/braindump.js "whatever you're thinking"`);
    return;
  }
  console.log(`${todayHeading().replace(/^## /, '')} — ${items.length} entr${items.length === 1 ? 'y' : 'ies'}\n`);
  for (const i of items) console.log('  ' + i);
  console.log(`\nSay "I'm done" to Claude Code to digest these.`);
}

function archive() {
  const md = readDump();
  const sec = findToday(md);
  if (!sec || !entriesOf(sec.body).length) {
    console.log('Nothing to archive today.');
    return;
  }
  const block = (todayHeading() + sec.body).replace(/\s*$/, '\n');

  let arch = fs.existsSync(ARCHIVE) ? fs.readFileSync(ARCHIVE, 'utf8') : ARCHIVE_HEADER;
  // Newest first: insert directly after the header rule.
  const at = arch.indexOf('---\n');
  const cut = at === -1 ? arch.length : at + 4;
  arch = arch.slice(0, cut) + '\n' + block + arch.slice(cut);
  fs.writeFileSync(ARCHIVE, arch, 'utf8');

  const rest = (md.slice(0, sec.start) + md.slice(sec.end)).replace(/\s*$/, '\n');
  fs.writeFileSync(DUMP, rest, 'utf8');
  console.log(`Archived ${entriesOf(sec.body).length} entries. tracking/braindump.md is clean.`);
}

const arg = process.argv.slice(2);
if (!arg.length) show();
else if (arg[0] === '--archive') archive();
else append(arg.join(' '));
