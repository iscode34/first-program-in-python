units = float(input("Enter electricity usage (kWh): "))

if units <= 100:
    price = 0.10
elif units <= 300:
    price = 0.15
else:
    price = 0.20

total = units * price

print("Total bill: $", total)
