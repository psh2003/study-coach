'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, Target, Clock, TrendingUp, Eye, Zap, BarChart, Shield, Users, Sparkles } from 'lucide-react'
import AOS from 'aos'

export default function Home() {
  const router = useRouter()
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 100,
    })

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen bg-dark-primary text-white overflow-hidden">
      {/* Custom Cursor */}
      <div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference transition-all duration-200"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white" />
      </div>

      {/* Animated Gradient Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-blue rounded-full opacity-20 blur-[120px] animate-float" />
        <div className="absolute top-1/2 -left-1/4 w-1/2 h-1/2 bg-accent-purple rounded-full opacity-15 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-1/4 right-1/3 w-1/2 h-1/2 bg-accent-pink rounded-full opacity-10 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full z-40 backdrop-blur-md bg-dark-primary/80 border-b border-white/5">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" data-aos="fade-right">
              <Brain className="w-8 h-8 text-accent-blue" />
              <span className="text-xl font-bold tracking-wider gradient-text">STUDY COACH</span>
            </div>

            <div className="flex gap-6 text-sm font-light tracking-wider" data-aos="fade-left">
              <button
                onClick={() => router.push('/auth/login')}
                className="hover:text-accent-blue transition-colors"
              >
                LOGIN
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-6 py-2 glass hover:glass-strong transition-all hover:shadow-glow-sm"
              >
                START FREE
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-8 text-center relative z-10">
          {/* Main Headline */}
          <div data-aos="fade-up" data-aos-duration="1500">
            <h1 className="text-[clamp(3rem,15vw,10rem)] font-bold leading-[0.9] mb-8 tracking-tighter">
              <span className="block gradient-text">ELEVATE</span>
              <span className="block text-white/90 italic font-light">Your Focus</span>
              <span className="block gradient-text">WITH AI</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-lg md:text-2xl font-light text-white/60 max-w-3xl mx-auto mb-12 tracking-wide"
          >
            컴퓨터 비전과 AI가 만나 당신의 학습 습관을 혁신합니다
          </p>

          {/* CTA Buttons */}
          <div
            data-aos="fade-up"
            data-aos-delay="600"
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={() => router.push('/auth/register')}
              className="group relative px-12 py-5 bg-accent-blue text-white text-sm font-semibold tracking-wider overflow-hidden shadow-glow-md hover:shadow-glow-lg transition-all"
            >
              <span className="relative z-10 flex items-center gap-3">
                GET STARTED FREE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-12 py-5 glass hover:glass-strong text-sm font-semibold tracking-wider transition-all"
            >
              LEARN MORE
            </button>
          </div>

          {/* Stats Preview */}
          <div
            data-aos="fade-up"
            data-aos-delay="900"
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: '95%', label: '집중도 향상' },
              { value: '2.5x', label: '학습 효율' },
              { value: '1000+', label: '활성 사용자' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div
            data-aos="fade"
            data-aos-delay="1200"
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-accent-blue to-transparent" />
          </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-8">
          {/* Section Title */}
          <div data-aos="fade-up" className="mb-24 text-center">
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
              CORE FEATURES
            </h2>
            <p className="text-lg font-light text-white/60 tracking-wide">
              AI 기반 스마트 학습 관리 시스템
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: 'AI VISION',
                subtitle: '실시간 모니터링',
                description: '컴퓨터 비전이 자세, 스마트폰 사용, 집중도를 실시간으로 분석합니다.',
                gradient: 'from-accent-blue to-accent-purple',
                delay: 0
              },
              {
                icon: Target,
                title: 'SMART PLANNER',
                subtitle: '직관적 스케줄링',
                description: '드래그 앤 드롭으로 학습 계획을 손쉽게 구성하고 관리하세요.',
                gradient: 'from-accent-purple to-accent-pink',
                delay: 100
              },
              {
                icon: Zap,
                title: 'FOCUS TIMER',
                subtitle: '뽀모도로 기법',
                description: '과학적으로 검증된 집중 타이머와 AI 방해 요소 감지 시스템.',
                gradient: 'from-accent-pink to-accent-orange',
                delay: 200
              },
              {
                icon: BarChart,
                title: 'ANALYTICS',
                subtitle: '심층 분석',
                description: '학습 패턴, 생산성 트렌드, 개선 영역을 상세하게 분석합니다.',
                gradient: 'from-accent-orange to-accent-blue',
                delay: 300
              },
              {
                icon: TrendingUp,
                title: 'PROGRESS',
                subtitle: '성장 추적',
                description: '시간에 따른 발전 과정을 차트와 마일스톤으로 시각화합니다.',
                gradient: 'from-accent-green to-accent-blue',
                delay: 400
              },
              {
                icon: Brain,
                title: 'AI COACH',
                subtitle: '맞춤형 가이드',
                description: '머신러닝이 최적의 학습 세션을 위한 개인화된 조언을 제공합니다.',
                gradient: 'from-accent-blue to-accent-purple',
                delay: 500
              }
            ].map((feature, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={feature.delay}
                className="group relative aspect-[4/5] glass hover:glass-strong transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div>
                    <feature.icon className="w-14 h-14 mb-6 stroke-[1.5] text-accent-blue group-hover:text-white transition-colors" />
                    <h3 className="text-3xl font-bold mb-2 tracking-tight gradient-text">{feature.title}</h3>
                    <p className="text-sm font-light text-white/50 tracking-wider uppercase mb-4">
                      {feature.subtitle}
                    </p>
                  </div>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative border-y border-white/5">
        <div className="container mx-auto px-8">
          <div data-aos="fade-up" className="mb-24 text-center">
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
              HOW IT WORKS
            </h2>
            <p className="text-lg font-light text-white/60 tracking-wide">
              3단계로 시작하는 스마트 학습
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: '계획 수립',
                description: '타임테이블에 학습 계획을 드래그로 간편하게 배치하세요. AI가 최적의 학습 시간을 추천합니다.',
                icon: Target,
                delay: 0
              },
              {
                step: '02',
                title: '집중 세션',
                description: 'AI가 웹캠으로 자세와 집중도를 실시간 모니터링하며, 방해 요소를 즉시 알려줍니다.',
                icon: Eye,
                delay: 200
              },
              {
                step: '03',
                title: '분석 & 개선',
                description: '상세한 리포트로 학습 패턴을 분석하고, 개인화된 개선 방법을 제안받으세요.',
                icon: TrendingUp,
                delay: 400
              }
            ].map((item, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={item.delay}
                className="relative glass p-10 hover:glass-strong transition-all duration-500 group"
              >
                <div className="text-8xl font-bold text-white/5 absolute top-8 right-8 group-hover:text-accent-blue/10 transition-colors">
                  {item.step}
                </div>
                <item.icon className="w-16 h-16 mb-6 text-accent-blue" />
                <h3 className="text-3xl font-bold mb-4 gradient-text">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-8">
          <div data-aos="fade-up" className="mb-24 text-center">
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
              WHY CHOOSE US
            </h2>
            <p className="text-lg font-light text-white/60 tracking-wide">
              Study Coach만의 차별화된 강점
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: '프라이버시 보장',
                description: '모든 비전 분석은 로컬에서 처리되며, 개인정보는 절대 외부로 전송되지 않습니다.',
                delay: 0
              },
              {
                icon: Sparkles,
                title: '실시간 AI 피드백',
                description: '거북목, 스마트폰 사용 등을 즉시 감지하고 부드러운 알림으로 바른 자세를 유도합니다.',
                delay: 100
              },
              {
                icon: Users,
                title: '직관적 UX',
                description: 'Lusion.co에서 영감받은 화려하고 인터랙티브한 디자인으로 즐거운 사용 경험을 제공합니다.',
                delay: 200
              },
              {
                icon: Clock,
                title: '시간 관리 최적화',
                description: '계획 대비 실제 집중 시간을 비교 분석하여, 더 정확한 시간 예측 능력을 키웁니다.',
                delay: 300
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={benefit.delay}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center group-hover:shadow-glow-md transition-all">
                    <benefit.icon className="w-8 h-8 text-accent-blue" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 gradient-text">{benefit.title}</h3>
                  <p className="text-white/70 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { value: '95%', label: '평균 집중도 향상', delay: 0 },
              { value: '2.5x', label: '학습 효율 증가', delay: 100 },
              { value: '1000+', label: '활성 사용자', delay: 200 },
              { value: '50K+', label: '누적 집중 세션', delay: 300 },
            ].map((stat, idx) => (
              <div
                key={idx}
                data-aos="zoom-in"
                data-aos-delay={stat.delay}
                className="text-center group"
              >
                <div className="text-[clamp(3rem,8vw,6rem)] font-bold leading-none mb-4 gradient-text group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <p className="text-sm font-light text-white/60 tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-blue/5 to-transparent pointer-events-none" />
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-8">
          <div data-aos="fade-up" className="mb-24 text-center">
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
              USER STORIES
            </h2>
            <p className="text-lg font-light text-white/60 tracking-wide">
              실제 사용자들의 생생한 후기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: '김민수',
                role: '수험생',
                content: 'AI가 자세를 알려줘서 허리 통증이 사라졌고, 집중 시간도 2배 늘었습니다. 정말 효과적이에요!',
                rating: 5,
                delay: 0
              },
              {
                name: '이서연',
                role: '대학생',
                content: '스마트폰을 자주 만지는 습관이 있었는데, 실시간 알림 덕분에 많이 개선됐어요. 추천합니다!',
                rating: 5,
                delay: 100
              },
              {
                name: '박준호',
                role: '재택근무자',
                content: '업무 집중도가 확실히 올라갔고, 리포트로 나를 객관적으로 볼 수 있어서 좋습니다.',
                rating: 5,
                delay: 200
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={testimonial.delay}
                className="glass p-8 hover:glass-strong transition-all duration-500 hover:scale-105"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Sparkles key={i} className="w-5 h-5 text-accent-blue fill-accent-blue" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/50">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-48 relative overflow-hidden">
        <div className="container mx-auto px-8 text-center relative z-10">
          <div data-aos="zoom-in" data-aos-duration="1500">
            <h2 className="text-[clamp(3rem,12vw,9rem)] font-bold leading-none tracking-tighter mb-12">
              <span className="block gradient-text">START YOUR</span>
              <span className="block text-white/90 italic font-light">JOURNEY TODAY</span>
            </h2>

            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              지금 바로 AI 학습 코치와 함께 목표를 달성하세요
            </p>

            <button
              onClick={() => router.push('/auth/register')}
              className="group px-16 py-6 bg-accent-blue text-white text-sm font-bold tracking-[0.3em] hover:shadow-glow-lg transition-all hover:scale-110"
            >
              <span className="flex items-center gap-4">
                GET STARTED FREE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>

            <p className="mt-6 text-sm text-white/40">
              무료로 시작하고, 언제든지 업그레이드하세요
            </p>
          </div>
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/10 via-transparent to-transparent pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-light text-white/40">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-accent-blue" />
              <span>© 2025 STUDY COACH. All rights reserved.</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-accent-blue transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-blue transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accent-blue transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
