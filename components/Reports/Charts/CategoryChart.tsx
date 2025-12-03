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
      className="bg-[#1A1A1A]/50 rounded-2xl shadow-lg p-6 border border-[#A3A3A3]/10"
    >
      <h3 className="text-lg font-bold text-[#F5F5F5] mb-6">과목별 집중도</h3>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-[#A3A3A3]">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#A3A3A3" opacity={0.1} />
            <XAxis
              dataKey="카테고리"
              stroke="#A3A3A3"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#A3A3A3"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(163, 163, 163, 0.1)' }}
              contentStyle={{
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                border: '1px solid rgba(163, 163, 163, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#F5F5F5',
              }}
              itemStyle={{ color: '#F5F5F5' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '14px',
                color: '#F5F5F5'
              }}
            />
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
