'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { usePlannerStore } from '@/lib/store/usePlannerStore'

export default function QuickAddTask() {
  const { addTask } = usePlannerStore()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [estTime, setEstTime] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !estTime) return

    setIsSaving(true)

    const today = new Date().toISOString().split('T')[0]

    const newTask = {
      title: title.trim(),
      category: category.trim() || undefined,
      est_time: parseInt(estTime),
      task_date: today,
      is_done: false,
    }

    try {
      await addTask(newTask)

      // Reset form
      setTitle('')
      setCategory('')
      setEstTime('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to add task:', error)
      alert('할 일 추가에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setCategory('')
    setEstTime('')
    setIsOpen(false)
  }

  return (
    <div className="w-full">
      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-full py-3 px-4 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] border border-[#A3A3A3]/10 rounded-xl text-[#F5F5F5] font-medium transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          할 일 추가
        </motion.button>
      )}

      {/* Add Task Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#1A1A1A]/50 border border-[#A3A3A3]/10 rounded-xl space-y-3">
              {/* Title Input */}
              <div>
                <label className="block text-sm text-[#A3A3A3] mb-1">
                  할 일 제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 알고리즘 문제 풀기"
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#A3A3A3]/20 rounded-lg text-[#F5F5F5] placeholder:text-[#A3A3A3]/50 focus:outline-none focus:border-[#52FF86]/50 transition-colors"
                  autoFocus
                  disabled={isSaving}
                />
              </div>

              {/* Category and Est Time Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category Input */}
                <div>
                  <label className="block text-sm text-[#A3A3A3] mb-1">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="예: 알고리즘"
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#A3A3A3]/20 rounded-lg text-[#F5F5F5] placeholder:text-[#A3A3A3]/50 focus:outline-none focus:border-[#52FF86]/50 transition-colors"
                    disabled={isSaving}
                  />
                </div>

                {/* Estimated Time Input */}
                <div>
                  <label className="block text-sm text-[#A3A3A3] mb-1">
                    예상 시간(분) *
                  </label>
                  <input
                    type="number"
                    value={estTime}
                    onChange={(e) => setEstTime(e.target.value)}
                    placeholder="25"
                    min="1"
                    max="480"
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#A3A3A3]/20 rounded-lg text-[#F5F5F5] placeholder:text-[#A3A3A3]/50 focus:outline-none focus:border-[#52FF86]/50 transition-colors"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-[#0D0D0D] border border-[#A3A3A3]/20 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#A3A3A3]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  취소
                </motion.button>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!title.trim() || !estTime || isSaving}
                  className="flex-1 py-2 bg-[#52FF86] text-[#0D0D0D] rounded-lg font-medium hover:bg-[#1DC960] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <Plus className="w-4 h-4" />
                      추가
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
