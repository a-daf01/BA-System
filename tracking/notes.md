# Working Notes

**Everything you type while you work, filed under the exact thing you were doing.**

You do not write in this file directly. You type into the box under the task, the sub-step
or the review card on the dashboard, and the export button carries it here.

## Why it works this way

You said it plainly on 20 August: typing under the exact problem you are on has been the
one capture habit that stuck, because there is no deciding involved — no "where does this
go", no separate file to remember, no format to impose. The note is already attached to the
thing it is about.

The old `tracking/braindump.md` asked you to re-find the context after the fact and write it
down again. It stayed empty. This does not, because the context is the heading.

## What belongs in a note

Anything. Wrong turns, the query that finally worked, why you picked one join over another,
what you assumed, where you got stuck, what you would tell a stakeholder. Half-sentences are
fine. **A note saying "no idea what I was doing here for 20 minutes" is more useful to the
system than a blank.**

Nothing here is graded. It is read at the end of the day to build review items and to catch
gaps you did not know you had.

## How it is organised

`## date` → `#### context` → the note. One note per task per day; editing it on the phone and
re-exporting replaces it rather than appending a second copy.

Context reads as `D08 desk 2` for a task, `D08 desk 2.3` for a sub-step, and
`D08 review — <the prompt>` for a review card.

---

## 2026-08-13

#### D02 desk 1.2

forgot you cannot use quotes round 20, it is a number not text

## 2026-08-20

#### D06 desk 1.1

At first I did:
SELECT COUNT(CompanyName) as CustomersPerCountry, Country FROM Customers
GROUP BY CompanyName;
but then realised my mistake and changed it to:
SELECT COUNT(CompanyName) as CustomerPerCountry, Country FROM Customers
GROUP BY Country
ORDER BY CustomerPerCountry DESC;

#### D06 desk 1.10

SELECT s.CompanyName as ShipperName, strftime('%Y', o.OrderDate) as OrderYear, COUNT(o.OrderID)AS TotalOrders FROM Orders o
JOIN Shippers s ON o.ShipVia = s.ShipperID
JOIN Employees e ON o.EmployeeID = o.EmployeeID
GROUP BY o.EmployeeID, s.ShipperID;

#### D06 desk 1.2

I started with:
SELECT p.ProductName, SUM((od.UnitPrice * od.Quantity) - od.Discount) as Total_Revenue FROM [Order Details] od
JOIN Products p ON od.ProductID = p.ProductID
GROUP BY Total_Revenue;

and encountered an error, that aggregate functions are not allowed in the group by clause

I realised im supposed to group by the product name and it returns it correctly now:
SELECT p.ProductName, SUM((od.UnitPrice * od.Quantity) - od.Discount) as Total_Revenue FROM [Order Details] od
JOIN Products p ON od.ProductID = p.ProductID
GROUP BY p.ProductName
ORDER BY Total_Revenue DESC;

#### D06 desk 1.3

Honestly I just guessed there's a AVG() function and there was:
SELECT CategoryName, AVG(p.UnitPrice) as AverageUnitPrice FROM Products p
JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY CategoryName
ORDER BY AverageUnitPrice DESC;

#### D06 desk 1.4

I dont even know where to start so im going to look it up, ok I didn't know about MAX() and MIN() but now I do:

SELECT MAX(UnitPrice) as HighestUnitPrice, MIN(UnitPrice) as LowestUnitPrice FROM Products;

#### D06 desk 1.5

I looked up how to CONCAT columns but i didnt struggle with this one:
SELECT CONCAT(e.LastName, ' ', e.LastName) as FullName, COUNT(o.OrderID) as TotalOrders FROM Orders o
JOIN Employees e ON o.EmployeeID = e.EmployeeID
GROUP BY FullName
ORDER BY TotalOrders DESC;

#### D06 desk 1.6

I accidently did:
SELECT p.ProductName, COUNT(od.OrderID) as TotalQuantity FROM Products p
JOIN [Order Details] od ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY TotalQuantity DESC;

but now I realise thats total orders per product, I will fix it now to:

SELECT p.ProductName, SUM(od.Quantity) as TotalQuantity FROM Products p
JOIN [Order Details] od ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY TotalQuantity DESC;

#### D06 desk 1.7

I have been trying a lot of different things for the past 10 minutes, but I didn't even think to ensure I understand what overall average order even means, let me check this first. ok so I basically just looked up the answer and got:
WITH OrderTotals AS (
    SELECT 
        OrderID,
        SUM(UnitPrice * Quantity * (1 - Discount)) AS TotalOrderValue
    FROM [Order Details]
    GROUP BY OrderID
)
SELECT 
    ROUND(AVG(TotalOrderValue), 2) AS TotalAverageOrderValue
FROM OrderTotals;

I remember WITH AS its like an IF statement or more precisely like a sub-query.

