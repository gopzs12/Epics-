def generate_suggestions(waste_percentage: float, extra_garments: int, eco_score: float = None) -> list:
    """
    Generates rule-based suggestions depending on the waste values and eco score.
    """
    suggestions = []
    
    if waste_percentage > 15:
        suggestions.append("⚠️ Waste is quite high (>15%). Please review and optimize your pattern layout/markers before cutting.")
    else:
        suggestions.append("✅ Great job! Waste is kept within reasonable limits (<15%).")
        
    if extra_garments >= 1:
        suggestions.append(f"💡 You have enough leftover to create {extra_garments} extra full garment(s)!")
    elif waste_percentage > 5:
        suggestions.append("♻️ Consider using the leftover scraps for smaller items like pockets, face masks, or internal padding.")
        
    if eco_score is not None:
        if eco_score >= 90:
            suggestions.append("🌱 Outstanding Eco impact! Your waste management aligns with top sustainability standards.")
        elif eco_score < 70:
            suggestions.append("⚠️ Poor Eco Score. We strongly suggest partnering with a textile recycling center or revisiting the marker arrangement.")
        
    return suggestions
