# Northwind — dataset profile

**Profiled 2026-08-15 against `data/northwind.db`. Every number on this page was run, not remembered.**

This file exists because two days shipped exercises the data could not satisfy (the 1997
filter on Day 2, "customers with no orders" on Day 3). Both happened because the build was
assumed to be textbook Northwind. **It is not.** Read this before writing any exercise.

---

## What this build actually is

Textbook Northwind is 830 orders across 1996–1998. This one has been **re-dated, inflated
and back-filled**:

| | Textbook Northwind | This build |
|---|---|---|
| Orders | 830 | **16,282** |
| Order Details rows | 2,155 | **609,283** |
| Date span | 1996–1998 | **2012-07-10 → 2023-10-28** |
| Customers | 91 | **93** |
| Avg lines per order | 2.6 | **37.4** |
| Referential integrity | some gaps | **perfect — zero orphans anywhere** |

The original 830 orders are still in there (OrderID 10248–11077), re-dated to
2016-07-04 → 2018-05-06. Everything from **OrderID 11078 upward is generated bulk**.
That seam is the source of several of the traps below.

---

## Tables

11 tables carry data. Two are empty.

| Table | Rows | PK | Notes |
|---|---|---|---|
| `Orders` | 16,282 | OrderID | FK → Customers, Employees, Shippers |
| `[Order Details]` | 609,283 | OrderID + ProductID | **Brackets required** — the name has a space |
| `Products` | 77 | ProductID | FK → Suppliers, Categories |
| `Customers` | 93 | CustomerID (TEXT) | |
| `Suppliers` | 29 | SupplierID | |
| `Territories` | 53 | TerritoryID (TEXT) | FK → Regions |
| `EmployeeTerritories` | 49 | EmployeeID + TerritoryID | **The only many-to-many junction** |
| `Employees` | 9 | EmployeeID | Self-referencing FK: `ReportsTo` |
| `Categories` | 8 | CategoryID | Has a `Picture` BLOB — exclude it from Power BI |
| `Regions` | 4 | RegionID | |
| `Shippers` | 3 | ShipperID | |
| `CustomerDemographics` | **0** | | Empty. Do not build an exercise on it |
| `CustomerCustomerDemo` | **0** | | Empty |

**Referential integrity is perfect.** Verified across all ten FK paths: zero orphan orders,
zero orphan detail lines, zero products without a category or supplier, zero customers
without orders, zero products never ordered.

**Consequence: every anti-join exercise on raw keys returns 0 rows.** "Find customers with
no orders", "products never sold", "orders with no line items" — all dead here. An anti-join
only has teaching value in this build when it carries a **date or attribute condition**
(see the lapsed-customer pattern on Day 4).

---

## The five traps — all verified

### 1. Bare-year date comparison silently matches everything, or nothing

`OrderDate` is declared `DATETIME`, which gives it **NUMERIC affinity** in SQLite. A bare
literal like `'2023'` converts to the integer 2023; the stored values are TEXT and cannot
convert, and SQLite sorts all TEXT above all NUMERIC. So:

```sql
WHERE OrderDate >= '2023'       -- 16,282 rows.  ALL of them.
WHERE OrderDate >= '2023-01-01' -- 1,132 rows.   Correct.
WHERE OrderDate <  '2013'       -- 0 rows.
WHERE OrderDate <  '2013-01-01' -- 654 rows.     Correct.
```

**No error, no warning, a plausible-looking number.** This is the single most dangerous
thing in the database. Always use a full `YYYY-MM-DD` literal, or `strftime('%Y', OrderDate)`.

### 2. Mixed date formats inside the same column

| Rows | OrderID range | Format | Length |
|---|---|---|---|
| 830 | 10248–11077 | `2017-03-31` | 10 — **date only** |
| 15,452 | 11078–26529 | `2017-03-31 14:22:07` | 19 — timestamp |

