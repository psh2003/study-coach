'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Timetable from '@/components/Planner/Timetable'
import WebcamMonitor from '@/components/Focus/WebcamMonitor'
import PomodoroTimer from '@/components/Focus/PomodoroTimer'
import { Brain, LogOut, Settings, BarChart3, Clock, Target, Zap } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-light tracking-wider text-white/60">LOADING</p>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-dark-primary text-white relative overflow-hidden">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      >
        <div className="w-full h-full rounded-full border border-white" />
      </motion.div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-background opacity-30 pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-blue rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-purple rounded-full blur-[120px]"
        />
      </div>

      {/* Fixed Navigation */}
      <motion.nav
        style={{ opacity: headerOpacity }}
        className="fixed top-0 w-full z-40 glass-strong"
      >
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Brain className="w-7 h-7" />
                <motion.div
                  className="absolute inset-0 bg-accent-blue rounded-full blur-lg"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-lg font-light tracking-[0.2em]">STUDY COACH</span>
            </motion.div>

            {/* User Info & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-sm font-light text-white/60 hidden md:block">
                {user.user_metadata?.name || user.email?.split('@')[0]?.toUpperCase()}
              </span>

              <NavButton
                icon={BarChart3}
                onClick={() => router.push('/report')}
                onHover={setIsHovering}
                label="REPORT"
              />
              <NavButton
                icon={Settings}
                onClick={() => router.push('/settings')}
                onHover={setIsHovering}
                label="SETTINGS"
              />
              <NavButton
                icon={LogOut}
                onClick={signOut}
                onHover={setIsHovering}
                label="LOGOUT"
              />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-6 lg:px-8">
        <div className="container mx-auto max-w-[1800px]">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-3">
              YOUR<br />
              <span className="gradient-text italic font-light">WORKSPACE</span>
            </h1>
            <p className="text-sm font-light text-white/60 tracking-wider">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).toUpperCase()}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <StatCard
              icon={Clock}
              value="5h 32m"
              label="TODAY'S FOCUS"
              gradient="from-accent-blue to-accent-purple"
              delay={0.1}
            />
            <StatCard
              icon={Target}
              value="8/12"
              label="TASKS DONE"
              gradient="from-accent-purple to-accent-pink"
              delay={0.2}
            />
            <StatCard
              icon={Zap}
              value="95%"
              label="ACCURACY"
              gradient="from-accent-pink to-accent-orange"
              delay={0.3}
            />
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Planner (2 columns) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="glass rounded-2xl p-6 lg:p-8 hover-glow">
                <Timetable />
              </div>
            </motion.div>

            {/* Right: Webcam & Timer (1 column) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Webcam Monitor */}
              <div className="glass rounded-2xl p-6 hover-glow">
                <WebcamMonitor />
              </div>

              {/* Pomodoro Timer */}
              <div className="glass rounded-2xl p-6 hover-glow">
                <PomodoroTimer />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Navigation Button Component
function NavButton({
  icon: Icon,
  onClick,
  onHover,
  label,
}: {
  icon: any
  onClick: () => void
  onHover: (v: boolean) => void
  label: string
}) {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-2 rounded-lg glass hover:glass-strong transition-all group"
      title={label}
    >
      <Icon className="w-5 h-5" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"
      />
    </motion.button>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
  delay,
}: {
  icon: any
  value: string
  label: string
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative glass rounded-xl p-6 overflow-hidden group hover-glow cursor-pointer"
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-3xl lg:text-4xl font-bold mb-1">{value}</div>
          <div className="text-xs font-light text-white/60 tracking-wider">{label}</div>
        </div>
        <div className="p-3 glass-strong rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}
