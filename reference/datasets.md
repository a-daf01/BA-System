# Datasets

Everything here is free and public. Download on Day 1 and never think about sourcing data again.

---

## Learning datasets

### Northwind — Days 1 to 10 (SQL fundamentals)
Microsoft's classic sample database modelling a fictional food trading company. Around 13 tables: customers, orders, products, suppliers, employees, shippers, in a clean relational schema.

**Why this one:** it's the standard beginner SQL database precisely because the schema is small enough to hold in your head but real enough to practise joins, aggregations and date queries against.

**Get it:** SQLite version — search "northwind SQLite github". Open with **DB Browser for SQLite** (free, no server setup). Postgres and SQL Server ports also exist if you prefer.

### Contoso — Days 11 to 17 (star schemas, Power BI, DAX)
Microsoft's BI demo dataset for retail. Built explicitly to demonstrate data warehouse and BI functionality, with high-volume transactions plus properly structured reference and dimension data.

**Why this one:** Northwind teaches you transactional structure; Contoso teaches you reporting structure. Comparing the two is how the star schema concept actually lands. It's designed around a star schema, which is exactly what you need to be able to describe in interviews.

**Get it:** Microsoft's `sql-server-samples` GitHub repo, or SQLBI's free Contoso Data Generator which produces ready-made databases at various sizes. The SQLBI version pairs well with DAX learning resources.

**Fallback if setup fights you:** Power BI Desktop ships with sample .pbix files, and Microsoft publishes several ready-made sample reports with datasets. Use those rather than losing a day to installation.

---

## Portfolio datasets — UK public data

Use these for portfolio artifacts 1 and 2 (Days 18–20 and 25–26). **A UK hiring manager recognises these sources immediately**, and if you're applying to NHS or Civil Service roles, working in their data is directly relevant experience.

### data.gov.uk
The UK government's open data portal. Local authority spending, transport, environment, planning, crime. Structurally messy in exactly the way real work is — which makes it good Power Query practice, not bad data.

### NHS England statistics
Published operational data: waiting times, referrals, A&E performance, workforce. **Highest relevance given NHS Jobs is on your target list.** A dashboard on NHS operational data is the single strongest portfolio piece you could hand an NHS informatics team.

### ONS (Office for National Statistics)
Population, employment, earnings, inflation, regional economic data. Good for anything needing a demographic or economic dimension.

### Kaggle
Thousands of datasets across finance, healthcare, retail, sport. Use only as a fallback — a Kaggle project reads as generic to a UK employer, where a data.gov.uk or NHS project reads as domain-relevant.

---

## Choosing your two portfolio domains

- **Artifact 1** — pick the domain closest to the employers you're actually applying to. If NHS roles are in your pipeline, use NHS data.
- **Artifact 2** — deliberately different. Two projects in the same domain look like one project. Two in different domains demonstrate that the *method* is what transfers.

**Rule for both:** the business question comes before the data. If you can't state in one sentence what question the dashboard answers, you're building a demo, not an analysis.
