# 1) Determine whether a value is positive, negative, or zero
num = float(input("Enter a number: "))

if num > 0:
    print("Positive")
elif num < 0:
    print("Negative")
else:
    print("Zero")


# 2) Calculate the Average of 3 Values
value1 = float(input("\nEnter value 1: "))
value2 = float(input("Enter value 2: "))
value3 = float(input("Enter value 3: "))

average = (value1 + value2 + value3) / 3
print("Average:", average)


# 3) Determine whether a person is an Adult or Not
age = int(input("\nEnter age: "))

if age >= 17:
    print("Adult")
else:
    print("Minor")


# 4) Calculate a Simple Discount
price = float(input("\nEnter item price: "))

if price >= 100000:
    discount = price * 0.10
else:
    discount = 0

total_payment = price - discount
print("Total payment:", total_payment)


# 5) Determine the Largest of 2 Numbers
num1 = float(input("\nEnter first number: "))
num2 = float(input("Enter second number: "))

if num1 > num2:
    print("The largest number is:", num1)
elif num2 > num1:
    print("The largest number is:", num2)
else:
    print("Both numbers are equal")