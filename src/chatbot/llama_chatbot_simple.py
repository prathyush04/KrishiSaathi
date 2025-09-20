import json
import pickle
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SimpleLlamaAgriChatbot:
    def __init__(self):
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.qa_pairs = []
        self.qa_embeddings = None
        self.load_dataset()
        print(f"LLaMA-style Agricultural Chatbot Ready!")
        print(f"Dataset: {len(self.qa_pairs):,} Q&A pairs")
    
    def load_dataset(self):
        """Load massive agricultural dataset"""
        dataset_paths = [
            '../../datasets/massive_chatbot_data.pkl',
            '../datasets/massive_chatbot_data.pkl',
            'datasets/massive_chatbot_data.pkl'
        ]
        
        for path in dataset_paths:
            if os.path.exists(path):
                try:
                    with open(path, 'rb') as f:
                        data = pickle.load(f)
                        self.qa_pairs = data['qa_pairs']
                    
                    # Create semantic embeddings for better matching
                    questions = [qa['question'] for qa in self.qa_pairs]
                    print("Creating semantic embeddings...")
                    self.qa_embeddings = self.sentence_model.encode(questions, show_progress_bar=True)
                    print(f"Loaded {len(self.qa_pairs):,} Q&A pairs with embeddings")
                    return
                except Exception as e:
                    print(f"Error loading {path}: {e}")
        
        print("No dataset found, using fallback")
        self.create_fallback_data()
    
    def create_fallback_data(self):
        """Create fallback agricultural data"""
        self.qa_pairs = [
            {
                'question': 'cotton cultivation telangana',
                'answer': 'For cotton cultivation in Telangana: 1) Plant during June-July after monsoon, 2) Use black cotton soil with good drainage, 3) Apply 120kg N, 60kg P2O5, 60kg K2O per hectare, 4) Maintain 90cm row spacing, 5) Regular pest monitoring for bollworm, 6) Harvest after 180-200 days'
            },
            {
                'question': 'weather affect crops',
                'answer': 'Weather significantly affects crops: Temperature controls growth rate and flowering, rainfall determines irrigation needs, humidity influences disease development, wind can cause physical damage and affect pollination, extreme weather reduces yields. Monitor forecasts and adjust practices accordingly.'
            },
            {
                'question': 'pest management cotton',
                'answer': 'Cotton pest management: 1) Use Integrated Pest Management (IPM), 2) Monitor for bollworm, aphids, whitefly, 3) Apply neem-based organic pesticides, 4) Install pheromone traps, 5) Encourage beneficial insects like ladybugs, 6) Practice crop rotation with non-host plants'
            }
        ]
        
        questions = [qa['question'] for qa in self.qa_pairs]
        self.qa_embeddings = self.sentence_model.encode(questions)
    
    def retrieve_context(self, question, top_k=3, threshold=0.3):
        """Retrieve relevant context to prevent hallucination"""
        if self.qa_embeddings is None:
            return []
        
        # Encode user question
        question_embedding = self.sentence_model.encode([question])
        
        # Calculate similarities
        similarities = cosine_similarity(question_embedding, self.qa_embeddings)[0]
        
        # Get top matches above threshold
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        relevant_context = []
        for idx in top_indices:
            if similarities[idx] > threshold:
                relevant_context.append({
                    'question': self.qa_pairs[idx]['question'],
                    'answer': self.qa_pairs[idx]['answer'],
                    'similarity': similarities[idx]
                })
        
        return relevant_context
    
    def generate_response(self, question):
        """Generate response using retrieval-augmented approach"""
        # Check for comprehensive questions first
        question_lower = question.lower()
        comprehensive_keywords = ['what do i need', 'how to grow', 'complete guide', 'everything about', 'all about']
        
        if any(keyword in question_lower for keyword in comprehensive_keywords):
            return self.get_fallback_response(question)
        
        # Get relevant context
        context = self.retrieve_context(question, top_k=5, threshold=0.2)
        
        if not context:
            return self.get_fallback_response(question)
        
        # Filter out poor quality answers
        good_context = []
        for ctx in context:
            answer = ctx['answer'].lower()
            # Skip weather data, incomplete responses, or very short answers
            bad_indicators = ['weather', 'temperature', 'cloudy', 'precipitation', 'humidity', 'wind', '°c', 'pm', 'friday', 'monday', 'tuesday']
            if len(ctx['answer']) > 30 and not any(bad in answer for bad in bad_indicators) and len(ctx['answer'].split()) > 5:
                good_context.append(ctx)
        
        if not good_context:
            return self.get_fallback_response(question)
        
        # If very high similarity with good answer, return direct match
        if good_context[0]['similarity'] > 0.8:
            return f"🎯 {good_context[0]['answer']}"
        
        # If moderate similarity, use best match
        if good_context[0]['similarity'] > 0.5:
            return f"📚 Based on similar queries: {good_context[0]['answer']}"
        
        # If low similarity, provide general guidance
        if good_context[0]['similarity'] > 0.2:
            return f"💡 Related information: {good_context[0]['answer']}\\n\\nFor more specific advice, please provide more details about your farming situation."
        
        return self.get_fallback_response(question)
    
    def get_fallback_response(self, question):
        """Provide fallback response for unknown topics"""
        question_lower = question.lower()
        
        # Comprehensive cotton growing guide
        if any(word in question_lower for word in ['cotton', 'kapas']) and any(word in question_lower for word in ['grow', 'need', 'cultivation', 'farming']):
            return "🌱 **Complete Cotton Growing Guide:**\n\n**1. Soil Requirements:**\n• Black cotton soil or well-drained loamy soil\n• pH 5.8-8.0, optimal 6.0-7.5\n• Good drainage essential\n\n**2. Climate:**\n• Temperature 21-27°C during growing season\n• 500-1000mm annual rainfall\n• 180-200 frost-free days\n\n**3. Seeds & Planting:**\n• Use certified Bt cotton varieties\n• Plant spacing: 90cm x 45cm\n• Sowing depth: 2-3cm\n• Seed rate: 1.5-2 kg/hectare\n\n**4. Fertilizers:**\n• NPK: 120:60:60 kg/hectare\n• Apply in 2-3 splits\n• Add organic manure 5-10 tons/hectare\n\n**5. Irrigation:**\n• Critical stages: flowering & boll formation\n• Drip irrigation recommended\n• 6-8 irrigations needed\n\n**6. Pest Management:**\n• Monitor for bollworm, aphids, whitefly\n• Use IPM approach\n• Pheromone traps\n• Neem-based pesticides\n\n**7. Harvest:**\n• 160-180 days after sowing\n• Pick when bolls fully open\n• Multiple pickings needed"
        
        # Topic-based responses
        elif any(word in question_lower for word in ['cotton', 'kapas']):
            return "🌱 For cotton cultivation: Choose appropriate variety, prepare soil well, maintain proper spacing, monitor pests regularly, and ensure adequate irrigation. What specific aspect of cotton farming do you need help with?"
        
        elif any(word in question_lower for word in ['rice', 'paddy', 'dhan']):
            return "🌾 For rice cultivation: Prepare puddled fields, use quality seeds, maintain water levels, apply fertilizers in splits, and control weeds. What specific rice farming question do you have?"
        
        elif any(word in question_lower for word in ['wheat', 'gehun']):
            return "🌾 For wheat cultivation: Sow at right time, use recommended varieties, apply balanced fertilizers, ensure proper irrigation, and monitor for diseases. What wheat farming aspect interests you?"
        
        elif any(word in question_lower for word in ['soil', 'mitti']):
            return "🏞️ For soil management: Test soil regularly, add organic matter, maintain proper pH, ensure good drainage, and practice crop rotation. What soil issue are you facing?"
        
        elif any(word in question_lower for word in ['fertilizer', 'khad']):
            return "🧪 For fertilizers: Use based on soil test, apply NPK in right ratios, consider organic options, time application properly, and avoid over-fertilization. What crop are you fertilizing?"
        
        elif any(word in question_lower for word in ['pest', 'disease', 'keet']):
            return "🐛 For pest management: Use IPM approach, monitor regularly, apply organic treatments first, encourage beneficial insects, and practice crop rotation. What pest problem are you seeing?"
        
        else:
            return "🤖 I'm KrishiSaathi, your agricultural AI assistant. I can help with:\\n• Crop cultivation (cotton, rice, wheat, etc.)\\n• Soil management\\n• Fertilizer recommendations\\n• Pest and disease control\\n• Irrigation practices\\n\\nWhat specific farming topic would you like to discuss?"
    
    def get_response(self, question):
        """Main interface for getting responses"""
        if not question.strip():
            return "Please ask me about agricultural topics like crops, soil, fertilizers, or pest management."
        
        # Handle greetings and identity questions
        greetings = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening']
        identity_questions = ['who are you', 'what are you', 'who r u', 'what r u', 'introduce yourself', 'tell me about yourself']
        
        if any(greeting in question.lower() for greeting in greetings) and len(question.split()) <= 3:
            return "🙏 Hello! I'm KrishiSaathi, your AI agricultural assistant powered by advanced language models. Ask me about farming, crops, soil management, or pest control!"
        
        if any(identity in question.lower() for identity in identity_questions):
            return "🤖 I'm KrishiSaathi, your intelligent agricultural companion! I'm an AI assistant specifically designed to help farmers with:\n\n🌱 Crop cultivation guidance\n🌾 Soil management advice\n💧 Irrigation recommendations\n🐛 Pest and disease control\n🧪 Fertilizer suggestions\n📊 Agricultural best practices\n\nI have access to over 100,000 agricultural Q&A pairs and use advanced AI to provide accurate, helpful farming advice. How can I help you with your farming needs today?"
        
        # Handle thanks
        thanks = ['thank', 'thanks', 'dhanyawad']
        if any(thank in question.lower() for thank in thanks) and len(question.split()) <= 3:
            return "🙏 You're welcome! Happy farming! Feel free to ask more agricultural questions anytime."
        
        # Generate response
        try:
            response = self.generate_response(question)
            return response
        except Exception as e:
            print(f"Error: {e}")
            return "I'm having trouble processing your question. Please try asking about specific agricultural topics like crop cultivation, soil management, or pest control."

# Global instance
simple_llama_chatbot = SimpleLlamaAgriChatbot()