import os, io
import numpy as np
from joblib import load
from PIL import Image
import tensorflow as tf

MODELS_DIR = os.getenv("MODELS_DIR", "new model")

# Crop + fertilizer (scikit-learn pipelines)
_crop_model = None
_fert_model = None
_fert_columns = None
# Disease (tf)
_dis_model = None
_dis_labels = None

def _lazy_crop():
    global _crop_model
    if _crop_model is None:
        _crop_model = load(os.path.join(MODELS_DIR, "crop_model.joblib"))
    return _crop_model

def _lazy_fert():
    global _fert_model, _fert_columns
    if _fert_model is None:
        _fert_model = load(os.path.join(MODELS_DIR, "fertilizer_model.joblib"))
        _fert_columns = load(os.path.join(MODELS_DIR, "fertilizer_model_columns.joblib"))
    return _fert_model, _fert_columns

def _lazy_disease():
    global _dis_model, _dis_labels
    if _dis_model is None:
        _dis_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "disease_model.h5"))
        _dis_labels = ['Healthy', 'Powdery Mildew', 'Rust Disease']
    return _dis_model, _dis_labels

def predict_crop(features: dict) -> dict:
    model = _lazy_crop()
    import pandas as pd
    df = pd.DataFrame([features])
    pred = model.predict(df)[0]
    
    # Try to get confidence if available
    conf = None
    try:
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(df)[0]
            idx = list(model.classes_).index(pred)
            conf = float(proba[idx])
    except:
        pass
    
    return {"crop": str(pred), "confidence": conf}

def predict_fertilizer(features: dict) -> dict:
    model, columns = _lazy_fert()
    import pandas as pd
    
    # Map input features to model's expected format
    mapped_data = {
        'Temparature': features['temperature'],
        'Humidity ': features['humidity'], 
        'Moisture': features['moisture'],
        'Nitrogen': features['N'],
        'Potassium': features['K'],
        'Phosphorous': features['P']
    }
    
    # One-hot encode soil type
    soil_types = ['Clayey', 'Loamy', 'Red', 'Sandy']
    for soil in soil_types:
        mapped_data[f'Soil Type_{soil}'] = 1 if features['soil_type'] == soil else 0
    
    # One-hot encode crop type
    crop_types = ['Cotton', 'Ground Nuts', 'Maize', 'Millets', 'Oil seeds', 'Paddy', 'Pulses', 'Sugarcane', 'Tobacco', 'Wheat']
    for crop in crop_types:
        mapped_data[f'Crop Type_{crop}'] = 1 if features['crop_type'] == crop else 0
    
    # Create dataframe and reorder columns
    df = pd.DataFrame([mapped_data])
    df = df.reindex(columns=columns, fill_value=0)
    
    pred = model.predict(df)[0]
    return {"fertilizer": str(pred)}

def predict_disease(image_bytes: bytes) -> dict:
    model, labels = _lazy_disease()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224,224))
    arr = np.array(img) / 255.0  # Normalize to [0,1]
    arr = arr[None, ...]  # Add batch dimension
    probs = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(probs))
    confidence = float(probs[idx])
    disease = labels[idx]
    
    # 7-class severity mapping based on confidence
    if disease == 'Healthy':
        final_class = 'Healthy'
    elif confidence >= 0.85:
        final_class = f'{disease} - Early'
    elif confidence >= 0.65:
        final_class = f'{disease} - Moderate'
    else:
        final_class = f'{disease} - Severe'
    
    return {
        "disease": final_class,
        "base_disease": disease,
        "confidence": confidence,
        "severity": "None" if disease == 'Healthy' else final_class.split(' - ')[1]
    }
