'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { useTasks } from '@/lib/hooks/useTasks'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { Play, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import TaskModal, { type TaskFormData } from './TaskModal'

interface TimeSlot {
  hour: number
  minute: number
  label: string
}

const SLOT_HEIGHT = 60 // pixels per 30-minute slot
const START_HOUR = 6
const END_HOUR = 26 // 2 AM next day

export default function Timetable() {
  const { tasks, selectedDate, setSelectedDate, isLoading } = usePlannerStore()
  const { createTask, deleteTask: removeTask } = useTasks()
  const { startSession } = useFocusStore()

  const [isCreating, setIsCreating] = useState(false)
  const [dragStart, setDragStart] = useState<{ y: number; time: string } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ y: number; time: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTimeRange, setModalTimeRange] = useState<{ start: string; end: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate time slots
  const timeSlots: TimeSlot[] = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const displayHour = hour >= 24 ? hour - 24 : hour
    timeSlots.push({
      hour,
      minute: 0,
      label: `${displayHour.toString().padStart(2, '0')}:00`,
    })
    timeSlots.push({
      hour,
      minute: 30,
      label: `${displayHour.toString().padStart(2, '0')}:30`,
    })
  }

  const handleMouseDown = (e: React.MouseEvent, time: string) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top
    setDragStart({ y, time })
    setIsCreating(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreating || !dragStart) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top
    const slotIndex = Math.floor(y / SLOT_HEIGHT)
    const slot = timeSlots[slotIndex]
    if (slot) {
      setDragEnd({ y, time: slot.label })
    }
  }

  const handleMouseUp = () => {
    if (isCreating && dragStart && dragEnd) {
      // Open modal with time range
      const startTime = dragStart.time
      const endTime = dragEnd.time
      setModalTimeRange({ start: startTime, end: endTime })
      setIsModalOpen(true)
    }
    setIsCreating(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const handleTaskSave = async (taskData: TaskFormData) => {
    try {
      await createTask({
        ...taskData,
        task_date: format(selectedDate, 'yyyy-MM-dd'),
      })
      setIsModalOpen(false)
      setModalTimeRange(null)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleStartFocus = (taskId: string) => {
    startSession(taskId)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('이 작업을 삭제하시겠습니까?')) {
      try {
        await removeTask(taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const getBlockStyle = (task: any) => {
    if (!task.start_time || !task.end_time) return {}

    const [startHour, startMinute] = task.start_time.split(':').map(Number)
    const [endHour, endMinute] = task.end_time.split(':').map(Number)

    const startSlotIndex = ((startHour - START_HOUR) * 2) + (startMinute >= 30 ? 1 : 0)
    const endSlotIndex = ((endHour - START_HOUR) * 2) + (endMinute >= 30 ? 1 : 0)

    const top = startSlotIndex * SLOT_HEIGHT
    const height = (endSlotIndex - startSlotIndex) * SLOT_HEIGHT

    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      '수학': 'bg-blue-100 border-blue-400 text-blue-800',
      '영어': 'bg-green-100 border-green-400 text-green-800',
      '과학': 'bg-purple-100 border-purple-400 text-purple-800',
      '기타': 'bg-gray-100 border-gray-400 text-gray-800',
    }
    return colors[category || '기타'] || colors['기타']
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {format(selectedDate, 'yyyy년 MM월 dd일')}
            </h2>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => {
              setModalTimeRange({ start: '09:00', end: '10:00' })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            작업 추가
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        )}

      <div
        ref={containerRef}
        className="relative border border-gray-200 rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Time slots */}
        {timeSlots.map((slot) => (
          <div
            key={`${slot.hour}-${slot.minute}`}
            className="relative flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            style={{ height: `${SLOT_HEIGHT}px` }}
            onMouseDown={(e) => handleMouseDown(e, slot.label)}
          >
            <div className="w-20 flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 border-r border-gray-200">
              {slot.label}
            </div>
            <div className="flex-1 relative">
              {/* Empty slot for dragging */}
            </div>
          </div>
        ))}

        {/* Task blocks */}
        {tasks
          .filter((task) => task.start_time && task.end_time)
          .map((task) => {
            const style = getBlockStyle(task)
            const colorClass = getCategoryColor(task.category)

            return (
              <div
                key={task.id}
                className={`absolute left-20 right-4 border-l-4 rounded-r-lg p-3 ${colorClass} cursor-pointer hover:shadow-lg transition-shadow`}
                style={style}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                    {task.category && (
                      <span className="text-xs opacity-75">{task.category}</span>
                    )}
                    <div className="text-xs mt-1 opacity-75">
                      예상: {task.est_time}분 | 실제: {task.actual_time}분
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartFocus(task.id)}
                      className="p-1.5 rounded hover:bg-white/50 transition-colors"
                      title="집중 시작"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded hover:bg-white/50 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

        {/* Drag preview */}
        {isCreating && dragStart && dragEnd && (
          <div
            className="absolute left-20 right-4 bg-primary-100 border-l-4 border-primary-400 rounded-r-lg opacity-50 pointer-events-none"
            style={{
              top: `${Math.min(dragStart.y, dragEnd.y)}px`,
              height: `${Math.abs(dragEnd.y - dragStart.y)}px`,
            }}
          />
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setModalTimeRange(null)
        }}
        onSave={handleTaskSave}
        startTime={modalTimeRange?.start}
        endTime={modalTimeRange?.end}
      />
      </div>
    </>
  )
}
