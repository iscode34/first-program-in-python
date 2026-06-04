"""A teacher wants to automatically identify students who score below the passing grade.

Function Specifications:

Create a function called is_passed with 2 parameters: student_score and passing_score.

The function must check whether student_score is greater than or equal to passing_score.

Required: Return a Boolean value: True if the student passes, and False otherwise."""
def is_passed(student_score, passing_score):
    return student_score >= passing_score
student_score = float(input("Enter the student's score: "))
passing_score = float(input("Enter the passing score: "))
result = is_passed(student_score, passing_score)
if result:
    print("The student has passed.")
else:    print("The student has failed.")
