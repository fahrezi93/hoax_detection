import { hoaxDetectionApi } from './api'
import { geminiBackupService } from './geminiBackup'
import { connectivityMonitor } from './connectivity'
import { localHistoryService } from './localHistory'
import { PredictionData } from '../types'

export interface EnhancedPredictionData extends PredictionData {
  source?: 'backend' | 'gemini_backup'
  backup_used?: boolean
}

class EnhancedApiService {
  public async predict(data: { text?: string; url?: string }): Promise<EnhancedPredictionData> {
    const status = connectivityMonitor.getStatus()
    
    // Try backend first if connected
    if (status.isConnected) {
      try {
        const result = await hoaxDetectionApi.predict(data)
        const enhancedResult = {
          ...result,
          source: 'backend' as const,
          backup_used: false
        }
        
        // Save to local history
        localHistoryService.saveToHistory(enhancedResult, data.url)
        
        return enhancedResult
      } catch (error) {
        console.warn('Backend prediction failed, trying backup:', error)
        // Force connectivity check
        await connectivityMonitor.checkConnection()
      }
    }

    // Use Gemini backup if backend is unavailable
    if (geminiBackupService.isAvailable()) {
      try {
        const text = data.text || ''
        if (!text) {
          throw new Error('Text is required for Gemini backup prediction')
        }

        const geminiResult = await geminiBackupService.predict(text)
        
        // Convert Gemini result to match backend format
        const enhancedResult: EnhancedPredictionData = {
          request_id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          input_text: text.length > 200 ? text.substring(0, 200) + '...' : text,
          processed_text: text.length > 200 ? text.substring(0, 200) + '...' : text,
          prediction: {
            label: geminiResult.label,
            confidence: geminiResult.confidence,
            probabilities: geminiResult.probabilities
          },
          keywords: [], // Gemini doesn't provide keywords
          rationale: geminiResult.rationale,
          processing_time: 0,
          source: 'gemini_backup',
          backup_used: true
        }

        // Save to local history
        localHistoryService.saveToHistory(enhancedResult, data.url)

        return enhancedResult
      } catch (error) {
        console.error('Gemini backup also failed:', error)
        throw new Error('Baik backend maupun backup Gemini tidak tersedia. Silakan coba lagi nanti.')
      }
    }

    throw new Error('Backend tidak terhubung dan backup Gemini tidak tersedia. Silakan periksa koneksi internet dan coba lagi.')
  }

  public async submitFeedback(feedback: any): Promise<{ message: string; feedback_id?: number }> {
    const status = connectivityMonitor.getStatus()
    
    if (!status.isConnected) {
      return {
        message: 'Feedback disimpan sementara (backend tidak terhubung)'
      }
    }

    try {
      return await hoaxDetectionApi.submitFeedback(feedback)
    } catch (error) {
      console.error('Feedback submission failed:', error)
      return {
        message: 'Feedback disimpan sementara (gagal mengirim ke server)'
      }
    }
  }

  public async getHistory(limit: number = 50): Promise<{ history: any[]; total: number }> {
    const status = connectivityMonitor.getStatus()
    
    // Always try to get local history first
    const localHistory = localHistoryService.getHistoryPaginated(limit, 0)
    
    if (!status.isConnected) {
      // Return local history when backend is offline
      return {
        history: localHistory.items.map(item => ({
          id: item.id,
          timestamp: item.timestamp.toISOString(),
          input_text: item.input_text,
          predicted_label: item.prediction.label,
          confidence: item.prediction.confidence,
          processing_time: item.processing_time,
          source: item.source,
          url: item.url
        })),
        total: localHistory.total
      }
    }

    try {
      // When backend is available, merge backend and local history
      const backendHistory = await hoaxDetectionApi.getHistory(limit)
      
      // Combine and deduplicate
      const combinedHistory = [
        ...localHistory.items.map(item => ({
          id: item.id,
          timestamp: item.timestamp.toISOString(),
          input_text: item.input_text,
          predicted_label: item.prediction.label,
          confidence: item.prediction.confidence,
          processing_time: item.processing_time,
          source: item.source,
          url: item.url
        })),
        ...backendHistory.history
      ]

      // Remove duplicates and sort by timestamp
      const uniqueHistory = combinedHistory.filter((item, index, self) => 
        index === self.findIndex(h => (h as any).id === (item as any).id)
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return {
        history: uniqueHistory.slice(0, limit),
        total: uniqueHistory.length
      }
    } catch (error) {
      console.error('Backend history retrieval failed, using local only:', error)
      return {
        history: localHistory.items.map(item => ({
          id: item.id,
          timestamp: item.timestamp.toISOString(),
          input_text: item.input_text,
          predicted_label: item.prediction.label,
          confidence: item.prediction.confidence,
          processing_time: item.processing_time,
          source: item.source,
          url: item.url
        })),
        total: localHistory.total
      }
    }
  }

  public async healthCheck(): Promise<{ status: string; timestamp: string; components: any }> {
    return await hoaxDetectionApi.healthCheck()
  }

  public async batchPredict(file: File): Promise<{ message: string; results: any[] }> {
    const status = connectivityMonitor.getStatus()
    
    if (!status.isConnected) {
      throw new Error('Batch prediction memerlukan koneksi backend. Silakan coba lagi nanti.')
    }

    return await hoaxDetectionApi.batchPredict(file)
  }

  public getConnectionStatus() {
    return connectivityMonitor.getStatus()
  }

  public isBackupAvailable(): boolean {
    return geminiBackupService.isAvailable()
  }
}

export const enhancedApi = new EnhancedApiService()
