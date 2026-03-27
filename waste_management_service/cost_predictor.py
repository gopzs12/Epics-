"""
cost_predictor.py
Hybrid ML Costing System.
Combines industry formula (ground truth) with Random Forest predictions.
"""
import os
import math
import numpy as np

try:
    import joblib
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "cost_model.pkl")
_cost_model = None


def _load_cost_model():
    """Lazy-load the trained cost model."""
    global _cost_model
    if _cost_model is None and ML_AVAILABLE and os.path.exists(MODEL_PATH):
        try:
            _cost_model = joblib.load(MODEL_PATH)
            print("✅ Cost ML Model loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load cost model: {e}")
    return _cost_model


def predict_cost(
    primary_fabric: float,
    secondary_fabric: float,
    cmt: float,
    embellishments: float,
    trims: float,
    compliance: float,
    quantity: int,
    rejection_factor: float,
    markup_pct: float
) -> dict:
    """
    Use the trained Random Forest to predict the ACTUAL per-piece cost.
    This accounts for hidden cost factors the formula misses.
    """
    model = _load_cost_model()
    
    # Compute derived features (same as training)
    base_cost = primary_fabric + secondary_fabric + cmt + embellishments + trims + compliance
    material_ratio = (primary_fabric + secondary_fabric) / base_cost if base_cost > 0 else 0
    labor_intensity = cmt / base_cost if base_cost > 0 else 0
    embellishment_complexity = embellishments / base_cost if base_cost > 0 else 0
    order_scale = math.log(quantity + 1)
    
    features = np.array([[
        primary_fabric,
        secondary_fabric,
        cmt,
        embellishments,
        trims,
        compliance,
        quantity,
        rejection_factor,
        markup_pct,
        base_cost,
        material_ratio,
        labor_intensity,
        embellishment_complexity,
        order_scale,
    ]])
    
    if model is None:
        # Fallback: return formula cost with estimated hidden overhead
        formula_per_piece = base_cost * rejection_factor * (1 + markup_pct / 100)
        overhead_estimate = base_cost * 0.06  # ~6% average hidden overhead
        return {
            "predicted_per_piece": round(formula_per_piece + overhead_estimate, 2),
            "predicted_total": round((formula_per_piece + overhead_estimate) * quantity, 2),
            "model_type": "fallback_estimate",
            "confidence": "low",
            "model_loaded": False
        }
    
    # Get predictions from all trees for confidence
    individual_preds = np.array([tree.predict(features)[0] for tree in model.estimators_])
    
    mean_pred = float(np.mean(individual_preds))
    std_pred = float(np.std(individual_preds))
    
    # Confidence based on tree agreement
    relative_std = (std_pred / mean_pred * 100) if mean_pred > 0 else 100
    if relative_std < 3:
        confidence = "high"
    elif relative_std < 8:
        confidence = "medium"
    else:
        confidence = "low"
    
    predicted_total = mean_pred * quantity
    
    return {
        "predicted_per_piece": round(max(0, mean_pred), 2),
        "predicted_total": round(max(0, predicted_total), 2),
        "prediction_std": round(std_pred, 2),
        "confidence": confidence,
        "model_type": "random_forest",
        "n_estimators": len(model.estimators_),
        "model_loaded": True
    }


