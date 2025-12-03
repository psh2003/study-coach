'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebcam } from '@/lib/ai/useWebcam'
import { poseProcessor } from '@/lib/ai/poseProcessor'
import { objectDetector } from '@/lib/ai/objectDetector'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { Camera, CameraOff, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

export default function WebcamMonitor() {
  const {
    videoRef,
    isStreaming,
    error,
    hasPermission,
    startWebcam,
    stopWebcam,
  } = useWebcam({ autoStart: false })

  const {
    isSessionActive,
    postureWarning,
    phoneWarning,
    absenceWarning,
    setPostureWarning,
    setPhoneWarning,
    setAbsenceWarning,
  } = useFocusStore()

  const [isAIReady, setIsAIReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [fps, setFps] = useState(0)

  const animationFrameRef = useRef<number>()
  const postureTimerRef = useRef<NodeJS.Timeout>()
  const phoneTimerRef = useRef<NodeJS.Timeout>()
  const absenceTimerRef = useRef<NodeJS.Timeout>()
  const lastFrameTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)

  // Initialize AI models when webcam starts
  useEffect(() => {
    if (!isStreaming) {
      setIsAIReady(false)
      setInitStatus('idle')
      return
    }

    let isMounted = true

    const initializeAI = async () => {
      setInitStatus('loading')
      console.log('🔄 Initializing AI models...')

      try {
        // Initialize both models in parallel
        await Promise.all([
          poseProcessor.initialize(),
          objectDetector.initialize()
        ])

        if (isMounted) {
          setIsAIReady(true)
          setInitStatus('ready')
          console.log('✅ AI models ready!')
        }
      } catch (err) {
        console.error('❌ Failed to initialize AI:', err)
        if (isMounted) {
          setInitStatus('error')
        }
      }
    }

    initializeAI()

    return () => {
      isMounted = false
    }
  }, [isStreaming])

  // AI monitoring loop - runs independently of session state
  useEffect(() => {
    if (!isAIReady || !isStreaming || !videoRef.current) {
      return
    }

    let isActive = true
    let frameCount = 0
    let lastFpsUpdate = Date.now()

    const processFrame = async () => {
      if (!isActive || !videoRef.current) return

      const now = performance.now()
      const timeSinceLastFrame = now - lastFrameTimeRef.current

      // Throttle to ~10 FPS for AI processing (every 100ms)
      if (timeSinceLastFrame < 100) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
        return
      }

      lastFrameTimeRef.current = now

      try {
        setIsProcessing(true)

        // Update FPS counter
        frameCount++
        const fpsElapsed = Date.now() - lastFpsUpdate
        if (fpsElapsed >= 1000) {
          setFps(Math.round((frameCount * 1000) / fpsElapsed))
          frameCount = 0
          lastFpsUpdate = Date.now()
        }

        // Run AI detection in parallel
        const [pose, objects] = await Promise.all([
          poseProcessor.detectPose(videoRef.current),
          objectDetector.detectObjects(videoRef.current)
        ])

        // Check for turtle neck (bad posture)
        if (pose && poseProcessor.isTurtleNeck(pose, videoRef.current.videoWidth)) {
          if (!postureTimerRef.current) {
            postureTimerRef.current = setTimeout(() => {
              setPostureWarning(true)
              console.log('⚠️ Bad posture detected!')
            }, 10000) // 10 seconds
          }
        } else {
          if (postureTimerRef.current) {
            clearTimeout(postureTimerRef.current)
            postureTimerRef.current = undefined
          }
          if (postureWarning) {
            setPostureWarning(false)
          }
        }

        // Check if person is absent
        if (poseProcessor.isPersonAbsent(pose)) {
          if (!absenceTimerRef.current) {
            absenceTimerRef.current = setTimeout(() => {
              setAbsenceWarning(true)
              console.log('⚠️ Person absent!')
            }, 3000) // 3 seconds
          }
        } else {
          if (absenceTimerRef.current) {
            clearTimeout(absenceTimerRef.current)
            absenceTimerRef.current = undefined
          }
          if (absenceWarning) {
            setAbsenceWarning(false)
          }
        }

        // Check for phone
        if (objectDetector.isPhoneVisible(objects)) {
          if (!phoneTimerRef.current) {
            phoneTimerRef.current = setTimeout(() => {
              setPhoneWarning(true)
              console.log('📱 Phone detected!')
            }, 3000) // 3 seconds
          }
        } else {
          if (phoneTimerRef.current) {
            clearTimeout(phoneTimerRef.current)
            phoneTimerRef.current = undefined
          }
          if (phoneWarning) {
            setPhoneWarning(false)
          }
        }

        setIsProcessing(false)
      } catch (err) {
        console.error('Error processing frame:', err)
        setIsProcessing(false)
      }

      // Continue loop
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
      }
    }

    // Start processing
    console.log('🎬 Starting AI monitoring loop...')
    processFrame()

    return () => {
      console.log('⏹️ Stopping AI monitoring loop...')
      isActive = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (postureTimerRef.current) clearTimeout(postureTimerRef.current)
      if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current)
      if (absenceTimerRef.current) clearTimeout(absenceTimerRef.current)
    }
  }, [isAIReady, isStreaming])

  const handleStartWebcam = async () => {
    console.log('📹 Starting webcam...')
    await startWebcam()
  }

  const handleStopWebcam = () => {
    console.log('📹 Stopping webcam...')
    stopWebcam()
  }

  return (
    <div className="relative">
      {/* Header with camera control button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isAIReady && isStreaming && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#52FF86]/30 rounded-full text-xs text-[#F5F5F5]"
            >
              <div className="w-2 h-2 rounded-full bg-[#52FF86] animate-pulse" />
              <span>활성</span>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={isStreaming ? handleStopWebcam : handleStartWebcam}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg transition-all hover:border-[#52FF86] ${isStreaming ? 'text-red-400' : 'text-[#52FF86]'
            }`}
          title={isStreaming ? '카메라 중지' : '카메라 시작'}
        >
          {isStreaming ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </motion.button>
      </div>

      <div className="relative aspect-video bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#A3A3A3]/10">
        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-[#A3A3A3] text-center p-4">
            <div>
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-sm font-light">{error}</p>
              <button
                onClick={handleStartWebcam}
                className="mt-4 px-4 py-2 bg-[#0D0D0D] border border-[#A3A3A3]/30 rounded-lg text-xs text-[#F5F5F5] hover:bg-[#1A1A1A] hover:border-[#52FF86] transition-all"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-[#A3A3A3]">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-light tracking-wider mb-4">카메라 비활성</p>
              <button
                onClick={handleStartWebcam}
                className="px-6 py-3 bg-[#52FF86] text-[#0D0D0D] rounded-lg font-bold hover:bg-[#52FF86]/80 transition-all shadow-[0_0_15px_0px_rgba(82,255,134,0.3)] text-sm"
              >
                모니터링 시작
              </button>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* AI Status Overlay */}
        {isStreaming && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* AI Status */}
            <AnimatePresence mode="wait">
              {initStatus === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-3 py-2 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#52FF86]/30 rounded-lg flex items-center gap-2 text-xs text-[#F5F5F5]"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-[#52FF86]" />
                  <span>AI 로딩 중...</span>
                </motion.div>
              )}

              {initStatus === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-3 py-2 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#52FF86]/30 rounded-lg flex items-center gap-2 text-xs text-[#F5F5F5]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#52FF86]" />
                  <span>AI 준비됨</span>
                  {fps > 0 && <span className="ml-2 text-[#A3A3A3]">• {fps} FPS</span>}
                </motion.div>
              )}

              {initStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-3 py-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center gap-2 text-xs text-[#F5F5F5]"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>AI 오류</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Indicator */}
            {isProcessing && isAIReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-2 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#52FF86]/30 rounded-lg flex items-center gap-2 text-xs text-[#F5F5F5]"
              >
                <div className="w-2 h-2 rounded-full bg-[#52FF86] animate-pulse" />
                <span>분석 중</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Warnings - Show only when session is active */}
      {isSessionActive && isAIReady && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          <AnimatePresence>
            {postureWarning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm font-light text-[#F5F5F5]">허리를 펴고 바른 자세를 유지해 주세요!</span>
              </motion.div>
            )}

            {phoneWarning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm font-light text-[#F5F5F5]">집중! 스마트폰을 잠시 내려놓으세요.</span>
              </motion.div>
            )}

            {absenceWarning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-orange-500/10 backdrop-blur-sm border border-orange-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-sm font-light text-[#F5F5F5]">자리를 비우셨네요.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Info when session not active */}
      {!isSessionActive && isAIReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 glass rounded-xl"
        >
          <p className="text-xs text-white/40 font-light text-center">
            AI is monitoring but warnings are disabled. Start a focus session to enable alerts.
          </p>
        </motion.div>
      )}
    </div>
  )
}
