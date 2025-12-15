'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#080808] text-white font-display">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#242447] px-10 py-3 fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-white">
          <div className="text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>auto_awesome</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Study Coach</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#features">기능</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">소개</a>
            <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">가격</a>
          </div>
          <button
            onClick={() => router.push('/auth/login?view=signup')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          >
            <span className="truncate">회원가입</span>
          </button>
        </div>
      </header>

      <main className="mt-20">
        {/* Hero Section */}
        <div className="px-4 md:px-10 py-5">
          <div className="@container">
            <div className="@[480px]:p-4">
              <div className="flex min-h-[calc(100vh-120px)] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593349480504-802c09f38e38?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-20"></div>
                <div className="flex flex-col gap-2 text-center z-10">
                  <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                    AI 기반 학습 습관으로<br />잠재력을 깨우세요.
                  </h1>
                  <h2 className="text-[#eaeaea] text-base md:text-xl font-normal leading-normal max-w-2xl mx-auto">
                    집중력을 분석하고, 학습을 최적화하여 목표를 달성하세요.
                  </h2>
                </div>
                <div className="flex-wrap gap-4 flex justify-center z-10">
                  <button
                    onClick={() => router.push('/auth/login?view=signup')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_theme(colors.primary)]"
                  >
                    <span className="truncate">무료 체험 시작하기</span>
                  </button>
                  <button
                    onClick={() => router.push('#demo')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <span className="truncate">사용법 보기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="px-4 md:px-10 py-20" id="features">
          <div className="flex flex-col gap-10 @container">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-white tracking-tighter text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
                새로운 관점에서 집중력을 확인하세요.
              </h1>
              <p className="text-[#eaeaea] text-lg font-normal leading-normal max-w-3xl mx-auto">
                AI가 학습 세션을 분석하여 집중 및 주의 산만 패턴에 대한 실질적인 인사이트를 제공하고, 학습 환경을 최적화할 수 있도록 돕습니다.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 p-0">
              <div className="flex flex-1 gap-4 rounded-xl border border-[#343465]/50 bg-[#1a1a32]/50 p-6 flex-col backdrop-blur-sm hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>visibility</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-white text-xl font-bold leading-tight">AI 컴퓨터 비전</h2>
                  <p className="text-[#9393c8] text-base font-normal leading-normal">
                    AI가 학습 세션을 분석하여 집중 및 주의 산만 패턴에 대한 인사이트를 제공하고, 개선할 부분을 파악하도록 돕습니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 gap-4 rounded-xl border border-[#343465]/50 bg-[#1a1a32]/50 p-6 flex-col backdrop-blur-sm hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>event_available</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-white text-xl font-bold leading-tight">스터디 플래너 연동</h2>
                  <p className="text-[#9393c8] text-base font-normal leading-normal">
                    AI 인사이트가 스마트 스터디 플래너와 연동되어 사용자의 고유한 학습 스타일과 목표에 맞춘 효과적인 일정을 생성합니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 gap-4 rounded-xl border border-[#343465]/50 bg-[#1a1a32]/50 p-6 flex-col backdrop-blur-sm hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>school</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-white text-xl font-bold leading-tight">열정적인 학생과 전문가를 위해</h2>
                  <p className="text-[#9393c8] text-base font-normal leading-normal">
                    대학생, 원격 근무자, 평생 학습자 등 누구에게나 Study Coach는 성공을 돕기 위해 설계되었습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="px-4 md:px-10 py-20">
          <div className="@container">
            <div className="flex flex-col justify-end gap-6 py-10 @[480px]:gap-8 @[480px]:py-20 bg-[#1a1a32]/30 rounded-xl">
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-white tracking-tighter text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
                  학습 방식을 혁신할 준비가 되셨나요?
                </h1>
              </div>
              <div className="flex flex-1 justify-center mt-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/auth/login?view=signup')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_theme(colors.primary)]"
                  >
                    <span className="truncate">지금 시작하기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-6 px-5 py-10 text-center @container border-t border-solid border-[#242447]">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 @[480px]:flex-row @[480px]:justify-around">
          <a className="text-[#9393c8] text-sm font-normal leading-normal min-w-40 hover:text-white" href="#">이용 약관</a>
          <a className="text-[#9393c8] text-sm font-normal leading-normal min-w-40 hover:text-white" href="#">개인정보 처리방침</a>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-[#9393c8] hover:text-white transition-colors" href="#">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"></path>
            </svg>
          </a>
          <a className="text-[#9393c8] hover:text-white transition-colors" href="#">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.581-.666 2.477 0 1.921.93 3.615 2.348 4.608-.86-.027-1.67-.265-2.38-.654v.052c0 2.68 1.905 4.912 4.426 5.42-.463.125-.951.192-1.455.192-.355 0-.702-.034-1.045-.098.704 2.193 2.748 3.79 5.174 3.833-1.893 1.483-4.28 2.366-6.872 2.366-.447 0-.89-.026-1.326-.077 2.449 1.57 5.357 2.48 8.49 2.48 10.183 0 15.763-8.435 15.485-15.795.955-.69 1.782-1.554 2.44-2.54z"></path>
            </svg>
          </a>
          <a className="text-[#9393c8] hover:text-white transition-colors" href="#">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path>
            </svg>
          </a>
        </div>
        <p className="text-[#9393c8] text-sm font-normal leading-normal">© 2023 Study Coach. All rights reserved.</p>
      </footer>
    </div>
  )
}
