import { create } from 'zustand'

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
}

interface PlannerState {
  selectedDate: Date
  tasks: Task[]
  isLoading: boolean

  setSelectedDate: (date: Date) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedDate: new Date(),
  tasks: [],
  isLoading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  setLoading: (isLoading) => set({ isLoading }),
}))
