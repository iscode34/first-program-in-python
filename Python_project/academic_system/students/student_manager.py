import os
from .validation import validate_student_id, validate_email, validate_phone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
STUDENTS_FILE = os.path.join(DATA_DIR, 'students.txt')


def load_students():
    students = {}
    if not os.path.exists(STUDENTS_FILE):
        return students
    try:
        with open(STUDENTS_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    parts = line.split('|')
                    if len(parts) >= 4:
                        sid, name, email, phone = parts[0], parts[1], parts[2], parts[3]
                        students[sid] = {'name': name, 'email': email, 'phone': phone}
    except IOError as e:
        print(f"Error reading students file: {e}")
    return students


def save_students(students):
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(STUDENTS_FILE, 'w') as f:
            for sid, info in students.items():
                f.write(f"{sid}|{info['name']}|{info['email']}|{info['phone']}\n")
    except IOError as e:
        print(f"Error writing students file: {e}")


def add_student():
    print("\n--- Add New Student ---")
    students = load_students()

    while True:
        sid = input("Enter Student ID (ST####): ").strip().upper()
        valid, msg = validate_student_id(sid)
        if not valid:
            print(msg)
            continue
        if sid in students:
            print(f"Student ID '{sid}' already exists.")
            continue
        break

    name = input("Enter Student Name: ").strip()
    if not name:
        print("Name cannot be empty.")
        return

    while True:
        email = input("Enter Email: ").strip()
        valid, msg = validate_email(email)
        if valid:
            break
        print(msg)

    while True:
        phone = input("Enter Phone: ").strip()
        valid, msg = validate_phone(phone)
        if valid:
            break
        print(msg)

    students[sid] = {'name': name, 'email': email, 'phone': phone}
    save_students(students)
    print(f"Student '{name}' added successfully!")


def view_student():
    print("\n--- View Student ---")
    sid = input("Enter Student ID: ").strip().upper()
    students = load_students()
    if sid in students:
        info = students[sid]
        print(f"\nStudent ID: {sid}")
        print(f"Name:       {info['name']}")
        print(f"Email:      {info['email']}")
        print(f"Phone:      {info['phone']}")
    else:
        print(f"Student with ID '{sid}' not found.")


def update_student():
    print("\n--- Update Student ---")
    sid = input("Enter Student ID to update: ").strip().upper()
    students = load_students()
    if sid not in students:
        print(f"Student with ID '{sid}' not found.")
        return

    info = students[sid]
    print(f"\nCurrent Name: {info['name']}")
    new_name = input("Enter new name (or press Enter to keep current): ").strip()
    if new_name:
        info['name'] = new_name

    print(f"Current Email: {info['email']}")
    while True:
        new_email = input("Enter new email (or press Enter to keep current): ").strip()
        if not new_email:
            break
        valid, msg = validate_email(new_email)
        if valid:
            info['email'] = new_email
            break
        print(msg)

    print(f"Current Phone: {info['phone']}")
    while True:
        new_phone = input("Enter new phone (or press Enter to keep current): ").strip()
        if not new_phone:
            break
        valid, msg = validate_phone(new_phone)
        if valid:
            info['phone'] = new_phone
            break
        print(msg)

    students[sid] = info
    save_students(students)
    print(f"Student '{sid}' updated successfully!")


def delete_student():
    print("\n--- Delete Student ---")
    sid = input("Enter Student ID to delete: ").strip().upper()
    students = load_students()
    if sid not in students:
        print(f"Student with ID '{sid}' not found.")
        return

    confirm = input(f"Are you sure you want to delete student '{students[sid]['name']}'? (y/n): ").strip().lower()
    if confirm == 'y':
        del students[sid]
        save_students(students)
        print(f"Student '{sid}' deleted successfully!")
    else:
        print("Deletion cancelled.")


def list_students():
    print("\n--- All Students ---")
    students = load_students()
    if not students:
        print("No students found.")
        return

    print(f"{'ID':<10} {'Name':<25} {'Email':<30} {'Phone':<15}")
    print("-" * 80)
    for sid, info in sorted(students.items()):
        print(f"{sid:<10} {info['name']:<25} {info['email']:<30} {info['phone']:<15}")
    print(f"\nTotal students: {len(students)}")


class StudentManager:
    @staticmethod
    def get_student_name(sid):
        students = load_students()
        if sid in students:
            return students[sid]['name']
        return None
