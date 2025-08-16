# 🚀 Hugging Face Hub Setup Guide (Manual Upload)

## Overview
Solusi profesional untuk menyimpan dan mengelola model AI menggunakan Hugging Face Hub dengan upload manual.

### ✅ Keuntungan HF Hub:
- **Gratis** untuk repository publik
- **Dirancang khusus** untuk model AI
- **Upload manual** via web interface
- **Versioning** otomatis
- **CDN global** untuk download cepat

---

## 📋 Langkah Setup Manual

### 1. Daftar Hugging Face Hub
1. Buka https://huggingface.co
2. Sign up dengan GitHub/Google
3. Verifikasi email

### 2. Buat Repository Baru
1. Klik "New Model" di dashboard
2. Pilih "Create a new model repository"
3. Isi form:
   - **Owner**: `fahrezi93` (username Anda)
   - **Model name**: `hoax-news-detection-model`
   - **License**: `MIT`
   - **Visibility**: `Public`
4. Klik "Create repository"

### 3. Upload Model Files Manual
1. Buka repository yang baru dibuat
2. Klik "Files and versions" tab
3. Klik "Add file" → "Upload files"
4. Upload semua file dari folder `backend/retrained_model/`:
   - `model.safetensors`
   - `config.json`
   - `tokenizer.json`
   - `vocab.txt`
   - `training_args.bin`
   - Dan file lainnya
5. Upload juga file dari `backend/models/hoax_model/`:
   - `adapter_model.safetensors`
   - `adapter_config.json`
   - `tokenizer_config.json`
   - Dan file lainnya
6. Klik "Commit changes to main"

### 4. Struktur Repository yang Benar
```
fahrezi93/hoax-news-detection-model/
├── retrained_model/
│   ├── model.safetensors
│   ├── config.json
│   ├── tokenizer.json
│   ├── vocab.txt
│   ├── training_args.bin
│   └── checkpoint-65/
│       ├── model.safetensors
│       ├── optimizer.pt
│       └── ...
├── hoax_model/
│   ├── adapter_model.safetensors
│   ├── adapter_config.json
│   ├── tokenizer_config.json
│   └── ...
└── README.md
```

---

## 🚀 Deployment dengan HF Hub

### 1. Update Railway Environment
Di Railway dashboard, tambahkan:
```env
HF_REPO_ID=fahrezi93/hoax-news-detection-model
```

### 2. Model Download Otomatis
Saat deployment, model akan otomatis di-download dari HF Hub:
```python
# backend/download_model.py
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="fahrezi93/hoax-news-detection-model",
    local_dir="."
)
```

---

## 📊 Monitoring & Management

### HF Hub Dashboard
- **Repository**: https://huggingface.co/fahrezi93/hoax-news-detection-model
- **Files**: Lihat semua model files
- **Commits**: History perubahan
- **Settings**: Repository configuration

### Versioning
- Setiap upload = commit baru
- Tag releases untuk versioning
- Rollback ke version sebelumnya

---

## 🔧 Troubleshooting

### Common Issues

1. **File Upload Failed**
   - Pastikan file tidak terlalu besar (max 5GB per file)
   - Cek koneksi internet
   - Coba upload satu per satu

2. **Download Failed**
   - Pastikan repository public
   - Cek nama repository benar
   - Cek file sudah diupload dengan benar

3. **Model Not Found**
   - Pastikan path file benar
   - Cek struktur folder di HF Hub
   - Verifikasi nama file sama dengan yang diharapkan

---

## 💰 Cost & Limits

### Free Tier
- **Storage**: Unlimited untuk public repos
- **Bandwidth**: Unlimited
- **File Size**: Max 5GB per file
- **Private Repos**: 3 repos

### Pro Plan ($9/month)
- **Private Repos**: Unlimited
- **File Size**: Max 10GB per file
- **Priority Support**

---

## 🎯 Next Steps

1. **Buat Repository**: Ikuti langkah di atas
2. **Upload Files**: Upload manual via web interface
3. **Deploy**: Update Railway environment
4. **Test**: Verify model download
5. **Monitor**: Check HF Hub dashboard

---

## 📞 Support

- **HF Hub Docs**: https://huggingface.co/docs
- **Upload Guide**: https://huggingface.co/docs/hub/models-uploading
- **Community**: https://huggingface.co/community

**Happy Deploying! 🚀** 