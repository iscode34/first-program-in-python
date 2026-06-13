import re


def validate_student_id(student_id):
    if not student_id or not student_id.strip():
        return False, "Student ID cannot be empty."
    if not re.match(r'^ST\d{4}$', student_id):
        return False, "Student ID must be in format ST followed by 4 digits (e.g., ST0001)."
    return True, ""


def validate_email(email):
    if not email or not email.strip():
        return False, "Email cannot be empty."
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return False, "Invalid email format."
    return True, ""


def validate_phone(phone):
    if not phone or not phone.strip():
        return False, "Phone number cannot be empty."
    if not re.match(r'^\+?[\d\s\-()]{7,15}$', phone):
        return False, "Invalid phone number format."
    return True, ""


def validate_grade(grade):
    valid_grades = {'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'}
    if grade.upper() not in valid_grades:
        return False, f"Invalid grade. Must be one of: {', '.join(sorted(valid_grades))}."
    return True, ""
