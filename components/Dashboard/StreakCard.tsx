'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakCardProps {
    currentStreak: number
    longestStreak: number
    loading?: boolean
}

export default function StreakCard({ currentStreak, longestStreak, loading = false }: StreakCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF4D4D]/20 to-[#F9CB28]/20 border border-[#FF4D4D]/30 p-6"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Flame size={120} className="text-[#FF4D4D]" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#FF4D4D]/20 rounded-lg border border-[#FF4D4D]/30">
                        <Flame className="w-6 h-6 text-[#FF4D4D]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Day Streak</h3>
                </div>

                {loading ? (
                    <div className="animate-pulse flex flex-col gap-2">
                        <div className="h-10 w-20 bg-white/10 rounded" />
                        <div className="h-4 w-32 bg-white/10 rounded" />
                    </div>
                ) : (
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{currentStreak}</span>
                            <span className="text-sm text-[#FF4D4D] font-medium">days</span>
                        </div>
                        <p className="text-sm text-[#A3A3A3] mt-1">
                            Longest streak: <span className="text-white font-medium">{longestStreak} days</span>
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
