##You and your friends have finished dinner at a restaurant. You want to create a function called calculatesplitbill to determine how much each person should pay.
##Accepts 3 parameters: total_bill (total food cost), numberofpeople (number of diners), and tip_percentage (e.g., 10 for 10%).
##The function must calculate the total bill including the tip, then divide it equally among all participants.


def calculate_split_bill(total_bill, num_people, tip_percentage):
    if num_people <= 0:
        return "Number of people must be greater than zero."
    tip_amount = total_bill * (tip_percentage / 100)
    total_with_tip = total_bill + tip_amount
    split_amount = total_with_tip / num_people
    return split_amount
total_bill = float(input("Enter the total bill amount: "))
num_people = int(input("Enter the number of people: "))
tip_percentage = float(input("Enter the tip percentage: "))
result = calculate_split_bill(total_bill, num_people, tip_percentage)
print("Each person should pay:", result)

