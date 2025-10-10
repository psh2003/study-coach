'use client'

import { useEffect, useState, useRef } from 'react'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { Play, Pause, Square } from 'lucide-react'

export default function PomodoroTimer() {
  const {
    isSessionActive,
    currentTaskId,
    focusDuration,
    isPaused,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
  } = useFocusStore()

  const [timeRemaining, setTimeRemaining] = useState(focusDuration)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isSessionActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            // Time's up - switch to break or end
            if (!isBreak) {
              setIsBreak(true)
              return 5 * 60 // 5 minute break
            } else {
              endSession()
              return focusDuration
            }
          }
          return prev - 1
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
  }, [isSessionActive, isPaused, isBreak])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((focusDuration - timeRemaining) / focusDuration) * 100

  const handleStart = () => {
    if (!isSessionActive) {
      // For now, start without task ID (will be integrated with planner)
      startSession('temp-task-id')
      setTimeRemaining(focusDuration)
      setIsBreak(false)
    } else {
      if (isPaused) {
        resumeSession()
      } else {
        pauseSession()
      }
    }
  }

  const handleStop = () => {
    endSession()
    setTimeRemaining(focusDuration)
    setIsBreak(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">
        {isBreak ? '휴식 시간' : '집중 시간'}
      </h3>

      {/* Circular progress */}
      <div className="relative aspect-square max-w-xs mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={isBreak ? '#10b981' : '#0ea5e9'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">
              {formatTime(timeRemaining)}
            </div>
            {isSessionActive && (
              <div className="text-sm text-gray-500 mt-2">
                {isPaused ? '일시정지' : isBreak ? '휴식 중' : '집중 중'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleStart}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          {isSessionActive && !isPaused ? (
            <>
              <Pause className="w-5 h-5" />
              일시정지
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {isSessionActive ? '재개' : '시작'}
            </>
          )}
        </button>

        {isSessionActive && (
          <button
            onClick={handleStop}
            className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
