import re
import logging
from typing import List, Optional
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class TextProcessor:
    """Text processing utilities for hoax detection"""
    
    def __init__(self):
        """Initialize text processor with KeyBERT for keyword extraction"""
        try:
            # Initialize sentence transformer for KeyBERT
            self.sentence_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            self.keyword_model = KeyBERT(model=self.sentence_model)
            logger.info("Text processor initialized with KeyBERT")
        except Exception as e:
            logger.warning(f"Failed to initialize KeyBERT: {e}")
            self.keyword_model = None
    
    def clean_text(self, text: str) -> str:
        """
        Clean and preprocess text
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove excessive numbers (keep single numbers)
        text = re.sub(r'\d{2,}', '', text)
        
        # Remove emojis and special characters
        text = re.sub(r'[^\w\s]', '', text)
        
        # Remove common Indonesian stop words
        stop_words = [
            'yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh',
            'sebagai', 'dalam', 'adalah', 'itu', 'ini', 'mereka', 'kami', 'kita', 'anda',
            'saya', 'dia', 'ia', 'mereka', 'kami', 'kita', 'anda', 'saya', 'dia', 'ia'
        ]
        
        words = text.split()
        words = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Join words back
        cleaned_text = ' '.join(words)
        
        return cleaned_text.strip()
    
    def extract_keywords(self, text: str, top_k: int = 5) -> List[str]:
        """
        Extract keywords from text using KeyBERT
        
        Args:
            text: Input text
            top_k: Number of keywords to extract
            
        Returns:
            List of keywords
        """
        if not text or not self.keyword_model:
            # Fallback to simple keyword extraction
            return self._fallback_keywords(text, top_k)
        
        try:
            # Extract keywords using KeyBERT
            keywords = self.keyword_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words='indonesian',
                use_maxsum=True,
                nr_candidates=top_k * 2,
                top_n=top_k
            )
            
            # Extract just the keywords (not scores)
            keyword_list = [keyword for keyword, score in keywords]
            
            # Ensure we have enough keywords
            if len(keyword_list) < top_k:
                # Fallback to get more keywords
                fallback_keywords = self._fallback_keywords(text, top_k - len(keyword_list))
                keyword_list.extend(fallback_keywords)
            
            return keyword_list[:top_k]
            
        except Exception as e:
            logger.warning(f"KeyBERT keyword extraction failed: {e}")
            return self._fallback_keywords(text, top_k)
    
    def _fallback_keywords(self, text: str, top_k: int) -> List[str]:
        """Fallback keyword extraction using simple frequency-based approach"""
        if not text:
            return []
        
        # Simple word frequency approach
        words = text.lower().split()
        
        # Remove very short words and common words
        words = [word for word in words if len(word) > 3 and word not in [
            'yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh',
            'sebagai', 'dalam', 'adalah', 'itu', 'ini', 'mereka', 'kami', 'kita', 'anda',
            'saya', 'dia', 'ia', 'akan', 'sudah', 'masih', 'belum', 'tidak', 'bukan'
        ]]
        
        # Count word frequencies
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and get top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        keywords = [word for word, freq in sorted_words[:top_k]]
        
        return keywords
    
    def get_text_stats(self, text: str) -> dict:
        """
        Get text statistics
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with text statistics
        """
        if not text:
            return {
                'length': 0,
                'word_count': 0,
                'sentence_count': 0,
                'avg_word_length': 0
            }
        
        # Basic stats
        length = len(text)
        word_count = len(text.split())
        
        # Count sentences (simple approach)
        sentences = re.split(r'[.!?]+', text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # Average word length
        words = text.split()
        if words:
            avg_word_length = sum(len(word) for word in words) / len(words)
        else:
            avg_word_length = 0
        
        return {
            'length': length,
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_word_length': round(avg_word_length, 2)
        }
    
    def highlight_keywords(self, text: str, keywords: List[str]) -> str:
        """
        Highlight keywords in text
        
        Args:
            text: Original text
            keywords: List of keywords to highlight
            
        Returns:
            Text with highlighted keywords
        """
        if not text or not keywords:
            return text
        
        highlighted_text = text
        
        for keyword in keywords:
            # Case-insensitive replacement
            pattern = re.compile(re.escape(keyword), re.IGNORECASE)
            highlighted_text = pattern.sub(f'**{keyword}**', highlighted_text)
        
        return highlighted_text 