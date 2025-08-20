import React, { useState, useEffect } from 'react'
import { History, Download, Trash2, Search, BarChart3, RefreshCw } from 'lucide-react'
import { localHistoryService, LocalHistoryItem } from '../services/localHistory'

interface LocalHistoryPanelProps {
  isVisible?: boolean
  onToggle?: () => void
}

const LocalHistoryPanel: React.FC<LocalHistoryPanelProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [history, setHistory] = useState<LocalHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredHistory, setFilteredHistory] = useState<LocalHistoryItem[]>([])
  const [storageInfo, setStorageInfo] = useState<any>({})
  const [stats, setStats] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (isVisible) {
      loadHistory()
      loadStorageInfo()
      loadStats()
    }
  }, [isVisible])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = localHistoryService.searchHistory(searchQuery)
      setFilteredHistory(filtered)
    } else {
      setFilteredHistory(history)
    }
    setCurrentPage(0)
  }, [searchQuery, history])

  const loadHistory = () => {
    const allHistory = localHistoryService.getHistory()
    setHistory(allHistory)
  }

  const loadStorageInfo = () => {
    const info = localHistoryService.getStorageInfo()
    setStorageInfo(info)
  }

  const loadStats = () => {
    const statistics = localHistoryService.getStatistics()
    setStats(statistics)
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Hapus item ini dari riwayat lokal?')) {
      const success = localHistoryService.deleteHistoryItem(id)
      if (success) {
        loadHistory()
        loadStorageInfo()
        loadStats()
      }
    }
  }

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat lokal? Tindakan ini tidak dapat dibatalkan.')) {
      localHistoryService.clearHistory()
      loadHistory()
      loadStorageInfo()
      loadStats()
    }
  }

  const handleExportHistory = () => {
    const exportData = localHistoryService.exportHistory()
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hoax-detection-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const paginatedHistory = filteredHistory.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-16 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Local History"
      >
        <History className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <History className="h-5 w-5 mr-2" />
          Riwayat Lokal ({filteredHistory.length})
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Stats & Info */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.totalAnalyses || 0}</div>
            <div className="text-xs text-gray-600">Total Analisis</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.hoaxCount || 0}</div>
            <div className="text-xs text-gray-600">Hoax</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.faktualCount || 0}</div>
            <div className="text-xs text-gray-600">Faktual</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.geminiCount || 0}</div>
            <div className="text-xs text-gray-600">Via Gemini</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span>Storage: {storageInfo.storageSize}</span>
          <span>•</span>
          <span>Avg Confidence: {stats.averageConfidence || 0}%</span>
          {storageInfo.lastUpdated && (
            <>
              <span>•</span>
              <span>Last: {storageInfo.lastUpdated.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam riwayat..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={loadHistory}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportHistory}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {paginatedHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat lokal'}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedHistory.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.prediction.label === 'hoax' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.prediction.label.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(item.prediction.confidence * 100).toFixed(1)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.source === 'backend' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.source === 'backend' ? 'Backend' : 'Gemini'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2">
                      {item.input_text}
                    </p>
                    
                    {item.rationale && (
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Alasan:</strong> {item.rationale}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{item.timestamp.toLocaleString()}</span>
                      <span>{item.processing_time}ms</span>
                      {item.url && <span>URL: {item.url}</span>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Halaman {currentPage + 1} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocalHistoryPanel
