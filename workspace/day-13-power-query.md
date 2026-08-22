# Day 12 — Power Query

**This is your known gap.** On Day 1 you hit date errors, clicked Remove Errors,
and wrote down that you had no idea what it did. Today closes that.

---

## The dataset (15 min, hard stop)

`data.gov.uk` → search **"local authority spending over £500"**.

Take the **first** result that is a `.csv`, is over 1,000 rows, and has a date
column. Do not look past the third candidate.

- **What I used:**
- **Rows on load:**
- **Columns on load:**

> **Hard stop at 15 minutes.** If it fights you, use `data/csv/Orders.csv` and
> log the swap in the brain dump. The exercise is the transformations. Government
> CSVs are structurally awful — that is *why* they're the exercise, not a reason
> to keep hunting for a tidier one.

---

## The seven transformations (40 min)

Do each at least once, in this order. Record what happened.

| # | Transformation | What I did | Rows after |
|---|---|---|---|
| 1 | Remove unneeded columns | | |
| 2 | Change type — and it errored | | |
| 3 | Change Type → Using Locale (`en-GB`) | | |
| 4 | Split column | | |
| 5 | Replace values | | |
| 6 | Remove duplicates | | |
| 7 | Unpivot columns to rows | | |

### Step 2 and 3 are the important pair

When the type change throws errors, **click an error cell and read the actual
value before doing anything else.**

- **What the failing value actually was:**
- **How many rows were affected:**
- **What fixed it:**

> UK dates are the usual culprit. Power BI guesses `en-US`, so `03/04/2024` is
> read as 4 March and `13/04/2024` fails outright. Change Type → Using Locale →
> English (United Kingdom) and the rows come back.

### Unpivot — say what it's for

Wide data (a column per month) is readable by humans and useless to a model.
Unpivot turns columns into rows so you can filter and aggregate on them.

- **Which columns I unpivoted:**
- **Shape before → after:**

---

## Applied Steps (20 min)

Rename every step to what it actually did. `Changed Type1` is not a name.

- **How many steps:**
- **The one whose default name was most misleading:**

### The Remove Errors answer

**What Remove Errors actually does to your rows:**

-

**Why "I removed the errors" is a bad answer in a BA interview:**

-

**What you do instead:**

-

---

## Say it out loud before you close the file

"Power Query is where I control data quality before it reaches the model — and
naming the applied steps means someone else can audit what I did."

Then the harder one, out loud: *"On my first attempt I removed errors without
knowing it was deleting rows. Now I read the failing value first."* That answer —
a mistake, named, with the corrected habit attached — is worth more in an
interview than never having made it.
