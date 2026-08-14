-- ===========================================================================
-- DAY 5 — MODEL ANSWERS.  OPEN ME SECOND.
-- ===========================================================================
-- Reading a solution before attempting produces recognition, not recall, and
-- recall is the entire problem this system exists to solve. Attempt first, get
-- it wrong, then come here.
--
-- Every query below has been run against data/northwind.db and the results
-- verified. Where your version differs but returns the same answer, yours is
-- fine — there is rarely one right query.
-- ===========================================================================


-- 1. Customers per country.  22 rows, USA 13.
SELECT Country, COUNT(*) AS Customers
FROM Customers
GROUP BY Country
ORDER BY Customers DESC;


-- 2. Total revenue per product.  77 rows, Cote de Blaye 53,265,895.23.
--    Revenue is derived per line, then summed. Discount is a fraction.
SELECT p.ProductName,
       ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2) AS Revenue
FROM [Order Details] od
JOIN Products p ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY Revenue DESC;


-- 3. Average unit price per category.  8 rows, Meat/Poultry 54.01.
SELECT c.CategoryName,
       ROUND(AVG(p.UnitPrice), 2) AS AvgPrice
FROM Products p
JOIN Categories c ON c.CategoryID = p.CategoryID
GROUP BY c.CategoryName
ORDER BY AvgPrice DESC;


-- 4. Highest and lowest unit price, one query.  2.5 and 263.5.
--    No GROUP BY: aggregating the whole table gives exactly one row.
SELECT MIN(UnitPrice) AS Lowest,
       MAX(UnitPrice) AS Highest
FROM Products;


-- 5. Orders per employee.  9 rows, employee 4 with 1,908.
SELECT o.EmployeeID,
       e.FirstName || ' ' || e.LastName AS Employee,
       COUNT(*) AS Orders
FROM Orders o
JOIN Employees e ON e.EmployeeID = o.EmployeeID
GROUP BY o.EmployeeID, Employee
ORDER BY Orders DESC;


-- 6. Total quantity sold per product.  77 rows, Louisiana Hot Spiced Okra 206,213.
SELECT p.ProductName,
       SUM(od.Quantity) AS Units
FROM [Order Details] od
JOIN Products p ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY Units DESC;


-- 7. Average order value per customer.  93 rows.
--    TWO steps, and this is the one worth understanding. An order has many
--    lines, so you must total each ORDER first, then average those totals.
--    Averaging the line values directly answers a different question.
SELECT ot.CustomerID,
       ROUND(AVG(ot.OrderValue), 2) AS AvgOrderValue
FROM (
    SELECT o.CustomerID,
           o.OrderID,
           SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS OrderValue
    FROM Orders o
    JOIN [Order Details] od ON od.OrderID = o.OrderID
    GROUP BY o.OrderID, o.CustomerID
) AS ot
GROUP BY ot.CustomerID
ORDER BY AvgOrderValue DESC;

-- The overall figure, for the check: 27,538.79
SELECT ROUND(AVG(OrderValue), 2) AS AvgOrderValueOverall
FROM (
    SELECT OrderID, SUM(UnitPrice * Quantity * (1 - Discount)) AS OrderValue
    FROM [Order Details]
    GROUP BY OrderID
);


-- 8. Orders per country, per year.  252 rows.
SELECT ShipCountry,
       strftime('%Y', OrderDate) AS Yr,
       COUNT(*) AS Orders
FROM Orders
GROUP BY ShipCountry, Yr
ORDER BY ShipCountry, Yr;


-- 9. Revenue per category, per year.  96 rows (8 categories x 12 years).
SELECT cat.CategoryName,
       strftime('%Y', o.OrderDate) AS Yr,
       ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2) AS Revenue
FROM Orders o
JOIN [Order Details] od ON od.OrderID = o.OrderID
JOIN Products p         ON p.ProductID = od.ProductID
JOIN Categories cat     ON cat.CategoryID = p.CategoryID
GROUP BY cat.CategoryName, Yr
ORDER BY cat.CategoryName, Yr;


-- 10. Orders per employee, per shipper.  27 rows (9 x 3).
SELECT o.EmployeeID,
       s.CompanyName AS Shipper,
       COUNT(*) AS Orders
FROM Orders o
JOIN Shippers s ON s.ShipperID = o.ShipVia
GROUP BY o.EmployeeID, Shipper
ORDER BY o.EmployeeID, Shipper;


-- ---------------------------------------------------------------------------
-- PART 2 — WHERE and HAVING together.  5 rows.
-- ---------------------------------------------------------------------------
-- Beverages 6,758,279 / Confections 4,923,890 / Meat-Poultry 4,740,727 /
-- Dairy 4,221,092 / Condiments 4,160,111.
SELECT cat.CategoryName,
       ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 0) AS Revenue2023
FROM Orders o
JOIN [Order Details] od ON od.OrderID = o.OrderID
JOIN Products p         ON p.ProductID = od.ProductID
JOIN Categories cat     ON cat.CategoryID = p.CategoryID
WHERE o.OrderDate >= '2023-01-01' AND o.OrderDate < '2024-01-01'
GROUP BY cat.CategoryName
HAVING Revenue2023 > 4000000
ORDER BY Revenue2023 DESC;

-- WHY the year filter cannot go in HAVING:
--   It filters individual ORDERS, and orders are rows. WHERE runs before
--   grouping, which is the only point at which individual rows still exist.
--   Putting it in HAVING would mean grouping every year's revenue together
--   first and then trying to filter on a column that has already been
--   collapsed.
--
-- WHY the 4,000,000 filter cannot go in WHERE:
--   It filters on SUM(), which does not exist until the groups have been
--   formed. At the point WHERE runs there is no total to compare against —
--   which is exactly why WHERE COUNT(*) > 10 failed on your Day 1 baseline.
--
-- NOTE ON PORTABILITY: SQLite lets you reference the alias Revenue2023 inside
-- HAVING. SQL Server and Postgres do not — there you repeat the whole
-- SUM(...) expression. Write it the strict way if you want the habit to
-- survive your first day in a job.
