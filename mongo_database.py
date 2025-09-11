from pymongo import MongoClient
import hashlib
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)

class UserDatabase:
    def __init__(self):
        # MongoDB connection
        mongo_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/')
        self.client = MongoClient(mongo_url)
        self.db = self.client.krishisaathi
        self.users = self.db.users
        
        # Create index for username (unique)
        self.users.create_index("username", unique=True)
        logging.info("MongoDB connected successfully")
    
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username, email, password, language='en'):
        try:
            user_doc = {
                'username': username,
                'email': email,
                'password_hash': self.hash_password(password),
                'language': language,
                'created_at': datetime.utcnow()
            }
            self.users.insert_one(user_doc)
            logging.info(f"User {username} created successfully")
            return True
        except Exception as e:
            logging.error(f"User creation failed: {e}")
            return False
    
    def verify_user(self, username, password):
        try:
            user = self.users.find_one({
                'username': username,
                'password_hash': self.hash_password(password)
            })
            if user:
                return (user['_id'], user['username'], user['email'], user['language'])
            return None
        except Exception as e:
            logging.error(f"User verification failed: {e}")
            return None
    
    def update_language(self, username, language):
        try:
            self.users.update_one(
                {'username': username},
                {'$set': {'language': language}}
            )
            logging.info(f"Language updated for {username}")
        except Exception as e:
            logging.error(f"Language update failed: {e}")