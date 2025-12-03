import { objectDetector } from '../objectDetector'
import type { DetectedObject } from '../objectDetector'

describe('ObjectDetector', () => {
  beforeEach(() => {
    // Reset detector state between tests
    objectDetector.dispose()
  })

  describe('isPhoneVisible', () => {
    it('should detect phone when cell phone object is found with high confidence', () => {
      const mockObjects: DetectedObject[] = [
        {
          bbox: [100, 100, 50, 100],
          class: 'cell phone',
          score: 0.8,
        },
      ]

      const result = objectDetector.isPhoneVisible(mockObjects)
      expect(result).toBe(true)
    })

    it('should not detect phone when confidence is too low', () => {
      const mockObjects: DetectedObject[] = [
        {
          bbox: [100, 100, 50, 100],
          class: 'cell phone',
          score: 0.3,
        },
      ]

      const result = objectDetector.isPhoneVisible(mockObjects)
      expect(result).toBe(false)
    })

    it('should not detect phone when no phone objects are present', () => {
      const mockObjects: DetectedObject[] = [
        {
          bbox: [100, 100, 50, 100],
          class: 'person',
          score: 0.9,
        },
        {
          bbox: [200, 200, 60, 80],
          class: 'laptop',
          score: 0.85,
        },
      ]

      const result = objectDetector.isPhoneVisible(mockObjects)
      expect(result).toBe(false)
    })

    it('should handle empty object array', () => {
      const result = objectDetector.isPhoneVisible([])
      expect(result).toBe(false)
    })
  })

  describe('getPhones', () => {
    it('should return all phones with sufficient confidence', () => {
      const mockObjects: DetectedObject[] = [
        {
          bbox: [100, 100, 50, 100],
          class: 'cell phone',
          score: 0.8,
        },
        {
          bbox: [300, 200, 45, 90],
          class: 'cell phone',
          score: 0.7,
        },
        {
          bbox: [400, 300, 40, 85],
          class: 'cell phone',
          score: 0.4, // Low confidence
        },
        {
          bbox: [200, 150, 100, 80],
          class: 'laptop',
          score: 0.9,
        },
      ]

      const phones = objectDetector.getPhones(mockObjects)
      expect(phones).toHaveLength(2)
      expect(phones[0].score).toBeGreaterThanOrEqual(0.5)
      expect(phones[1].score).toBeGreaterThanOrEqual(0.5)
    })

    it('should return empty array when no phones are detected', () => {
      const mockObjects: DetectedObject[] = [
        {
          bbox: [200, 150, 100, 80],
          class: 'laptop',
          score: 0.9,
        },
      ]

      const phones = objectDetector.getPhones(mockObjects)
      expect(phones).toHaveLength(0)
    })
  })

  describe('initialization', () => {
    it('should initialize only once even with multiple calls', async () => {
      const initSpy = jest.spyOn(console, 'log')

      await Promise.all([
        objectDetector.initialize(),
        objectDetector.initialize(),
        objectDetector.initialize(),
      ])

      // Should only initialize once
      const initMessages = initSpy.mock.calls.filter(
        (call) => call[0] === 'Object detector initialized'
      )
      expect(initMessages.length).toBeLessThanOrEqual(1)

      initSpy.mockRestore()
    })
  })
})
