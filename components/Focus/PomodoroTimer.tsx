'use client'

import { useEffect, useState, useRef } from 'react'
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">뽀모도로 타이머</h3>
        <div className="text-center py-8">
          <Play className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">타임테이블에서</p>
          <p className="text-gray-600">"집중 시작" 버튼을 눌러주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">
          {isBreak ? '휴식 시간' : '집중 시간'}
        </h3>
        {currentTask && (
          <p className="text-sm text-gray-600 mt-1">
            {currentTask.title}
          </p>
        )}
      </div>

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
          onClick={handlePauseResume}
          disabled={isSaving}
          className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" />
              재개
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              일시정지
            </>
          )}
        </button>

        <button
          onClick={handleStop}
          disabled={isSaving}
          className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <span className="text-sm">저장 중...</span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">완료</span>
            </>
          )}
        </button>
      </div>

      {absenceWarning && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm text-center">
          자리를 비우셨네요. 타이머가 일시정지되었습니다.
        </div>
      )}
    </div>
  )
}
