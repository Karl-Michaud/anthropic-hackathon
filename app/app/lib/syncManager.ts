import {
  saveWhiteboardData,
  getWhiteboardData,
  markUserAsReturning,
  type WhiteboardData,
} from './supabase/queries'

const DEBOUNCE_DELAY = 3000 // 3 seconds

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

/**
 * SyncManager - Handles debounced sync to database
 */
class SyncManager {
  private debounceTimer: NodeJS.Timeout | null = null
  private syncStatus: SyncStatus = 'idle'
  private statusCallbacks: Set<(status: SyncStatus) => void> = new Set()

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.add(callback)
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback)
    }
  }

  /**
   * Update sync status and notify subscribers
   */
  private setStatus(status: SyncStatus) {
    this.syncStatus = status
    this.statusCallbacks.forEach((callback) => callback(status))
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.syncStatus
  }

  /**
   * Debounced save to database
   * Waits 3 seconds after last change before syncing
   */
  debouncedSave(userId: string, whiteboardData: WhiteboardData) {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Set new timer
    this.debounceTimer = setTimeout(async () => {
      await this.syncNow(userId, whiteboardData)
    }, DEBOUNCE_DELAY)
  }

  /**
   * Immediately sync to database (no debounce)
   */
  async syncNow(userId: string, whiteboardData: WhiteboardData): Promise<void> {
    try {
      this.setStatus('syncing')
      await saveWhiteboardData(userId, whiteboardData)
      this.setStatus('synced')

      // Auto-hide "synced" status after 2 seconds
      setTimeout(() => {
        if (this.syncStatus === 'synced') {
          this.setStatus('idle')
        }
      }, 2000)
    } catch (error) {
      console.error('Sync error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        raw: JSON.stringify(error, null, 2),
      })
      this.setStatus('error')
    }
  }

  /**
   * Load whiteboard data from database
   */
  async loadFromDatabase(userId: string): Promise<WhiteboardData | null> {
    try {
      const data = await getWhiteboardData(userId)
      if (!data) return null

      return {
        cells: data.cells || [],
        scholarships: data.scholarships || [],
        essays: data.essays || [],
        jsonOutputs: data.json_outputs || [],
        blockPositions: data.block_positions || [],
      }
    } catch (error) {
      console.error('Error loading from database:', error)
      return null
    }
  }

  /**
   * Check if user is first-time user
   */
  async isFirstTimeUser(userId: string): Promise<boolean> {
    try {
      const data = await getWhiteboardData(userId)
      return data?.is_first_time_user ?? true
    } catch (error) {
      console.error('Error checking first-time user status:', error)
      return true
    }
  }

  /**
   * Mark user as returning (no longer first-time)
   */
  async markAsReturning(userId: string): Promise<void> {
    try {
      await markUserAsReturning(userId)
    } catch (error) {
      console.error('Error marking user as returning:', error)
    }
  }

  /**
   * Cancel pending sync
   */
  cancelPendingSync() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

// Export singleton instance
export const syncManager = new SyncManager()
