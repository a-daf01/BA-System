'use strict';
// Appends every prompt Ahmed types to tracking/questions-log.md.
//
// Wired to the UserPromptSubmit hook in .claude/settings.json, so it fires
// whether or not Claude remembers to do it. That is the whole point: the raw
// capture must not depend on the model's judgement, because the questions worth
// auditing are exactly the ones nobody thought to write down.
//
// This file is the unsorted inbox. tracking/knowledge-gaps.md is the curated,
// reviewable version — see CLAUDE.md for how one becomes the other.
//
// Reads the hook payload as JSON on stdin. Never throws: a logging failure must
// not block a prompt.

const fs = require('fs');
const path = require('path');

// Resolved from this file, not from cwd, so the hook works from any directory.
const LOG = path.join(__dirname, '..', 'tracking', 'questions-log.md');
const MAX = 300;

const HEADER = `# Questions log

Raw capture. Every prompt, appended automatically by \`scripts/log-question.js\`
via the UserPromptSubmit hook. Nothing here is curated and nothing is deleted.

This is the inbox, not the record. The reviewable record is
\`tracking/knowledge-gaps.md\`.

---

`;

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// One line, no pipes, no fences. The log is read as a markdown list, so a
// prompt containing markdown must not be able to restructure the file.
function flatten(s) {
  let t = String(s).replace(/\s+/g, ' ').replace(/\|/g, '/').replace(/`/g, "'").trim();
  if (t.length > MAX) t = t.slice(0, MAX - 1) + '…';
  return t;
}

function main(raw) {
  let prompt = '';
  try {
    prompt = JSON.parse(raw).prompt || '';
  } catch {
    return; // Not JSON. Nothing useful to log.
  }

  const text = flatten(prompt);
  if (!text) return;
  // Bare slash commands are invocations, not questions.
  if (/^\/\S+$/.test(text)) return;

  if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, HEADER, 'utf8');
  fs.appendFileSync(LOG, `- ${stamp()} | ${text}\n`, 'utf8');
}

let buf = '';
process.stdin.on('data', (c) => { buf += c; });
process.stdin.on('end', () => {
  try { main(buf); } catch { /* logging must never block a prompt */ }
});
