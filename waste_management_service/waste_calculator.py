def calculate_waste(fabric_length: float, fabric_width: float, pattern_length: float, pattern_width: float, count: int, cost_per_meter: float):
    """
    Calculates garment fabric waste metrics.
    All length and width arguments should be in the same unit (e.g. meters).
    """
    total_area = fabric_length * fabric_width
    pattern_area = pattern_length * pattern_width
    used_area = pattern_area * count
    
    if total_area <= 0:
        raise ValueError("Total fabric area must be greater than zero.")
        
    if used_area > total_area:
        raise ValueError(f"Insufficient fabric! Required area ({used_area}) exceeds total area ({total_area}).")
        
    waste_area = total_area - used_area
    waste_percentage = (waste_area / total_area) * 100
    
    # Cost loss estimation calculation.
    # Total cost for the physical length of fabric
    total_cost = fabric_length * cost_per_meter
    # Direct proportion of the area lost
    waste_cost = (waste_percentage / 100) * total_cost
    
    # Estimate if extra garments can be squeezed in
    extra_garments = int(waste_area // pattern_area) if pattern_area > 0 else 0
    
    return {
        "total_area": round(total_area, 4),
        "used_area": round(used_area, 4),
        "waste_area": round(waste_area, 4),
        "waste_percentage": round(waste_percentage, 2),
        "waste_cost": round(waste_cost, 2),
        "extra_garments": extra_garments,
        "total_cost": round(total_cost, 2)
    }
