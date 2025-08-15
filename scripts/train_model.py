#!/usr/bin/env python3
"""
Script untuk training model fake news detection bahasa Indonesia
Menggunakan dataset real dari sample_news.csv
"""

import os
import json
import torch
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    TrainingArguments, 
    Trainer,
    DataCollatorWithPadding
)
from datasets import Dataset
import matplotlib.pyplot as plt

# Set random seed untuk reproducibility
torch.manual_seed(42)
np.random.seed(42)

def load_real_dataset():
    """Load dataset real dari sample_news.csv"""
    print("Loading real dataset from sample_news.csv...")
    
    try:
        # Load CSV file - fix path untuk scripts directory
        csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_news.csv")
        df = pd.read_csv(csv_path)
        
        print(f"Dataset loaded successfully!")
        print(f"Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Tampilkan beberapa contoh
        print(f"\nSample data:")
        print(f"Total samples: {len(df)}")
        print(f"Label distribution:")
        print(df['label'].value_counts())
        
        # Tampilkan contoh berita
        print(f"\nSample factual news:")
        factual_sample = df[df['label'] == 'faktual'].iloc[0]
        print(f"Title: {factual_sample['title']}")
        print(f"Text: {factual_sample['article_text'][:100]}...")
        
        print(f"\nSample hoax news:")
        hoax_sample = df[df['label'] == 'hoaks'].iloc[0]
        print(f"Title: {hoax_sample['title']}")
        print(f"Text: {hoax_sample['article_text'][:100]}...")
        
        return df
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print(f"Tried to load from: {csv_path}")
        return None

def clean_text(text):
    """Fungsi untuk membersihkan teks"""
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    import re
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    
    # Remove excessive numbers
    text = re.sub(r'\d+', ' ', text)
    
    # Remove emojis
    text = re.sub(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]+', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def preprocess_data(df):
    """Preprocess data"""
    print("Preprocessing data...")
    
    # Clean text
    df['article_text'] = df['article_text'].apply(clean_text)
    
    # Filter teks yang terlalu pendek
    df = df[df['article_text'].str.len() > 20]
    
    # Map labels
    df['label'] = df['label'].map({
        'hoaks': 0,      # Hoax/Fake
        'faktual': 1     # Factual/True
    })
    
    print(f"After preprocessing:")
    print(f"Total samples: {len(df)}")
    print(f"Label distribution:")
    print(f"Hoax (0): {(df['label'] == 0).sum()}")
    print(f"Factual (1): {(df['label'] == 1).sum()}")
    
    # Split data
    train_df, val_df = train_test_split(
        df, 
        test_size=0.2, 
        random_state=42, 
        stratify=df['label']
    )
    
    print(f"Training samples: {len(train_df)}")
    print(f"Validation samples: {len(val_df)}")
    
    return train_df, val_df

def load_model_and_tokenizer():
    """Load model dan tokenizer"""
    print("Loading model and tokenizer...")
    
    # Pilih model yang akan digunakan
    MODEL_NAME = "indobert-base-p1"  # Model Indonesia yang sudah pre-trained
    FALLBACK_MODEL = "xlm-roberta-base"  # Fallback jika IndoBERT tidak tersedia
    
    try:
        # Coba load IndoBERT
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME, 
            num_labels=2,  # Binary classification: Hoax vs Factual
            problem_type="single_label_classification"
        )
        print(f"Successfully loaded {MODEL_NAME}")
        return model, tokenizer, MODEL_NAME
    except Exception as e:
        print(f"Failed to load {MODEL_NAME}: {e}")
        print(f"Falling back to {FALLBACK_MODEL}")
        
        # Fallback ke XLM-RoBERTa
        MODEL_NAME = FALLBACK_MODEL
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME, 
            num_labels=2,
            problem_type="single_label_classification"
        )
        print(f"Successfully loaded {MODEL_NAME}")
        return model, tokenizer, MODEL_NAME

def prepare_datasets(train_df, val_df, tokenizer):
    """Prepare datasets untuk training"""
    print("Preparing datasets...")
    
    # Convert ke HuggingFace Dataset format
    train_dataset = Dataset.from_pandas(train_df)
    val_dataset = Dataset.from_pandas(val_df)
    
    # Fungsi untuk tokenize teks
    def tokenize_function(examples):
        return tokenizer(
            examples['article_text'],  # Gunakan kolom article_text
            padding='max_length',
            truncation=True,
            max_length=512,  # Maksimum length untuk BERT
            return_tensors=None
        )
    
    # Tokenize datasets
    tokenized_train = train_dataset.map(tokenize_function, batched=True)
    tokenized_val = val_dataset.map(tokenize_function, batched=True)
    
    print(f"Tokenized training samples: {len(tokenized_train)}")
    print(f"Tokenized validation samples: {len(tokenized_val)}")
    
    return tokenized_train, tokenized_val

