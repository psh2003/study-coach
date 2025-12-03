import { create } from 'zustand'

export interface Distraction {
  type: 'posture' | 'phone' | 'absence' | 'drowsiness'
  timestamp: string
  duration?: number
}

interface FocusState {
  // ... existing fields
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
  drowsinessWarning: boolean

  // ... existing fields
  isWebcamActive: boolean
  webcamStream: MediaStream | null
  distractions: Distraction[]

  // Actions
  startSession: (taskId: string) => void
  endSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  setPostureWarning: (warning: boolean) => void
  setPhoneWarning: (warning: boolean) => void
  setAbsenceWarning: (warning: boolean) => void
  setDrowsinessWarning: (warning: boolean) => void
  addDistraction: (distraction: Distraction) => void
  incrementFocusTime: () => void
  resetSession: () => void
  activateWebcam: () => Promise<void>
  deactivateWebcam: () => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  // Initial state
  isSessionActive: false,
  currentTaskId: null,
  sessionStartTime: null,
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
  isPaused: false,

  postureWarning: false,
  phoneWarning: false,
  absenceWarning: false,
  drowsinessWarning: false,

  isWebcamActive: false,
  webcamStream: null,

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
    drowsinessWarning: false,
  }),

  // ... existing actions

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

  setDrowsinessWarning: (warning) => {
    set({ drowsinessWarning: warning })
    if (warning) {
      get().addDistraction({
        type: 'drowsiness',
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
    drowsinessWarning: false,
  }),

  activateWebcam: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })

      set({
        isWebcamActive: true,
        webcamStream: stream,
      })

      console.log('Webcam activated successfully')
    } catch (error) {
      console.error('Failed to activate webcam:', error)
      throw error
    }
  },

  deactivateWebcam: () => {
    const { webcamStream } = get()

    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => {
        track.stop()
        console.log(`Track ${track.kind} stopped`)
      })
    }

    set({
      isWebcamActive: false,
      webcamStream: null,
    })

    console.log('Webcam deactivated and stream cleared')
  },
}))
