-- ===========================================================================
-- DAY 4 — MODEL ANSWERS.  OPEN ME SECOND.
-- ===========================================================================
-- Reading a solution before attempting produces recognition, not recall, and
-- recall is the entire problem this system exists to solve. Attempt first, get
-- it wrong, then come here.
--
-- Every query below has been run against data/northwind.db and the results
-- verified.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. The lapsed-customer question
-- ---------------------------------------------------------------------------

-- 1a. The wrong way. 0 rows.
SELECT COUNT(*)
FROM Customers c
JOIN Orders o ON o.CustomerID = c.CustomerID
             AND o.OrderDate >= '2023-10-01'
WHERE o.OrderID IS NULL;

-- Why it can never return a row: INNER JOIN emits a row only when the ON
-- condition matched. A matched Orders row has a non-NULL OrderID by
-- definition. So the WHERE is asking "show me matched rows that did not
-- match". That is not a Northwind quirk — it is true of every database.

-- 1c. The right way. 35 rows.
SELECT c.CustomerID, c.CompanyName
FROM Customers c
LEFT JOIN Orders o ON o.CustomerID = c.CustomerID
                  AND o.OrderDate >= '2023-10-01'
WHERE o.OrderID IS NULL;

-- 1d. Date condition moved to WHERE. 0 rows.
SELECT COUNT(*)
FROM Customers c
LEFT JOIN Orders o ON o.CustomerID = c.CustomerID
WHERE o.OrderDate >= '2023-10-01'
  AND o.OrderID IS NULL;

-- The unmatched rows LEFT JOIN invented have NULL in every Orders column,
-- including OrderDate. `NULL >= '2023-10-01'` is not true, so WHERE discards
-- exactly the 35 rows you were looking for. The filter demoted the LEFT JOIN
-- to an INNER JOIN, which is the same failure as 1a wearing a different hat.

-- THE RULE: a condition on the right-hand table of a LEFT JOIN goes in ON.
-- Put it in WHERE and you have written an INNER JOIN.


-- ---------------------------------------------------------------------------
-- 2. Fan-out
-- ---------------------------------------------------------------------------

-- 2a. 1 row, Freight 48.00
SELECT OrderID, Freight FROM Orders WHERE OrderID = 10273;

-- 2b. 5
SELECT COUNT(*) FROM [Order Details] WHERE OrderID = 10273;

-- 2c. 5 rows, 240.00
SELECT COUNT(*), ROUND(SUM(o.Freight), 2)
FROM Orders o
JOIN [Order Details] d ON d.OrderID = o.OrderID
WHERE o.OrderID = 10273;

-- 48.00 x 5 = 240.00. The join did not find more freight. It repeated the one
-- freight value once per product line. Every measure on the ONE side of a
-- one-to-many join is multiplied by the number of rows on the MANY side.

-- 2d. 5,325 rows, 1,677,372.50
SELECT COUNT(*), ROUND(SUM(o.Freight), 2)
FROM Orders o
JOIN [Order Details] d ON d.OrderID = o.OrderID
WHERE o.CustomerID = 'ALFKI';

-- 2e. Inflated ranking.
SELECT c.CompanyName, ROUND(SUM(o.Freight), 2) AS Freight
FROM Customers c
JOIN Orders o ON o.CustomerID = c.CustomerID
JOIN [Order Details] d ON d.OrderID = o.OrderID
GROUP BY c.CompanyName
ORDER BY Freight DESC
LIMIT 5;
-- IT 4,692,830.50 · B's Beverages 2,867,869.50 · Hungry Coyote 2,669,072.75 ·
-- Morgenstern Gesundkost 2,575,318.00 · Piccolo und mehr 2,551,940.00

