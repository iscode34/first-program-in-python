
length = float(input("Enter room length (m): "))
width = float(input("Enter room width (m): "))
height = float(input("Enter room height (m): "))

coverage_per_can = 10  # m² per can


wall_area = 2 * (length * height) + 2 * (width * height)

cans_needed = wall_area / coverage_per_can

print("\n--- Wall Painting Calculation ---")
print("Total wall area:", wall_area, "m²")
print("Paint cans needed:", cans_needed)