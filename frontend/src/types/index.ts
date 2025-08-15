export interface PredictionData {
  request_id: string
  input_text: string
  processed_text: string
  prediction: {
    label: 'hoax' | 'faktual'
    confidence: number
    probabilities: {
      hoax: number
      faktual: number
    }
  }
  keywords: string[]
  rationale: string
  processing_time: number
}

export interface HistoryItem {
  request_id: string
  input_text: string
  predicted_label: string
  confidence: number
  processing_time: number
  timestamp: string
}

export interface FeedbackData {
  text: string
  predicted_label: string
  user_label: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
} 