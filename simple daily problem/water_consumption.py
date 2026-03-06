people = int(input("Enter number of people in the house: "))


water_per_person = 2.5   # liters per day
days = 7
gallon_size = 19         # liters
price_per_gallon = 19000 # Rp


weekly_water = people * water_per_person * days

#gallons needed (float result)
gallons_needed = weekly_water / gallon_size


total_budget = gallons_needed * price_per_gallon

# Output
print("\n--- Water Consumption Report ---")
print("Total weekly water requirement:", weekly_water, "liters")
print("Gallons needed:", gallons_needed)
print("Total budget needed: Rp", total_budget)