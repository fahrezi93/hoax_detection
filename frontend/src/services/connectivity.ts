import { hoaxDetectionApi } from './api'

export interface ConnectivityStatus {
  isConnected: boolean
  lastChecked: Date
  error?: string
}

class ConnectivityMonitor {
  private status: ConnectivityStatus = {
    isConnected: true,
    lastChecked: new Date()
  }
  
  private listeners: ((status: ConnectivityStatus) => void)[] = []
  private checkInterval: number | null = null
  private readonly CHECK_INTERVAL = 30000 // 30 seconds

  constructor() {
    this.startMonitoring()
  }

  public getStatus(): ConnectivityStatus {
    return { ...this.status }
  }

  public subscribe(listener: (status: ConnectivityStatus) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public async checkConnection(): Promise<ConnectivityStatus> {
    try {
      await hoaxDetectionApi.healthCheck()
      this.updateStatus({
        isConnected: true,
        lastChecked: new Date()
      })
    } catch (error) {
      this.updateStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      })
    }
    
    return this.getStatus()
  }

  private updateStatus(newStatus: ConnectivityStatus): void {
    const wasConnected = this.status.isConnected
    this.status = newStatus
    
    // Notify listeners if connection status changed
    if (wasConnected !== newStatus.isConnected) {
      this.notifyListeners()
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus())
      } catch (error) {
        console.error('Error in connectivity listener:', error)
      }
    })
  }

  private startMonitoring(): void {
    // Initial check
    this.checkConnection()
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkConnection()
    }, this.CHECK_INTERVAL)
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}

// Singleton instance
export const connectivityMonitor = new ConnectivityMonitor()
