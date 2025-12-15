'use client'

import { motion } from 'framer-motion'
import { Badge, BADGES } from '@/lib/constants/badges'
import { Lock } from 'lucide-react'

interface BadgeListProps {
    earnedBadgeCodes: string[]
    loading?: boolean
}

export default function BadgeList({ earnedBadgeCodes, loading = false }: BadgeListProps) {
    const earnedSet = new Set(earnedBadgeCodes)

    return (
        <div className="bg-[#1A1A1A]/50 border border-[#A3A3A3]/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {BADGES.map((badge, index) => {
                    const isEarned = earnedSet.has(badge.code)
                    const Icon = badge.icon

                    return (
                        <motion.div
                            key={badge.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                relative group flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300
                ${isEarned
                                    ? 'bg-[#52FF86]/5 border-[#52FF86]/20 hover:bg-[#52FF86]/10'
                                    : 'bg-[#0D0D0D] border-[#A3A3A3]/10 opacity-60 grayscale hover:opacity-80'
                                }
              `}
                        >
                            <div className={`
                p-3 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110
                ${isEarned ? 'bg-[#52FF86]/20 text-[#52FF86]' : 'bg-[#1A1A1A] text-[#A3A3A3]'}
              `}>
                                {isEarned ? <Icon size={24} /> : <Lock size={24} />}
                            </div>

                            <h4 className={`text-sm font-bold mb-1 ${isEarned ? 'text-white' : 'text-[#A3A3A3]'}`}>
                                {badge.name}
                            </h4>

                            <p className="text-xs text-[#A3A3A3] line-clamp-2">
                                {badge.description}
                            </p>

                            {/* Tooltip for locked badges */}
                            {!isEarned && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                    <p className="text-xs text-white font-medium">
                                        {badge.condition.type === 'count' && `${badge.condition.value}회 달성`}
                                        {badge.condition.type === 'duration' && `${badge.condition.value / 60}시간 달성`}
                                        {badge.condition.type === 'streak' && `${badge.condition.value}일 연속`}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
