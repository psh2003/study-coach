'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, User, Bell, Palette, Database, Save } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'profile' | 'preferences' | 'categories' | 'data'

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isSaving, setIsSaving] = useState(false)

  // Profile settings
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Preference settings
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      setName(user.user_metadata?.name || '')
      setEmail(user.email || '')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">로딩중...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as Tab, label: '프로필', icon: User },
    { id: 'preferences' as Tab, label: '환경설정', icon: Bell },
    { id: 'categories' as Tab, label: '카테고리 관리', icon: Palette },
    { id: 'data' as Tab, label: '데이터 관리', icon: Database },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement actual save logic with Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('설정이 저장되었습니다')
    } catch (error) {
      toast.error('설정 저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">대시보드로 돌아가기</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">앱 환경을 커스터마이징하세요</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">프로필 설정</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="이름을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        프로필 사진
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                          {name.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          사진 변경
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">환경 설정</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        집중 시간 (분)
                      </label>
                      <input
                        type="number"
                        value={focusDuration}
                        onChange={(e) => setFocusDuration(Number(e.target.value))}
                        min="15"
                        max="60"
                        step="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-sm text-gray-500 mt-1">권장: 25분</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        휴식 시간 (분)
                      </label>
                      <input
                        type="number"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                        min="5"
                        max="15"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-sm text-gray-500 mt-1">권장: 5분</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">알림 활성화</h3>
                        <p className="text-sm text-gray-500">집중 시간 종료 시 알림</p>
                      </div>
                      <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300'}
                        `}
                      >
                        <div className={`
                          absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                          ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}
                        `} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">알림음 활성화</h3>
                        <p className="text-sm text-gray-500">타이머 종료 시 소리</p>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors
                          ${soundEnabled ? 'bg-primary-500' : 'bg-gray-300'}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리 관리</h2>
                  <p className="text-gray-600 mb-6">학습 카테고리를 추가하거나 수정하세요</p>

                  <div className="space-y-4">
                    {['수학', '영어', '과학', '기타'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            편집
                          </button>
                          <button className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm">
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                      + 카테고리 추가
                    </button>
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">데이터 관리</h2>

                  <div className="space-y-4">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                      <h3 className="font-bold text-blue-900 mb-2">데이터 내보내기</h3>
                      <p className="text-sm text-blue-700 mb-4">
                        모든 학습 데이터를 CSV 파일로 내보낼 수 있습니다
                      </p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        CSV 다운로드
                      </button>
                    </div>

                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                      <h3 className="font-bold text-red-900 mb-2">계정 삭제</h3>
                      <p className="text-sm text-red-700 mb-4">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        계정 삭제
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
