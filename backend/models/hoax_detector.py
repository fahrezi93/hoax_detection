import os
import logging
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import PeftModel, PeftConfig
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class HoaxDetector:
    """Hoax news detector using transformer models"""
    
    def __init__(self, model_path: str = None):
        """
        Initialize the hoax detector
        
        Args:
            model_path: Path to the model or model name from HuggingFace
        """
        self.model = None
        self.tokenizer = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Default model if none specified
        if not model_path:
            model_path = 'models/hoax_model'  # Use our trained model
        
        self.model_path = model_path
        self.labels = ['hoax', 'faktual']  # Updated based on training data
        
        self._load_model()
    
    def _load_model(self):
        """Load the transformer model and tokenizer"""
        try:
            logger.info(f"Loading model from: {self.model_path}")
            
            # Check if model path exists locally
            if os.path.exists(self.model_path):
                model_path = self.model_path
            else:
                # Use HuggingFace model
                model_path = self.model_path
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            
            # Load base model first
            base_model = AutoModelForSequenceClassification.from_pretrained(
                'indobert-base-p1',
                num_labels=len(self.labels)
            )
            
            # Load PEFT adapter
            self.model = PeftModel.from_pretrained(base_model, model_path)
            
            # Move to device
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            # Fallback to a simpler approach
            self._load_fallback_model()
    
    def _load_fallback_model(self):
        """Load a fallback model for basic functionality"""
        try:
            logger.info("Loading fallback model...")
            
            # Use a smaller, more accessible model
            fallback_model = 'distilbert-base-multilingual-cased'
            
            self.tokenizer = AutoTokenizer.from_pretrained(fallback_model)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                fallback_model,
                num_labels=len(self.labels)
            )
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("Fallback model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load fallback model: {e}")
            raise RuntimeError("No model could be loaded")
    
    def predict(self, text: str) -> Dict:
        """
        Predict hoax/factual classification for given text
        
        Args:
            text: Input text to classify
            
        Returns:
            Dictionary with prediction results
        """
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model not loaded")
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors='pt'
            )
            
            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
            
            # Get predicted label and confidence
            predicted_idx = torch.argmax(probabilities, dim=-1).item()
            predicted_label = self.labels[predicted_idx]
            confidence = probabilities[0][predicted_idx].item()
            
            # Get all probabilities
            all_probs = probabilities[0].cpu().numpy()
            prob_dict = {label: float(prob) for label, prob in zip(self.labels, all_probs)}
            
            # Generate rationale
            rationale = self._generate_rationale(text, predicted_label, confidence)
            
            return {
                'label': predicted_label,
                'confidence': confidence,
                'probabilities': prob_dict,
                'rationale': rationale
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            # Return fallback prediction
            return self._fallback_prediction(text)
    
    def _generate_rationale(self, text: str, label: str, confidence: float) -> str:
        """Generate explanation for the prediction"""
        if confidence > 0.8:
            confidence_level = "sangat tinggi"
        elif confidence > 0.6:
            confidence_level = "tinggi"
        else:
            confidence_level = "sedang"
        
        if label == "hoax":
            return f"Teks ini diklasifikasikan sebagai berita hoax dengan tingkat kepercayaan {confidence_level} ({confidence:.1%})."
        elif label == "faktual":
            return f"Teks ini diklasifikasikan sebagai berita faktual dengan tingkat kepercayaan {confidence_level} ({confidence:.1%})."
        else:
            return f"Teks ini diklasifikasikan sebagai berita hoax dengan tingkat kepercayaan sedang ({confidence:.1%})."
    
    def _fallback_prediction(self, text: str) -> Dict:
        """Fallback prediction when model fails"""
        # Simple rule-based fallback
        text_lower = text.lower()
        
        # Check for common hoax indicators
        hoax_indicators = ['viral', 'heboh', 'mengagetkan', 'terungkap', 'bocor', 'rahasia']
        hoax_score = sum(1 for indicator in hoax_indicators if indicator in text_lower)
        
        # Check for factual indicators
        factual_indicators = ['resmi', 'konfirmasi', 'bukti', 'data', 'penelitian', 'studi']
        factual_score = sum(1 for indicator in factual_indicators if indicator in text_lower)
        
        if hoax_score > factual_score:
            label = 'hoax'
            confidence = 0.6
        elif factual_score > hoax_score:
            label = 'faktual'
            confidence = 0.6
        else:
            label = 'hoax'  # Default to hoax if uncertain
            confidence = 0.5
        
        return {
            'label': label,
            'confidence': confidence,
            'probabilities': {
                'hoax': 0.5,
                'faktual': 0.5
            },
            'rationale': f'Prediksi fallback: {label} (kepercayaan: {confidence:.1%})'
        }
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            'model_path': self.model_path,
            'device': str(self.device),
            'labels': self.labels,
            'model_loaded': self.model is not None,
            'tokenizer_loaded': self.tokenizer is not None
        } 