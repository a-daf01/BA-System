# Day 11 — Design the star

Yesterday you read Northwind's transactional model. Today you redesign it for
reporting. **Tomorrow you build exactly what you write here**, so this is a real
design document, not an exercise.

This is the Business Systems Analyst job in one page. Keep it — it's portfolio
material and it's the thing you'll be asked to talk through.

---

## 1. The grain statement (25 min)

Everything downstream depends on this. Write it first, in one sentence:

> **One row in my fact table represents ______________________________.**

Three candidates for Northwind. Pick one and cross out the others:

| Candidate grain | One row = | What you can measure | What you lose |
|---|---|---|---|
| **A — order line** | one product on one order | quantity, revenue, discount | nothing; finest available |
| **B — order** | one whole order | order count, freight, order value | can't analyse by product |
| **C — customer month** | one customer in one month | monthly spend per customer | can't analyse by product or order |

**Your choice:**

**Why, in two lines:**
-
-

> Freight is the interesting one. It's stored per *order*, not per line. If you
> pick grain A, freight does not belong in the fact table at that grain — putting
> it there is exactly the £206m bug from Day 3, baked permanently into a model.
> Say what you'll do with it instead.

---

## 2. The star (30 min)

### Fact table — `FactSales`

Measures and foreign keys only. No descriptive text, no names.

| Column | Type | Measure or FK? | Comes from |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

### Dimensions

You should land on five. Fill each one.

**DimProduct** — from:
| Column | Comes from |
|---|---|
| | |

**DimCustomer** — from:
| Column | Comes from |
|---|---|
| | |

**DimEmployee** — from:
| Column | Comes from |
|---|---|
| | |

**DimShipper** — from:
| Column | Comes from |
|---|---|
| | |

**DimDate** — generated, not from a source table. Needs: date key, year,
quarter, month number, month name, day of week. Range 2012 to 2023.
| Column | Notes |
|---|---|
| | |

### The three arguments worth having

**`UnitPrice`.** It exists on `Products` *and* on `[Order Details]`. They are not
the same number — one is the current list price, one is what was actually charged
on that line. Which goes in the fact, which in the dimension, and what breaks if
you use the wrong one?

-

**`Categories` and `Suppliers`.** Fold them into `DimProduct` → star. Leave them
as their own tables → snowflake. Pick one:

- **Decision:**
- **What you gain:**
- **What you give up:**

**`Discontinued`.** It's an attribute of the product *today*, but a product may
have been active when an old order was placed. Say in one line what a slowly
changing dimension is and whether you need one here.

-

---

## 3. Reference vs transactional (15 min)

Classify every Northwind table.

| Table | Reference or transactional? | Why |
|---|---|---|
| Categories | | |
| Customers | | |
| Employees | | |
| EmployeeTerritories | | |
| Order Details | | |
| Orders | | |
| Products | | |
| Regions | | |
| Shippers | | |
| Suppliers | | |
| Territories | | |

> **Reference data is named explicitly in BSA job ads.** Know the distinction
> cold: transactional data records events and is high-volume and always growing;
> reference data is the relatively static lookups that give those events meaning.

### "Reporting data mart" — explain it to a non-technical manager

One paragraph. No jargon. If you use the word "schema" you've failed the exercise.

-

---

## Say it out loud before you close the file

Your grain statement, your fact table, your five dimensions, and the one design
decision you'd defend. Under two minutes. **This is the Week 2 boss fight on
Day 14** — you're rehearsing it now.
