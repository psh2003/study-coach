import Link from 'next/link'
import { ArrowRight, Brain, Clock, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI로 시작하는
            <span className="text-primary-600"> 스마트 학습</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            컴퓨터 비전 기술로 학습 습관을 분석하고 개선하세요.
            <br />
            집중력 향상과 목표 달성을 위한 최고의 파트너입니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI 집중도 분석</h3>
            <p className="text-gray-600">
              실시간 자세 및 스마트폰 사용 감지로 집중력을 향상시킵니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">스마트 플래너</h3>
            <p className="text-gray-600">
              타임테이블 기반의 직관적인 학습 계획 수립 시스템입니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">학습 통계</h3>
            <p className="text-gray-600">
              데이터 기반의 학습 패턴 분석과 개선 인사이트를 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
