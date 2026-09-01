import { useState, useEffect } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Filter,
  Download,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', status: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [filter, page])

  const fetchData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get(`/wallet/transactions?page=${page}&limit=20&type=${filter.type}&status=${filter.status}`),
        api.get('/transactions/stats'),
      ])
      setTransactions(txRes.data.data.transactions)
      setStats(statsRes.data.data)
    } catch (err) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      DEPOSIT: ArrowDownLeft,
      WITHDRAWAL: ArrowUpRight,
      INVESTMENT: TrendingUp,
      PROFIT: DollarSign,
      REFERRAL_BONUS: Users,
      ADMIN_ADJUSTMENT: Activity,
    }
    return icons[type] || Activity
  }

  const getTypeColor = (type) => {
    const colors = {
      DEPOSIT: 'text-cgp-green',
      WITHDRAWAL: 'text-cgp-red',
      INVESTMENT: 'text-cgp-red',
      PROFIT: 'text-cgp-green',
      REFERRAL_BONUS: 'text-cgp-gold',
      ADMIN_ADJUSTMENT: 'text-cgp-blue',
    }
    return colors[type] || 'text-cgp-text'
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

  const getAmountPrefix = (type) => {
    return type === 'WITHDRAWAL' || type === 'INVESTMENT' ? '-' : '+'
  }

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
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-cgp-text">View your complete transaction history</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Deposits', value: stats.totalDeposits, color: 'text-cgp-green' },
            { label: 'Withdrawals', value: stats.totalWithdrawals, color: 'text-cgp-red' },
            { label: 'Investments', value: stats.totalInvestments, color: 'text-cgp-blue' },
            { label: 'Profits', value: stats.totalProfits, color: 'text-cgp-gold' },
            { label: 'Referrals', value: stats.totalReferralBonuses, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-4">
              <p className="text-xs text-cgp-text mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>
                ${parseFloat(stat.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.type}
          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          className="px-3 py-2 bg-cgp-card border border-cgp-border rounded-lg text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Types</option>
          <option value="DEPOSIT">Deposits</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="INVESTMENT">Investments</option>
          <option value="PROFIT">Profits</option>
          <option value="REFERRAL_BONUS">Referral Bonuses</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 bg-cgp-card border border-cgp-border rounded-lg text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const TxIcon = getTypeIcon(tx.type)
                  return (
                    <tr key={tx.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <TxIcon className={`w-4 h-4 ${getTypeColor(tx.type)}`} />
                          </div>
                          <span className="font-medium">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-cgp-text max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getTypeColor(tx.type)}`}>
                          {getAmountPrefix(tx.type)}${parseFloat(tx.amount).toFixed(2)}
                        </span>
                        {tx.cryptoCurrency && (
                          <span className="text-xs text-cgp-text ml-1">
                            ({parseFloat(tx.cryptoAmount || 0).toFixed(8)} {tx.cryptoCurrency})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-cgp-text">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-cgp-text">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}