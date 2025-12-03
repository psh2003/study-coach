# Study Coach - System Design Document

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Layers](#system-layers)
3. [Component Design](#component-design)
4. [Data Model](#data-model)
5. [API Design](#api-design)
6. [State Management](#state-management)
7. [AI Processing Pipeline](#ai-processing-pipeline)
8. [Security Architecture](#security-architecture)
9. [Performance Optimization](#performance-optimization)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Presentation Layer (React/Next.js)            │  │
│  │  • Pages   • Components   • UI Library (Tailwind)    │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         State Management (Zustand)                    │  │
│  │  • Auth Store   • Focus Store   • Planner Store      │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Business Logic Layer                          │  │
│  │  • Custom Hooks   • Service Functions   • Utilities  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         AI Processing Layer                           │  │
│  │  • Pose Detection   • Object Detection   • WebRTC    │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Data Access Layer                             │  │
│  │  • Supabase Client   • API Repositories              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  • Authentication (Supabase Auth)                            │
│  • PostgreSQL Database                                       │
│  • Row Level Security (RLS)                                  │
│  • Real-time Subscriptions (optional)                        │
│  • Edge Functions (future)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 14 (App Router) | Server-side rendering, routing |
| Language | TypeScript | Type safety, developer experience |
| UI Library | Tailwind CSS | Styling, responsive design |
| State Management | Zustand | Lightweight global state |
| Backend | Supabase | Auth, database, real-time |
| Database | PostgreSQL | Relational data storage |
| AI/ML | TensorFlow.js | Pose & object detection |
| Charts | Recharts | Data visualization |

---

## System Layers

### 1. Presentation Layer

**Responsibilities:**
- Render UI components
- Handle user interactions
- Display data from state
- Client-side routing

**Key Components:**
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/         # Main application
├── report/           # Statistics & analytics
├── settings/         # User preferences
└── layout.tsx        # App shell

components/
├── Planner/
│   ├── Timetable.tsx
│   └── TaskModal.tsx
├── Focus/
│   ├── WebcamMonitor.tsx
│   └── PomodoroTimer.tsx
└── Reports/
    ├── DateRangeSelector.tsx
    ├── StatisticsCards.tsx
    └── Charts/
```

### 2. State Management Layer

**Store Architecture:**

```typescript
// Auth Store
interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

// Focus Store
interface FocusState {
  isSessionActive: boolean
  currentTaskId: string | null
  sessionStartTime: Date | null
  distractions: Distraction[]
  // ... AI warning states
  // ... Actions
}

// Planner Store
interface PlannerState {
  selectedDate: Date
  tasks: Task[]
  isLoading: boolean
  // ... CRUD actions
}
```

### 3. Business Logic Layer

**Service Functions:**

```typescript
// lib/services/taskService.ts
export const taskService = {
  createTask: async (task: TaskInput) => Promise<Task>
  getTasks: async (date: Date) => Promise<Task[]>
  updateTask: async (id: string, updates) => Promise<Task>
  deleteTask: async (id: string) => Promise<void>
}

// lib/services/focusService.ts
export const focusService = {
  createSession: async (session: SessionInput) => Promise<FocusSession>
  getSessions: async (dateRange: DateRange) => Promise<FocusSession[]>
  updateActualTime: async (taskId: string, duration: number) => Promise<void>
}

// lib/services/statsService.ts
export const statsService = {
  getDailyStats: async (date: Date) => Promise<DailyStats>
  getWeeklyStats: async (startDate: Date) => Promise<WeeklyStats>
  getDistractionBreakdown: async (range: DateRange) => Promise<DistractionStats>
}
```

### 4. AI Processing Layer

**Pipeline Architecture:**

```
WebcamStream → Frame Capture → AI Models → Analysis → State Update → UI Feedback
     │              │               │           │           │            │
  getUserMedia   Canvas API    TensorFlow.js  Business   Zustand    React Render
                                              Logic
```

**Detection Flow:**

1. **Initialization Phase**:
   - Load MediaPipe Pose model
   - Load COCO-SSD object detection model
   - Request webcam permissions

2. **Processing Loop** (30 FPS):
   ```
   for each frame:
     1. Capture frame from video element
     2. Run pose detection → analyze posture
     3. Run object detection → check for phone
     4. Apply threshold timers (10s, 5s, 15s)
     5. Update warning states
     6. Record distractions
   ```

3. **Optimization**:
   - Use `requestAnimationFrame` for smooth loop
   - Skip processing if tab not active
   - Throttle certain checks to reduce CPU

---

## Component Design

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                             │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Timetable    │  │   Webcam    │  │  Pomodoro Timer │ │
│  │                │  │   Monitor   │  │                 │ │
│  │  [Task Blocks] │  │             │  │   [25:00]       │ │
│  │                │  │  [AI State] │  │   [Start/Pause] │ │
│  │  [Start Focus] ├──┼─────────────┼──►   [Stop]       │ │
│  └────────┬───────┘  └──────┬──────┘  └────────┬────────┘ │
│           │                 │                    │          │
└───────────┼─────────────────┼────────────────────┼──────────┘
            │                 │                    │
            ▼                 ▼                    ▼
    ┌───────────────┐  ┌───────────────┐  ┌──────────────┐
    │ Planner Store │  │  Focus Store  │  │  Supabase    │
    │               │  │               │  │              │
    │ • tasks[]     │  │ • warnings    │  │ • tasks      │
    │ • selectedDate│  │ • distractions│  │ • sessions   │
    └───────────────┘  └───────────────┘  └──────────────┘
```

### Data Flow

**Creating a Task:**
```
User Action → TaskModal → validateInput() → taskService.createTask()
                ↓
          Supabase INSERT
                ↓
          Update Planner Store → Re-render Timetable
```

**Starting Focus Session:**
```
User clicks "Start Focus" → Pass taskId to Timer → Timer starts
                ↓
          Update Focus Store (isSessionActive = true)
                ↓
          Webcam activates → AI processing begins
                ↓
          Record distractions in real-time
```

**Completing Session:**
```
Timer ends → Collect session data → focusService.createSession()
                ↓
          Supabase INSERT (focus_sessions)
                ↓
          Call update_actual_time() function
                ↓
          Reset Focus Store → Update task in Planner Store
```

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
│─────────────────│
│ • id (UUID) PK  │
│ • email         │
│ • created_at    │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────────────┐      N ┌────────────────────────┐
│       tasks             ├────────►   focus_sessions       │
│─────────────────────────│   1    │────────────────────────│
│ • id (UUID) PK          │        │ • id (UUID) PK         │
│ • user_id (UUID) FK     │        │ • user_id (UUID) FK    │
│ • title                 │        │ • task_id (UUID) FK    │
│ • category              │        │ • start_time           │
│ • est_time (minutes)    │        │ • end_time             │
│ • actual_time (minutes) │        │ • duration (minutes)   │
│ • task_date             │        │ • distractions (JSONB) │
│ • is_done               │        │ • created_at           │
│ • start_time (TIME)     │        └────────────────────────┘
│ • end_time (TIME)       │
│ • created_at            │
└─────────────────────────┘
```

### Data Types

**Task:**
```typescript
interface Task {
  id: string
  user_id: string
  title: string
  category: string | null
  est_time: number // minutes
  actual_time: number // minutes
  task_date: string // YYYY-MM-DD
  is_done: boolean
  start_time: string | null // HH:MM
  end_time: string | null // HH:MM
  created_at: string
}
```

**Focus Session:**
```typescript
interface FocusSession {
  id: string
  user_id: string
  task_id: string
  start_time: string // ISO timestamp
  end_time: string // ISO timestamp
  duration: number // minutes
  distractions: Distraction[]
  created_at: string
}

interface Distraction {
  type: 'posture' | 'phone' | 'absence'
  timestamp: string
  duration?: number
}
```

---

## API Design

### Repository Pattern

```typescript
// lib/repositories/taskRepository.ts
export const taskRepository = {
  async create(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByDate(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('task_date', dateStr)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
```

### Custom Hooks

```typescript
// lib/hooks/useTasks.ts
export function useTasks(date: Date) {
  const { tasks, setTasks, setLoading } = usePlannerStore()

  useEffect(() => {
    loadTasks()
  }, [date])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await taskRepository.getByDate(date)
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (task: TaskInput) => {
    const newTask = await taskRepository.create(task)
    usePlannerStore.getState().addTask(newTask)
    return newTask
  }

  return { tasks, createTask, loadTasks }
}
```

---

## State Management

### Store Structure

```typescript
// Centralized state with Zustand
const stores = {
  auth: useAuthStore,      // User authentication state
  focus: useFocusStore,    // Focus session state
  planner: usePlannerStore // Task planning state
}

// Store composition pattern
const useAppState = () => ({
  auth: useAuthStore(),
  focus: useFocusStore(),
  planner: usePlannerStore()
})
```

### State Synchronization

```typescript
// Sync planner with database
useEffect(() => {
  const subscription = supabase
    .channel('tasks_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks'
    }, (payload) => {
      // Update store based on change
      handleDatabaseChange(payload)
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

---

## AI Processing Pipeline

### Performance Optimization

**Frame Skip Strategy:**
```typescript
let frameCount = 0
const PROCESS_EVERY_N_FRAMES = 2 // Process every 2nd frame

const processFrame = async () => {
  frameCount++

  if (frameCount % PROCESS_EVERY_N_FRAMES !== 0) {
    requestAnimationFrame(processFrame)
    return
  }

  // AI processing here...
  const pose = await poseProcessor.detectPose(video)
  const objects = await objectDetector.detectObjects(video)

  requestAnimationFrame(processFrame)
}
```

**Threshold Management:**
```typescript
// Prevent spam warnings
const ThresholdManager = {
  posture: { duration: 10000, timer: null },
  phone: { duration: 5000, timer: null },
  absence: { duration: 15000, timer: null },

  start(type: 'posture' | 'phone' | 'absence', callback: () => void) {
    if (this[type].timer) return
    this[type].timer = setTimeout(callback, this[type].duration)
  },

  clear(type: 'posture' | 'phone' | 'absence') {
    if (this[type].timer) {
      clearTimeout(this[type].timer)
      this[type].timer = null
    }
  }
}
```

---

## Security Architecture

### Row Level Security (RLS)

**Principle**: Users can only access their own data.

```sql
-- Example policy
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);
```

### Client-Side Validation

```typescript
const validateTask = (task: TaskInput): ValidationResult => {
  const errors: string[] = []

  if (!task.title || task.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (task.est_time <= 0) {
    errors.push('Estimated time must be positive')
  }

  if (task.start_time && task.end_time) {
    const start = parseTime(task.start_time)
    const end = parseTime(task.end_time)
    if (end <= start) {
      errors.push('End time must be after start time')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Webcam Security

- Only request permissions when needed
- Show clear indicators when camera is active
- User can disable at any time
- No video recording or storage
- Processing happens entirely client-side

---

## Performance Optimization

### Database Optimization

**Indexes:**
```sql
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_task_date_idx ON tasks(task_date);
CREATE INDEX focus_sessions_user_id_idx ON focus_sessions(user_id);
```

**Query Optimization:**
- Use `.select()` to fetch only needed columns
- Implement pagination for large result sets
- Cache frequently accessed data
- Use `.single()` when expecting one result

### Frontend Optimization

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
const ReportsPage = dynamic(() => import('./reports/page'), {
  loading: () => <LoadingSkeleton />
})
```

**Memoization:**
```typescript
const MemoizedChart = React.memo(({ data }) => {
  return <LineChart data={data} />
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data
})
```

**Virtual Scrolling:**
For large lists of tasks or sessions, implement virtual scrolling to render only visible items.

---

## Implementation Roadmap

### Phase 1: Core Data Integration (Week 1-2)
**Priority**: Critical

- [ ] Implement task CRUD operations
  - [ ] Create taskRepository
  - [ ] Implement useTasks hook
  - [ ] Connect Timetable to Supabase
  - [ ] Add TaskModal form submission

- [ ] Focus session persistence
  - [ ] Create focusRepository
  - [ ] Save sessions on timer completion
  - [ ] Update actual_time via RPC function
  - [ ] Add error handling

- [ ] Planner-Timer integration
  - [ ] Pass task context to timer
  - [ ] Display current task in timer
  - [ ] Link session back to task

### Phase 2: Statistics & Analytics (Week 3-4)
**Priority**: High

- [ ] Statistics queries
  - [ ] Implement aggregation queries
  - [ ] Create statsRepository
  - [ ] Build useStats hook

- [ ] Report components
  - [ ] DateRangeSelector component
  - [ ] StatisticsCards (total time, avg focus, etc.)
  - [ ] FocusTimeChart (daily/weekly/monthly)
  - [ ] CategoryBreakdown pie chart
  - [ ] DistractionAnalysis bar chart

- [ ] Report page
  - [ ] Create /report route
  - [ ] Implement data fetching
  - [ ] Add export to CSV/PDF

### Phase 3: UX Enhancements (Week 5-6)
**Priority**: Medium

- [ ] Loading states
  - [ ] Skeleton loaders for all components
  - [ ] Loading spinners for async operations
  - [ ] Progress indicators

- [ ] Error handling
  - [ ] Error boundaries
  - [ ] Toast notifications (success/error)
  - [ ] Retry mechanisms
  - [ ] Offline detection

- [ ] Optimistic UI updates
  - [ ] Instant feedback on actions
  - [ ] Rollback on error
  - [ ] Optimistic mutations

### Phase 4: Polish & Advanced Features (Week 7-8)
**Priority**: Low

- [ ] Settings page
  - [ ] User profile management
  - [ ] Notification preferences
  - [ ] Theme customization
  - [ ] Data export

- [ ] Advanced features
  - [ ] Recurring tasks
  - [ ] Task templates
  - [ ] Goal tracking
  - [ ] Achievements/badges

- [ ] Mobile optimization
  - [ ] Responsive improvements
  - [ ] Touch gestures
  - [ ] PWA capabilities

---

## Design Patterns Summary

### Architectural Patterns
- **Layered Architecture**: Separation of concerns
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: State change notifications

### Component Patterns
- **Container/Presenter**: Smart vs. dumb components
- **Custom Hooks**: Reusable logic extraction
- **Compound Components**: Flexible component composition

### State Patterns
- **Single Source of Truth**: Zustand stores
- **Derived State**: Computed values from base state
- **Async State**: Loading, success, error states

### Performance Patterns
- **Code Splitting**: Dynamic imports
- **Memoization**: React.memo, useMemo, useCallback
- **Lazy Loading**: Deferred component rendering
- **Virtual Scrolling**: Efficient large list rendering

---

## Next Steps

1. **Immediate Actions**:
   - Implement taskRepository
   - Create useTasks hook
   - Connect Timetable component

2. **Testing Strategy**:
   - Unit tests for repositories
   - Integration tests for hooks
   - E2E tests for critical flows

3. **Documentation**:
   - API documentation
   - Component storybook
   - Developer onboarding guide

4. **Deployment**:
   - Vercel deployment
   - Environment configuration
   - Monitoring setup
