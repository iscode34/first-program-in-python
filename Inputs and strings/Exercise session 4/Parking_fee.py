vehicle = input("Enter vehicle type (motorcycle/car/bus): ")
hours = int(input("Enter hours parked: "))

if vehicle == "motorcycle":
    first = 1
    extra = 0.5
elif vehicle == "car":
    first = 2
    extra = 1
elif vehicle == "bus":
    first = 3
    extra = 2
else:
    print("Invalid vehicle type")
    exit()

if hours <= 1:
    fee = first
else:
    fee = first + (hours - 1) * extra

print("Parking fee: $", fee)
