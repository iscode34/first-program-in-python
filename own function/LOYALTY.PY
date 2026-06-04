"""A grocery store rewards loyal customers with shopping points.

Function Specifications:

Create a function called calculateloyaltypoints with 2 parameters: total_transaction and member_status (Boolean: True/False).

If member_status is False, immediately return 0 without performing any calculations.

If member_status is True, the customer earns 1 point for every Rp20,000 spent.

Use floor division (//) to calculate the number of points.

Required: Return the total points earned."""

def calculate_loyalty_points(total_transaction, member_status):
    if not member_status:
        return 0
    points = total_transaction // 20000
    return points
total_transaction = float(input("Enter the total transaction amount: "))
member_status_input = input("Is the customer a member? (True/False): ")
member_status = member_status_input.lower() == 'true'
loyalty_points = calculate_loyalty_points(total_transaction, member_status)
print("The total loyalty points earned is:", loyalty_points)
