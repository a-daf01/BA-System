# Glossary — the language you need to speak

Every term here appeared in the real job ads collected during market research. This isn't vocabulary for its own sake — it's the register hiring managers use, and using it back fluently is a large part of what "sounds experienced" means.

**How to use this on your phone:** read the term, cover the definition, say your version aloud, then check. Recognition isn't recall.

---

## Tier 1 — say these without hesitating

**Business Analyst (BA)** — bridges business need and delivered solution. Elicits, documents and validates requirements.

**Business Systems Analyst (BSA)** — the technical variant. Same bridging role, but with hands on data models, system configuration and root-cause investigation. **This is your target title.**

**Stakeholder** — anyone affected by, or able to affect, the work. Ranges from an end user to a sponsor.

**Requirement** — a stated need the solution must satisfy.

**Functional requirement** — what the system must *do*. "The system must generate a monthly variance report."

**Non-functional requirement (NFR)** — how well it must do it. Performance, security, availability, usability. Chronically under-specified, and a favourite interview probe.

**BRD — Business Requirements Document** — states what the business needs and why. Written for business readers. The single most-named artifact across the job ads.

**FRD — Functional Requirements Document** — states what the system must do to meet the BRD. Written for delivery teams.

**Elicitation** — actively drawing requirements out of stakeholders. Not "collecting" — people rarely state what they actually need.

**As-is / To-be** — current state vs target state.

**Gap analysis** — the named difference between as-is and to-be, and what's needed to close it.

**KPI** — a measure tied to an objective. If nobody would act differently based on it, it isn't one.

**MI — Management Information** — UK term for operational reporting to management. **Appears in UK job titles ("MI Analyst") with no Gulf equivalent — search for it.**

---

## Tier 2 — delivery and agile

**User story** — "As a [role], I want [capability], so that [benefit]."

**Acceptance criteria** — the testable conditions that make a story done. Given/When/Then format. Without them, "done" is an opinion.

**UAT — User Acceptance Testing** — business users verifying the solution meets the requirement before go-live.

**Traceability** — the documented thread from business objective → requirement → design → test → delivered feature. Named explicitly in several ads.

**Backlog** — the prioritised queue of work.

**MoSCoW** — Must / Should / Could / Won't. Prioritisation framework.

**Scope creep** — uncontrolled growth of scope, usually because requirements were vague or sign-off was skipped.

**Change control** — the process for assessing and approving changes to agreed scope.

**Stage gate** — a formal checkpoint that must be passed before a project proceeds.

**BPMN** — Business Process Model and Notation. The standard for drawing processes.

---

## Tier 3 — data and modelling (your differentiator)

**Primary key / Foreign key** — unique row identifier / the reference to another table's key.

**Cardinality** — the nature of a relationship: one-to-one, one-to-many, many-to-many.

**Normalisation** — structuring data to reduce redundancy. 3NF is the usual working target. Protects integrity on the transactional side.

**Denormalisation** — deliberately reintroducing redundancy for read performance. What reporting usually wants.

**Transactional data** — records of events. Orders, trades, transactions. High volume, constantly changing.

**Reference data** — the relatively static lookups that give transactions meaning. Currencies, product codes, counterparties. **Named explicitly in BSA ads — know the distinction cold.**

**Fact table** — the measures. Numeric, high row count.

**Dimension table** — the descriptive attributes you slice by. Date, product, customer, region.

**Star schema** — one fact table surrounded by dimension tables. The standard reporting model.

**Snowflake schema** — a star with normalised dimensions. More joins, less redundancy.

**Data mart** — a subject-focused subset of a warehouse, built for one business area's reporting.

**Data lineage** — where a number came from and everything that happened to it on the way.

**Single source of truth** — one agreed authoritative place for a given figure. The thing organisations claim to have and usually don't.

**ETL / ELT** — Extract, Transform, Load. The pipeline moving data from source to reporting.

**Data quality** — completeness, accuracy, consistency, timeliness, validity. Being able to name these dimensions is a credibility marker.

**Root cause analysis** — tracing a symptom back through data, calculation logic and system configuration to the actual origin. **Your natural strength. Named directly in senior BSA ads.**

---

## Tier 4 — Power BI and DAX

**Power Query** — the transformation layer. Where data quality gets handled before it reaches the model.

**Applied steps** — the recorded transformation history. Name them; someone will audit them.

**Measure** — evaluated at query time, within filter context. Not stored.

**Calculated column** — evaluated at refresh, stored in the model, consumes memory.

**Filter context** — the set of filters active when a measure is evaluated. **The central concept in DAX.**

**CALCULATE** — modifies filter context. Everything else in DAX is a variation on this.

**Date dimension** — a dedicated, marked date table. Time intelligence functions don't work correctly without one.

**Time intelligence** — YTD, QTD, MTD, year-on-year comparisons.

---

## Terms you meet in the wild

Add anything unfamiliar from job ads here, then move it into a tier once you can define it aloud.

- 
