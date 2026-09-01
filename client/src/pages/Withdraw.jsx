import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Bitcoin,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Withdraw() {
  const [step, setStep] = useState(1)
  const [info, setInfo] = useState(null)
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchWithdrawalInfo()
  }, [])

  const fetchWithdrawalInfo = async () => {
    try {
      const res = await api.get('/withdrawals/info')
      setInfo(res.data.data)
    } catch (err) {
      toast.error('Failed to load withdrawal info')
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

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) < (info?.minimumWithdrawal || 100)) {
      toast.error(`Minimum withdrawal is $${info?.minimumWithdrawal || 100}`)
      return
    }

    if (!walletAddress || walletAddress.length < 10) {
      toast.error('Please enter a valid BTC address')
      return
    }

    if (parseFloat(amount) > parseFloat(info?.availableBalance || 0)) {
      toast.error('Insufficient available balance')
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
      setWithdrawalData(res.data.data)
      setStep(2)
      toast.success('Withdrawal request submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <p className="text-cgp-text">Withdraw your earnings via Bitcoin (BTC)</p>
      </div>

      {/* Available Balance */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Bitcoin className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-cgp-text">Available Balance</p>
            <p className="text-2xl font-bold">${info?.availableBalance ? parseFloat(info.availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-cgp-text">Min: ${info?.minimumWithdrawal || 100}</p>
          <p className="text-xs text-cgp-text">Fee: {info?.feePercentage || 2}%</p>
        </div>
      </div>

      {step === 1 ? (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl">
          <div className="space-y-5">
            {/* BTC Badge */}
            <div className="flex items-center gap-3 bg-cgp-dark rounded-xl p-4 border border-cgp-border">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium">Bitcoin (BTC)</p>
                <p className="text-xs text-cgp-text">Only BTC withdrawals supported</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cgp-text">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={info?.minimumWithdrawal || 100}
                  className="w-full pl-8 pr-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  placeholder={`Minimum $${info?.minimumWithdrawal || 100}`}
                />
              </div>
              {amount && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between text-cgp-text">
                    <span>Fee ({info?.feePercentage || 2}%)</span>
                    <span>${calculateFee().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You'll Receive</span>
                    <span className="text-cgp-green">${calculateNet().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">BTC Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="Enter your Bitcoin (BTC) address"
              />
              <p className="text-xs text-cgp-text mt-1">Network: <strong>Bitcoin</strong></p>
            </div>

            <div className="bg-cgp-dark rounded-xl p-4 border border-cgp-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cgp-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm text-cgp-text">
                  <p className="text-white font-medium mb-1">Important:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Double-check your <strong>BTC address</strong></li>
                    <li>Use <strong>Bitcoin network only</strong></li>
                    <li>Withdrawals are processed within 24 hours</li>
                    <li>KYC verification required</li>
                    <li>Wrong address = lost funds</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !amount || !walletAddress}
              className="w-full py-3.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-5 h-5" />
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl text-center">
          <div className="w-16 h-16 bg-cgp-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-cgp-green" />
          </div>
          <h2 className="text-xl font-bold mb-2">Withdrawal Submitted!</h2>
          <p className="text-cgp-text mb-6">
            Your BTC withdrawal request is pending admin approval. You'll receive an email once processed.
          </p>

          <div className="bg-cgp-dark rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">Amount</span>
              <span className="font-medium">${parseFloat(withdrawalData?.amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">Fee</span>
              <span className="font-medium">${parseFloat(withdrawalData?.fee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">Net Amount</span>
              <span className="font-medium text-cgp-green">${parseFloat(withdrawalData?.netAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">Crypto</span>
              <span className="font-medium">BTC (Bitcoin)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">BTC Address</span>
              <span className="font-mono text-xs">{withdrawalData?.walletAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cgp-text">Status</span>
              <span className="px-2 py-0.5 rounded-full text-xs text-cgp-gold bg-cgp-gold/10">PENDING</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/wallet')}
            className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
          >
            Back to Wallet
          </button>
        </div>
      )}
    </div>
  )
}