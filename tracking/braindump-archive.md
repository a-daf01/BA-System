# Brain dump archive

Digested days, newest first. Kept so a weekly or Month 2 review can read back over what
the days actually felt like, not just the confidence scores.

---
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

