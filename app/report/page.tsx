'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useStats } from '@/lib/hooks/useStats'
import { DateRangeType } from '@/lib/hooks/useStats'
import DateRangeSelector from '@/components/Reports/DateRangeSelector'
import StatCard from '@/components/Reports/StatCard'
import FocusTimeChart from '@/components/Reports/Charts/FocusTimeChart'
import DistractionChart from '@/components/Reports/Charts/DistractionChart'
import CategoryChart from '@/components/Reports/Charts/CategoryChart'
import { Clock, Target, AlertTriangle, TrendingUp, ArrowLeft, Download, Brain } from 'lucide-react'

export default function ReportPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [rangeType, setRangeType] = useState<DateRangeType>('weekly')
  const { stats, isLoading, error, updateRange } = useStats(rangeType)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleRangeChange = (newRange: DateRangeType) => {
    setRangeType(newRange)
    updateRange(newRange)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-light tracking-wider text-white/60">LOADING</p>
        </motion.div>
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white relative overflow-hidden">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      >
        <div className="w-full h-full rounded-full border border-white" />
      </motion.div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-background opacity-30 pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent-purple rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent-blue rounded-full blur-[120px]"
        />
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-40 glass-strong">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-3 glass p-3 rounded-lg hover:glass-strong transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-light tracking-wider hidden sm:block">BACK</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Brain className="w-7 h-7" />
              <span className="text-lg font-light tracking-[0.2em]">STUDY COACH</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => alert('CSV export coming soon!')}
              className="flex items-center gap-2 glass px-4 py-3 rounded-lg hover:glass-strong transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-light tracking-wider hidden sm:block">EXPORT</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32 pb-12 px-6 lg:px-8">
        <div className="container mx-auto max-w-[1600px]">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-3">
              YOUR<br />
              <span className="gradient-text italic font-light">PROGRESS</span>
            </h1>
            <p className="text-sm font-light text-white/60 tracking-wider">
              ANALYZE YOUR LEARNING PATTERNS
            </p>
          </motion.div>

          {/* Date Range Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <DateRangeSelector
              selectedRange={rangeType}
              onRangeChange={handleRangeChange}
            />
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-light tracking-wider text-white/60">LOADING DATA</p>
              </motion.div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong border border-accent-pink/30 rounded-2xl p-6 mb-8"
            >
              <p className="text-accent-pink font-light tracking-wide">ERROR LOADING DATA</p>
              <p className="text-white/60 text-sm mt-1 font-light">{error.message}</p>
            </motion.div>
          )}

        {/* Stats Content */}
        {!isLoading && stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="총 집중 시간"
                value={formatTime(stats.totalMinutes)}
                subtitle={`${stats.totalSessions}개 세션`}
                icon={Clock}
                gradient="from-blue-500 to-blue-600"
                delay={0}
              />
              <StatCard
                title="평균 세션 시간"
                value={`${Math.round(stats.avgSessionTime)}분`}
                subtitle="세션당 평균"
                icon={Target}
                gradient="from-purple-500 to-purple-600"
                delay={0.1}
              />
              <StatCard
                title="방해 요인"
                value={stats.totalDistractions}
                subtitle="전체 기간"
                icon={AlertTriangle}
                gradient="from-orange-500 to-red-500"
                delay={0.2}
              />
              <StatCard
                title="집중 성공률"
                value={`${Math.round((1 - stats.totalDistractions / (stats.totalMinutes / 25)) * 100)}%`}
                subtitle="방해 대비"
                icon={TrendingUp}
                gradient="from-green-500 to-emerald-600"
                delay={0.3}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FocusTimeChart data={stats.dailyStats || []} />
              <DistractionChart data={stats.distractionStats || []} />
            </div>

            {/* Category Analysis */}
            <div className="mb-8">
              <CategoryChart data={stats.categoryStats || []} />
            </div>

            {/* Achievement Table */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass rounded-2xl p-6 lg:p-8 hover-glow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 glass-strong rounded-lg">
                  <Target className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TASK COMPLETION</h3>
                  <p className="text-sm font-light text-white/60">PLANNED VS ACTUAL</p>
                </div>
              </div>

              {stats.achievementStats?.length === 0 ? (
                <div className="text-center py-12 text-white/40 font-light tracking-wider">
                  NO COMPLETED TASKS YET
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-sm font-light text-white/60 tracking-wider">TASK</th>
                        <th className="text-left py-4 px-4 text-sm font-light text-white/60 tracking-wider">CATEGORY</th>
                        <th className="text-center py-4 px-4 text-sm font-light text-white/60 tracking-wider">PLANNED</th>
                        <th className="text-center py-4 px-4 text-sm font-light text-white/60 tracking-wider">ACTUAL</th>
                        <th className="text-center py-4 px-4 text-sm font-light text-white/60 tracking-wider">RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.achievementStats?.map((item: any, index: number) => (
                        <motion.tr
                          key={item.taskId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4 font-light">{item.title}</td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 glass-strong rounded-full text-xs font-light tracking-wide">
                              {item.category || 'OTHER'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4 text-white/60 font-light">{item.estTime}m</td>
                          <td className="text-center py-4 px-4 text-white/60 font-light">{item.actualTime}m</td>
                          <td className="text-center py-4 px-4">
                            <span
                              className={`
                                px-3 py-1 rounded-full text-sm font-light inline-block
                                ${item.achievementRate >= 80 && item.achievementRate <= 120
                                  ? 'bg-accent-green/20 text-accent-green'
                                  : item.achievementRate > 120
                                  ? 'bg-accent-blue/20 text-accent-blue'
                                  : 'bg-accent-pink/20 text-accent-pink'
                                }
                              `}
                            >
                              {Math.round(item.achievementRate)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
        </div>
      </main>
    </div>
  )
}
