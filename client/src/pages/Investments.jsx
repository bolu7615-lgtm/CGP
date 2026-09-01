import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Percent,
  Calendar,
  Wallet,
  BarChart3,
  X,
  Lock,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Fixed investment tiers
const ALL_PLANS = [
  {
    id: 'tier-1',
    name: 'Starter Plan',
    deposit: 4000,
    percentOfPlan: 10,
    dailyRoi: 2.5,
    dailyProfit: 100,
    durationDays: 60,
    totalProfit: 6000,
    totalReturn: 10000,
    minAmount: 4000,
    maxAmount: 7999,
    popular: false,
    principalReturn: true,
  },
  {
    id: 'tier-2',
    name: 'Growth Plan',
    deposit: 8000,
    percentOfPlan: 20,
    dailyRoi: 2.5,
    dailyProfit: 200,
    durationDays: 60,
    totalProfit: 12000,
    totalReturn: 20000,
    minAmount: 8000,
    maxAmount: 11999,
    popular: false,
    principalReturn: true,
  },
  {
    id: 'tier-3',
    name: 'Advanced Plan',
    deposit: 12000,
    percentOfPlan: 30,
    dailyRoi: 2.5,
    dailyProfit: 300,
    durationDays: 60,
    totalProfit: 18000,
    totalReturn: 30000,
    minAmount: 12000,
    maxAmount: 19999,
    popular: true,
    principalReturn: true,
  },
  {
    id: 'tier-4',
    name: 'Pro Plan',
    deposit: 20000,
    percentOfPlan: 50,
    dailyRoi: 2.5,
    dailyProfit: 500,
    durationDays: 60,
    totalProfit: 30000,
    totalReturn: 50000,
    minAmount: 20000,
    maxAmount: 39999,
    popular: false,
    principalReturn: true,
  },
  {
    id: 'tier-5',
    name: 'Elite Plan',
    deposit: 40000,
    percentOfPlan: 100,
    dailyRoi: 2.5,
    dailyProfit: 1000,
    durationDays: 60,
    totalProfit: 60000,
    totalReturn: 100000,
    minAmount: 40000,
    maxAmount: 40000,
    popular: false,
    principalReturn: true,
  },
]