-- 2f. Correct ranking.
SELECT c.CompanyName, ROUND(SUM(o.Freight), 2) AS Freight
FROM Customers c
JOIN Orders o ON o.CustomerID = c.CustomerID
GROUP BY c.CompanyName
ORDER BY Freight DESC
LIMIT 5;
-- IT 88,488.75 · B's Beverages 54,797.25 · Hungry Coyote 51,597.00 ·
-- Ricardo Adocicados 50,285.25 · Gourmet Lanchonetes 49,939.00

-- Positions 4 and 5 are different customers. Each customer was multiplied by
-- ITS OWN number of order lines, not by one shared factor — so the inflation
-- is uneven and it re-orders the list. This is why "the numbers look too big
-- but the ranking is probably fine" is wrong. If a manager renegotiates
-- shipping terms off 2e, two of the five conversations are with the wrong
-- companies.

-- 2g. The fix — aggregate before you join.
SELECT c.CompanyName, o.Orders, o.Freight
FROM Customers c
JOIN (SELECT CustomerID,
             COUNT(*) AS Orders,
             ROUND(SUM(Freight), 2) AS Freight
      FROM Orders
      GROUP BY CustomerID) o ON o.CustomerID = c.CustomerID
ORDER BY o.Freight DESC;
-- B's Beverages 210 orders, 54,797.25

-- COUNT(DISTINCT o.OrderID) also rescues the count, but there is no
-- SUM(DISTINCT) that would rescue the freight — two orders can legitimately
-- carry the same freight value and DISTINCT would eat one of them. Aggregate
-- first, then join, is the pattern that always works.


-- ---------------------------------------------------------------------------
-- 3. The data quality defect
-- ---------------------------------------------------------------------------

-- 3a / 3b. 93 customers, 92 distinct names.
SELECT COUNT(*), COUNT(DISTINCT CompanyName) FROM Customers;

-- 3c. The duplicate name.
SELECT CompanyName, COUNT(*) AS n
FROM Customers
GROUP BY CompanyName
HAVING n > 1;
-- 'IT', 2

-- 3d. Both rows.
SELECT CustomerID, CompanyName, ContactName, Country
FROM Customers
WHERE CompanyName = 'IT';
-- ('Val2 ', 'IT', 'Val2', NULL) and ('VALON', 'IT', 'Valon Hoti', NULL)

-- 3e. Prove the trailing space.
SELECT CustomerID, LENGTH(CustomerID)
FROM Customers
WHERE CustomerID <> TRIM(CustomerID);
-- 'Val2 ', 5

-- 3f. Separately.
SELECT CustomerID, COUNT(*), ROUND(SUM(Freight), 2)
FROM Orders
WHERE CustomerID IN ('Val2 ', 'VALON')
GROUP BY CustomerID;
-- 'Val2 ' 159 / 43,810.75 · 'VALON' 176 / 44,678.00

-- 3g. Merged by name.
SELECT c.CompanyName, COUNT(*), ROUND(SUM(o.Freight), 2)
FROM Orders o
JOIN Customers c ON c.CustomerID = o.CustomerID
WHERE c.CompanyName = 'IT'
GROUP BY c.CompanyName;
-- 335 / 88,488.75

-- THE WRITE-UP, one version of it:
-- "Two separate customer accounts are recorded under the same company name,
--  'IT'. Any report that groups by company name rather than account ID shows
--  them as a single customer with 335 orders and £88,489 of freight, when they
--  are actually two accounts of 159 and 176 orders. Anything that segments
--  customers by size — account tiering, credit limits, top-customer reporting
--  — is wrong for these two, and the same fault will recur silently every time
--  two accounts share a name."

-- ROOT CAUSE / PREVENTION:
-- - CustomerID is the key; CompanyName is a label and was never unique.
--   Group and join on the key, always. This is what "single source of truth"
--   means in practice.
-- - 'Val2 ' has a trailing space and a ContactName of 'Val2'. That is test
--   data that reached production, and no entry validation trimmed it.
-- - Fixes: TRIM on entry, a uniqueness check on name as a WARNING not a block
--   (two real companies can share a name), and a duplicate-account review
--   before the record goes live.
-- ===========================================================================
