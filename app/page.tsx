'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, Target, Clock, TrendingUp, Eye, Zap, BarChart } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

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
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Custom Cursor */}
      <motion.div
        className={`fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference ${isHovering ? 'scale-150' : 'scale-100'}`}
        animate={{
          x: cursorPos.x - 16,
          y: cursorPos.y - 16,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white" />
      </motion.div>

      {/* Fixed Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-40 mix-blend-difference"
      >
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Brain className="w-8 h-8" />
              <span className="text-xl font-light tracking-wider">STUDY COACH</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-8 text-sm font-light tracking-wider"
            >
              <button
                onClick={() => router.push('/auth/login')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:opacity-70 transition-opacity"
              >
                LOGIN
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="hover:opacity-70 transition-opacity"
              >
                START
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center">
        <motion.div
          className="container mx-auto px-8 text-center"
          style={{
            y: useTransform(smoothProgress, [0, 0.3], [0, -100]),
            opacity: useTransform(smoothProgress, [0, 0.3], [1, 0])
          }}
        >
          {/* Oversized Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-[clamp(3rem,15vw,12rem)] font-bold leading-[0.9] mb-8 tracking-tighter"
          >
            <span className="block">BEYOND</span>
            <span className="block italic font-light">Focus</span>
            <span className="block">WITHIN REACH</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-lg md:text-xl font-light text-gray-400 max-w-2xl mx-auto mb-12 tracking-wide"
          >
            AI-POWERED STUDY MANAGEMENT PLATFORM
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            onClick={() => router.push('/auth/register')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group relative px-12 py-4 bg-white text-black text-sm font-light tracking-[0.3em] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
              GET STARTED
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
              style={{ originX: 0 }}
            />
            <motion.span
              className="absolute inset-0 flex items-center justify-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ zIndex: 20 }}
            >
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent"
            />
          </motion.div>
        </motion.div>

        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }} />
        </div>
      </section>

      {/* Features Section - Large Cards */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection router={router} setIsHovering={setIsHovering} />

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between text-sm font-light text-gray-500">
            <p>© 2025 STUDY COACH</p>
            <p>AI-POWERED LEARNING</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: Eye,
      title: 'AI VISION',
      subtitle: 'Real-time monitoring',
      description: 'Advanced computer vision tracks your posture, phone usage, and presence with sub-second precision.',
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      icon: Target,
      title: 'SMART PLANNER',
      subtitle: 'Intuitive scheduling',
      description: 'Drag-and-drop interface with intelligent time blocks that adapt to your learning patterns.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Zap,
      title: 'FOCUS TIMER',
      subtitle: 'Pomodoro technique',
      description: 'Science-backed intervals with automatic breaks and AI-powered distraction detection.',
      gradient: 'from-pink-500/20 to-orange-500/20'
    },
    {
      icon: BarChart,
      title: 'ANALYTICS',
      subtitle: 'Deep insights',
      description: 'Comprehensive reports on focus patterns, productivity trends, and improvement areas.',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
    {
      icon: TrendingUp,
      title: 'PROGRESS',
      subtitle: 'Growth tracking',
      description: 'Visualize your improvement over time with detailed charts and achievement milestones.',
      gradient: 'from-red-500/20 to-yellow-500/20'
    },
    {
      icon: Brain,
      title: 'AI COACH',
      subtitle: 'Personalized guidance',
      description: 'Machine learning algorithms provide tailored recommendations for optimal study sessions.',
      gradient: 'from-yellow-500/20 to-green-500/20'
    }
  ]

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="mb-32 text-center"
        >
          <h2 className="text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-tighter mb-6">
            FEATURES
          </h2>
          <p className="text-lg font-light text-gray-500 tracking-wide">
            INTELLIGENT TOOLS FOR MODERN LEARNERS
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Feature Card with 3D Effect
function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = (y - centerY) / 20
    const rotateYValue = (centerX - x) / 20
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[4/5] cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30
        }}
        className="relative w-full h-full p-8 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm overflow-hidden"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <feature.icon className="w-12 h-12 mb-6 stroke-[1.5]" />
            <h3 className="text-3xl font-bold mb-2 tracking-tight">{feature.title}</h3>
            <p className="text-sm font-light text-gray-500 tracking-wider uppercase mb-4">
              {feature.subtitle}
            </p>
          </div>
          <p className="text-sm font-light text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%', skewX: -20 }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </motion.div>
  )
}

// Stats Section
function StatsSection() {
  const stats = [
    { value: '95%', label: 'FOCUS IMPROVEMENT' },
    { value: '2.5x', label: 'STUDY EFFICIENCY' },
    { value: '1000+', label: 'ACTIVE USERS' },
  ]

  return (
    <section className="py-32 border-y border-white/10">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="text-[clamp(3rem,10vw,8rem)] font-bold leading-none mb-4">
                {stat.value}
              </div>
              <p className="text-sm font-light text-gray-500 tracking-[0.3em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection({ router, setIsHovering }: { router: any; setIsHovering: (v: boolean) => void }) {
  return (
    <section className="py-48 relative">
      <div className="container mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[clamp(2.5rem,10vw,8rem)] font-bold leading-none tracking-tighter mb-12">
            START YOUR
            <br />
            <span className="italic font-light">JOURNEY</span>
          </h2>

          <motion.button
            onClick={() => router.push('/auth/register')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-16 py-6 bg-white text-black text-sm font-light tracking-[0.3em]"
          >
            GET STARTED NOW
          </motion.button>
        </motion.div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </section>
  )
}
