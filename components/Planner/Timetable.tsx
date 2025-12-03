'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      '수학': 'bg-[#0D0D0D] border-[#52FF86] text-[#F5F5F5] shadow-[0_0_15px_0px_rgba(82,255,134,0.3)]',
      '영어': 'bg-[#0D0D0D] border-[#E140E1] text-[#F5F5F5] shadow-[0_0_15px_0px_rgba(225,64,225,0.3)]',
      '과학': 'bg-[#0D0D0D] border-rose-400 text-[#F5F5F5]',
      '기타': 'bg-[#0D0D0D] border-[#52FF86] text-[#F5F5F5] shadow-[0_0_15px_0px_rgba(82,255,134,0.3)]',
    }
    return colors[category || '기타'] || colors['기타']
  }

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <h2 className="text-xl font-bold text-[#F5F5F5]">오늘의 시간표</h2>
        <div className="bg-[#1A1A1A]/50 p-4 rounded-lg border border-[#A3A3A3]/10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateDate(-1)}
                className="p-1 hover:bg-[#1A1A1A] rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#A3A3A3]" />
              </motion.button>
              <p className="text-[#F5F5F5] text-base font-bold leading-tight">
                {format(selectedDate, 'EEEE, MMM d', { locale: undefined })}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateDate(1)}
                className="p-1 hover:bg-[#1A1A1A] rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
              </motion.button>
            </div>
            <button
              onClick={() => {
                setModalTimeRange({ start: '09:00', end: '10:00' })
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 text-sm text-[#52FF86] hover:text-[#52FF86]/80 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              New Block
            </button>
          </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-[#A3A3A3] font-light tracking-wider">LOADING...</div>
          </motion.div>
        )}

      {/* Timetable */}
      <div className="flex-1 overflow-y-auto pr-2 relative">
        <div
          ref={containerRef}
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time Grid */}
          <div>
            {timeSlots.map((slot, index) => {
              // Only show hour labels (not 30-minute marks)
              const showLabel = slot.minute === 0
              const displayHour = slot.hour >= 24 ? slot.hour - 24 : slot.hour
              const isPM = displayHour >= 12
              const displayHour12 = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour
              const timeLabel = `${displayHour12} ${isPM ? 'PM' : 'AM'}`

              return (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="h-[60px] flex"
                  data-time={slot.label}
                  onMouseDown={(e) => handleMouseDown(e, slot.label)}
                >
                  <div className="w-12 text-right pr-2 pt-[-4px] text-xs text-[#A3A3A3]">
                    {showLabel ? timeLabel : ''}
                  </div>
                  <div className="flex-1 border-t border-[#A3A3A3]/10 cursor-pointer hover:bg-[#1A1A1A]/30 transition-colors"></div>
                </div>
              )
            })}
          </div>

          {/* Study Blocks */}
          <div className="absolute inset-0 pl-12">
            <AnimatePresence>
              {tasks
                .filter((task) => task.start_time && task.end_time)
                .map((task, index) => {
                  const style = getBlockStyle(task)
                  const colorClass = getCategoryColor(task.category)
                  const categoryColor = task.category === '영어' ? '#E140E1' : task.category === '과학' ? 'rgb(251, 113, 133)' : '#52FF86'

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="absolute w-full"
                      style={style}
                    >
                      <div className={`h-full ml-2 mr-1 p-2 rounded-lg border-l-4 ${colorClass} cursor-pointer group hover:opacity-80 transition-all`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-[#F5F5F5]">{task.title}</p>
                            {task.category && (
                              <p className="text-xs" style={{ color: categoryColor }}>
                                {task.category}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStartFocus(task.id)}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title="Start Focus"
                            >
                              <Play className="w-3 h-3" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-4 h-2 rounded-full bg-[#F5F5F5]/50"></div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>

            {/* Drag preview - matching HTML template dashed block style */}
            <AnimatePresence>
              {isCreating && dragStart && dragEnd && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute w-full ml-2 mr-1"
                  style={{
                    top: `${Math.min(dragStart.y, dragEnd.y)}px`,
                    height: `${Math.abs(dragEnd.y - dragStart.y)}px`,
                  }}
                >
                  <div className="h-full p-2 rounded-lg bg-[#52FF86]/20 border-2 border-dashed border-[#52FF86] flex items-center justify-center">
                    <p className="text-xs text-[#52FF86] font-medium">
                      {dragStart.time} - {dragEnd.time}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
