import pytest
import json
from unittest.mock import Mock, patch
from backend.app import app
from backend.models.hoax_detector import HoaxDetector
from backend.models.text_processor import TextProcessor
from backend.utils.scraper import ArticleScraper
import io

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_components():
    """Mock the components to avoid loading actual models"""
    with patch('backend.app.hoax_detector') as mock_detector, \
         patch('backend.app.text_processor') as mock_processor, \
         patch('backend.app.article_scraper') as mock_scraper, \
         patch('backend.app.database') as mock_database:
        
        # Mock hoax detector
        mock_detector.predict.return_value = {
            'label': 'hoax',
            'confidence': 0.85,
            'probabilities': {
                'hoax': 0.85,
                'faktual': 0.10,
                'tidak_pasti': 0.05
            },
            'rationale': 'Teks ini diklasifikasikan sebagai berita hoax dengan tingkat kepercayaan tinggi.'
        }
        
        # Mock text processor
        mock_processor.clean_text.return_value = 'teks yang sudah dibersihkan'
        mock_processor.extract_keywords.return_value = ['kata', 'kunci', 'penting']
        
        # Mock article scraper
        mock_scraper.extract_text.return_value = 'teks artikel yang diekstrak'
        
        # Mock database
        mock_database.store_prediction.return_value = True
        mock_database.store_feedback.return_value = 1
        
        yield {
            'detector': mock_detector,
            'processor': mock_processor,
            'scraper': mock_scraper,
            'database': mock_database
        }

class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint returns healthy status"""
        response = client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data

class TestPredictEndpoint:
    """Test prediction endpoint"""
    
    def test_predict_text_success(self, client, mock_components):
        """Test successful text prediction"""
        response = client.post('/api/predict', 
                             json={'text': 'Ini adalah teks berita untuk dianalisis'})
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'request_id' in data
        assert data['prediction']['label'] == 'hoax'
        assert data['prediction']['confidence'] == 0.85
        assert 'keywords' in data
        assert 'processing_time' in data
        
        # Verify components were called
        mock_components['processor'].clean_text.assert_called_once()
        mock_components['detector'].predict.assert_called_once()
        mock_components['processor'].extract_keywords.assert_called_once()
    
    def test_predict_url_success(self, client, mock_components):
        """Test successful URL prediction"""
        response = client.post('/api/predict', 
                             json={'url': 'https://example.com/artikel'})
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['prediction']['label'] == 'hoax'
        
        # Verify scraper was called
        mock_components['scraper'].extract_text.assert_called_once_with('https://example.com/artikel')
    
    def test_predict_no_input(self, client):
        """Test prediction with no input"""
        response = client.post('/api/predict', json={})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_predict_text_too_short(self, client):
        """Test prediction with text too short"""
        response = client.post('/api/predict', json={'text': 'abc'})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'too short' in data['error']
    
    def test_predict_text_too_long(self, client):
        """Test prediction with text too long"""
        long_text = 'a' * 5000
        response = client.post('/api/predict', json={'text': long_text})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'too long' in data['error']

class TestFeedbackEndpoint:
    """Test feedback endpoint"""
    
    def test_feedback_success(self, client, mock_components):
        """Test successful feedback submission"""
        feedback_data = {
            'text': 'Teks berita',
            'predicted_label': 'hoax',
            'user_label': 'faktual'
        }
        
        response = client.post('/api/feedback', json=feedback_data)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'message' in data
        assert 'feedback_id' in data
        
        # Verify database was called
        mock_components['database'].store_feedback.assert_called_once()
    
    def test_feedback_missing_fields(self, client):
        """Test feedback with missing fields"""
        response = client.post('/api/feedback', json={'text': 'Teks'})
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data

class TestBatchEndpoint:
    """Test batch prediction endpoint"""
    
    def test_batch_csv_success(self, client, mock_components):
        """Test successful batch CSV processing"""
        # Create a mock CSV file
        csv_content = 'text\n"Berita pertama"\n"Berita kedua"'
        
        response = client.post('/api/batch',
                             data={'file': (io.BytesIO(csv_content.encode()), 'test.csv')},
                             content_type='multipart/form-data')
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'message' in data
        assert 'results' in data
        assert len(data['results']) == 2
    
    def test_batch_no_file(self, client):
        """Test batch endpoint with no file"""
        response = client.post('/api/batch')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data

class TestHistoryEndpoint:
    """Test history endpoint"""
    
    def test_history_success(self, client, mock_components):
        """Test successful history retrieval"""
        # Mock database response
        mock_components['database'].get_prediction_history.return_value = [
            {
                'request_id': '123',
                'input_text': 'Teks berita',
                'predicted_label': 'hoax',
                'confidence': 0.85,
                'processing_time': 1.2,
                'timestamp': '2024-01-01 12:00:00'
            }
        ]
        
        response = client.get('/api/history')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'history' in data
        assert 'total' in data
        assert len(data['history']) == 1

class TestTextProcessor:
    """Test text processor functionality"""
    
    def test_clean_text(self):
        """Test text cleaning functionality"""
        processor = TextProcessor()
        
        # Test with sample text
        dirty_text = "Ini adalah TEKS dengan URL https://example.com dan angka 12345!!!"
        clean_text = processor.clean_text(dirty_text)
        
        assert 'https://example.com' not in clean_text
        assert '12345' not in clean_text
        assert '!!!' not in clean_text
        assert clean_text.islower()
    
    def test_extract_keywords(self):
        """Test keyword extraction"""
        processor = TextProcessor()
        
        text = "Ini adalah berita tentang politik dan ekonomi Indonesia"
        keywords = processor.extract_keywords(text, top_k=3)
        
        assert len(keywords) <= 3
        assert all(isinstance(k, str) for k in keywords)

class TestArticleScraper:
    """Test article scraper functionality"""
    
    def test_url_validation(self):
        """Test URL validation"""
        scraper = ArticleScraper()
        
        assert scraper._is_valid_url('https://example.com') == True
        assert scraper._is_valid_url('http://example.com') == True
        assert scraper._is_valid_url('invalid-url') == False
        assert scraper._is_valid_url('') == False

if __name__ == '__main__':
    pytest.main([__file__]) 