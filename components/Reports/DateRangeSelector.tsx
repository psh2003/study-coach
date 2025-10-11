'use client'

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { DateRangeType } from '@/lib/hooks/useStats'

interface DateRangeSelectorProps {
  selectedRange: DateRangeType
  onRangeChange: (range: DateRangeType) => void
}

export default function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
  const ranges: { value: DateRangeType; label: string }[] = [
    { value: 'daily', label: '일별' },
    { value: 'weekly', label: '주별' },
    { value: 'monthly', label: '월별' },
  ]

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-2 border border-gray-100">
      <Calendar className="w-5 h-5 text-gray-400 ml-2" />

      <div className="flex gap-1">
        {ranges.map((range) => (
          <motion.button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${selectedRange === range.value
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {selectedRange === range.value && (
              <motion.div
                layoutId="activeRange"
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{range.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
