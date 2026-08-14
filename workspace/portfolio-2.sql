-- ===========================================================================
-- PORTFOLIO 2 — the SQL layer.  Day 25.
-- ===========================================================================
-- RULE: every query gets the business question it answers written above it,
-- in the stakeholder's words. That comment is the traceability line, and it is
-- the thing that makes this portfolio piece different from a dashboard.
--
-- Format:
--
--   -- BR-01: "Which suppliers have we spent most with this year, and is that
--   --         concentration increasing?"
--   SELECT ...
--
-- ===========================================================================


-- BR-01:
--


-- BR-02:
--


-- BR-03:
--


-- ---------------------------------------------------------------------------
-- CHECKS — run these before you trust anything above.
-- ---------------------------------------------------------------------------

-- Row count of the raw source, so you can prove nothing was silently dropped:


-- Min and max of the date column. Do this BEFORE writing any date filter —
-- it is the three-second check that would have saved you Day 2:


-- Count of NULLs in every column you filter or join on:


-- Grain check: is the column you think is unique actually unique?
-- (COUNT(*) vs COUNT(DISTINCT key) — if they differ, your grain is wrong.)
