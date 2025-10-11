import { supabase } from '@/lib/supabase/client'
import type { Distraction } from '@/lib/store/useFocusStore'

export interface FocusSessionInput {
  task_id: string
  start_time: string
  end_time: string
  duration: number
  distractions: Distraction[]
}

export interface FocusSession {
  id: string
  user_id: string
  task_id: string
  start_time: string
  end_time: string
  duration: number
  distractions: Distraction[]
  created_at: string
}

export const focusRepository = {
  async create(session: FocusSessionInput): Promise<FocusSession> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        ...session,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Update actual time for the task
    await this.updateActualTime(session.task_id, session.duration)

    return data
  },

  async updateActualTime(taskId: string, duration: number): Promise<void> {
    const { error } = await supabase.rpc('update_actual_time', {
      task_id_param: taskId,
      duration_param: duration,
    })

    if (error) throw error
  },

  async getByTaskId(taskId: string): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<FocusSession[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: false })

    if (error) throw error
    return data || []
  },
}
