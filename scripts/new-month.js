'use strict';
// Generates plan/month-02.md in the shape defined by plan/day-template.md,
// weighted by the weakest confidence scores in tracking/progress.md and the
// weakest items in tracking/review-queue.md.
//
//   node scripts/new-month.js            (writes plan/month-02.md)
//   node scripts/new-month.js --dry      (print the weighting, write nothing)
//
// Weak month-1 topics become dedicated re-teach days at the front of the month,
// displacing bank days. Everything else comes from the bank below, in order.
// Sundays stay phone-only. Every day keeps a Say It Out Loud line.

const L = require('./lib');

const dry = process.argv.includes('--dry');

// --- month 2 content bank ---------------------------------------------------
// t=title, th=theme, d=[[min,task]], p=[[min,task]], s=say it out loud,
// a=adds to review queue, k=1 means keep it no matter how many re-teach days
// get inserted. The closing arc (portfolio 3, interview drilling, applications)
// is the point of the month and must never be displaced.
const BANK = [
  { t: 'SQL: set operations and anti-joins', th: 'The queries that answer "what is missing".',
    d: [[25, 'UNION vs UNION ALL on Northwind. Prove the row count difference and explain the cost.'], [30, 'Build three anti-join patterns for the same question: NOT IN, NOT EXISTS, LEFT JOIN with IS NULL.'], [15, 'Write down which of the three breaks on NULLs and why.']],
    p: [[10, 'Review queue.'], [15, 'Read 3 job ads. Note every phrase about data reconciliation.']],
    s: 'Reconciliation questions are anti-join questions, and NOT IN quietly returns nothing when the subquery contains a NULL.',
    a: ['UNION vs UNION ALL', 'NOT EXISTS vs NOT IN', 'anti-join pattern'] },

  { t: 'SQL: date and time logic', th: 'Where reporting periods go wrong.',
    d: [[30, 'Ten queries on Northwind order dates: month buckets, rolling 30 days, financial year to date.'], [25, 'Build a UK financial year mapping (April to March) as a single CASE expression.'], [15, 'Write down two ways an off-by-one date boundary corrupts a monthly report.']],
    p: [[10, 'Review queue.'], [15, 'Glossary sweep: reporting period terminology.']],
    s: 'Most period-over-period disputes are boundary disputes, so I define the period in the query rather than assuming everyone means the same month.',
    a: ['rolling window vs calendar month', 'UK financial year boundary', 'date boundary errors'] },

  { t: 'SQL: profiling data quality', th: 'The first thing you run against any unfamiliar table.',
    d: [[30, 'Write a reusable profiling query set: row count, null rate per column, distinct count, min/max, duplicates on the key.'], [25, 'Run it against a messy data.gov.uk table. Record every problem it surfaces.'], [20, 'Write a half-page data quality note for that table: completeness, accuracy, consistency, timeliness, validity.']],
    p: [[10, 'Review queue.'], [15, 'Say the five data quality dimensions aloud, with an example of each.']],
    s: 'Before I trust a table I profile it, because the fastest way to lose credibility is to publish a number built on a column that is 40 percent null.',
    a: ['data quality dimensions', 'profiling query set', 'duplicate key detection'] },

  { t: 'SQL: reading a query plan', th: 'Enough performance literacy to not be dangerous.',
    d: [[25, 'Run EXPLAIN QUERY PLAN on five of your existing Northwind queries. Record what each says.'], [30, 'Add an index to one filtered column. Re-run. Record the change.'], [15, 'Write in plain English why an index helps reads and costs you on writes.']],
    p: [[10, 'Review queue.'], [15, 'Watch one video on indexing basics. Re-explain aloud without replaying.']],
    s: 'I do not tune databases, but I can read a plan well enough to tell whether a slow report is a query problem or a model problem.',
    a: ['index tradeoff', 'reading a query plan', 'full scan vs index seek'] },

  { t: 'DAX: iterators and context transition', th: 'The step after CALCULATE. Expect discomfort.',
    d: [[30, 'SUMX, AVERAGEX, MAXX on Contoso. Build one measure that cannot be written with SUM.'], [30, 'Context transition: wrap an aggregate in CALCULATE inside an iterator and observe what changes.'], [15, 'Explain row context vs filter context in writing, under 100 words.']],
    p: [[10, 'Review queue.'], [15, 'Second pass on context transition from a different source. This one needs two.']],
    s: 'An iterator evaluates row by row, and CALCULATE inside it converts that row context into a filter context. That single mechanic explains most surprising DAX results.',
    a: ['SUMX vs SUM', 'row context vs filter context', 'context transition'] },

  { t: 'DAX: variables and readable measures', th: 'Maintainability is a job requirement, not a preference.',
    d: [[25, 'Rewrite five of your existing measures using VAR and RETURN.'], [25, 'Build one complex measure twice: nested and with variables. Compare readability and speed.'], [20, 'Write your own DAX naming and formatting convention into reference/portfolio.md.']],
    p: [[10, 'Review queue.'], [10, 'Read 3 ads focusing on how they describe handover and documentation.']],
    s: 'I write measures with variables because reporting logic always gets handed over, and unreadable DAX is a liability someone else inherits.',
    a: ['VAR and RETURN', 'measure naming convention'] },

  { t: 'Power BI: performance analyzer', th: 'Diagnosing a slow report like an analyst, not a guesser.',
    d: [[25, 'Run Performance Analyzer on your portfolio 1 report. Record the slowest visual and its DAX query time.'], [30, 'Fix one thing: reduce a visual, remove a calculated column, or fix a relationship. Re-measure.'], [15, 'Write the before and after numbers into your portfolio write-up.']],
    p: [[10, 'Review queue.'], [15, 'Practise explaining the fix aloud as an interview answer.']],
    s: 'When a report is slow I measure before I change anything, because the slow visual is usually not the one people complain about.',
    a: ['Performance Analyzer', 'DAX query time vs visual render time'] },

  { t: 'Power BI: row level security', th: 'Named in public sector and finance ads. Most candidates cannot describe it.',
    d: [[25, 'Build a static RLS role on Contoso. Test with View As.'], [30, 'Build a dynamic role using USERPRINCIPALNAME against a security dimension table.'], [15, 'Write down what RLS does not protect, and where access control actually has to sit.']],
    p: [[10, 'Review queue.'], [15, 'Glossary: security and access terminology.']],
    s: 'Row level security filters the model per user, but it is not a substitute for controlling who can open the workspace in the first place.',
    a: ['static vs dynamic RLS', 'USERPRINCIPALNAME', 'RLS limits'] },

  { t: 'Power BI: refresh, gateways and the service', th: 'How a report actually reaches a business every morning.',
    d: [[25, 'Map the path from source to published report: gateway, dataset, workspace, app, subscription.'], [25, 'Write the refresh design for your portfolio 1 report: frequency, window, failure behaviour, who gets told.'], [20, 'Turn that into three non-functional requirements with numbers in them.']],
    p: [[10, 'Review queue.'], [15, 'Read 3 ads. Count how many mention scheduled refresh or gateways.']],
    s: 'A dashboard nobody can refresh is a screenshot, so I specify refresh frequency and failure handling as requirements rather than afterthoughts.',
    a: ['gateway role', 'scheduled refresh', 'refresh NFRs'] },

  { t: 'Warehousing: slowly changing dimensions', th: 'The concept that separates BI-aware analysts from report builders.',
    d: [[25, 'Type 1 vs Type 2 vs Type 3. Write the difference with a worked customer-address example.'], [30, 'Design a Type 2 customer dimension for Contoso: surrogate key, effective dates, current flag.'], [20, 'Write one paragraph on what breaks in reporting when a Type 1 was used and history was needed.']],
    p: [[10, 'Review queue.'], [15, 'Say the three SCD types aloud with an example of each.']],
    s: 'If the business ever asks what a customer looked like last year, the dimension has to keep history, and that decision has to be made before the data is loaded.',
    a: ['SCD Type 1 vs 2 vs 3', 'surrogate key', 'effective dating'] },

  { t: 'ETL, lineage and the source-to-target map', th: 'The document a BSA is actually asked to produce.',
    d: [[25, 'ETL vs ELT. Write where each fits and why cloud warehouses shifted the default.'], [35, 'Build a real source-to-target mapping for your portfolio 1 data: source field, transformation rule, target field, owner.'], [15, 'Add a lineage note: for one headline number, trace it back to source.']],
    p: [[10, 'Review queue.'], [15, 'Glossary Tier 3 sweep.']],
    s: 'A source-to-target map is how a business answers "where did this number come from" without a three-day investigation.',
    a: ['ETL vs ELT', 'source-to-target mapping', 'data lineage'] },

  { t: 'Process mapping in BPMN', th: 'As-is and to-be, drawn to a standard.',
    d: [[25, 'Learn the eight BPMN symbols you will actually use: task, gateway, event, pool, lane, flow, message, annotation.'], [30, 'Draw the as-is process for how your portfolio 1 report is produced manually today.'], [20, 'Draw the to-be with your dashboard in place. Mark every handoff removed.']],
    p: [[10, 'Review queue.'], [15, 'Explain your as-is diagram aloud as if to the process owner.']],
    s: 'I map the process before I propose the system, because most of the waste sits in handoffs rather than in the tool.',
    a: ['BPMN core symbols', 'pools vs lanes', 'handoff as waste'] },

  { t: 'Stakeholder analysis and RACI', th: 'Named in most ads. Cheap to learn, easy to demonstrate.',
    d: [[25, 'Build a power/interest grid for the stakeholders in your portfolio 1 scenario.'], [25, 'Build a RACI for delivering that report. One accountable person per row, no exceptions.'], [20, 'Write three sentences on how you would handle two stakeholders who both want to be accountable.']],
    p: [[10, 'Review queue.'], [15, 'Glossary: stakeholder and governance terms.']],
    s: 'A RACI with two accountable people is not a RACI, it is a delay waiting to happen, so I force that conversation early.',
    a: ['power/interest grid', 'RACI', 'accountable vs responsible'] },

  { t: 'Prioritisation under conflict', th: 'The interview question you will definitely get.',
    d: [[25, 'MoSCoW your portfolio 1 requirements. Justify every Must.'], [25, 'Build a weighted scoring model: value, effort, risk, dependency. Score six requirements.'], [20, 'Write the script for telling a senior stakeholder their request is a Could, not a Must.']],
    p: [[10, 'Review queue.'], [15, 'Say the script aloud twice. Time it. Under 60 seconds.']],
    s: 'I prioritise on value against effort and risk, and I put the tradeoff in front of the stakeholders rather than deciding it quietly on their behalf.',
    a: ['MoSCoW', 'weighted scoring', 'the deprioritisation conversation'] },

  { t: 'Traceability and change control', th: 'The thread from objective to delivered feature.',
    d: [[30, 'Build a requirements traceability matrix for your portfolio 1 BRD: objective, requirement, design, test, status.'], [25, 'Write a change request for one scope change, including impact on cost, time and risk.'], [15, 'Write down the three questions you ask before accepting any change.']],
    p: [[10, 'Review queue.'], [15, 'Glossary: change and delivery terminology.']],
    s: 'Traceability means every delivered feature can be pointed back to a business objective, which is also how you kill work that cannot.',
    a: ['traceability matrix', 'change request contents', 'impact assessment'] },

  { k:1, t: 'Portfolio 3: scope and model', th: 'Third domain. Different again. This one leads with the requirement.',
    d: [[20, 'Pick a third dataset from reference/datasets.md. Write the business question in one sentence.'], [25, 'Write the one-page BRD before touching the data.'], [30, 'Clean in Power Query and build the star schema.']],
    p: [[10, 'Review queue.'], [10, 'Applications. Submit two.']],
    s: 'This one starts with the requirement document and ends with the report, which is the sequence a Business Systems Analyst is actually paid for.',
    a: ['portfolio 3 business question'] },

  { k:1, t: 'Portfolio 3: build and measure', th: 'Restraint again. Six to eight measures.',
    d: [[30, 'Build the measures that answer the question. No more than eight.'], [30, 'Build the single-page report: headline, trend, breakdown, detail.'], [15, 'Run Performance Analyzer. Record the numbers.']],
    p: [[10, 'Review queue.'], [10, 'Look at 3 public dashboards for layout ideas.']],
    s: 'Eight measures that answer the question beat thirty that describe the data.',
    a: ['portfolio 3 measure set'] },

  { k:1, t: 'Portfolio 3: write-up and publish', th: 'The artifact is the explanation, not the file.',
    d: [[35, 'Write the case study in reference/portfolio.md: problem, approach, model decisions and why, findings, next steps.'], [20, 'Screenshot the report, the model view and the source-to-target map.'], [15, 'Add to CV and LinkedIn as a named project.']],
    p: [[10, 'Review queue.'], [15, 'Practise the 2-minute walkthrough aloud. Twice.']],
    s: 'The dashboard shows what I built; the write-up shows how I decided, and interviewers hire the second one.',
    a: ['portfolio 3 two-minute walkthrough'] },

  { t: 'Excel as a BA tool', th: 'Still the format every stakeholder sends you.',
    d: [[25, 'Pivot tables and slicers against your portfolio data. Rebuild one dashboard visual in Excel.'], [25, 'XLOOKUP, SUMIFS, INDEX/MATCH. Five each against real data.'], [20, 'Power Query in Excel: clean one messy sheet and refresh it.']],
    p: [[10, 'Review queue.'], [15, 'Read 3 ads. Count how many list advanced Excel as essential.']],
    s: 'Half of the reporting I will inherit lives in Excel, and being fluent there is how I find out what the business actually measures.',
    a: ['XLOOKUP vs INDEX/MATCH', 'SUMIFS', 'Power Query in Excel'] },

  { t: 'The stack a BSA is expected to name', th: 'Vocabulary, not certification.',
    d: [[25, 'SQL Server, Azure SQL, Synapse, Fabric, Databricks. One sentence each on what it is and when it appears.'], [25, 'Write where your Power BI work sits in each of those architectures.'], [20, 'Take the five most common stack phrases from your saved job ads and write your honest answer to "what is your experience with this".']],
    p: [[10, 'Review queue.'], [15, 'Say the five honest answers aloud. No overclaiming, no apologising.']],
    s: 'I have not run a Synapse warehouse, but I know what sits where in that architecture and where my work would plug into it.',
    a: ['Azure data stack map', 'your honest stack answers'] },

  { k:1, t: 'Interview drilling: technical', th: 'Speed and precision on the eight questions that always come up.',
    d: [[30, 'Answer the 8 standard technical questions in writing. Under 90 seconds each when spoken.'], [25, 'Add month 2 material: context transition, SCD types, RLS, traceability. Four more answers.'], [20, 'Record yourself on three of them. Listen back. Cut the filler.']],
    p: [[10, 'Review queue.'], [15, 'All 12 answers aloud, no notes.']],
    s: 'All twelve, out loud, under 90 seconds each.',
    a: ['the 12 technical answers'] },

  { k:1, t: 'Interview drilling: STAR and scenarios', th: 'The half of the interview that is not technical.',
    d: [[30, 'Refresh all six STAR stories with month 2 evidence. Each under 2 minutes.'], [25, 'Four scenario answers: conflicting requirements, a number nobody trusts, a missed deadline, a stakeholder who will not engage.'], [20, 'Five questions to ask them, specific to their reporting maturity.']],
    p: [[10, 'Review queue.'], [15, 'Mock interview in your other Claude chat. Use prompts/tutor-prompt.md.']],
    s: 'All six stories and all four scenarios, timed, no notes.',
    a: ['4 scenario answers', 'questions to ask them'] },

  { k:1, t: 'Applications burst', th: 'Volume day. No learning, just pipeline.',
    d: [[30, 'Six applications across all three geographies. Log every one in tracking/applications.md.'], [25, 'Tailor the CV summary line to the three strongest of them.'], [20, 'Follow up every agency contacted in month 1 that has not replied.']],
    p: [[10, 'Review queue.'], [15, 'Read every rejection and interview note you have logged. Write what the market is telling you.']],
    s: 'I am applying at 70 to 80 percent match, because job descriptions are wish-lists and self-rejection costs more than a rejection does.',
    a: [] },

  { t: 'Data quality framework write-up', th: 'A reusable artifact you can hand to an interviewer.',
    d: [[30, 'Write a one-page data quality framework: the five dimensions, how you measure each, who owns each.'], [25, 'Apply it to your portfolio 3 dataset. Score it honestly and record the gaps.'], [20, 'Add it to reference/portfolio.md as a named artifact.']],
    p: [[10, 'Review queue.'], [15, 'Explain the framework aloud in 90 seconds.']],
    s: 'I score data on completeness, accuracy, consistency, timeliness and validity, and I name an owner for each, because unowned quality is nobody quality.',
    a: ['data quality framework', 'quality ownership'] },
];

