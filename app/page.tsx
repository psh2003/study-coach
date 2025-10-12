'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Brain, ArrowRight, Target, Clock, TrendingUp, Eye, Zap, BarChart, Shield, Users, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative bg-dark-primary text-white">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white" />
      </motion.div>

      {/* Animated Gradient Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-blue rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-1/2 -left-1/4 w-1/2 h-1/2 bg-accent-purple rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute -bottom-1/4 right-1/3 w-1/2 h-1/2 bg-accent-pink rounded-full blur-[120px]"
        />
      </div>

      {/* Fixed Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 w-full z-40 backdrop-blur-md bg-dark-primary/80 border-b border-white/5"
      >
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Brain className="w-8 h-8 text-accent-blue" />
              <span className="text-xl font-bold tracking-wider gradient-text">STUDY COACH</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-6 text-sm font-light tracking-wider"
            >
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
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent-blue origin-left z-50"
        style={{ scaleX: smoothProgress }}
      />

      {/* Hero Section - Full Screen with Scroll Snap */}
      <HeroSection router={router} smoothProgress={smoothProgress} />

      {/* Features Section */}
      <FeaturesSection smoothProgress={smoothProgress} />

      {/* How It Works Section */}
      <HowItWorksSection smoothProgress={smoothProgress} />

      {/* Benefits Section */}
      <BenefitsSection smoothProgress={smoothProgress} />

      {/* Stats Section */}
      <StatsSection smoothProgress={smoothProgress} />

      {/* Testimonials Section */}
      <TestimonialsSection smoothProgress={smoothProgress} />

      {/* Final CTA Section */}
      <CTASection router={router} smoothProgress={smoothProgress} />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-dark-primary">
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

// Hero Section Component
function HeroSection({ router, smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0, 0.12], [1, 0])
  const y = useTransform(smoothProgress, [0, 0.12], [0, -100])
  const scale = useTransform(smoothProgress, [0, 0.12], [1, 0.8])

  return (
    <motion.section
      style={{ opacity, y, scale }}
      className="relative min-h-screen flex items-center justify-center snap-start"
    >
      <div className="container mx-auto px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-[clamp(3rem,15vw,10rem)] font-bold leading-[0.9] mb-8 tracking-tighter">
            <span className="block gradient-text">ELEVATE</span>
            <span className="block text-white/90 italic font-light">Your Focus</span>
            <span className="block gradient-text">WITH AI</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-2xl font-light text-white/60 max-w-3xl mx-auto mb-12 tracking-wide"
        >
          컴퓨터 비전과 AI가 만나 당신의 학습 습관을 혁신합니다
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth/register')}
            className="group relative px-12 py-5 bg-accent-blue text-white text-sm font-semibold tracking-wider overflow-hidden shadow-glow-md hover:shadow-glow-lg transition-all"
          >
            <span className="relative z-10 flex items-center gap-3">
              GET STARTED FREE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-12 py-5 glass hover:glass-strong text-sm font-semibold tracking-wider transition-all"
          >
            LEARN MORE
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-transparent via-accent-blue to-transparent"
          />
        </motion.div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>
    </motion.section>
  )
}

