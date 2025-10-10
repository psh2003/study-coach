'use client'

import { useEffect, useRef, useState } from 'react'
import { useWebcam } from '@/lib/ai/useWebcam'
import { poseProcessor } from '@/lib/ai/poseProcessor'
import { objectDetector } from '@/lib/ai/objectDetector'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { Camera, CameraOff, AlertTriangle } from 'lucide-react'

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

  const [isProcessing, setIsProcessing] = useState(false)
  const animationFrameRef = useRef<number>()
  const postureTimerRef = useRef<NodeJS.Timeout>()
  const phoneTimerRef = useRef<NodeJS.Timeout>()
  const absenceTimerRef = useRef<NodeJS.Timeout>()

  // AI monitoring loop
  useEffect(() => {
    if (!isSessionActive || !isStreaming || !videoRef.current) {
      return
    }

    let isActive = true

    const processFrame = async () => {
      if (!isActive || !videoRef.current) return

      try {
        setIsProcessing(true)

        // Detect pose
        const pose = await poseProcessor.detectPose(videoRef.current)

        // Check for turtle neck (bad posture)
        if (pose && poseProcessor.isTurtleNeck(pose)) {
          if (!postureTimerRef.current) {
            postureTimerRef.current = setTimeout(() => {
              setPostureWarning(true)
            }, 10000) // 10 seconds
          }
        } else {
          if (postureTimerRef.current) {
            clearTimeout(postureTimerRef.current)
            postureTimerRef.current = undefined
          }
          setPostureWarning(false)
        }

        // Check if person is absent
        if (poseProcessor.isPersonAbsent(pose)) {
          if (!absenceTimerRef.current) {
            absenceTimerRef.current = setTimeout(() => {
              setAbsenceWarning(true)
            }, 15000) // 15 seconds
          }
        } else {
          if (absenceTimerRef.current) {
            clearTimeout(absenceTimerRef.current)
            absenceTimerRef.current = undefined
          }
          setAbsenceWarning(false)
        }

        // Detect objects (phone)
        const objects = await objectDetector.detectObjects(videoRef.current)
        if (objectDetector.isPhoneVisible(objects)) {
          if (!phoneTimerRef.current) {
            phoneTimerRef.current = setTimeout(() => {
              setPhoneWarning(true)
            }, 5000) // 5 seconds
          }
        } else {
          if (phoneTimerRef.current) {
            clearTimeout(phoneTimerRef.current)
            phoneTimerRef.current = undefined
          }
          setPhoneWarning(false)
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
    processFrame()

    return () => {
      isActive = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (postureTimerRef.current) clearTimeout(postureTimerRef.current)
      if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current)
      if (absenceTimerRef.current) clearTimeout(absenceTimerRef.current)
    }
  }, [isSessionActive, isStreaming])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">AI 모니터링</h3>
        {isStreaming ? (
          <button
            onClick={stopWebcam}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="카메라 끄기"
          >
            <CameraOff className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={startWebcam}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="카메라 켜기"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Webcam view */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
            <div>
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">카메라를 시작하세요</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {isProcessing && isStreaming && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
            AI 분석 중
          </div>
        )}
      </div>

      {/* Warnings */}
      {isSessionActive && (
        <div className="mt-4 space-y-2">
          {postureWarning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>허리를 펴고 바른 자세를 유지해 주세요!</span>
            </div>
          )}

          {phoneWarning && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>집중! 스마트폰을 잠시 내려놓으세요.</span>
            </div>
          )}

          {absenceWarning && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>자리를 비우셨네요. 타이머를 일시정지합니다.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
