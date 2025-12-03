'use client'

import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: TaskFormData) => void
  initialData?: TaskFormData
  startTime?: string
  endTime?: string
}

export interface TaskFormData {
  title: string
  category: string
  est_time: number
  start_time: string
  end_time: string
}

const CATEGORIES = ['수학', '영어', '과학', '국어', '사회', '기타']

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  startTime = '09:00',
  endTime = '10:00',
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(
    initialData || {
      title: '',
      category: '기타',
      est_time: 60,
      start_time: startTime,
      end_time: endTime,
    }
  )

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const calculateDuration = () => {
    const [startHour, startMinute] = formData.start_time.split(':').map(Number)
    const [endHour, endMinute] = formData.end_time.split(':').map(Number)
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-[0_0_30px_0px_rgba(82,255,134,0.2)] border border-[#A3A3A3]/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-[#A3A3A3]/20">
          <h3 className="text-xl font-bold text-[#F5F5F5]">학습 일정 추가</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#0D0D0D] rounded-lg transition-colors text-[#A3A3A3] hover:text-[#F5F5F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
              할 일 이름 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg text-[#F5F5F5] placeholder-[#A3A3A3]/50 focus:ring-2 focus:ring-[#52FF86] focus:border-[#52FF86] transition-all"
              placeholder="예: 알고리즘 문제 풀기"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
              과목/카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg text-[#F5F5F5] focus:ring-2 focus:ring-[#52FF86] focus:border-[#52FF86] transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0D0D0D] text-[#F5F5F5]">{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                시작 시간
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg text-[#F5F5F5] focus:ring-2 focus:ring-[#52FF86] focus:border-[#52FF86] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
                종료 시간
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg text-[#F5F5F5] focus:ring-2 focus:ring-[#52FF86] focus:border-[#52FF86] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
              예상 소요 시간
            </label>
            <div className="text-lg font-semibold text-[#52FF86]">
              {calculateDuration()}분
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg font-semibold text-[#F5F5F5] hover:bg-[#0D0D0D]/80 hover:border-[#A3A3A3]/50 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#52FF86] text-[#0D0D0D] rounded-lg font-bold hover:bg-[#52FF86]/80 transition-all shadow-[0_0_15px_0px_rgba(82,255,134,0.3)]"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