// Features Section Component
function FeaturesSection({ smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.1, 0.15, 0.3, 0.35], [0, 1, 1, 0])
  const scale = useTransform(smoothProgress, [0.1, 0.15, 0.3, 0.35], [0.8, 1, 1, 0.8])
  const y = useTransform(smoothProgress, [0.1, 0.15], [100, 0])

  const features = [
    {
      icon: Eye,
      title: 'AI VISION',
      subtitle: '실시간 모니터링',
      description: '컴퓨터 비전이 자세, 스마트폰 사용, 집중도를 실시간으로 분석합니다.',
      gradient: 'from-accent-blue to-accent-purple',
    },
    {
      icon: Target,
      title: 'SMART PLANNER',
      subtitle: '직관적 스케줄링',
      description: '드래그 앤 드롭으로 학습 계획을 손쉽게 구성하고 관리하세요.',
      gradient: 'from-accent-purple to-accent-pink',
    },
    {
      icon: Zap,
      title: 'FOCUS TIMER',
      subtitle: '뽀모도로 기법',
      description: '과학적으로 검증된 집중 타이머와 AI 방해 요소 감지 시스템.',
      gradient: 'from-accent-pink to-accent-orange',
    },
    {
      icon: BarChart,
      title: 'ANALYTICS',
      subtitle: '심층 분석',
      description: '학습 패턴, 생산성 트렌드, 개선 영역을 상세하게 분석합니다.',
      gradient: 'from-accent-orange to-accent-blue',
    },
    {
      icon: TrendingUp,
      title: 'PROGRESS',
      subtitle: '성장 추적',
      description: '시간에 따른 발전 과정을 차트와 마일스톤으로 시각화합니다.',
      gradient: 'from-accent-green to-accent-blue',
    },
    {
      icon: Brain,
      title: 'AI COACH',
      subtitle: '맞춤형 가이드',
      description: '머신러닝이 최적의 학습 세션을 위한 개인화된 조언을 제공합니다.',
      gradient: 'from-accent-blue to-accent-purple',
    }
  ]

  return (
    <motion.section
      id="features"
      style={{ opacity, scale }}
      className="relative min-h-screen py-32 snap-start flex items-center"
    >
      <div className="container mx-auto px-8">
        <motion.div style={{ y }} className="mb-24 text-center">
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
            CORE FEATURES
          </h2>
          <p className="text-lg font-light text-white/60 tracking-wide">
            AI 기반 스마트 학습 관리 시스템
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative aspect-[4/5] glass hover:glass-strong transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

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

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// How It Works Section Component
function HowItWorksSection({ smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.32, 0.38, 0.5, 0.55], [0, 1, 1, 0])
  const scale = useTransform(smoothProgress, [0.32, 0.38], [0.9, 1])

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative min-h-screen py-32 snap-start border-y border-white/5 flex items-center"
    >
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
            HOW IT WORKS
          </h2>
          <p className="text-lg font-light text-white/60 tracking-wide">
            3단계로 시작하는 스마트 학습
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: '계획 수립',
              description: '타임테이블에 학습 계획을 드래그로 간편하게 배치하세요. AI가 최적의 학습 시간을 추천합니다.',
              icon: Target,
            },
            {
              step: '02',
              title: '집중 세션',
              description: 'AI가 웹캠으로 자세와 집중도를 실시간 모니터링하며, 방해 요소를 즉시 알려줍니다.',
              icon: Eye,
            },
            {
              step: '03',
              title: '분석 & 개선',
              description: '상세한 리포트로 학습 패턴을 분석하고, 개인화된 개선 방법을 제안받으세요.',
              icon: TrendingUp,
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative glass p-10 hover:glass-strong transition-all duration-500 group"
            >
              <div className="text-8xl font-bold text-white/5 absolute top-8 right-8 group-hover:text-accent-blue/10 transition-colors">
                {item.step}
              </div>
              <item.icon className="w-16 h-16 mb-6 text-accent-blue" />
              <h3 className="text-3xl font-bold mb-4 gradient-text">{item.title}</h3>
              <p className="text-white/70 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// Benefits Section Component
function BenefitsSection({ smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.52, 0.58, 0.68, 0.72], [0, 1, 1, 0])

  return (
    <motion.section
      style={{ opacity }}
      className="relative min-h-screen py-32 snap-start flex items-center"
    >
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
            WHY CHOOSE US
          </h2>
          <p className="text-lg font-light text-white/60 tracking-wide">
            Study Coach만의 차별화된 강점
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {[
            {
              icon: Shield,
              title: '프라이버시 보장',
              description: '모든 비전 분석은 로컬에서 처리되며, 개인정보는 절대 외부로 전송되지 않습니다.',
            },
            {
              icon: Sparkles,
              title: '실시간 AI 피드백',
              description: '거북목, 스마트폰 사용 등을 즉시 감지하고 부드러운 알림으로 바른 자세를 유도합니다.',
            },
            {
              icon: Users,
              title: '직관적 UX',
              description: 'Lusion.co에서 영감받은 화려하고 인터랙티브한 디자인으로 즐거운 사용 경험을 제공합니다.',
            },
            {
              icon: Clock,
              title: '시간 관리 최적화',
              description: '계획 대비 실제 집중 시간을 비교 분석하여, 더 정확한 시간 예측 능력을 키웁니다.',
            }
          ].map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6 group"
            >
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full glass-strong flex items-center justify-center group-hover:shadow-glow-md transition-all"
                >
                  <benefit.icon className="w-8 h-8 text-accent-blue" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 gradient-text">{benefit.title}</h3>
                <p className="text-white/70 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// Stats Section Component
function StatsSection({ smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.68, 0.72, 0.8, 0.84], [0, 1, 1, 0])
  const scale = useTransform(smoothProgress, [0.68, 0.72], [0.8, 1])

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative min-h-screen py-32 snap-start border-y border-white/5 flex items-center overflow-hidden"
    >
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {[
            { value: '95%', label: '평균 집중도 향상' },
            { value: '2.5x', label: '학습 효율 증가' },
            { value: '1000+', label: '활성 사용자' },
            { value: '50K+', label: '누적 집중 세션' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              className="text-center group"
            >
              <div className="text-[clamp(3rem,8vw,6rem)] font-bold leading-none mb-4 gradient-text transition-transform">
                {stat.value}
              </div>
              <p className="text-sm font-light text-white/60 tracking-wider uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-blue/5 to-transparent pointer-events-none" />
    </motion.section>
  )
}

// Testimonials Section Component
function TestimonialsSection({ smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.8, 0.84, 0.92, 0.96], [0, 1, 1, 0])

  return (
    <motion.section
      style={{ opacity }}
      className="relative min-h-screen py-32 snap-start flex items-center"
    >
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6 gradient-text">
            USER STORIES
          </h2>
          <p className="text-lg font-light text-white/60 tracking-wide">
            실제 사용자들의 생생한 후기
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: '김민수',
              role: '수험생',
              content: 'AI가 자세를 알려줘서 허리 통증이 사라졌고, 집중 시간도 2배 늘었습니다. 정말 효과적이에요!',
              rating: 5,
            },
            {
              name: '이서연',
              role: '대학생',
              content: '스마트폰을 자주 만지는 습관이 있었는데, 실시간 알림 덕분에 많이 개선됐어요. 추천합니다!',
              rating: 5,
            },
            {
              name: '박준호',
              role: '재택근무자',
              content: '업무 집중도가 확실히 올라갔고, 리포트로 나를 객관적으로 볼 수 있어서 좋습니다.',
              rating: 5,
            }
          ].map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass p-8 hover:glass-strong transition-all duration-500"
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// Final CTA Section Component
function CTASection({ router, smoothProgress }: any) {
  const opacity = useTransform(smoothProgress, [0.92, 0.96, 1], [0, 1, 1])
  const scale = useTransform(smoothProgress, [0.92, 0.96], [0.8, 1])

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative min-h-screen py-48 snap-start flex items-center overflow-hidden"
    >
      <div className="container mx-auto px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[clamp(3rem,12vw,9rem)] font-bold leading-none tracking-tighter mb-12">
            <span className="block gradient-text">START YOUR</span>
            <span className="block text-white/90 italic font-light">JOURNEY TODAY</span>
          </h2>

          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            지금 바로 AI 학습 코치와 함께 목표를 달성하세요
          </p>

          <motion.button
            onClick={() => router.push('/auth/register')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group px-16 py-6 bg-accent-blue text-white text-sm font-bold tracking-[0.3em] hover:shadow-glow-lg transition-all"
          >
            <span className="flex items-center gap-4">
              GET STARTED FREE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>

          <p className="mt-6 text-sm text-white/40">
            무료로 시작하고, 언제든지 업그레이드하세요
          </p>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/10 via-transparent to-transparent pointer-events-none" />
    </motion.section>
  )
}
