import urllib.parse
import urllib.request
import json

class WorkingTranslator:
    def __init__(self):
        self.languages = {
            'hindi': 'hi',
            'bengali': 'bn', 
            'telugu': 'te',
            'marathi': 'mr',
            'tamil': 'ta',
            'gujarati': 'gu',
            'kannada': 'kn',
            'malayalam': 'ml',
            'punjabi': 'pa',
            'odia': 'or',
            'english': 'en'
        }
    
    def translate_text(self, text, source_lang='en', target_lang='hi'):
        """Translate text using Google Translate"""
        if source_lang == target_lang or target_lang == 'en':
            return text
            
        try:
            # Use Google Translate API
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q={urllib.parse.quote(text)}"
            
            with urllib.request.urlopen(url) as response:
                result = json.loads(response.read().decode())
                
            if result and len(result) > 0 and len(result[0]) > 0:
                return result[0][0][0]
                
        except Exception as e:
            print(f"Translation error: {e}")
            
        return text
    
    def get_available_languages(self):
        return list(self.languages.keys())