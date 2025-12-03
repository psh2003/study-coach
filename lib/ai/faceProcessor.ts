import {
    FaceLandmarker,
    FilesetResolver,
    FaceLandmarkerResult
} from '@mediapipe/tasks-vision'

export class FaceProcessor {
    private faceLandmarker: FaceLandmarker | null = null
    private isLoaded = false

    async load() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            )

            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numFaces: 1,
                minFaceDetectionConfidence: 0.5,
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
                outputFaceBlendshapes: true, // Required for eye blink detection
            })

            this.isLoaded = true
            console.log('MediaPipe FaceLandmarker loaded successfully')
        } catch (error) {
            console.error('Failed to load FaceLandmarker:', error)
            throw error
        }
    }

    detectFace(video: HTMLVideoElement, timestamp: number): FaceLandmarkerResult | null {
        if (!this.isLoaded || !this.faceLandmarker) return null

        try {
            const result = this.faceLandmarker.detectForVideo(video, timestamp)
            return result
        } catch (error) {
            console.error('Error detecting face:', error)
            return null
        }
    }

    isEyesClosed(result: FaceLandmarkerResult | null): boolean {
        // If no result or no face detected, return false (don't detect drowsiness)
        if (!result || !result.faceBlendshapes || result.faceBlendshapes.length === 0) return false

        const blendshapes = result.faceBlendshapes[0].categories

        // Find eye blink blendshapes
        const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')
        const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')

        if (!eyeBlinkLeft || !eyeBlinkRight) return false

        // Threshold for closed eyes (0.0 = open, 1.0 = closed)
        // Using 0.5 as a safe threshold
        const isLeftClosed = eyeBlinkLeft.score > 0.5
        const isRightClosed = eyeBlinkRight.score > 0.5

        console.log('Eye Blink Scores:', { left: eyeBlinkLeft.score, right: eyeBlinkRight.score })

        // Consider drowsy only if BOTH eyes are closed
        return isLeftClosed && isRightClosed
    }

    dispose() {
        if (this.faceLandmarker) {
            this.faceLandmarker.close()
            this.faceLandmarker = null
        }
        this.isLoaded = false
    }
}

export const faceProcessor = new FaceProcessor()
