import os
import base64
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io

load_dotenv()
app = Flask(__name__)

# Initialize Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

def get_language_name(code):
    languages = {
        'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu', 'mr': 'Marathi',
        'ta': 'Tamil', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi',
        'or': 'Odia', 'as': 'Assamese', 'ur': 'Urdu', 'sa': 'Sanskrit', 'ne': 'Nepali',
        'si': 'Sinhala', 'ks': 'Kashmiri', 'sd': 'Sindhi', 'mai': 'Maithili', 'bho': 'Bhojpuri',
        'raj': 'Rajasthani', 'gom': 'Konkani', 'mni': 'Manipuri', 'sat': 'Santali'
    }
    return languages.get(code, 'English')

def get_farming_advice(message, language, image_data=None):
    lang_name = get_language_name(language)
    
    if image_data:
        prompt = f"""You are KrishiSaathi, an expert agricultural advisor for Indian farmers.
Analyze this crop/plant image and provide diagnosis in {lang_name}.
Identify: diseases, pests, nutrient deficiencies, or health issues.
Provide specific treatment recommendations.
Keep responses concise and farmer-friendly.
If asked in {lang_name}, respond in {lang_name}.

Additional question: {message if message else 'What do you see in this image?'}"""
    else:
        prompt = f"""You are KrishiSaathi, an expert agricultural advisor for Indian farmers. 
Provide practical, actionable farming advice in {lang_name}. 
Focus on: crops, pest control, irrigation, fertilizers, soil health, and sustainable farming practices.
Keep responses concise (2-3 sentences) and farmer-friendly.
If asked in {lang_name}, respond in {lang_name}.

Question: {message}"""
    
    try:
        if image_data:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            response = gemini_model.generate_content([prompt, image])
        else:
            response = gemini_model.generate_content(prompt)
            
        if response and response.text:
            return response.text.strip()
        else:
            return "API returned empty response. Please try again."
    except Exception as e:
        print(f"Gemini API Error: {e}")
        fallbacks = {
            'hi': "मैं फसल, कीट नियंत्रण, सिंचाई और उर्वरक के बारे में मदद कर सकता हूं। कृपया अपना प्रश्न पूछें।",
            'bn': "আমি ফসল, কীটপতঙ্গ নিয়ন্ত্রণ, সেচ এবং সার সম্পর্কে সাহায্য করতে পারি। অনুগ্রহ করে আপনার প্রশ্ন জিজ্ঞাসা করুন।",
            'te': "నేను పంటలు, కీటక నియంత్రణ, నీటిపారుదల మరియు ఎరువుల గురించి సహాయం చేయగలను. దయచేసి మీ ప్రశ్న అడగండి।",
            'ta': "நான் பயிர்கள், பூச்சி கட்டுப்பாடு, நீர்ப்பாசனம் மற்றும் உரங்கள் பற்றி உதவ முடியும். தயவுசெய்து உங்கள் கேள்வியைக் கேளுங்கள்.",
            'gu': "હું પાક, જંતુ નિયંત્રણ, સિંચાઈ અને ખાતર વિશે મદદ કરી શકું છું. કૃપા કરીને તમારો પ્રશ્ન પૂછો.",
            'kn': "ನಾನು ಬೆಳೆಗಳು, ಕೀಟ ನಿಯಂತ್ರಣ, ನೀರಾವರಿ ಮತ್ತು ಗೊಬ್ಬರಗಳ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
            'ml': "എനിക്ക് വിളകൾ, കീടനിയന്ത്രണം, ജലസേചനം, വളങ്ങൾ എന്നിവയെക്കുറിച്ച് സഹായിക്കാൻ കഴിയും. ദയവായി നിങ്ങളുടെ ചോദ്യം ചോദിക്കുക.",
            'pa': "ਮੈਂ ਫਸਲਾਂ, ਕੀੜੇ ਨਿਯੰਤਰਣ, ਸਿੰਚਾਈ ਅਤੇ ਖਾਦ ਬਾਰੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ।",
            'mr': "मी पिके, कीड नियंत्रण, सिंचन आणि खत याबद्दल मदत करू शकतो। कृपया तुमचा प्रश्न विचारा।",
            'or': "ମୁଁ ଫସଲ, କୀଟ ନିୟନ୍ତ୍ରଣ, ଜଳସେଚନ ଏବଂ ସାର ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି। ଦୟାକରି ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।",
            'as': "মই শস্য, কীট নিয়ন্ত্ৰণ, জলসিঞ্চন আৰু সাৰৰ বিষয়ে সহায় কৰিব পাৰো। অনুগ্ৰহ কৰি আপোনাৰ প্ৰশ্ন সোধক।",
            'ur': "میں فصلوں، کیڑوں کی روک تھام، آبپاشی اور کھاد کے بارے میں مدد کر سکتا ہوں۔ براہ کرم اپنا سوال پوچھیں۔",
            'en': f"API Error: {str(e)[:50]}... Please try again later."
        }
        return fallbacks.get(language, fallbacks['en'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    language = data.get('language', 'en')
    image_data = data.get('image', None)
    
    if not message.strip() and not image_data:
        return jsonify({'response': 'Please ask a farming question or upload an image!'})
    
    response = get_farming_advice(message, language, image_data)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)