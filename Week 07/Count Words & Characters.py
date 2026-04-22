text = "mang kasir aplikasi sederhana"

word_count = 0
char_count = 0

in_word = False  # to track if we are inside a word

for ch in text:
    if ch != " ":
        char_count = char_count + 1
        
        if in_word == False:
            word_count = word_count + 1
            in_word = True
    else:
        in_word = False

print("Words =", word_count)
print("Characters (no spaces) =", char_count)



for i in range(4):          # 4 rows
    for j in range(5):      # 5 columns
        if j == 2:
            print("0", end=" ")
        else:
            print("X", end=" ")
    print()

print()  # empty line

# Second part
for i in range(4):
    for j in range(5):
        if i == 1 or i == 2:
            if j == 1 or j == 2 or j == 3:
                print("0", end=" ")
            else:
                print("X", end=" ")
        else:
            if j == 2:
                print("0", end=" ")
            else:
                print("X", end=" ")
    print()
