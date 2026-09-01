import { useState, useEffect } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'PENDING' })
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    fetchWithdrawals()
  }, [filter])

  const fetchWithdrawals = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      const res = await api.get(`/withdrawals/all?${params}`)
      setWithdrawals(res.data.data.withdrawals)
    } catch (err) {
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const processWithdrawal = async (withdrawalId) => {
    try {
      await api.post(`/withdrawals/${withdrawalId}/process`, { txHash })
      toast.success('Withdrawal processed')
      setSelectedWithdrawal(null)
      setTxHash('')
      fetchWithdrawals()
    } catch (err) {
      toast.error('Failed to process withdrawal')
    }
  }

  const rejectWithdrawal = async (withdrawalId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await api.post(`/withdrawals/${withdrawalId}/reject`, { reason })
      toast.success('Withdrawal rejected')
      fetchWithdrawals()
    } catch (err) {
      toast.error('Failed to reject withdrawal')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      COMPLETED: 'text-cgp-green bg-cgp-green/10',
      PENDING: 'text-cgp-gold bg-cgp-gold/10',
      PROCESSING: 'text-cgp-blue bg-cgp-blue/10',
      REJECTED: 'text-cgp-red bg-cgp-red/10',
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Withdrawal Management</h1>
        <p className="text-cgp-text">Process and manage user withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: withdrawals.filter(w => w.status === 'PENDING').length, color: 'text-cgp-gold' },
          { label: 'Processing', value: withdrawals.filter(w => w.status === 'PROCESSING').length, color: 'text-cgp-blue' },
          { label: 'Completed', value: withdrawals.filter(w => w.status === 'COMPLETED').length, color: 'text-cgp-green' },
          { label: 'Rejected', value: withdrawals.filter(w => w.status === 'REJECTED').length, color: 'text-cgp-red' },
        ].map((stat, i) => (
          <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-cgp-text">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Crypto</th>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {withdrawals.map((w) => (
                <tr key={w.id} className="text-sm hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{w.user?.firstName} {w.user?.lastName}</p>
                    <p className="text-xs text-cgp-text">{w.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">${parseFloat(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-cgp-text">Fee: ${parseFloat(w.fee || 0).toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{parseFloat(w.cryptoAmount || 0).toFixed(8)}</p>
                    <p className="text-xs text-cgp-text">{w.cryptoCurrency}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-cgp-dark">{w.network}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cgp-text">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedWithdrawal(w)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-blue"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {w.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setSelectedWithdrawal(w)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-green"
                            title="Process"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(w.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-red"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-cgp-text">
                    No withdrawals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Withdrawal Details</h2>
              <button
                onClick={() => { setSelectedWithdrawal(null); setTxHash('') }}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">User</span>
                <span>{selectedWithdrawal.user?.firstName} {selectedWithdrawal.user?.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Amount</span>
                <span className="font-medium">${parseFloat(selectedWithdrawal.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Fee</span>
                <span>${parseFloat(selectedWithdrawal.fee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Net Amount</span>
                <span className="font-medium text-cgp-green">
                  ${(parseFloat(selectedWithdrawal.amount) - parseFloat(selectedWithdrawal.fee || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Crypto</span>
                <span>{parseFloat(selectedWithdrawal.cryptoAmount || 0).toFixed(8)} {selectedWithdrawal.cryptoCurrency}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Wallet Address</span>
                <span className="font-mono text-xs">{selectedWithdrawal.walletAddress}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Network</span>
                <span>{selectedWithdrawal.network}</span>
              </div>
            </div>

            {selectedWithdrawal.status === 'PENDING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Transaction Hash (Optional)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                    placeholder="Enter blockchain transaction hash"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedWithdrawal(null); setTxHash('') }}
                    className="flex-1 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => processWithdrawal(selectedWithdrawal.id)}
                    className="flex-1 py-3 bg-cgp-green text-white font-semibold rounded-xl hover:bg-cgp-green/80"
                  >
                    Process Withdrawal
                  </button>
                </div>
              </div>
            )}

            {selectedWithdrawal.status === 'COMPLETED' && selectedWithdrawal.txHash && (
              <div className="bg-cgp-dark rounded-xl p-4">
                <p className="text-xs text-cgp-text mb-1">Transaction Hash</p>
                <p className="font-mono text-sm break-all">{selectedWithdrawal.txHash}</p>
              </div>
            )}

            {selectedWithdrawal.status === 'REJECTED' && selectedWithdrawal.rejectionReason && (
              <div className="bg-cgp-red/10 border border-cgp-red/20 rounded-xl p-4">
                <p className="text-xs text-cgp-red mb-1">Rejection Reason</p>
                <p className="text-sm">{selectedWithdrawal.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}