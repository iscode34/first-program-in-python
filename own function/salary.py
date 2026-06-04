""" 
 A company pays Rp50,000 per hour for overtime work if an employee works more than 40 hours per week.
Function Specifications:
Create a function called calculateovertimesalary with 2 parameters: base_salary and totalhoursworked.
If totalhoursworked exceeds 40, calculate the extra hours, multiply them by Rp50,000, and add the result to the base salary.
If there is no overtime, the employee only receives the base salary.
Required: Return the employee's final salary.

"""

def calculate_overtime_salary(base_salary, total_hours_worked):
    if total_hours_worked > 40:
        overtime_hours = total_hours_worked - 40
        overtime_pay = overtime_hours * 50000
        final_salary = base_salary + overtime_pay
    else:
        final_salary = base_salary
    return final_salary

base_salary = float(input("Enter the base salary: "))
total_hours_worked = float(input("Enter the total hours worked: "))
final_salary = calculate_overtime_salary(base_salary, total_hours_worked)
print("The employee's final salary is:", final_salary)
