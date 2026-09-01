import { useState, useEffect } from 'react'
import {
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', status: '', userId: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTx, setSelectedTx] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter, page])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.type) params.append('type', filter.type)
      if (filter.status) params.append('status', filter.status)
      if (filter.userId) params.append('userId', filter.userId)
      params.append('page', page)
      params.append('limit', 50)

      const [txRes, statsRes] = await Promise.all([
        api.get(`/transactions/all?${params}`),
        api.get('/transactions/platform-stats'),
      ])

      setTransactions(txRes.data.data.transactions)
      setTotalPages(txRes.data.data.pagination.totalPages)
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
      EARLY_WITHDRAWAL_FEE: Activity,
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
      EARLY_WITHDRAWAL_FEE: 'text-cgp-red',
    }
    return colors[type] || 'text-cgp-text'
  }

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'text-cgp-green bg-cgp-green/10',
      PENDING: 'text-cgp-gold bg-cgp-gold/10',
      PROCESSING: 'text-cgp-blue bg-cgp-blue/10',
      FAILED: 'text-cgp-red bg-cgp-red/10',
      CANCELLED: 'text-cgp-text bg-white/5',
    }
    return colors[status] || 'text-cgp-text bg-white/5'
  }

  const getAmountPrefix = (type) => {
    return type === 'WITHDRAWAL' || type === 'INVESTMENT' || type === 'EARLY_WITHDRAWAL_FEE' ? '-' : '+'
  }

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return '0.00'
    const num = Number(value)
    if (isNaN(num)) return '0.00'
    return num.toFixed(decimals)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'User', 'Amount', 'Currency', 'Crypto', 'Status', 'Description', 'Date']
    const rows = transactions.map(tx => {
      const cryptoAmount = tx.cryptoAmount ? formatNumber(tx.cryptoAmount, 8) : '-'
      const cryptoDisplay = tx.cryptoCurrency ? `${cryptoAmount} ${tx.cryptoCurrency}` : '-'
      
      return [
        tx.id,
        tx.type,
        `${tx.user?.firstName || ''} ${tx.user?.lastName || ''} (${tx.user?.email || ''})`,
        tx.amount,
        tx.currency,
        cryptoDisplay,
        tx.status,
        tx.description || '-',
        new Date(tx.createdAt).toLocaleString(),
      ]
    })

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Transactions exported!')
  }

  const viewDetail = (tx) => {
    setSelectedTx(tx)
    setShowDetailModal(true)
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
        <h1 className="text-2xl font-bold">All Transactions</h1>
        <p className="text-cgp-text">View and manage all platform transactions</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Deposits', value: `$${formatNumber(stats.deposits?.total || 0, 0)}`, color: 'text-cgp-green' },
            { label: 'Total Withdrawals', value: `$${formatNumber(stats.withdrawals?.total || 0, 0)}`, color: 'text-cgp-red' },
            { label: 'Today Deposits', value: `$${formatNumber(stats.deposits?.today || 0, 0)}`, color: 'text-cgp-green' },
            { label: 'Today Withdrawals', value: `$${formatNumber(stats.withdrawals?.today || 0, 0)}`, color: 'text-cgp-red' },
            { label: 'Referral Earnings', value: `$${formatNumber(stats.referralEarnings || 0, 0)}`, color: 'text-cgp-gold' },
          ].map((stat, i) => (
            <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-4">
              <p className="text-xs text-cgp-text mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Export */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="INVESTMENT">Investments</option>
            <option value="PROFIT">Profits</option>
            <option value="REFERRAL_BONUS">Referral Bonuses</option>
            <option value="ADMIN_ADJUSTMENT">Admin Adjustments</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            type="text"
            value={filter.userId}
            onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value }))}
            placeholder="User ID"
            className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white placeholder-cgp-text focus:border-cgp-gold w-40"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white hover:bg-white/5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Crypto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const TxIcon = getTypeIcon(tx.type)
                  const cryptoDisplay = tx.cryptoCurrency && tx.cryptoAmount 
                    ? `${formatNumber(tx.cryptoAmount, 8)} ${tx.cryptoCurrency}`
                    : '-'
                  
                  return (
                    <tr key={tx.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <TxIcon className={`w-4 h-4 ${getTypeColor(tx.type)}`} />
                          </div>
                          <span className="font-medium">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{tx.user?.firstName} {tx.user?.lastName}</p>
                        <p className="text-xs text-cgp-text">{tx.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${getTypeColor(tx.type)}`}>
                          {getAmountPrefix(tx.type)}${formatNumber(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cgp-text">
                        {cryptoDisplay}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cgp-text max-w-[200px] truncate">
                        {tx.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-cgp-text whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewDetail(tx)}
                          className="text-xs text-cgp-gold hover:text-cgp-gold-light font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-cgp-text">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cgp-border">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-cgp-border hover:bg-white/5 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-cgp-text">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-cgp-border hover:bg-white/5 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Transaction Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Transaction ID</p>
                  <p className="font-mono text-xs">{selectedTx.id}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Type</p>
                  <p className="font-medium">{selectedTx.type}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Amount</p>
                  <p className={`font-medium ${getTypeColor(selectedTx.type)}`}>
                    {getAmountPrefix(selectedTx.type)}${formatNumber(selectedTx.amount)}
                  </p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTx.status)}`}>
                    {selectedTx.status}
                  </span>
                </div>
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">User</p>
                  <p className="font-medium">{selectedTx.user?.firstName} {selectedTx.user?.lastName}</p>
                  <p className="text-xs text-cgp-text">{selectedTx.user?.email}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Date</p>
                  <p className="font-medium">{new Date(selectedTx.createdAt).toLocaleString()}</p>
                </div>
                {selectedTx.cryptoCurrency && selectedTx.cryptoAmount && (
                  <>
                    <div className="bg-cgp-dark rounded-xl p-3">
                      <p className="text-xs text-cgp-text mb-1">Crypto Amount</p>
                      <p className="font-medium">{formatNumber(selectedTx.cryptoAmount, 8)} {selectedTx.cryptoCurrency}</p>
                    </div>
                    <div className="bg-cgp-dark rounded-xl p-3">
                      <p className="text-xs text-cgp-text mb-1">Currency</p>
                      <p className="font-medium">{selectedTx.currency}</p>
                    </div>
                  </>
                )}
              </div>
              {selectedTx.description && (
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Description</p>
                  <p className="text-sm">{selectedTx.description}</p>
                </div>
              )}
              {selectedTx.metadata && (
                <div className="bg-cgp-dark rounded-xl p-3">
                  <p className="text-xs text-cgp-text mb-1">Additional Data</p>
                  <pre className="text-xs text-cgp-text overflow-x-auto">
                    {JSON.stringify(selectedTx.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}