def generate_cost_hybrid_analysis(
    formula_per_piece: float,
    formula_total: float,
    predicted_per_piece: float,
    predicted_total: float,
    primary_fabric: float,
    secondary_fabric: float,
    cmt: float,
    embellishments: float,
    trims: float,
    compliance: float,
    quantity: int,
    rejection_factor: float,
    markup_pct: float
) -> dict:
    """
    HYBRID INTELLIGENCE LAYER FOR COSTING.
    Compares formula vs ML prediction and generates actionable business insights.
    """
    base_cost = primary_fabric + secondary_fabric + cmt + embellishments + trims + compliance
    difference_per_piece = round(predicted_per_piece - formula_per_piece, 2)
    difference_total = round(predicted_total - formula_total, 2)
    difference_pct = round((difference_per_piece / formula_per_piece * 100), 1) if formula_per_piece > 0 else 0
    
    # ============================
    #  COST RISK ASSESSMENT
    # ============================
    if abs(difference_pct) < 3:
        cost_risk = "optimal"
    elif difference_pct > 0 and difference_pct < 8:
        cost_risk = "slight_overrun"
    elif difference_pct >= 8:
        cost_risk = "overrun"
    elif difference_pct < 0 and difference_pct > -5:
        cost_risk = "savings_possible"
    else:
        cost_risk = "review_needed"
    
    # ============================
    #  INTELLIGENT INSIGHTS
    # ============================
    insights = []
    suggestions = []
    
    # Difference analysis
    if difference_per_piece > 0:
        insights.append(f"💰 ML predicts actual cost is ₹{abs(difference_per_piece):.2f}/piece HIGHER than formula — hidden factors detected.")
        insights.append(f"📊 Total order impact: ₹{abs(difference_total):.2f} additional cost ({abs(difference_pct)}% overrun).")
    elif difference_per_piece < 0:
        insights.append(f"✅ ML predicts actual cost is ₹{abs(difference_per_piece):.2f}/piece LOWER than formula — you have margin buffer.")
        insights.append(f"📊 Potential savings: ₹{abs(difference_total):.2f} on this order ({abs(difference_pct)}% under budget).")
    else:
        insights.append("✅ ML prediction exactly matches formula — extremely efficient costing.")
    
    # Material analysis
    material_pct = ((primary_fabric + secondary_fabric) / base_cost * 100) if base_cost > 0 else 0
    if material_pct > 55:
        insights.append(f"🧵 Material costs represent {material_pct:.0f}% of base cost — fabric-heavy product.")
        suggestions.append("💡 Consider negotiating bulk fabric rates or exploring alternative blends to reduce material cost.")
    
    # Labor analysis
    labor_pct = (cmt / base_cost * 100) if base_cost > 0 else 0
    if labor_pct > 35:
        insights.append(f"🔧 CMT (labor) represents {labor_pct:.0f}% of base — labor-intensive garment.")
        suggestions.append("💡 Evaluate if automation at certain sewing stages could reduce CMT charges.")
    
    # Embellishment analysis
    if embellishments > base_cost * 0.15:
        suggestions.append("⚠️ Embellishment cost is high (>15% of base). ML predicts additional hidden costs from complexity — consider simplifying design.")
    
    # Rejection analysis
    if rejection_factor > 1.08:
        suggestions.append(f"🔴 High rejection factor ({((rejection_factor - 1) * 100):.0f}%). This inflates your cost significantly. Invest in QC to bring this below 5%.")
    elif rejection_factor > 1.03:
        suggestions.append(f"🟡 Rejection factor is {((rejection_factor - 1) * 100):.0f}%. Room for improvement — target <3% for optimal pricing.")
    else:
        suggestions.append(f"🟢 Excellent quality control — rejection at only {((rejection_factor - 1) * 100):.1f}%.")
    
    # Markup analysis
    if markup_pct < 15:
        suggestions.append(f"⚠️ Markup of {markup_pct}% is below industry average (15-25%). Consider if margins are sustainable.")
    elif markup_pct > 35:
        suggestions.append(f"📈 Premium markup of {markup_pct}%. Ensure market positioning justifies this margin.")
    
    # Volume analysis
    if quantity > 5000:
        suggestions.append("📦 Large order volume detected. ML has factored in bulk production efficiencies — actual cost may be lower than small-batch estimates.")
    elif quantity < 200:
        suggestions.append("📦 Small batch order. ML predicts higher per-unit cost due to setup overhead. Consider bundling with other orders.")
    
    # Savings recommendation
    if difference_per_piece > 5:
        potential_saving = round(difference_per_piece * 0.6, 2)
        suggestions.append(f"💡 By optimizing hidden cost factors, you could potentially save ₹{potential_saving}/piece (₹{round(potential_saving * quantity, 2)} total).")
    
    return {
        "formula_per_piece": formula_per_piece,
        "predicted_per_piece": predicted_per_piece,
        "formula_total": formula_total,
        "predicted_total": predicted_total,
        "difference_per_piece": difference_per_piece,
        "difference_total": difference_total,
        "difference_pct": difference_pct,
        "cost_risk": cost_risk,
        "material_percentage": round(material_pct, 1),
        "labor_percentage": round(labor_pct, 1),
        "insights": insights,
        "suggestions": suggestions,
        "system_verdict": f"{'🟢 Cost Optimized' if abs(difference_pct) < 5 else '🟡 Minor Variance' if abs(difference_pct) < 10 else '🔴 Significant Variance'}"
    }
