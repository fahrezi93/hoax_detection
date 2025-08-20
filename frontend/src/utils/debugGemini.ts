import { geminiBackupService } from '../services/geminiBackup'

export interface GeminiDebugStatus {
  isConfigured: boolean
  isConnected: boolean
  apiKeyPresent: boolean
  lastTestTime?: Date
  error?: string
  testResult?: {
    success: boolean
    responseTime: number
    message: string
  }
}

class GeminiDebugger {
  private status: GeminiDebugStatus = {
    isConfigured: false,
    isConnected: false,
    apiKeyPresent: false
  }

  public async checkGeminiStatus(): Promise<GeminiDebugStatus> {
    console.log('🔍 Checking Gemini API status...')
    
    // Check if API key is present
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
    const apiKeyPresent = !!(apiKey && apiKey !== 'your_gemini_api_key_here')
    
    this.status = {
      isConfigured: geminiBackupService.isAvailable(),
      isConnected: false,
      apiKeyPresent,
      lastTestTime: new Date()
    }

    if (!apiKeyPresent) {
      this.status.error = 'API key tidak ditemukan atau masih menggunakan placeholder'
      console.log('❌ Gemini API key tidak ditemukan')
      return this.status
    }

    if (!this.status.isConfigured) {
      this.status.error = 'Gemini service tidak terkonfigurasi dengan benar'
      console.log('❌ Gemini service tidak terkonfigurasi')
      return this.status
    }

    // Test connection with a simple prediction
    try {
      console.log('🧪 Testing Gemini API connection...')
      const startTime = Date.now()
      
      const testText = "Ini adalah test koneksi untuk memastikan Gemini API berfungsi dengan baik."
      const result = await geminiBackupService.predict(testText)
      
      const responseTime = Date.now() - startTime
      
      this.status.isConnected = true
      this.status.testResult = {
        success: true,
        responseTime,
        message: `Test berhasil! Response time: ${responseTime}ms`
      }
      
      console.log('✅ Gemini API connection successful!')
      console.log(`📊 Response time: ${responseTime}ms`)
      console.log(`🎯 Test result: ${result.label} (confidence: ${result.confidence})`)
      
    } catch (error) {
      this.status.isConnected = false
      this.status.error = error instanceof Error ? error.message : 'Unknown error'
      this.status.testResult = {
        success: false,
        responseTime: 0,
        message: `Test gagal: ${this.status.error}`
      }
      
      console.log('❌ Gemini API connection failed:', error)
    }

    return this.status
  }

  public getStatus(): GeminiDebugStatus {
    return { ...this.status }
  }

  public async testGeminiWithCustomText(text: string): Promise<{
    success: boolean
    result?: any
    error?: string
    responseTime: number
  }> {
    if (!this.status.isConfigured) {
      return {
        success: false,
        error: 'Gemini service tidak terkonfigurasi',
        responseTime: 0
      }
    }

    try {
      console.log('🧪 Testing Gemini with custom text:', text.substring(0, 50) + '...')
      const startTime = Date.now()
      
      const result = await geminiBackupService.predict(text)
      const responseTime = Date.now() - startTime
      
      console.log('✅ Custom test successful!')
      console.log(`📊 Response time: ${responseTime}ms`)
      console.log(`🎯 Result: ${result.label} (confidence: ${result.confidence})`)
      
      return {
        success: true,
        result,
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now()
      console.log('❌ Custom test failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
    }
  }

  public logDebugInfo(): void {
    console.log('🔧 Gemini Debug Information:')
    console.log('===========================')
    console.log(`API Key Present: ${this.status.apiKeyPresent ? '✅' : '❌'}`)
    console.log(`Service Configured: ${this.status.isConfigured ? '✅' : '❌'}`)
    console.log(`Connection Status: ${this.status.isConnected ? '✅ Connected' : '❌ Disconnected'}`)
    
    if (this.status.error) {
      console.log(`Error: ${this.status.error}`)
    }
    
    if (this.status.testResult) {
      console.log(`Last Test: ${this.status.testResult.success ? '✅' : '❌'} - ${this.status.testResult.message}`)
    }
    
    if (this.status.lastTestTime) {
      console.log(`Last Check: ${this.status.lastTestTime.toLocaleString()}`)
    }
    
    console.log('===========================')
  }
}

// Singleton instance
export const geminiDebugger = new GeminiDebugger()

// Global debug function for console access
if (typeof window !== 'undefined') {
  (window as any).debugGemini = {
    check: () => geminiDebugger.checkGeminiStatus(),
    status: () => geminiDebugger.getStatus(),
    test: (text: string) => geminiDebugger.testGeminiWithCustomText(text),
    log: () => geminiDebugger.logDebugInfo()
  }
  
  console.log('🔧 Gemini Debug tools available:')
  console.log('- window.debugGemini.check() - Check connection status')
  console.log('- window.debugGemini.status() - Get current status')
  console.log('- window.debugGemini.test("text") - Test with custom text')
  console.log('- window.debugGemini.log() - Show debug info')
}
