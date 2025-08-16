# Hoax News Detection

Aplikasi deteksi berita hoax menggunakan machine learning untuk bahasa Indonesia.

## 🚀 Fitur

- **Deteksi Hoax**: Analisis teks berita untuk mendeteksi hoax/faktual
- **Web Interface**: Frontend React untuk input dan hasil
- **API Backend**: Flask API untuk processing
- **Model ML**: Menggunakan transformer model (IndoBERT)

## 📁 Struktur Project

```
Hoax_News_Detection/
├── backend/                 # Flask API
│   ├── app.py              # Main Flask app
│   ├── models/             # ML models
│   │   ├── hoax_detector.py
│   │   └── text_processor.py
│   ├── utils/              # Utilities
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Pages
│   │   └── services/       # API services
│   └── package.json        # Node.js dependencies
└── data/                   # Dataset dan data
```

## 🛠️ Setup Local

### Backend (Flask)

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Setup model**:
   - Pastikan file `adapter_model.safetensors` ada di `backend/models/hoax_model/`
   - File model lainnya sudah tersedia

3. **Run backend**:
   ```bash
   python app.py
   ```
   Backend akan berjalan di `http://localhost:5000`

### Frontend (React)

1. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run frontend**:
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:5173`

## 📊 Model

Project menggunakan:
- **Base Model**: `indobert-base-p1`
- **Fine-tuning**: PEFT (Parameter-Efficient Fine-Tuning)
- **Task**: Sequence Classification (Hoax/Faktual)

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `POST /api/predict` - Prediksi hoax/faktual
- `POST /api/batch` - Batch prediction
- `GET /api/history` - Riwayat prediksi

## 📝 Penggunaan

1. Buka browser ke `http://localhost:5173`
2. Masukkan teks berita yang ingin dianalisis
3. Klik "Deteksi Hoax"
4. Lihat hasil prediksi (Hoax/Faktual dengan confidence score)

## 🎯 Model Performance

- **Accuracy**: Tergantung pada training data
- **Language**: Bahasa Indonesia
- **Input**: Teks berita (max 512 tokens)

## 📚 Dependencies

### Backend
- Flask
- Transformers
- PyTorch
- PEFT
- NumPy
- Pandas

### Frontend
- React
- TypeScript
- Vite
- Axios
- Tailwind CSS

## 🔒 Note

Project ini untuk penggunaan lokal saja. Model file besar (`*.safetensors`) tidak di-track di Git untuk menghemat repository size. 