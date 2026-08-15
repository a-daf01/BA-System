-- ===========================================================================
-- DAY 4 — JOIN REPAIR + a real data quality find.  Dataset: data/northwind.db
-- Open in DB Browser for SQLite -> Execute SQL.
-- Write your query under each question. Expected answers are on the question.
--
-- WHY THIS DAY EXISTS:
-- You scored Day 3 a 5 and called joins easy. Your own note says two things
-- went wrong: the "no orders" answer came back right from a query that could
-- not have produced it, and the fan-out explanation described LEFT JOIN
-- behaviour instead of row multiplication. A 5 with those two in it is a 3.
-- Today is not new material. It is the same material, proved.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1.  The lapsed-customer question you got right by accident  (15 min)
-- ---------------------------------------------------------------------------
-- Business question: "Which customers have not ordered from us since
-- 1 October 2023?" This is a churn list. Somebody would act on it.

-- 1a. The way you wrote it on Day 3 — INNER JOIN, then WHERE o.OrderID IS NULL.
--                                                            EXPECT: 0 rows


-- 1b. Now say it out loud BEFORE you write 1c: an INNER JOIN returns only rows
--     that matched. So a matched row is being tested for "did not match".
--     Write that sentence here in your own words:
--


-- 1c. The correct version. LEFT JOIN, date condition in the ON clause,
--     then WHERE o.OrderID IS NULL.                          EXPECT: 35 rows


-- 1d. Move the date condition out of ON and into WHERE. Count again.
--                                                            EXPECT: 0 rows
--     Say why: the WHERE test kills the very NULL rows you were looking for.


-- THE RULE, in your words. When you are looking for the ABSENCE of something,
-- the filter on the right-hand table goes in ____ and never in ____ :
--


-- ---------------------------------------------------------------------------
-- 2.  Fan-out, small enough to see  (20 min)
-- ---------------------------------------------------------------------------
-- On Day 3 the numbers were 16,282 -> 609,283 and £4m -> £206m. Too big to
-- feel. Here is the same thing at a size you can count on one hand.

-- 2a. Order 10273 on its own: how many rows, and what is its Freight?
--                                                     EXPECT: 1 row, £48.00


-- 2b. How many product lines does order 10273 have?          EXPECT: 5


-- 2c. Now SUM the freight for order 10273 across
--     Orders JOIN [Order Details].                    EXPECT: 5 rows, £240.00


-- PREDICT BEFORE YOU RUN 2d. Customer ALFKI has 163 orders and £35,907.25 of
-- freight. Write your predicted joined row count and joined freight here:
--     rows: ______        freight: ______

-- 2d. Run it and check.                        EXPECT: 5,325 rows, £1,677,372.50


-- 2e. THE ONE THAT MATTERS. Rank the top 5 customers by total freight,
--     joined through [Order Details].
--     EXPECT: IT · B's Beverages · Hungry Coyote Import Store ·
--             Morgenstern Gesundkost · Piccolo und mehr


-- 2f. Same ranking, straight from Orders, no [Order Details] join.
--     EXPECT: IT · B's Beverages · Hungry Coyote Import Store ·
--             Ricardo Adocicados · Gourmet Lanchonetes


-- WRITE THIS DOWN. Positions 4 and 5 are DIFFERENT CUSTOMERS. The fan-out did
-- not just inflate the numbers — it changed who is in the report. Say in one
-- sentence what that costs you if a commercial manager acts on 2e:
--


-- 2g. The fix. Get correct order count AND correct freight per customer by
--     aggregating Orders FIRST, in a subquery, then joining.
--     EXPECT: B's Beverages 210 orders, £54,797.25


-- ---------------------------------------------------------------------------
-- 3.  A real data quality defect, in this database, right now  (20 min)
-- ---------------------------------------------------------------------------
-- This is not a made-up exercise. There is a genuine defect in Customers and
-- you are going to find it the way you would find it at work.

-- 3a. How many customers are there?                          EXPECT: 93


-- 3b. How many DISTINCT company names are there?             EXPECT: 92


-- 3c. So two customers share a name. Find it — group by CompanyName and
--     keep the groups with more than one row.                EXPECT: 'IT'


-- 3d. Show both rows in full. Look hard at the two CustomerID values.
--     EXPECT: 'Val2 ' and 'VALON' — one of them has a TRAILING SPACE


-- 3e. Prove the trailing space rather than trusting your eyes:
--     find any CustomerID where the ID does not equal TRIM of itself.
--                                                     EXPECT: 1 row, 'Val2 '


-- 3f. Freight for each of the two separately.
--     EXPECT: 'Val2 ' 159 orders £43,810.75 · 'VALON' 176 orders £44,678.00


-- 3g. Freight if you GROUP BY CompanyName instead.
--     EXPECT: 335 orders, £88,488.75 — two businesses reported as one


-- THE WRITE-UP. This is the actual BA deliverable, not the SQL. Two sentences,
-- plain English, the way you would raise it to a stakeholder who does not know
-- what a join is. What is wrong, and what is the impact if nobody fixes it:
--
--
--


-- AND THE ROOT CAUSE QUESTION an interviewer will ask next: what would you
-- change so this cannot happen again? (Think about what the key should be, and
-- what should have been validated at entry.)
--
--


-- ===========================================================================
-- DONE. Model answers: reference/answers/day-04-joins-repair.sql — open me
-- second, after you have written your own.
-- ===========================================================================
