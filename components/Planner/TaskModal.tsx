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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">학습 일정 추가</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할 일 이름 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 알고리즘 문제 풀기"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              과목/카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <key={cat}>
                  <option value={cat}>{cat}</option>
                </key>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예상 소요 시간
            </label>
            <div className="text-lg font-semibold text-primary-600">
              {calculateDuration()}분
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
