"""
train_cost_model.py
Trains a Random Forest Regressor to predict actual garment cost per piece.
The model learns hidden cost factors that the simple formula misses.
"""
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

def train():
    data_path = os.path.join(os.path.dirname(__file__), "cost_data.csv")
    model_path = os.path.join(os.path.dirname(__file__), "cost_model.pkl")
    
    if not os.path.exists(data_path):
        print("❌ cost_data.csv not found! Run generate_cost_data.py first.")
        return
    
    print("📊 Loading costing training data...")
    df = pd.read_csv(data_path)
    print(f"   Loaded {len(df)} samples")
    
    # ============================
    #  FEATURES
    # ============================
    feature_cols = [
        "primary_fabric",
        "secondary_fabric",
        "cmt",
        "embellishments",
        "trims",
        "compliance",
        "quantity",
        "rejection_factor",
        "markup_pct",
        "base_cost",
        "material_ratio",
        "labor_intensity",
        "embellishment_complexity",
        "order_scale",
    ]
    
    X = df[feature_cols]
    y = df["actual_per_piece"]  # Predict the ACTUAL per-piece cost (includes hidden factors)
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Target: actual_per_piece")
    print(f"   Target range: ₹{y.min():.2f} — ₹{y.max():.2f}")
    
    # ============================
    #  TRAIN-TEST SPLIT
    # ============================
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"\n🔬 Training: {len(X_train)} | Testing: {len(X_test)}")
    
    # ============================
    #  RANDOM FOREST
    # ============================
    print("🧠 Training Random Forest Regressor (150 trees, 14 features)...")
    
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=18,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # ============================
    #  EVALUATION
    # ============================
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    print(f"\n📈 Performance:")
    print(f"   Train MAE: ₹{mean_absolute_error(y_train, y_pred_train):.3f}  |  R²: {r2_score(y_train, y_pred_train):.4f}")
    print(f"   Test  MAE: ₹{mean_absolute_error(y_test, y_pred_test):.3f}  |  R²: {r2_score(y_test, y_pred_test):.4f}")
    
    # Feature Importance
    importances = model.feature_importances_
    ranked = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    
    print(f"\n🎯 Feature Importance:")
    for feat, imp in ranked:
        bar = "█" * int(imp * 60)
        print(f"   {feat:30s} {imp:.4f} {bar}")
    
    # ============================
    #  SAVE MODEL
    # ============================
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved → {model_path}")
    print(f"   Size: {os.path.getsize(model_path) / 1024:.1f} KB")
    
    return model


if __name__ == "__main__":
    print("=" * 60)
    print("  💰 GARMENTLINK ML COSTING MODEL TRAINER")
    print("=" * 60)
    train()
    print("\n🚀 Model ready for costing predictions!")
