import re
data = open('science.ts', encoding='utf-8').read()
lessons = re.findall(r'^\s+L\(', data, re.MULTILINE)
print(f'Lesson count: {len(lessons)}')
# Check it starts right
print(f'Starts with: {data[:80]}')
# Check it ends right
print(f'Ends with: {data[-20:]}')
