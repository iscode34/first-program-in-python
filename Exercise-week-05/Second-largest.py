
numbers = [9, 100, 101, 88, 3]

largest = numbers[0]
second_largest = numbers[0]

# the largest number
for num in numbers:
    if num > largest:
        largest = num

# the second largest number
second_largest = None
for num in numbers:
    if num != largest:
        if second_largest is None or num > second_largest:
            second_largest = num

print("Second largest number:", second_largest)
