import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ─── CGP LOGO (matches Navbar exactly) ────────────────────────────
function CGPLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="url(#loginGoldGrad)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z"
        fill="url(#loginGoldGrad)"
        opacity="0.15"
      />
      <circle cx="16" cy="16" r="3" fill="#F5A623" />
      <defs>
        <linearGradient
          id="loginGoldGrad"
          x1="4"
          y1="2"
          x2="28"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5A623" />
          <stop offset="1" stopColor="#D4891A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [otp, setOtp] = useState('')

  const { login, verify2FA } = useAuth()
  const navigate = useNavigate()

  const redirectAfterLogin = (userData) => {
    if (userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.requires2FA) {
        setRequires2FA(true)
        toast.success('Verification code sent to your email')
      } else {
        toast.success('Welcome back!')
        const userData = result.user || result.userData
        redirectAfterLogin(userData)
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await verify2FA(email, otp)
      toast.success('Login successful!')
      const userData = result.user || result.userData
      redirectAfterLogin(userData)
    } catch (err) {
      toast.error(err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cgp-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 shadow-xl">
          {/* Logo + Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <CGPLogo size={44} />
            </div>
            <div className="mb-1">
              <span className="text-lg font-bold text-white tracking-tight">
                Capital<span className="text-cgp-gold">Growth</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-4">
              {requires2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {requires2FA
                ? 'Enter the 6-digit code from your email'
                : 'Sign in to your account'}
            </p>
          </div>

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-600 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-cgp-gold/50 focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-600 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-11 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-cgp-gold/50 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#1f2937] bg-[#0a0e1a] text-cgp-gold focus:ring-cgp-gold/20"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-cgp-gold hover:text-amber-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cgp-gold hover:bg-amber-500 text-[#0a0e1a] font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-cgp-gold pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-center text-xl tracking-[0.5em] font-mono placeholder-slate-700 focus:border-cgp-gold/50 focus:outline-none transition-colors"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-cgp-gold hover:bg-amber-500 text-[#0a0e1a] font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setOtp('')
                }}
                className="w-full py-2.5 text-sm text-slate-500 hover:text-white transition-colors"
              >
                Back to login
              </button>
            </form>
          )}

          {/* Footer */}
          {!requires2FA && (
            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cgp-gold hover:text-amber-400 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          )}
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-slate-700 mt-6">
          &copy; 2026 Capital Growth Program
        </p>
      </div>
    </div>
  )
}