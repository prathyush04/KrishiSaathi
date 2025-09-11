import psycopg2
import hashlib
import os
from datetime import datetime

class UserDatabase:
    def __init__(self):
        # Try DATABASE_URL first (for Railway), fallback to individual vars
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            self.database_url = database_url
            self.use_url = True
        else:
            db_name = os.getenv("DB_NAME", "KrishiSaathi")
            user = os.getenv("DB_USER", "postgres")
            password = os.getenv("DB_PASSWORD", "Prathyush@04")
            host = os.getenv("DB_HOST", "localhost")
            port = os.getenv("DB_PORT", "5432")
            self.db_config = {
                'dbname': db_name,
                'user': user,
                'password': password,
                'host': host,
                'port': port
            }
            self.use_url = False
        # Temporarily disable database init for Railway deployment
        # self.init_db()
    
    def get_connection(self):
        if self.use_url:
            return psycopg2.connect(self.database_url)
        else:
            return psycopg2.connect(**self.db_config)
    
    def init_db(self):
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(64) NOT NULL,
                    language VARCHAR(10) DEFAULT 'en',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Database init failed: {e}")
            pass  # Continue without database for now
    
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username, email, password, language='en'):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, language) VALUES (%s, %s, %s, %s)",
                (username, email, self.hash_password(password), language)
            )
            conn.commit()
            return True
        except psycopg2.IntegrityError:
            return False
        finally:
            conn.close()
    
    def verify_user(self, username, password):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, email, language FROM users WHERE username = %s AND password_hash = %s",
            (username, self.hash_password(password))
        )
        user = cursor.fetchone()
        conn.close()
        return user
    
    def update_language(self, username, language):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET language = %s WHERE username = %s",
            (language, username)
        )
        conn.commit()
        conn.close()