import { EnhancedPredictionData } from './enhancedApi'

export interface LocalHistoryItem {
  id: string
  timestamp: Date
  input_text: string
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
  source: 'backend' | 'gemini_backup'
  url?: string
}

class LocalHistoryService {
  private readonly STORAGE_KEY = 'hoax_detection_history'
  private readonly MAX_ITEMS = 100 // Limit untuk mencegah localStorage penuh

  public saveToHistory(prediction: EnhancedPredictionData, inputUrl?: string): void {
    try {
      const historyItem: LocalHistoryItem = {
        id: prediction.request_id,
        timestamp: new Date(),
        input_text: prediction.input_text,
        prediction: prediction.prediction,
        keywords: prediction.keywords || [],
        rationale: prediction.rationale || '',
        processing_time: prediction.processing_time || 0,
        source: prediction.source || 'backend',
        url: inputUrl
      }

      const history = this.getHistory()
      
      // Tambahkan item baru di awal array
      history.unshift(historyItem)
      
      // Batasi jumlah item
      if (history.length > this.MAX_ITEMS) {
        history.splice(this.MAX_ITEMS)
      }

      // Simpan ke localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
      
      console.log('✅ Prediction saved to local history:', historyItem.id)
    } catch (error) {
      console.error('❌ Failed to save to local history:', error)
    }
  }

  public getHistory(): LocalHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const history = JSON.parse(stored)
      
      // Convert timestamp strings back to Date objects
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    } catch (error) {
      console.error('❌ Failed to load local history:', error)
      return []
    }
  }

  public getHistoryPaginated(limit: number = 20, offset: number = 0): {
    items: LocalHistoryItem[]
    total: number
    hasMore: boolean
  } {
    const allHistory = this.getHistory()
    const items = allHistory.slice(offset, offset + limit)
    
    return {
      items,
      total: allHistory.length,
      hasMore: offset + limit < allHistory.length
    }
  }

  public deleteHistoryItem(id: string): boolean {
    try {
      const history = this.getHistory()
      const filteredHistory = history.filter(item => item.id !== id)
      
      if (filteredHistory.length === history.length) {
        return false // Item tidak ditemukan
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory))
      console.log('✅ History item deleted:', id)
      return true
    } catch (error) {
      console.error('❌ Failed to delete history item:', error)
      return false
    }
  }

  public clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('✅ Local history cleared')
    } catch (error) {
      console.error('❌ Failed to clear history:', error)
    }
  }

  public getStorageInfo(): {
    totalItems: number
    storageSize: string
    lastUpdated?: Date
  } {
    const history = this.getHistory()
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const sizeInBytes = stored ? new Blob([stored]).size : 0
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)

    return {
      totalItems: history.length,
      storageSize: `${sizeInKB} KB`,
      lastUpdated: history.length > 0 ? history[0].timestamp : undefined
    }
  }

  public exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  public importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData)
      
      // Validasi struktur data
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid data format')
      }

      // Merge dengan history yang ada
      const currentHistory = this.getHistory()
      const mergedHistory = [...importedHistory, ...currentHistory]
      
      // Remove duplicates berdasarkan ID
      const uniqueHistory = mergedHistory.filter((item, index, self) => 
        index === self.findIndex(h => h.id === item.id)
      )

      // Batasi jumlah item
      if (uniqueHistory.length > this.MAX_ITEMS) {
        uniqueHistory.splice(this.MAX_ITEMS)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueHistory))
      console.log('✅ History imported successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to import history:', error)
      return false
    }
  }

  public searchHistory(query: string): LocalHistoryItem[] {
    const history = this.getHistory()
    const lowercaseQuery = query.toLowerCase()

    return history.filter(item => 
      item.input_text.toLowerCase().includes(lowercaseQuery) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
      item.rationale.toLowerCase().includes(lowercaseQuery)
    )
  }

  public getStatistics(): {
    totalAnalyses: number
    hoaxCount: number
    faktualCount: number
    backendCount: number
    geminiCount: number
    averageConfidence: number
  } {
    const history = this.getHistory()
    
    if (history.length === 0) {
      return {
        totalAnalyses: 0,
        hoaxCount: 0,
        faktualCount: 0,
        backendCount: 0,
        geminiCount: 0,
        averageConfidence: 0
      }
    }

    const hoaxCount = history.filter(item => item.prediction.label === 'hoax').length
    const faktualCount = history.filter(item => item.prediction.label === 'faktual').length
    const backendCount = history.filter(item => item.source === 'backend').length
    const geminiCount = history.filter(item => item.source === 'gemini_backup').length
    
    const totalConfidence = history.reduce((sum, item) => sum + item.prediction.confidence, 0)
    const averageConfidence = totalConfidence / history.length

    return {
      totalAnalyses: history.length,
      hoaxCount,
      faktualCount,
      backendCount,
      geminiCount,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    }
  }
}

// Singleton instance
export const localHistoryService = new LocalHistoryService()

// Global debug function
if (typeof window !== 'undefined') {
  (window as any).localHistory = {
    get: () => localHistoryService.getHistory(),
    clear: () => localHistoryService.clearHistory(),
    info: () => localHistoryService.getStorageInfo(),
    stats: () => localHistoryService.getStatistics(),
    export: () => localHistoryService.exportHistory(),
    search: (query: string) => localHistoryService.searchHistory(query)
  }
  
  console.log('🗂️ Local History tools available:')
  console.log('- window.localHistory.get() - Get all history')
  console.log('- window.localHistory.clear() - Clear history')
  console.log('- window.localHistory.info() - Storage info')
  console.log('- window.localHistory.stats() - Statistics')
}
