"""Count triple-quote occurrences in a file to catch unbalanced ''' / \"\"\" pairs.

Usage: python check_quotes.py <path-to-file>
"""

import sys

path = sys.argv[1] if len(sys.argv) > 1 else "gen_science3.py"
data = open(path, encoding="utf-8").read()
trip_single = data.count("'''")
trip_double = data.count('"""')
print(f"{path}: triple single quotes: {trip_single}")
print(f"{path}: triple double quotes: {trip_double}")
