'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'signup') {
      setIsLogin(false)
    }
  }, [searchParams])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || (isLogin ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full items-center justify-center overflow-hidden bg-[#080808] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,255,134,0.1)_0%,transparent_50%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col gap-6 w-full">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>auto_awesome</span>
              <h1 className="text-2xl font-bold text-white">Study Coach</h1>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex rounded-full bg-[#1a1a32] p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition-all duration-300 ${isLogin
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(51,255,134,0.4)]'
                  : 'text-[#9393c8] hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition-all duration-300 ${!isLogin
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(51,255,134,0.4)]'
                  : 'text-[#9393c8] hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400" style={{ fontSize: '20px' }}>error</span>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#eaeaea]">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9393c8]" style={{ fontSize: '20px' }}>person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-[#343465] bg-[#1a1a32] py-3 pl-12 pr-4 text-white placeholder:text-[#9393c8] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#eaeaea]">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9393c8]" style={{ fontSize: '20px' }}>mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#343465] bg-[#1a1a32] py-3 pl-12 pr-4 text-white placeholder:text-[#9393c8] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#eaeaea]">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9393c8]" style={{ fontSize: '20px' }}>lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#343465] bg-[#1a1a32] py-3 pl-12 pr-4 text-white placeholder:text-[#9393c8] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#343465] bg-[#1a1a32] text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[#9393c8]">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-[0_0_20px_rgba(51,255,134,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(51,255,134,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                </div>
              ) : (
                <span>{isLogin ? 'Login' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#343465]"></div>
            <span className="text-sm text-[#9393c8]">or continue with</span>
            <div className="flex-1 h-px bg-[#343465]"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#343465] bg-[#1a1a32] py-3 hover:border-primary transition-all">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-white">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#343465] bg-[#1a1a32] py-3 hover:border-primary transition-all">
              <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm font-medium text-white">GitHub</span>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[#9393c8] hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
