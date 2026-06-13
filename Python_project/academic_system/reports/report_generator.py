from students.student_manager import StudentManager, load_students
from courses.course_manager import CourseManager, load_courses
from grades.grade_manager import GradeManager, load_grades, GRADE_POINTS


class ReportGenerator:
    @staticmethod
    def student_report():
        print("\n===== STUDENT ACADEMIC REPORT =====")
        sid = input("Enter Student ID: ").strip().upper()
        student_name = StudentManager.get_student_name(sid)
        if not student_name:
            print(f"Student with ID '{sid}' not found.")
            return

        print(f"\nStudent: {student_name} ({sid})")
        print("=" * 48)

        grades = GradeManager.get_student_grades(sid)
        if not grades:
            print("No grades recorded.")
            return

        print(f"{'Course ID':<12} {'Course Name':<25} {'Credits':<8} {'Grade':<6} {'Points':<6}")
        print("-" * 57)
        total_points = 0
        total_credits = 0
        for g in sorted(grades, key=lambda x: x['course_id']):
            cname = CourseManager.get_course_name(g['course_id']) or g['course_id']
            credits = CourseManager.get_course_credits(g['course_id'])
            points = GRADE_POINTS.get(g['grade'], 0) * credits
            total_points += points
            total_credits += credits
            print(f"{g['course_id']:<12} {cname:<25} {credits:<8} {g['grade']:<6} {points:<6}")

        print("-" * 57)
        gpa = total_points / total_credits if total_credits > 0 else 0
        print(f"{'Total':<12} {'':<25} {total_credits:<8} {'':<6} {total_points:<6}")
        print(f"\nSemester GPA: {gpa:.2f}")

    @staticmethod
    def course_report():
        print("\n===== COURSE GRADE REPORT =====")
        cid = input("Enter Course ID: ").strip().upper()
        course_name = CourseManager.get_course_name(cid)
        if not course_name:
            print(f"Course with ID '{cid}' not found.")
            return

        print(f"\nCourse: {course_name} ({cid})")
        print("=" * 48)

        grades = GradeManager.get_course_grades(cid)
        if not grades:
            print("No grades recorded for this course.")
            return

        print(f"{'Student ID':<12} {'Student Name':<25} {'Grade':<6}")
        print("-" * 43)
        grade_distribution = {}
        for g in sorted(grades, key=lambda x: x['student_id']):
            sname = StudentManager.get_student_name(g['student_id']) or g['student_id']
            print(f"{g['student_id']:<12} {sname:<25} {g['grade']:<6}")
            grade_distribution[g['grade']] = grade_distribution.get(g['grade'], 0) + 1

        print(f"\nTotal students enrolled: {len(grades)}")
        print("\nGrade Distribution:")
        for grade in sorted(grade_distribution.keys(), key=lambda g: GRADE_POINTS.get(g, 0), reverse=True):
            count = grade_distribution[grade]
            bar = "#" * count
            print(f"  {grade:<4} ({count:>2}) {bar}")

    @staticmethod
    def all_students_summary():
        print("\n===== ALL STUDENTS SUMMARY =====")
        students = load_students()
        if not students:
            print("No students found.")
            return

        print(f"{'Student ID':<12} {'Name':<25} {'Courses':<8} {'GPA':<6}")
        print("-" * 51)
        for sid in sorted(students.keys()):
            sname = students[sid]['name']
            grades = GradeManager.get_student_grades(sid)
            course_count = len(grades)
            gpa = GradeManager.calculate_gpa(sid)
            print(f"{sid:<12} {sname:<25} {course_count:<8} {gpa:<6}")

    @staticmethod
    def honor_roll():
        print("\n===== HONOR ROLL (GPA >= 3.5) =====")
        students = load_students()
        if not students:
            print("No students found.")
            return

        honors = []
        for sid in students:
            gpa = GradeManager.calculate_gpa(sid)
            if gpa >= 3.5:
                honors.append((sid, students[sid]['name'], gpa))

        if not honors:
            print("No students qualify for the honor roll.")
            return

        honors.sort(key=lambda x: x[2], reverse=True)
        print(f"{'Rank':<6} {'Student ID':<12} {'Name':<25} {'GPA':<6}")
        print("-" * 49)
        for i, (sid, name, gpa) in enumerate(honors, 1):
            print(f"{i:<6} {sid:<12} {name:<25} {gpa:<6}")
        print(f"\nTotal honor roll students: {len(honors)}")
