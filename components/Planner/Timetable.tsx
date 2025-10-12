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
      '수학': 'bg-accent-blue/20 border-accent-blue text-accent-blue',
      '영어': 'bg-accent-green/20 border-accent-green text-accent-green',
      '과학': 'bg-accent-purple/20 border-accent-purple text-accent-purple',
      '기타': 'bg-white/10 border-white/30 text-white/80',
    }
    return colors[category || '기타'] || colors['기타']
  }

  return (
    <>
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateDate(-1)}
              className="p-2 glass rounded-lg hover:glass-strong transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <h2 className="text-2xl font-bold tracking-tight">
              {format(selectedDate, 'yyyy년 MM월 dd일')}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateDate(1)}
              className="p-2 glass rounded-lg hover:glass-strong transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setModalTimeRange({ start: '09:00', end: '10:00' })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 glass-strong rounded-lg hover:shadow-glow-md transition-all font-light tracking-wider text-sm"
          >
            <Plus className="w-5 h-5" />
            ADD TASK
          </motion.button>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-white/60 font-light tracking-wider">LOADING...</div>
          </motion.div>
        )}

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative border border-white/10 rounded-lg glass overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Time slots */}
        {timeSlots.map((slot, index) => (
          <motion.div
            key={`${slot.hour}-${slot.minute}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01 }}
            className="relative flex border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
            style={{ height: `${SLOT_HEIGHT}px` }}
            onMouseDown={(e) => handleMouseDown(e, slot.label)}
          >
            <div className="w-20 flex-shrink-0 px-4 py-2 text-sm font-light text-white/60 border-r border-white/10">
              {slot.label}
            </div>
            <div className="flex-1 relative">
              {/* Empty slot for dragging */}
            </div>
          </motion.div>
        ))}

        {/* Task blocks */}
        <AnimatePresence>
          {tasks
            .filter((task) => task.start_time && task.end_time)
            .map((task, index) => {
              const style = getBlockStyle(task)
              const colorClass = getCategoryColor(task.category)

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`absolute left-20 right-4 border-l-4 rounded-r-lg p-3 ${colorClass} cursor-pointer backdrop-blur-sm`}
                  style={style}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                      {task.category && (
                        <span className="text-xs opacity-75 font-light">{task.category}</span>
                      )}
                      <div className="text-xs mt-1 opacity-75 font-light">
                        Est: {task.est_time}m | Actual: {task.actual_time}m
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleStartFocus(task.id)}
                        className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        title="Start Focus"
                      >
                        <Play className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </AnimatePresence>

        {/* Drag preview */}
        <AnimatePresence>
          {isCreating && dragStart && dragEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute left-20 right-4 bg-accent-blue/30 border-l-4 border-accent-blue rounded-r-lg pointer-events-none backdrop-blur-sm"
              style={{
                top: `${Math.min(dragStart.y, dragEnd.y)}px`,
                height: `${Math.abs(dragEnd.y - dragStart.y)}px`,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

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
