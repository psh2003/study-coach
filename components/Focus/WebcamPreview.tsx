'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minimize2, Maximize2 } from 'lucide-react'
import { useFocusStore } from '@/lib/store/useFocusStore'

interface WebcamPreviewProps {
  onClose?: () => void
}

export default function WebcamPreview({ onClose }: WebcamPreviewProps) {
  const { isWebcamActive, webcamStream } = useFocusStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    if (!videoRef.current || !webcamStream) return

    videoRef.current.srcObject = webcamStream

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [webcamStream])

  if (!isWebcamActive || !webcamStream) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed top-24 right-8 z-[55] bg-[#1A1A1A] rounded-xl border border-[#A3A3A3]/20 shadow-2xl overflow-hidden ${isMinimized ? 'w-48' : 'w-80'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-[#0D0D0D] border-b border-[#A3A3A3]/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#52FF86] animate-pulse" />
            <span className="text-xs text-[#A3A3A3]">AI 모니터링 중</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-[#1A1A1A] rounded transition-colors text-[#A3A3A3] hover:text-[#F5F5F5]"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-[#1A1A1A] rounded transition-colors text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video */}
        <motion.div
          animate={{
            height: isMinimized ? 108 : 180,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative overflow-hidden"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // Mirror the video
          />

          {/* Overlay indicators */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#0D0D0D]/80 backdrop-blur-sm rounded text-xs text-[#52FF86]">
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>
              <span>감지 중</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
