import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DashboardPage from '../page'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { usePlannerStore } from '@/lib/store/usePlannerStore'

// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: jest.fn(),
}))

jest.mock('@/lib/store/usePlannerStore', () => ({
  usePlannerStore: jest.fn(),
}))

jest.mock('@/components/Planner/Timetable', () => {
  return function MockTimetable() {
    return <div data-testid="timetable">Timetable Component</div>
  }
})

describe('DashboardPage', () => {
  const mockPush = jest.fn()
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('Authentication States', () => {
    it('로딩 중일 때 로딩 스피너를 표시해야 함', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: null })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [] })

      const { container } = render(<DashboardPage />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('로그인하지 않은 경우 로그인 페이지로 리디렉션해야 함', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: null })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [] })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('로그인한 사용자는 대시보드를 볼 수 있어야 함', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: null })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [] })

      render(<DashboardPage />)

      expect(screen.getByText('Study Coach')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('timetable')).toBeInTheDocument()
    })
  })

  describe('Dashboard Layout', () => {
    beforeEach(() => {
      const mockUser = {
        id: 'user-1',
        email: 'john.doe@example.com',
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: null })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [] })
    })

    it('사이드바에 사용자 정보를 표시해야 함', () => {
      render(<DashboardPage />)

      expect(screen.getByText('test')).toBeInTheDocument()
      expect(screen.getByText('Premium User')).toBeInTheDocument()
    })

    it('사이드바에 네비게이션 메뉴가 있어야 함', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  describe('Current Task Display', () => {
    it('진행 중인 작업이 있을 때 현재 작업을 표시해야 함', () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockTask = {
        id: 'task-1',
        title: 'Algorithm Study',
        category: 'Computer Science',
        start_time: '09:00',
        end_time: '10:30',
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: 'task-1' })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [mockTask] })

      render(<DashboardPage />)

      expect(screen.getByText('Algorithm Study')).toBeInTheDocument()
      expect(screen.getByText('Computer Science')).toBeInTheDocument()
    })

    it('진행 중인 작업이 없을 때 현재 작업 카드를 숨겨야 함', () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signOut: mockSignOut,
      })
      ;(useFocusStore as jest.Mock).mockReturnValue({ currentTaskId: null })
      ;(usePlannerStore as jest.Mock).mockReturnValue({ tasks: [] })

      render(<DashboardPage />)

      expect(screen.queryByText('Algorithm Study')).not.toBeInTheDocument()
    })
  })
})
