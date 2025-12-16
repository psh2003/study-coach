'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { DailyFocusStat } from '@/lib/repositories/statsRepository'

interface FocusTimeChartProps {
  data: DailyFocusStat[]
}

export default function FocusTimeChart({ data }: FocusTimeChartProps) {
  const chartData = data.map(item => {
    let label = item.label
    // Try format if it looks like a date (YYYY-MM-DD)
    if (item.label.includes('-') && item.label.length === 10) {
      try {
        label = format(new Date(item.label), 'MM/dd')
      } catch (e) {
        console.error('Date format error', e)
      }
    }

    return {
      date: label,
      시간: Math.round(item.totalMinutes / 60 * 10) / 10, // Convert to hours
      세션수: item.sessionCount,
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#1A1A1A]/50 rounded-2xl shadow-lg p-6 border border-[#A3A3A3]/10"
    >
      <h3 className="text-lg font-bold text-[#F5F5F5] mb-6">일별 집중 시간</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#A3A3A3" opacity={0.1} />
          <XAxis
            dataKey="date"
            stroke="#A3A3A3"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#A3A3A3"
            style={{ fontSize: '12px' }}
            label={{ value: '시간 (h)', angle: -90, position: 'insideLeft', fill: '#A3A3A3' }}
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
            formatter={(value: number, name: string) => {
              if (name === '시간') {
                return [`${value}시간`, name]
              }
              return [value, name]
            }}
          />
          <Bar
            dataKey="시간"
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
