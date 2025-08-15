import React, { useState } from 'react'
import { Search, Globe, FileText, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'
import HoaxDetectionForm from '../components/HoaxDetectionForm'
import PredictionResult from '../components/PredictionResult'
import { PredictionData } from '../types'

const HomePage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePredictionComplete = (result: PredictionData) => {
    setPrediction(result)
    setIsLoading(false)
  }

  const handlePredictionStart = () => {
    setIsLoading(true)
    setPrediction(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Deteksi Berita Hoax
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Gunakan teknologi AI untuk memverifikasi kebenaran berita dan 
            dapatkan informasi yang akurat dan terpercaya
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Akurasi Tinggi</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <Globe className="h-5 w-5 text-blue-300" />
              <span>Multi Bahasa</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <FileText className="h-5 w-5 text-yellow-300" />
              <span>Analisis Mendalam</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detection Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Analisis Teks atau URL
                </h2>
                <HoaxDetectionForm
                  onPredictionStart={handlePredictionStart}
                  onPredictionComplete={handlePredictionComplete}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fitur Unggulan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Search className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Deteksi Otomatis</h4>
                      <p className="text-sm text-gray-600">
                        Analisis cepat menggunakan model AI yang telah dilatih
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Globe className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">URL Scraping</h4>
                      <p className="text-sm text-gray-600">
                        Ekstraksi otomatis konten dari link berita
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Kata Kunci</h4>
                      <p className="text-sm text-gray-600">
                        Identifikasi kata kunci yang mempengaruhi prediksi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cara Penggunaan
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      1
                    </span>
                    <span>Masukkan teks berita atau URL artikel</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      2
                    </span>
                    <span>Klik tombol "Analisis" untuk memulai</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      3
                    </span>
                    <span>Lihat hasil klasifikasi dan kata kunci</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Result */}
          {prediction && (
            <div className="mt-8">
              <PredictionResult prediction={prediction} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8">
              <div className="card text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Menganalisis teks...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ini mungkin memakan waktu beberapa detik
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Penting?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Di era informasi digital, kemampuan membedakan berita yang benar 
              dan hoax menjadi sangat penting untuk masyarakat Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-danger-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hoax Merajalela
              </h3>
              <p className="text-gray-600">
                Berita palsu menyebar lebih cepat dari berita yang benar, 
                menyebabkan kebingungan dan kepanikan
              </p>
            </div>

            <div className="text-center">
              <div className="bg-warning-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sulit Dibedakan
              </h3>
              <p className="text-gray-600">
                Hoax sering kali dibuat dengan sangat meyakinkan, 
                sulit dibedakan dari berita yang sah
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Solusi AI
              </h3>
              <p className="text-gray-600">
                Teknologi AI membantu menganalisis pola dan 
                memberikan prediksi yang akurat
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 