from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from waste_calculator import calculate_waste
from suggestions import generate_suggestions
from image_processor import estimate_dimensions_from_image
from optimization import optimize_layout
from environmental import calculate_environmental_impact
from forecasting import generate_environmental_forecast

app = FastAPI(title="Garment Fabric Waste Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL (e.g., http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WasteRequest(BaseModel):
    fabric_length: float
    fabric_width: float
    pattern_length: float
    pattern_width: float
    count: int
    cost_per_meter: float

@app.post("/calculate-waste")
def calculate_waste_endpoint(req: WasteRequest):
    try:
        results = calculate_waste(
            req.fabric_length,
            req.fabric_width,
            req.pattern_length,
            req.pattern_width,
            req.count,
            req.cost_per_meter
        )
        suggestions = generate_suggestions(results["waste_percentage"], results["extra_garments"])
        
        return {
            "success": True,
            "data": results,
            "suggestions": suggestions
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sustainable-waste")
def sustainable_waste_endpoint(req: WasteRequest):
    try:
        # 1. Base Waste Calc
        results = calculate_waste(
            req.fabric_length,
            req.fabric_width,
            req.pattern_length,
            req.pattern_width,
            req.count,
            req.cost_per_meter
        )
        
        # 2. Environmental Impact
        env_impact = calculate_environmental_impact(results["waste_area"], results["waste_percentage"])
        
        # 3. Optimization Math
        opt_results = optimize_layout(
            req.fabric_length,
            req.fabric_width,
            req.pattern_length,
            req.pattern_width
        )
        
        response_data = {
            "metrics": results,
            "environmental": env_impact,
            "optimization": opt_results
        }
        
        # Calculate how many extra garments we could get just by better layout algorithm
        if opt_results:
            optimized_reduction = max(0, opt_results["max_items"] - req.count)
            response_data["optimization"]["potential_extra_from_layout"] = optimized_reduction
        
        # 4. Suggestions with Eco Score factored in
        eco_score = env_impact.get("eco_score")
        suggestions_list = generate_suggestions(results["waste_percentage"], results["extra_garments"], eco_score)
        
        return {
            "success": True,
            "data": response_data,
            "suggestions": suggestions_list
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@app.post("/forecast")
async def forecast_endpoint(request: WasteRequest):
    try:
        current_waste = calculate_waste(
           request.fabric_length, request.fabric_width, 
           request.pattern_length, request.pattern_width, 
           request.count, request.cost_per_meter
        )
        
        env_impact = calculate_environmental_impact(current_waste)
        
        # Tap into the complex AI model
        prediction = generate_environmental_forecast(
           current_waste_kg=env_impact["waste_kg_est"],
           current_eco_score=env_impact["eco_score"]
        )
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
