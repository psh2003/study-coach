import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import FullScreenTimer from '../FullScreenTimer'
import { useTimerStore } from '@/lib/store/useTimerStore'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { useFocusStore } from '@/lib/store/useFocusStore'

// Mock the stores
jest.mock('@/lib/store/useTimerStore')
jest.mock('@/lib/store/usePlannerStore')
jest.mock('@/lib/store/useFocusStore')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('FullScreenTimer Integration', () => {
  const mockTimerStore = {
    currentSession: {
      taskId: 'task-1',
      duration: 1500, // 25 minutes in seconds
      elapsed: 0,
    },
    mode: 'focus',
    exitFullScreen: jest.fn(),
    updateElapsed: jest.fn(),
    completeSession: jest.fn(),
  }

  const mockPlannerStore = {
    tasks: [
      {
        id: 'task-1',
        title: '알고리즘 문제 풀기',
        category: '개발',
        is_done: false,
      },
    ],
  }

  const mockFocusStore = {
    absenceWarning: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(useTimerStore as unknown as jest.Mock).mockReturnValue(mockTimerStore)
    ;(usePlannerStore as unknown as jest.Mock).mockReturnValue(mockPlannerStore)
    ;(useFocusStore as unknown as jest.Mock).mockReturnValue(mockFocusStore)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render timer with correct initial time', () => {
    render(<FullScreenTimer />)

    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('알고리즘 문제 풀기')).toBeInTheDocument()
    expect(screen.getByText('개발')).toBeInTheDocument()
  })

  it('should countdown timer every second', async () => {
    render(<FullScreenTimer />)

    // Initial state
    expect(screen.getByText('25:00')).toBeInTheDocument()

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('24:59')).toBeInTheDocument()
    })

    // Advance timer by 59 more seconds
    act(() => {
      jest.advanceTimersByTime(59000)
    })

    await waitFor(() => {
      expect(screen.getByText('24:00')).toBeInTheDocument()
    })
  })

  it('should update elapsed time in store', async () => {
    render(<FullScreenTimer />)

    act(() => {
      jest.advanceTimersByTime(10000) // 10 seconds
    })

    await waitFor(() => {
      expect(mockTimerStore.updateElapsed).toHaveBeenCalledWith(10)
    })
  })

  it('should pause and resume timer', async () => {
    render(<FullScreenTimer />)

    const pauseButton = screen.getByLabelText('타이머 일시정지')

    // Pause timer
    fireEvent.click(pauseButton)

    await waitFor(() => {
      expect(screen.getByText('일시정지됨')).toBeInTheDocument()
    })

    // Timer should not advance when paused
    const timeBeforePause = screen.getByText(/\d{2}:\d{2}/).textContent

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByText(timeBeforePause!)).toBeInTheDocument()

    // Resume timer
    const resumeButton = screen.getByLabelText('타이머 재개')
    fireEvent.click(resumeButton)

    await waitFor(() => {
      expect(screen.getByText('집중중')).toBeInTheDocument()
    })

    // Timer should advance after resume
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.queryByText(timeBeforePause!)).not.toBeInTheDocument()
    })
  })

  it('should complete session when timer reaches zero', async () => {
    const mockStore = {
      ...mockTimerStore,
      currentSession: {
        ...mockTimerStore.currentSession,
        duration: 2, // 2 seconds
      },
    }
    ;(useTimerStore as unknown as jest.Mock).mockReturnValue(mockStore)

    render(<FullScreenTimer />)

    // Advance timer to completion
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(mockStore.completeSession).toHaveBeenCalled()
    })
  })

  it('should handle keyboard shortcuts', async () => {
    render(<FullScreenTimer />)

    // Space bar should pause/resume
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })

    await waitFor(() => {
      expect(screen.getByText('일시정지됨')).toBeInTheDocument()
    })

    fireEvent.keyDown(window, { key: ' ', code: 'Space' })

    await waitFor(() => {
      expect(screen.getByText('집중중')).toBeInTheDocument()
    })
  })

  it('should auto-pause when absence is detected', async () => {
    const mockStore = {
      ...mockFocusStore,
      absenceWarning: true,
    }
    ;(useFocusStore as unknown as jest.Mock).mockReturnValue(mockStore)

    render(<FullScreenTimer />)

    await waitFor(() => {
      expect(screen.getByText('일시정지됨')).toBeInTheDocument()
      expect(screen.getByText('자리 비움 감지 - 타이머 자동 일시정지')).toBeInTheDocument()
    })
  })

  it('should display task information correctly', () => {
    render(<FullScreenTimer />)

    expect(screen.getByText('알고리즘 문제 풀기')).toBeInTheDocument()
    expect(screen.getByText('개발')).toBeInTheDocument()
  })

  it('should handle quick focus session (no task)', () => {
    const mockStore = {
      ...mockTimerStore,
      currentSession: {
        ...mockTimerStore.currentSession,
        taskId: undefined,
      },
    }
    ;(useTimerStore as unknown as jest.Mock).mockReturnValue(mockStore)

    render(<FullScreenTimer />)

    expect(screen.getByText('집중 시간')).toBeInTheDocument()
  })
})
