
word = input("Enter a word: ").lower()
reversed_word = ""

for i in range(len(word) - 1, -1, -1):
    reversed_word += word[i]

if word == reversed_word:
    print(word, "is a palindrome")
else:
    print(word, "is not a palindrome")
