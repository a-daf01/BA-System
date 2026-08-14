-- ===========================================================================
-- DAY 5 — Aggregation.  Dataset: data/northwind.db
-- Every management report you will ever build is a GROUP BY.
-- Write your query under each question. Check the answer before moving on.
-- ===========================================================================
--
-- Revenue in Northwind is DERIVED, not stored:
--     UnitPrice * Quantity * (1 - Discount)
-- computed per line, then summed. Discount is a fraction, not a percentage.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- PART 1 — Ten queries (35 min)
-- ---------------------------------------------------------------------------

-- 1. Customers per country.                    EXPECT: 22 rows, USA top with 13


-- 2. Total revenue per product.
--            EXPECT: 77 rows, Cote de Blaye top at 53,265,895.23


-- 3. Average unit price per category.
--            EXPECT: 8 rows, Meat/Poultry top at 54.01


-- 4. Highest AND lowest unit price in Products, in ONE query.
--            EXPECT: 2.50 and 263.50


-- 5. Orders per employee.
--            EXPECT: 9 rows, employee 4 (Margaret Peacock) top with 1,908


-- 6. Total quantity sold per product.
--            EXPECT: 77 rows, Louisiana Hot Spiced Okra top at 206,213


-- 7. Average order value per customer.
--    Careful: an order has many line items, so you need the order total FIRST,
--    then the average of those. One GROUP BY will not do it.
--            EXPECT: 93 rows. Overall average order value is 27,538.79


-- 8. Orders per country, per year.             EXPECT: 252 rows
--    Two columns in the GROUP BY. Year via strftime('%Y', OrderDate).


-- 9. Revenue per category, per year.           EXPECT: 96 rows  (8 x 12)


-- 10. Orders per employee, per shipper.        EXPECT: 27 rows  (9 x 3)


-- ---------------------------------------------------------------------------
-- PART 2 — WHERE and HAVING in the same query (15 min)
-- ---------------------------------------------------------------------------

-- Categories whose 2023 revenue was above 4,000,000.
--   EXPECT: 5 rows — Beverages, Confections, Meat/Poultry, Dairy Products,
--                    Condiments
--   (Beverages 6,758,279 down to Condiments 4,160,111.)
--   Remember OrderDate is a timestamp: use >= '2023-01-01' AND < '2024-01-01',
--   never BETWEEN.


-- WHY the year filter cannot go in HAVING:
--

-- WHY the 4,000,000 filter cannot go in WHERE:
--


-- ---------------------------------------------------------------------------
-- PART 3 — Business framing (15 min)
-- ---------------------------------------------------------------------------

-- Query 9 gave you revenue per category per year.
--
-- The one-sentence question a commercial manager would have asked to make you
-- write it:
--

-- What you would actually DO with the answer:
--


-- ---------------------------------------------------------------------------
-- SCRATCH
-- ---------------------------------------------------------------------------
