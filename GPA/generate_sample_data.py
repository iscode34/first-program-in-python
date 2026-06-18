import pandas as pd

subjects = pd.DataFrame({
    "SubjectCode": ["CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201"],
    "SubjectName": [
        "Programming Fundamentals",
        "Data Structures",
        "Calculus I",
        "English I",
        "Physics I",
        "Algorithms",
        "Linear Algebra",
        "English II",
    ],
    "SKS": [3, 4, 3, 2, 3, 4, 3, 2],
})

students = pd.DataFrame({
    "StudentID": ["S001", "S002", "S003", "S004", "S005"],
    "StudentName": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
})

raw_scores = pd.DataFrame({
    "StudentID": [
        "S001", "S001", "S001", "S001", "S001", "S001", "S001", "S001",
        "S002", "S002", "S002", "S002", "S002", "S002", "S002", "S002",
        "S003", "S003", "S003", "S003", "S003", "S003", "S003", "S003",
        "S004", "S004", "S004", "S004", "S004", "S004", "S004", "S004",
        "S005", "S005", "S005", "S005", "S005", "S005", "S005", "S005",
    ],
    "SubjectCode": [
        "CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201",
        "CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201",
        "CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201",
        "CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201",
        "CS101", "CS102", "MA101", "EN101", "PH101", "CS201", "MA201", "EN201",
    ],
    "Score": [
        92, 78, 85, 88, 55, 81, 73, 90,
        45, 62, 71, 80, 67, 59, 84, 77,
        95, 88, 76, 91, 83, 74, 69, 85,
        60, 72, 58, 75, 70, 66, 90, 82,
        87, 93, 64, 79, 88, 77, 85, 72,
    ],
})

with pd.ExcelWriter("academic_data.xlsx", engine="openpyxl") as writer:
    subjects.to_excel(writer, sheet_name="Subjects", index=False)
    students.to_excel(writer, sheet_name="Students", index=False)
    raw_scores.to_excel(writer, sheet_name="RawScores", index=False)

print("Sample workbook 'academic_data.xlsx' created with 3 sheets.")
