'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTimerStore } from '@/lib/store/useTimerStore'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { useFocusSession } from '@/lib/hooks/useFocusSession'
import CircularProgress from './CircularProgress'
import TimerControls from './TimerControls'

export default function FullScreenTimer() {
  const router = useRouter()
  const {
    currentSession,
    mode,
    exitFullScreen,
    updateElapsed,
    completeSession,
  } = useTimerStore()

  const { tasks } = usePlannerStore()
  const { absenceWarning, phoneWarning, drowsinessWarning, deactivateWebcam } = useFocusStore()

  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  const currentTask = currentSession?.taskId
    ? tasks.find(t => t.id === currentSession.taskId)
    : null

  // Initialize timer
  useEffect(() => {
    if (currentSession) {
      // Only set initial time if it hasn't been set or if it's a new session
      // We can use a ref to track the last session ID if needed, 
      // but relying on the dependency array with ID should be enough if we trust ID changes.
      // However, to be safe and avoid resetting on re-mounts if we want to persist,
      // we should calculate remaining based on elapsed.

      const remaining = Math.max(0, currentSession.duration - currentSession.elapsed)
      setTimeRemaining(remaining)
      setElapsedTime(currentSession.elapsed)
    }
  }, [currentSession?.id]) // Only re-run when session ID changes

  // Callback handlers (defined before useEffect)
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      if (absenceWarning) useFocusStore.getState().setAbsenceWarning(false)
      if (phoneWarning) useFocusStore.getState().setPhoneWarning(false)
      if (drowsinessWarning) useFocusStore.getState().setDrowsinessWarning(false)
    }
    setIsPaused(prev => !prev)
  }, [isPaused, absenceWarning, phoneWarning, drowsinessWarning])

  const { saveSession } = useFocusSession()
  const [isSaving, setIsSaving] = useState(false)
  const [newBadges, setNewBadges] = useState<any[]>([])

  // ...

  const handleComplete = useCallback(() => {
    // Just switch mode to 'completed' to show the modal
    // Actual saving and badge checking happens in CompletionModal
    completeSession()
  }, [completeSession])

  const handleExit = useCallback(() => {
    if (confirm('집중 세션을 종료하시겠습니까?')) {
      exitFullScreen()
      router.push('/dashboard')
    }
  }, [exitFullScreen, router, deactivateWebcam])

  // Auto-pause when user is absent or phone detected or drowsy
  useEffect(() => {
    if ((absenceWarning || phoneWarning || drowsinessWarning) && !isPaused) {
      setIsPaused(true)
    }
  }, [absenceWarning, phoneWarning, drowsinessWarning]) // Only run when warning state changes, allowing manual resume

  // Timer countdown
  useEffect(() => {
    if (mode === 'focus' && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            deactivateWebcam() // Turn off webcam when timer ends naturally
            handleComplete()
            return 0
          }
          return prev - 1
        })

        setElapsedTime(prev => {
          const newElapsed = prev + 1
          updateElapsed(newElapsed)
          return newElapsed
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mode, isPaused, timeRemaining, updateElapsed, handleComplete])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit()
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        handlePauseResume()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleExit, handlePauseResume])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = currentSession
    ? ((currentSession.duration - timeRemaining) / currentSession.duration) * 100
    : 0

  if (!currentSession) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#0A0A0A] z-50 flex flex-col items-center justify-center p-4 md:p-8"
    >
      {/* Exit hint */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 text-[#A3A3A3] text-xs md:text-sm">
        ESC를 눌러 종료
      </div>

      {/* Task title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTask?.title || 'quick-focus'}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-6 md:mb-8 text-center px-4"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[#F5F5F5] mb-2">
            {currentTask?.title || '집중 시간'}
          </h2>
          {currentTask?.category && (
            <p className="text-sm md:text-base text-[#A3A3A3]">{currentTask.category}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Circular Timer */}
      <div className="mb-8 md:mb-12">
        <CircularProgress progress={progress} radius={120}>
          <div className="text-center">
            <motion.div
              key={timeRemaining}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold text-[#F5F5F5] tabular-nums"
              style={{ letterSpacing: '-0.02em' }}
            >
              {formatTime(timeRemaining)}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isPaused ? 'paused' : 'focus'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs md:text-sm text-[#A3A3A3] mt-2 md:mt-3 font-light tracking-wider"
              >
                {isPaused ? '일시정지됨' : '집중중'}
              </motion.div>
            </AnimatePresence>
          </div>
        </CircularProgress>
      </div>

      {/* Controls */}
      <TimerControls
        isPaused={isPaused}
        isSaving={isSaving}
        onPauseResume={handlePauseResume}
        onComplete={handleComplete}
      />

      {/* Absence, Phone & Drowsiness warning */}
      <AnimatePresence>
        {(absenceWarning || phoneWarning || drowsinessWarning) && (
          <motion.div
            initial={{ opacity: 0, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, x: '-50%', y: '-40%' }}
            className={`absolute top-1/2 left-1/2 p-6 border rounded-xl text-lg font-medium text-center max-w-md z-50 backdrop-blur-md shadow-2xl ${phoneWarning
              ? 'bg-[#DC2626]/20 border-[#DC2626]/30 text-[#DC2626]'
              : drowsinessWarning
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/30 text-[#8B5CF6]'
                : 'bg-[#FA5D29]/20 border-[#FA5D29]/30 text-[#FA5D29]'
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl">
                {phoneWarning ? '📱' : drowsinessWarning ? '😴' : '⚠️'}
              </span>
              <span>
                {phoneWarning
                  ? '스마트폰 감지 - 집중해 주세요!'
                  : drowsinessWarning
                    ? '졸음 감지 - 잠시 스트레칭 어떠세요?'
                    : '자리 비움 감지 - 타이머 자동 일시정지'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
