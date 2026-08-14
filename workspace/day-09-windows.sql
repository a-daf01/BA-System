-- ===========================================================================
-- DAY 9 — Window functions.  Dataset: data/northwind.db
-- ===========================================================================
-- The one-line idea: a window function calculates ACROSS rows without
-- COLLAPSING them. GROUP BY gives you one row per group. OVER() keeps every row
-- and adds the group calculation beside it.
--
-- Shape:   FUNCTION() OVER (PARTITION BY <reset per> ORDER BY <sequence>)
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- PART 1 — Ranking (30 min)
-- ---------------------------------------------------------------------------

-- 1. Top 3 products by revenue WITHIN each category.
--    EXPECT: 24 rows (8 categories x 3).
--    Beverages should come back: Cote de Blaye, Ipoh Coffee, Chang.
--
--    You need two steps: rank inside a CTE, then filter on the rank outside it.


-- 2. WHY can you not put `WHERE rn <= 3` in the same SELECT as the
--    ROW_NUMBER()? (Which runs first?)
--


-- 3. Swap ROW_NUMBER for RANK, then DENSE_RANK, on the same query.
--    What would differ if two products tied on revenue?
--    ROW_NUMBER:
--    RANK:
--    DENSE_RANK:


-- ---------------------------------------------------------------------------
-- PART 2 — Running totals and moving averages (30 min)
-- ---------------------------------------------------------------------------

-- 4. Monthly order counts for 2016, with a running total.
--    EXPECT: 12 rows. January 113. December's running total 1,506.


-- 5. Three-month moving average of that monthly count.
--    EXPECT: Jan 113.00, Feb 111.00, Mar 119.00
--    Needs a frame:  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW


-- 6. Running total of revenue per category, ordered by month.
--    PARTITION BY the category so the total RESETS for each one.


-- 7. Every order with a running total of freight for that customer.


-- ---------------------------------------------------------------------------
-- PART 3 — LAG (15 min)
-- ---------------------------------------------------------------------------

-- 8. Month-on-month change in order volume across 2016.
--    EXPECT: February -4, March +26. January comes back NULL.


-- WHY is January NULL?
--

-- WHAT would you show a stakeholder in that cell instead of a blank, and why
-- does it matter? (A blank in a report gets read as zero.)
--


-- 9. LEAD does the same thing forwards. One sentence on when you would reach
--    for it instead:
--


-- ---------------------------------------------------------------------------
-- THE INTERVIEW ANSWER
-- ---------------------------------------------------------------------------
-- "Top 3 per category" is the classic window-function interview question.
-- Write out how you would TALK through your answer, not the SQL:
--


-- ---------------------------------------------------------------------------
-- SCRATCH
-- ---------------------------------------------------------------------------
