// @ts-ignore - Google Generative AI types will be installed
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GeminiPredictionResult {
  label: 'hoax' | 'faktual'
  confidence: number
  probabilities: {
    hoax: number
    faktual: number
  }
  rationale: string
  source: 'gemini_backup'
}

class GeminiBackupService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Backup service will not be available.')
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      this.isInitialized = true
      console.log('Gemini backup service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Gemini backup service:', error)
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.model !== null
  }

  public async predict(text: string): Promise<GeminiPredictionResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini backup service is not available')
    }

    if (!text || text.trim().length < 10) {
      throw new Error('Text terlalu pendek. Minimum 10 karakter diperlukan.')
    }

    if (text.length > 4000) {
      text = text.substring(0, 4000) + '...'
    }

    const prompt = `
Analisis teks berikut untuk menentukan apakah ini adalah berita hoax atau faktual.

Teks: "${text}"

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "label": "hoax" atau "faktual",
  "confidence": nilai antara 0-1,
  "probabilities": {
    "hoax": nilai antara 0-1,
    "faktual": nilai antara 0-1
  },
  "rationale": "penjelasan singkat mengapa teks ini diklasifikasikan sebagai hoax atau faktual"
}

Pertimbangkan faktor-faktor berikut:
1. Kredibilitas sumber
2. Bahasa yang digunakan (sensasional, emosional, atau objektif)
3. Fakta yang dapat diverifikasi
4. Struktur dan gaya penulisan
5. Keberadaan bias atau agenda tersembunyi

Berikan hanya respons JSON tanpa teks tambahan.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }

      const analysis = JSON.parse(jsonMatch[0])
      
      // Validate and normalize response
      const label = analysis.label?.toLowerCase()
      if (label !== 'hoax' && label !== 'faktual') {
        throw new Error('Invalid label in Gemini response')
      }

      const confidence = Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0.5))
      const hoaxProb = Math.max(0, Math.min(1, parseFloat(analysis.probabilities?.hoax) || 0))
      const faktualProb = Math.max(0, Math.min(1, parseFloat(analysis.probabilities?.faktual) || 0))

      // Normalize probabilities to sum to 1
      const total = hoaxProb + faktualProb
      const normalizedHoax = total > 0 ? hoaxProb / total : 0.5
      const normalizedFaktual = total > 0 ? faktualProb / total : 0.5

      return {
        label: label as 'hoax' | 'faktual',
        confidence,
        probabilities: {
          hoax: normalizedHoax,
          faktual: normalizedFaktual
        },
        rationale: analysis.rationale || 'Analisis menggunakan Gemini AI sebagai backup',
        source: 'gemini_backup'
      }

    } catch (error) {
      console.error('Gemini prediction failed:', error)
      throw new Error('Gagal menganalisis dengan Gemini AI: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
}

// Singleton instance
export const geminiBackupService = new GeminiBackupService()
