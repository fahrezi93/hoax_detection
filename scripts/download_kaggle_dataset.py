#!/usr/bin/env python3
"""
Script untuk download dataset fake news Indonesia dari Kaggle
"""

import os
import json
import zipfile
from pathlib import Path
import subprocess
import sys

def install_kaggle():
    """Install Kaggle package jika belum ada"""
    try:
        import kaggle
        print("Kaggle package already installed")
        return True
    except ImportError:
        print("Installing Kaggle package...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle"])
            print("Kaggle package installed successfully")
            return True
        except Exception as e:
            print(f"Failed to install Kaggle package: {e}")
            return False

def setup_kaggle_credentials():
    """Setup Kaggle credentials"""
    print("Setting up Kaggle credentials...")
    
    # Cek apakah sudah ada credentials
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_config = kaggle_dir / "kaggle.json"
    
    if kaggle_config.exists():
        print("Kaggle credentials found")
        return True
    
    # Jika tidak ada, minta user input
    print("Kaggle credentials not found.")
    print("Please provide your Kaggle credentials:")
    
    username = input("Kaggle Username: ").strip()
    key = input("Kaggle API Key: ").strip()
    
    if not username or not key:
        print("Invalid credentials. Please get them from https://www.kaggle.com/settings/account")
        return False
    
    # Buat directory dan file config
    kaggle_dir.mkdir(exist_ok=True)
    
    config = {
        "username": username,
        "key": key
    }
    
    with open(kaggle_config, 'w') as f:
        json.dump(config, f)
    
    # Set permissions (untuk Linux/Mac)
    try:
        os.chmod(kaggle_config, 0o600)
    except:
        pass
    
    print("Kaggle credentials saved successfully")
    return True

def download_datasets():
    """Download dataset dari Kaggle"""
    print("Downloading datasets from Kaggle...")
    
    # Dataset yang akan di-download
    datasets = [
        "indonlp/indonli",  # Indonesian NLI dataset
        "clmentbaka/indonesian-fake-news-detection",  # Indonesian fake news
        "clmentbaka/indonesian-hoax-news-detection",  # Indonesian hoax news
    ]
    
    downloaded_datasets = []
    
    for dataset in datasets:
        try:
            print(f"Downloading {dataset}...")
            
            # Download dataset
            import kaggle
            kaggle.api.authenticate()
            kaggle.api.dataset_download_files(dataset, path="./data", unzip=True)
            
            print(f"Successfully downloaded {dataset}")
            downloaded_datasets.append(dataset)
            
        except Exception as e:
            print(f"Failed to download {dataset}: {e}")
            continue
    
    return downloaded_datasets

def list_downloaded_files():
    """List file yang sudah di-download"""
    print("\nDownloaded files:")
    
    data_dir = Path("./data")
    if not data_dir.exists():
        print("No data directory found")
        return []
    
    files = []
    for file_path in data_dir.rglob("*"):
        if file_path.is_file():
            files.append(file_path)
            print(f"  {file_path}")
    
    return files

def main():
    """Main function"""
    print("=" * 60)
    print("KAGGLE DATASET DOWNLOADER")
    print("=" * 60)
    
    # 1. Install Kaggle package
    if not install_kaggle():
        print("Failed to install Kaggle package. Exiting.")
        return
    
    # 2. Setup credentials
    if not setup_kaggle_credentials():
        print("Failed to setup Kaggle credentials. Exiting.")
        return
    
    # 3. Download datasets
    downloaded = download_datasets()
    
    if not downloaded:
        print("No datasets were downloaded successfully.")
        return
    
    print(f"\nSuccessfully downloaded {len(downloaded)} datasets:")
    for dataset in downloaded:
        print(f"  - {dataset}")
    
    # 4. List downloaded files
    files = list_downloaded_files()
    
    print(f"\nTotal files downloaded: {len(files)}")
    print("\nYou can now run the training script with:")
    print("python ../scripts/train_model.py")

if __name__ == "__main__":
    main() 