# Day 15 — DAX: measures vs calculated columns

On your Northwind model from Day 13.

**The distinction in one line:** a calculated column is computed once at refresh
and stored in memory; a measure is computed at query time, in whatever filter
context the visual gives it.

---

## 1. Five measures (write the DAX, record the number)

| # | Measure | Your DAX | Total, no filters | Expected |
|---|---|---|---|---|
| 1 | Total Revenue | | | **£448,386,633.17** |
| 2 | Total Quantity | | | |
| 3 | Order Count | | | **16,282** |
| 4 | Average Order Value | | | **£27,538.79** |
| 5 | Distinct Customers | | | **93** |

> **Measure 1 is the one that teaches something.** Revenue is per-line
> arithmetic — `Quantity * UnitPrice * (1 - Discount)` — and `SUM` cannot do
> per-row arithmetic. You need `SUMX`, which iterates the table and then adds up
> the results. If your total doesn't match, check whether you multiplied before
> or after summing. That is the same mistake as the Day 3 fan-out, in a new
> language.

**Measure 3:** count the *orders*, not the order lines. If you get 609,283 you
counted the wrong table.

---

## 2. Five calculated columns

| # | Column | On which table | Your DAX |
|---|---|---|---|
| 6 | Line total | | |
| 7 | Price band (High/Medium/Low) | | |
| 8 | Order year | | |
| 9 | Full name | | |
| 10 | Discounted? Yes/No | | |

> **Column 10 is a finding, not just an exercise.** Only **0.1%** of order lines
> in this build carry any discount. Note that before you build anything on it —
> "the discount analysis is meaningless because almost nothing is discounted" is
> exactly the kind of thing a BA is paid to notice and say out loud early.

---

## 3. SUM vs SUMX, and DIVIDE (25 min)

**The rule for when SUM cannot do the job:**

-

### DIVIDE vs `/`

Build Average Order Value twice — once with `/`, once with `DIVIDE`. Then filter
the visual to something that returns no rows.

- **What `/` did:**
- **What `DIVIDE` did:**
- **Which one you would ship, and why:**

-

---

## 4. The rule, in your own words (15 min)

**Measure when:**

-

**Calculated column when:**

-

**The test I apply:**

-

### The performance question

If this model got slow, which of your ten would you delete first, and why?

-

> Calculated columns cost memory on every row, at every refresh, whether anything
> uses them or not. On a 609,283-row fact table that adds up. Measures cost
> nothing until a visual asks for them. **That asymmetry is the whole answer** —
> and it's why "just make it a calculated column, it's easier" is the wrong
> instinct on a fact table and a fine one on a 77-row dimension.

---

## Say it out loud before you close the file

"Calculated columns compute once at refresh and sit in memory; measures compute
at query time in filter context. The wrong choice gives you a slow report or a
wrong one."

Then say which of your own ten you'd defend as a column and why.
