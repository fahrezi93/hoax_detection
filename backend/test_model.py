#!/usr/bin/env python3
"""
Test script for the hoax detection model
"""

import os
import sys
sys.path.append('.')

from models.hoax_detector import HoaxDetector

def test_model():
    """Test the model loading and prediction"""
    print("Testing Hoax Detection Model...")
    
    try:
        # Test model loading
        print("1. Loading model...")
        detector = HoaxDetector('models/hoax_model')
        print("✅ Model loaded successfully!")
        
        # Get model info
        info = detector.get_model_info()
        print(f"Model info: {info}")
        
        # Test prediction
        print("\n2. Testing prediction...")
        test_text = "Berita viral tentang penemuan obat kanker yang menghebohkan dunia medis"
        
        result = detector.predict(test_text)
        print(f"✅ Prediction successful!")
        print(f"Input text: {test_text}")
        print(f"Result: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n💥 Tests failed!")
        sys.exit(1) 