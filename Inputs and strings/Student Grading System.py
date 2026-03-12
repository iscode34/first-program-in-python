score = int(input("Enter student score: "))

if score >= 85:
    grade = "A"
elif score >= 70:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "D"

print("Score:", score)
print("Grade:", grade)