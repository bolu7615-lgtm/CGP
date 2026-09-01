import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

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
        stroke="url(#registerGoldGrad)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z"
        fill="url(#registerGoldGrad)"
        opacity="0.15"
      />
      <circle cx="16" cy="16" r="3" fill="#F5A623" />
      <defs>
        <linearGradient
          id="registerGoldGrad"
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

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validatePassword = (pwd) => {
    const checks = [
      { test: pwd.length >= 8, label: 'At least 8 characters' },
      { test: /[A-Z]/.test(pwd), label: 'One uppercase letter' },
      { test: /[a-z]/.test(pwd), label: 'One lowercase letter' },
      { test: /\d/.test(pwd), label: 'One number' },
      { test: /[@$!%*?&]/.test(pwd), label: 'One special character' },
    ]
    return checks
  }

  const passwordChecks = validatePassword(formData.password)
  const allChecksPass = passwordChecks.every(c => c.test)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!allChecksPass) {
      toast.error('Please meet all password requirements')
      return
    }

    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setLoading(true)

    try {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        referralCode: formData.referralCode || undefined,
      }

      await register(data)
      setRegistered(true)
      toast.success('Account created! Please verify your email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Account Created!</h1>
          <p className="text-slate-400 mb-6">
            We've sent a verification code to <span className="text-white">{formData.email}</span>.
            Please verify your email to continue.
          </p>
          <button
            onClick={() => navigate('/verify-email', { state: { email: formData.email } })}
            className="px-8 py-3 bg-[#F5A623] hover:bg-amber-500 text-[#0a0e1a] font-bold rounded-xl transition-colors"
          >
            Verify Email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#F5A623] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <CGPLogo size={44} />
            </div>
            <div className="mb-1">
              <span className="text-lg font-bold text-white tracking-tight">
                Capital<span className="text-[#F5A623]">Growth</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-4">Create Your Account</h1>
            <p className="text-sm text-slate-500 mt-1.5">Join thousands of investors growing their wealth</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '44px' }}
                    className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '44px' }}
                    className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '44px' }}
                  className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Phone (Optional)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <Phone className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ paddingLeft: '44px' }}
                    className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Country (Optional)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <Globe className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{ paddingLeft: '44px' }}
                    className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  className="w-full py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${check.test ? 'text-emerald-500' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${check.test ? 'text-emerald-500' : 'text-slate-600'}`} />
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  className="w-full py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors z-10"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Referral Code (Optional)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                  className="w-full pr-4 py-3 bg-[#0a0e1a] border border-[#1f2937] rounded-xl text-white text-sm placeholder-slate-600 focus:border-[#F5A623]/50 focus:outline-none transition-colors"
                  placeholder="CGP-XXXXXXXX"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-[#1f2937] bg-[#0a0e1a] text-[#F5A623] focus:ring-[#F5A623]/20"
              />
              <span className="text-slate-500">
                I agree to the{' '}
                <Link to="#" className="text-[#F5A623] hover:text-amber-400 transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link to="#" className="text-[#F5A623] hover:text-amber-400 transition-colors">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#F5A623] hover:bg-amber-500 text-[#0a0e1a] font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F5A623] hover:text-amber-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          &copy; 2026 Capital Growth Program
        </p>
      </div>
    </div>
  )
}