// --- gather the weighting ---------------------------------------------------
function weakTopics() {
  const start = L.getStartDate();
  const schedule = L.buildSchedule(start);
  const rows = L.parseProgress(L.read(L.P.progress));
  const plan = L.parsePlan(L.read(L.P.month1));
  const byBlock = Object.fromEntries(plan.map((d) => [d.block, d]));

  const scored = [];
  for (const s of schedule) {
    const r = rows[s.day];
    const day = byBlock[s.block];
    if (!day || !day.desk.length) continue;      // skip consolidation blocks
    if (!r || r.conf === null) continue;
    scored.push({ block: s.block, conf: r.conf, day });
  }

  // Items that scored 1 or 2 in the review queue count as weak too.
  let queueWeak = [];
  try {
    const f = L.readQueueFile();
    queueWeak = f.queue
      .filter((i) => i.hist.length && i.hist[i.hist.length - 1] <= 2)
      .map((i) => i.prompt);
  } catch (e) { /* queue not seeded yet */ }

  scored.sort((a, b) => a.conf - b.conf || a.block - b.block);
  return { scored, queueWeak, coverage: scored.length };
}

// --- rendering --------------------------------------------------------------
function renderDay(n, body) {
  const desk = body.d.map(([m, t]) => `- [ ] ${m} min - ${t}`).join('\n');
  const phone = body.p.map(([m, t]) => `- [ ] ${m} min - ${t}`).join('\n');
  const dmin = body.d.reduce((a, b) => a + b[0], 0);
  const pmin = body.p.reduce((a, b) => a + b[0], 0);
  const adds = body.a && body.a.length ? `\n**Adds to review queue:** ${body.a.join(' · ')}\n` : '';
  return `## Day ${String(n).padStart(2, '0')} - ${body.t}
**Theme:** ${body.th}

**DESK (${dmin} min)**
${desk}

**PHONE (${pmin} min)**
${phone}

**Say It Out Loud:** ${body.s}
${adds}`;
}

