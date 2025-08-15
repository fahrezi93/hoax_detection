import sqlite3
import logging
import json
from datetime import datetime
from typing import List, Dict, Optional
import os

logger = logging.getLogger(__name__)

class Database:
    """Simple SQLite database for storing predictions and feedback"""
    
    def __init__(self, db_path: str = None):
        """
        Initialize database connection
        
        Args:
            db_path: Path to SQLite database file
        """
        if not db_path:
            db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hoax_detection.db')
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create predictions table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS predictions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        request_id TEXT UNIQUE NOT NULL,
                        input_text TEXT NOT NULL,
                        predicted_label TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        processing_time REAL NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create feedback table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS feedback (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        text TEXT NOT NULL,
                        predicted_label TEXT NOT NULL,
                        user_label TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create indexes for better performance
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp)')
                
                conn.commit()
                logger.info("Database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def store_prediction(self, request_id: str, input_text: str, predicted_label: str, 
                        confidence: float, processing_time: float) -> bool:
        """
        Store a prediction result
        
        Args:
            request_id: Unique request identifier
            input_text: Input text that was analyzed
            predicted_label: Predicted label
            confidence: Confidence score
            processing_time: Time taken for processing
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT OR REPLACE INTO predictions 
                    (request_id, input_text, predicted_label, confidence, processing_time)
                    VALUES (?, ?, ?, ?, ?)
                ''', (request_id, input_text, predicted_label, confidence, processing_time))
                
                conn.commit()
                logger.info(f"Stored prediction for request {request_id}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to store prediction: {e}")
            return False
    
    def store_feedback(self, text: str, predicted_label: str, user_label: str) -> Optional[int]:
        """
        Store user feedback
        
        Args:
            text: Text that was analyzed
            predicted_label: Label predicted by the system
            user_label: Label provided by the user
            
        Returns:
            Feedback ID if successful, None otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO feedback (text, predicted_label, user_label)
                    VALUES (?, ?, ?)
                ''', (text, predicted_label, user_label))
                
                feedback_id = cursor.lastrowid
                conn.commit()
                
                logger.info(f"Stored feedback with ID {feedback_id}")
                return feedback_id
                
        except Exception as e:
            logger.error(f"Failed to store feedback: {e}")
            return None
    
    def get_prediction_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        Get prediction history
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of prediction records
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT request_id, input_text, predicted_label, confidence, 
                           processing_time, timestamp
                    FROM predictions
                    ORDER BY timestamp DESC
                    LIMIT ? OFFSET ?
                ''', (limit, offset))
                
                rows = cursor.fetchall()
                
                history = []
                for row in rows:
                    history.append({
                        'request_id': row[0],
                        'input_text': row[1][:100] + '...' if len(row[1]) > 100 else row[1],
                        'predicted_label': row[2],
                        'confidence': row[3],
                        'processing_time': row[4],
                        'timestamp': row[5]
                    })
                
                return history
                
        except Exception as e:
            logger.error(f"Failed to get prediction history: {e}")
            return []
    
    def get_feedback_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        Get feedback history
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of feedback records
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT id, text, predicted_label, user_label, timestamp
                    FROM feedback
                    ORDER BY timestamp DESC
                    LIMIT ? OFFSET ?
                ''', (limit, offset))
                
                rows = cursor.fetchall()
                
                history = []
                for row in rows:
                    history.append({
                        'id': row[0],
                        'text': row[1][:100] + '...' if len(row[1]) > 100 else row[1],
                        'predicted_label': row[2],
                        'user_label': row[3],
                        'timestamp': row[4]
                    })
                
                return history
                
        except Exception as e:
            logger.error(f"Failed to get feedback history: {e}")
            return []
    
    def get_statistics(self) -> Dict:
        """
        Get database statistics
        
        Returns:
            Dictionary with statistics
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get prediction counts by label
                cursor.execute('''
                    SELECT predicted_label, COUNT(*) as count
                    FROM predictions
                    GROUP BY predicted_label
                ''')
                
                label_counts = dict(cursor.fetchall())
                
                # Get total predictions
                cursor.execute('SELECT COUNT(*) FROM predictions')
                total_predictions = cursor.fetchone()[0]
                
                # Get total feedback
                cursor.execute('SELECT COUNT(*) FROM feedback')
                total_feedback = cursor.fetchone()[0]
                
                # Get average confidence
                cursor.execute('SELECT AVG(confidence) FROM predictions')
                avg_confidence = cursor.fetchone()[0] or 0
                
                # Get average processing time
                cursor.execute('SELECT AVG(processing_time) FROM predictions')
                avg_processing_time = cursor.fetchone()[0] or 0
                
                return {
                    'total_predictions': total_predictions,
                    'total_feedback': total_feedback,
                    'label_counts': label_counts,
                    'average_confidence': round(avg_confidence, 3),
                    'average_processing_time': round(avg_processing_time, 3)
                }
                
        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}
    
    def cleanup_old_records(self, days: int = 30) -> int:
        """
        Clean up old records
        
        Args:
            days: Number of days to keep records for
            
        Returns:
            Number of records deleted
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Delete old predictions
                cursor.execute('''
                    DELETE FROM predictions 
                    WHERE timestamp < datetime('now', '-{} days')
                '''.format(days))
                
                deleted_predictions = cursor.rowcount
                
                # Delete old feedback
                cursor.execute('''
                    DELETE FROM feedback 
                    WHERE timestamp < datetime('now', '-{} days')
                '''.format(days))
                
                deleted_feedback = cursor.rowcount
                
                conn.commit()
                
                total_deleted = deleted_predictions + deleted_feedback
                logger.info(f"Cleaned up {total_deleted} old records")
                
                return total_deleted
                
        except Exception as e:
            logger.error(f"Failed to cleanup old records: {e}")
            return 0 