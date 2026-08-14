"""Export every Northwind table to CSV for Power BI.

Power BI has no SQLite connector, which is the single most common place this
system used to stall. Run this once and `data/csv/` holds a clean folder Power
BI can read with Get Data -> Folder.

    python scripts/export-csv.py

Re-runnable. Overwrites what is there. Skips the two empty demographic tables
and the internal sqlite_sequence table, and drops binary Picture/Photo columns
so the CSVs stay small enough to open.
"""

import csv
import os
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, "data", "northwind.db")
OUT = os.path.join(ROOT, "data", "csv")

# Blob columns. Power BI chokes on them and nothing in the plan uses them.
DROP_COLS = {"Picture", "Photo"}
SKIP_TABLES = {"sqlite_sequence", "CustomerCustomerDemo", "CustomerDemographics"}


def main() -> int:
    if not os.path.exists(DB):
        print(f"No database at {DB}", file=sys.stderr)
        print("Download it from github.com/jpwhite3/northwind-SQLite3", file=sys.stderr)
        return 1

    os.makedirs(OUT, exist_ok=True)
    conn = sqlite3.connect(DB)
    tables = [
        r[0]
        for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        if r[0] not in SKIP_TABLES
    ]

    for table in tables:
        cols = [
            r[1]
            for r in conn.execute(f'PRAGMA table_info("{table}")')
            if r[1] not in DROP_COLS
        ]
        select = ", ".join(f'"{c}"' for c in cols)
        rows = conn.execute(f'SELECT {select} FROM "{table}"').fetchall()

        # Order Details -> OrderDetails. A space in a filename becomes a space in
        # the Power BI query name, and that needs quoting forever after.
        path = os.path.join(OUT, table.replace(" ", "") + ".csv")
        with open(path, "w", newline="", encoding="utf-8-sig") as fh:
            w = csv.writer(fh)
            w.writerow(cols)
            w.writerows(rows)
        print(f"{table:20} {len(rows):>8} rows -> {os.path.basename(path)}")

    conn.close()
    print(f"\nDone. In Power BI: Get Data -> Folder -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
