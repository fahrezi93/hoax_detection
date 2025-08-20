import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw, Bug } from 'lucide-react'
import { geminiDebugger, GeminiDebugStatus } from '../utils/debugGemini'

interface GeminiDebugPanelProps {
  isVisible?: boolean
  onToggle?: () => void
}

const GeminiDebugPanel: React.FC<GeminiDebugPanelProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [status, setStatus] = useState<GeminiDebugStatus>({
    isConfigured: false,
    isConnected: false,
    apiKeyPresent: false
  })
  const [isChecking, setIsChecking] = useState(false)
  const [testText, setTestText] = useState('Ini adalah test untuk memastikan Gemini AI berfungsi dengan baik.')

  useEffect(() => {
    if (isVisible) {
      checkStatus()
    }
  }, [isVisible])

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const newStatus = await geminiDebugger.checkGeminiStatus()
      setStatus(newStatus)
    } catch (error) {
      console.error('Debug check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const testCustomText = async () => {
    if (!testText.trim()) return
    
    setIsChecking(true)
    try {
      const result = await geminiDebugger.testGeminiWithCustomText(testText)
      
      if (result.success) {
        alert(`✅ Test Berhasil!\n\nHasil: ${result.result?.label}\nKonfiden: ${result.result?.confidence}\nResponse Time: ${result.responseTime}ms`)
      } else {
        alert(`❌ Test Gagal!\n\nError: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Test Error: ${error}`)
    } finally {
      setIsChecking(false)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Debug Gemini API"
      >
        <Bug className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bug className="h-5 w-5 mr-2" />
          Gemini API Debug
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Status Overview */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Key:</span>
          <div className="flex items-center">
            {status.apiKeyPresent ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${status.apiKeyPresent ? 'text-green-600' : 'text-red-600'}`}>
              {status.apiKeyPresent ? 'Configured' : 'Missing'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Service:</span>
          <div className="flex items-center">
            {status.isConfigured ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${status.isConfigured ? 'text-green-600' : 'text-red-600'}`}>
              {status.isConfigured ? 'Ready' : 'Not Ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection:</span>
          <div className="flex items-center">
            {status.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${status.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {status.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-700">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {status.error}
          </p>
        </div>
      )}

      {/* Test Result */}
      {status.testResult && (
        <div className={`border rounded p-3 mb-4 ${
          status.testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${
            status.testResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {status.testResult.success ? '✅' : '❌'} {status.testResult.message}
          </p>
        </div>
      )}

      {/* Last Check Time */}
      {status.lastTestTime && (
        <p className="text-xs text-gray-500 mb-4">
          Last check: {status.lastTestTime.toLocaleTimeString()}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isChecking ? 'Checking...' : 'Check Status'}
        </button>

        {/* Custom Test */}
        <div className="border-t pt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Custom Text:
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Enter text to test Gemini API..."
          />
          <button
            onClick={testCustomText}
            disabled={isChecking || !testText.trim() || !status.isConfigured}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded text-sm"
          >
            Test Analysis
          </button>
        </div>
      </div>

      {/* Console Debug Info */}
      <div className="border-t pt-3 mt-3">
        <p className="text-xs text-gray-500 mb-2">Console Commands:</p>
        <div className="bg-gray-50 p-2 rounded text-xs font-mono">
          <div>window.debugGemini.check()</div>
          <div>window.debugGemini.log()</div>
        </div>
      </div>
    </div>
  )
}

export default GeminiDebugPanel
