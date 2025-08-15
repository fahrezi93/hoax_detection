import React from 'react'
import { Shield, Brain, Globe, Users, Code, Database, Zap, BookOpen } from 'lucide-react'

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Tentang HoaxDetector
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform deteksi berita hoax berbasis AI yang dirancang khusus untuk 
            membantu masyarakat Indonesia mendapatkan informasi yang akurat dan terpercaya
          </p>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <div className="card text-center">
            <div className="max-w-3xl mx-auto">
              <Shield className="h-16 w-16 text-primary-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Misi Kami
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Di era informasi digital yang berkembang pesat, berita palsu atau hoax 
                menyebar lebih cepat dari berita yang benar. HoaxDetector hadir sebagai 
                solusi teknologi AI untuk membantu masyarakat Indonesia membedakan 
                berita yang faktual dari yang palsu, sehingga dapat membuat keputusan 
                yang lebih baik berdasarkan informasi yang akurat.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Detection
              </h3>
              <p className="text-gray-600">
                Menggunakan model machine learning canggih yang telah dilatih dengan 
                dataset berita Indonesia untuk deteksi yang akurat
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                URL Scraping
              </h3>
              <p className="text-gray-600">
                Kemampuan mengekstrak konten artikel langsung dari URL berita 
                untuk analisis yang lebih komprehensif
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-warning-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Keyword Analysis
              </h3>
              <p className="text-gray-600">
                Identifikasi kata kunci yang mempengaruhi prediksi untuk 
                memberikan penjelasan yang transparan
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-danger-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                User Feedback
              </h3>
              <p className="text-gray-600">
                Sistem feedback untuk terus meningkatkan akurasi model 
                berdasarkan input pengguna
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                History Tracking
              </h3>
              <p className="text-gray-600">
                Penyimpanan riwayat analisis untuk referensi dan 
                pembelajaran pengguna
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Processing
              </h3>
              <p className="text-gray-600">
                Analisis cepat dalam hitungan detik dengan 
                optimasi performa yang tinggi
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Teknologi yang Digunakan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-6 w-6 text-primary-600 mr-2" />
                  Backend
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Python Flask - Framework web yang ringan dan fleksibel</li>
                  <li>• HuggingFace Transformers - Model AI state-of-the-art</li>
                  <li>• PyTorch - Deep learning framework</li>
                  <li>• SQLite - Database lokal untuk penyimpanan data</li>
                  <li>• BeautifulSoup & Readability - Web scraping dan ekstraksi teks</li>
                  <li>• KeyBERT - Ekstraksi kata kunci menggunakan BERT</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-6 w-6 text-primary-600 mr-2" />
                  Frontend
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• React 18 - Library UI modern dengan hooks</li>
                  <li>• TypeScript - Type safety dan developer experience</li>
                  <li>• Tailwind CSS - Utility-first CSS framework</li>
                  <li>• Vite - Build tool yang cepat</li>
                  <li>• React Router - Client-side routing</li>
                  <li>• Axios - HTTP client untuk API calls</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Bagaimana Cara Kerjanya?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Input Processing
                </h3>
                <p className="text-gray-600">
                  Teks berita atau URL artikel diproses dan dibersihkan dari 
                  elemen yang tidak relevan
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-600">
                  Model transformer menganalisis teks dan memberikan 
                  prediksi dengan skor kepercayaan
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Result & Explanation
                </h3>
                <p className="text-gray-600">
                  Hasil klasifikasi ditampilkan beserta kata kunci dan 
                  penjelasan yang mudah dipahami
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dataset & Model */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Dataset & Model
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Dataset Training
                </h3>
                <p className="text-gray-600 mb-4">
                  Model kami dilatih menggunakan dataset berita Indonesia yang berisi:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Berita faktual dari sumber terpercaya</li>
                  <li>• Berita hoax yang telah diverifikasi</li>
                  <li>• Berita dengan label "tidak pasti" untuk kasus ambigu</li>
                  <li>• Total lebih dari 10,000 sampel berita</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Model Architecture
                </h3>
                <p className="text-gray-600 mb-4">
                  Menggunakan arsitektur transformer modern:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• IndoBERT atau XLM-RoBERTa sebagai base model</li>
                  <li>• Fine-tuned untuk klasifikasi berita Indonesia</li>
                  <li>• Multi-label classification (3 kelas)</li>
                  <li>• Optimized untuk performa dan akurasi</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="mb-16">
          <div className="card text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Kontak & Dukungan
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Memiliki pertanyaan atau saran? Kami siap membantu!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@hoaxdetector.id</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub</h3>
                <p className="text-gray-600">github.com/hoaxdetector</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Jam Kerja</h3>
                <p className="text-gray-600">Senin - Jumat, 09:00 - 17:00 WIB</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Disclaimer
            </h3>
            <p className="text-yellow-700 text-sm">
              HoaxDetector adalah alat bantu yang menggunakan teknologi AI. Hasil analisis 
              tidak 100% akurat dan sebaiknya digunakan sebagai referensi tambahan, bukan 
              sebagai satu-satunya sumber kebenaran. Pengguna tetap disarankan untuk 
              melakukan verifikasi dari sumber berita resmi dan terpercaya.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage 