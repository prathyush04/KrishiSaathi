from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
sys.path.append('../chatbot')
from llama_chatbot_simple import simple_llama_chatbot as chatbot

router = APIRouter()

class SpeechTextRequest(BaseModel):
    text: str
    language: str = "hindi"

class TextRequest(BaseModel):
    text: str
    language: str = "hindi"

@router.post("/speech/process")
async def process_speech_text(request: SpeechTextRequest):
    """Process text from web speech API"""
    try:
        # Use LLaMA chatbot directly
        response = chatbot.get_response(request.text)
        return {
            'user_speech': request.text,
            'response': response,
            'language': request.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speech/translate")
async def translate_text(request: TextRequest):
    """Translate text and get response"""
    try:
        # Use LLaMA chatbot directly
        response = chatbot.get_response(request.text)
        return {
            'original_question': request.text,
            'response': response,
            'language': request.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/speech/languages")
async def get_languages():
    """Get supported languages"""
    return {"languages": ["english", "hindi", "bengali", "tamil", "telugu", "marathi"]}

@router.post("/speech/set-language")
async def set_language(request: SpeechTextRequest):
    """Set chatbot language"""
    return {"message": f"Language set to {request.language}", "current_language": request.language}