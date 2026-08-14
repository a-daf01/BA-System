# Day 16 — CALCULATE and filter context

**Expect discomfort today.** This is the hardest concept in Power BI and almost
nobody gets it on the first pass. Struggling here is the day working correctly,
not you failing it. The phone block deliberately gives you a *second* explanation
from a different source, because this one genuinely needs two.

**The one-line idea:** every measure is evaluated inside a set of active filters —
the *filter context*. Whatever visual it sits in supplies that context. `CALCULATE`
is the function that changes it.

---

## 1. Ten CALCULATE variations (35 min)

All on your `Total Revenue` measure. Each is one line.

| # | What | Your DAX | Result | Expected |
|---|---|---|---|---|
| 1 | Beverages only | | | **£92,163,184.18** |
| 2 | Customers in Germany | | | |
| 3 | 2016 only | | | **≈£40,568,672** |
| 4 | Beverages **and** Confections | | | |
| 5 | Everything **except** Beverages | | | |
| 6 | Unit price above £50 | | | |
| 7 | Beverages **in** 2016 | | | |
| 8 | Beverages **or** German customers | | | |
| 9 | High price band only | | | |
| 10 | Filter that fights the visual | | | |

### The three that teach something

**#5 — "except".** There are two ways: `NOT` inside the filter, or `ALL` plus a
re-filter. Write both and say which reads better in six months.

-

**#8 — "or" across two different tables.** The simple `CALCULATE(x, A, B)` form
gives you AND, always. There is no comma that means OR. You need `FILTER` over a
table, with `||`. Write down *why* the simple form can't express it:

-

**#10 — who wins.** Put measure 1 in a table sliced by category, and look at the
`Confections` row.

- **What the Confections row shows:**
- **Which filter won:**
- **Why:**

-

> `CALCULATE` **overwrites** the filter on any column it names, and leaves every
> other filter in place. That's the whole rule. Say it back in your own words —
> if you can say this one sentence cleanly you can answer most DAX interview
> questions.

---

## 2. ALL, ALLEXCEPT, FILTER — the % of total (25 min)

Build a **% of total revenue** measure and put it in a table by category.

**Your DAX:**

```

```

**Check:** the percentages must sum to **100.0%**. If they don't, your `ALL` is
in the wrong place — it's either removing too much or not enough.

- [ ] Sums to 100

**ALL vs ALLEXCEPT — the difference in one line:**

-

**When you'd use ALLEXCEPT instead:** (% of *category* total rather than % of
grand total)

-

---

## 3. Filter context in writing (15 min)

Under 100 words. No jargon. Then read it aloud and cut anything a non-technical
manager wouldn't follow.

>

**Word count:** ______

> The test: could your old manager read this and know what you meant? If it
> contains "evaluation context" or "row context" you have described it to another
> analyst, not to a stakeholder. Both are useful; today's job is the second one.

---

## Say it out loud before you close the file

"CALCULATE modifies the filter context a measure evaluates in. That's the whole
idea — everything else in DAX is a variation on it."

Then your under-100-words explanation, from memory.
