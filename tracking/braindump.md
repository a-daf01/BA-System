Task 1:
I started the task by doing:
SELECT * FROM Customers c
JOIN INNER Orders o on c.CustomerID = o.CustomerID
WHERE o.OrderID IS NULL;

I did do INNER and LEFT joins before, I know INNER join is the intersection between both tables and LEFT join is the intersections between the tables plus everything else in the "LEFT" table so LEFT will naturally have more rows in general but now I need to remind myself o how to write the SQL commands and organise the logic. I also know that for this example you have to use a LEFT JOIN because it forces a list of every single customer even if they don't have orders, and then the WHERE filters out the customers with orders leaving us with our required list

ok I realised its INNER JOIN not JOIN INNER, but it still just gives 0 rows so I guess there are no customers with no orders

Task 2:
SELECT * FROM [Order Details] od
JOIN Products p ON od.ProductID = p.ProductID
JOIN Orders o on od.OrderID = o.OrderID;

I kind of remember this quite well already not sure what much I can do with it, by the way the tasks today as so vague and I am kind of speed running through them because I just assume and do the clear instruction its asking me to do, I am not sure what I am supposed to experiment with.

Task 3:
A LEFT join can inflate rows in a table of customers and all their orders for example, if we use a LEFT join instead of a JOIN or INNER JOIN we will also have customers who do not have orders. We can check or detect this by checking for NULL fields for example, can't think of anything else in my head currently.

Phone review:
the review is just so vague in general, this system isn't as efficient as I want it to be, like I am struggling to figure out what its even saying or what it wants me to do or what it's referring to, like wtf is "Query 9" or "Query 12" its just extra steps making me have to go back to the previous day or whatever, its literally just unnecessary friction, I want you to go through the entire system, you will have an agent assigned to each day and it'll ensure any issues we've mentioned so far is solved or create a skill that ensure the next day after I finish up my day, the skill checks and updates the next day to ensure it's fully ready and friction free so I can have a clear plan and guide to follow 