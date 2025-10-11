'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DistractionStat } from '@/lib/repositories/statsRepository'

interface DistractionChartProps {
  data: DistractionStat[]
}

const COLORS = {
  posture: '#ef4444',
  phone: '#f59e0b',
  absence: '#6b7280',
}

const LABELS = {
  posture: '자세 불량',
  phone: '스마트폰 사용',
  absence: '자리 비움',
}

export default function DistractionChart({ data }: DistractionChartProps) {
  const chartData = data.map(item => ({
    name: LABELS[item.type],
    value: item.count,
    percentage: Math.round(item.percentage * 10) / 10,
  }))

  const totalDistractions = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">방해 요인 분석</h3>
      <p className="text-sm text-gray-500 mb-6">총 {totalDistractions}회</p>

      {totalDistractions === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          방해 요인이 없습니다 🎉
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Object.values(COLORS)[index]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string, props: any) => {
                return [`${value}회 (${props.payload.percentage}%)`, name]
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}
