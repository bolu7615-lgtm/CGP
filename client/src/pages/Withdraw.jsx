import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Bitcoin,
  Lock,
  Info,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Withdraw() {
  const [step, setStep] = useState(1)
  const [info, setInfo] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState(null)

  const navigate = useNavigate()

  // Elite Plan funding target
  const FUNDING_TARGET = 40000
  const FUNDING_MONTHS = 9
  const MIN_MONTHLY = 4000
  const MAX_DAILY = 1000
  const LOCK_THRESHOLD = 4000

  useEffect(() => {
    fetchWithdrawalInfo()
    fetchWalletData()
  }, [])

  const fetchWithdrawalInfo = async () => {
    try {
      const res = await api.get('/withdrawals/info')
      setInfo(res.data.data)
    } catch (err) {
      toast.error('Failed to load withdrawal info')
    }
  }

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/wallet')
      setWalletData(res.data.data)
    } catch (err) {
      console.error('Failed to load wallet data')
    }
  }

  const calculateFee = () => {
    if (!amount || !info) return 0
    return (parseFloat(amount) * info.feePercentage) / 100
  }

  const calculateNet = () => {
    if (!amount) return 0
    return parseFloat(amount) - calculateFee()
  }

  // Check if funds are locked (totalDeposited >= $4,000)
  const isFundsLocked = () => {
    const totalDeposited = parseFloat(walletData?.wallet?.totalDeposited || 0)
    return totalDeposited >= LOCK_THRESHOLD
  }

  // Calculate available to withdraw (0 if less than $4k deposited, profit only when locked)
  const getAvailableToWithdraw = () => {
    const totalDeposited = parseFloat(walletData?.wallet?.totalDeposited || 0)

    // If less than $4,000 deposited, available is 0
    if (totalDeposited < LOCK_THRESHOLD) {
      return 0
    }

    // When locked ($4k+), only profit can be withdrawn
    const available = parseFloat(info?.availableBalance || 0)
    return Math.max(0, available - totalDeposited)
  }

  // Locked amount: deposited funds are locked whether under or over $4k
  const getLockedAmount = () => {
    return parseFloat(walletData?.wallet?.totalDeposited || 0)
  }

  const handleSubmit = async () => {
    const minWithdrawal = info?.minimumWithdrawal || 100
    const availableToWithdraw = getAvailableToWithdraw()

    if (!amount || parseFloat(amount) < minWithdrawal) {
      toast.error(`Minimum withdrawal is $${minWithdrawal}`)
      return
    }

    if (!walletAddress || walletAddress.length < 10) {
      toast.error('Please enter a valid BTC address')
      return
    }

    if (parseFloat(amount) > availableToWithdraw) {
      if (isFundsLocked()) {
        toast.error(`Funds are locked. You can only withdraw profits. Available: $${availableToWithdraw.toFixed(2)}`)
      } else {
        toast.error('Insufficient available balance')
      }
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/withdrawals', {
        amount: parseFloat(amount),
        cryptoCurrency: 'BTC',
        walletAddress,
        network: 'Bitcoin',
      })

      const data = res.data.data?.withdrawal || res.data.data
      setWithdrawalData(data)
      setStep(2)
      toast.success('Withdrawal request submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const fundsLocked = isFundsLocked()
  const availableToWithdraw = getAvailableToWithdraw()
  const lockedAmount = getLockedAmount()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <p className="text-cgp-text">Withdraw your earnings via Bitcoin (BTC)</p>
      </div>

      {/* Available vs Locked Card */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
        <div className="space-y-4">
          {/* Available to withdraw */}
          <div className="flex items-center justify-between pb-4 border-b border-cgp-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cgp-green/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-cgp-green" />
              </div>
              <div>
                <p className="text-sm text-cgp-text">Available to withdraw</p>
                <p className="text-2xl font-bold text-cgp-green">
                  ${availableToWithdraw.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Locked */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cgp-gold/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cgp-gold" />
              </div>
              <div>
                <p className="text-sm text-cgp-text">Locked</p>
                <p className="text-2xl font-bold text-cgp-gold">
                  ${lockedAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOCKED STATE - Show when totalDeposited >= $4,000 */}
      {fundsLocked && step === 1 && (
        <>
          {/* Funding Progress Card */}
          <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-cgp-text">Funding progress</p>
                <p className="text-lg font-bold text-cgp-gold">
                  ${parseFloat(walletData?.wallet?.totalDeposited || 0).toLocaleString()} of ${FUNDING_TARGET.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-cgp-text">Remaining</p>
                <p className="text-lg font-bold text-white">
                  ${Math.max(0, FUNDING_TARGET - parseFloat(walletData?.wallet?.totalDeposited || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-cgp-dark rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-cgp-gold to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((parseFloat(walletData?.wallet?.totalDeposited || 0) / FUNDING_TARGET) * 100))}%` }}
              ></div>
            </div>

            <p className="text-sm text-cgp-text mb-4">
              Funds stay locked until ${FUNDING_TARGET.toLocaleString()} is fully funded and the 60-day term ends.
            </p>

            {/* Info Box */}
            <div className="bg-cgp-dark rounded-xl p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-cgp-blue flex-shrink-0" />
              <p className="text-sm text-cgp-text">
                {availableToWithdraw > 0 
                  ? `You can withdraw $${availableToWithdraw.toFixed(2)} in profits. Principal remains locked.`
                  : 'No profits available yet. Funds are locked until the program matures.'
                }
              </p>
            </div>
          </div>

          {/* Disabled Withdrawal Button */}
          <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl">
            <button
              disabled
              className="w-full py-3.5 bg-cgp-dark text-cgp-text font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Request Withdrawal
            </button>
            <p className="text-xs text-cgp-text text-center mt-3">
              Funds are locked until the program is fully funded and the 60-day term ends.
            </p>
          </div>
        </>
      )}

      {/* NORMAL STATE - Show when totalDeposited < $4,000 (Same as screenshot) */}
      {!fundsLocked && step === 1 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl">
          <button
            disabled
            className="w-full py-3.5 bg-cgp-dark text-cgp-text font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Request Withdrawal
          </button>
          <p className="text-xs text-cgp-text text-center mt-3">
            Funds stay locked until a plan is fully funded and the 60-day term ends.
          </p>
        </div>
      )}

      {/* Success Screen */}
      {step === 2 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-8 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-cgp-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-cgp-green" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Withdrawal Submitted!</h2>
          <p className="text-cgp-text mb-8">
            Your BTC withdrawal request is pending admin approval. You'll receive an email once processed.
          </p>

          <button
            onClick={() => navigate('/wallet')}
            className="w-full px-6 py-3.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
          >
            Back to Wallet
          </button>
        </div>
      )}
    </div>
  )
}