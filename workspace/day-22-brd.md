# Day 22 — Business Requirements Document

**Scenario:** you are the BSA for the organisation behind your portfolio 1
dataset. They want the report you built turned into a recurring monthly product,
owned by them, not by you.

**BRD is the most-named artifact across every job ad collected.** This template is
the one you reuse on Day 25 for portfolio 2, which is why that day only needs 25
minutes for it.

---

## 1. BRD vs FRD vs SRS (20 min)

| | BRD | FRD | SRS |
|---|---|---|---|
| **What it states** | | | |
| **Who reads it** | | | |
| **Who signs it** | | | |
| **Typical length** | | | |
| **One line from your scenario** | | | |

**What goes wrong when a BRD and an FRD get merged into one document:**

-

> The answer interviewers are listening for is about **scope creep and
> sign-off**. A BRD says *what the business needs and why*; an FRD says *what the
> system must do*. Merge them and nobody can approve the business need without
> also approving a technical design they can't evaluate — so either the wrong
> people sign off, or nothing gets signed off at all.

---

## 2. The BRD (35 min)

Every heading gets content. **An empty Assumptions section is the most common
real-world failure** and it is exactly where scope creep starts.

### Document control

| | |
|---|---|
| Title | |
| Author | Ahmed |
| Version | 0.1 |
| Date | |
| Status | Draft |

### 1. Business objective

*Why this exists, in business terms. One paragraph. No mention of Power BI.*

>

### 2. Background / current state

*How this is done today, and what it costs — hours, errors, delay, risk.*

>

### 3. Scope

**In scope:**
-
-
-

**Out of scope:** *(this section is doing more work than any other — it is what
you point at in month three)*
-
-
-

### 4. Stakeholders

| Role | Name / title | Interest | Sign-off? |
|---|---|---|---|
| Sponsor | | | |
| Report consumer | | | |
| Data owner | | | |
| Technical delivery | | | |

### 5. Business requirements

Number them. Every one testable, every one traceable to the objective.

| ID | Requirement | Priority (MoSCoW) | Traces to objective |
|---|---|---|---|
| BR-01 | | | |
| BR-02 | | | |
| BR-03 | | | |
| BR-04 | | | |
| BR-05 | | | |

### 6. Success criteria

*How you will know this worked. Numbers, not adjectives.*

-
-
-

### 7. Assumptions

*What you are taking as true without having verified it. If it turns out false,
the estimate changes.*

-
-
-

### 8. Constraints and dependencies

-
-

### 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| | | | |
| | | | |

---

## 3. Non-functional requirements (15 min)

**Every NFR needs a number in it.** "Fast" is not a requirement. "Renders in under
5 seconds against 3 years of data" is one, because you can fail it.

| ID | Type | Requirement | How it would be tested |
|---|---|---|---|
| NFR-01 | Refresh frequency | | |
| NFR-02 | Access control | | |
| NFR-03 | Performance | | |

**Why NFRs are chronically under-specified in real projects:**

-

> "Tell me about a non-functional requirement" is a favourite interview probe
> precisely because most candidates can define one and can't produce a *testable*
> one. Having three written down with numbers and test methods attached puts you
> ahead of most people applying.

---

## Say it out loud before you close the file

"A BRD states what the business needs and why; an FRD states what the system must
do to deliver it. Conflating them is where scope creep starts."

Then read your Out of Scope list aloud and ask yourself whether it would actually
hold if the sponsor pushed. If not, it's not specific enough.
