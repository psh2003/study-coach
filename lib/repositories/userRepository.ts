import { supabase } from '@/lib/supabase/client'

export interface UserPreferences {
    focusDuration: number
    breakDuration: number
    notificationsEnabled: boolean
    soundEnabled: boolean
}

export interface UserProfile {
    name: string
    categories: string[]
    preferences: UserPreferences
}

export const userRepository = {
    async updateProfile(userId: string, data: Partial<UserProfile>) {
        const { error } = await supabase.auth.updateUser({
            data: data
        })

        if (error) throw error
    },

    async getUserProfile(): Promise<UserProfile | null> {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        return {
            name: user.user_metadata.name || '',
            categories: user.user_metadata.categories || ['MATH', 'ENGLISH', 'SCIENCE', 'OTHER'],
            preferences: user.user_metadata.preferences || {
                focusDuration: 25,
                breakDuration: 5,
                notificationsEnabled: true,
                soundEnabled: true
            }
        }
    }
}
