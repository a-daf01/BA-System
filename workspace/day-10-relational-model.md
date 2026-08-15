# Day 10 — Northwind's relational model

Draw it **from the database**, not from a diagram you found. Open DB Browser →
Database Structure, and read the actual columns.

Eleven tables carry data in this build. Two more (`CustomerDemographics`,
`CustomerCustomerDemo`) exist but are empty — note that, it's a real-world thing
you'll meet constantly, and "there's a table nobody ever populated" is a finding.

---

## 1. Keys and cardinality (30 min)

Fill this in. One row per table.

| Table | Rows | Primary key | Foreign keys → what they point at |
|---|---|---|---|
| Categories | 8 | | |
| Customers | 93 | | |
| Employees | 9 | | |
| EmployeeTerritories | 49 | | |
| Order Details | 609,283 | | |
| Orders | 16,282 | | |
| Products | 77 | | |
| Regions | 4 | | |
| Shippers | 3 | | |
| Suppliers | 29 | | |
| Territories | 53 | | |

**Two of these have a composite primary key** — two columns together. Find them
and say why a single column wouldn't work.

-

### Cardinality

Write each relationship as `A 1—* B` (one A has many B) or `A *—* B`.

-
-
-
-
-

**The one many-to-many:** Employees ↔ Territories. Name the junction table that
resolves it, and say what would go wrong if you tried to model it without one.

-

**The two empty tables.** `CustomerDemographics` and `CustomerCustomerDemo` are
in the schema with zero rows in them. Run the counts and confirm it yourself.

An empty table in a live system is never nothing. It is one of three things:
dead scope that was designed and never built, a feature that exists but was
never switched on, or something that used to work and broke.

**What I would ask the business about them, in one question:**

-

> This is a genuine BSA question and it comes up in interviews as "what would you
> do if you found X in a system you'd inherited?". The wrong answer is to assume.
> The right one is to find out which of the three it is before touching anything —
> because deleting dead scope is safe and deleting a switched-off feature is not.

---

## 2. Why Orders and Order Details are two tables (20 min)

An order has one customer, one date, one shipper — and many products. Write out
why that forces two tables.

-

**Now flatten them.** Imagine one wide table with order header columns repeated
on every line. List four concrete things that break:

1.
2.
3.
4.

> One of your four should be about **updating** — what happens when a customer
> changes address and the value is stored in 200 places. That's the integrity
> argument, and it's the one interviewers are listening for.

---

## 3. The other side (15 min)

Normalisation is right for transactions. It's often wrong for reporting.

**Two costs of over-normalising when the job is reporting:**

1.
2.

**Tie one of them to Day 3.** You joined Orders to Order Details and freight came
back 51× too big. Which cost was that, and would a denormalised reporting table
have had the same problem?

-

---

## Say it out loud before you close the file

"Normalisation protects integrity on the transactional side, but reporting
usually wants denormalised structures — knowing which side you're on is the job."

Then say your own version, with the Northwind example in it.
