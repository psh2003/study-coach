'use client'

import { motion } from 'framer-motion'
import { Play, Pause, CheckCircle } from 'lucide-react'

interface TimerControlsProps {
  isPaused: boolean
  isSaving?: boolean
  onPauseResume: () => void
  onComplete: () => void
}

export default function TimerControls({
  isPaused,
  isSaving = false,
  onPauseResume,
  onComplete,
}: TimerControlsProps) {
  return (
    <div className="flex gap-3 w-full max-w-md" role="group" aria-label="타이머 컨트롤">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPauseResume}
        disabled={isSaving}
        aria-label={isPaused ? '타이머 재개' : '타이머 일시정지'}
        aria-pressed={!isPaused}
        className="flex-1 py-4 bg-[#1A1A1A]/50 border border-[#A3A3A3]/10 rounded-xl font-medium hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-[#F5F5F5]"
      >
        {isPaused ? (
          <>
            <Play className="w-5 h-5" aria-hidden="true" />
            재개
          </>
        ) : (
          <>
            <Pause className="w-5 h-5" aria-hidden="true" />
            일시정지
          </>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComplete}
        disabled={isSaving}
        aria-label="집중 세션 완료"
        aria-busy={isSaving}
        className="px-6 py-4 bg-[#52FF86]/20 border border-[#52FF86]/30 text-[#52FF86] rounded-xl font-medium hover:bg-[#52FF86]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            저장중...
          </motion.span>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            완료
          </>
        )}
      </motion.button>
    </div>
  )
}
