# Study Coach - AI-Powered Study Management Platform

AI 컴퓨터 비전 기술을 활용하여 사용자의 학습 및 업무 습관을 실시간으로 분석하고 개선을 유도하는 스마트 학습 관리 플랫폼입니다.

## 주요 기능

### 1. 사용자 인증 (GNB-100)
- 이메일/비밀번호 기반 회원가입 및 로그인
- Supabase Auth를 활용한 안전한 인증
- 세션 유지 및 자동 로그인

### 2. 타임테이블 기반 스터디 플래너 (PLN-200)
- **시간대별 타임테이블**: 오전 6시부터 익일 오전 2시까지 30분 단위 시간표
- **드래그 앤 드롭**: 마우스 드래그로 학습 블록 생성
- **블록 편집**: 시간 조정, 내용 수정, 삭제 기능
- **과목별 색상**: 카테고리별로 구분된 시각적 블록
- **집중 세션 연동**: 각 블록에서 바로 집중 모드 시작

### 3. AI 집중 세션 (FCS-300)
- **실시간 웹캠 모니터링**: MediaPipe를 활용한 자세 분석
- **자세 교정**: 거북목 자세 10초 이상 감지 시 알림
- **스마트폰 감지**: 휴대폰 5초 이상 감지 시 경고
- **자리 비움 감지**: 15초 이상 인식 불가 시 타이머 자동 일시정지
- **뽀모도로 타이머**: 25분 집중 + 5분 휴식 사이클
- **방해 요소 기록**: 모든 방해 이벤트를 타임스탬프와 함께 저장

### 4. 학습 통계 및 리포트 (RPT-400)
- 기간별(일별/주별/월별) 통계 조회
- 총 집중 시간 시각화
- 계획 대비 실제 성취도 분석
- 방해 요인 분포 분석
- 과목별 집중도 비교

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **BaaS**: Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase Auto-generated APIs

### AI/ML
- **Pose Detection**: TensorFlow.js + MediaPipe Pose
- **Object Detection**: TensorFlow.js + COCO-SSD
- **Framework**: @tensorflow-models/pose-detection, @tensorflow-models/coco-ssd

### Utilities
- **Date Handling**: date-fns
- **Charts**: Recharts (for statistics)

## 시작하기

### 1. 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `lib/supabase/schema.sql` 파일의 내용 실행
3. 프로젝트 URL과 anon key 복사

### 3. 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 Supabase 정보 입력:

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 프로젝트 구조

```
study-coach/
├── app/                          # Next.js App Router
│   ├── auth/                     # 인증 페이지
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # 메인 대시보드
│   ├── report/                   # 통계 리포트
│   ├── settings/                 # 설정
│   ├── layout.tsx
│   ├── page.tsx                  # 랜딩 페이지
│   └── globals.css
│
├── components/                   # React 컴포넌트
│   ├── Planner/                  # 플래너 관련
│   │   ├── Timetable.tsx
│   │   └── TaskModal.tsx
│   └── Focus/                    # 집중 세션 관련
│       ├── WebcamMonitor.tsx
│       └── PomodoroTimer.tsx
│
├── lib/                          # 유틸리티 및 로직
│   ├── ai/                       # AI 모듈
│   │   ├── useWebcam.ts          # 웹캠 Hook
│   │   ├── poseProcessor.ts      # 자세 분석
│   │   └── objectDetector.ts     # 객체 탐지
│   ├── store/                    # Zustand 스토어
│   │   ├── useAuthStore.ts
│   │   ├── useFocusStore.ts
│   │   └── usePlannerStore.ts
│   ├── supabase/                 # Supabase 설정
│   │   ├── client.ts
│   │   ├── database.types.ts
│   │   └── schema.sql
│   └── hooks/                    # Custom Hooks
│       └── useAuth.ts
│
├── public/                       # 정적 파일
├── .env.example                  # 환경 변수 예시
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json
```

## 데이터베이스 스키마

### tasks 테이블
학습 계획을 저장하는 테이블

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `title`: VARCHAR(255) - 할 일 이름
- `category`: VARCHAR(100) - 과목/카테고리
- `est_time`: INT - 예상 소요 시간(분)
- `actual_time`: INT - 실제 집중 시간(분)
- `task_date`: DATE - 날짜
- `is_done`: BOOLEAN - 완료 여부
- `start_time`: TIME - 시작 시간
- `end_time`: TIME - 종료 시간
- `created_at`: TIMESTAMPTZ

### focus_sessions 테이블
집중 세션 기록을 저장하는 테이블

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `task_id`: UUID (Foreign Key → tasks)
- `start_time`: TIMESTAMPTZ - 시작 시간
- `end_time`: TIMESTAMPTZ - 종료 시간
- `duration`: INT - 집중 시간(분)
- `distractions`: JSONB - 방해 요소 기록
- `created_at`: TIMESTAMPTZ

## AI 모델 상세

### 자세 분석 (Pose Detection)
- **모델**: MediaPipe Pose (MoveNet Lightning)
- **기능**:
  - 17개 키포인트 실시간 추적
  - 거북목 자세 감지 (목-어깨 각도 분석)
  - 사용자 부재 감지
- **성능**: ~30 FPS on modern hardware

### 객체 탐지 (Object Detection)
- **모델**: COCO-SSD
- **기능**:
  - 80개 클래스 객체 인식
  - 스마트폰 감지 (cell phone class)
  - 실시간 바운딩 박스
- **성능**: ~20 FPS on modern hardware

## 브라우저 호환성

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**참고**: 웹캠 기능을 위해 HTTPS 또는 localhost 환경 필요

## 라이선스

MIT License

## 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

## 문의

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 연락해주세요.
