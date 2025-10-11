'use client'

import { useEffect, useState } from 'react'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { taskRepository, type TaskInput } from '@/lib/repositories/taskRepository'

export function useTasks() {
  const { selectedDate, tasks, setTasks, setLoading, addTask, updateTask, deleteTask } = usePlannerStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [selectedDate])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await taskRepository.getByDate(selectedDate)
      setTasks(data)
    } catch (err: any) {
      console.error('Failed to load tasks:', err)
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskInput: TaskInput) => {
    try {
      const newTask = await taskRepository.create(taskInput)
      addTask(newTask)
      return newTask
    } catch (err: any) {
      console.error('Failed to create task:', err)
      setError(err.message || 'Failed to create task')
      throw err
    }
  }

  const updateTaskById = async (id: string, updates: Partial<TaskInput>) => {
    try {
      const updatedTask = await taskRepository.update(id, updates)
      updateTask(id, updatedTask)
      return updatedTask
    } catch (err: any) {
      console.error('Failed to update task:', err)
      setError(err.message || 'Failed to update task')
      throw err
    }
  }

  const deleteTaskById = async (id: string) => {
    try {
      await taskRepository.delete(id)
      deleteTask(id)
    } catch (err: any) {
      console.error('Failed to delete task:', err)
      setError(err.message || 'Failed to delete task')
      throw err
    }
  }

  const toggleTaskComplete = async (id: string, isDone: boolean) => {
    try {
      const updatedTask = await taskRepository.toggleComplete(id, isDone)
      updateTask(id, updatedTask)
    } catch (err: any) {
      console.error('Failed to toggle task:', err)
      setError(err.message || 'Failed to toggle task')
      throw err
    }
  }

  return {
    tasks,
    error,
    loadTasks,
    createTask,
    updateTask: updateTaskById,
    deleteTask: deleteTaskById,
    toggleComplete: toggleTaskComplete,
  }
}
