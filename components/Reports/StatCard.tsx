'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  delay?: number
}

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl bg-[#1A1A1A]/50 shadow-lg border border-[#A3A3A3]/10"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${gradient}`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <h3 className="text-sm font-medium text-[#A3A3A3] mb-1">{title}</h3>
        <div className="text-3xl font-bold text-[#F5F5F5] mb-2">{value}</div>
        {subtitle && (
          <p className="text-sm text-[#A3A3A3]">{subtitle}</p>
        )}
      </div>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-20"
        initial={false}
        whileHover={{
          x: ['-100%', '100%'],
          transition: { duration: 0.6 }
        }}
      />
    </motion.div>
  )
}