Same column, two formats. This will throw type errors in Power Query on Day 12 — which is
useful, but know it is coming and know it is real rather than a mistake he made.

### 3. `BETWEEN` on dates loses the last day — inconsistently

Because most rows carry a time component, `BETWEEN '2016-01-01' AND '2016-03-31'` drops
everything after midnight on 31 March.

- Q1 2016: **350** with `BETWEEN` vs **357** correct. 7 orders lost.
- Q1 2017: **431** with `BETWEEN` vs **439** correct. 8 lost — but **2 orders on 31 March
  survived**, because they are date-only rows from the original 830 and `'2017-03-31'`
  matches them exactly.

**Same query, same day, two different behaviours depending on which row it hits.** Always
`>= start AND < day_after_end`.

### 4. Row fan-out is enormous — 37.4× on average

`Orders` 16,282 rows / £4,047,470.50 freight → joined to `[Order Details]`, 609,283 rows
/ **£206,911,676.00**. That is 51× the freight.

It does not only inflate. **It re-orders rankings**, because each customer is multiplied by
its own line count, not a shared factor. Top 5 customers by freight:

| Rank | Joined through Order Details (wrong) | Straight from Orders (right) |
|---|---|---|
| 1 | IT | IT |
| 2 | B's Beverages | B's Beverages |
| 3 | Hungry Coyote Import Store | Hungry Coyote Import Store |
| 4 | **Morgenstern Gesundkost** | **Ricardo Adocicados** |
| 5 | **Piccolo und mehr** | **Gourmet Lanchonetes** |

### 5. `Orders.ShipCountry` disagrees with `Customers.Country` on 85% of orders

**13,832 of 16,282 orders** ship to a different country than the customer is registered in.
This is not corruption — it is two legitimate columns answering two different questions
(billing vs delivery). But pick the wrong one and the answer changes:

| Rank | By `Customers.Country` | By `Orders.ShipCountry` |
|---|---|---|
| 1 | USA £62.6m | USA £63.9m |
| 2 | **France £53.3m** | **Germany £59.1m** |
| 3 | **Germany £51.2m** | **France £49.1m** |

Positions 2 and 3 swap. Any "revenue by country" exercise must state which column it means.

---

## Real data quality defects — findable, and good BA material

| Defect | Detail |
|---|---|
| **Duplicate customer name** | 93 customers, **92 distinct company names**. `'Val2 '` and `'VALON'` are both called `IT` |
| **Trailing whitespace in a key** | `CustomerID = 'Val2 '` — 5 chars, trailing space. The only such row |
| **Test data in production** | Those same two rows have NULL Address, City and Country, and a ContactName of `Val2` |
| **Duplicate territory label** | 53 territories, **52 distinct descriptions** — `New York` appears twice with different IDs |
| **Discontinued products still selling** | All 8 discontinued products have orders. Thüringer Rostbratwurst alone is £24.6m |
| **Price drift** | 658 detail lines where `[Order Details].UnitPrice` ≠ current `Products.UnitPrice` (0.1%) |
| **Unshipped orders** | 21 orders have NULL `ShippedDate` — all clustered 2018-04-08 → 2018-05-06 |
| **Nulls** | Customers: 2 Country/City/Address, 3 PostalCode, 24 Fax. Suppliers: 24 HomePage, 16 Fax |

---

## Reference numbers — reuse these, don't re-derive them

**Totals**
- Total revenue `SUM(UnitPrice * Quantity * (1 - Discount))` = **£448,386,633.17**
- Total revenue ignoring discount = £448,475,298.72 (**0.02% apart** — see the discount note below)
- Total freight = £4,047,470.50 · Average order value = **£27,538.79**
- Average product price = £28.87 · Average freight = £248.59
- Product price range: £2.50 – £263.50

**By year** (order count / revenue)

