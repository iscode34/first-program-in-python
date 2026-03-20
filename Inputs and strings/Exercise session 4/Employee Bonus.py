salary = float(input("Enter salary: "))
years = int(input("Enter years of service: "))

if years >= 10:
    bonus = 0.25 * salary
elif years >= 5:
    bonus = 0.15 * salary
elif years >= 1:
    bonus = 0.05 * salary
else:
    bonus = 0

print("Bonus: $", bonus)
