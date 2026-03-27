"""
generate_cost_data.py
Generates realistic synthetic costing data for garment manufacturing.
Simulates diverse order scenarios with hidden cost factors.
"""
import csv
import random
import os
import math

def generate_cost_data(num_samples=2500):
    """Generate realistic garment costing data with hidden cost factors for ML training."""
    
    data = []
    
    for _ in range(num_samples):
        # ============================
        #  VISIBLE INPUTS (what user enters)
        # ============================
        primary_fabric = round(random.uniform(20, 350), 2)      # ₹20-350 per piece
        secondary_fabric = round(random.uniform(0, 120), 2)      # ₹0-120 (linings, etc.)
        cmt = round(random.uniform(15, 180), 2)                  # ₹15-180 assembly
        embellishments = round(random.uniform(0, 80), 2)          # ₹0-80 (buttons, prints)
        trims = round(random.uniform(5, 60), 2)                   # ₹5-60 (labels, tags)
        compliance = round(random.uniform(2, 40), 2)               # ₹2-40 (testing)
        quantity = random.randint(50, 10000)                       # 50-10000 units
        rejection_factor = round(random.uniform(1.0, 1.15), 3)    # 0-15% rejection
        markup_pct = round(random.uniform(5, 45), 1)               # 5-45% markup
        
        # ============================
        #  FORMULA-BASED COST (ground truth)
        # ============================
        base_cost = primary_fabric + secondary_fabric + cmt + embellishments + trims + compliance
        adjusted = base_cost * rejection_factor
        per_piece = adjusted * (1 + markup_pct / 100)
        formula_total = per_piece * quantity
        
        # ============================
        #  HIDDEN COST FACTORS (what ML learns)
        # ============================
        # In real world, actual cost is NEVER exactly formula cost
        # These simulate real-world inefficiencies:
        
        # 1. Waste overhead (2-12% extra cost from cutting waste)
        waste_overhead = base_cost * random.uniform(0.02, 0.12)
        
        # 2. Defect rework cost (0-8% of CMT, depends on complexity)
        defect_rework = cmt * random.uniform(0, 0.08)
        
        # 3. Machine downtime cost (more for high quantities)
        downtime_factor = math.log(quantity + 1) * random.uniform(0.1, 0.5)
        
        # 4. Material price volatility (±3% fluctuation)
        volatility = (primary_fabric + secondary_fabric) * random.uniform(-0.03, 0.03)
        
        # 5. Bulk discount for large orders (saves 2-8%)
        bulk_discount = -base_cost * min(0.08, quantity / 100000)
        
        # 6. Complexity tax (more embellishments = more hidden costs)
        complexity = embellishments * random.uniform(0.05, 0.15)
        
        # Actual per-piece cost with hidden factors
        actual_per_piece = per_piece + waste_overhead + defect_rework + downtime_factor + volatility + bulk_discount + complexity
        actual_total = actual_per_piece * quantity
        
        # Ensure positive
        if actual_per_piece < 10 or actual_total < 0:
            continue
        
        # ============================
        #  FEATURE ENGINEERING
        # ============================
        material_ratio = round((primary_fabric + secondary_fabric) / base_cost, 4) if base_cost > 0 else 0
        labor_intensity = round(cmt / base_cost, 4) if base_cost > 0 else 0
        embellishment_complexity = round(embellishments / base_cost, 4) if base_cost > 0 else 0
        order_scale = round(math.log(quantity + 1), 4)
        
        data.append({
            "primary_fabric": primary_fabric,
            "secondary_fabric": secondary_fabric,
            "cmt": cmt,
            "embellishments": embellishments,
            "trims": trims,
            "compliance": compliance,
            "quantity": quantity,
            "rejection_factor": rejection_factor,
            "markup_pct": markup_pct,
            "base_cost": round(base_cost, 2),
            "material_ratio": material_ratio,
            "labor_intensity": labor_intensity,
            "embellishment_complexity": embellishment_complexity,
            "order_scale": order_scale,
            "formula_per_piece": round(per_piece, 2),
            "actual_per_piece": round(actual_per_piece, 2),
            "formula_total": round(formula_total, 2),
            "actual_total": round(actual_total, 2),
        })
    
    return data


def save_to_csv(data, filename="cost_data.csv"):
    filepath = os.path.join(os.path.dirname(__file__), filename)
    if not data:
        print("No data!")
        return
    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"✅ Generated {len(data)} costing samples → {filepath}")


if __name__ == "__main__":
    print("🏭 Generating synthetic garment costing training data...")
    data = generate_cost_data(2500)
    save_to_csv(data)
    print("🎯 Done!")
