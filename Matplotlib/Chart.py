import matplotlib.pyplot as plt

# ----------------------------
# USER INPUT
# ----------------------------
print("=" * 40)
print("     QUIZ SCORE INFOGRAPHIC")
print("=" * 40)

n = int(input("Enter number of participants: "))

scores = []

for i in range(n):
    while True:
        try:
            score = float(input(f"Score of participant {i+1}: "))
            if 0 <= score <= 100:
                scores.append(score)
                break
            else:
                print("Score must be between 0 and 100!")
        except:
            print("Invalid input!")

# ----------------------------
# GROUPING
# ----------------------------
labels = ["0-50", "50-70", "70-80", "80-90", ">90"]

counts = [0, 0, 0, 0, 0]

for s in scores:
    if s <= 50:
        counts[0] += 1
    elif s <= 70:
        counts[1] += 1
    elif s <= 80:
        counts[2] += 1
    elif s <= 90:
        counts[3] += 1
    else:
        counts[4] += 1

colors = [
    "#e74c3c",
    "#f39c12",
    "#3498db",
    "#2ecc71",
    "#9b59b6"
]

# ----------------------------
# STATISTICS
# ----------------------------
total = len(scores)
average = sum(scores) / total
highest = max(scores)
lowest = min(scores)

# ----------------------------
# FIGURE
# ----------------------------
fig = plt.figure(figsize=(14,7))
fig.patch.set_facecolor("#efefef")

plt.suptitle(
    "Programming Quiz Score Infographic",
    fontsize=22,
    fontweight="bold"
)

# ----------------------------
# BAR CHART
# ----------------------------
ax1 = plt.subplot(1,2,1)

bars = ax1.bar(labels, counts, color=colors, width=0.65)

ax1.set_title("Participants per Score Group", fontsize=16, fontweight="bold")
ax1.set_xlabel("Score Group")
ax1.set_ylabel("Number of Participants")

ax1.grid(axis='y', linestyle='--', alpha=0.4)

for bar in bars:
    h = bar.get_height()
    ax1.text(
        bar.get_x()+bar.get_width()/2,
        h+0.15,
        str(int(h)),
        ha='center',
        fontsize=14,
        fontweight='bold'
    )

# ----------------------------
# PIE CHART
# ----------------------------
ax2 = plt.subplot(1,2,2)

explode = [0.05]*5

ax2.pie(
    counts,
    labels=labels,
    autopct="%1.1f%%",
    colors=colors,
    explode=explode,
    startangle=90,
    textprops={'fontsize':12},
    shadow=True
)

ax2.set_title("Percentage per Score Group",
              fontsize=16,
              fontweight="bold")

# ----------------------------
# FOOTER
# ----------------------------
plt.figtext(
    0.5,
    0.03,
    f"Total Participants: {total}   |   Average: {average:.2f}   |   Highest: {highest:.1f}   |   Lowest: {lowest:.1f}",
    ha="center",
    fontsize=13,
    color="dimgray"
)

plt.tight_layout(rect=[0,0.06,1,0.92])

plt.savefig("quiz_infographic.png", dpi=300)
plt.show()

print("\nInfographic saved as 'quiz_infographic.png'")
