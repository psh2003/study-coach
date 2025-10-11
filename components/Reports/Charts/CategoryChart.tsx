'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CategoryStat } from '@/lib/repositories/statsRepository'

interface CategoryChartProps {
  data: CategoryStat[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map(item => ({
    카테고리: item.category,
    '집중 시간': Math.round(item.totalMinutes / 60 * 10) / 10,
    '평균 세션': Math.round(item.avgFocusTime * 10) / 10,
    '방해 횟수': item.distractionCount,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">과목별 집중도</h3>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="distractionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="카테고리"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="집중 시간"
              fill="url(#focusGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="방해 횟수"
              fill="url(#distractionGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}
