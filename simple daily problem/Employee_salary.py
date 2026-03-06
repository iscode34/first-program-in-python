base_salary = 5000000
allowance = 750000


bpjs_rate = 0.02
tax_rate = 0.05

# gross salary
gross_salary = base_salary + allowance

# deductions
bpjs_deduction = gross_salary * bpjs_rate
tax_deduction = gross_salary * tax_rate
total_deductions = bpjs_deduction + tax_deduction

# net salary
net_salary = gross_salary - total_deductions


print("--- Salary Calculation ---")
print("Base Salary: Rp", base_salary)
print("Allowance: Rp", allowance)
print("Gross Salary: Rp", gross_salary)
print("BPJS Deduction (2%): Rp", bpjs_deduction)
print("Tax Deduction (5%): Rp", tax_deduction)
print("Net Salary Received: Rp", net_salary)