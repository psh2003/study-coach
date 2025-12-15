import { supabase } from '@/lib/supabase/client'
import { startOfDay, subDays, format, differenceInDays } from 'date-fns'
import { BADGES, Badge } from '@/lib/constants/badges'

export interface StreakInfo {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string | null
}

export const gamificationRepository = {
    /**
     * Calculate streak based on focus sessions
     */
    async getStreak(userId: string): Promise<StreakInfo> {
        // Fetch distinct session dates for the user
        // Limit to last 60 days for performance, assuming streak won't be longer than that without checking
        // Or we can fetch all dates if needed, but let's start with a reasonable limit or just fetch all dates
        // Since we need accurate streak, fetching all dates might be safer but heavier.
        // Let's fetch dates from the last 365 days.
        const oneYearAgo = subDays(new Date(), 365)

        const { data, error } = await supabase
            .from('focus_sessions')
            .select('start_time')
            .eq('user_id', userId)
            .gte('start_time', oneYearAgo.toISOString())
            .order('start_time', { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) {
            return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
        }

        // Extract unique dates (YYYY-MM-DD)
        const uniqueDates = Array.from(new Set(
            (data as any[]).map(session => format(new Date(session.start_time), 'yyyy-MM-dd'))
        )).sort((a, b) => b.localeCompare(a)) // Descending order

        if (uniqueDates.length === 0) {
            return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
        }

        const today = format(new Date(), 'yyyy-MM-dd')
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
        const lastActivityDate = uniqueDates[0]

        let currentStreak = 0

        // Calculate current streak
        // If last activity was today or yesterday, streak is alive
        if (lastActivityDate === today || lastActivityDate === yesterday) {
            currentStreak = 1
            let checkDate = new Date(lastActivityDate)

            for (let i = 1; i < uniqueDates.length; i++) {
                const prevDate = new Date(uniqueDates[i])
                const diff = differenceInDays(checkDate, prevDate)

                if (diff === 1) {
                    currentStreak++
                    checkDate = prevDate
                } else {
                    break
                }
            }
        }

        // Calculate longest streak
        let longestStreak = 0
        let tempStreak = 1

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const curr = new Date(uniqueDates[i])
            const next = new Date(uniqueDates[i + 1])
            const diff = differenceInDays(curr, next)

            if (diff === 1) {
                tempStreak++
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak)

        return {
            currentStreak,
            longestStreak,
            lastActivityDate,
        }
    },

    /**
     * Get earned badges for a user
     */
    async getEarnedBadges(userId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('user_badges')
            .select('badge_code')
            .eq('user_id', userId)

        if (error) throw error

        return (data as any[]).map(row => row.badge_code)
    },

    /**
     * Check and unlock badges based on latest session
     */
    async checkAndUnlockBadges(userId: string, sessionDuration: number): Promise<Badge[]> {
        // 1. Get current stats
        const { data: sessions, error: sessionError } = await supabase
            .from('focus_sessions')
            .select('duration, start_time')
            .eq('user_id', userId)

        if (sessionError) throw sessionError

        const totalSessions = (sessions as any[])?.length || 0
        const totalDuration = (sessions as any[])?.reduce((sum, s) => sum + s.duration, 0) || 0
        const streakInfo = await this.getStreak(userId)

        // 2. Get already earned badges
        const earnedBadgeCodes = await this.getEarnedBadges(userId)
        const earnedSet = new Set(earnedBadgeCodes)

        // 3. Check conditions
        const newBadges: Badge[] = []

        for (const badge of BADGES) {
            if (earnedSet.has(badge.code)) continue

            let isUnlocked = false

            switch (badge.condition.type) {
                case 'count':
                    if (totalSessions >= badge.condition.value) isUnlocked = true
                    break
                case 'duration':
                    if (totalDuration >= badge.condition.value) isUnlocked = true
                    break
                case 'streak':
                    if (streakInfo.currentStreak >= badge.condition.value) isUnlocked = true
                    break
            }

            if (isUnlocked) {
                // Insert into DB
                const { error: insertError } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: userId,
                        badge_code: badge.code,
                    } as any)

                if (!insertError) {
                    newBadges.push(badge)
                } else {
                    console.error(`Failed to unlock badge ${badge.code}:`, insertError)
                }
            }
        }

        return newBadges
    }
}
