amount = float(input("Enter total purchase amount: "))

if amount >= 500000:
    discount = amount * 0.20
elif amount >= 250000:
    discount = amount * 0.10
else:
    discount = 0

final_amount = amount - discount

print("Discount:", discount)
print("Amount to pay:", final_amount)