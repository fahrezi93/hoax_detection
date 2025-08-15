import React from 'react'
import { Shield, Github, Twitter, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">HoaxDetector</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Aplikasi deteksi berita hoax menggunakan teknologi AI untuk membantu 
              masyarakat Indonesia mendapatkan informasi yang akurat dan terpercaya.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/history"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Riwayat
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Tentang
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">
                <span className="block">Email:</span>
                <a
                  href="mailto:info@hoaxdetector.id"
                  className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  info@hoaxdetector.id
                </a>
              </li>
              <li className="text-gray-300">
                <span className="block">Jam Kerja:</span>
                <span>Senin - Jumat, 09:00 - 17:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 HoaxDetector. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Syarat Penggunaan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 