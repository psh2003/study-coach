'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, name)
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full items-center justify-center overflow-hidden bg-[#080808] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,255,134,0.1)_0%,transparent_50%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col gap-8 w-full">
          {/* Header */}
          <div className="flex flex-col gap-3 text-center">
            <p className="text-[#f8f8f8] text-4xl font-black leading-tight tracking-[-0.033em]">Get started</p>
            <p className="text-[#a1a1a1] text-base font-normal leading-normal">Start your journey to better habits today</p>
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

          {/* Success Message */}
          {success && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400" style={{ fontSize: '20px' }}>check_circle</span>
                <p className="text-sm text-green-300">Account created! Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#f8f8f8] text-base font-medium leading-normal pb-2">Name</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#f8f8f8] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#2e2e2e] bg-[#1c1c1c] hover:border-primary/30 transition-all duration-300 h-14 placeholder:text-[#a1a1a1] p-4 text-base font-normal leading-normal"
                />
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#f8f8f8] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#f8f8f8] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#2e2e2e] bg-[#1c1c1c] hover:border-primary/30 transition-all duration-300 h-14 placeholder:text-[#a1a1a1] p-4 text-base font-normal leading-normal"
                />
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#f8f8f8] text-base font-medium leading-normal pb-2">Password</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#f8f8f8] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#2e2e2e] bg-[#1c1c1c] hover:border-primary/30 transition-all duration-300 h-14 placeholder:text-[#a1a1a1] p-4 text-base font-normal leading-normal"
                />
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#f8f8f8] text-base font-medium leading-normal pb-2">Confirm Password</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#f8f8f8] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#2e2e2e] bg-[#1c1c1c] hover:border-primary/30 transition-all duration-300 h-14 placeholder:text-[#a1a1a1] p-4 text-base font-normal leading-normal"
                />
              </label>

              <div className="flex px-4 py-3 justify-center">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] shadow-glow hover:shadow-glow-hover transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      <span className="truncate">Creating account...</span>
                    </div>
                  ) : success ? (
                    <span className="truncate">Success!</span>
                  ) : (
                    <span className="truncate">Sign Up</span>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-[#a1a1a1]">
                By signing up, you agree to our{' '}
                <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
                <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
              </p>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-[#a1a1a1]">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-primary hover:underline font-medium"
              >
                Login
              </button>
            </p>
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
