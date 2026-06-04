"""You often watch TV series and want to know how many hours and minutes you spend watching multiple episodes in one sitting.
Function Specifications:
Create a function called convert_minutes with 2 parameters: numberofepisodes and durationperepisode (in minutes).
Calculate the total viewing time in minutes, then convert it into hours and remaining minutes.
Required: The function must return two values at once (using a tuple): hours and remaining minutes."""

def convert_minutes(number_of_episodes, duration_per_episode):
    total_minutes = number_of_episodes * duration_per_episode
    hours = total_minutes // 60
    remaining_minutes = total_minutes % 60
    return hours, remaining_minutes
number_of_episodes = int(input("Enter the number of episodes: "))
duration_per_episode = int(input("Enter the duration of each episode in minutes: "))
hours, remaining_minutes = convert_minutes(number_of_episodes, duration_per_episode)
print(f"Total viewing time: {hours} hours and {remaining_minutes} minutes.")
