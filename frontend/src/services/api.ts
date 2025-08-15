import axios from 'axios'
import { PredictionData, HistoryItem, FeedbackData } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Permintaan tidak valid')
        case 401:
          throw new Error('Tidak memiliki akses')
        case 403:
          throw new Error('Akses ditolak')
        case 404:
          throw new Error('Endpoint tidak ditemukan')
        case 429:
          throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.')
        case 500:
          throw new Error('Kesalahan server internal')
        default:
          throw new Error(data.error || 'Terjadi kesalahan')
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Tidak dapat terhubung ke server')
    } else {
      // Something else happened
      throw new Error('Terjadi kesalahan yang tidak diketahui')
    }
  }
)

export const hoaxDetectionApi = {
  // Predict hoax/factual classification
  predict: async (data: { text?: string; url?: string }): Promise<PredictionData> => {
    const response = await api.post('/api/predict', data)
    return response.data
  },

  // Submit feedback
  submitFeedback: async (feedback: FeedbackData): Promise<{ message: string; feedback_id: number }> => {
    const response = await api.post('/api/feedback', feedback)
    return response.data
  },

  // Get prediction history
  getHistory: async (limit: number = 50): Promise<{ history: HistoryItem[]; total: number }> => {
    const response = await api.get(`/api/history?limit=${limit}`)
    return response.data
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string; components: any }> => {
    const response = await api.get('/api/health')
    return response.data
  },

  // Batch prediction (CSV upload)
  batchPredict: async (file: File): Promise<{ message: string; results: any[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export default api 