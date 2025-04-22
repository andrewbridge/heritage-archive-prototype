import os
import yaml
import json

def parse_yaml_files(data_dir):
    """Parse all YAML files in the data directory."""
    yaml_data = []
    for filename in os.listdir(data_dir):
        if filename.endswith('.yml') or filename.endswith('.yaml'):
            file_path = os.path.join(data_dir, filename)
            with open(file_path, 'r') as file:
                try:
                    content = yaml.safe_load(file)
                    # Extract ID from the filename (e.g., A0001.yml)
                    file_id = os.path.splitext(filename)[0]
                    # Add ID to content if not already present
                    if 'id' not in content:
                        content['id'] = file_id
                    yaml_data.append(content)
                except yaml.YAMLError as e:
                    print(f"Error parsing {filename}: {e}")
    return yaml_data

def normalize_json(data):
    """Normalize JSON objects by filling in missing fields with defaults."""
    # Define default values for fields that might be missing
    defaults = {
        "keywords": []
    }

    normalized_data = []
    for item in data:
        # Apply defaults for missing fields
        for key, default_value in defaults.items():
            if key not in item:
                item[key] = default_value

        normalized_data.append(item)

    return normalized_data

def generate_json_files(data, output_dir):
    """Generate individual JSON files and a combined data.json file."""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Write combined data.json
    with open(os.path.join(output_dir, "data.json"), 'w') as f:
        json.dump(data, f, indent=2)

    # Write individual JSON files
    for item in data:
        file_id = item.get('id')
        if file_id:
            with open(os.path.join(output_dir, f"{file_id}.json"), 'w') as f:
                json.dump(item, f, indent=2)

def main():
    data_dir = "data"
    output_dir = "json_output"

    # Process pipeline
    yaml_data = parse_yaml_files(data_dir)
    normalized_data = normalize_json(yaml_data)
    generate_json_files(normalized_data, output_dir)
    print(f"Processed {len(normalized_data)} YAML files into JSON")

if __name__ == "__main__":
    main()
