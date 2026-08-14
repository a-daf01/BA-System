-- ===========================================================================
-- DAY 3 — JOINs.  Dataset: data/northwind.db
-- Open in DB Browser for SQLite -> Execute SQL.
-- Write your query under each question. Expected answers are on the question.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1.  INNER vs LEFT on Customers -> Orders  (25 min)
-- ---------------------------------------------------------------------------

-- 1a. Row count, INNER JOIN Customers to Orders.            EXPECT: 16,282


-- 1b. Row count, LEFT JOIN Customers to Orders.             EXPECT: 16,282


-- 1c. Customers with no orders, written the WRONG way:
--     INNER JOIN ... WHERE o.OrderID IS NULL                EXPECT: 0
--     This returns 0 on EVERY database that has ever existed. Say why.


-- 1d. The same thing written correctly, with LEFT JOIN.     EXPECT: 0
--     This returns 0 only on THIS database. Say what the difference is.


-- YOUR ONE SENTENCE (why 1c can never return a row):
--


-- ---------------------------------------------------------------------------
-- 2.  Three-table join  (15 min)
-- ---------------------------------------------------------------------------

-- 2a. Orders -> [Order Details] -> Products. Count the rows.  EXPECT: 609,283
--     Remember the brackets: [Order Details] has a space in the name.


-- Orders alone is 16,282 rows. This join returns 609,283. That is not a bug —
-- write down in one line what those extra rows ARE.
--


-- ---------------------------------------------------------------------------
-- 3.  Row fan-out — the money one  (20 min)
-- ---------------------------------------------------------------------------

-- 3a. Count and total freight from Orders alone.
--                                          EXPECT: 16,282 | 4,047,470.50


-- 3b. Count of [Order Details].                          EXPECT: 609,283


-- 3c. Count and total freight over Orders JOIN [Order Details].
--                                       EXPECT: 609,283 | 206,911,676.00


-- Freight is stored ONCE PER ORDER. The join repeated it once per line item,
-- so the total came back 51x too big. Nothing errored. Nothing was NULL.
--
-- YOUR DETECTION RULE (write it as you would say it in an interview):
--


-- ---------------------------------------------------------------------------
-- 4.  The trap you will actually meet at work  (15 min)
-- ---------------------------------------------------------------------------
-- "Every customer, and how many orders they placed since 1 Oct 2023."

-- 4a. Version A — date filter in the WHERE clause.        EXPECT: 58 customers


-- 4b. Version B — date filter in the ON clause.
--                              EXPECT: 93 customers, 35 of them with count 0


-- Version A silently deleted 35 customers — the ones who bought nothing, which
-- is precisely who a churn report exists to find.
--
-- YOUR RULE (which clause does a condition on the right-hand table belong in?):
--


-- ---------------------------------------------------------------------------
-- SCRATCH — anything you tried that did not work. Leave it here.
-- ---------------------------------------------------------------------------
