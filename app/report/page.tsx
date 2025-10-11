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
import { Clock, Target, AlertTriangle, TrendingUp, ArrowLeft, Download } from 'lucide-react'

export default function ReportPage() {
  const { user, isLoading: authLoading } = useAuth()
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">로딩중...</div>
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">대시보드로 돌아가기</span>
            </button>

            <button
              onClick={() => alert('CSV 내보내기 기능은 곧 추가됩니다!')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              데이터 내보내기
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">학습 리포트</h1>
          <p className="text-gray-600">나의 학습 패턴과 집중도를 분석해보세요</p>
        </motion.div>

        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
          >
            <p className="text-red-800">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
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
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">계획 vs. 실행 분석</h3>

              {stats.achievementStats?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  아직 완료된 작업이 없습니다
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">작업명</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">카테고리</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">계획 시간</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">실제 시간</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">달성률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.achievementStats?.map((item: any, index: number) => (
                        <motion.tr
                          key={item.taskId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">{item.title}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {item.category || '기타'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">{item.estTime}분</td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">{item.actualTime}분</td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span
                              className={`
                                px-3 py-1 rounded-full font-medium
                                ${item.achievementRate >= 80 && item.achievementRate <= 120
                                  ? 'bg-green-100 text-green-800'
                                  : item.achievementRate > 120
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
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
    </div>
  )
}
