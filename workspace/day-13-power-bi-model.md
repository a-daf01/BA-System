# Day 13 — Build the star in Power BI

Building what you designed on Day 11. Open `day-11-star-schema.md` beside this.

**The data is already exported.** `data/csv/` holds every Northwind table as CSV,
because Power BI has no SQLite connector. If that folder is missing or you want it
rebuilt, run:

```
python scripts/export-csv.py
```

---

## 1. Load (10 min)

Power BI Desktop → **Get Data → Folder** → point at `data/csv` → **Combine and
Load**.

Keep these seven: `Orders`, `OrderDetails`, `Products`, `Customers`,
`Employees`, `Shippers`, `Categories`.

- [ ] Loaded
- **Row counts I can see:** Orders ______ (expect 16,282), OrderDetails ______
  (expect 609,283)

> If Folder import gives you trouble, load the seven CSVs individually. Same
> result, two extra minutes, not worth debugging.

---

## 2. Relationships (30 min)

Model view. Build it to match your Day 11 design — **do not accept the
auto-detected relationships without reading each one.**

| From | To | Cardinality | Filter direction | Auto-detected correctly? |
|---|---|---|---|---|
| OrderDetails | Orders | | | |
| OrderDetails | Products | | | |
| Orders | Customers | | | |
| Orders | Employees | | | |
| Orders | Shippers | | | |
| Products | Categories | | | |

**Rule:** cardinality is many-to-one from the fact to the dimension. Filter
direction is **single**, flowing from the one side to the many side.

- **Any relationship Power BI got wrong:**
- **Any it refused to create, and why:**

### Categories — star or snowflake?

Merge `Categories` into `Products` in Power Query → star. Leave it as its own
table hanging off Products → snowflake.

- **What I did:**
- **So my model is a:** star / snowflake

---

## 3. Break it on purpose (15 min)

The point of this is that a broken model produces *plausible* numbers, not errors.

1. Put a simple visual on the page — revenue by category.
2. Note the number.
3. Set one relationship's cross-filter direction to **Both**.
4. Look again.

- **Number before:**
- **Number after:**
- **What changed and why:**

-

> A both-directional filter lets the filter travel back up into a table it
> shouldn't reach, which can multiply or ambiguate the result. Power BI sometimes
> warns about it and sometimes doesn't. **Fix it before moving on.**

- [ ] Fixed, back to single direction

---

## 4. Date dimension (15 min)

Time intelligence does not work without one. Northwind runs **2012-07-10 to
2023-10-28**, so the table needs full coverage of 2012 through 2023 with no gaps.

Make a new table:

```
DimDate =
CALENDAR (DATE (2012, 1, 1), DATE (2023, 12, 31))
```

Then add columns: `Year`, `Quarter`, `MonthNumber`, `MonthName`, `DayOfWeek`.

- [ ] Created
- [ ] Related to `Orders[OrderDate]`
- [ ] **Marked as a date table** (Table tools → Mark as date table)

**Why the range must be complete calendar years, not 2012-07-10 to 2023-10-28:**

-

---

## Say it out loud before you close the file

"Most broken Power BI reports aren't broken visuals — they're broken
relationships in the model underneath."

Then describe the break you caused in step 3 and how you spotted it. That is a
root-cause story and you will use it on Day 24.
