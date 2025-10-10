import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-webgl'

export interface DetectedObject {
  bbox: [number, number, number, number] // [x, y, width, height]
  class: string
  score: number
}

class ObjectDetector {
  private model: cocoSsd.ObjectDetection | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      this.model = await cocoSsd.load()
      this.isInitialized = true
      console.log('Object detector initialized')
    } catch (error) {
      console.error('Failed to initialize object detector:', error)
      throw error
    }
  }

  async detectObjects(
    videoElement: HTMLVideoElement
  ): Promise<DetectedObject[]> {
    if (!this.model || !this.isInitialized) {
      await this.initialize()
    }

    try {
      const predictions = await this.model!.detect(videoElement)
      return predictions.map((pred) => ({
        bbox: pred.bbox,
        class: pred.class,
        score: pred.score,
      }))
    } catch (error) {
      console.error('Error detecting objects:', error)
      return []
    }
  }

  /**
   * Check if a phone is visible in the frame
   */
  isPhoneVisible(objects: DetectedObject[]): boolean {
    return objects.some(
      (obj) =>
        obj.class === 'cell phone' &&
        obj.score > 0.5 // Confidence threshold
    )
  }

  /**
   * Get all phones detected in frame with their positions
   */
  getPhones(objects: DetectedObject[]): DetectedObject[] {
    return objects.filter(
      (obj) => obj.class === 'cell phone' && obj.score > 0.5
    )
  }

  dispose() {
    // COCO-SSD doesn't have explicit dispose, but we can release reference
    this.model = null
    this.isInitialized = false
  }
}

// Singleton instance
export const objectDetector = new ObjectDetector()
