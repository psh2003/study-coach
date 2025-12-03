import { create } from 'zustand'

export interface TimerSession {
  id: string
  taskId?: string
  startTime: Date
  duration: number // in seconds
  elapsed: number
  pausedTime: number
}

interface TimerState {
  // Timer Mode
  mode: 'idle' | 'focus' | 'break' | 'completed'
  isFullScreen: boolean

  // Session
  currentSession: TimerSession | null

  // Actions
  startQuickFocus: () => void
  startScheduledFocus: (taskId: string, duration?: number) => void
  pauseSession: () => void
  resumeSession: () => void
  completeSession: () => void
  endSession: () => void
  enterFullScreen: () => void
  exitFullScreen: () => void
  updateElapsed: (elapsed: number) => void
  resetTimer: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  // Initial state
  mode: 'idle',
  isFullScreen: false,
  currentSession: null,

  // Actions
  startQuickFocus: () => {
    console.log('Starting quick focus session')
    const sessionId = `session_${Date.now()}`
    set({
      mode: 'focus',
      currentSession: {
        id: sessionId,
        startTime: new Date(),
        duration: 25 * 60, // 25 minutes default
        elapsed: 0,
        pausedTime: 0,
      },
    })
  },

  startScheduledFocus: (taskId: string, duration = 25 * 60) => {
    const sessionId = `session_${Date.now()}`
    set({
      mode: 'focus',
      currentSession: {
        id: sessionId,
        taskId,
        startTime: new Date(),
        duration,
        elapsed: 0,
        pausedTime: 0,
      },
    })
  },

  pauseSession: () => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          pausedTime: currentSession.pausedTime + 1,
        },
      })
    }
  },

  resumeSession: () => {
    // Just keep the current session active
    // Pause/resume is handled by the timer component
  },

  completeSession: () => {
    set({
      mode: 'completed',
    })
  },

  endSession: () => {
    set({
      mode: 'idle',
      currentSession: null,
      isFullScreen: false,
    })
  },

  enterFullScreen: () => {
    set({ isFullScreen: true })
  },

  exitFullScreen: () => {
    set({ isFullScreen: false })
  },

  updateElapsed: (elapsed: number) => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          elapsed,
        },
      })
    }
  },

  resetTimer: () => {
    set({
      mode: 'idle',
      isFullScreen: false,
      currentSession: null,
    })
  },
}))
