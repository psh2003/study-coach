'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTimerStore } from '@/lib/store/useTimerStore'
import { useFocusStore } from '@/lib/store/useFocusStore'
import FullScreenTimer from '@/components/Timer/FullScreenTimer'
import CompletionModal from '@/components/Timer/CompletionModal'
import MinimizedAICoach from '@/components/Focus/MinimizedAICoach'
import WebcamPreview from '@/components/Focus/WebcamPreview'

export default function TimerPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { currentSession, mode, enterFullScreen, endSession } = useTimerStore()
  const { isWebcamActive, activateWebcam } = useFocusStore()
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showWebcamPreview, setShowWebcamPreview] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  // Redirect if no active session
  useEffect(() => {
    if (!currentSession) {
      router.push('/dashboard')
    }
  }, [currentSession, router])

  // Enter full-screen on mount
  useEffect(() => {
    enterFullScreen()
  }, [enterFullScreen])

  // Show completion modal when session completes
  useEffect(() => {
    if (mode === 'completed') {
      setShowCompletionModal(true)
    }
  }, [mode])

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentSession && mode === 'focus') {
        e.preventDefault()
        e.returnValue = '집중 세션이 진행 중입니다. 정말 나가시겠습니까?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentSession, mode])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (currentSession && mode === 'focus') {
        const confirmLeave = confirm('집중 세션이 진행 중입니다. 정말 나가시겠습니까?')
        if (!confirmLeave) {
          // Push state again to prevent navigation
          window.history.pushState(null, '', window.location.pathname)
        } else {
          endSession()
        }
      }
    }

    // Push initial state
    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentSession, mode, endSession])

  const handleToggleWebcam = async () => {
    if (!showWebcamPreview && !isWebcamActive) {
      try {
        await activateWebcam()
      } catch (error) {
        console.error('Failed to activate webcam:', error)
        alert('웹캠을 활성화할 수 없습니다. 권한을 확인해주세요.')
        return
      }
    }
    setShowWebcamPreview(!showWebcamPreview)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !currentSession) {
    return null
  }

  return (
    <>
      <FullScreenTimer />

      {/* AI Coach with minimized alerts */}
      <MinimizedAICoach />

      {/* Optional Webcam Preview */}
      {showWebcamPreview && (
        <WebcamPreview onClose={() => setShowWebcamPreview(false)} />
      )}

      {/* Webcam Preview Toggle Button */}
      <button
        onClick={handleToggleWebcam}
        className="fixed top-8 right-8 z-[60] flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#A3A3A3]/10 border border-[#A3A3A3]/20 rounded-full text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors backdrop-blur-sm"
        title={showWebcamPreview ? '카메라 숨기기' : '카메라 보기'}
      >
        <span className="material-symbols-outlined text-xl">
          {showWebcamPreview ? 'videocam_off' : 'videocam'}
        </span>
        <span className="text-sm font-medium">
          {showWebcamPreview ? '카메라 숨기기' : '카메라 보기'}
        </span>
      </button>

      <AnimatePresence>
        {showCompletionModal && currentSession && (
          <CompletionModal
            session={currentSession}
            onClose={() => setShowCompletionModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
