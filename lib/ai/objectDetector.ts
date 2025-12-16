import {
  ObjectDetector,
  FilesetResolver,
  ObjectDetectorResult,
  Detection
} from '@mediapipe/tasks-vision'

export class ObjectDetectorProcessor {
  private objectDetector: ObjectDetector | null = null
  private isLoaded = false

  async load() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      )

      this.objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        scoreThreshold: 0.25, // Lenient threshold as per user preference
        maxResults: 5
      })

      this.isLoaded = true
      console.log('MediaPipe ObjectDetector loaded successfully')
    } catch (error) {
      console.error('Failed to load ObjectDetector:', error)
      throw error
    }
  }

  detectObjects(video: HTMLVideoElement, timestamp: number): ObjectDetectorResult | null {
    if (!this.isLoaded || !this.objectDetector) return null

    try {
      const result = this.objectDetector.detectForVideo(video, timestamp)
      return result
    } catch (error) {
      console.error('Error detecting objects:', error)
      return null
    }
  }

  isPhoneVisible(result: ObjectDetectorResult | null): boolean {
    if (!result || !result.detections) return false

    return result.detections.some(detection =>
      detection.categories.some(category =>
        category.categoryName === 'cell phone' && category.score > 0.25
      )
    )
  }

  getPhones(result: ObjectDetectorResult | null): Detection[] {
    if (!result || !result.detections) return []

    return result.detections.filter(detection =>
      detection.categories.some(category =>
        category.categoryName === 'cell phone' && category.score > 0.25
      )
    )
  }

  isPersonDetected(result: ObjectDetectorResult | null): boolean {
    if (!result || !result.detections) return false

    return result.detections.some(detection =>
      detection.categories.some(category =>
        category.categoryName === 'person' && category.score > 0.5
      )
    )
  }

  dispose() {
    if (this.objectDetector) {
      this.objectDetector.close()
      this.objectDetector = null
    }
    this.isLoaded = false
  }
}

export const objectDetector = new ObjectDetectorProcessor()
