"""You are building the checkout system for an online shopping application. You need a function that formats a buyer's address into a standard one-line text.
Function Specifications:
Create a function called format_address with 4 parameters: street, city, province, and postal_code.
The function must combine these parameters into the following format:
Street: [street], City: [city], [province] ([postal_code])
Required: Return the formatted address string (do not just print it)."""

def format_address(street, city, province, postal_code):
    formatted_address = f"Street: {street}, City: {city}, {province} ({postal_code})"
    return formatted_address

street = input("Enter the street: ")
city = input("Enter the city: ")
province = input("Enter the province: ")
postal_code = input("Enter the postal code: ")

formatted_address = format_address(street, city, province, postal_code)
print(formatted_address)
