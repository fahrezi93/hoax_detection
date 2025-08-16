#!/usr/bin/env python3
"""
Script sederhana untuk download model dari Hugging Face Hub saat deployment
"""

import os
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_model():
    """Setup model files dari Hugging Face Hub"""
    
    # Check if running in production (Railway)
    is_production = os.getenv('RAILWAY_ENVIRONMENT') is not None
    
    if not is_production:
        logger.info("Running in development mode, skipping model download")
        return
    
    try:
        # Install huggingface_hub jika belum ada
        import huggingface_hub
        from huggingface_hub import snapshot_download
        
        # Konfigurasi HF Hub
        HF_REPO_ID = "fahrezi93/hoax-news-detection-model"  # Ganti dengan repo ID Anda
        
        logger.info(f"Downloading model from Hugging Face Hub: {HF_REPO_ID}")
        
        # Download dari HF Hub
        snapshot_download(
            repo_id=HF_REPO_ID,
            local_dir=".",
            local_dir_use_symlinks=False
        )
        
        logger.info("✅ Model successfully downloaded from Hugging Face Hub")
        
    except ImportError:
        logger.error("huggingface_hub not installed, skipping download")
    except Exception as e:
        logger.error(f"Failed to download from HF Hub: {e}")
        logger.info("Falling back to local files if available")

if __name__ == "__main__":
    setup_model() 