# Hoax News Detection Web App

Aplikasi web deteksi berita hoax berbasis AI yang dirancang khusus untuk membantu masyarakat Indonesia mendapatkan informasi yang akurat dan terpercaya.

## 🚀 Fitur Utama

- **AI-Powered Detection**: Menggunakan model transformer untuk klasifikasi berita hoax/faktual
- **URL Scraping**: Ekstraksi otomatis konten dari link berita
- **Keyword Analysis**: Identifikasi kata kunci yang mempengaruhi prediksi
- **User Feedback**: Sistem feedback untuk meningkatkan akurasi model
- **History Tracking**: Penyimpanan riwayat analisis untuk referensi
- **Multi-language Support**: Dukungan bahasa Indonesia dan Inggris
- **Real-time Processing**: Analisis cepat dalam hitungan detik

## 🏗️ Arsitektur

```
Hoax_News_Detection/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── models/             # AI models and text processing
│   ├── utils/              # Utilities (scraper, database)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Container configuration
├── frontend/               # React + TypeScript frontend
│   ├── src/               # Source code
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── notebooks/              # Jupyter notebooks for training
├── tests/                  # Test files
├── scripts/                # Utility scripts
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Python 3.9+** dengan Flask framework
- **HuggingFace Transformers** untuk model AI
- **PyTorch** untuk deep learning
- **SQLite** untuk database lokal
- **BeautifulSoup & Readability** untuk web scraping
- **KeyBERT** untuk ekstraksi kata kunci

### Frontend
- **React 18** dengan TypeScript
- **Tailwind CSS** untuk styling
- **Vite** sebagai build tool
- **React Router** untuk routing
- **Axios** untuk HTTP requests

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
- npm atau yarn
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/hoax-news-detection.git
cd hoax-news-detection
```

### 2. Setup Backend

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env sesuai kebutuhan
# MODEL_PATH=models/indobert-hoax-detector
# ALLOWED_ORIGINS=http://localhost:3000

# Jalankan backend
python app.py
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env sesuai kebutuhan
# VITE_API_BASE_URL=http://localhost:5000

# Jalankan frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 4. Akses Aplikasi

Buka browser dan kunjungi `http://localhost:3000`

## 🔧 Development

### Backend Development

```bash
cd backend

# Jalankan dengan auto-reload
python app.py

# Atau dengan uvicorn
uvicorn app:app --reload --host 0.0.0.0 --port 5000

# Jalankan tests
pytest tests/

# Jalankan dengan Docker
docker build -t hoax-detector-backend .
docker run -p 5000:5000 hoax-detector-backend
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
npm run lint:fix
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v

# Run specific test file
pytest tests/test_backend.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Model Training

### 1. Prepare Dataset

Dataset harus dalam format CSV dengan kolom:
- `text`: Teks berita
- `label`: Label (hoax, faktual, tidak_pasti)

### 2. Fine-tuning

```bash
cd notebooks
jupyter notebook fine_tune.ipynb
```

Atau jalankan script:

```bash
cd scripts
python inference_cli.py --text "Teks berita untuk dianalisis"
```

## 🚀 Deployment

### Backend (Railway/Render)

1. **Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login dan deploy
   railway login
   railway init
   railway up
   ```

2. **Render**
   - Buat account di [render.com](https://render.com)
   - Connect repository GitHub
   - Set environment variables
   - Deploy

### Frontend (Vercel)

1. **Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   cd frontend
   vercel
   ```

2. **Vercel Dashboard**
   - Import project dari GitHub
   - Set build settings
   - Deploy

### Environment Variables

#### Backend (.env)
```env
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5000
MODEL_PATH=models/indobert-hoax-detector
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
SECRET_KEY=your-production-secret-key
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

## 📁 API Endpoints

### POST /api/predict
Prediksi klasifikasi hoax/faktual

**Request:**
```json
{
  "text": "Teks berita untuk dianalisis"
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "prediction": {
    "label": "hoax",
    "confidence": 0.85,
    "probabilities": {
      "hoax": 0.85,
      "faktual": 0.10,
      "tidak_pasti": 0.05
    }
  },
  "keywords": ["kata", "kunci", "penting"],
  "rationale": "Penjelasan prediksi",
  "processing_time": 1.2
}
```

### POST /api/feedback
Submit feedback pengguna

**Request:**
```json
{
  "text": "Teks berita",
  "predicted_label": "hoax",
  "user_label": "faktual"
}
```

### GET /api/history
Ambil riwayat prediksi

### POST /api/batch
Batch prediction dari file CSV

## 🔍 Model Performance

### Metrics
- **Accuracy**: 85%+
- **F1-Score**: 0.83+
- **Processing Time**: <1.5s untuk teks 200-400 kata

### Dataset
- **Training**: ~8,000 sampel
- **Validation**: ~1,000 sampel  
- **Test**: ~1,000 sampel
- **Classes**: Hoax, Faktual, Tidak Pasti

## 🐛 Troubleshooting

### Common Issues

1. **Model tidak bisa di-load**
   ```bash
   # Pastikan model path benar
   # Download model dari HuggingFace
   python -c "from transformers import AutoModel; AutoModel.from_pretrained('indobert-base-p1')"
   ```

2. **CORS Error**
   - Pastikan `ALLOWED_ORIGINS` di backend sesuai dengan domain frontend
   - Check browser console untuk error detail

3. **Memory Error**
   - Kurangi batch size di training
   - Gunakan model yang lebih kecil
   - Enable gradient checkpointing

4. **CUDA Out of Memory**
   - Kurangi batch size
   - Gunakan CPU jika GPU memory tidak cukup
   - Enable mixed precision training

### Logs

```bash
# Backend logs
cd backend
tail -f logs/app.log

# Frontend logs
# Check browser console dan network tab
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

### Development Guidelines

- Gunakan TypeScript untuk frontend
- Tulis tests untuk fitur baru
- Update documentation
- Follow PEP 8 untuk Python
- Gunakan conventional commits

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Email**: info@hoaxdetector.id
- **GitHub**: [github.com/hoaxdetector](https://github.com/hoaxdetector)
- **Website**: [hoaxdetector.id](https://hoaxdetector.id)

## 🙏 Acknowledgments

- [HuggingFace](https://huggingface.co/) untuk model transformer
- [IndoBERT](https://huggingface.co/indobert-base-p1) untuk model bahasa Indonesia
- [Tailwind CSS](https://tailwindcss.com/) untuk styling
- [React](https://reactjs.org/) untuk frontend framework

## 📈 Roadmap

- [ ] Model fine-tuning dengan dataset Indonesia yang lebih besar
- [ ] Support untuk multiple languages
- [ ] Real-time collaboration features
- [ ] Mobile app (React Native)
- [ ] API rate limiting dan authentication
- [ ] Advanced analytics dashboard
- [ ] Integration dengan fact-checking organizations
- [ ] Browser extension

---

**Note**: Aplikasi ini adalah prototype dan hasil analisis tidak 100% akurat. Gunakan sebagai referensi tambahan, bukan sebagai satu-satunya sumber kebenaran. 