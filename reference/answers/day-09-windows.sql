-- ===========================================================================
-- DAY 9 — MODEL ANSWERS.  OPEN ME SECOND.
-- ===========================================================================
-- The shape, every time:
--     FUNCTION() OVER (PARTITION BY <reset per> ORDER BY <sequence>)
-- PARTITION BY is the GROUP BY that does not collapse rows.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Top 3 products by revenue within each category.  24 rows.
--    Beverages: Cote de Blaye, Ipoh Coffee, Chang.
-- ---------------------------------------------------------------------------
WITH product_revenue AS (
    SELECT cat.CategoryName,
           p.ProductName,
           SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS Revenue
    FROM [Order Details] od
    JOIN Products p     ON p.ProductID = od.ProductID
    JOIN Categories cat ON cat.CategoryID = p.CategoryID
    GROUP BY cat.CategoryName, p.ProductName
),
ranked AS (
    SELECT CategoryName,
           ProductName,
           Revenue,
           ROW_NUMBER() OVER (PARTITION BY CategoryName ORDER BY Revenue DESC) AS rn
    FROM product_revenue
)
SELECT CategoryName, ProductName, ROUND(Revenue, 2) AS Revenue, rn
FROM ranked
WHERE rn <= 3
ORDER BY CategoryName, rn;


-- 2. WHY you cannot write `WHERE rn <= 3` in the same SELECT:
--
--    Logical order of execution:
--        FROM -> WHERE -> GROUP BY -> HAVING -> WINDOW -> SELECT -> ORDER BY
--
--    WHERE runs BEFORE the window function has been evaluated, so at that point
--    `rn` does not exist yet. You have to complete the SELECT that creates it,
--    then filter the result — which is what the CTE (or a subquery) is for.
--    This is the same "not written in the order it reads" problem as Day 1.


-- 3. ROW_NUMBER vs RANK vs DENSE_RANK, on a tie:
--
--        Revenue   ROW_NUMBER   RANK   DENSE_RANK
--        100            1         1         1
--        100            2         1         1
--         90            3         3         2
--
--    ROW_NUMBER  — always distinct, ties broken arbitrarily. Use when you need
--                  exactly N rows and do not care which of a tie you get.
--    RANK        — ties share a number, then it SKIPS. "Joint first, then third."
--    DENSE_RANK  — ties share a number, no gap. "Joint first, then second."
--
--    For "top 3 per category" where ties matter commercially, DENSE_RANK is
--    usually the honest choice — ROW_NUMBER silently drops a tied product.


-- ---------------------------------------------------------------------------
-- 4. Monthly order counts for 2016 with a running total.  12 rows.
--    January 113. December running total 1,506.
-- ---------------------------------------------------------------------------
WITH monthly AS (
    SELECT strftime('%Y-%m', OrderDate) AS Mth,
           COUNT(*) AS Orders
    FROM Orders
    WHERE OrderDate >= '2016-01-01' AND OrderDate < '2017-01-01'
    GROUP BY Mth
)
SELECT Mth,
       Orders,
       SUM(Orders) OVER (ORDER BY Mth) AS RunningTotal
FROM monthly
ORDER BY Mth;


-- ---------------------------------------------------------------------------
-- 5. Three-month moving average.  Jan 113.00, Feb 111.00, Mar 119.00.
--    The frame is the whole point: without ROWS BETWEEN, SUM/AVG OVER with an
--    ORDER BY defaults to everything from the start up to the current row —
--    which is a running average, not a moving one.
-- ---------------------------------------------------------------------------
WITH monthly AS (
    SELECT strftime('%Y-%m', OrderDate) AS Mth,
           COUNT(*) AS Orders
    FROM Orders
    WHERE OrderDate >= '2016-01-01' AND OrderDate < '2017-01-01'
    GROUP BY Mth
)
SELECT Mth,
       Orders,
       ROUND(AVG(Orders) OVER (ORDER BY Mth ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS Mov3
FROM monthly
ORDER BY Mth;


-- ---------------------------------------------------------------------------
-- 6. Running total of revenue per category, by month.
--    PARTITION BY makes the total RESET at each new category.
-- ---------------------------------------------------------------------------
WITH cat_month AS (
    SELECT cat.CategoryName,
           strftime('%Y-%m', o.OrderDate) AS Mth,
           SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS Revenue
    FROM Orders o
    JOIN [Order Details] od ON od.OrderID = o.OrderID
    JOIN Products p         ON p.ProductID = od.ProductID
    JOIN Categories cat     ON cat.CategoryID = p.CategoryID
    GROUP BY cat.CategoryName, Mth
)
SELECT CategoryName,
       Mth,
       ROUND(Revenue, 2) AS Revenue,
       ROUND(SUM(Revenue) OVER (PARTITION BY CategoryName ORDER BY Mth), 2) AS RunningRevenue
FROM cat_month
ORDER BY CategoryName, Mth;


-- ---------------------------------------------------------------------------
-- 7. Every order with a running total of freight for that customer.
-- ---------------------------------------------------------------------------
SELECT CustomerID,
       OrderID,
       OrderDate,
       Freight,
       ROUND(SUM(Freight) OVER (PARTITION BY CustomerID ORDER BY OrderDate, OrderID), 2) AS RunningFreight
FROM Orders
ORDER BY CustomerID, OrderDate;
--    Note the tie-breaker in the ORDER BY. Two orders on the same timestamp
--    would otherwise make the running total non-deterministic — it would give a
--    different answer on different runs, which is the worst kind of reporting
--    bug because nobody believes you when you report it.


-- ---------------------------------------------------------------------------
-- 8. Month-on-month change, 2016.  February -4, March +26, January NULL.
-- ---------------------------------------------------------------------------
WITH monthly AS (
    SELECT strftime('%Y-%m', OrderDate) AS Mth,
           COUNT(*) AS Orders
    FROM Orders
    WHERE OrderDate >= '2016-01-01' AND OrderDate < '2017-01-01'
    GROUP BY Mth
)
SELECT Mth,
       Orders,
       LAG(Orders) OVER (ORDER BY Mth) AS PrevMonth,
       Orders - LAG(Orders) OVER (ORDER BY Mth) AS Change
FROM monthly
ORDER BY Mth;

-- WHY JANUARY IS NULL:
--   There is no previous row inside the window, so LAG has nothing to return.
--   It is genuinely unknown, not zero.
--
-- WHAT TO SHOW A STAKEHOLDER INSTEAD OF A BLANK:
--   Not 0 — that reads as "no change" and it is a lie. Either suppress the row,
--   or print "n/a" / "–". A blank cell in a report gets read as zero by
--   somebody, eventually, and that is a genuine reporting risk.
--   If you must have a value: LAG(Orders, 1, NULL) is explicit about it, and
--   COALESCE(..., 'n/a') on a text column is honest.
--
-- LEAD vs LAG:
--   Same function, opposite direction. Reach for LEAD when the question is
--   forward-looking — "how long until this customer's next order", "what was
--   the next status this ticket moved to". Time-to-next-event is the classic.
