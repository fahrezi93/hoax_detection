import React, { useState, useEffect } from 'react'
import { Clock, Search, Filter, Download, RefreshCw } from 'lucide-react'
import { hoaxDetectionApi } from '../services/api'
import { HistoryItem } from '../types'
import toast from 'react-hot-toast'

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLabel, setFilterLabel] = useState<string>('all')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const result = await hoaxDetectionApi.getHistory(100)
      setHistory(result.history)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Gagal memuat riwayat')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.input_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterLabel === 'all' || item.predicted_label === filterLabel
    return matchesSearch && matchesFilter
  })

  const getLabelBadge = (label: string) => {
    const labelConfig = {
      hoax: { color: 'bg-danger-100 text-danger-800', text: 'HOAX' },
      faktual: { color: 'bg-success-100 text-success-800', text: 'FAKTUAL' },
      tidak_pasti: { color: 'bg-warning-100 text-warning-800', text: 'TIDAK PASTI' }
    }
    
    const config = labelConfig[label as keyof typeof labelConfig] || labelConfig.tidak_pasti
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Tanggal', 'Teks', 'Label', 'Kepercayaan', 'Waktu Proses'],
      ...filteredHistory.map(item => [
        formatDate(item.timestamp),
        item.input_text,
        item.predicted_label,
        `${(item.confidence * 100).toFixed(1)}%`,
        `${item.processing_time}s`
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `hoax-detection-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Analisis</h1>
          <p className="text-gray-600">
            Lihat riwayat analisis berita hoax yang telah dilakukan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">{total}</div>
            <div className="text-sm text-gray-600">Total Analisis</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-danger-600 mb-1">
              {history.filter(item => item.predicted_label === 'hoax').length}
            </div>
            <div className="text-sm text-gray-600">Berita Hoax</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {history.filter(item => item.predicted_label === 'faktual').length}
            </div>
            <div className="text-sm text-gray-600">Berita Faktual</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {history.filter(item => item.predicted_label === 'tidak_pasti').length}
            </div>
            <div className="text-sm text-gray-600">Tidak Pasti</div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan teks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value)}
                  className="input-field max-w-xs"
                >
                  <option value="all">Semua Label</option>
                  <option value="hoax">Hoax</option>
                  <option value="faktual">Faktual</option>
                  <option value="tidak_pasti">Tidak Pasti</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={loadHistory}
                disabled={isLoading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportHistory}
                disabled={filteredHistory.length === 0}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat riwayat...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterLabel !== 'all' 
                  ? 'Tidak ada riwayat yang sesuai dengan filter'
                  : 'Belum ada riwayat analisis'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kepercayaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.map((item) => (
                    <tr key={item.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={item.input_text}>
                          {item.input_text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getLabelBadge(item.predicted_label)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.processing_time}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {filteredHistory.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-600">
            Menampilkan {filteredHistory.length} dari {total} riwayat
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage 