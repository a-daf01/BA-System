-- ===========================================================================
-- DAY 8 — Subqueries and CTEs.  Dataset: data/northwind.db
-- ===========================================================================
-- A subquery in WHERE filters rows. A subquery in SELECT adds a column.
-- Those are two different jobs and today you do five of each.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- PART 1 — Five subqueries in WHERE (filter rows)
-- ---------------------------------------------------------------------------

-- 1. Products priced above the average product price.
--                                EXPECT: 25 rows.  The average is 28.87


-- 2. Customers who placed an order since 1 Oct 2023.       EXPECT: 58 rows


-- 3. Customers who have NOT ordered since 1 Aug 2023 — the churn list.
--                                                          EXPECT: 5 rows
--    Two ways to write this: NOT IN, and NOT EXISTS. Write both.
--    Then say which one you would trust if the inner query could return NULL.


-- 4. Orders with freight above the average freight.
--                                EXPECT: 8,025 rows. The average is 248.59


-- 5. Products whose supplier is based in Germany.
--                                EXPECT: 9 rows, from 3 German suppliers


-- ---------------------------------------------------------------------------
-- PART 2 — Five subqueries in SELECT (add a column)
-- ---------------------------------------------------------------------------

-- 6. Every product, with the overall average price beside it.
--                     EXPECT: 77 rows, 28.87 repeated on every one


-- 7. Every customer, with their total order count.          EXPECT: 93 rows


-- 8. Every category, with how many products it holds.        EXPECT: 8 rows


-- 9. Every employee, with the date of their most recent order.
--                                                            EXPECT: 9 rows


-- 10. Every order, with how many line items it has.     EXPECT: 16,282 rows


-- ---------------------------------------------------------------------------
-- PART 3 — Rewrite as CTEs (30 min)
-- ---------------------------------------------------------------------------
-- Same answers, different shape. Skeleton:
--
--     WITH name AS (
--         SELECT ...
--     )
--     SELECT ... FROM name ...

-- 3 as a CTE:


-- 7 as a CTE:


-- 10 as a CTE:


-- WHICH VERSION would you rather be handed in six months, and why (one line):
--


-- ---------------------------------------------------------------------------
-- PART 4 — The written answer (10 min)
-- ---------------------------------------------------------------------------
-- When do you choose a CTE over a subquery? Name the TWO things a CTE gives you
-- that a subquery does not:
--
--   1.
--   2.
--
-- And one case where the plain subquery is still the better call:
--


-- CORRELATED vs UNCORRELATED — which of your ten above are correlated (the inner
-- query references the outer one, so it runs once per row)?
--


-- ---------------------------------------------------------------------------
-- SCRATCH
-- ---------------------------------------------------------------------------
