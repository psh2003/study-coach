import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

export interface PoseLandmark {
  x: number
  y: number
  z?: number
  score?: number
}

export interface Pose {
  keypoints: poseDetection.Keypoint[]
  score?: number
}

class PoseProcessor {
  private detector: poseDetection.PoseDetector | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      const model = poseDetection.SupportedModels.MoveNet
      this.detector = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      })
      this.isInitialized = true
      console.log('Pose detector initialized')
    } catch (error) {
      console.error('Failed to initialize pose detector:', error)
      throw error
    }
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<Pose | null> {
    if (!this.detector || !this.isInitialized) {
      await this.initialize()
    }

    try {
      const poses = await this.detector!.estimatePoses(videoElement)
      return poses.length > 0 ? poses[0] : null
    } catch (error) {
      console.error('Error detecting pose:', error)
      return null
    }
  }

  /**
   * Detect turtle neck posture (forward head posture)
   * Returns true if neck is extended forward significantly
   */
  isTurtleNeck(pose: Pose): boolean {
    if (!pose.keypoints) return false

    // Get nose and shoulder keypoints
    const nose = pose.keypoints.find((kp) => kp.name === 'nose')
    const leftShoulder = pose.keypoints.find((kp) => kp.name === 'left_shoulder')
    const rightShoulder = pose.keypoints.find((kp) => kp.name === 'right_shoulder')

    if (!nose || !leftShoulder || !rightShoulder) return false

    // Check confidence scores
    if (
      (nose.score || 0) < 0.5 ||
      (leftShoulder.score || 0) < 0.5 ||
      (rightShoulder.score || 0) < 0.5
    ) {
      return false
    }

    // Calculate average shoulder position
    const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2

    // Calculate horizontal distance between nose and shoulders
    const horizontalDistance = Math.abs(nose.x - avgShoulderX)

    // Calculate vertical distance
    const verticalDistance = Math.abs(nose.y - avgShoulderY)

    // If nose is significantly forward of shoulders (poor posture)
    // Threshold can be adjusted based on testing
    const threshold = 0.15 // 15% of frame width

    return horizontalDistance / videoElement.videoWidth > threshold
  }

  /**
   * Detect if user is absent (no person detected)
   */
  isPersonAbsent(pose: Pose | null): boolean {
    if (!pose) return true

    // Check if enough keypoints are detected with good confidence
    const validKeypoints = pose.keypoints.filter(
      (kp) => (kp.score || 0) > 0.3
    )

    // If less than 5 keypoints detected, consider person absent
    return validKeypoints.length < 5
  }

  dispose() {
    if (this.detector) {
      this.detector.dispose()
      this.detector = null
      this.isInitialized = false
    }
  }
}

// Singleton instance
export const poseProcessor = new PoseProcessor()
