from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ..inference.predict import predict_crop, predict_fertilizer, predict_disease
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
from database import UserDatabase
from languages import INDIAN_LANGUAGES
from translator import get_translations

app = FastAPI(title="Agri ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://68c2c0ec765ff80008709c8a--krishisaathiii.netlify.app",
        "https://krishisaathiii.netlify.app",
        "*"  # Temporary fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db = UserDatabase()

class CropFeatures(BaseModel):
    N: float = Field(..., description="Nitrogen")
    P: float = Field(..., description="Phosphorus")
    K: float = Field(..., description="Potassium")
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class FertFeatures(BaseModel):
    temperature: float
    humidity: float
    moisture: float
    soil_type: str
    crop_type: str
    N: float
    P: float
    K: float

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    language: str = 'en'

class UserLogin(BaseModel):
    username: str
    password: str

class LanguageUpdate(BaseModel):
    username: str
    language: str

@app.post("/predict/crop")
def predict_crop_endpoint(body: CropFeatures):
    try:
        result = predict_crop(body.dict())
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/predict/fertilizer")
def predict_fertilizer_endpoint(body: FertFeatures):
    try:
        result = predict_fertilizer(body.dict())
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/predict/disease")
async def predict_disease_endpoint(file: UploadFile = File(...)):
    try:
        img_bytes = await file.read()
        result = predict_disease(img_bytes)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/auth/register")
def register_user(user: UserRegister):
    if user.language not in INDIAN_LANGUAGES:
        raise HTTPException(status_code=400, detail="Invalid language")
    
    # Temporarily bypass database for demo
    return {"message": "User registered successfully"}

@app.post("/auth/login")
def login_user(user: UserLogin):
    # Temporarily bypass database for demo
    return {
        "message": "Login successful",
        "user": {
            "id": 1,
            "username": user.username,
            "email": "demo@example.com",
            "language": "en"
        }
    }

@app.get("/languages")
def get_languages():
    return INDIAN_LANGUAGES

@app.get("/translations/{language}")
def get_translations_endpoint(language: str):
    return get_translations(language)

@app.put("/auth/language")
def update_language(update: LanguageUpdate):
    if update.language not in INDIAN_LANGUAGES:
        raise HTTPException(status_code=400, detail="Invalid language")
    
    # Temporarily bypass database for demo
    return {"message": "Language updated successfully"}