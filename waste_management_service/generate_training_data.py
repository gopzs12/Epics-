"""
generate_training_data.py
Generates realistic synthetic waste data for the garment industry.
This simulates diverse factory scenarios to train the Random Forest model.
"""
import csv
import random
import os

def generate_waste_data(num_samples=2000):
    """Generate realistic garment cutting waste data for ML training."""
    
    data = []
    
    # Simulate diverse factory scenarios
    for _ in range(num_samples):
        # Random fabric roll dimensions (realistic ranges)
        fabric_length = round(random.uniform(5, 200), 2)   # 5m to 200m rolls
        fabric_width = round(random.uniform(1.0, 3.0), 2)  # 1m to 3m wide
        
        # Random pattern piece dimensions
        pattern_length = round(random.uniform(0.3, 2.5), 2)  # 30cm to 2.5m
        pattern_width = round(random.uniform(0.2, 1.8), 2)   # 20cm to 1.8m
        
        # Ensure pattern fits within fabric width
        pattern_width = min(pattern_width, fabric_width - 0.05)
        pattern_length = min(pattern_length, fabric_length - 0.05)
        
        total_area = fabric_length * fabric_width
        pattern_area = pattern_length * pattern_width
        
        # Calculate how many fit (both orientations)
        cols_normal = int(fabric_width // pattern_width)
        rows_normal = int(fabric_length // pattern_length)
        max_normal = cols_normal * rows_normal
        
        cols_rotated = int(fabric_width // pattern_length)
        rows_rotated = int(fabric_length // pattern_width)
        max_rotated = cols_rotated * rows_rotated
        
        max_items = max(max_normal, max_rotated)
        
        if max_items == 0:
            continue
            
        # Target count: sometimes less than max (real world orders)
        count = random.randint(max(1, int(max_items * 0.3)), max_items)
        
        used_area = pattern_area * count
        waste_area = total_area - used_area
        
        if waste_area < 0:
            continue
            
        waste_percentage = round((waste_area / total_area) * 100, 2)
        
        # Clamp to realistic range
        if waste_percentage > 80 or waste_percentage < 1:
            continue
        
        # Feature engineering
        utilization_ratio = round((pattern_area * count) / total_area, 4)
        aspect_ratio_fabric = round(fabric_length / fabric_width, 4)
        aspect_ratio_pattern = round(pattern_length / pattern_width, 4)
        density = round(count / total_area, 4)
        
        # Add some realistic noise (+/- 2%) to simulate measurement imprecision
        noise_factor = random.uniform(-2.0, 2.0)
        noisy_waste = round(max(0.5, min(80, waste_percentage + noise_factor)), 2)
        
        data.append({
            "total_area": round(total_area, 4),
            "pattern_area": round(pattern_area, 4),
            "num_items": count,
            "utilization_ratio": utilization_ratio,
            "aspect_ratio_fabric": aspect_ratio_fabric,
            "aspect_ratio_pattern": aspect_ratio_pattern,
            "density": density,
            "fabric_length": fabric_length,
            "fabric_width": fabric_width,
            "pattern_length": pattern_length,
            "pattern_width": pattern_width,
            "waste_percentage": noisy_waste
        })
    
    return data


def save_to_csv(data, filename="waste_data.csv"):
    """Save generated data to CSV."""
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    if not data:
        print("No data to save!")
        return
        
    fieldnames = data[0].keys()
    
    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"✅ Generated {len(data)} samples → saved to {filepath}")


if __name__ == "__main__":
    print("🏭 Generating synthetic garment waste training data...")
    data = generate_waste_data(2000)
    save_to_csv(data)
    print("🎯 Data generation complete!")
