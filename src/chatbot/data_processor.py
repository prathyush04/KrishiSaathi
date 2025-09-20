import pandas as pd
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import numpy as np
from kcc_data_fetcher import KCCDataFetcher

class AgricultureDataProcessor:
    def __init__(self, datasets_dir="datasets/faqs"):
        self.datasets_dir = datasets_dir
        self.qa_pairs = []
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.question_vectors = None
        
    def load_datasets(self):
        """Load all FAQ datasets including KCC data"""
        # Load KCC government data
        self.load_kcc_data()
        
        csv_files = [
            "Agriculture_Soil_QA_Cleaned.csv",
            "Agriculture_Soil_QA_Dataset.csv", 
            "AgroQA Dataset.csv",
            "Farming_FAQ_Assistant_Dataset.csv",
            "KisanVaani_agriculture_qa.csv"
        ]
        
        for file in csv_files:
            file_path = os.path.join(self.datasets_dir, file)
            if os.path.exists(file_path):
                try:
                    df = pd.read_csv(file_path)
                    # Handle different column names
                    question_col = None
                    answer_col = None
                    
                    for col in df.columns:
                        if 'question' in col.lower() or 'q' in col.lower():
                            question_col = col
                        elif 'answer' in col.lower() or 'a' in col.lower():
                            answer_col = col
                    
                    if question_col and answer_col:
                        for _, row in df.iterrows():
                            if pd.notna(row[question_col]) and pd.notna(row[answer_col]):
                                self.qa_pairs.append({
                                    'question': str(row[question_col]).strip(),
                                    'answer': str(row[answer_col]).strip()
                                })
                except Exception as e:
                    print(f"Error loading {file}: {e}")
        
        print(f"Loaded {len(self.qa_pairs)} Q&A pairs")
        return self.qa_pairs
    
    def load_kcc_data(self):
        """Load KCC government data"""
        try:
            kcc_file = 'kcc_agricultural_data.json'
            if os.path.exists(kcc_file):
                with open(kcc_file, 'r', encoding='utf-8') as f:
                    kcc_data = json.load(f)
                    
                for record in kcc_data:
                    if record.get('QueryText') and record.get('KccAns'):
                        self.qa_pairs.append({
                            'question': record['QueryText'],
                            'answer': record['KccAns']
                        })
                print(f"Loaded {len(kcc_data)} KCC records")
            else:
                # Fetch fresh data
                fetcher = KCCDataFetcher()
                kcc_data = fetcher.save_kcc_dataset(kcc_file)
                self.load_kcc_data()  # Reload after saving
        except Exception as e:
            print(f"Error loading KCC data: {e}")
    
    def prepare_training_data(self):
        """Prepare data for similarity matching"""
        if not self.qa_pairs:
            self.load_datasets()
        
        questions = [qa['question'] for qa in self.qa_pairs]
        self.question_vectors = self.vectorizer.fit_transform(questions)
        
        # Save processed data
        with open('chatbot_data.pkl', 'wb') as f:
            pickle.dump({
                'qa_pairs': self.qa_pairs,
                'vectorizer': self.vectorizer,
                'question_vectors': self.question_vectors
            }, f)
        
        return self.qa_pairs
    
    def find_best_answer(self, user_question, threshold=0.3):
        """Find best matching answer using cosine similarity"""
        if self.question_vectors is None:
            return "I'm still learning. Please try again later."
        
        # Vectorize user question
        user_vector = self.vectorizer.transform([user_question])
        
        # Calculate similarities
        similarities = cosine_similarity(user_vector, self.question_vectors)[0]
        
        # Find best match
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]
        
        if best_score > threshold:
            return self.qa_pairs[best_idx]['answer']
        else:
            return "I don't have specific information about that. Could you rephrase your question or ask about soil management, crop rotation, fertilizers, or organic farming?"

if __name__ == "__main__":
    processor = AgricultureDataProcessor()
    processor.prepare_training_data()
    print("Data processing complete!")