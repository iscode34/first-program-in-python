initial_price = 12000000   # Rp
salvage_value = 2000000    # Rp
economic_life = 4          # years


annual_depreciation = (initial_price - salvage_value) / economic_life


value_after_2_years = initial_price - (annual_depreciation * 2)

print("--- Laptop Depreciation Calculation ---")
print("Initial Price: Rp", initial_price)
print("Salvage Value: Rp", salvage_value)
print("Economic Life:", economic_life, "years")
print("Annual Depreciation: Rp", annual_depreciation)
print("Laptop Value After 2 Years: Rp", value_after_2_years)