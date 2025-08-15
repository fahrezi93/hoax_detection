#!/usr/bin/env python3
"""
CLI script untuk testing inference model hoax detection
"""

import argparse
import sys
import os
import torch
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent / 'backend'))

from models.hoax_detector import HoaxDetector
from models.text_processor import TextProcessor

def main():
    parser = argparse.ArgumentParser(description='Hoax Detection CLI')
    parser.add_argument('--text', '-t', type=str, help='Text to analyze')
    parser.add_argument('--file', '-f', type=str, help='File containing text to analyze')
    parser.add_argument('--model-path', type=str, default='models/indobert-hoax-detector',
                       help='Path to the model')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if not args.text and not args.file:
        print("Error: Please provide either --text or --file argument")
        parser.print_help()
        sys.exit(1)
    
    # Load text
    if args.text:
        text = args.text
    else:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                text = f.read().strip()
        except FileNotFoundError:
            print(f"Error: File {args.file} not found")
            sys.exit(1)
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)
    
    if not text:
        print("Error: No text content found")
        sys.exit(1)
    
    print(f"Analyzing text ({len(text)} characters)...")
    if args.verbose:
        print(f"Text: {text[:200]}{'...' if len(text) > 200 else ''}")
    print()
    
    try:
        # Initialize components
        print("Initializing components...")
        text_processor = TextProcessor()
        hoax_detector = HoaxDetector(args.model_path)
        
        # Process text
        print("Processing text...")
        processed_text = text_processor.clean_text(text)
        
        if args.verbose:
            print(f"Processed text: {processed_text[:200]}{'...' if len(processed_text) > 200 else ''}")
            print()
        
        # Get prediction
        print("Running inference...")
        with torch.no_grad():
            prediction = hoax_detector.predict(processed_text)
        
        # Extract keywords
        keywords = text_processor.extract_keywords(processed_text, top_k=5)
        
        # Display results
        print("\n" + "="*50)
        print("HOAX DETECTION RESULTS")
        print("="*50)
        
        print(f"Label: {prediction['label'].upper()}")
        print(f"Confidence: {prediction['confidence']:.1%}")
        print()
        
        print("Probabilities:")
        for label, prob in prediction['probabilities'].items():
            print(f"  {label.capitalize()}: {prob:.1%}")
        print()
        
        print("Keywords:")
        for i, keyword in enumerate(keywords, 1):
            print(f"  {i}. {keyword}")
        print()
        
        if prediction.get('rationale'):
            print("Rationale:")
            print(f"  {prediction['rationale']}")
            print()
        
        # Text statistics
        stats = text_processor.get_text_stats(text)
        print("Text Statistics:")
        print(f"  Length: {stats['length']} characters")
        print(f"  Words: {stats['word_count']}")
        print(f"  Sentences: {stats['sentence_count']}")
        print(f"  Avg word length: {stats['avg_word_length']}")
        
    except Exception as e:
        print(f"Error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main() 