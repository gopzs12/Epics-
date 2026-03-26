def calculate_environmental_impact(waste_area: float, waste_percentage: float):
    """
    Calculates the environmental cost based on fabric layout waste.
    """
    # Assumptions for the prototype
    KG_PER_SQ_METER = 0.300 # Assuming 300 GSM fabric
    CO2_PER_KG = 15.0 # ~15kg CO2 emissions per 1kg of textile waste produced
    
    # Core calculations
    waste_kg = waste_area * KG_PER_SQ_METER
    co2_emissions_kg = waste_kg * CO2_PER_KG
    
    # Eco Score
    # Score is inversely proportional to waste percentage. 0% waste = 100 score.
    eco_score = max(0, 100 - waste_percentage)
    
    # Rating Classification
    if eco_score >= 90:
        rating = "Excellent"
    elif eco_score >= 70:
        rating = "Moderate"
    else:
        rating = "Poor"
        
    return {
        "waste_kg_est": round(waste_kg, 2),
        "co2_emissions_kg": round(co2_emissions_kg, 2),
        "eco_score": round(eco_score, 1),
        "eco_rating": rating
    }
