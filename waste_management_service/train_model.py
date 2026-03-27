"""
train_model.py
Trains a Random Forest Regressor on synthetic garment waste data.
Saves the trained model as waste_model.pkl for inference.
"""
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

def train():
    data_path = os.path.join(os.path.dirname(__file__), "waste_data.csv")
    model_path = os.path.join(os.path.dirname(__file__), "waste_model.pkl")
    
    if not os.path.exists(data_path):
        print("❌ waste_data.csv not found! Run generate_training_data.py first.")
        return
    
    print("📊 Loading training data...")
    df = pd.read_csv(data_path)
    print(f"   Loaded {len(df)} samples with {len(df.columns)} features")
    
    # ============================
    #  FEATURE ENGINEERING
    # ============================
    
    # Core features for the model
    feature_cols = [
        "total_area",
        "pattern_area", 
        "num_items",
        "utilization_ratio",
        "aspect_ratio_fabric",
        "aspect_ratio_pattern",
        "density"
    ]
    
    X = df[feature_cols]
    y = df["waste_percentage"]
    
    print(f"   Features: {feature_cols}")
    print(f"   Target: waste_percentage")
    print(f"   Target range: {y.min():.1f}% — {y.max():.1f}%")
    
    # ============================
    #  TRAIN-TEST SPLIT (80/20)
    # ============================
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\n🔬 Training: {len(X_train)} samples | Testing: {len(X_test)} samples")
    
    # ============================
    #  RANDOM FOREST REGRESSOR
    # ============================
    
    print("🧠 Training Random Forest Regressor (100 trees)...")
    
    model = RandomForestRegressor(
        n_estimators=100,        # 100 decision trees
        max_depth=15,            # Prevent overfitting
        min_samples_split=5,     # Minimum samples to split a node
        min_samples_leaf=3,      # Minimum samples in leaf
        random_state=42,
        n_jobs=-1                # Use all CPU cores
    )
    
    model.fit(X_train, y_train)
    
    # ============================
    #  EVALUATION
    # ============================
    
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    
    print(f"\n📈 Model Performance:")
    print(f"   Train MAE: {train_mae:.3f}%  |  R²: {train_r2:.4f}")
    print(f"   Test  MAE: {test_mae:.3f}%  |  R²: {test_r2:.4f}")
    
    # Feature Importance
    importances = model.feature_importances_
    feature_importance = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    
    print(f"\n🎯 Feature Importance:")
    for feat, imp in feature_importance:
        bar = "█" * int(imp * 50)
        print(f"   {feat:25s} {imp:.4f} {bar}")
    
    # ============================
    #  SAVE MODEL
    # ============================
    
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved → {model_path}")
    print(f"   Model size: {os.path.getsize(model_path) / 1024:.1f} KB")
    
    return model


if __name__ == "__main__":
    print("=" * 60)
    print("  🏭 GARMENTLINK ML WASTE PREDICTION MODEL TRAINER")
    print("=" * 60)
    train()
    print("\n🚀 Training complete! Model ready for inference.")
