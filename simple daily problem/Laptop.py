laptop_price = float(input("Enter laptop price (Rp): "))
monthly_savings = float(input("Enter monthly savings (Rp): "))


months_needed = laptop_price / monthly_savings


print("\n--- Savings Plan ---")
print("Laptop price: Rp", laptop_price)
print("Monthly savings: Rp", monthly_savings)
print("Months needed to buy the laptop:", months_needed)