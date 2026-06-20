import re
data = open(r'C:\Users\zconsumers\Desktop\EduVerse Final\backend\curriculum\gen_science3.py', encoding='utf-8').read()
trip_single = data.count("'''")
trip_double = data.count('"""')
print(f"triple single quotes: {trip_single}")
print(f"triple double quotes: {trip_double}")
