import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from students.student_manager import add_student, view_student, update_student, delete_student, list_students
from courses.course_manager import add_course, view_course, update_course, delete_course, list_courses
from grades.grade_manager import add_grade, view_grades, update_grade, delete_grade
from reports.report_generator import ReportGenerator


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def main_menu():
    while True:
        clear_screen()
        print("=" * 50)
        print("        STUDENT ACADEMIC RECORD SYSTEM")
        print("=" * 50)
        print("1. Student Management")
        print("2. Course Management")
        print("3. Grade Management")
        print("4. Reports")
        print("5. Exit")
        print("=" * 50)
        choice = input("Enter your choice (1-5): ").strip()

        if choice == '1':
            student_menu()
        elif choice == '2':
            course_menu()
        elif choice == '3':
            grade_menu()
        elif choice == '4':
            report_menu()
        elif choice == '5':
            print("\nThank you for using the Student Academic Record System. Goodbye!")
            sys.exit(0)
        else:
            input("Invalid choice. Press Enter to continue...")


def student_menu():
    while True:
        clear_screen()
        print("--- Student Management ---")
        print("1. Add Student")
        print("2. View Student")
        print("3. Update Student")
        print("4. Delete Student")
        print("5. List All Students")
        print("6. Back to Main Menu")
        print("-" * 30)
        choice = input("Enter your choice (1-6): ").strip()

        if choice == '1':
            add_student()
        elif choice == '2':
            view_student()
        elif choice == '3':
            update_student()
        elif choice == '4':
            delete_student()
        elif choice == '5':
            list_students()
        elif choice == '6':
            break
        else:
            print("Invalid choice.")
        input("\nPress Enter to continue...")


def course_menu():
    while True:
        clear_screen()
        print("--- Course Management ---")
        print("1. Add Course")
        print("2. View Course")
        print("3. Update Course")
        print("4. Delete Course")
        print("5. List All Courses")
        print("6. Back to Main Menu")
        print("-" * 30)
        choice = input("Enter your choice (1-6): ").strip()

        if choice == '1':
            add_course()
        elif choice == '2':
            view_course()
        elif choice == '3':
            update_course()
        elif choice == '4':
            delete_course()
        elif choice == '5':
            list_courses()
        elif choice == '6':
            break
        else:
            print("Invalid choice.")
        input("\nPress Enter to continue...")


def grade_menu():
    while True:
        clear_screen()
        print("--- Grade Management ---")
        print("1. Add Grade")
        print("2. View Grades (by Student)")
        print("3. Update Grade")
        print("4. Delete Grade")
        print("5. Back to Main Menu")
        print("-" * 30)
        choice = input("Enter your choice (1-5): ").strip()

        if choice == '1':
            add_grade()
        elif choice == '2':
            view_grades()
        elif choice == '3':
            update_grade()
        elif choice == '4':
            delete_grade()
        elif choice == '5':
            break
        else:
            print("Invalid choice.")
        input("\nPress Enter to continue...")


def report_menu():
    while True:
        clear_screen()
        print("--- Reports ---")
        print("1. Student Academic Report")
        print("2. Course Grade Report")
        print("3. All Students Summary")
        print("4. Honor Roll (GPA >= 3.5)")
        print("5. Back to Main Menu")
        print("-" * 30)
        choice = input("Enter your choice (1-5): ").strip()

        if choice == '1':
            ReportGenerator.student_report()
        elif choice == '2':
            ReportGenerator.course_report()
        elif choice == '3':
            ReportGenerator.all_students_summary()
        elif choice == '4':
            ReportGenerator.honor_roll()
        elif choice == '5':
            break
        else:
            print("Invalid choice.")
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    main_menu()
