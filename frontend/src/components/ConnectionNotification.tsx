import React, { useState, useEffect } from 'react'
import { connectivityMonitor, ConnectivityStatus } from '../services/connectivity'
import { geminiDebugger, GeminiDebugStatus } from '../utils/debugGemini'

interface ConnectionNotificationProps {
  className?: string
}

const ConnectionNotification: React.FC<ConnectionNotificationProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<ConnectivityStatus>(connectivityMonitor.getStatus())
  const [geminiStatus, setGeminiStatus] = useState<GeminiDebugStatus>({
    isConfigured: false,
    isConnected: false,
    apiKeyPresent: false
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const unsubscribe = connectivityMonitor.subscribe((newStatus) => {
      setStatus(newStatus)
      
      // Show notification when connection is lost
      if (!newStatus.isConnected) {
        setIsVisible(true)
        setIsDismissed(false)
        // Check Gemini status when backend is down
        checkGeminiStatus()
      } else {
        // Hide notification when connection is restored
        setIsVisible(false)
        setIsDismissed(false)
      }
    })

    return unsubscribe
  }, [])

  const checkGeminiStatus = async () => {
    try {
      const status = await geminiDebugger.checkGeminiStatus()
      setGeminiStatus(status)
    } catch (error) {
      console.error('Failed to check Gemini status:', error)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleRetry = async () => {
    setIsDismissed(false)
    await connectivityMonitor.checkConnection()
  }

  if (!isVisible || isDismissed || status.isConnected) {
    return null
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md mx-auto">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Koneksi Backend Terputus
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                API backend tidak terhubung. Silakan coba lagi nanti atau gunakan mode backup dengan Gemini AI.
              </p>
              {status.error && (
                <p className="mt-1 text-xs text-red-600">
                  Error: {status.error}
                </p>
              )}
              
              {/* Gemini Status */}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700 font-medium">Status Backup Gemini AI:</p>
                <div className="flex items-center mt-1">
                  {geminiStatus.apiKeyPresent ? (
                    <span className="text-xs text-green-600">✅ API Key: Configured</span>
                  ) : (
                    <span className="text-xs text-red-600">❌ API Key: Missing</span>
                  )}
                </div>
                <div className="flex items-center">
                  {geminiStatus.isConnected ? (
                    <span className="text-xs text-green-600">✅ Connection: Ready</span>
                  ) : (
                    <span className="text-xs text-orange-600">⚠️ Connection: {geminiStatus.error || 'Not tested'}</span>
                  )}
                </div>
                {geminiStatus.testResult && (
                  <div className="mt-1">
                    <span className={`text-xs ${geminiStatus.testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {geminiStatus.testResult.success ? '✅' : '❌'} Test: {geminiStatus.testResult.message}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionNotification
