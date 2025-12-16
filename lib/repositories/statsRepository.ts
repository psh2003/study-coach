import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, format, subDays } from 'date-fns'

export interface DailyFocusStat {
  label: string // date (YYYY-MM-DD) or hour (HH:00)
  totalMinutes: number
  sessionCount: number
}

export interface DistractionStat {
  type: 'posture' | 'phone' | 'absence' | 'drowsiness'
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

      ; (sessions as any[])?.forEach((session) => {
        const dateKey = format(new Date(session.start_time), 'yyyy-MM-dd')
        const existing = grouped.get(dateKey) || { totalMinutes: 0, count: 0 }
        grouped.set(dateKey, {
          totalMinutes: existing.totalMinutes + session.duration,
          count: existing.count + 1,
        })
      })

    // Fill in missing dates
    const result: DailyFocusStat[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      const dateKey = format(current, 'yyyy-MM-dd')
      const stats = grouped.get(dateKey) || { totalMinutes: 0, count: 0 }

      result.push({
        label: dateKey,
        totalMinutes: stats.totalMinutes,
        sessionCount: stats.count,
      })

      current.setDate(current.getDate() + 1)
    }

    return result
  },

  /**
   * Get hourly focus time for a specific date (00:00 to 23:59)
   */
  async getHourlyFocusTime(date: Date): Promise<DailyFocusStat[]> {
    const start = startOfDay(date)
    const end = endOfDay(date)

    const { data: sessions, error } = await supabase
      .from('focus_sessions')
      .select('start_time, duration')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .order('start_time')

    if (error) throw error

    // Initialize 0-23 hours
    const hourly = new Map<number, { totalMinutes: number; count: number }>()
    for (let i = 0; i < 24; i++) {
      hourly.set(i, { totalMinutes: 0, count: 0 })
    }

    ; (sessions as any[])?.forEach((session) => {
      const sessionStart = new Date(session.start_time)
      const hour = sessionStart.getHours() // 0-23
      const existing = hourly.get(hour) || { totalMinutes: 0, count: 0 }

      hourly.set(hour, {
        totalMinutes: existing.totalMinutes + session.duration,
        count: existing.count + 1,
      })
    })

    return Array.from(hourly.entries())
      .sort(([a], [b]) => a - b)
      .map(([hour, stats]) => ({
        label: `${hour.toString().padStart(2, '0')}:00`,
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
      drowsiness: 0,
    }

      ; (sessions as any[])?.forEach((session) => {
        const distractions = session.distractions as any[] || []
        distractions.forEach((d: any) => {
          if (d.type in counts) {
            counts[d.type]++
          }
        })
      })

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

    return Object.entries(counts).map(([type, count]) => ({
      type: type as 'posture' | 'phone' | 'absence' | 'drowsiness',
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
    } as any)

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

        ; (sessions as any[])?.forEach((session) => {
          const task = (tasks as any[])?.find(t => t.id === session.task_id)
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

    return ((tasks as any[]) || []).map((task) => ({
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
    const isSameDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

    const [dailyStats, distractionStats, categoryStats, achievementStats] = await Promise.all([
      isSameDay ? this.getHourlyFocusTime(startDate) : this.getDailyFocusTime(startDate, endDate),
      this.getDistractionStats(startDate, endDate),
      this.getCategoryStats(startDate, endDate),
      this.getAchievementStats(startDate, endDate),
    ])

    const totalMinutes = dailyStats.reduce((sum: number, day: DailyFocusStat) => sum + day.totalMinutes, 0)
    const totalSessions = dailyStats.reduce((sum: number, day: DailyFocusStat) => sum + day.sessionCount, 0)
    const avgSessionTime = totalSessions > 0 ? totalMinutes / totalSessions : 0
    const totalDistractions = distractionStats.reduce((sum: number, d: DistractionStat) => sum + d.count, 0)

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
