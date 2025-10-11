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

  const saveSession = useCallback(async (duration: number) => {
    if (!currentTaskId || !sessionStartTime) {
      throw new Error('No active session to save')
    }

    const endTime = new Date()
    const sessionInput: FocusSessionInput = {
      task_id: currentTaskId,
      start_time: sessionStartTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: Math.floor(duration / 60), // Convert seconds to minutes
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
