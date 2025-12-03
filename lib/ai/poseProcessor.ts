import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  PoseLandmarkerResult,
  NormalizedLandmark
} from '@mediapipe/tasks-vision'

export class PoseProcessor {
  private poseLandmarker: PoseLandmarker | null = null
  private isLoaded = false

  async load() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      )

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this.isLoaded = true
      console.log('MediaPipe PoseLandmarker loaded successfully')
    } catch (error) {
      console.error('Failed to load PoseLandmarker:', error)
      throw error
    }
  }

  detectPose(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult | null {
    if (!this.isLoaded || !this.poseLandmarker) return null

    try {
      const result = this.poseLandmarker.detectForVideo(video, timestamp)
      return result
    } catch (error) {
      console.error('Error detecting pose:', error)
      return null
    }
  }

  isTurtleNeck(result: PoseLandmarkerResult | null): boolean {
    if (!result || !result.landmarks || result.landmarks.length === 0) return false

    const landmarks = result.landmarks[0]

    // MediaPipe Pose Landmarks:
    // 7: left ear, 8: right ear
    // 11: left shoulder, 12: right shoulder

    const leftEar = landmarks[7]
    const rightEar = landmarks[8]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Check visibility/presence (optional, depending on needs)
    // if (leftEar.visibility < 0.5 || ...) return false

    // Calculate midpoints
    const earY = (leftEar.y + rightEar.y) / 2
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2

    // Calculate distance (simple heuristic)
    // In normalized coordinates (0-1), larger Y means lower on screen
    // If ear is too close to shoulder vertically, it might indicate turtle neck (head forward/down)
    // Or if ear X is far ahead of shoulder X (requires side view, hard with webcam)

    // For front webcam: 
    // Turtle neck usually involves head coming forward and down relative to shoulders.
    // This reduces the vertical distance between ears and shoulders in 2D projection.

    const verticalDistance = Math.abs(shoulderY - earY)

    // Threshold needs tuning. 
    // Normal posture: distance is larger.
    // Turtle neck/Slouching: distance is smaller.
    // This is very dependent on camera angle and distance.
    // Let's use a conservative threshold for now.

    return verticalDistance < 0.15 // Heuristic value
  }

  isPersonAbsent(result: PoseLandmarkerResult | null): boolean {
    // If no result or no landmarks detected
    if (!result || !result.landmarks || result.landmarks.length === 0) {
      // If detection fails completely, we might assume absence, 
      // BUT to be safe (as per previous user request), we should be lenient.
      // However, if the model runs but finds nothing, that IS absence.
      // Let's check if we have ANY landmarks.
      return true
    }

    const landmarks = result.landmarks[0]

    // Check if we have enough visible landmarks
    // MediaPipe usually returns all 33 landmarks, but some might have low visibility/presence?
    // Actually NormalizedLandmark has x, y, z, visibility.

    // Filter by visibility/presence if available (PoseLandmarker might not populate visibility in all models, but usually does)
    // Let's assume visibility > 0.1 as "visible" (very lenient)

    // const visibleLandmarks = landmarks.filter(lm => (lm.visibility ?? 1) > 0.1)

    // If very few landmarks are visible, consider absent
    // if (visibleLandmarks.length < 2) return true

    // Just check if we have landmarks at all. If the model returns landmarks, it found a pose.
    if (landmarks.length < 5) return true // Arbitrary low number, usually it returns 33

    // Check for shoulders specifically for extra safety
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    const hasShoulder = (leftShoulder.visibility ?? 1) > 0.1 || (rightShoulder.visibility ?? 1) > 0.1

    // If we see a shoulder, they are definitely present
    if (hasShoulder) return false

    // If we see enough other points but no shoulder (e.g. face only), they are present
    return false
  }

  dispose() {
    if (this.poseLandmarker) {
      this.poseLandmarker.close()
      this.poseLandmarker = null
    }
    this.isLoaded = false
  }
}

export const poseProcessor = new PoseProcessor()