function renderSunday(n, week, focus) {
  const p = [
    [15, 'Full review queue sweep.'],
    [10, focus],
    [5, 'Applications check. Reply to anything waiting. Log it.'],
  ];
  const pmin = p.reduce((a, b) => a + b[0], 0);
  return `## Day ${String(n).padStart(2, '0')} - SUNDAY: consolidation (phone only)
**No desk block.**

**PHONE (${pmin} min)**
${p.map(([m, t]) => `- [ ] ${m} min - ${t}`).join('\n')}

**Say It Out Loud:** ${week < 4
    ? `${60 + week * 10}-second summary of week ${week}, as if answering "so what have you been working on?"`
    : 'The full 2-minute portfolio 3 walkthrough, then your 30-second introduction. No notes.'}

**Weekly checkpoint:** Claude Code reviews \`tracking/progress.md\` and adjusts the coming week.
`;
}

function reteachDay(n, entry) {
  const topic = (entry.day.adds[0] || entry.day.title).replace(/\.$/, '');
  // Strip the original task's own "40 min —" prefix, or the day ends up
  // carrying two contradictory timings.
  const original = (entry.day.desk[0] || 'the original desk work for that day')
    .replace(/^\d+\s*min\s*[-—–]\s*/, '');
  return {
    t: `Re-teach: ${topic}`,
    th: `Scored ${entry.conf} in month 1. Second pass, cold, from memory.`,
    d: [
      [20, `Write out what "${topic}" is and why a business cares, from memory, no notes. Then check against \`reference/glossary.md\` and mark every gap.`],
      [30, `Redo the Day ${String(entry.block).padStart(2, '0')} desk work cold: ${original}`],
      [15, `Write the 60-second business-language answer for "${topic}" and add it to \`reference/portfolio.md\`.`],
    ],
    p: [[10, 'Review queue.'], [15, `Say the 60-second answer for "${topic}" aloud, twice, without reading it.`]],
    s: entry.day.say || `Here is what ${topic} is, and here is why it changes what a business does.`,
    a: [topic],
  };
}

