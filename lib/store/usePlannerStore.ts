import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export interface Task {
  id: string
  title: string
  category: string | null
  est_time: number
  actual_time: number
  task_date: string
  is_done: boolean
  start_time: string | null
  end_time: string | null
  user_id: string
  created_at: string
}

interface PlannerState {
  selectedDate: Date
  tasks: Task[]
  isLoading: boolean

  setSelectedDate: (date: Date) => void
  fetchTasks: (date: string) => Promise<void>
  addTask: (task: Omit<TaskInsert, 'id' | 'created_at' | 'user_id'>) => Promise<void>
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  selectedDate: new Date(),
  tasks: [],
  isLoading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchTasks: async (date) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_date', date)
        .order('created_at', { ascending: true })

      if (error) throw error

      set({ tasks: data as Task[] })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addTask: async (taskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const newTask: TaskInsert = {
        ...taskData,
        user_id: user.id,
        actual_time: 0,
        is_done: false,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask as any)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: [...state.tasks, data as Task],
      }))
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    }
  },

  updateTask: async (id, updates) => {
    try {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } as Task : task
        ),
      }))

      const { error } = await supabase
        .from('tasks')
        .update(updates as any)
        .eq('id', id)

      if (error) {
        // Revert on error (would need previous state, but for now just refetch or log)
        console.error('Failed to update task:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  },

  deleteTask: async (id) => {
    try {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }))

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Failed to delete task:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    const newIsDone = !task.is_done

    try {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, is_done: newIsDone } : t
        ),
      }))

      const { error } = await supabase
        .from('tasks')
        .update({ is_done: newIsDone } as any)
        .eq('id', id)

      if (error) {
        console.error('Failed to toggle task:', error)
        // Revert
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, is_done: !newIsDone } : t
          ),
        }))
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}))
