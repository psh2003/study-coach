'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CheckCircle, Coffee, Repeat } from 'lucide-react'
import { useTimerStore, type TimerSession } from '@/lib/store/useTimerStore'
import { useFocusSession } from '@/lib/hooks/useFocusSession'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { useState } from 'react'

interface CompletionModalProps {
  session: TimerSession
  onClose: () => void
}

export default function CompletionModal({ session, onClose }: CompletionModalProps) {
  const router = useRouter()
  const { startQuickFocus, endSession } = useTimerStore()
  const { saveSession } = useFocusSession()
  const { distractions } = useFocusStore()
  const [isSaving, setIsSaving] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}시간 ${mins}분 ${secs}초`
    }
    return `${mins}분 ${secs}초`
  }

  const handleContinue = async () => {
    await handleSave()
    startQuickFocus()
    onClose()
  }

  const handleBreak = async () => {
    await handleSave()
    // TODO: Start break timer
    router.push('/dashboard')
  }

  const handleFinish = async () => {
    await handleSave()
    endSession()
    router.push('/dashboard')
  }

  const handleSave = async () => {
    console.log('handleSave called', { isSaving, session })
    if (isSaving) return

    // If no task ID (quick focus), we can't save to a specific task yet
    // TODO: Handle quick focus save (maybe assign to default task or prompt user)
    if (!session.taskId) {
      console.log('Quick focus session completed (no task ID)')
      // For now, let's try to save it anyway if the backend supports null task_id or we assign a default
      // But based on schema, task_id might be required.
      // Let's check if we can save without task_id or if we need to enforce it.
    }

    setIsSaving(true)
    try {
      console.log('Calling saveSession with:', session.elapsed, session.taskId, session.startTime)
      await saveSession(session.elapsed, session.taskId, session.startTime)
      console.log('Session saved successfully')
    } catch (error) {
      console.error('Failed to save session:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] p-8 rounded-2xl max-w-md w-full border border-[#A3A3A3]/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#52FF86]/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[#52FF86]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#52FF86] to-[#1DC960] bg-clip-text text-transparent"
        >
          🎉 축하합니다!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-[#F5F5F5] text-center mb-8"
        >
          집중 완료
        </motion.p>

        {/* Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0D0D0D]/50 rounded-xl p-6 mb-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[#A3A3A3]">집중 시간</span>
            <span className="text-[#52FF86] font-bold text-lg">
              {formatTime(session.elapsed)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A3A3A3]">방해 요소</span>
            <span className="text-[#F5F5F5] font-bold text-lg">
              {distractions.length}회
            </span>
          </div>

          {session.elapsed >= session.duration && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="pt-4 border-t border-[#A3A3A3]/10 text-center"
            >
              <span className="text-[#FFD700] text-2xl">⭐</span>
              <p className="text-[#FFD700] text-sm mt-1">목표 달성!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={handleBreak}
            disabled={isSaving}
            className="w-full py-4 bg-[#1A1A1A] border border-[#A3A3A3]/20 rounded-xl text-[#F5F5F5] font-medium hover:bg-[#252525] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Coffee className="w-5 h-5" />
            5분 휴식
          </button>

          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-[#52FF86] to-[#1DC960] rounded-xl text-[#0D0D0D] font-bold hover:shadow-lg hover:shadow-[#52FF86]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Repeat className="w-5 h-5" />
            계속 집중
          </button>

          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="w-full py-4 bg-transparent border border-[#52FF86]/30 rounded-xl text-[#52FF86] font-medium hover:bg-[#52FF86]/10 transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장중...' : '대시보드로'}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
