'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Timetable from '@/components/Planner/Timetable'
import WebcamMonitor from '@/components/Focus/WebcamMonitor'
import PomodoroTimer from '@/components/Focus/PomodoroTimer'
import { Calendar, LogOut, Settings, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩중...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Study Coach</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={() => router.push('/report')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="리포트"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Planner */}
          <div className="lg:col-span-2">
            <Timetable />
          </div>

          {/* Right: Webcam & Timer */}
          <div className="space-y-6">
            <WebcamMonitor />
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </div>
  )
}
