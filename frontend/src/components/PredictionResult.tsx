import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, HelpCircle, ThumbsUp, ThumbsDown, Copy, Share2 } from 'lucide-react'
import { PredictionData } from '../types'
import { hoaxDetectionApi } from '../services/api'
import toast from 'react-hot-toast'

interface PredictionResultProps {
  prediction: PredictionData
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [userLabel, setUserLabel] = useState<'hoax' | 'faktual' | ''>('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const getLabelInfo = (label: string) => {
    switch (label) {
      case 'hoax':
        return {
          icon: AlertTriangle,
          color: 'danger',
          bgColor: 'bg-danger-50',
          borderColor: 'border-danger-200',
          textColor: 'text-danger-800',
          label: 'HOAX',
          description: 'Berita ini diklasifikasikan sebagai berita palsu'
        }
      case 'faktual':
        return {
          icon: CheckCircle,
          color: 'success',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          textColor: 'text-success-800',
          label: 'FAKTUAL',
          description: 'Berita ini diklasifikasikan sebagai berita yang benar'
        }
      
      default:
        return null
    }
  }

  const labelInfo = getLabelInfo(prediction.prediction.label)
  const IconComponent = labelInfo?.icon || HelpCircle

  const handleFeedbackSubmit = async () => {
    if (!userLabel) {
      toast.error('Silakan pilih label yang sesuai')
      return
    }

    try {
      setIsSubmittingFeedback(true)
      
      await hoaxDetectionApi.submitFeedback({
        text: prediction.input_text,
        predicted_label: prediction.prediction.label,
        user_label: userLabel
      })
      
      toast.success('Terima kasih atas feedback Anda!')
      setShowFeedback(false)
      setUserLabel('')
      
    } catch (error) {
      console.error('Feedback submission failed:', error)
      toast.error('Gagal mengirim feedback')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Teks berhasil disalin!')
  }

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hasil Deteksi Hoax',
        text: `Hasil analisis: ${prediction.prediction.label.toUpperCase()} (${(prediction.prediction.confidence * 100).toFixed(1)}%)`,
        url: window.location.href
      })
    } else {
      copyToClipboard(`Hasil analisis: ${prediction.prediction.label.toUpperCase()} (${(prediction.prediction.confidence * 100).toFixed(1)}%)`)
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Hasil Analisis</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(prediction.input_text)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Salin teks"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={shareResult}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Bagikan hasil"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Result */}
      <div className={`${labelInfo?.bgColor} border ${labelInfo?.borderColor} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-${labelInfo?.color}-100`}>
            <IconComponent className={`h-8 w-8 text-${labelInfo?.color}-600`} />
          </div>
          <div className="flex-1">
            <h4 className={`text-2xl font-bold ${labelInfo?.textColor} mb-2`}>
              {labelInfo?.label}
            </h4>
            <p className={`${labelInfo?.textColor} mb-2`}>
              {labelInfo?.description}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Kepercayaan: <span className="font-semibold">{(prediction.prediction.confidence * 100).toFixed(1)}%</span>
              </span>
              <span className="text-sm text-gray-600">
                Waktu: <span className="font-semibold">{prediction.processing_time}s</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Skor Kepercayaan</h4>
        <div className="space-y-3">
          {Object.entries(prediction.prediction.probabilities).map(([label, prob]) => (
            <div key={label} className="flex items-center space-x-3">
                             <span className="text-sm font-medium text-gray-700 w-20 capitalize">
                 {label}
               </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                                     className={`h-2 rounded-full transition-all duration-500 ${
                     label === 'hoax' ? 'bg-danger-500' : 'bg-success-500'
                   }`}
                  style={{ width: `${(prob * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Kata Kunci Utama</h4>
        <div className="flex flex-wrap gap-2">
          {prediction.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Rationale */}
      {prediction.rationale && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Penjelasan</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {prediction.rationale}
          </p>
        </div>
      )}

      {/* Input Text Preview */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Teks yang Dianalisis</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 text-sm leading-relaxed">
            {prediction.input_text.length > 300
              ? `${prediction.input_text.substring(0, 300)}...`
              : prediction.input_text
            }
          </p>
          {prediction.input_text.length > 300 && (
            <button
              onClick={() => copyToClipboard(prediction.input_text)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
            >
              Lihat teks lengkap
            </button>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Feedback</h4>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showFeedback ? 'Tutup' : 'Berikan Feedback'}
          </button>
        </div>

        {showFeedback && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Apakah hasil klasifikasi ini sudah tepat? Berikan feedback Anda:
            </p>
            <div className="flex space-x-3 mb-4">
              {(['hoax', 'faktual'] as const).map((label) => (
                <button
                  key={label}
                  onClick={() => setUserLabel(label)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    userLabel === label
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleFeedbackSubmit}
                disabled={!userLabel || isSubmittingFeedback}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmittingFeedback ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4" />
                    <span>Kirim Feedback</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowFeedback(false)
                  setUserLabel('')
                }}
                className="btn-secondary"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionResult 