import { create } from 'zustand'

export interface Distraction {
  type: 'posture' | 'phone' | 'absence'
  timestamp: string
  duration?: number
}

interface FocusState {
  // Session state
  isSessionActive: boolean
  currentTaskId: string | null
  sessionStartTime: Date | null
  focusDuration: number // in seconds
  breakDuration: number // in seconds
  isPaused: boolean

  // AI warnings
  postureWarning: boolean
  phoneWarning: boolean
  absenceWarning: boolean

  // Session data
  distractions: Distraction[]

  // Actions
  startSession: (taskId: string) => void
  endSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  setPostureWarning: (warning: boolean) => void
  setPhoneWarning: (warning: boolean) => void
  setAbsenceWarning: (warning: boolean) => void
  addDistraction: (distraction: Distraction) => void
  incrementFocusTime: () => void
  resetSession: () => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  // Initial state
  isSessionActive: false,
  currentTaskId: null,
  sessionStartTime: null,
  focusDuration: 25 * 60, // 25 minutes in seconds
  breakDuration: 5 * 60, // 5 minutes in seconds
  isPaused: false,

  postureWarning: false,
  phoneWarning: false,
  absenceWarning: false,

  distractions: [],

  // Actions
  startSession: (taskId) => set({
    isSessionActive: true,
    currentTaskId: taskId,
    sessionStartTime: new Date(),
    isPaused: false,
    distractions: [],
    postureWarning: false,
    phoneWarning: false,
    absenceWarning: false,
  }),

  endSession: () => set({
    isSessionActive: false,
    currentTaskId: null,
    sessionStartTime: null,
    isPaused: false,
  }),

  pauseSession: () => set({ isPaused: true }),

  resumeSession: () => set({ isPaused: false }),

  setPostureWarning: (warning) => {
    set({ postureWarning: warning })
    if (warning) {
      get().addDistraction({
        type: 'posture',
        timestamp: new Date().toISOString(),
      })
    }
  },

  setPhoneWarning: (warning) => {
    set({ phoneWarning: warning })
    if (warning) {
      get().addDistraction({
        type: 'phone',
        timestamp: new Date().toISOString(),
      })
    }
  },

  setAbsenceWarning: (warning) => {
    set({ absenceWarning: warning })
    if (warning) {
      get().addDistraction({
        type: 'absence',
        timestamp: new Date().toISOString(),
      })
    }
  },

  addDistraction: (distraction) => set((state) => ({
    distractions: [...state.distractions, distraction],
  })),

  incrementFocusTime: () => {
    // This would be called by a timer interval
  },

  resetSession: () => set({
    isSessionActive: false,
    currentTaskId: null,
    sessionStartTime: null,
    isPaused: false,
    distractions: [],
    postureWarning: false,
    phoneWarning: false,
    absenceWarning: false,
  }),
}))
