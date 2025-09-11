import requests
import urllib.parse
import json
from concurrent.futures import ThreadPoolExecutor
import threading

# Cache for translations
translation_cache = {}

# Base English text to translate
BASE_TEXTS = {
    'welcome': 'Welcome to KrishiSaathi',
    'login': 'Login',
    'register': 'Register',
    'username': 'Username',
    'password': 'Password',
    'email': 'Email',
    'language': 'Language',
    'crop_recommendation': 'Crop Recommendation',
    'fertilizer_recommendation': 'Fertilizer Recommendation',
    'disease_detection': 'Disease Detection',
    'logout': 'Logout',
    'nitrogen': 'Nitrogen (N)',
    'phosphorus': 'Phosphorus (P)',
    'potassium': 'Potassium (K)',
    'temperature': 'Temperature (°C)',
    'humidity': 'Humidity (%)',
    'ph_level': 'pH Level',
    'rainfall': 'Rainfall (mm)',
    'get_recommendation': 'Get Recommendation',
    'analyzing': 'Analyzing...',
    'crop_desc': 'Find the best crop for your soil conditions',
    'description': 'Get personalized crop recommendations, fertilizer guidance, and disease detection using advanced machine learning algorithms trained on agricultural data.',
    'welcome_user': 'Welcome',
    'results': 'Results & Insights',
    'submit_data': 'Submit your data to get AI-powered recommendations'
}

def translate_batch(texts, target_language):
    """Translate multiple texts in one API call"""
    if target_language == 'en':
        return texts
    
    cache_key = f"{target_language}_{hash(tuple(texts))}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    
    try:
        combined_text = "\n".join(texts)
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            'client': 'gtx',
            'sl': 'en',
            'tl': target_language,
            'dt': 't',
            'q': combined_text
        }
        response = requests.get(url, params=params, timeout=3)
        if response.status_code == 200:
            result = response.json()
            translated = result[0][0][0]
            translations = translated.split('\n')
            translation_cache[cache_key] = translations
            return translations
        return texts
    except:
        return texts

def get_translations(language_code):
    """Get all translations for a language using batch translation"""
    if language_code == 'en':
        return BASE_TEXTS
    
    cache_key = f"full_{language_code}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    
    keys = list(BASE_TEXTS.keys())
    texts = list(BASE_TEXTS.values())
    
    translated_texts = translate_batch(texts, language_code)
    
    translations = dict(zip(keys, translated_texts))
    translation_cache[cache_key] = translations
    
    return translations