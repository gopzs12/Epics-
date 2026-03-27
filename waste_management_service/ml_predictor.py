"""
ml_predictor.py
Hybrid ML Waste Prediction System.
Loads the trained Random Forest model and provides intelligent predictions.
"""
import os
import numpy as np

# Try to load ML libraries, gracefully degrade if not available
try:
    import joblib
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "waste_model.pkl")
_model = None


def _load_model():
    """Lazy-load the trained model."""
    global _model
    if _model is None and ML_AVAILABLE and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            print("✅ ML Model loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load ML model: {e}")
    return _model


def predict_waste(
    fabric_length: float,
    fabric_width: float,
    pattern_length: float,
    pattern_width: float,
    count: int
) -> dict:
    """
    Use the trained Random Forest to predict waste percentage.
    Returns prediction with confidence and insights.
    """
    model = _load_model()
    
    # Compute features exactly as training data was generated
    total_area = fabric_length * fabric_width
    pattern_area = pattern_length * pattern_width
    utilization_ratio = (pattern_area * count) / total_area if total_area > 0 else 0
    aspect_ratio_fabric = fabric_length / fabric_width if fabric_width > 0 else 1
    aspect_ratio_pattern = pattern_length / pattern_width if pattern_width > 0 else 1
    density = count / total_area if total_area > 0 else 0
    
    features = np.array([[
        total_area,
        pattern_area,
        count,
        utilization_ratio,
        aspect_ratio_fabric,
        aspect_ratio_pattern,
        density
    ]])
    
    if model is None:
        # Fallback: simple mathematical prediction if model not available
        used_area = pattern_area * count
        predicted = ((total_area - used_area) / total_area * 100) if total_area > 0 else 0
        return {
            "predicted_waste_percentage": round(max(0, min(100, predicted)), 2),
            "model_type": "fallback_mathematical",
            "confidence": "low",
            "model_loaded": False
        }
    
    # Get predictions from ALL trees for confidence estimation
    individual_predictions = np.array([tree.predict(features)[0] for tree in model.estimators_])
    
    mean_prediction = float(np.mean(individual_predictions))
    std_prediction = float(np.std(individual_predictions))
    
    # Confidence based on agreement between trees
    if std_prediction < 2.0:
        confidence = "high"
    elif std_prediction < 5.0:
        confidence = "medium"
    else:
        confidence = "low"
    
    return {
        "predicted_waste_percentage": round(max(0, min(100, mean_prediction)), 2),
        "prediction_std": round(std_prediction, 2),
        "confidence": confidence,
        "model_type": "random_forest",
        "n_estimators": len(model.estimators_),
        "model_loaded": True
    }


def generate_hybrid_analysis(
    actual_waste_percentage: float,
    predicted_waste_percentage: float,
    total_area: float,
    pattern_area: float,
    count: int
) -> dict:
    """
    The HYBRID INTELLIGENCE LAYER.
    Compares actual (rule-based) vs predicted (ML) and generates insights.
    """
    difference = round(abs(actual_waste_percentage - predicted_waste_percentage), 2)
    
    # ============================
    #  INTELLIGENT SUGGESTIONS
    # ============================
    
    insights = []
    suggestions = []
    risk_level = "low"
    
    # Model reliability check
    if difference < 3.0:
        insights.append("✅ ML prediction aligns closely with actual calculation — system is reliable.")
    elif difference < 8.0:
        insights.append("⚠️ ML prediction deviates slightly from actual — check input parameters.")
    else:
        insights.append("🔴 Significant deviation between prediction and actual — unusual fabric/pattern combination detected.")
    
    # Waste-level based suggestions
    avg_waste = (actual_waste_percentage + predicted_waste_percentage) / 2
    
    if avg_waste > 40:
        risk_level = "critical"
        suggestions.append("🚨 CRITICAL: Waste exceeds 40%! Immediately review pattern sizing and fabric roll selection.")
        suggestions.append("💡 Consider splitting the order across multiple fabric widths to improve utilization.")
        suggestions.append("📐 Try rotating pattern pieces 90° — different orientations can dramatically reduce scrap.")
    elif avg_waste > 25:
        risk_level = "high"
        suggestions.append("⚠️ HIGH WASTE: Consider optimizing your cutting layout before production.")
        suggestions.append("📐 Try adjusting pattern dimensions by ±5cm — small changes can significantly reduce scrap.")
        suggestions.append("🔄 Consider nesting smaller accessory patterns in the waste gaps.")
    elif avg_waste > 15:
        risk_level = "moderate"
        suggestions.append("📊 Moderate waste levels — within industry average (15-25%).")
        suggestions.append("💡 You could potentially save material by trying a wider fabric roll.")
    else:
        risk_level = "low"
        suggestions.append("🌟 Excellent efficiency! Your waste is below industry average.")
        suggestions.append("♻️ The small amount of scrap generated could be listed on the Marketplace for recycling.")
    
    # Utilization insight
    utilization = round((pattern_area * count) / total_area * 100, 1) if total_area > 0 else 0
    insights.append(f"📊 Fabric utilization: {utilization}% of total area is used for garments.")
    
    # Cost saving potential
    if avg_waste > 15:
        potential_saving_pct = round((avg_waste - 10) / avg_waste * 100, 1)
        insights.append(f"💰 Optimizing to industry-best (10% waste) could save up to {potential_saving_pct}% of your material costs.")
    
    return {
        "actual_waste": actual_waste_percentage,
        "predicted_waste": predicted_waste_percentage,
        "difference": difference,
        "risk_level": risk_level,
        "utilization_percentage": utilization,
        "insights": insights,
        "suggestions": suggestions,
        "system_verdict": f"{'🟢 System Reliable' if difference < 5 else '🟡 Review Recommended' if difference < 10 else '🔴 Manual Check Required'}"
    }
