from working_translator import WorkingTranslator

class SpeechHandler:
    def __init__(self):
        self.translator = WorkingTranslator()
        
        # Indian language codes
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
    
    def translate_text(self, text, source_lang='auto', target_lang='en'):
        """Translate text between languages"""
        try:
            if source_lang == target_lang:
                return text
            translated = self.translator.translate(text, src=source_lang, dest=target_lang)
            return translated.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def get_available_languages(self):
        """Return list of supported languages"""
        return list(self.languages.keys())