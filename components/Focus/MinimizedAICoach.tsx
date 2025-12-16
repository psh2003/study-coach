'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Smartphone, User } from 'lucide-react'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { useAIMonitoring } from '@/lib/hooks/useAIMonitoring'

interface Alert {
  id: string
  type: 'posture' | 'phone' | 'absence'
  message: string
  timestamp: Date
}

export default function MinimizedAICoach() {
  const {
    postureWarning,
    phoneWarning,
    absenceWarning,
    isWebcamActive,
    activateWebcam,
  } = useFocusStore()

  // Start AI monitoring
  const { isMonitoring } = useAIMonitoring({
    enabled: isWebcamActive,
    detectionInterval: 1000,
    postureThreshold: 10,
    phoneThreshold: 3,
    absenceThreshold: 2, // 2s for faster demo reaction
    drowsinessThreshold: 2, // Faster detection for demo
  })

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check webcam permission on mount
  useEffect(() => {
    if (!isWebcamActive) {
      setShowPermissionPrompt(true)
    }
  }, [isWebcamActive])

  // Monitor warnings and create alerts
  useEffect(() => {
    if (postureWarning) {
      addAlert({
        type: 'posture',
        message: '허리를 펴고 바른 자세를 유지해 주세요!',
      })
    }
  }, [postureWarning])

  useEffect(() => {
    if (phoneWarning) {
      addAlert({
        type: 'phone',
        message: '집중! 스마트폰을 잠시 내려놓으세요.',
      })
    }
  }, [phoneWarning])

  useEffect(() => {
    if (absenceWarning) {
      addAlert({
        type: 'absence',
        message: '자리를 비우셨네요. 타이머를 일시정지합니다.',
      })
    }
  }, [absenceWarning])

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}`,
      timestamp: new Date(),
    }

    setAlerts(prev => [...prev, newAlert])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id))
    }, 5000)
  }

  const handleEnableWebcam = async () => {
    try {
      setError(null)
      await activateWebcam()
      setShowPermissionPrompt(false)
    } catch (error) {
      console.error('Failed to activate webcam:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : '웹캠 접근에 실패했습니다.'

      setError(errorMessage)

      // Show error for 5 seconds
      setTimeout(() => setError(null), 5000)
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'posture':
        return <AlertCircle className="w-5 h-5" />
      case 'phone':
        return <Smartphone className="w-5 h-5" />
      case 'absence':
        return <User className="w-5 h-5" />
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'posture':
        return 'bg-[#FFA500]/20 border-[#FFA500]/30 text-[#FFA500]'
      case 'phone':
        return 'bg-[#FA5D29]/20 border-[#FA5D29]/30 text-[#FA5D29]'
      case 'absence':
        return 'bg-[#A3A3A3]/20 border-[#A3A3A3]/30 text-[#A3A3A3]'
    }
  }

  return (
    <>
      {/* Webcam Permission Prompt */}
      <AnimatePresence>
        {showPermissionPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 right-8 z-50 max-w-sm"
          >
            <div className="bg-[#1A1A1A] border border-[#52FF86]/30 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#52FF86]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#52FF86]">
                    videocam
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#F5F5F5] font-semibold mb-1">
                    AI 코칭 활성화
                  </h3>
                  <p className="text-[#A3A3A3] text-sm mb-3">
                    웹캠을 통해 자세, 스마트폰 사용, 자리 비움을 감지합니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEnableWebcam}
                      className="flex-1 py-2 px-3 bg-[#52FF86] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#1DC960] transition-colors"
                    >
                      활성화
                    </button>
                    <button
                      onClick={() => setShowPermissionPrompt(false)}
                      className="py-2 px-3 bg-[#0D0D0D] text-[#A3A3A3] rounded-lg text-sm border border-[#A3A3A3]/20 hover:text-[#F5F5F5] hover:border-[#A3A3A3]/40 transition-colors"
                    >
                      나중에
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Coach Alerts and Errors */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="p-4 rounded-xl border backdrop-blur-md bg-[#DC2626]/20 border-[#DC2626]/30 text-[#DC2626]"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-medium flex-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Alert Messages */}
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`p-4 rounded-xl border backdrop-blur-md ${getAlertColor(
                alert.type
              )}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.type)}
                <p className="text-sm font-medium flex-1">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
