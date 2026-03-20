salary = float(input("Enter salary: "))
credit_score = int(input("Enter credit score: "))
years = int(input("Enter years of employment: "))

count = 0

if salary >= 3000:
    count += 1
if credit_score >= 650:
    count += 1
if years >= 2:
    count += 1

if count == 3:
    print("Loan Approved")
elif count == 2:
    print("Conditional Approval")
else:
    print("Loan Rejected")