def setup_training(model, tokenized_train, tokenized_val, tokenizer):
    """Setup training configuration"""
    print("Setting up training configuration...")
    
    # Training arguments - dioptimasi untuk dataset yang lebih besar
    training_args = TrainingArguments(
        output_dir="./models/hoax-detection-model",
        num_train_epochs=5,  # Jumlah epoch untuk training
        per_device_train_batch_size=8,  # Batch size untuk training
        per_device_eval_batch_size=8,   # Batch size untuk evaluation
        warmup_steps=100,               # Warmup steps untuk learning rate
        weight_decay=0.01,              # Weight decay untuk regularization
        logging_dir="./logs",           # Directory untuk logging
        logging_steps=20,               # Log setiap 20 steps
        evaluation_strategy="epoch",    # Evaluate setiap epoch
        save_strategy="epoch",          # Save model setiap epoch
        save_total_limit=3,             # Simpan 3 checkpoint terbaik
        load_best_model_at_end=True,    # Load model terbaik di akhir
        metric_for_best_model="f1",     # Metric untuk menentukan model terbaik
        greater_is_better=True,         # F1 score lebih tinggi lebih baik
        report_to=None,                 # Tidak menggunakan Weights & Biases
        dataloader_num_workers=0,       # Untuk Windows compatibility
        learning_rate=2e-5,             # Learning rate yang optimal untuk fine-tuning
        gradient_accumulation_steps=2,  # Accumulate gradients untuk batch size yang lebih besar
    )
    
    # Fungsi untuk compute metrics
    def compute_metrics(pred):
        labels = pred.label_ids
        preds = pred.predictions.argmax(-1)
        
        # Calculate metrics
        precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='weighted')
        acc = accuracy_score(labels, preds)
        
        return {
            'accuracy': acc,
            'f1': f1,
            'precision': precision,
            'recall': recall
        }
    
    # Data collator untuk padding
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_val,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    
    return trainer

def train_model(trainer):
    """Train model"""
    print("Starting model training...")
    print("This may take several minutes depending on your hardware and dataset size.")
    
    # Start training
    trainer.train()
    
    print("Training completed!")
    return trainer

def evaluate_model(trainer, tokenized_val):
    """Evaluate model"""
    print("Evaluating model...")
    
    # Evaluate model
    eval_results = trainer.evaluate()
    
    print("\nEvaluation Results:")
    for key, value in eval_results.items():
        if key.startswith('eval_'):
            metric_name = key.replace('eval_', '')
            print(f"{metric_name}: {value:.4f}")
    
    # Predict on validation set
    print("\nMaking predictions on validation set...")
    predictions = trainer.predict(tokenized_val)
    
    # Get prediction metrics
    from sklearn.metrics import classification_report
    y_true = predictions.label_ids
    y_pred = predictions.predictions.argmax(-1)
    
    print("\nDetailed Classification Report:")
    print(classification_report(y_true, y_pred, target_names=['Hoax', 'Factual']))
    
    return predictions

def save_model(trainer, tokenizer, model_name):
    """Save model dan tokenizer"""
    print("Saving model and tokenizer...")
    
    # Buat directory jika belum ada
    os.makedirs("./models", exist_ok=True)
    
    model_path = f"./models/hoax-detection-model-{model_name.replace('/', '-')}"
    
    # Save model
    trainer.save_model(model_path)
    tokenizer.save_pretrained(model_path)
    
    print(f"Model saved to: {model_path}")
    return model_path

def test_inference(model_path, tokenizer):
    """Test inference dengan model yang sudah di-training"""
    print("\nTesting inference...")
    
    # Load saved model
    loaded_model = AutoModelForSequenceClassification.from_pretrained(model_path)
    loaded_tokenizer = AutoTokenizer.from_pretrained(model_path)
    
    # Test texts dari dataset real
    test_texts = [
        "Presiden Indonesia mengumumkan kebijakan baru untuk ekonomi nasional",  # Factual
        "Vaksin COVID-19 menyebabkan autisme pada anak",                      # Hoax
        "Bank Indonesia menaikkan suku bunga acuan menjadi 6.25%",            # Factual
        "Alien mendarat di Monas dan bertemu dengan Presiden",                # Hoax
        "Gempa bumi berkekuatan 6.2 SR terjadi di Jawa Barat",               # Factual
        "Minum air garam bisa menyembuhkan semua penyakit"                    # Hoax
    ]
    
    # Predict
    loaded_model.eval()
    with torch.no_grad():
        for text in test_texts:
            # Tokenize
            inputs = loaded_tokenizer(
                text, 
                return_tensors="pt", 
                padding=True, 
                truncation=True, 
                max_length=512
            )
            
            # Predict
            outputs = loaded_model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
            predicted_class = torch.argmax(probabilities, dim=-1).item()
            confidence = probabilities[0][predicted_class].item()
            
            label = "Factual" if predicted_class == 1 else "Hoax"
            print(f"Text: {text[:60]}...")
            print(f"Prediction: {label} (Confidence: {confidence:.3f})")
            print(f"Hoax prob: {probabilities[0][0]:.3f}, Factual prob: {probabilities[0][1]:.3f}")
            print("-" * 80)

def main():
    """Main function"""
    print("=" * 80)
    print("FAKE NEWS DETECTION MODEL TRAINING WITH REAL DATASET")
    print("=" * 80)
    
    # Check CUDA availability
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA device: {torch.cuda.get_device_name(0)}")
    
    try:
        # 1. Load dataset real
        df = load_real_dataset()
        if df is None:
            print("Failed to load dataset. Exiting.")
            return
        
        # 2. Preprocess data
        train_df, val_df = preprocess_data(df)
        
        # 3. Load model dan tokenizer
        model, tokenizer, model_name = load_model_and_tokenizer()
        
        # 4. Prepare datasets
        tokenized_train, tokenized_val = prepare_datasets(train_df, val_df, tokenizer)
        
        # 5. Setup training
        trainer = setup_training(model, tokenized_train, tokenized_val, tokenizer)
        
        # 6. Train model
        trainer = train_model(trainer)
        
        # 7. Evaluate model
        predictions = evaluate_model(trainer, tokenized_val)
        
        # 8. Save model
        model_path = save_model(trainer, tokenizer, model_name)
        
        # 9. Test inference
        test_inference(model_path, tokenizer)
        
        print("\n" + "=" * 80)
        print("MODEL TRAINING COMPLETED SUCCESSFULLY!")
        print(f"Model saved to: {model_path}")
        print("You can now use this model in your Flask backend!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\nError during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 