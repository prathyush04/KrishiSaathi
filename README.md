# 🌱 Agri ML Starter

End-to-end agricultural machine learning platform with three AI models:
1. **Crop Recommendation** (RandomForest)
2. **Fertilizer Recommendation** (RandomForest) 
3. **Plant Disease Classification** (MobileNetV2)

## 🚀 Quick Start

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Train models (optional - pre-trained models included)
python src/training/train_crop.py --synthetic
python src/training/train_fertilizer.py --synthetic
python src/training/train_disease.py --synthetic

# Start API server
uvicorn src.api.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure
```
agri_ml_starter/
├── src/
│   ├── api/main.py           # FastAPI endpoints
│   ├── inference/predict.py  # Model predictions
│   ├── pipelines/           # ML training pipelines
│   └── training/            # Model training scripts
├── frontend/                # React.js UI
├── data/raw/               # Training datasets
├── models/                 # Saved ML models
└── config.yaml            # Configuration
```

## 🔗 API Endpoints

- `POST /predict/crop` - Crop recommendation
- `POST /predict/fertilizer` - Fertilizer suggestion  
- `POST /predict/disease` - Disease detection (image upload)

API docs: http://127.0.0.1:8000/docs

## 📊 Data Requirements

**Crop Dataset**: `data/raw/crop_recommendation/Crop_recommendation.csv`
```csv
N,P,K,temperature,humidity,ph,rainfall,label
90,42,43,20.87,82.00,6.50,202.93,rice
```

**Fertilizer Dataset**: `data/raw/fertilizer_recommendation/fertilizer.csv`
```csv
temperature,humidity,moisture,soil_type,crop_type,N,P,K,Fertilizer Name
26,52,38,Sandy,Maize,37,0,0,Urea
```

**Disease Dataset**: `data/raw/plant_disease/{Train,Test,Validation}/{class}/`

## 🛠️ Technologies

- **Backend**: FastAPI, scikit-learn, TensorFlow
- **Frontend**: React, Tailwind CSS, Lucide Icons
- **ML**: RandomForest, MobileNetV2 Transfer Learning