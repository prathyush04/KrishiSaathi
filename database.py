import psycopg2
import psycopg2.pool
import hashlib
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)

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
        
        # Initialize connection pool to prevent segfaults
        self.connection_pool = None
        self.init_db()
    
    def get_connection(self):
        try:
            if self.use_url:
                return psycopg2.connect(
                    self.database_url,
                    connect_timeout=10,
                    application_name='krishisaathi'
                )
            else:
                return psycopg2.connect(
                    connect_timeout=10,
                    application_name='krishisaathi',
                    **self.db_config
                )
        except Exception as e:
            logging.error(f"Database connection failed: {e}")
            raise
    
    def init_db(self):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logging.info(f"Database init attempt {attempt + 1}")
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
                cursor.close()
                conn.close()
                logging.info("Database initialized successfully")
                return
            except Exception as e:
                logging.error(f"Database init attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logging.error("All database init attempts failed")
                    raise
                import time
                time.sleep(2)
    
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username, email, password, language='en'):
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, language) VALUES (%s, %s, %s, %s)",
                (username, email, self.hash_password(password), language)
            )
            conn.commit()
            return True
        except psycopg2.IntegrityError as e:
            logging.warning(f"User creation failed - duplicate: {e}")
            return False
        except Exception as e:
            logging.error(f"User creation failed: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    def verify_user(self, username, password):
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, email, language FROM users WHERE username = %s AND password_hash = %s",
                (username, self.hash_password(password))
            )
            user = cursor.fetchone()
            return user
        except Exception as e:
            logging.error(f"User verification failed: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    def update_language(self, username, language):
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET language = %s WHERE username = %s",
                (language, username)
            )
            conn.commit()
        except Exception as e:
            logging.error(f"Language update failed: {e}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()