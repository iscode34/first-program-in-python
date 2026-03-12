hours = int(input("Enter parking hours: "))

if hours <= 2:
    fee = 5000
else:
    extra = hours - 2
    fee = 5000 + (extra * 3000)

print("Total parking fee: Rp", fee)