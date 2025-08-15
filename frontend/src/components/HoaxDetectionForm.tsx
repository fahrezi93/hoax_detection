import React, { useState } from 'react'
import { Search, Globe, FileText, AlertCircle } from 'lucide-react'
import { hoaxDetectionApi } from '../services/api'
import { PredictionData } from '../types'
import toast from 'react-hot-toast'

interface HoaxDetectionFormProps {
  onPredictionStart: () => void
  onPredictionComplete: (result: PredictionData) => void
  isLoading: boolean
}

const HoaxDetectionForm: React.FC<HoaxDetectionFormProps> = ({
  onPredictionStart,
  onPredictionComplete,
  isLoading,
}) => {
  const [inputType, setInputType] = useState<'text' | 'url'>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [isUrlValid, setIsUrlValid] = useState(true)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value) {
      setIsUrlValid(validateUrl(value))
    } else {
      setIsUrlValid(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (inputType === 'text' && !text.trim()) {
      toast.error('Silakan masukkan teks untuk dianalisis')
      return
    }
    
    if (inputType === 'url' && !url.trim()) {
      toast.error('Silakan masukkan URL untuk dianalisis')
      return
    }
    
    if (inputType === 'url' && !isUrlValid) {
      toast.error('URL tidak valid')
      return
    }

    try {
      onPredictionStart()
      
      const data = inputType === 'text' ? { text: text.trim() } : { url: url.trim() }
      const result = await hoaxDetectionApi.predict(data)
      
      onPredictionComplete(result)
      toast.success('Analisis berhasil diselesaikan!')
      
      // Reset form
      if (inputType === 'text') {
        setText('')
      } else {
        setUrl('')
      }
      
    } catch (error) {
      console.error('Prediction failed:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis')
    }
  }

  const handleInputTypeChange = (type: 'text' | 'url') => {
    setInputType(type)
    setText('')
    setUrl('')
    setIsUrlValid(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Type Selection */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => handleInputTypeChange('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            inputType === 'text'
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Teks</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleInputTypeChange('url')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            inputType === 'url'
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          <Globe className="h-5 w-5" />
          <span>URL</span>
        </button>
      </div>

      {/* Text Input */}
      {inputType === 'text' && (
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Masukkan Teks Berita
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masukkan teks berita yang ingin dianalisis..."
            className="textarea-field"
            rows={6}
            maxLength={4096}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {text.length}/4096 karakter
            </span>
            {text.length < 10 && text.length > 0 && (
              <span className="text-sm text-warning-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Minimal 10 karakter
              </span>
            )}
          </div>
        </div>
      )}

      {/* URL Input */}
      {inputType === 'url' && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Masukkan URL Artikel
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/artikel-berita"
              className={`input-field flex-1 ${
                !isUrlValid && url ? 'border-danger-500 focus:ring-danger-500' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          {!isUrlValid && url && (
            <p className="text-sm text-danger-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              URL tidak valid
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Aplikasi akan otomatis mengekstrak konten dari URL yang diberikan
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isLoading || (inputType === 'text' ? !text.trim() : !url.trim()) || (inputType === 'url' && !isUrlValid)}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Analisis</span>
            </>
          )}
        </button>

        <div className="text-sm text-gray-500">
          {inputType === 'text' && text && (
            <span>Kata: {text.split(/\s+/).filter(word => word.length > 0).length}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips Analisis:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Untuk hasil terbaik, gunakan teks minimal 50 kata</li>
              <li>• URL harus dari situs berita yang dapat diakses publik</li>
              <li>• Sistem akan menganalisis konten dan memberikan skor kepercayaan</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}

export default HoaxDetectionForm 