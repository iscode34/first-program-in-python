"""A website wants to automatically generate usernames for new users based on their name and birth year.
Function Specifications:
Create a function called create_username with 2 parameters: full_name and birth_year.
The function should take the first word of full_name (convert it to lowercase), then append the last two digits of birth_year.
Example: 1998 becomes 98.
Required: Return the generated username string.
Hint: You can use the .split() method and string slicing [-2:]"""
def create_username(full_name, birth_year):
    first_name = full_name.split()[0].lower()
    birth_year_suffix = str(birth_year)[-2:]
    username = first_name + birth_year_suffix
    return username
full_name = input("Enter your full name: ")
birth_year = int(input("Enter your birth year: "))
username = create_username(full_name, birth_year)
print("Your generated username is:", username)
