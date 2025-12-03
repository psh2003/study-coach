import { useState, useEffect } from 'react'
import { statsRepository } from '@/lib/repositories/statsRepository'
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export type DateRangeType = 'daily' | 'weekly' | 'monthly'

export function useStats(rangeType: DateRangeType = 'weekly') {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange(rangeType))

  useEffect(() => {
    loadStats()
  }, [dateRange])

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await statsRepository.getSummaryStats(dateRange.start, dateRange.end)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRange = (type: DateRangeType) => {
    setDateRange(getDefaultDateRange(type))
  }

  const setCustomRange = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  return {
    stats,
    isLoading,
    error,
    dateRange,
    updateRange,
    setCustomRange,
    reload: loadStats,
  }
}

function getDefaultDateRange(type: DateRangeType) {
  const now = new Date()

  switch (type) {
    case 'daily':
      return {
        start: subDays(now, 6), // Last 7 days
        end: now,
      }
    case 'weekly':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      }
    case 'monthly':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      }
  }
}