export default function Investments() {
  const [myInvestments, setMyInvestments] = useState([])
  const [walletData, setWalletData] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invRes, walletRes] = await Promise.all([
        api.get('/investments/my'),
        api.get('/wallet'),
      ])
      setMyInvestments(invRes.data.data.investments || [])
      setWalletData(walletRes.data.data)
    } catch (err) {
      toast.error('Failed to load investment data')
    } finally {
      setLoading(false)
    }
  }

  // Check if user has deposited $4,000 or more
  const hasMinDeposit = (walletData?.wallet?.totalDeposited || 0) >= 4000

  // Filter plans: if user has deposited $4k+, only show tier-5 (Elite). Otherwise show all.
  const PLANS = hasMinDeposit
    ? ALL_PLANS.filter((p) => p.id === 'tier-5')
    : ALL_PLANS

  const openInvestModal = (plan) => {
    setSelectedPlan(plan)
    setAmount(plan.deposit.toString())
    setShowModal(true)
  }

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) < selectedPlan.minAmount) {
      toast.error(`Minimum investment is $${selectedPlan.minAmount.toLocaleString()}`)
      return
    }
    if (parseFloat(amount) > selectedPlan.maxAmount) {
      toast.error(`Maximum investment is $${selectedPlan.maxAmount.toLocaleString()}`)
      return
    }

    setInvesting(true)
    try {
      await api.post('/investments', {
        planId: selectedPlan.id,
        amount: parseFloat(amount),
      })
      toast.success('Investment created successfully!')
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed')
    } finally {
      setInvesting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'text-cgp-green bg-cgp-green/10',
      COMPLETED: 'text-cgp-blue bg-cgp-blue/10',
      CANCELLED: 'text-cgp-red bg-cgp-red/10',
      EARLY_WITHDRAWN: 'text-cgp-gold bg-cgp-gold/10',
    }
    return styles[status] || 'text-cgp-text bg-white/5'
  }

  const calculatePreview = () => {
    if (!selectedPlan || !amount) return null
    const amt = parseFloat(amount)
    const daily = (amt * selectedPlan.dailyRoi) / 100
    const totalProfit = daily * selectedPlan.durationDays
    const totalReturn = selectedPlan.principalReturn ? amt + totalProfit : totalProfit
    return { daily, totalProfit, totalReturn }
  }

  const preview = showModal ? calculatePreview() : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cgp-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Investment Plans</h1>
        <p className="text-cgp-text">
          Choose a 60-day plan that suits your investment goals
        </p>
        {hasMinDeposit && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-cgp-gold/10 border border-cgp-gold/30 rounded-full text-sm text-cgp-gold">
            <Lock className="w-4 h-4" />
            $4,000+ deposited. Only Elite Plan is available.
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className={`grid gap-6 ${PLANS.length === 1 ? 'max-w-sm mx-auto' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-cgp-card border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
              plan.popular ? 'border-cgp-gold' : 'border-cgp-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cgp-gold text-cgp-dark text-xs font-bold rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-cgp-gold">
                ${plan.dailyProfit.toLocaleString()}
              </span>
              <span className="text-sm text-cgp-text"> / day</span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-cgp-gold font-medium">
                {plan.dailyRoi}% Daily ROI
              </span>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-cgp-text">Deposit:</span>
                <span className="font-medium">
                  ${plan.deposit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cgp-text">Duration:</span>
                <span className="font-medium">{plan.durationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cgp-text">Total Profit:</span>
                <span className="font-medium text-cgp-green">
                  ${plan.totalProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cgp-text">Total Return:</span>
                <span className="font-medium text-cgp-gold">
                  ${plan.totalReturn.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                `${plan.dailyRoi}% Daily ROI`,
                'Principal Return',
                `${plan.durationDays}-Day Fixed Term`,
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-cgp-text-light"
                >
                  <CheckCircle2 className="w-4 h-4 text-cgp-green" />
                  {feat}
                </div>
              ))}
            </div>

            <button
              onClick={() => openInvestModal(plan)}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                plan.popular
                  ? 'bg-cgp-gold text-cgp-dark btn-gold'
                  : 'border border-cgp-border hover:bg-white/5'
              }`}
            >
              Invest Now
            </button>
          </div>
        ))}
      </div>

      {/* My Investments */}
      {myInvestments.length > 0 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
          <h2 className="font-semibold mb-6">My Investments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-cgp-text uppercase">
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Daily Profit</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cgp-border">
                {myInvestments.map((inv) => (
                  <tr key={inv.id} className="text-sm">
                    <td className="py-4">
                      <span className="font-medium">{inv.plan?.name}</span>
                    </td>
                    <td className="py-4">
                      ${parseFloat(inv.amount).toLocaleString()}
                    </td>
                    <td className="py-4 text-cgp-green">
                      +${parseFloat(inv.dailyProfit).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-cgp-border rounded-full">
                          <div
                            className="h-full bg-cgp-gold rounded-full"
                            style={{ width: `${inv.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-cgp-text">
                          {inv.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-cgp-text">
                      {new Date(inv.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invest Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-cgp-text hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-2">
              Invest in {selectedPlan.name}
            </h2>
            <p className="text-sm text-cgp-text mb-6">
              {selectedPlan.dailyRoi}% Daily ROI | {selectedPlan.durationDays} Days | Principal Return
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cgp-text">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={selectedPlan.minAmount}
                    max={selectedPlan.maxAmount}
                    className="w-full pl-8 pr-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  />
                </div>
                <p className="text-xs text-cgp-text mt-1">
                  Min: ${selectedPlan.minAmount.toLocaleString()} | Max: $
                  {selectedPlan.maxAmount.toLocaleString()}
                </p>
              </div>

              {preview && (
                <div className="bg-cgp-dark rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cgp-text">Daily Profit</span>
                    <span className="text-cgp-green font-medium">
                      +${preview.daily.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cgp-text">
                      Total Profit ({selectedPlan.durationDays} days)
                    </span>
                    <span className="text-cgp-green font-medium">
                      +${preview.totalProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cgp-text">Principal Return</span>
                    <span className="text-cgp-blue font-medium">
                      +${parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-cgp-border pt-2 flex justify-between">
                    <span className="text-cgp-text font-medium">
                      Total Return
                    </span>
                    <span className="font-bold text-cgp-gold">
                      ${preview.totalReturn.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={investing}
                  className="flex-1 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50"
                >
                  {investing ? 'Processing...' : 'Confirm Investment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}