when i tried to do it with my own thinking i got:
WITH OrderValue AS (
	SELECT c.CompanyName as Customer, AVG(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalOrderValue
	FROM Orders o
	JOIN [Order Details] od ON o.OrderID = od.OrderID
	JOIN Customers c ON o.CustomerID = c.CustomerID
	GROUP BY Customer)
	
SELECT Customer, SUM(TotalOrderValue) FROM OrderValue;

but thats just incorrect but I dont understand why

#### D06 desk 1.8

SELECT * FROM Orders
GROUP BY ShipCountry, strftime('%Y', OrderDate);

but i dont understand how it does it, what does it do when we run that? does it like just pick only 1 example that satisfies and ignores the rest or what? i looked it up and i realised this is probably what i needed to do:
SELECT 
    ShipCountry, 
    strftime('%Y', OrderDate) AS OrderYear,
    COUNT(*) AS TotalOrders
FROM Orders
GROUP BY ShipCountry, strftime('%Y', OrderDate);

which makes more sense since it shows the number of orders for that category we grouped by and just a lot more organised and showcase the data in a clearer way

#### D06 desk 1.9

SELECT 
    c.CategoryName,
    strftime('%Y', o.OrderDate) AS OrderYear,
    ROUND(SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)), 2) AS TotalRevenue
FROM Categories c
JOIN Products p ON c.CategoryID = p.CategoryID
JOIN [Order Details] od ON p.ProductID = od.ProductID
JOIN Orders o ON od.OrderID = o.OrderID
GROUP BY c.CategoryName, strftime('%Y', o.OrderDate)
ORDER BY OrderYear DESC, TotalRevenue DESC;

#### D06 desk 2.1

I actually kind of just got it right, I think the practice from the previous tasks is slowly building up:

SELECT c.CategoryName, strftime('%Y', o.OrderDate) as OrderYear, SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalRevenue FROM Categories c
JOIN Products p ON c.CategoryID = p.CategoryID
JOIN [Order Details] od ON od.ProductID = p.ProductID
JOIN Orders o ON o.OrderID = od.OrderID
WHERE OrderYear = '2023'
GROUP BY c.CategoryName
HAVING TotalRevenue > 4000000
ORDER BY OrderYear, TotalRevenue DESC;

i didnt really bother trying different scenarios I was more focused on trying to just get it right and im out of energy so trying to just finish up, maybe we can look into it later on

#### D08 desk 1.1

SELECT ProductName, UnitPrice FROM PRODUCTS
WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM PRODUCTS);

#### D08 desk 1.10

SELECT OrderID, COUNT(OrderID) as [Amount of Line Items] FROM [Order Details]
GROUP BY OrderID

i mean i think it gave the correct answer but im not sure if you wanted me to try it some other way, anyways i was quite confident doing these, i dont think i have ever been this confident with SQL ever and we're only a week in compared to the past 6 years of a computer science degree, courses and tutorials so we're definitely doing something right

#### D08 desk 1.2

SELECT * FROM ORDERS o
JOIN Customers c on o.CustomerID = c.CustomerID
WHERE o.OrderDate >= '2023-08-01'
ORDER BY OrderDate;

i found out i could just do this instead:
SELECT DISTINCT CustomerID
FROM Orders
WHERE OrderDate >= '2023-08-01';

but im not sure if this is what u wanted since it gives 88 rows instead of the 58 you say

#### D08 desk 1.3

at first I did:
SELECT DISTINCT CustomerID FROM Orders
WHERE (OrderDate < '2023-08-01') AND (NOT (SELECT DISTINCT CustomerID FROM Orders WHERE OrderDate >= '2023-08-01'));

which obviously did not work and im not actually quite sure i understand why not but then i looked it up and got the correct answer:

SELECT DISTINCT CustomerID 
FROM Orders
WHERE OrderDate < '2023-08-01'
  AND CustomerID NOT IN (
      SELECT CustomerID 
      FROM Orders 
      WHERE OrderDate >= '2023-08-01'
  );

which to be honest is cleaner and makes more sense

#### D08 desk 1.4

SELECT OrderID, Freight,(SELECT AVG(Freight) FROM ORDERS) as Average_Freight FROM ORDERS
WHERE Freight > (SELECT AVG(Freight) FROM ORDERS);

#### D08 desk 1.5

SELECT s.SupplierID, s.CompanyName, s.Country FROM Suppliers s
JOIN Products p ON s.SupplierID = p.SupplierID
WHERE s.Country IN ('Germany');

#### D08 desk 1.6

this is funny cause i accidently did it in one of the examples above i guess but sure:

SELECT ProductName, (SELECT AVG(UnitPrice) FROM PRODUCTS) as [Average Price] FROM Products;

#### D08 desk 1.7

SELECT CustomerID, COUNT(OrderID) as [Total Orders] FROM Orders
GROUP BY CustomerID;

i dont understand how this is a subquery or did i not do what was asked?

