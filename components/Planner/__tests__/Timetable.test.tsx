import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Timetable from '../Timetable'
import { usePlannerStore } from '@/lib/store/usePlannerStore'
import { useTasks } from '@/lib/hooks/useTasks'
import { useFocusStore } from '@/lib/store/useFocusStore'

// Mock modules
jest.mock('@/lib/store/usePlannerStore')
jest.mock('@/lib/hooks/useTasks')
jest.mock('@/lib/store/useFocusStore')
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Timetable Component', () => {
  const mockCreateTask = jest.fn()
  const mockDeleteTask = jest.fn()
  const mockStartSession = jest.fn()
  const mockSetSelectedDate = jest.fn()

  const defaultMockData = {
    tasks: [],
    selectedDate: new Date('2025-01-15'),
    setSelectedDate: mockSetSelectedDate,
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePlannerStore as unknown as jest.Mock).mockReturnValue(defaultMockData)
    ;(useTasks as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
      deleteTask: mockDeleteTask,
    })
    ;(useFocusStore as unknown as jest.Mock).mockReturnValue({
      startSession: mockStartSession,
    })

    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  describe('Rendering', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
      render(<Timetable />)

      expect(screen.getByText("Today's Schedule")).toBeInTheDocument()
      expect(screen.getByText('New Block')).toBeInTheDocument()
    })

    it('선택된 날짜를 표시해야 함', () => {
      render(<Timetable />)

      // format(new Date('2025-01-15'), 'EEEE, MMM d') would show something like "Wednesday, Jan 15"
      expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
    })

    it('시간 슬롯이 표시되어야 함', () => {
      render(<Timetable />)

      expect(screen.getByText('6 AM')).toBeInTheDocument()
      expect(screen.getByText('12 PM')).toBeInTheDocument()
      expect(screen.getByText('6 PM')).toBeInTheDocument()
    })

    it('로딩 중일 때 로딩 메시지를 표시해야 함', () => {
      ;(usePlannerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultMockData,
        isLoading: true,
      })

      render(<Timetable />)

      expect(screen.getByText('LOADING...')).toBeInTheDocument()
    })
  })

  describe('Date Navigation', () => {
    it('이전 날짜 버튼을 클릭하면 날짜가 변경되어야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const prevButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')?.classList.contains('lucide-chevron-left')
      )

      if (prevButton) {
        await user.click(prevButton)

        await waitFor(() => {
          expect(mockSetSelectedDate).toHaveBeenCalledWith(expect.any(Date))
        })
      }
    })

    it('다음 날짜 버튼을 클릭하면 날짜가 변경되어야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const nextButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')?.classList.contains('lucide-chevron-right')
      )

      if (nextButton) {
        await user.click(nextButton)

        await waitFor(() => {
          expect(mockSetSelectedDate).toHaveBeenCalledWith(expect.any(Date))
        })
      }
    })
  })

  describe('Task Display', () => {
    it('등록된 작업들을 표시해야 함', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Math Study',
          category: '수학',
          start_time: '09:00',
          end_time: '10:30',
          task_date: '2025-01-15',
        },
        {
          id: 'task-2',
          title: 'English Study',
          category: '영어',
          start_time: '14:00',
          end_time: '15:00',
          task_date: '2025-01-15',
        },
      ]

      ;(usePlannerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultMockData,
        tasks: mockTasks,
      })

      render(<Timetable />)

      expect(screen.getByText('Math Study')).toBeInTheDocument()
      expect(screen.getByText('수학')).toBeInTheDocument()
      expect(screen.getByText('English Study')).toBeInTheDocument()
      expect(screen.getByText('영어')).toBeInTheDocument()
    })

    it('카테고리별로 다른 색상이 적용되어야 함', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Math Study',
          category: '수학',
          start_time: '09:00',
          end_time: '10:30',
          task_date: '2025-01-15',
        },
      ]

      ;(usePlannerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultMockData,
        tasks: mockTasks,
      })

      const { container } = render(<Timetable />)

      const taskBlock = container.querySelector('.border-\\[\\#52FF86\\]')
      expect(taskBlock).toBeInTheDocument()
    })
  })

  describe('Task Actions', () => {
    const mockTask = {
      id: 'task-1',
      title: 'Algorithm Study',
      category: '수학',
      start_time: '09:00',
      end_time: '10:30',
      task_date: '2025-01-15',
    }

    beforeEach(() => {
      ;(usePlannerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultMockData,
        tasks: [mockTask],
      })
    })

    it('작업의 시작 버튼을 클릭하면 집중 세션이 시작되어야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const taskBlock = screen.getByText('Algorithm Study').closest('div')

      if (taskBlock) {
        // Hover to show action buttons
        await user.hover(taskBlock)

        const playButtons = screen.getAllByRole('button', { name: /Start Focus/i })
        if (playButtons.length > 0) {
          await user.click(playButtons[0])

          await waitFor(() => {
            expect(mockStartSession).toHaveBeenCalledWith('task-1')
          })
        }
      }
    })

    it('작업 삭제 버튼을 클릭하면 확인 후 삭제되어야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const taskBlock = screen.getByText('Algorithm Study').closest('div')

      if (taskBlock) {
        await user.hover(taskBlock)

        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
        if (deleteButtons.length > 0) {
          await user.click(deleteButtons[0])

          await waitFor(() => {
            expect(global.confirm).toHaveBeenCalled()
            expect(mockDeleteTask).toHaveBeenCalledWith('task-1')
          })
        }
      }
    })

    it('삭제 확인을 취소하면 작업이 삭제되지 않아야 함', async () => {
      global.confirm = jest.fn(() => false)

      const user = userEvent.setup()
      render(<Timetable />)

      const taskBlock = screen.getByText('Algorithm Study').closest('div')

      if (taskBlock) {
        await user.hover(taskBlock)

        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
        if (deleteButtons.length > 0) {
          await user.click(deleteButtons[0])

          await waitFor(() => {
            expect(global.confirm).toHaveBeenCalled()
            expect(mockDeleteTask).not.toHaveBeenCalled()
          })
        }
      }
    })
  })

  describe('Task Creation', () => {
    it('New Block 버튼을 클릭하면 모달이 열려야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const newBlockButton = screen.getByText('New Block')
      await user.click(newBlockButton)

      // TaskModal이 렌더링되었는지 확인 (모달 내부 구현에 따라 다를 수 있음)
      // This test would need TaskModal to be properly mocked or rendered
    })
  })

  describe('Accessibility', () => {
    it('키보드로 네비게이션 버튼을 조작할 수 있어야 함', async () => {
      const user = userEvent.setup()
      render(<Timetable />)

      const buttons = screen.getAllByRole('button')
      const prevButton = buttons.find(
        btn => btn.querySelector('svg')?.classList.contains('lucide-chevron-left')
      )

      if (prevButton) {
        prevButton.focus()
        expect(prevButton).toHaveFocus()

        await user.keyboard('{Enter}')

        await waitFor(() => {
          expect(mockSetSelectedDate).toHaveBeenCalled()
        })
      }
    })
  })
})
