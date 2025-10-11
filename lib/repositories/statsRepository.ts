import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, format, subDays } from 'date-fns'

export interface DailyFocusStat {
  date: string
  totalMinutes: number
  sessionCount: number
}

export interface DistractionStat {
  type: 'posture' | 'phone' | 'absence'
  count: number
  percentage: number
}

export interface CategoryStat {
  category: string
  totalMinutes: number
  avgFocusTime: number
  distractionCount: number
  sessionCount: number
}

export interface AchievementStat {
  taskId: string
  title: string
  category: string | null
  estTime: number
  actualTime: number
  achievementRate: number
}

export const statsRepository = {
  /**
   * Get daily focus time for a date range
   */
  async getDailyFocusTime(startDate: Date, endDate: Date): Promise<DailyFocusStat[]> {
    const { data: sessions, error } = await supabase
      .from('focus_sessions')
      .select('start_time, duration')
      .gte('start_time', startOfDay(startDate).toISOString())
      .lte('start_time', endOfDay(endDate).toISOString())
      .order('start_time')

    if (error) throw error

    // Group by date
    const grouped = new Map<string, { totalMinutes: number; count: number }>()

    sessions?.forEach((session) => {
      const dateKey = format(new Date(session.start_time), 'yyyy-MM-dd')
      const existing = grouped.get(dateKey) || { totalMinutes: 0, count: 0 }
      grouped.set(dateKey, {
        totalMinutes: existing.totalMinutes + session.duration,
        count: existing.count + 1,
      })
    })

    return Array.from(grouped.entries()).map(([date, stats]) => ({
      date,
      totalMinutes: stats.totalMinutes,
      sessionCount: stats.count,
    }))
  },

  /**
   * Get distraction breakdown statistics
   */
  async getDistractionStats(startDate: Date, endDate: Date): Promise<DistractionStat[]> {
    const { data: sessions, error } = await supabase
      .from('focus_sessions')
      .select('distractions')
      .gte('start_time', startOfDay(startDate).toISOString())
      .lte('start_time', endOfDay(endDate).toISOString())

    if (error) throw error

    // Count distractions by type
    const counts: Record<string, number> = {
      posture: 0,
      phone: 0,
      absence: 0,
    }

    sessions?.forEach((session) => {
      const distractions = session.distractions as any[] || []
      distractions.forEach((d) => {
        if (d.type in counts) {
          counts[d.type]++
        }
      })
    })

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

    return Object.entries(counts).map(([type, count]) => ({
      type: type as 'posture' | 'phone' | 'absence',
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
  },

  /**
   * Get category-based statistics
   */
  async getCategoryStats(startDate: Date, endDate: Date): Promise<CategoryStat[]> {
    const { data, error } = await supabase.rpc('get_category_stats', {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    })

    if (error) {
      // Fallback: manual aggregation if RPC doesn't exist
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, category, est_time, actual_time, task_date')
        .gte('task_date', format(startDate, 'yyyy-MM-dd'))
        .lte('task_date', format(endDate, 'yyyy-MM-dd'))

      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('task_id, duration, distractions')
        .gte('start_time', startOfDay(startDate).toISOString())
        .lte('start_time', endOfDay(endDate).toISOString())

      const grouped = new Map<string, {
        totalMinutes: number
        sessionCount: number
        distractionCount: number
      }>()

      sessions?.forEach((session) => {
        const task = tasks?.find(t => t.id === session.task_id)
        const category = task?.category || '기타'
        const existing = grouped.get(category) || {
          totalMinutes: 0,
          sessionCount: 0,
          distractionCount: 0,
        }

        const distractions = (session.distractions as any[] || []).length

        grouped.set(category, {
          totalMinutes: existing.totalMinutes + session.duration,
          sessionCount: existing.sessionCount + 1,
          distractionCount: existing.distractionCount + distractions,
        })
      })

      return Array.from(grouped.entries()).map(([category, stats]) => ({
        category,
        totalMinutes: stats.totalMinutes,
        avgFocusTime: stats.sessionCount > 0 ? stats.totalMinutes / stats.sessionCount : 0,
        distractionCount: stats.distractionCount,
        sessionCount: stats.sessionCount,
      }))
    }

    return data
  },

  /**
   * Get achievement rate (plan vs. actual)
   */
  async getAchievementStats(startDate: Date, endDate: Date): Promise<AchievementStat[]> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, category, est_time, actual_time')
      .gte('task_date', format(startDate, 'yyyy-MM-dd'))
      .lte('task_date', format(endDate, 'yyyy-MM-dd'))
      .order('task_date', { ascending: false })

    if (error) throw error

    return (tasks || []).map((task) => ({
      taskId: task.id,
      title: task.title,
      category: task.category,
      estTime: task.est_time,
      actualTime: task.actual_time,
      achievementRate: task.est_time > 0 ? (task.actual_time / task.est_time) * 100 : 0,
    }))
  },

  /**
   * Get summary statistics
   */
  async getSummaryStats(startDate: Date, endDate: Date) {
    const [dailyStats, distractionStats, categoryStats, achievementStats] = await Promise.all([
      this.getDailyFocusTime(startDate, endDate),
      this.getDistractionStats(startDate, endDate),
      this.getCategoryStats(startDate, endDate),
      this.getAchievementStats(startDate, endDate),
    ])

    const totalMinutes = dailyStats.reduce((sum, day) => sum + day.totalMinutes, 0)
    const totalSessions = dailyStats.reduce((sum, day) => sum + day.sessionCount, 0)
    const avgSessionTime = totalSessions > 0 ? totalMinutes / totalSessions : 0
    const totalDistractions = distractionStats.reduce((sum, d) => sum + d.count, 0)

    return {
      totalMinutes,
      totalSessions,
      avgSessionTime,
      totalDistractions,
      dailyStats,
      distractionStats,
      categoryStats,
      achievementStats,
    }
  },
}