#### D08 desk 1.8

SELECT c.CategoryName, COUNT(p.ProductID) as [Total Products] FROM PRODUCTS p
JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY c.CategoryName

#### D08 desk 1.9

SELECT e.FirstName || ' ' || e.LastName as [Full Name] , MAX(o.OrderDate) as [Last Order] FROM Orders o
JOIN Employees e on o.EmployeeID = o.EmployeeID
GROUP BY e.EmployeeID;

we getting a lil confident i decided to see what I can do to show this as a clean neat query from everything I learned

## 2026-08-21

#### D09 desk 1.1

**11:34** — I have gotten to this point already:
SELECT p.ProductName, c.CategoryName, SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) as [Total Revenue] FROM Products p
JOIN [Order Details] od ON p.ProductID = od.ProductID
JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY p.ProductName
ORDER BY [Total Revenue] DESC;

**11:35** — I understand it doesnt give me what I want yet but I am trying to figure out how to choose exactly 3 of each category so I will look it up now

**11:44** — the solution it gave and explained to me was this:

WITH RankedRevenue AS (
    SELECT 
        p.ProductName, 
        c.CategoryName, 
        SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS [Total Revenue],
        -- This ranks the products from highest to lowest revenue inside each category
        ROW_NUMBER() OVER (
            PARTITION BY c.CategoryName 
            ORDER BY SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) DESC
        ) AS rank_num
    FROM Products p
    JOIN [Order Details] od ON p.ProductID = od.ProductID
    JOIN Categories c ON p.CategoryID = c.CategoryID
    GROUP BY p.ProductName, c.CategoryName
)
SELECT 
    ProductName, 
    CategoryName, 
    [Total Revenue]
FROM RankedRevenue
WHERE rank_num <= 3
ORDER BY CategoryName ASC, [Total Revenue] DESC;

**11:48** — ok I think i understand this, test me on it sometimes in the next couple days

**14:06** — note for the things about I use * to multiply in the sql but in here it makes the text italic so note that but also change it so we dont have this issue going forward

#### D09 desk 1.2

**14:02** — I wrapped it in a CTE because we need a temporary list for each category so we can pick only 3 from each, the CTE is so that we can pick just 3 from each list and the window function is to seperate and then organise by category.

#### D09 desk 1.3

**14:11** — for ROW_NUMBER() it would simply ignore them and just rank them as a unique position depending on the order it was queried regardless on if they tie or not, RANK() will simply make them share the rank and then skip the next rank and finally DENSE_RANK() will make them share the rank but won't skip the next rank, easiest way i could explain it as its how i understood it

#### D09 desk 2.1

**14:48** — I just did:

SELECT * FROM ORDERS
WHERE strftime('%Y', OrderDate) = '2016'
ORDER BY OrderDate;

and have no idea where to go from there

**14:49** — I straight up looked up the answer and got:

WITH MonthlyCounts AS (
    SELECT 
        strftime('%m', OrderDate) AS Month,
        COUNT(OrderID) AS OrderCount
    FROM Orders
    WHERE strftime('%Y', OrderDate) = '2016'
    GROUP BY Month
)
SELECT 
    Month,
    OrderCount,
    -- This accumulates the monthly order counts in order of the months
    SUM(OrderCount) OVER (
        ORDER BY Month 
        ROWS UNBOUNDED PRECEDING
    ) AS RunningTotal
FROM MonthlyCounts
ORDER BY Month ASC;

now I will try to figure out how each part works

**14:56** — ok i somewhat understand it now

**15:07** — I rewrote it from my head to ensure it:

WITH MonthCount AS (
	SELECT strftime('%m', OrderDate) AS Month, COUNT(OrderID) AS OrderCount FROM Orders
	WHERE strftime('%Y', OrderDate) = '2016'
	GROUP BY Month)
	
SELECT Month, OrderCount,
SUM(OrderCount) OVER (
ORDER BY Month) AS RunningTotal
FROM MonthCount
ORDER BY Month;

#### D09 desk 2.2

**12:10** — WITH MonthlyCounts AS (
    SELECT 
        strftime('%m', OrderDate) AS Month,
        COUNT(OrderID) AS OrderCount
    FROM Orders
    WHERE strftime('%Y', OrderDate) = '2016'
    GROUP BY Month
)
SELECT 
    Month,
    OrderCount,
    -- This calculates the average of the current row and the 2 rows right above it
    AVG(OrderCount) OVER (
        ORDER BY Month 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS ThreeMonthRollingAvg
FROM MonthlyCounts
ORDER BY Month ASC;

**12:11** — obviously I just looked up the answer but I get it, instead of SUM() obviously we use AVG() to get the average, ROWS BETWEEN 2 PRECEDING AND CURRENT ROW to have it only read the current row and the 2 previous to it for counting the average

**15:08** — no clue where to start so im just looking it up, i dont even know what a moving average is
