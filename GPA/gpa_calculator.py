import pandas as pd


GRADE_MAP = [
    (85, 100, "A", 4.0),
    (80,  84, "A-", 3.7),
    (75,  79, "B+", 3.3),
    (70,  74, "B", 3.0),
    (65,  69, "B-", 2.7),
    (60,  64, "C+", 2.3),
    (55,  59, "C", 2.0),
    (40,  54, "D", 1.0),
    (0,   39, "E", 0.0),
]


def score_to_grade(score):
    for low, high, letter, point in GRADE_MAP:
        if low <= score <= high:
            return letter
    return "E"


def score_to_point(score):
    for low, high, letter, point in GRADE_MAP:
        if low <= score <= high:
            return point
    return 0.0


def main():
    FILE = "academic_data.xlsx"
    xl = pd.ExcelFile(FILE)
    print("Sheets found:", xl.sheet_names)

    df_subjects = pd.read_excel(FILE, sheet_name="Subjects")
    df_students = pd.read_excel(FILE, sheet_name="Students")
    df_scores = pd.read_excel(FILE, sheet_name="RawScores")

    print("\n=== SUBJECTS ===")
    print(df_subjects.to_string(index=False))

    print("\n=== STUDENTS ===")
    print(df_students.to_string(index=False))

    print("\n=== RAW SCORES (first 10 rows) ===")
    print(df_scores.head(10).to_string(index=False))

    df_merged = df_scores.merge(df_subjects, on="SubjectCode", how="left")
    df_merged = df_merged.merge(df_students, on="StudentID", how="left")

    df_merged["Grade"] = df_merged["Score"].apply(score_to_grade)
    df_merged["GradePoint"] = df_merged["Score"].apply(score_to_point)
    df_merged["QualityPoint"] = df_merged["GradePoint"] * df_merged["SKS"]

    print("\n=== MERGED DATA (first 10 rows) ===")
    cols = ["StudentID", "StudentName", "SubjectCode", "SubjectName",
            "Score", "Grade", "GradePoint", "SKS", "QualityPoint"]
    print(df_merged[cols].head(10).to_string(index=False))

    gpa = df_merged.groupby(["StudentID", "StudentName"]).apply(
        lambda g: g["QualityPoint"].sum() / g["SKS"].sum()
    ).reset_index(name="GPA")

    gpa["GPA"] = gpa["GPA"].round(2)

    print("\n=== STUDENT GPA (IPK) ===")
    for _, row in gpa.iterrows():
        print(f"  {row['StudentID']} - {row['StudentName']}: {row['GPA']:.2f}")

    avg_gpa = gpa["GPA"].mean()
    print(f"\n=== CLASS AVERAGE GPA: {avg_gpa:.2f} ===")

    with pd.ExcelWriter(FILE, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
        gpa.to_excel(writer, sheet_name="GPA_Report", index=False)

    print("\nGPA_Report sheet saved to 'academic_data.xlsx'.")


if __name__ == "__main__":
    main()
