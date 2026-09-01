import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  ChevronRight,
  Bitcoin,
  Info,
  X,
  Calendar,
  Target,
  Timer,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Hardcoded BTC address for display
const BTC_ADDRESS = 'bc1qpsxjwdjlh5jssgy8qd7cmm69n50nvh94sxuq56'

export default function WalletPage() {
  const [walletData, setWalletData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showFundingModal, setShowFundingModal] = useState(false)

  // Elite Plan funding target
  const FUNDING_TARGET = 40000
  const FUNDING_MONTHS = 9
  const MIN_MONTHLY = 4000
  const MAX_DAILY = 1000
  const MAX_MONTHLY = FUNDING_TARGET / FUNDING_MONTHS  // ~$4,444/month average

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions?limit=10'),
      ])
      setWalletData(walletRes.data.data)
      setTransactions(txRes.data.data.transactions)
    } catch (err) {
      toast.error('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(BTC_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('BTC address copied!')
  }

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'text-cgp-green bg-cgp-green/10',
      PENDING: 'text-cgp-gold bg-cgp-gold/10',
      PROCESSING: 'text-cgp-blue bg-cgp-blue/10',
      FAILED: 'text-cgp-red bg-cgp-red/10',
    }
    return colors[status] || 'text-cgp-text bg-white/5'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cgp-gold"></div>
      </div>
    )
  }

  const wallet = walletData?.wallet

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-cgp-text">Manage your funds and view transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Balance',
            value: wallet?.totalBalance || 0,
            icon: Wallet,
            color: 'text-cgp-gold',
            bg: 'bg-cgp-gold/10',
          },
          {
            title: 'Available',
            value: wallet?.availableBalance || 0,
            icon: DollarSign,
            color: 'text-cgp-green',
            bg: 'bg-cgp-green/10',
          },
          {
            title: 'Invested',
            value: wallet?.investedBalance || 0,
            icon: TrendingUp,
            color: 'text-cgp-blue',
            bg: 'bg-cgp-blue/10',
          },
          {
            title: 'Total Earnings',
            value: wallet?.totalEarnings || 0,
            icon: DollarSign,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
        ].map((card, i) => (
          <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">${parseFloat(card.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-cgp-text mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Elite Plan Funding Progress — shows only after $4k deposited */}
      {wallet?.totalDeposited >= 4000 && (
        <div className="bg-cgp-card border border-cgp-gold/30 rounded-xl p-6 relative overflow-hidden">
          {/* Gold glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cgp-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cgp-gold/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-cgp-gold" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Elite Plan Funding</h2>
                <p className="text-xs text-cgp-text">Target: ${FUNDING_TARGET.toLocaleString()} over {FUNDING_MONTHS} months</p>
              </div>
            </div>
            <button
              onClick={() => setShowFundingModal(true)}
              className="flex items-center gap-1 text-xs text-cgp-gold hover:text-cgp-gold-light transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              How funding works
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cgp-text">Funding Progress</span>
              <span className="font-bold text-cgp-gold">
                {Math.min(100, Math.round(((wallet?.totalDeposited || 0) / FUNDING_TARGET) * 100))}%
              </span>
            </div>
            <div className="w-full h-3 bg-cgp-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cgp-gold to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((wallet?.totalDeposited || 0) / FUNDING_TARGET) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-cgp-dark/50 rounded-lg p-3 text-center">
              <p className="text-xs text-cgp-text mb-1">Deposited</p>
              <p className="text-lg font-bold text-cgp-gold">
                ${parseFloat(wallet?.totalDeposited || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-cgp-dark/50 rounded-lg p-3 text-center">
              <p className="text-xs text-cgp-text mb-1">Remaining</p>
              <p className="text-lg font-bold text-white">
                ${Math.max(0, FUNDING_TARGET - parseFloat(wallet?.totalDeposited || 0)).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-cgp-dark/50 rounded-lg p-3 text-center">
              <p className="text-xs text-cgp-text mb-1">Max Daily</p>
              <p className="text-lg font-bold text-cgp-green">
                ${MAX_DAILY.toLocaleString()}
              </p>
            </div>
            <div className="bg-cgp-dark/50 rounded-lg p-3 text-center">
              <p className="text-xs text-cgp-text mb-1">Min Monthly</p>
              <p className="text-lg font-bold text-cgp-blue">
                ${MIN_MONTHLY.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/deposit"
          className="flex items-center gap-2 px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
        >
          <ArrowDownLeft className="w-5 h-5" />
          Deposit BTC
        </Link>
        <Link
          to="/withdraw"
          className="flex items-center gap-2 px-6 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowUpRight className="w-5 h-5" />
          Withdraw BTC
        </Link>
        <Link
          to="/investments"
          className="flex items-center gap-2 px-6 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          Invest
        </Link>
      </div>

      {/* BTC Deposit Address */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-orange-400" />
          Bitcoin Deposit Address
        </h2>
        <div className="bg-cgp-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cgp-text">BTC Address (Bitcoin Network)</span>
            <button
              onClick={copyAddress}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-cgp-green" />
              ) : (
                <Copy className="w-4 h-4 text-cgp-text" />
              )}
            </button>
          </div>
          <p className="text-sm font-mono break-all">{BTC_ADDRESS}</p>
          <p className="text-xs text-cgp-text mt-2">
            Only send Bitcoin (BTC) to this address. Other cryptocurrencies will be lost.
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Transaction History</h2>
          <Link to="/transactions" className="text-sm text-cgp-gold hover:text-cgp-gold-light flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-cgp-text uppercase">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cgp-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-sm">
                    <td className="py-3">
                      <span className="font-medium">{tx.type}</span>
                      {tx.cryptoCurrency && (
                        <span className="text-xs text-cgp-text ml-1">({tx.cryptoCurrency})</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT' ? 'text-cgp-red' : 'text-cgp-green'}>
                        {tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-cgp-text">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-cgp-text">
            No transactions yet
          </div>
        )}
      </div>
      {/* How Funding Works Modal */}
      {showFundingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowFundingModal(false)}
              className="absolute top-4 right-4 text-cgp-text hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cgp-gold/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-cgp-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold">How Elite Plan Funding Works</h2>
                <p className="text-sm text-cgp-text">Fund your Elite Plan over 9 months</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-cgp-dark rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cgp-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-cgp-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Fund Over 9 Months</h3>
                    <p className="text-xs text-cgp-text mt-1">
                      You have up to 9 months to reach the $40,000 target. Deposit at your own pace within the limits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cgp-dark rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cgp-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 text-cgp-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Contribution Limits</h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cgp-text">Maximum per day:</span>
                        <span className="font-medium text-cgp-green">${MAX_DAILY.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cgp-text">Minimum per month:</span>
                        <span className="font-medium text-cgp-blue">${MIN_MONTHLY.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cgp-text">Maximum period:</span>
                        <span className="font-medium text-cgp-gold">{FUNDING_MONTHS} months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-cgp-dark rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cgp-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-cgp-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Unlock Elite Plan</h3>
                    <p className="text-xs text-cgp-text mt-1">
                      Once you reach $40,000 in total deposits, the Elite Plan ($40,000) is fully unlocked for investment. Earn 2.5% daily ROI with $1,000/day profit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cgp-gold/10 border border-cgp-gold/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-cgp-gold">
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">Your current progress</span>
                </div>
                <p className="text-xs text-cgp-text mt-1">
                  You have deposited <span className="text-cgp-gold font-bold">${parseFloat(wallet?.totalDeposited || 0).toLocaleString()}</span> of <span className="text-white font-bold">${FUNDING_TARGET.toLocaleString()}</span>. 
                  <span className="text-cgp-gold"> {Math.max(0, FUNDING_TARGET - parseFloat(wallet?.totalDeposited || 0)).toLocaleString()} more to go!</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFundingModal(false)}
              className="w-full mt-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl hover:bg-amber-500 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}