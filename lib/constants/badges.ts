import { LucideIcon, Award, Zap, Clock, Calendar, Flame, Target } from 'lucide-react'

export interface Badge {
    code: string
    name: string
    description: string
    icon: LucideIcon
    condition: {
        type: 'count' | 'streak' | 'duration'
        value: number
    }
}

export const BADGES: Badge[] = [
    {
        code: 'FIRST_STEP',
        name: '첫 걸음',
        description: '첫 번째 집중 세션을 완료했습니다.',
        icon: Zap,
        condition: { type: 'count', value: 1 },
    },
    {
        code: 'THREE_DAY_STREAK',
        name: '작심삼일 돌파',
        description: '3일 연속으로 학습했습니다.',
        icon: Flame,
        condition: { type: 'streak', value: 3 },
    },
    {
        code: 'WEEKLY_STREAK',
        name: '일주일의 기적',
        description: '7일 연속으로 학습했습니다.',
        icon: Calendar,
        condition: { type: 'streak', value: 7 },
    },
    {
        code: 'FOCUS_MASTER_10H',
        name: '집중의 시작',
        description: '총 집중 시간 10시간을 달성했습니다.',
        icon: Clock,
        condition: { type: 'duration', value: 600 }, // minutes
    },
    {
        code: 'FOCUS_MASTER_50H',
        name: '몰입의 경지',
        description: '총 집중 시간 50시간을 달성했습니다.',
        icon: Target,
        condition: { type: 'duration', value: 3000 }, // minutes
    },
    {
        code: 'SESSION_MASTER_50',
        name: '꾸준함의 증명',
        description: '총 50번의 집중 세션을 완료했습니다.',
        icon: Award,
        condition: { type: 'count', value: 50 },
    },
]
