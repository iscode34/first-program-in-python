import os
from students.validation import validate_student_id, validate_grade
from students.student_manager import StudentManager
from courses.course_manager import CourseManager

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
GRADES_FILE = os.path.join(DATA_DIR, 'grades.txt')

GRADE_POINTS = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'F': 0.0
}


def load_grades():
    grades = []
    if not os.path.exists(GRADES_FILE):
        return grades
    try:
        with open(GRADES_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    parts = line.split('|')
                    if len(parts) >= 3:
                        grades.append({
                            'student_id': parts[0],
                            'course_id': parts[1],
                            'grade': parts[2].upper()
                        })
    except IOError as e:
        print(f"Error reading grades file: {e}")
    return grades


def save_grades(grades):
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(GRADES_FILE, 'w') as f:
            for g in grades:
                f.write(f"{g['student_id']}|{g['course_id']}|{g['grade']}\n")
    except IOError as e:
        print(f"Error writing grades file: {e}")


def add_grade():
    print("\n--- Add Grade ---")
    grades = load_grades()

    while True:
        sid = input("Enter Student ID: ").strip().upper()
        valid, msg = validate_student_id(sid)
        if not valid:
            print(msg)
            continue
        student_name = StudentManager.get_student_name(sid)
        if not student_name:
            print(f"Student with ID '{sid}' does not exist.")
            continue
        print(f"Student: {student_name}")
        break

    cid = input("Enter Course ID: ").strip().upper()
    if not cid:
        print("Course ID cannot be empty.")
        return
    course_name = CourseManager.get_course_name(cid)
    if not course_name:
        print(f"Course with ID '{cid}' does not exist.")
        return
    print(f"Course: {course_name}")

    for g in grades:
        if g['student_id'] == sid and g['course_id'] == cid:
            print(f"Grade already exists for student '{sid}' in course '{cid}'.")
            return

    while True:
        grade = input("Enter Grade (A, A-, B+, B, B-, C+, C, C-, D, F): ").strip().upper()
        valid, msg = validate_grade(grade)
        if valid:
            break
        print(msg)

    grades.append({'student_id': sid, 'course_id': cid, 'grade': grade})
    save_grades(grades)
    print(f"Grade '{grade}' added for student '{sid}' in course '{course_name}'.")


def view_grades():
    print("\n--- View Grades ---")
    sid = input("Enter Student ID: ").strip().upper()
    grades = load_grades()
    student_name = StudentManager.get_student_name(sid)

    if not student_name:
        print(f"Student with ID '{sid}' not found.")
        return

    student_grades = [g for g in grades if g['student_id'] == sid]

    if not student_grades:
        print(f"No grades found for student '{student_name}' ({sid}).")
        return

    print(f"\nGrades for {student_name} ({sid}):")
    print(f"{'Course ID':<12} {'Course Name':<30} {'Grade':<6}")
    print("-" * 48)
    total_points = 0
    total_credits = 0
    for g in sorted(student_grades, key=lambda x: x['course_id']):
        cname = CourseManager.get_course_name(g['course_id']) or g['course_id']
        credits = CourseManager.get_course_credits(g['course_id'])
        points = GRADE_POINTS.get(g['grade'], 0) * credits
        total_points += points
        total_credits += credits
        print(f"{g['course_id']:<12} {cname:<30} {g['grade']:<6}")

    if total_credits > 0:
        gpa = total_points / total_credits
        print(f"\nTotal Credits: {total_credits}")
        print(f"GPA: {gpa:.2f}")


def update_grade():
    print("\n--- Update Grade ---")
    sid = input("Enter Student ID: ").strip().upper()
    cid = input("Enter Course ID: ").strip().upper()

    grades = load_grades()
    for g in grades:
        if g['student_id'] == sid and g['course_id'] == cid:
            print(f"Current grade: {g['grade']}")
            while True:
                new_grade = input("Enter new grade: ").strip().upper()
                valid, msg = validate_grade(new_grade)
                if valid:
                    g['grade'] = new_grade
                    save_grades(grades)
                    print(f"Grade updated to '{new_grade}' for student '{sid}' in course '{cid}'.")
                    return
                print(msg)

    print(f"No grade found for student '{sid}' in course '{cid}'.")


def delete_grade():
    print("\n--- Delete Grade ---")
    sid = input("Enter Student ID: ").strip().upper()
    cid = input("Enter Course ID: ").strip().upper()

    grades = load_grades()
    for i, g in enumerate(grades):
        if g['student_id'] == sid and g['course_id'] == cid:
            confirm = input(f"Are you sure you want to delete grade '{g['grade']}' for student "
                            f"'{sid}' in course '{cid}'? (y/n): ").strip().lower()
            if confirm == 'y':
                del grades[i]
                save_grades(grades)
                print("Grade deleted successfully!")
            else:
                print("Deletion cancelled.")
            return

    print(f"No grade found for student '{sid}' in course '{cid}'.")


class GradeManager:
    @staticmethod
    def get_student_grades(sid):
        grades = load_grades()
        return [g for g in grades if g['student_id'] == sid]

    @staticmethod
    def get_course_grades(cid):
        grades = load_grades()
        return [g for g in grades if g['course_id'] == cid]

    @staticmethod
    def calculate_gpa(sid):
        grades = load_grades()
        student_grades = [g for g in grades if g['student_id'] == sid]
        total_points = 0
        total_credits = 0
        for g in student_grades:
            credits = CourseManager.get_course_credits(g['course_id'])
            points = GRADE_POINTS.get(g['grade'], 0) * credits
            total_points += points
            total_credits += credits
        if total_credits == 0:
            return 0.0
        return round(total_points / total_credits, 2)