// --- build ------------------------------------------------------------------
function main() {
  const { scored, queueWeak, coverage } = weakTopics();
  const weak = scored.filter((s) => s.conf <= 2);
  const middling = scored.filter((s) => s.conf === 3);
  const reteach = [...weak, ...middling].slice(0, 6);

  console.log(`Confidence data found for ${coverage} of the 24 working days in month 1.`);
  if (!coverage) {
    console.log('No confidence scores logged. Month 2 will be generated unweighted,');
    console.log('which is the weakest possible version of it. Fill in tracking/progress.md first.');
  } else {
    console.log(`Scored 1 or 2: ${weak.length}.  Scored 3: ${middling.length}.`);
    console.log(`Re-teach days being generated: ${reteach.length}`);
    for (const r of reteach) console.log(`  D${String(r.block).padStart(2, '0')} conf ${r.conf}  ${r.day.adds[0] || r.day.title}`);
    if (queueWeak.length) {
      console.log(`Review queue items still scoring 1 or 2 (${queueWeak.length}):`);
      for (const q of queueWeak.slice(0, 10)) console.log(`  - ${q}`);
    }
  }

  // 28 days: positions 7, 14, 21, 28 are consolidation, matching month 1.
  // Re-teach days go at the front and displace flexible bank days only. The
  // kept days close the month and are never dropped.
  const keep = BANK.filter((b) => b.k);
  const flex = BANK.filter((b) => !b.k);
  const room = Math.max(0, 24 - reteach.length - keep.length);
  const working = [
    ...reteach.map((r) => reteachDay(0, r)),
    ...flex.slice(0, room),
    ...keep,
  ].slice(0, 24);
  if (working.length < 24) throw new Error(`bank too small: only ${working.length} of 24 working days filled`);

  const sundayFocus = [
    'Say aloud, no notes: the weakest thing you re-taught this week, and why a business cares.',
    'Say aloud, no notes: context transition in DAX, and slowly changing dimensions.',
    'Walk through portfolio 3 aloud, no notes.',
    'Read tracking/progress.md from Day 1 of month 1. Honest two-month summary.',
  ];

  const parts = [];
  let wi = 0;
  for (let n = 1; n <= 28; n++) {
    if (n % 7 === 0) {
      parts.push(renderSunday(n, n / 7, sundayFocus[n / 7 - 1]));
    } else {
      parts.push(renderDay(n, working[wi++]));
    }
  }

  const header = `# Month 02 - Days 1 to 28

**Generated ${L.iso(L.today())} by \`scripts/new-month.js\`, weighted by month 1 confidence scores.**

**Goal by Day 28:** a third portfolio artifact with a full requirements-to-reporting trail, twelve technical answers and six STAR stories deliverable cold, and a live pipeline with interviews in it.

**Every day:** DESK block (60-75 min) + PHONE block (20-30 min) + one Say It Out Loud + one line in \`tracking/progress.md\`.

**Days 7, 14, 21 and 28 are phone-only consolidation days.** Same as month 1. Recovery is written in.

**Weighting applied:** ${reteach.length} re-teach day(s) at the front of the month, generated from the lowest confidence scores in month 1. ${reteach.length ? 'Topics: ' + reteach.map((r) => r.day.adds[0] || r.day.title).join(' · ') : 'No confidence data was available, so nothing was displaced.'}

**Before you start:** run \`node scripts/seed-queue.js\` against this file if you want month 2 items in the review queue, and set a new \`START_DATE\` in \`tracking/config.md\`.

---

`;

  const out = header + parts.join('\n---\n\n');

  if (dry) {
    console.log('\nDry run. plan/month-02.md was not written.');
    return;
  }
  L.write(L.P.month2, out);
  console.log(`\nWrote plan/month-02.md: 28 days, 24 desk days, 4 consolidation days.`);
  console.log('Read it before Day 1. It is generated, not authored. Change anything that is wrong.');
}

main();
