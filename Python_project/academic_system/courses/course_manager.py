import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
COURSES_FILE = os.path.join(DATA_DIR, 'courses.txt')


def load_courses():
    courses = {}
    if not os.path.exists(COURSES_FILE):
        return courses
    try:
        with open(COURSES_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    parts = line.split('|')
                    if len(parts) >= 3:
                        cid, name, credits = parts[0], parts[1], parts[2]
                        courses[cid] = {'name': name, 'credits': credits}
    except IOError as e:
        print(f"Error reading courses file: {e}")
    return courses


def save_courses(courses):
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(COURSES_FILE, 'w') as f:
            for cid, info in courses.items():
                f.write(f"{cid}|{info['name']}|{info['credits']}\n")
    except IOError as e:
        print(f"Error writing courses file: {e}")


def add_course():
    print("\n--- Add New Course ---")
    courses = load_courses()

    cid = input("Enter Course ID: ").strip().upper()
    if not cid:
        print("Course ID cannot be empty.")
        return
    if cid in courses:
        print(f"Course ID '{cid}' already exists.")
        return

    name = input("Enter Course Name: ").strip()
    if not name:
        print("Course name cannot be empty.")
        return

    while True:
        try:
            credits = int(input("Enter Credits: ").strip())
            if credits <= 0:
                print("Credits must be a positive number.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a number.")

    courses[cid] = {'name': name, 'credits': str(credits)}
    save_courses(courses)
    print(f"Course '{name}' added successfully!")


def view_course():
    print("\n--- View Course ---")
    cid = input("Enter Course ID: ").strip().upper()
    courses = load_courses()
    if cid in courses:
        info = courses[cid]
        print(f"\nCourse ID:   {cid}")
        print(f"Name:        {info['name']}")
        print(f"Credits:     {info['credits']}")
    else:
        print(f"Course with ID '{cid}' not found.")


def update_course():
    print("\n--- Update Course ---")
    cid = input("Enter Course ID to update: ").strip().upper()
    courses = load_courses()
    if cid not in courses:
        print(f"Course with ID '{cid}' not found.")
        return

    info = courses[cid]
    print(f"\nCurrent Name: {info['name']}")
    new_name = input("Enter new name (or press Enter to keep current): ").strip()
    if new_name:
        info['name'] = new_name

    print(f"Current Credits: {info['credits']}")
    new_credits = input("Enter new credits (or press Enter to keep current): ").strip()
    if new_credits:
        try:
            if int(new_credits) > 0:
                info['credits'] = new_credits
        except ValueError:
            print("Invalid credits value. Keeping current.")

    courses[cid] = info
    save_courses(courses)
    print(f"Course '{cid}' updated successfully!")


def delete_course():
    print("\n--- Delete Course ---")
    cid = input("Enter Course ID to delete: ").strip().upper()
    courses = load_courses()
    if cid not in courses:
        print(f"Course with ID '{cid}' not found.")
        return

    confirm = input(f"Are you sure you want to delete course '{courses[cid]['name']}'? (y/n): ").strip().lower()
    if confirm == 'y':
        del courses[cid]
        save_courses(courses)
        print(f"Course '{cid}' deleted successfully!")
    else:
        print("Deletion cancelled.")


def list_courses():
    print("\n--- All Courses ---")
    courses = load_courses()
    if not courses:
        print("No courses found.")
        return

    print(f"{'ID':<10} {'Name':<40} {'Credits':<10}")
    print("-" * 60)
    for cid, info in sorted(courses.items()):
        print(f"{cid:<10} {info['name']:<40} {info['credits']:<10}")
    print(f"\nTotal courses: {len(courses)}")


class CourseManager:
    @staticmethod
    def get_course_name(cid):
        courses = load_courses()
        if cid in courses:
            return courses[cid]['name']
        return None

    @staticmethod
    def get_course_credits(cid):
        courses = load_courses()
        if cid in courses:
            try:
                return int(courses[cid]['credits'])
            except ValueError:
                return 0
        return 0