| Year | Orders | Revenue |
|---|---|---|
| 2012 | 654 | £18.8m ← **partial: starts 10 July** |
| 2013 | 1,351 | £38.6m |
| 2014 | 1,351 | £38.9m |
| 2015 | 1,449 | £41.4m |
| 2016 | 1,506 | £40.6m |
| 2017 | 1,780 | £40.2m |
| 2018 | 1,549 | £38.3m |
| 2019 | 1,362 | £38.5m |
| 2020 | 1,376 | £38.9m |
| 2021 | 1,420 | £41.4m |
| 2022 | 1,352 | £39.7m |
| 2023 | 1,132 | £33.1m ← **partial: ends 28 Oct** |

The 2022→2023 "17% fall" is the partial year, not trading. Same for 2012.

**Revenue by category**: Beverages £92.2m · Confections £66.3m · Meat/Poultry £64.9m ·
Dairy £58.0m · Condiments £55.8m · Seafood £49.9m · Produce £32.7m · Grains/Cereals £28.6m

**Top products by revenue**: Côte de Blaye £53.3m · Thüringer Rostbratwurst £24.6m ·
Mishi Kobe Niku £19.4m · Sir Rodney's Marmalade £16.7m · Carnarvon Tigers £12.6m

**Employees** (9, all Sales): Margaret Peacock 1,908 orders is top; Michael Suyama 1,754 is
bottom. Andrew Fuller (ID 2) is the only one with `ReportsTo = NULL`; Buchanan (5) manages
6, 7 and 9; Fuller manages the rest. Two levels deep.

**Customers by country**: 21 countries. USA 13 · Germany 11 · France 11 · Brazil 9 · UK 7.
**Five countries have more than 5 customers.**

**Delivery**: average 7.84 days to ship against a 19.13-day required window.
**3,755 of 16,261 shipped orders were late (23.1%)**, plus 21 never shipped.

---

## What this data CANNOT support — check here before writing an exercise

- **Anti-joins on raw keys.** Zero orphans anywhere. Needs a date or attribute condition.
- **Discount analysis.** `Discount = 0` on **608,445 of 609,283 lines (99.86%)**. Only 838
  lines carry one. Including discount changes total revenue by 0.02% and **does not change
  the top-5 ranking at all**. Do not write "show how discount changes the answer" — it
  barely does. The honest lesson is the opposite one: you include it because the business
  rule says revenue is net of discount, not because it is material.
- **Seasonality.** Monthly order counts across all years run 1,221 (Feb) to 1,446 (Mar) —
  **essentially flat, no seasonal pattern exists.** Never ask him to find one.
- **Shipper performance comparison.** Late-delivery rate is Speedy Express 23.3%, Federal
  Shipping 23.0%, United Package 22.9%. **No signal.** Same for late rate by country
  (20.6%–25.7%) and by year (19.8%–25.1%). It is uniform noise by construction.
- **Employee performance comparison.** Order counts run 1,754–1,908 across nine people.
  A 9% spread over eleven years is not a performance story.
- **Customer volume thresholds below ~150.** Every one of the 93 customers has **at least
  154 orders**. `HAVING COUNT(*) > 10` returns all 93 and teaches nothing. Use 180+ for a
  threshold that actually filters.
- **`Categories.Picture`** is a BLOB. Exclude it on import or Power BI will choke.

---

## Standard query shapes for this build

```sql
-- Revenue. Discount is a fraction (0.15 = 15%), never a percentage.
SUM(od.UnitPrice * od.Quantity * (1 - od.Discount))

-- Date filtering. Never BETWEEN, never a bare year.
WHERE o.OrderDate >= '2016-01-01' AND o.OrderDate < '2016-04-01'

-- Year grouping.
strftime('%Y', o.OrderDate)

-- Discontinued is TEXT, not integer. '0' = 69 products, '1' = 8.
WHERE p.Discontinued = '1'

-- The table name needs brackets.
FROM [Order Details] od
```
