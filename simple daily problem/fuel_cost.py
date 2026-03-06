
distance = float(input("Enter travel distance (km): "))


fuel_efficiency = 40      # km per liter
fuel_price = 13000        # Rp per liter

#fuel needed
fuel_needed = distance / fuel_efficiency

#total cost
total_cost = fuel_needed * fuel_price


print("\n--- Trip Fuel Cost Estimation ---")
print("Travel distance:", distance, "km")
print("Fuel needed:", fuel_needed, "liters")
print("Total fuel cost: Rp", total_cost)