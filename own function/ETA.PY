"""A ride-hailing application needs a system to estimate arrival time based on distance and weather conditions.
Function Specifications:
Create a function called estimate_arrival with 2 parameters: distance_km and weather_condition.
By default, each kilometer takes 3 minutes of travel time.
However, if weather_condition is "rainy", add 10 extra minutes to the total travel time (because the driver travels more slowly).
Required: Return the total estimated travel time in minutes. """

def estimate_arrival(distance_km, weather_condition):
    travel_time = distance_km * 3
    if weather_condition.lower() == "rainy":
        travel_time += 10
    return travel_time
distance_km = float(input("Enter the distance in kilometers: "))
weather_condition = input("Enter the weather condition (e.g., sunny, rainy): ")
estimated_time = estimate_arrival(distance_km, weather_condition)
print("The estimated arrival time is:", estimated_time, "minutes.")
