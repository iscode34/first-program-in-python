""" A movie theater offers a Rp15,000 discount if the customer has the coupon code "NONTONSERU" and purchases at least 2 tickets.
Function Specifications:
Create a function called check_discount with 3 parameters: total_price, ticket_quantity, and coupon_code.
If coupon_code is "NONTONSERU" and ticket_quantity is at least 2, reduce total_price by Rp15,000.
Otherwise, the price remains unchanged.
Required: Return the final amount the customer must pay. """
def check_discount(total_price, ticket_quantity, coupon_code):
    if coupon_code == "NONTONSERU" and ticket_quantity >= 2:
        total_price -= 15000
    return total_price 
total_price = float(input("Enter the total price: "))
ticket_quantity = int(input("Enter the number of tickets: "))
coupon_code = input("Enter the coupon code: ")
final_amount = check_discount(total_price, ticket_quantity, coupon_code)
print("The final amount to pay is:", final_amount)
