import { useEffect, useRef, useState, useCallback } from 'react'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { poseProcessor } from '@/lib/ai/poseProcessor'
import { objectDetector } from '@/lib/ai/objectDetector'
import { faceProcessor } from '@/lib/ai/faceProcessor'

interface AIMonitoringOptions {
  enabled: boolean
  detectionInterval?: number
  postureThreshold?: number
  phoneThreshold?: number
  absenceThreshold?: number
  drowsinessThreshold?: number
}

export function useAIMonitoring(options: AIMonitoringOptions) {
  const {
    enabled,
    detectionInterval = 1000, // Run detection every 1 second (not strictly used with requestAnimationFrame but good for throttling if needed)
    postureThreshold = 10, // 10 seconds of bad posture
    phoneThreshold = 3, // 3 seconds with phone
    absenceThreshold = 4, // 4 seconds of absence
    drowsinessThreshold = 5, // 5 seconds of drowsiness
  } = options

  const {
    isWebcamActive,
    webcamStream,
    setPostureWarning,
    setPhoneWarning,
    setAbsenceWarning,
    setDrowsinessWarning,
    postureWarning,
    phoneWarning,
    absenceWarning,
    drowsinessWarning,
  } = useFocusStore()

  const [isMonitoring, setIsMonitoring] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const requestRef = useRef<number>()
  const lastDetectionTimeRef = useRef<number>(0)

  // Counters
  const postureCounterRef = useRef(0)
  const phoneCounterRef = useRef(0)
  const absenceCounterRef = useRef(0)
  const drowsinessCounterRef = useRef(0)

  // Reset counters when warnings are cleared
  useEffect(() => {
    if (!postureWarning) postureCounterRef.current = 0
  }, [postureWarning])

  useEffect(() => {
    if (!phoneWarning) phoneCounterRef.current = 0
  }, [phoneWarning])

  useEffect(() => {
    if (!absenceWarning) absenceCounterRef.current = 0
  }, [absenceWarning])

  useEffect(() => {
    if (!drowsinessWarning) drowsinessCounterRef.current = 0
  }, [drowsinessWarning])

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          poseProcessor.load(),
          objectDetector.load(),
          faceProcessor.load()
        ])
        console.log('AI Models loaded')
      } catch (error) {
        console.error('Failed to load AI models:', error)
      }
    }

    loadModels()

    return () => {
      // Cleanup handled in processors
    }
  }, [])

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !enabled || !isWebcamActive) return

    const now = Date.now()
    // Throttle detection to ~10fps or detectionInterval
    if (now - lastDetectionTimeRef.current < 100) { // Run at max 10fps
      requestRef.current = requestAnimationFrame(runDetection)
      return
    }
    lastDetectionTimeRef.current = now

    // MediaPipe requires timestamp in ms
    const timestamp = performance.now()

    // 1. Detect Pose
    const poseResult = poseProcessor.detectPose(videoRef.current, timestamp)

    // 2. Detect Objects
    const objectResult = objectDetector.detectObjects(videoRef.current, timestamp)

    // 3. Detect Face (for drowsiness)
    const faceResult = faceProcessor.detectFace(videoRef.current, timestamp)

    // --- Logic ---

    // Posture Check
    const isBadPosture = poseProcessor.isTurtleNeck(poseResult)
    // console.log('Posture Check:', { isBadPosture, counter: postureCounterRef.current })
    if (isBadPosture) {
      postureCounterRef.current += 0.1 // Increment by time (approx 100ms)
    } else {
      postureCounterRef.current = Math.max(0, postureCounterRef.current - 0.1)
    }

    // Drowsiness Check (Eyes Closed)
    // Only check if face is detected. If no face, don't increment drowsiness.
    const isEyesClosed = faceProcessor.isEyesClosed(faceResult)
    if (isEyesClosed) {
      drowsinessCounterRef.current += 0.1
      console.log('Eyes Closed detected:', { counter: drowsinessCounterRef.current })
    } else {
      drowsinessCounterRef.current = Math.max(0, drowsinessCounterRef.current - 0.1)
    }

    // Phone Check
    const isPhoneVisible = objectDetector.isPhoneVisible(objectResult)
    // console.log('Phone Check:', { isPhoneVisible, counter: phoneCounterRef.current })
    if (isPhoneVisible) {
      phoneCounterRef.current += 0.1
    } else {
      phoneCounterRef.current = Math.max(0, phoneCounterRef.current - 0.1)
    }

    // Absence Check
    // Consider absent ONLY if pose detection says absent AND no person object is detected
    const isPoseAbsent = poseProcessor.isPersonAbsent(poseResult)
    const isPersonObjectDetected = objectDetector.isPersonDetected(objectResult)

    // If we see a person object, we are NOT absent, even if pose fails
    const isAbsent = isPoseAbsent && !isPersonObjectDetected

    if (isAbsent) {
      absenceCounterRef.current += 0.1
      // console.log('Absence detected:', { isPoseAbsent, isPersonObjectDetected, counter: absenceCounterRef.current })
    } else {
      absenceCounterRef.current = Math.max(0, absenceCounterRef.current - 0.5) // Recover faster
    }
    // console.log('Absence Check:', { isAbsent, counter: absenceCounterRef.current })

    // Trigger Warnings
    if (postureCounterRef.current > postureThreshold && !postureWarning) {
      // console.log('Triggering Posture Warning')
      setPostureWarning(true)
    }

    if (drowsinessCounterRef.current > drowsinessThreshold && !drowsinessWarning) {
      console.log('Triggering Drowsiness Warning')
      setDrowsinessWarning(true)
    }

    if (phoneCounterRef.current > phoneThreshold && !phoneWarning) {
      // console.log('Triggering Phone Warning')
      setPhoneWarning(true)
    }

    if (absenceCounterRef.current > absenceThreshold && !absenceWarning) {
      // console.log('Triggering Absence Warning', { counter: absenceCounterRef.current, threshold: absenceThreshold })
      setAbsenceWarning(true)
    }

    requestRef.current = requestAnimationFrame(runDetection)
  }, [
    enabled,
    isWebcamActive,
    postureThreshold,
    phoneThreshold,
    absenceThreshold,
    drowsinessThreshold,
    postureWarning,
    phoneWarning,
    absenceWarning,
    drowsinessWarning,
    setPostureWarning,
    setPhoneWarning,
    setAbsenceWarning,
    setDrowsinessWarning,
  ])

  // Start/Stop monitoring loop
  useEffect(() => {
    if (enabled && isWebcamActive && webcamStream) {
      // Create hidden video element for AI processing
      if (!videoRef.current) {
        videoRef.current = document.createElement('video')
        videoRef.current.autoplay = true
        videoRef.current.playsInline = true
        videoRef.current.muted = true
        // MediaPipe works best with specific resolutions, but flexible
        // videoRef.current.width = 640
        // videoRef.current.height = 480
      }

      videoRef.current.srcObject = webcamStream

      // Ensure video is playing
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error('Failed to play hidden video:', e))
      }

      setIsMonitoring(true)
      requestRef.current = requestAnimationFrame(runDetection)
    } else {
      setIsMonitoring(false)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }

      // Cleanup video element source
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [enabled, isWebcamActive, webcamStream, runDetection])

  return { isMonitoring }
}
