'use client'

import { useCallback } from 'react'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { focusRepository, type FocusSessionInput } from '@/lib/repositories/focusRepository'

export function useFocusSession() {
  const {
    isSessionActive,
    currentTaskId,
    sessionStartTime,
    distractions,
    startSession,
    endSession,
    resetSession,
  } = useFocusStore()

  const saveSession = useCallback(async (duration: number, taskId?: string, startTime?: Date) => {
    const targetTaskId = taskId || currentTaskId
    const targetStartTime = startTime || sessionStartTime

    if (!targetTaskId || !targetStartTime) {
      console.warn('No active session or task ID to save')
      return null
    }

    const endTime = new Date()
    const sessionInput: FocusSessionInput = {
      task_id: targetTaskId,
      start_time: targetStartTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: Math.max(1, Math.round(duration / 60)), // Convert seconds to minutes, min 1 minute
      distractions,
    }

    try {
      const session = await focusRepository.create(sessionInput)
      resetSession()
      return session
    } catch (error) {
      console.error('Failed to save focus session:', error)
      throw error
    }
  }, [currentTaskId, sessionStartTime, distractions, resetSession])

  return {
    isSessionActive,
    currentTaskId,
    sessionStartTime,
    distractions,
    startSession,
    endSession,
    saveSession,
  }
}
