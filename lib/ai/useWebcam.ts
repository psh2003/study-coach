'use client'

import { useEffect, useRef, useState } from 'react'

interface UseWebcamOptions {
  autoStart?: boolean
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const {
    autoStart = false,
    facingMode = 'user',
    width = 640,
    height = 480,
  } = options

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsStreaming(true)
      setHasPermission(true)
      setError(null)
    } catch (err: any) {
      console.error('Error accessing webcam:', err)
      setError(err.message || 'Failed to access webcam')
      setHasPermission(false)
      setIsStreaming(false)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
  }

  const captureFrame = (): ImageData | null => {
    if (!videoRef.current || !isStreaming) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoRef.current, 0, 0)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (autoStart) {
      startWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [autoStart])

  return {
    videoRef,
    isStreaming,
    error,
    hasPermission,
    startWebcam,
    stopWebcam,
    captureFrame,
  }
}
