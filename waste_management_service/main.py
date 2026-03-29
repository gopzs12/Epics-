from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from waste_calculator import calculate_waste
from suggestions import generate_suggestions
from image_processor import estimate_dimensions_from_image
from optimization import optimize_layout
from environmental import calculate_environmental_impact
from forecasting import generate_environmental_forecast
from ml_predictor import predict_waste, generate_hybrid_analysis
from cost_predictor import predict_cost, generate_cost_hybrid_analysis
from defect_detector import DefectDetector

app = FastAPI(title="GarmentLink — Hybrid Intelligent Manufacturing System")

# Initialize the Defect Detector (YOLOv8)
# It loads once at startup for speed.
defect_model = DefectDetector(model_path="yolov8n.pt")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
#  REQUEST MODELS
# ============================

class WasteRequest(BaseModel):
    fabric_length: float
    fabric_width: float
    pattern_length: float
    pattern_width: float
    count: int
    cost_per_meter: float

class CostRequest(BaseModel):
    primary_fabric: float
    secondary_fabric: float
    cmt: float
    embellishments: float
    trims: float
    compliance: float
    quantity: int
    rejection_factor: float
    markup_pct: float


# ============================
#  WASTE ENDPOINTS
# ============================

@app.post("/calculate-waste")
def calculate_waste_endpoint(req: WasteRequest):
    try:
        results = calculate_waste(
            req.fabric_length, req.fabric_width,
            req.pattern_length, req.pattern_width,
            req.count, req.cost_per_meter
        )
        suggestions = generate_suggestions(results["waste_percentage"], results["extra_garments"])
        return { "success": True, "data": results, "suggestions": suggestions }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sustainable-waste")
