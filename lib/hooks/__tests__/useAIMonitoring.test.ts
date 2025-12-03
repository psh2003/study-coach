import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { useAIMonitoring } from '../useAIMonitoring'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { poseProcessor } from '@/lib/ai/poseProcessor'
import { objectDetector } from '@/lib/ai/objectDetector'

// Mock the stores and AI modules
jest.mock('@/lib/store/useFocusStore')
jest.mock('@/lib/ai/poseProcessor')
jest.mock('@/lib/ai/objectDetector')

describe('useAIMonitoring Integration', () => {
  const mockFocusStore = {
    isWebcamActive: true,
    webcamStream: {} as MediaStream,
    setPostureWarning: jest.fn(),
    setPhoneWarning: jest.fn(),
    setAbsenceWarning: jest.fn(),
  }

  const mockPoseProcessor = {
    initialize: jest.fn().mockResolvedValue(undefined),
    detectPose: jest.fn(),
    isTurtleNeck: jest.fn(),
    isPersonAbsent: jest.fn(),
  }

  const mockObjectDetector = {
    initialize: jest.fn().mockResolvedValue(undefined),
    detectObjects: jest.fn(),
    isPhoneVisible: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(useFocusStore as unknown as jest.Mock).mockReturnValue(mockFocusStore)
    ;(poseProcessor.initialize as jest.Mock).mockResolvedValue(undefined)
    ;(poseProcessor.detectPose as jest.Mock).mockResolvedValue({
      keypoints: [],
    })
    ;(poseProcessor.isTurtleNeck as jest.Mock).mockReturnValue(false)
    ;(poseProcessor.isPersonAbsent as jest.Mock).mockReturnValue(false)
    ;(objectDetector.initialize as jest.Mock).mockResolvedValue(undefined)
    ;(objectDetector.detectObjects as jest.Mock).mockResolvedValue([])
    ;(objectDetector.isPhoneVisible as jest.Mock).mockReturnValue(false)

    // Mock video element
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'video') {
        return {
          autoplay: true,
          playsInline: true,
          muted: true,
          width: 640,
          height: 480,
          srcObject: null,
          readyState: 4,
          videoWidth: 640,
        } as any
      }
      return document.createElement(tagName)
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize AI models on mount', async () => {
    renderHook(() => useAIMonitoring())

    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
      expect(objectDetector.initialize).toHaveBeenCalled()
    })
  })

  it('should detect bad posture after threshold', async () => {
    ;(poseProcessor.isTurtleNeck as jest.Mock).mockReturnValue(true)

    renderHook(() =>
      useAIMonitoring({
        postureThreshold: 3, // 3 seconds
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
    })

    // Advance timer by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(mockFocusStore.setPostureWarning).toHaveBeenCalledWith(true)
    })
  })

  it('should detect phone usage after threshold', async () => {
    ;(objectDetector.isPhoneVisible as jest.Mock).mockReturnValue(true)

    renderHook(() =>
      useAIMonitoring({
        phoneThreshold: 2, // 2 detections
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(objectDetector.initialize).toHaveBeenCalled()
    })

    // Object detection runs every 2 seconds, so advance by 4 seconds
    act(() => {
      jest.advanceTimersByTime(4000)
    })

    await waitFor(() => {
      expect(mockFocusStore.setPhoneWarning).toHaveBeenCalledWith(true)
    })
  })

  it('should detect user absence after threshold', async () => {
    ;(poseProcessor.isPersonAbsent as jest.Mock).mockReturnValue(true)

    renderHook(() =>
      useAIMonitoring({
        absenceThreshold: 5, // 5 seconds
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
    })

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(mockFocusStore.setAbsenceWarning).toHaveBeenCalledWith(true)
    })
  })

  it('should reset counters when good behavior is detected', async () => {
    let badPostureCount = 0
    ;(poseProcessor.isTurtleNeck as jest.Mock).mockImplementation(() => {
      badPostureCount++
      return badPostureCount <= 2 // Bad posture for 2 seconds, then good
    })

    renderHook(() =>
      useAIMonitoring({
        postureThreshold: 5, // 5 seconds threshold
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
    })

    // Advance by 6 seconds (2 bad + 4 good)
    act(() => {
      jest.advanceTimersByTime(6000)
    })

    // Should not trigger warning because counter was reset
    expect(mockFocusStore.setPostureWarning).not.toHaveBeenCalled()
  })

  it('should not run when webcam is inactive', () => {
    const inactiveMockStore = {
      ...mockFocusStore,
      isWebcamActive: false,
    }
    ;(useFocusStore as unknown as jest.Mock).mockReturnValue(inactiveMockStore)

    renderHook(() => useAIMonitoring())

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(poseProcessor.detectPose).not.toHaveBeenCalled()
  })

  it('should handle AI detection errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(poseProcessor.detectPose as jest.Mock).mockRejectedValue(
      new Error('Detection failed')
    )

    renderHook(() =>
      useAIMonitoring({
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
    })

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'AI detection error:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('should stop monitoring after max errors', async () => {
    ;(poseProcessor.detectPose as jest.Mock).mockRejectedValue(
      new Error('Detection failed')
    )

    renderHook(() =>
      useAIMonitoring({
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(poseProcessor.initialize).toHaveBeenCalled()
    })

    // Advance timer to trigger 6 errors (max is 5)
    act(() => {
      jest.advanceTimersByTime(6000)
    })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Too many AI detection errors. Stopping monitoring.'
      )
    })
  })

  it('should run object detection less frequently', async () => {
    renderHook(() =>
      useAIMonitoring({
        detectionInterval: 1000,
      })
    )

    // Wait for initialization
    await waitFor(() => {
      expect(objectDetector.initialize).toHaveBeenCalled()
    })

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Object detection should not run yet (runs every 2 frames)
    expect(objectDetector.detectObjects).not.toHaveBeenCalled()

    // Advance by 1 more second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Now it should run
    await waitFor(() => {
      expect(objectDetector.detectObjects).toHaveBeenCalled()
    })
  })
})
