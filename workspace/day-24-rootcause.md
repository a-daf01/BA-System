# Day 24 — As-is / to-be and root cause

**Root-cause investigation is named directly in senior BSA ads, and it's your
natural strength.** Today makes it something you can say rather than something
you can do.

---

## 1. As-is (20 min)

How would your portfolio 1 report be produced **today**, manually, by a real
person? Capture reality including the ugly parts. Do not fix anything yet.

| Step | Who does it | How long | What can go wrong |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

**Total elapsed time, request to answer:**

**Where it breaks most often:**

> Resist writing the tidy version. The value of an as-is map is that it shows the
> re-keying, the emailed spreadsheet, the one person who knows the tab order.
> A clean as-is means you mapped the process someone described, not the one that
> happens.

---

## 2. To-be (20 min)

The same process with your dashboard in place.

| Step | Who does it | How long | What can go wrong |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Total elapsed time:**

### Gap analysis

| Gap between as-is and to-be | Does my work close it? | If not, what would? |
|---|---|---|
| | | |
| | | |
| | | |
| | | |

**Be honest in column 2.** Naming the gaps your solution *doesn't* close is what
makes the rest of the analysis credible. Everyone claims their thing fixed
everything; nobody believes them.

---

## 3. The formal root-cause write-up (30 min)

**Use the £206m freight number from Day 3** if nothing better came out of
portfolio 1. It's genuine, you found it yourself, and you can describe every step
of it from memory — which is exactly what makes it a good interview story.

Alternatives from your own month, if you'd rather:
- The Day 13 relationship you set to both-directional and the number that moved.
- The 2023 "revenue collapse" that was a partial year (Day 17).
- The Day 2 `BETWEEN` query that lost 7 orders.

### The incident

**Title:**

### 1. Symptom

*What looked wrong, and who would have noticed. If nobody would have noticed,
say that — silent wrongness is the point.*

>

### 2. Data trace

*What you checked first, and what it ruled out. Show the order of elimination.*

>

### 3. Calculation logic

*Where the number was actually formed.*

>

### 4. Model / system configuration

*What in the structure permitted it.*

>

### 5. Root cause

**One sentence. No hedging, no "possibly".**

>

### 6. Fix, and prevention

*What you changed, and what stops it recurring — a check, a test, a habit.*

>

---

## The spoken version

This becomes STAR story #2 on Day 27 and a permanent 30-day review item. Write
what you'd actually *say*, under 90 seconds:

**Situation:**
>

**Task:**
>

**Action:**
>

**Result:**
>

> **The strongest version of this story admits the first attempt was wrong.**
> On Day 3 you wrote a query that returned the right answer for a reason that
> couldn't have been true, and you spotted the fan-out only when you checked the
> row counts. Told honestly, that's better than a story where you were right
> immediately — it demonstrates the checking habit, which is the actual skill
> being hired.

---

## Say it out loud before you close the file

"When a report is wrong I trace it back through the data, the calculation logic
and the system configuration until I find where it actually diverges. I don't
patch the symptom."

Then the whole 90-second story, timed.
