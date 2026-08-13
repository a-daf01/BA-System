# Brain dump archive

Digested days, newest first. Kept so a weekly or Month 2 review can read back over what
the days actually felt like, not just the confidence scores.

---
## 2026-08-13 — Day 02

1
SELECT * FROM Customers
WHERE Country = 'Germany';
2
SELECT * FROM Products
WHERE UnitPrice > 20;
3
I put:
SELECT * FROM ORDERS
WHERE OrderDate IS 1997;
but I don't think its right, not only because it gave no results which might genuinely be because there is no 1997 orders, but I just don't think that's how im supposed to do it I will look it up now

it gave me:
SELECT * FROM ORDERS
WHERE strftime('%Y', OrderDate) = '1997';

which also has no results so I think its just a trick question

4
SELECT * FROM Products
WHERE Discontinued IS 0;
5
SELECT * FROM Customers
WHERE Country = 'France' or Country = 'Germany';
- not sure if there's a more efficient way to do this I feel like there is
6
SELECT * FROM PRODUCTS
WHERE ((UnitsInStock < 10) OR (UnitsInStock > 100)) AND (Discontinued = 0);
you're right the brackets got me at first but I figured it out by myself
7
I had to look up IN Operator but I understand it now and solved it using my understanding didn't look up the answer itself
SELECT * FROM Customers
WHERE Country IN ('Spain', 'Germany', 'France');
8
SELECT * FROM Products
WHERE UnitPrice BETWEEN 10 AND 30;
9
SELECT * FROM ORDERS
WHERE OrderDate BETWEEN '1997-01-01' AND '1997-03-31';
im not sure if you're using these values to result null on purpose but I don't think there's no 1997 orders
I did this one and it worked:
SELECT * FROM ORDERS
WHERE OrderDate BETWEEN '2016-01-01' AND '2016-03-31';
10
I had to look up how to search company names that start with B, but I knew about the LIKE operator which I used fine in the second one
SELECT * FROM Customers
WHERE CompanyName LIKE 'B%';	

SELECT * FROM Customers
WHERE CompanyName LIKE '%market%';	

11
SELECT * FROM Orders
WHERE ShippedDate IS NULL;
12
SELECT * FROM Customers
WHERE Region IS NULL;
13
This is what I attempted to be honest:
SELECT COUNT(SELECT * FROM ORDERS WHERE ShippedDate IS NULL) AS UnShippedOrders, COUNT(OrderID) FROM Orders
GROUP BY OrderID;

but its obviously wrong, but it should give you an indication of how I think maybe, I genuinely don't know how I am supposed to like come up with these solutions.Looked up the answer and got:
SELECT COUNT(OrderID) As TotalOrders, SUM(CASE WHEN ShippedDate IS NULL THEN 1 ELSE 0 END) AS UnShippedOrders FROM Orders;

I did some excercises with CASE before so it was a good refresh, I just am not sure if I still would recognise this is an example I should use it in either way

14
SELECT * FROM PRODUCTS
ORDER BY CategoryID ASC, UnitPrice DESC;

15
SELECT * FROM PRODUCTS
ORDER BY SupplierID, ProductName
LIMIT 20;

I didn't put ASC because I am pretty sure that's default when you use ORDER BY right?


TASK 2
6: We want you to give us a report of all the active stock that is currently underperforming or overperforming, maybe the stock reflects on it? Also it could just simply be a matter of give us a report of all active stock that needs to be restocked or that is holding too much storage space.

11: Why are we getting reports about customers not receiving their orders in time?
How long does it take our orders to get shipped from order date?

13: I genuinely don't have a strong question for this one, I will just guess:
Whats the percentage of unshipped orders compared to all our orders at any specific time (to maybe see their efficiency)

## 2026-08-12 — Day 01

I was doing all of day 1's tasks fine until I got to (4) and I had to look up the solution, I understand it too, I did a lot of sql courses and what not before I just needed a little memory refresh I guess:

SELECT 
    c.CustomerID, 
    c.CompanyName, 
    COUNT(o.OrderID) AS TotalOrders
FROM 
    Customers c
JOIN 
    Orders o ON c.CustomerID = o.CustomerID
GROUP BY 
    c.CustomerID, 
    c.CompanyName
HAVING 
    COUNT(o.OrderID) > 10
ORDER BY 
    TotalOrders DESC;


that's the solution I found but when I tried to just do it myself after to make sure I do have it I settled for

SELECT c.CompanyName, COUNT(o.OrderID) as OrderCount
FROM Customers c
JOIN Orders o
ON c.CustomerID = o.CustomerID
GROUP BY c.CompanyName
HAVING COUNT(o.OrderID) > 10;

I tried to figure out (5) but I genuinely can't get my head around how to do it, like the logic behind how to type up the SQL to do that, so I will have to look it up, I'm not sure why I struggle with the logic so much, the maths itself isn't an issue for me whatsoever, its just turning that logic into SQL. It's also why I'm not much in coding, because I can't translate that logic, maybe its an ADHD thing or just a department I am lacking in and do not know the ways that work for me yet. I did figure out I need to use the products table and order details table though, that wasn't an issue for me. I forgot what the math command was which I just realise its simply SUM(), I looked up the solution and got:

SELECT TOP 5 
    p.ProductName,
    SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalRevenue
FROM Products p
JOIN [Order Details] od ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY TotalRevenue DESC;


which is actually much simpler than I thought this would be, I did not know about "TOP 5" I thought id have to find some way to choose the top 5 by using LIMIT or something.

oh now I realise SUM() isn't a multiplication or math command its simply to add all the revenues together when grouping it by product name

actually I just realised the above doesn't work on SQLite and after doing some research I got the following by myself, I guess it was LIMIT as I thought, I also learned it might be better practice to use ROUND instead of SUM but I just stuck with sum for now:

SELECT p.ProductName, SUM(od.UnitPrice * od.Quantity * (1-od.Discount)) as TotalRevenue
FROM Products p
JOIN [ORDER DETAILS] od ON p.ProductID = od.ProductID
GROUP BY p.ProductName
ORDER BY TotalRevenue DESC
LIMIT 5;

for the bar chart I didn't really struggle with it much, I simply just put customerID in the y axis and orderID in the X axis to get a count of each ORDER ID by CustomerID, nothing too crazy but I did some training on power BI before so im a bit familiar with it, but not sure an expert, but for now I comfortably loaded it and made the bar chart. It did load in some errors for the dates at first though, I simply went to transform and clicked "remove errors" now here's something I can tell you, I don't even understand what the error was or what it did to fix it, anyways I am done for today, im checking the other 2 as done from the phone ill do them.

