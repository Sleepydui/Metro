import json
import csv

# Function to read a JSON file
def read_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

# Specify the JSON file path
file_path = '/Users/a123/Desktop/2023 全球地铁迭代/231220 全球地铁/Metro/public/data.json'  # Use your actual file path

# Read the JSON file
data = read_json(file_path)

# Collect all line names
line_names = []
for city in data:
    for line in city["地铁线路"]:
        line_names.append(line['线路'])

# Write the line names to a CSV file
csv_file_path = '/Users/a123/Desktop/2023 全球地铁迭代/231220 全球地铁/Metro/public/lines.csv'
with open(csv_file_path, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['线路名称'])  # Writing the header
    for name in line_names:
        writer.writerow([name])

print(f"线路名称已保存到 {csv_file_path}")
