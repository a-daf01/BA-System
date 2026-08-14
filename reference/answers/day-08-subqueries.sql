-- ===========================================================================
-- DAY 8 — MODEL ANSWERS.  OPEN ME SECOND.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- PART 1 — subqueries in WHERE (filter rows)
-- ---------------------------------------------------------------------------

-- 1. Products above the average price.  25 rows. Average 28.87.
SELECT ProductName, UnitPrice
FROM Products
WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM Products)
ORDER BY UnitPrice DESC;


-- 2. Customers who ordered since 1 Oct 2023.  58 rows.
SELECT CustomerID, CompanyName
FROM Customers
WHERE CustomerID IN (
    SELECT CustomerID FROM Orders WHERE OrderDate >= '2023-10-01'
)
ORDER BY CompanyName;


-- 3. Customers who have NOT ordered since 1 Aug 2023 — the churn list.  5 rows.
--
--    NOT EXISTS version — this is the one to trust:
SELECT c.CustomerID, c.CompanyName
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1 FROM Orders o
    WHERE o.CustomerID = c.CustomerID
      AND o.OrderDate >= '2023-08-01'
)
ORDER BY c.CompanyName;

--    NOT IN version — same answer HERE, but fragile:
SELECT c.CustomerID, c.CompanyName
FROM Customers c
WHERE c.CustomerID NOT IN (
    SELECT o.CustomerID FROM Orders o
    WHERE o.OrderDate >= '2023-08-01'
      AND o.CustomerID IS NOT NULL     -- <- without this guard it can break
)
ORDER BY c.CompanyName;

--    WHY NOT IN is the fragile one, and this is a genuine interview question:
--    if the inner query returns even ONE null, `x NOT IN (1, 2, NULL)` is never
--    true for any x, because comparing anything to NULL yields unknown. The
--    whole outer query returns zero rows and does not error. NOT EXISTS has no
--    such behaviour. Northwind happens to have no null CustomerID on Orders, so
--    both work here — which is exactly how people learn the wrong habit.


-- 4. Orders with above-average freight.  8,025 rows. Average 248.59.
SELECT OrderID, Freight
FROM Orders
WHERE Freight > (SELECT AVG(Freight) FROM Orders)
ORDER BY Freight DESC;


-- 5. Products supplied from Germany.  9 rows, from 3 German suppliers.
SELECT ProductName
FROM Products
WHERE SupplierID IN (
    SELECT SupplierID FROM Suppliers WHERE Country = 'Germany'
);


-- ---------------------------------------------------------------------------
-- PART 2 — subqueries in SELECT (add a column)
-- ---------------------------------------------------------------------------

-- 6. Every product with the overall average price beside it.  77 rows.
--    UNCORRELATED: the inner query does not mention the outer one, so it runs
--    once and the same 28.87 is pasted onto every row.
SELECT ProductName,
       UnitPrice,
       (SELECT ROUND(AVG(UnitPrice), 2) FROM Products) AS AvgPrice
FROM Products;


-- 7. Every customer with their order count.  93 rows.
--    CORRELATED: the inner query references c.CustomerID, so it re-runs per row.
SELECT c.CustomerID,
       c.CompanyName,
       (SELECT COUNT(*) FROM Orders o WHERE o.CustomerID = c.CustomerID) AS Orders
FROM Customers c
ORDER BY Orders DESC;


-- 8. Every category with its product count.  8 rows.
SELECT cat.CategoryName,
       (SELECT COUNT(*) FROM Products p WHERE p.CategoryID = cat.CategoryID) AS Products
FROM Categories cat;


-- 9. Every employee with their most recent order date.  9 rows.
SELECT e.EmployeeID,
       e.FirstName || ' ' || e.LastName AS Employee,
       (SELECT MAX(o.OrderDate) FROM Orders o WHERE o.EmployeeID = e.EmployeeID) AS LastOrder
FROM Employees e;


-- 10. Every order with its line-item count.  16,282 rows.
SELECT o.OrderID,
       o.OrderDate,
       (SELECT COUNT(*) FROM [Order Details] od WHERE od.OrderID = o.OrderID) AS Lines
FROM Orders o;


-- ---------------------------------------------------------------------------
-- PART 3 — the same three as CTEs
-- ---------------------------------------------------------------------------

-- 3 as a CTE.  5 rows.
WITH recent AS (
    SELECT DISTINCT CustomerID
    FROM Orders
    WHERE OrderDate >= '2023-08-01'
)
SELECT c.CustomerID, c.CompanyName
FROM Customers c
LEFT JOIN recent r ON r.CustomerID = c.CustomerID
WHERE r.CustomerID IS NULL
ORDER BY c.CompanyName;


-- 7 as a CTE.  93 rows.
--    Note this also fixes a real weakness in the correlated version: a customer
--    with zero orders would be missing from `counts`, so the LEFT JOIN and
--    COALESCE are doing necessary work. (In this build nobody has zero, but
--    write it as though somebody might.)
WITH counts AS (
    SELECT CustomerID, COUNT(*) AS Orders
    FROM Orders
    GROUP BY CustomerID
)
SELECT c.CustomerID,
       c.CompanyName,
       COALESCE(counts.Orders, 0) AS Orders
FROM Customers c
LEFT JOIN counts ON counts.CustomerID = c.CustomerID
ORDER BY Orders DESC;


-- 10 as a CTE.  16,282 rows.
WITH lines AS (
    SELECT OrderID, COUNT(*) AS Lines
    FROM [Order Details]
    GROUP BY OrderID
)
SELECT o.OrderID, o.OrderDate, COALESCE(lines.Lines, 0) AS Lines
FROM Orders o
LEFT JOIN lines ON lines.OrderID = o.OrderID;


-- ---------------------------------------------------------------------------
-- PART 4 — the written answers
-- ---------------------------------------------------------------------------
-- TWO things a CTE gives you that a subquery does not:
--   1. A NAME. `recent` and `counts` say what the thing is. A nested subquery
--      makes the reader reconstruct the intent from the SQL.
--   2. REUSE. Reference the same CTE twice in one query; a subquery has to be
--      written out twice and then maintained in two places forever.
--   (A third, once you get further: CTEs can be chained, so a five-step
--   transformation reads top to bottom instead of inside out.)
--
-- WHEN THE PLAIN SUBQUERY IS STILL BETTER:
--   A single scalar value used once — `(SELECT AVG(UnitPrice) FROM Products)`.
--   Wrapping that in a CTE is ceremony, not clarity.
--
-- CORRELATED vs UNCORRELATED among the ten above:
--   Uncorrelated: 1, 2, 4, 5, 6   — inner query stands alone, runs once.
--   Correlated:   7, 8, 9, 10     — inner query references the outer row, so it
--                                   conceptually runs once per row. This is why
--                                   the CTE rewrites are usually faster on
--                                   large tables.
--   Number 3 is correlated in the NOT EXISTS form and uncorrelated in the
--   NOT IN form, which is a neat demonstration that the same question can be
--   asked either way.
