'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import QuickStartButton from '@/components/Timer/QuickStartButton'
import QuickAddTask from '@/components/Planner/QuickAddTask'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Circle } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const { tasks, toggleTask, fetchTasks } = usePlannerStore()

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => task.task_date === today)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchTasks(today)
    }
  }, [user, isLoading, router, today, fetchTasks])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-[#F5F5F5] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D0D0D] p-4 flex flex-col justify-between border-r border-[#A3A3A3]/10">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>auto_awesome</span>
              <h1 className="text-2xl font-bold text-white">Study Coach</h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#52FF86]/20 ring-1 ring-inset ring-[#52FF86]/50">
              <span className="material-symbols-outlined text-[#52FF86]">dashboard</span>
              <p className="text-[#52FF86] text-sm font-medium leading-normal">대시보드</p>
            </div>
            <button
              onClick={() => router.push('/report')}
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#1A1A1A] cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[#A3A3A3]">bar_chart</span>
              <p className="text-[#A3A3A3] text-sm font-medium leading-normal">리포트</p>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#52FF86] to-[#E140E1] rounded-full size-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0D0D0D]">person</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#F5F5F5] text-base font-medium leading-normal">{user?.email?.split('@')[0] || 'John Doe'}</h1>
              <p className="text-[#52FF86]/80 text-sm font-normal leading-normal">Premium User</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#1A1A1A] cursor-pointer transition-colors text-[#A3A3A3] hover:text-[#F5F5F5]"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </aside>

      {/* Main Content - Centered Single Column */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#0D0D0D]">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-[#F5F5F5]">오늘의 집중</h1>
            <div className="flex items-center gap-2 text-[#A3A3A3]">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Quick Start Button */}
          <QuickStartButton />

          {/* Today's Tasks Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#F5F5F5]">오늘의 할 일</h2>
              <div className="text-sm text-[#A3A3A3]">
                {todayTasks.filter(t => t.is_done).length} / {todayTasks.length} 완료
              </div>
            </div>

            {/* Quick Add Task */}
            <QuickAddTask />

            {/* Task List */}
            {todayTasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {todayTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 bg-[#1A1A1A]/50 border border-[#A3A3A3]/10 rounded-xl hover:bg-[#1A1A1A] transition-all group ${task.is_done ? 'opacity-60' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 flex-shrink-0 text-[#A3A3A3] hover:text-[#52FF86] transition-colors"
                      >
                        {task.is_done ? (
                          <CheckCircle className="w-5 h-5 text-[#52FF86]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-[#F5F5F5] ${task.is_done ? 'line-through' : ''
                            }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {task.category && (
                            <span className="text-xs text-[#A3A3A3] px-2 py-0.5 bg-[#0D0D0D] rounded">
                              {task.category}
                            </span>
                          )}
                          <span className="text-xs text-[#A3A3A3]">
                            {task.est_time}분
                          </span>
                          {task.start_time && (
                            <span className="text-xs text-[#A3A3A3]">
                              {task.start_time.substring(0, 5)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-[#A3A3A3]">
                  아직 오늘의 할 일이 없습니다.
                  <br />
                  위에서 할 일을 추가해보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
