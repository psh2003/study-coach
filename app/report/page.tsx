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
import { Clock, Target, AlertTriangle, TrendingUp } from 'lucide-react'

export default function ReportPage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [rangeType, setRangeType] = useState<DateRangeType>('weekly')
  const { stats, isLoading, error, updateRange } = useStats(rangeType)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleRangeChange = (newRange: DateRangeType) => {
    setRangeType(newRange)
    updateRange(newRange)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-[#A3A3A3]/20 border-t-[#F5F5F5] rounded-full animate-spin" />
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-[#F5F5F5] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D0D0D] p-4 flex flex-col justify-between border-r border-[#A3A3A3]/10">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#52FF86]" style={{ fontSize: '32px' }}>auto_awesome</span>
              <h1 className="text-2xl font-bold text-white">Study Coach</h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#1A1A1A] cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[#A3A3A3]">dashboard</span>
              <p className="text-[#A3A3A3] text-sm font-medium leading-normal">대시보드</p>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#52FF86]/20 ring-1 ring-inset ring-[#52FF86]/50">
              <span className="material-symbols-outlined text-[#52FF86]">bar_chart</span>
              <p className="text-[#52FF86] text-sm font-medium leading-normal">리포트</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#52FF86] to-[#E140E1] rounded-full size-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0D0D0D]">person</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#F5F5F5] text-base font-medium leading-normal">{user?.email?.split('@')[0] || 'John Doe'}</h1>
              <p className="text-[#52FF86]/80 text-sm font-normal leading-normal">Premium User</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#1A1A1A] cursor-pointer transition-colors text-[#A3A3A3] hover:text-[#F5F5F5]"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#0D0D0D] overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-[#F5F5F5]">
              리포트
            </h1>
            <p className="text-sm font-light text-[#A3A3A3] tracking-wider">
              Track your learning progress and patterns
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
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-[#A3A3A3]/20 border-t-[#F5F5F5] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-light tracking-wider text-[#A3A3A3]">Loading data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A1A1A]/50 border border-red-500/30 rounded-2xl p-6 mb-8"
            >
              <p className="text-red-500 font-light tracking-wide">Error loading data</p>
              <p className="text-[#A3A3A3] text-sm mt-1 font-light">{error.message}</p>
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
                  value={`${stats.totalSessions > 0 ? Math.max(0, Math.round((1 - stats.totalDistractions / stats.totalSessions) * 100)) : 0}%`}
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
                className="bg-[#1A1A1A]/50 border border-[#A3A3A3]/10 rounded-2xl p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#0D0D0D] rounded-lg border border-[#A3A3A3]/10">
                    <Target className="w-6 h-6 text-[#52FF86]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5F5]">Task Completion</h3>
                    <p className="text-sm font-light text-[#A3A3A3]">Planned vs Actual</p>
                  </div>
                </div>

                {stats.achievementStats?.length === 0 ? (
                  <div className="text-center py-12 text-[#A3A3A3] font-light tracking-wider">
                    No completed tasks yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#A3A3A3]/10">
                          <th className="text-left py-4 px-4 text-sm font-light text-[#A3A3A3] tracking-wider">Task</th>
                          <th className="text-left py-4 px-4 text-sm font-light text-[#A3A3A3] tracking-wider">Category</th>
                          <th className="text-center py-4 px-4 text-sm font-light text-[#A3A3A3] tracking-wider">Planned</th>
                          <th className="text-center py-4 px-4 text-sm font-light text-[#A3A3A3] tracking-wider">Actual</th>
                          <th className="text-center py-4 px-4 text-sm font-light text-[#A3A3A3] tracking-wider">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.achievementStats?.map((item: any, index: number) => (
                          <motion.tr
                            key={item.taskId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b border-[#A3A3A3]/5 hover:bg-[#1A1A1A]/70 transition-colors"
                          >
                            <td className="py-4 px-4 font-light text-[#F5F5F5]">{item.title}</td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-[#0D0D0D] border border-[#A3A3A3]/10 rounded-full text-xs font-light tracking-wide text-[#F5F5F5]">
                                {item.category || 'OTHER'}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4 text-[#A3A3A3] font-light">{item.estTime}m</td>
                            <td className="text-center py-4 px-4 text-[#A3A3A3] font-light">{item.actualTime}m</td>
                            <td className="text-center py-4 px-4">
                              <span
                                className={`
                                  px-3 py-1 rounded-full text-sm font-light inline-block
                                  ${item.achievementRate >= 80 && item.achievementRate <= 120
                                    ? 'bg-[#52FF86]/20 text-[#52FF86]'
                                    : item.achievementRate > 120
                                      ? 'bg-[#49B3FC]/20 text-[#49B3FC]'
                                      : 'bg-[#FA5D29]/20 text-[#FA5D29]'
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
