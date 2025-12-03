'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Play, ChevronDown } from 'lucide-react'
import { useTimerStore } from '@/lib/store/useTimerStore'
import { usePlannerStore } from '@/lib/store/usePlannerStore'

export default function QuickStartButton() {
  const router = useRouter()
  const { startQuickFocus, startScheduledFocus } = useTimerStore()
  const { tasks } = usePlannerStore()
  const [showTaskSelector, setShowTaskSelector] = useState(false)

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => task.task_date === today && !task.is_done)

  const handleQuickStart = () => {
    startQuickFocus()
    router.push('/timer')
  }

  const handleTaskStart = (taskId: string, estimatedMinutes: number) => {
    startScheduledFocus(taskId, estimatedMinutes * 60)
    router.push('/timer')
    setShowTaskSelector(false)
  }

  return (
    <div className="w-full">
      {/* Main Quick Start Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        onClick={handleQuickStart}
        className="w-full py-8 bg-gradient-to-r from-[#52FF86] to-[#1DC960] rounded-2xl shadow-lg shadow-[#52FF86]/20 hover:shadow-[#52FF86]/30 transition-shadow"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0D0D0D]">지금 집중하기</h3>
            <p className="text-[#0D0D0D]/70 text-sm mt-1">25분 타이머 즉시 시작</p>
          </div>
        </div>
      </motion.button>

      {/* Task Selector Toggle */}
      {todayTasks.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowTaskSelector(!showTaskSelector)}
            className="w-full py-3 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span>또는 오늘의 할 일 선택하기</span>
            <motion.div
              animate={{ rotate: showTaskSelector ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          {/* Task List */}
          <AnimatePresence>
            {showTaskSelector && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {todayTasks.slice(0, 5).map((task) => (
                    <motion.button
                      key={task.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => handleTaskStart(task.id, task.est_time)}
                      className="w-full p-4 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] border border-[#A3A3A3]/10 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#F5F5F5] font-medium truncate group-hover:text-[#52FF86] transition-colors">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {task.category && (
                              <span className="text-xs text-[#A3A3A3] px-2 py-0.5 bg-[#0D0D0D] rounded">
                                {task.category}
                              </span>
                            )}
                            <span className="text-xs text-[#A3A3A3]">
                              {task.est_time}분
                            </span>
                            {task.start_time && (
                              <span className="text-xs text-[#A3A3A3]">
                                {task.start_time.substring(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Play className="w-5 h-5 text-[#52FF86] ml-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}

                  {todayTasks.length > 5 && (
                    <p className="text-center text-xs text-[#A3A3A3] py-2">
                      +{todayTasks.length - 5}개 더 있음
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
