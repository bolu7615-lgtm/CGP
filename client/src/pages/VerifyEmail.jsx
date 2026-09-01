import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const stateEmail = location.state?.email
    if (stateEmail) {
      setEmail(stateEmail)
    }
  }, [location.state])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/verify-email', { email, code })
      setVerified(true)
      toast.success('Email verified successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setResendLoading(true)
    try {
      await api.post('/auth/resend-verification', { email })
      setCountdown(60)
      toast.success('Verification code resent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend')
    } finally {
      setResendLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-cgp-dark flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-cgp-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-cgp-green" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
          <p className="text-cgp-text mb-8">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cgp-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-cgp-text hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to register
        </Link>

        <div className="bg-cgp-card border border-cgp-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-cgp-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-cgp-gold" />
            </div>
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
            <p className="text-sm text-cgp-text mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {!location.state?.email && (
            <div className="mb-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-cgp-text mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="inline-flex items-center gap-2 text-sm text-cgp-gold hover:text-cgp-gold-light disabled:text-cgp-text disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}