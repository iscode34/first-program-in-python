"""You are building a Twitter/X clone that limits user posts to a maximum of 140 characters.
Function Specifications:

Create a function called validate_tweet with 1 parameter: input_text.
The function checks the length of the text:
If the length is 140 characters or less, return the original text.
If it exceeds 140 characters, truncate it at the 140th character and append "..." to the end.
Required: Return the validated string.
"""
def validate_tweet(input_text):
    if len(input_text) <= 140:
        return input_text
    else:
        return input_text[:140] + "..."
input_text = input("Enter your tweet: ")
validated_tweet = validate_tweet(input_text)
print("Validated tweet:", validated_tweet)
