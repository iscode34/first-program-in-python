
numbers = [1, 1, 2, 2, 4, 4, 5, 6]
unique_numbers = []

for num in numbers:
    if num not in unique_numbers:
        unique_numbers.append(num)

print("List after removing duplicates:", unique_numbers)
