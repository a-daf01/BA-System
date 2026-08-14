# Day 23 — User stories, acceptance criteria, UAT

Same scenario as Day 22. Open `day-22-brd.md` beside this — every story here
should trace back to a `BR-` requirement in it.

---

## 1. Six user stories (25 min)

Format: **As a [role], I want [capability], so that [benefit].**

The `so that` is the part people drop, and it's the only part that tells you
whether the story is worth building.

**Draw from at least three different roles.** The report consumer is not the only
stakeholder — that's the mistake this exercise is designed to catch.

| Role | What they actually care about |
|---|---|
| Operational manager | the number, monthly, without asking anyone |
| Finance / commissioner | the number reconciling to their own figures |
| Data owner | not being asked for a manual extract every month |
| Service lead | the breakdown for *their* area only |
| IT / information governance | who can see what, and where it's stored |

| ID | Story | Traces to | Priority |
|---|---|---|---|
| US-01 | As a … I want … so that … | BR-0_ | |
| US-02 | | | |
| US-03 | | | |
| US-04 | | | |
| US-05 | | | |
| US-06 | | | |

---

## 2. Acceptance criteria (25 min)

Given / When / Then, for each story. **At least one negative case** — what should
happen when the data is missing, late, or wrong.

### US-01
- **Given** …
- **When** …
- **Then** …

### US-02
- **Given**
- **When**
- **Then**

### US-03
- **Given**
- **When**
- **Then**

### US-04
- **Given**
- **When**
- **Then**

### US-05
- **Given**
- **When**
- **Then**

### US-06 — the negative case
- **Given** the monthly source file has not arrived
- **When**
- **Then**

> A report that silently shows last month's number when this month's data is
> missing is worse than one that shows an error. **Say that out loud** — it's a
> data-quality answer wearing a user-story costume, and it's the kind of thing
> that makes an interviewer sit up.

---

## 3. UAT (20 min)

| # | Scenario | Steps | Expected result | Pass / Fail criteria |
|---|---|---|---|---|
| UAT-01 | | | | |
| UAT-02 | | | | |
| UAT-03 | | | | |
| UAT-04 | | | | |
| UAT-05 | | | | |

**Who signs it off:**

**What happens if they don't sign:**

-

**How you'd handle a stakeholder who says "it looks fine" without actually
testing it:**

-

> That last one is a real BA problem and a real interview question. The answer
> involves making the test *specific and small enough to actually do* — "confirm
> the March total matches your own figure" gets done; "please review the
> dashboard" does not.

---

## Say it out loud before you close the file

"Acceptance criteria are what make a story testable — without them, 'done' is an
opinion."

Then read US-06 and its criteria aloud, because the negative case is the one
you'll be asked to produce on the spot.
