import { useState, useEffect } from 'react'
import {
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'PENDING' })
  const [selectedDeposit, setSelectedDeposit] = useState(null)

  useEffect(() => {
    fetchDeposits()
  }, [filter])

  const fetchDeposits = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      const res = await api.get(`/deposits/all?${params}`)
      setDeposits(res.data.data.deposits)
    } catch (err) {
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  const confirmDeposit = async (depositId) => {
    try {
      await api.post(`/deposits/${depositId}/confirm`)
      toast.success('Deposit confirmed')
      fetchDeposits()
    } catch (err) {
      toast.error('Failed to confirm deposit')
    }
  }

  const rejectDeposit = async (depositId) => {
    try {
      await api.post(`/deposits/${depositId}/reject`)
      toast.success('Deposit rejected')
      fetchDeposits()
    } catch (err) {
      toast.error('Failed to reject deposit')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      COMPLETED: 'text-cgp-green bg-cgp-green/10',
      PENDING: 'text-cgp-gold bg-cgp-gold/10',
      CONFIRMING: 'text-cgp-blue bg-cgp-blue/10',
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Deposit Management</h1>
        <p className="text-cgp-text">Review and confirm user deposits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: deposits.filter(d => d.status === 'PENDING').length, color: 'text-cgp-gold' },
          { label: 'Confirming', value: deposits.filter(d => d.status === 'CONFIRMING').length, color: 'text-cgp-blue' },
          { label: 'Completed', value: deposits.filter(d => d.status === 'COMPLETED').length, color: 'text-cgp-green' },
          { label: 'Failed', value: deposits.filter(d => d.status === 'FAILED').length, color: 'text-cgp-red' },
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
          <option value="CONFIRMING">Confirming</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Crypto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="text-sm hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{deposit.user?.firstName} {deposit.user?.lastName}</p>
                    <p className="text-xs text-cgp-text">{deposit.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">${parseFloat(deposit.amount || 0).toFixed(2)}</p>
                    <p className="text-xs text-cgp-text">{parseFloat(deposit.cryptoAmount || 0).toFixed(8)} {deposit.cryptoCurrency}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-cgp-dark">{deposit.cryptoCurrency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(deposit.status)}`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cgp-text">
                    {new Date(deposit.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDeposit(deposit)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-blue"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {deposit.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => confirmDeposit(deposit.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-green"
                            title="Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectDeposit(deposit.id)}
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
              {deposits.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-cgp-text">
                    No deposits found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Deposit Details</h2>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Deposit ID</span>
                <span className="font-mono text-sm">{selectedDeposit.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">User</span>
                <span>{selectedDeposit.user?.firstName} {selectedDeposit.user?.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Amount (USD)</span>
                <span className="font-medium">${parseFloat(selectedDeposit.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Crypto Amount</span>
                <span>{parseFloat(selectedDeposit.cryptoAmount || 0).toFixed(8)} {selectedDeposit.cryptoCurrency}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Wallet Address</span>
                <span className="font-mono text-xs">{selectedDeposit.walletAddress}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedDeposit.status)}`}>
                  {selectedDeposit.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-cgp-border">
                <span className="text-cgp-text">Created</span>
                <span>{new Date(selectedDeposit.createdAt).toLocaleString()}</span>
              </div>
              {selectedDeposit.proofImage && (
                <div className="pt-2">
                  <p className="text-sm text-cgp-text mb-2">Payment Proof</p>
                  <img
                    src={selectedDeposit.proofImage}
                    alt="Proof"
                    className="w-full h-48 object-contain rounded-lg bg-cgp-dark"
                  />
                </div>
              )}
            </div>

            {selectedDeposit.status === 'PENDING' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { confirmDeposit(selectedDeposit.id); setSelectedDeposit(null) }}
                  className="flex-1 py-3 bg-cgp-green text-white font-semibold rounded-xl hover:bg-cgp-green/80"
                >
                  Confirm Deposit
                </button>
                <button
                  onClick={() => { rejectDeposit(selectedDeposit.id); setSelectedDeposit(null) }}
                  className="flex-1 py-3 bg-cgp-red text-white font-semibold rounded-xl hover:bg-cgp-red/80"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}