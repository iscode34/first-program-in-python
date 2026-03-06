
hourly_rate = float(input("Enter hourly rate (Rp): "))
hours = int(input("Enter total hours worked: "))
minutes = int(input("Enter additional minutes worked: "))


decimal_minutes = minutes / 60


total_hours = hours + decimal_minutes


total_payment = total_hours * hourly_rate


print("Total working hours:", total_hours)
print("Total payment: Rp", total_payment)