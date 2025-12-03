import { poseProcessor } from '../poseProcessor'
import type { Pose } from '../poseProcessor'

describe('PoseProcessor', () => {
  beforeEach(() => {
    // Reset processor state between tests
    poseProcessor.dispose()
  })

  describe('isTurtleNeck', () => {
    it('should detect turtle neck posture when nose is significantly forward', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 400, y: 200, score: 0.9 },
          { name: 'left_shoulder', x: 300, y: 300, score: 0.9 },
          { name: 'right_shoulder', x: 320, y: 300, score: 0.9 },
        ],
      }

      const videoWidth = 640
      const result = poseProcessor.isTurtleNeck(mockPose, videoWidth)

      expect(result).toBe(true)
    })

    it('should not detect turtle neck when posture is good', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 310, y: 200, score: 0.9 },
          { name: 'left_shoulder', x: 300, y: 300, score: 0.9 },
          { name: 'right_shoulder', x: 320, y: 300, score: 0.9 },
        ],
      }

      const videoWidth = 640
      const result = poseProcessor.isTurtleNeck(mockPose, videoWidth)

      expect(result).toBe(false)
    })

    it('should return false when keypoints have low confidence', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 400, y: 200, score: 0.3 },
          { name: 'left_shoulder', x: 300, y: 300, score: 0.9 },
          { name: 'right_shoulder', x: 320, y: 300, score: 0.9 },
        ],
      }

      const videoWidth = 640
      const result = poseProcessor.isTurtleNeck(mockPose, videoWidth)

      expect(result).toBe(false)
    })

    it('should return false when required keypoints are missing', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 400, y: 200, score: 0.9 },
          // Missing shoulders
        ],
      }

      const videoWidth = 640
      const result = poseProcessor.isTurtleNeck(mockPose, videoWidth)

      expect(result).toBe(false)
    })
  })

  describe('isPersonAbsent', () => {
    it('should detect absence when no pose is provided', () => {
      const result = poseProcessor.isPersonAbsent(null)
      expect(result).toBe(true)
    })

    it('should detect absence when keypoints have low confidence', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 300, y: 200, score: 0.2 },
          { name: 'left_eye', x: 290, y: 190, score: 0.2 },
          { name: 'right_eye', x: 310, y: 190, score: 0.2 },
        ],
      }

      const result = poseProcessor.isPersonAbsent(mockPose)
      expect(result).toBe(true)
    })

    it('should not detect absence when enough keypoints are visible', () => {
      const mockPose: Pose = {
        keypoints: [
          { name: 'nose', x: 300, y: 200, score: 0.9 },
          { name: 'left_eye', x: 290, y: 190, score: 0.9 },
          { name: 'right_eye', x: 310, y: 190, score: 0.9 },
          { name: 'left_shoulder', x: 280, y: 300, score: 0.9 },
          { name: 'right_shoulder', x: 320, y: 300, score: 0.9 },
          { name: 'left_elbow', x: 260, y: 350, score: 0.9 },
        ],
      }

      const result = poseProcessor.isPersonAbsent(mockPose)
      expect(result).toBe(false)
    })
  })

  describe('initialization', () => {
    it('should initialize only once even with multiple calls', async () => {
      const initSpy = jest.spyOn(console, 'log')

      await Promise.all([
        poseProcessor.initialize(),
        poseProcessor.initialize(),
        poseProcessor.initialize(),
      ])

      // Should only initialize once
      const initMessages = initSpy.mock.calls.filter(
        (call) => call[0] === 'Pose detector initialized'
      )
      expect(initMessages.length).toBeLessThanOrEqual(1)

      initSpy.mockRestore()
    })
  })
})
