import os
import logging
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import torch
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from models.hoax_detector import HoaxDetector
from models.text_processor import TextProcessor
from utils.scraper import ArticleScraper
from utils.database import Database

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Configure CORS
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', '*').split(','))

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize components
hoax_detector = None
text_processor = None
article_scraper = None
database = None

def initialize_components():
    """Initialize all components on startup"""
    global hoax_detector, text_processor, article_scraper, database
    
    try:
        logger.info("Initializing components...")
        
        # Initialize text processor
        text_processor = TextProcessor()
        logger.info("Text processor initialized")
        
        # Initialize hoax detector
        model_path = os.getenv('MODEL_PATH', 'models/hoax_model')
        hoax_detector = HoaxDetector(model_path)
        logger.info("Hoax detector initialized")
        
        # Initialize article scraper
        article_scraper = ArticleScraper()
        logger.info("Article scraper initialized")
        
        # Initialize database
        database = Database()
        logger.info("Database initialized")
        
        logger.info("All components initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize components: {e}")
        raise

# Initialize components on startup
initialize_components()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'components': {
            'hoax_detector': hoax_detector is not None,
            'text_processor': text_processor is not None,
            'article_scraper': article_scraper is not None,
            'database': database is not None
        }
    })

@app.route('/api/predict', methods=['POST'])
@limiter.limit("10 per minute")
def predict():
    """Predict hoax/factual classification for text or URL"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        text = data.get('text', '').strip()
        url = data.get('url', '').strip()
        
        if not text and not url:
            return jsonify({'error': 'Either text or URL must be provided'}), 400
        
        # Extract text from URL if provided
        if url:
            try:
                extracted_text = article_scraper.extract_text(url)
                if not extracted_text:
                    return jsonify({'error': 'Failed to extract text from URL'}), 400
                text = extracted_text
            except Exception as e:
                logger.error(f"URL scraping failed: {e}")
                return jsonify({'error': f'Failed to extract text from URL: {str(e)}'}), 400
        
        # Validate text length
        if len(text) > 4096:
            return jsonify({'error': 'Text too long. Maximum 4096 characters allowed.'}), 400
        
        if len(text) < 10:
            return jsonify({'error': 'Text too short. Minimum 10 characters required.'}), 400
        
        # Process text
        processed_text = text_processor.clean_text(text)
        
        # Get prediction
        with torch.no_grad():
            prediction = hoax_detector.predict(processed_text)
        
        # Extract keywords
        keywords = text_processor.extract_keywords(processed_text, top_k=5)
        
        # Prepare response
        response = {
            'request_id': request_id,
            'input_text': text[:200] + '...' if len(text) > 200 else text,
            'processed_text': processed_text[:200] + '...' if len(processed_text) > 200 else processed_text,
                         'prediction': {
                 'label': prediction['label'],
                 'confidence': float(prediction['confidence']),
                 'probabilities': {
                     'hoax': float(prediction['probabilities']['hoax']),
                     'faktual': float(prediction['probabilities']['faktual'])
                 }
             },
            'keywords': keywords,
            'rationale': prediction.get('rationale', ''),
            'processing_time': round(time.time() - start_time, 3)
        }
        
        # Log request
        logger.info(f"Request {request_id} completed in {response['processing_time']}s")
        
        # Store in database
        if database:
            database.store_prediction(
                request_id=request_id,
                input_text=text,
                predicted_label=prediction['label'],
                confidence=prediction['confidence'],
                processing_time=response['processing_time']
            )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Request {request_id} failed: {e}")
        return jsonify({
            'error': 'Internal server error',
            'request_id': request_id,
            'processing_time': round(time.time() - start_time, 3)
        }), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit user feedback for predictions"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        text = data.get('text', '').strip()
        predicted_label = data.get('predicted_label', '').strip()
        user_label = data.get('user_label', '').strip()
        
        if not all([text, predicted_label, user_label]):
            return jsonify({'error': 'text, predicted_label, and user_label are required'}), 400
        
        # Store feedback in database
        if database:
            feedback_id = database.store_feedback(
                text=text,
                predicted_label=predicted_label,
                user_label=user_label
            )
            return jsonify({
                'message': 'Feedback submitted successfully',
                'feedback_id': feedback_id
            })
        else:
            return jsonify({'message': 'Feedback submitted successfully (database not available)'})
            
    except Exception as e:
        logger.error(f"Feedback submission failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/batch', methods=['POST'])
def batch_predict():
    """Batch prediction from CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are supported'}), 400
        
        # Read CSV
        df = pd.read_csv(file)
        if 'text' not in df.columns:
            return jsonify({'error': 'CSV must contain a "text" column'}), 400
        
        results = []
        for idx, row in df.iterrows():
            try:
                text = str(row['text']).strip()
                if len(text) < 10 or len(text) > 4096:
                    results.append({
                        'row': idx + 1,
                        'text': text[:100] + '...' if len(text) > 100 else text,
                        'error': 'Text length invalid (10-4096 characters)'
                    })
                    continue
                
                # Process and predict
                processed_text = text_processor.clean_text(text)
                with torch.no_grad():
                    prediction = hoax_detector.predict(processed_text)
                
                keywords = text_processor.extract_keywords(processed_text, top_k=3)
                
                results.append({
                    'row': idx + 1,
                    'text': text[:100] + '...' if len(text) > 100 else text,
                    'prediction': {
                        'label': prediction['label'],
                        'confidence': float(prediction['confidence'])
                    },
                    'keywords': keywords
                })
                
            except Exception as e:
                results.append({
                    'row': idx + 1,
                    'text': str(row['text'])[:100] + '...',
                    'error': str(e)
                })
        
        return jsonify({
            'message': f'Processed {len(df)} rows',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get prediction history"""
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        
        if database:
            history = database.get_prediction_history(limit=limit)
            return jsonify({
                'history': history,
                'total': len(history)
            })
        else:
            return jsonify({
                'history': [],
                'total': 0,
                'message': 'Database not available'
            })
            
    except Exception as e:
        logger.error(f"History retrieval failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong. Please try again later.'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    if debug:
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        app.run(host='0.0.0.0', port=port) 