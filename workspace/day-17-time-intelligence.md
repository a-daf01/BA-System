# Day 17 — Time intelligence

On your Northwind model. Your `DimDate` must be **marked as a date table** or
none of today works.

---

## 1. YTD, QTD, MTD (25 min)

All three in one table, sliced by month.

| Measure | Your DAX |
|---|---|
| Revenue YTD | |
| Revenue QTD | |
| Revenue MTD | |

- **Sanity check:** December's YTD should equal the full-year total.
- [ ] It does

**What MTD gives you that a plain month filter doesn't:**

-

---

## 2. Year on year (25 min)

| Measure | Your DAX |
|---|---|
| Revenue LY (`SAMEPERIODLASTYEAR`) | |
| YoY variance (£) | |
| YoY variance (%) | |

Slice by year. You'll see:

| Year | Revenue |
|---|---|
| 2021 | £41.4m |
| 2022 | £39.7m |
| **2023** | **£33.1m** |

### That 2023 drop is not a drop

**The data stops on 28 October 2023.** 2023 is ten months of trading being
compared against twelve. Revenue per month is actually *steady*.

This is the single most common way a real year-on-year chart lies, and it lies
*quietly* — no error, no blank, just a plausible-looking 17% fall that somebody
takes to a board meeting.

**The sentence you'd put on the dashboard so nobody reads it as a collapse:**

>

**How you'd check for this on a dataset you'd never seen before — the actual
query or step:**

-

> This is a sibling of the Day 2 `BETWEEN` bug and the Day 3 fan-out. All three
> are the same species: **the query is fine, the number is wrong, and nothing
> errors.** That family of bug is what separates someone who has shipped a report
> from someone who has done a course, and being able to name all three is a
> genuinely strong interview answer.

**Two ways to handle it properly in the report:**

1.
2.

---

## 3. Break the date table (20 min)

Table tools → your date table → **unmark** it as a date table.

- **What happened to YTD:**
- **What happened to SAMEPERIODLASTYEAR:**
- **Did anything throw an error, or did it just go wrong quietly?**

-

**Why time intelligence needs a marked date table** — what is Power BI actually
guaranteed once you mark it?

-

- [ ] Marked it again

---

## Say it out loud before you close the file

"Time intelligence only works against a properly marked date dimension — and
before I report a year-on-year fall I check whether the current period is
complete."

Then tell the 2023 story as if a manager had just asked you why sales collapsed.
That is a two-minute answer that makes you sound like someone who has done this.
