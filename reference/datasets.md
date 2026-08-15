# Datasets

Everything here is free and public. Download on Day 1 and never think about sourcing data again.

---

## Learning datasets

### Northwind — Days 1 to 10 (SQL fundamentals)
Microsoft's classic sample database modelling a fictional food trading company. Around 13 tables: customers, orders, products, suppliers, employees, shippers, in a clean relational schema.

**Why this one:** it's the standard beginner SQL database precisely because the schema is small enough to hold in your head but real enough to practise joins, aggregations and date queries against.

**Get it:** SQLite version — `jpwhite3/northwind-SQLite3`, already downloaded to `data/northwind.db`. Open with **DB Browser for SQLite** (free, no server setup). Postgres and SQL Server ports also exist if you prefer.

**What is actually in this build** — checked against the file, not the documentation:

| Table | Rows | | Table | Rows |
|---|---|---|---|---|
| Order Details | 609,283 | | Territories | 53 |
| Orders | 16,282 | | EmployeeTerritories | 49 |
| Customers | 93 | | Suppliers | 29 |
| Products | 77 | | Employees | 9 |
| Categories | 8 | | Shippers | 3 |
| Regions | 4 | | | |

`CustomerDemographics` and `CustomerCustomerDemo` exist and are **empty** — a table
nobody ever populated, which is a thing you will meet constantly in real systems.

> **Full audit: `reference/dataset-profile.md`.** Row counts, the five verified traps, the
> real data quality defects, every reference total, and a list of what this data *cannot*
> support. The highlights are below; that file is the complete version and it is what
> Claude Code checks before writing any exercise.

**Things that will catch you out, several of which already have:**

- **There are no orphan rows anywhere.** Every customer has orders, every product has
  been sold, every order has line items. So every "find the records with no match"
  exercise you will read online returns zero here — and a zero that means *the data is
  dense* looks identical to a zero that means *your query is broken*. Day 3 was rewritten
  because of this.
- **`Discontinued` is stored as text**, `'0'` / `'1'`, not as a number. SQLite compares
  it happily. SQL Server would not.
- **A bare year in a date filter silently matches everything.** `OrderDate >= '2023'`
  returns all 16,282 rows; `OrderDate >= '2023-01-01'` returns the correct 1,132. The
  column is declared `DATETIME`, so `'2023'` is read as a *number* and every text date
  sorts above it. No error, no warning, a believable number. This is the most dangerous
  thing in the database.
- **The date columns are mixed.** 830 rows hold `2017-03-31`; 15,452 hold
  `2017-03-31 14:22:07`. Same column. Power Query will complain on Day 12 and it is right to.
- **Discount is almost always zero** — 608,445 of 609,283 lines. Applying it moves total
  revenue by 0.02% and does not change any top-5 ranking. Do not build a discount
  analysis on this data.
- **There is no seasonality.** Monthly order counts run 1,221 to 1,446 across all years.
  Flat by construction. The same is true of shipper and employee performance — do not go
  looking for a story that was never put there.

**Know this before you write a date filter:** this build is *not* the original 1996–1998
Northwind. It has been re-dated and expanded — **16,282 orders spanning 2012-07-10 to
2023-10-28.** Most tutorials online assume the 1997 dates and their queries will return
nothing here. `OrderDate` is also a full timestamp, not a date, so `BETWEEN 'x' AND 'y'`
silently excludes the final day. Use `>= start AND < day-after-end`.

### Northwind again — Days 11 to 17 (star schemas, Power BI, DAX)

**There is no second database to install.** Days 11 to 17 run on the same Northwind
data, exported to CSV.

**Why the plan changed.** It used to send you to Contoso, on the reasoning that
Northwind teaches transactional structure and Contoso teaches reporting structure.
That reasoning is sound but the sequencing was backwards. **Contoso hands you a star
schema already built; Northwind makes you build one.** Converting a normalised OLTP
schema into a dimensional model is not a warm-up for the Business Systems Analyst
job — it *is* the job, and it is the single strongest thing you can describe in an
interview. So Day 11 designs the star from Northwind and Day 13 builds it.

It also removes the biggest install risk in the month. A dataset download that fights
you on Day 11 costs a day, and the plan cannot afford one.

**Power BI has no SQLite connector.** The CSVs are already exported to `data/csv/`.
If they are ever missing, rebuild them in one command:

```
python scripts/export-csv.py
```

Then in Power BI: **Get Data → Folder → `data/csv` → Combine and Load.**

**Still want Contoso?** It is a genuinely good dataset and a reasonable month-2
project — SQLBI's free Contoso Data Generator produces ready-made databases at
several sizes. It is optional enrichment, not a dependency. Nothing in month 1
needs it.

---

## Portfolio datasets — UK public data

Use these for portfolio artifacts 1 and 2 (Days 18–20 and 25–26). **A UK hiring manager recognises these sources immediately**, and if you're applying to NHS or Civil Service roles, working in their data is directly relevant experience.

### data.gov.uk
The UK government's open data portal. Local authority spending, transport, environment, planning, crime. Structurally messy in exactly the way real work is — which makes it good Power Query practice, not bad data.

### NHS England statistics
Published operational data: waiting times, referrals, A&E performance, workforce. **Highest relevance given NHS Jobs is on your target list.** A dashboard on NHS operational data is the single strongest portfolio piece you could hand an NHS informatics team.

### ONS (Office for National Statistics)
Population, employment, earnings, inflation, regional economic data. Good for anything needing a demographic or economic dimension.

### Kaggle
Thousands of datasets across finance, healthcare, retail, sport. Use only as a fallback — a Kaggle project reads as generic to a UK employer, where a data.gov.uk or NHS project reads as domain-relevant.

---

## Choosing your two portfolio domains

- **Artifact 1** — pick the domain closest to the employers you're actually applying to. If NHS roles are in your pipeline, use NHS data.
- **Artifact 2** — deliberately different. Two projects in the same domain look like one project. Two in different domains demonstrate that the *method* is what transfers.

**Rule for both:** the business question comes before the data. If you can't state in one sentence what question the dashboard answers, you're building a demo, not an analysis.
