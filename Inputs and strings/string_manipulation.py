#1 Username Length Check
username = input("Enter username: ")

if len(username) < 5:
    print("Username too short")
else:
    print("Username accepted")
    
#2 First Name Extractor
full_name = input("Enter your full name: ")

name_parts = full_name.split()

print(name_parts[0])


#3 Word Capitalizer

word = input("Enter a word: ")

result = word.capitalize()

print(result)


#4 Check Starting Letter
word = input("Enter a word: ")

if word.startswith("A") or word.startswith("a"):
    print("Starts with A")
else:
    print("Does not start with A")



#5 Replace Space with Underscore

sentence = input("Enter a sentence: ")

result = sentence.replace(" ", "_")

print(result)
