import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Task } from '@/lib/store/usePlannerStore'

export interface TaskInput {
  title: string
  category?: string | null
  est_time: number
  task_date: string
  start_time?: string | null
  end_time?: string | null
}

export const taskRepository = {
  async create(task: TaskInput): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByDate(date: Date): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const dateStr = format(date, 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_date', dateStr)
      .order('start_time', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async toggleComplete(id: string, isDone: boolean): Promise<Task> {
    return this.update(id, { is_done: isDone })
  },
}
