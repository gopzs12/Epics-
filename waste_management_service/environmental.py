def calculate_environmental_impact(waste_area: float, waste_percentage: float):
    """
    Calculates the environmental cost based on fabric layout waste.
    Uses industry-standard textile waste emission factors.
    """
    # Assumptions for the prototype
    KG_PER_SQ_METER = 0.300  # 300 GSM fabric weight
    CO2_PER_KG = 15.0        # ~15kg CO2 per 1kg textile waste
    TREE_CO2_ABSORPTION = 22  # One tree absorbs ~22kg CO2/year
    
    # Core calculations
    waste_kg = waste_area * KG_PER_SQ_METER
    co2_emissions_kg = waste_kg * CO2_PER_KG
    trees_to_offset = max(1, round(co2_emissions_kg / TREE_CO2_ABSORPTION))
    
    # Eco Score: inversely proportional to waste percentage
    eco_score = max(0, round(100 - waste_percentage, 1))
    
    # Rating Classification
    if eco_score >= 90:
        rating = "Excellent"
    elif eco_score >= 70:
        rating = "Good"
    elif eco_score >= 50:
        rating = "Moderate"
    else:
        rating = "Poor"
        
    return {
        "waste_kg_est": round(waste_kg, 2),
        "co2_emissions_kg": round(co2_emissions_kg, 2),
        "eco_score": eco_score,
        "eco_rating": rating,
        "trees_to_offset": trees_to_offset
    }
