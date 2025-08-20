import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ConnectionNotification from './components/ConnectionNotification'
import GeminiDebugPanel from './components/GeminiDebugPanel'
import LocalHistoryPanel from './components/LocalHistoryPanel'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import './utils/debugGemini' // Initialize debug tools
import './services/localHistory' // Initialize local history tools

function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <ConnectionNotification />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
      <GeminiDebugPanel 
        isVisible={showDebugPanel} 
        onToggle={() => setShowDebugPanel(!showDebugPanel)} 
      />
      <LocalHistoryPanel 
        isVisible={showHistoryPanel} 
        onToggle={() => setShowHistoryPanel(!showHistoryPanel)} 
      />
    </div>
  )
}

export default App 