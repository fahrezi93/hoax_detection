import logging
import requests
from bs4 import BeautifulSoup
from readability import Document
from urllib.parse import urlparse
from typing import Optional

logger = logging.getLogger(__name__)

class ArticleScraper:
    """Article scraper for extracting text content from URLs"""
    
    def __init__(self):
        """Initialize the article scraper"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Common news domains
        self.news_domains = [
            'detik.com', 'kompas.com', 'tribunnews.com', 'liputan6.com',
            'cnnindonesia.com', 'bbc.com', 'reuters.com', 'ap.org',
            'tempo.co', 'antaranews.com', 'beritasatu.com', 'viva.co.id'
        ]
    
    def extract_text(self, url: str) -> Optional[str]:
        """
        Extract main text content from a URL
        
        Args:
            url: URL to extract text from
            
        Returns:
            Extracted text or None if failed
        """
        try:
            logger.info(f"Extracting text from: {url}")
            
            # Validate URL
            if not self._is_valid_url(url):
                raise ValueError("Invalid URL format")
            
            # Fetch content
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type:
                raise ValueError(f"Unsupported content type: {content_type}")
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try readability-lxml first
            try:
                doc = Document(response.content)
                text = doc.summary()
                
                # Clean HTML tags
                soup_text = BeautifulSoup(text, 'html.parser')
                clean_text = soup_text.get_text(separator=' ', strip=True)
                
                if len(clean_text) > 100:  # Ensure we got meaningful content
                    logger.info(f"Successfully extracted {len(clean_text)} characters using readability")
                    return self._clean_extracted_text(clean_text)
                    
            except Exception as e:
                logger.warning(f"Readability extraction failed: {e}")
            
            # Fallback to manual extraction
            return self._manual_extraction(soup)
            
        except Exception as e:
            logger.error(f"Failed to extract text from {url}: {e}")
            return None
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    def _manual_extraction(self, soup: BeautifulSoup) -> Optional[str]:
        """Manual extraction when readability fails"""
        try:
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
                script.decompose()
            
            # Try to find main content area
            content_selectors = [
                'article',
                '[role="main"]',
                '.content',
                '.article-content',
                '.post-content',
                '.entry-content',
                'main',
                '.main-content'
            ]
            
            content = None
            for selector in content_selectors:
                content = soup.select_one(selector)
                if content:
                    break
            
            if not content:
                # Fallback to body
                content = soup.body
            
            if content:
                text = content.get_text(separator=' ', strip=True)
                return self._clean_extracted_text(text)
            
            return None
            
        except Exception as e:
            logger.error(f"Manual extraction failed: {e}")
            return None
    
    def _clean_extracted_text(self, text: str) -> str:
        """Clean and format extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        import re
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common web artifacts
        text = re.sub(r'Share|Tweet|Like|Comment|Follow|Subscribe', '', text, flags=re.IGNORECASE)
        
        # Remove very short lines (likely navigation/menu items)
        lines = text.split('\n')
        lines = [line.strip() for line in lines if len(line.strip()) > 20]
        
        # Join lines back
        clean_text = ' '.join(lines)
        
        # Final cleanup
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        return clean_text
    
    def get_article_info(self, url: str) -> dict:
        """
        Get basic article information
        
        Args:
            url: URL to analyze
            
        Returns:
            Dictionary with article info
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ""
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else ""
            
            # Extract meta keywords
            meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
            keywords = meta_keywords.get('content', '') if meta_keywords else ""
            
            # Extract author
            author = ""
            author_selectors = [
                'meta[name="author"]',
                '.author',
                '.byline',
                '[rel="author"]'
            ]
            
            for selector in author_selectors:
                author_elem = soup.select_one(selector)
                if author_elem:
                    if selector.startswith('meta'):
                        author = author_elem.get('content', '')
                    else:
                        author = author_elem.get_text().strip()
                    break
            
            return {
                'url': url,
                'title': title_text,
                'description': description,
                'keywords': keywords,
                'author': author,
                'domain': urlparse(url).netloc
            }
            
        except Exception as e:
            logger.error(f"Failed to get article info from {url}: {e}")
            return {
                'url': url,
                'error': str(e)
            }
    
    def is_news_domain(self, url: str) -> bool:
        """Check if URL is from a known news domain"""
        try:
            domain = urlparse(url).netloc.lower()
            return any(news_domain in domain for news_domain in self.news_domains)
        except:
            return False 