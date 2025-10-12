'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { useFocusSession } from '@/lib/hooks/useFocusSession'
import { Play, Pause, Square, CheckCircle } from 'lucide-react'

export default function PomodoroTimer() {
  const {
    isSessionActive,
    currentTaskId,
    focusDuration,
    isPaused,
    absenceWarning,
    pauseSession,
    resumeSession,
  } = useFocusStore()

  const { saveSession } = useFocusSession()
  const { tasks } = usePlannerStore()

  const [timeRemaining, setTimeRemaining] = useState(focusDuration)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isBreak, setIsBreak] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  const currentTask = tasks.find(t => t.id === currentTaskId)

  // Auto-pause when user is absent
  useEffect(() => {
    if (absenceWarning && isSessionActive && !isPaused) {
      pauseSession()
    }
  }, [absenceWarning, isSessionActive, isPaused, pauseSession])

  // Reset when session starts
  useEffect(() => {
    if (isSessionActive) {
      setTimeRemaining(focusDuration)
      setElapsedTime(0)
      setIsBreak(false)
    }
  }, [isSessionActive, focusDuration])

  // Timer interval
  useEffect(() => {
    if (isSessionActive && !isPaused && !absenceWarning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            // Time's up - switch to break or complete
            if (!isBreak) {
              setIsBreak(true)
              return 5 * 60 // 5 minute break
            } else {
              handleSessionComplete()
              return focusDuration
            }
          }
          return prev - 1
        })

        setElapsedTime(prev => prev + 1)
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
  }, [isSessionActive, isPaused, isBreak, absenceWarning])

  const handleSessionComplete = async () => {
    if (!currentTaskId) return

    setIsSaving(true)
    try {
      await saveSession(elapsedTime)
      alert('집중 세션이 저장되었습니다!')
    } catch (error) {
      console.error('Failed to save session:', error)
      alert('세션 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
      setIsBreak(false)
      setElapsedTime(0)
      setTimeRemaining(focusDuration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((focusDuration - timeRemaining) / focusDuration) * 100

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession()
    } else {
      pauseSession()
    }
  }

  const handleStop = async () => {
    if (confirm('세션을 종료하고 저장하시겠습니까?')) {
      await handleSessionComplete()
    }
  }

  if (!isSessionActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="text-xl font-bold mb-6 tracking-tight">POMODORO TIMER</h3>
        <div className="text-center py-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Play className="w-16 h-16 mx-auto text-white/40 mb-4" />
          </motion.div>
          <p className="text-white/60 mb-2 font-light tracking-wide">SELECT A TASK FROM</p>
          <p className="text-white/60 font-light tracking-wide">THE TIMETABLE</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="mb-6">
        <motion.h3
          key={isBreak ? 'break' : 'focus'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold tracking-tight"
        >
          {isBreak ? 'BREAK TIME' : 'FOCUS TIME'}
        </motion.h3>
        <AnimatePresence mode="wait">
          {currentTask && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/60 mt-1 font-light tracking-wide"
            >
              {currentTask.title}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Circular progress */}
      <div className="relative aspect-square max-w-xs mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={isBreak ? '#10b981' : '#3b82f6'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${isBreak ? '#10b981' : '#3b82f6'})`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              key={timeRemaining}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold tracking-tight"
            >
              {formatTime(timeRemaining)}
            </motion.div>
            <AnimatePresence mode="wait">
              {isSessionActive && (
                <motion.div
                  key={isPaused ? 'paused' : isBreak ? 'break' : 'focus'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-white/60 mt-2 font-light tracking-wider"
                >
                  {isPaused ? 'PAUSED' : isBreak ? 'BREAK' : 'FOCUSING'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePauseResume}
          disabled={isSaving}
          className="flex-1 py-3 glass-strong rounded-lg font-light hover:shadow-glow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 tracking-wider text-sm"
        >
          <AnimatePresence mode="wait">
            {isPaused ? (
              <motion.div
                key="play"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                RESUME
              </motion.div>
            ) : (
              <motion.div
                key="pause"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                PAUSE
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          disabled={isSaving}
          className="px-4 py-3 bg-accent-green/20 border border-accent-green/30 text-accent-green rounded-lg font-light hover:bg-accent-green/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 tracking-wider text-sm"
        >
          {isSaving ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              SAVING...
            </motion.span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              DONE
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {absenceWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 glass-strong border border-accent-orange/30 rounded-lg text-accent-orange text-sm text-center font-light tracking-wide"
          >
            USER AWAY - TIMER PAUSED
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