def sustainable_waste_endpoint(req: WasteRequest):
    """Hybrid Intelligent Waste System — Rule-Based + ML + Environmental + Optimization"""
    try:
        results = calculate_waste(
            req.fabric_length, req.fabric_width,
            req.pattern_length, req.pattern_width,
            req.count, req.cost_per_meter
        )
        
        ml_prediction = predict_waste(
            fabric_length=req.fabric_length, fabric_width=req.fabric_width,
            pattern_length=req.pattern_length, pattern_width=req.pattern_width,
            count=req.count
        )
        
        hybrid = generate_hybrid_analysis(
            actual_waste_percentage=results["waste_percentage"],
            predicted_waste_percentage=ml_prediction["predicted_waste_percentage"],
            total_area=results["total_area"],
            pattern_area=req.pattern_length * req.pattern_width,
            count=req.count
        )
        
        env_impact = calculate_environmental_impact(results["waste_area"], results["waste_percentage"])
        env_impact["trees_to_offset"] = max(1, round(env_impact["co2_emissions_kg"] / 22))
        
        opt_results = optimize_layout(
            req.fabric_length, req.fabric_width,
            req.pattern_length, req.pattern_width
        )
        if opt_results:
            opt_results["potential_extra_from_layout"] = max(0, opt_results["max_items"] - req.count)
        
        eco_score = env_impact.get("eco_score")
        suggestions_list = generate_suggestions(results["waste_percentage"], results["extra_garments"], eco_score)
        
        return {
            "success": True,
            "data": {
                "metrics": results,
                "environmental": env_impact,
                "optimization": opt_results,
                "ml_prediction": ml_prediction,
                "hybrid_analysis": hybrid
            },
            "suggestions": suggestions_list
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-waste")
def predict_waste_endpoint(req: WasteRequest):
    try:
        prediction = predict_waste(
            fabric_length=req.fabric_length, fabric_width=req.fabric_width,
            pattern_length=req.pattern_length, pattern_width=req.pattern_width,
            count=req.count
        )
        return { "success": True, "prediction": prediction }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
#  COSTING ENDPOINTS
# ============================

@app.post("/hybrid-cost")
def hybrid_cost_endpoint(req: CostRequest):
    """
    HYBRID INTELLIGENT COSTING SYSTEM
    Combines: Industry Formula (ground truth) + ML Prediction + Intelligence Layer
    """
    try:
        # 1. INDUSTRY FORMULA (ground truth — NOT touching this)
        base_cost = req.primary_fabric + req.secondary_fabric + req.cmt + req.embellishments + req.trims + req.compliance
        adjusted = base_cost * req.rejection_factor
        formula_per_piece = adjusted * (1 + req.markup_pct / 100)
        formula_total = formula_per_piece * req.quantity
        
        # 2. ML PREDICTION (Random Forest)
        ml_prediction = predict_cost(
            primary_fabric=req.primary_fabric,
            secondary_fabric=req.secondary_fabric,
            cmt=req.cmt,
            embellishments=req.embellishments,
            trims=req.trims,
            compliance=req.compliance,
            quantity=req.quantity,
            rejection_factor=req.rejection_factor,
            markup_pct=req.markup_pct
        )
        
        # 3. HYBRID INTELLIGENCE LAYER
        hybrid = generate_cost_hybrid_analysis(
            formula_per_piece=round(formula_per_piece, 2),
            formula_total=round(formula_total, 2),
            predicted_per_piece=ml_prediction["predicted_per_piece"],
            predicted_total=ml_prediction["predicted_total"],
            primary_fabric=req.primary_fabric,
            secondary_fabric=req.secondary_fabric,
            cmt=req.cmt,
            embellishments=req.embellishments,
            trims=req.trims,
            compliance=req.compliance,
            quantity=req.quantity,
            rejection_factor=req.rejection_factor,
            markup_pct=req.markup_pct
        )
        
        return {
            "success": True,
            "data": {
                "formula": {
                    "base_cost": round(base_cost, 2),
                    "per_piece": round(formula_per_piece, 2),
                    "total": round(formula_total, 2),
                },
                "ml_prediction": ml_prediction,
                "hybrid_analysis": hybrid
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-cost")
def predict_cost_endpoint(req: CostRequest):
    """Pure ML cost prediction."""
    try:
        prediction = predict_cost(
            primary_fabric=req.primary_fabric, secondary_fabric=req.secondary_fabric,
            cmt=req.cmt, embellishments=req.embellishments,
            trims=req.trims, compliance=req.compliance,
            quantity=req.quantity, rejection_factor=req.rejection_factor,
            markup_pct=req.markup_pct
        )
        return { "success": True, "prediction": prediction }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
#  OTHER ENDPOINTS
# ============================

@app.post("/estimate-waste-image")
async def estimate_waste_image_endpoint(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
        contents = await file.read()
        results = estimate_dimensions_from_image(contents)
        if not results.get("success"):
            raise HTTPException(status_code=422, detail=results.get("message", "Processing failed."))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-defects")
async def detect_defects_endpoint(file: UploadFile = File(...)):
    """
    DL Defect Detection Endpoint.
    Returns bounding boxes and confidence for detected defects.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
            
        detections, _ = defect_model.detect(img)
        
        return {
            "success": True,
            "detected_count": len(detections),
            "detections": detections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast")
async def forecast_endpoint(request: WasteRequest):
    try:
        current_waste = calculate_waste(
           request.fabric_length, request.fabric_width,
           request.pattern_length, request.pattern_width,
           request.count, request.cost_per_meter
        )
        env_impact = calculate_environmental_impact(current_waste["waste_area"], current_waste["waste_percentage"])
        prediction = generate_environmental_forecast(
           current_waste_kg=env_impact["waste_kg_est"],
           current_eco_score=env_impact["eco_score"]
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-status")
def model_status():
    """Check if ML models are loaded and ready."""
    import os
    waste_model = os.path.exists(os.path.join(os.path.dirname(__file__), "waste_model.pkl"))
    cost_model = os.path.exists(os.path.join(os.path.dirname(__file__), "cost_model.pkl"))
    defect_model_file = os.path.exists(os.path.join(os.path.dirname(__file__), "yolov8n.pt"))
    
    return {
        "waste_model": "ready" if waste_model else "not_trained",
        "cost_model": "ready" if cost_model else "not_trained",
        "defect_model": "ready" if (defect_model_file or defect_model) else "loading",
        "status": "all_ready" if (waste_model and cost_model and defect_model_file) else "partial",
        "message": "All ML models (Waste, Cost, Defect) are loaded and ready" if (waste_model and cost_model and defect_model_file) else "Some models need training or setup"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
