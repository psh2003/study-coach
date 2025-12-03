'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, User, Bell, Palette, Database, Save, Brain } from 'lucide-react'
import { toast } from 'sonner'
import { userRepository, UserProfile } from '@/lib/repositories/userRepository'

type Tab = 'profile' | 'preferences' | 'categories' | 'data'

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  // Profile settings
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Preference settings
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Categories
  const [categories, setCategories] = useState<string[]>(['MATH', 'ENGLISH', 'SCIENCE', 'OTHER'])
  const [newCategory, setNewCategory] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

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
    } else if (user) {
      setName(user.user_metadata?.name || '')
      setEmail(user.email || '')

      const prefs = user.user_metadata?.preferences
      if (prefs) {
        setFocusDuration(prefs.focusDuration ?? 25)
        setBreakDuration(prefs.breakDuration ?? 5)
        setNotificationsEnabled(prefs.notificationsEnabled ?? true)
        setSoundEnabled(prefs.soundEnabled ?? true)
      }

      if (user.user_metadata?.categories) {
        setCategories(user.user_metadata.categories)
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
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

  const tabs = [
    { id: 'profile' as Tab, label: 'PROFILE', icon: User },
    { id: 'preferences' as Tab, label: 'PREFERENCES', icon: Bell },
    { id: 'categories' as Tab, label: 'CATEGORIES', icon: Palette },
    { id: 'data' as Tab, label: 'DATA', icon: Database },
  ]

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const updates: Partial<UserProfile> = {
        name,
        categories,
        preferences: {
          focusDuration,
          breakDuration,
          notificationsEnabled,
          soundEnabled
        }
      }

      await userRepository.updateProfile(user.id, updates)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim().toUpperCase()])
      setNewCategory('')
      setIsAddingCategory(false)
    }
  }

  const handleDeleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white relative overflow-hidden">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
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
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent-pink rounded-full blur-[120px]"
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
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent-purple rounded-full blur-[120px]"
        />
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-40 glass-strong">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-3 glass p-3 rounded-lg hover:glass-strong transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-light tracking-wider hidden sm:block">BACK</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Brain className="w-7 h-7" />
              <span className="text-lg font-light tracking-[0.2em]">STUDY COACH</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 glass px-4 py-3 rounded-lg hover:glass-strong transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-light tracking-wider hidden sm:block">
                {isSaving ? 'SAVING...' : 'SAVE'}
              </span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32 pb-12 px-6 lg:px-8">
        <div className="container mx-auto max-w-[1400px]">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-3">
              YOUR<br />
              <span className="gradient-text italic font-light">SETTINGS</span>
            </h1>
            <p className="text-sm font-light text-white/60 tracking-wider">
              CUSTOMIZE YOUR EXPERIENCE
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="glass rounded-2xl p-4">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all font-light tracking-wider text-sm
                      ${activeTab === tab.id
                        ? 'glass-strong shadow-glow-md'
                        : 'hover:glass-strong'
                      }
                    `}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="glass rounded-2xl p-6 lg:p-8 hover-glow">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-8 tracking-tight">PROFILE SETTINGS</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-light text-white/60 mb-2 tracking-wider">
                          NAME
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 glass-strong rounded-xl border border-white/10 focus:border-accent-blue transition-all font-light bg-transparent text-white placeholder-white/30"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light text-white/60 mb-2 tracking-wider">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full px-4 py-3 glass rounded-xl border border-white/10 bg-white/5 text-white/40 cursor-not-allowed font-light"
                        />
                        <p className="text-sm text-white/40 mt-2 font-light">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-light text-white/60 mb-2 tracking-wider">
                          PROFILE PICTURE
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-2xl font-bold">
                            {name.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <button className="px-4 py-2 glass-strong rounded-lg hover:shadow-glow-sm transition-all text-sm font-light tracking-wider">
                            CHANGE PHOTO
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-8 tracking-tight">PREFERENCES</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-light text-white/60 mb-2 tracking-wider">
                          FOCUS DURATION (MINUTES)
                        </label>
                        <input
                          type="number"
                          value={focusDuration}
                          onChange={(e) => setFocusDuration(Number(e.target.value))}
                          min="15"
                          max="60"
                          step="5"
                          className="w-full px-4 py-3 glass-strong rounded-xl border border-white/10 focus:border-accent-blue transition-all font-light bg-transparent text-white"
                        />
                        <p className="text-sm text-white/40 mt-2 font-light">Recommended: 25 minutes</p>
                      </div>

                      <div>
                        <label className="block text-sm font-light text-white/60 mb-2 tracking-wider">
                          BREAK DURATION (MINUTES)
                        </label>
                        <input
                          type="number"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          min="5"
                          max="15"
                          step="1"
                          className="w-full px-4 py-3 glass-strong rounded-xl border border-white/10 focus:border-accent-blue transition-all font-light bg-transparent text-white"
                        />
                        <p className="text-sm text-white/40 mt-2 font-light">Recommended: 5 minutes</p>
                      </div>

                      <div className="flex items-center justify-between p-4 glass-strong rounded-xl">
                        <div>
                          <h3 className="font-light tracking-wide">NOTIFICATIONS</h3>
                          <p className="text-sm text-white/60 font-light">Alert when focus ends</p>
                        </div>
                        <button
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className={`
                            relative w-14 h-8 rounded-full transition-colors
                            ${notificationsEnabled ? 'bg-accent-blue' : 'bg-white/20'}
                          `}
                        >
                          <div className={`
                            absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                            ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}
                          `} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 glass-strong rounded-xl">
                        <div>
                          <h3 className="font-light tracking-wide">SOUND</h3>
                          <p className="text-sm text-white/60 font-light">Play sound on timer end</p>
                        </div>
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`
                            relative w-14 h-8 rounded-full transition-colors
                            ${soundEnabled ? 'bg-accent-blue' : 'bg-white/20'}
                          `}
                        >
                          <div className={`
                            absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                            ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}
                          `} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-8 tracking-tight">CATEGORY MANAGEMENT</h2>
                    <p className="text-white/60 mb-6 font-light tracking-wide">Add or modify study categories</p>

                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center justify-between p-4 glass-strong rounded-xl">
                          <span className="font-light tracking-wider">{category}</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 glass rounded-lg hover:glass-strong transition-all text-sm font-light tracking-wider">
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="px-3 py-1 bg-accent-pink/20 text-accent-pink border border-accent-pink/30 rounded-lg hover:bg-accent-pink/30 transition-all text-sm font-light tracking-wider"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))}

                      {isAddingCategory ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1 px-4 py-3 glass-strong rounded-xl border border-white/10 focus:border-accent-blue transition-all font-light bg-transparent text-white"
                            placeholder="New Category Name"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          />
                          <button
                            onClick={handleAddCategory}
                            className="px-6 py-3 bg-accent-blue rounded-xl hover:bg-accent-blue/80 transition-colors font-light tracking-wider"
                          >
                            ADD
                          </button>
                          <button
                            onClick={() => setIsAddingCategory(false)}
                            className="px-6 py-3 glass rounded-xl hover:glass-strong transition-colors font-light tracking-wider"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingCategory(true)}
                          className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:border-accent-blue hover:text-accent-blue transition-all font-light tracking-wider"
                        >
                          + ADD CATEGORY
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div>
                    <h2 className="text-3xl font-bold mb-8 tracking-tight">DATA MANAGEMENT</h2>

                    <div className="space-y-4">
                      <div className="p-6 glass-strong border border-accent-blue/30 rounded-xl">
                        <h3 className="font-bold text-accent-blue mb-2 tracking-wide">EXPORT DATA</h3>
                        <p className="text-sm text-white/60 mb-4 font-light">
                          Export all your study data as CSV file
                        </p>
                        <button className="px-4 py-2 bg-accent-blue rounded-lg hover:bg-accent-blue/80 transition-colors font-light tracking-wider text-sm">
                          DOWNLOAD CSV
                        </button>
                      </div>

                      <div className="p-6 glass-strong border border-accent-pink/30 rounded-xl">
                        <h3 className="font-bold text-accent-pink mb-2 tracking-wide">DELETE ACCOUNT</h3>
                        <p className="text-sm text-white/60 mb-4 font-light">
                          Permanently delete your account and all data
                        </p>
                        <button className="px-4 py-2 bg-accent-pink rounded-lg hover:bg-accent-pink/80 transition-colors font-light tracking-wider text-sm">
                          DELETE ACCOUNT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
