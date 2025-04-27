import json
import yaml
import sys
from pathlib import Path

#!/usr/bin/env python3

def convert_json_to_yaml_files(json_file_path):
    # Create data directory if it doesn't exist
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    
    # Load JSON data
    try:
        with open(json_file_path, 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"Error: File '{json_file_path}' not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: '{json_file_path}' is not a valid JSON file.")
        sys.exit(1)
    
    # Check if data is a list
    if not isinstance(data, list):
        print("Error: JSON file must contain an array of objects.")
        sys.exit(1)
    
    # Process each object in the array
    for item in data:
        # Check if item is a dictionary and has an 'id' property
        if not isinstance(item, dict):
            print("Warning: Skipping non-object item in the array.")
            continue
        
        if 'id' not in item:
            print("Warning: Skipping object without 'id' property.")
            continue
        
        # Create YAML file with id as filename
        yaml_file_path = data_dir / f"{item['id']}.yaml"
        
        try:
            with open(yaml_file_path, 'w') as file:
                yaml.dump(item, file, default_flow_style=False, sort_keys=False)
            print(f"Created {yaml_file_path}")
        except Exception as e:
            print(f"Error creating YAML file for id {item['id']}: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_to_yaml.py <json_file_path>")
        sys.exit(1)
    
    json_file_path = sys.argv[1]
    convert_json_to_yaml_files(json_file_path)
    print("Conversion completed.")