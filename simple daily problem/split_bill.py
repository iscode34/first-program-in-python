
total_bill = float(input("Enter total bill (Rp): "))
people = int(input("Enter number of people: "))


tax = total_bill * 0.10
total_after_tax = total_bill + tax


each_person = total_after_tax / people


print("\n--- Bill Summary ---")
print("Total bill before tax: Rp", total_bill)
print("Tax (10%): Rp", tax)
print("Total bill after tax: Rp", total_after_tax)
print("Each person must pay: Rp", each_person)