import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  Calendar,
  ChevronRight,
  Play,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminInvestments() {
  const [investments, setInvestments] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', planId: '', userId: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [processingProfits, setProcessingProfits] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter, page])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.planId) params.append('planId', filter.planId)
      if (filter.userId) params.append('userId', filter.userId)
      params.append('page', page)
      params.append('limit', 20)

      const [invRes, plansRes] = await Promise.all([
        api.get(`/investments/all?${params}`),
        api.get('/investments/plans'),
      ])

      setInvestments(invRes.data.data.investments)
      setTotalPages(invRes.data.data.pagination.totalPages)
      setPlans(plansRes.data.data)
    } catch (err) {
      toast.error('Failed to load investments')
    } finally {
      setLoading(false)
    }
  }

  const processDailyProfits = async () => {
    setProcessingProfits(true)
    try {
      const res = await api.post('/investments/process-profits')
      toast.success(`Processed ${res.data.data.processedCount || 0} investments`)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process profits')
    } finally {
      setProcessingProfits(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'text-cgp-green bg-cgp-green/10',
      COMPLETED: 'text-cgp-blue bg-cgp-blue/10',
      CANCELLED: 'text-cgp-red bg-cgp-red/10',
      EARLY_WITHDRAWN: 'text-cgp-gold bg-cgp-gold/10',
    }
    return colors[status] || 'text-cgp-text bg-white/5'
  }

  const calculateProgress = (inv) => {
    if (inv.status === 'COMPLETED') return 100
    const start = new Date(inv.startDate)
    const end = new Date(inv.endDate)
    const now = new Date()
    const total = end - start
    const elapsed = now - start
    return Math.min(100, Math.round((elapsed / total) * 100))
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-cgp-text">Manage all platform investments</p>
        </div>
        <button
          onClick={processDailyProfits}
          disabled={processingProfits}
          className="px-4 py-2.5 bg-cgp-gold text-cgp-dark text-sm font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {processingProfits ? 'Processing...' : 'Run Daily Profits'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EARLY_WITHDRAWN">Early Withdrawn</option>
        </select>
        <select
          value={filter.planId}
          onChange={(e) => setFilter(prev => ({ ...prev, planId: e.target.value }))}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Plans</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Investments',
            value: investments.length,
            icon: TrendingUp,
            color: 'text-cgp-blue',
            bg: 'bg-cgp-blue/10',
          },
          {
            label: 'Active',
            value: investments.filter(i => i.status === 'ACTIVE').length,
            icon: CheckCircle2,
            color: 'text-cgp-green',
            bg: 'bg-cgp-green/10',
          },
          {
            label: 'Completed',
            value: investments.filter(i => i.status === 'COMPLETED').length,
            icon: CheckCircle2,
            color: 'text-cgp-gold',
            bg: 'bg-cgp-gold/10',
          },
          {
            label: 'Total Value',
            value: `$${investments.reduce((sum, i) => sum + parseFloat(i.amount), 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-cgp-text mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Investments Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Daily Profit</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {investments.length > 0 ? (
                investments.map((inv) => {
                  const progress = calculateProgress(inv)
                  return (
                    <tr key={inv.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{inv.user?.firstName} {inv.user?.lastName}</p>
                        <p className="text-xs text-cgp-text">{inv.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{inv.plan?.name}</span>
                        <p className="text-xs text-cgp-text">{inv.plan?.dailyRoi}% daily</p>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ${parseFloat(inv.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-cgp-green">
                        +${parseFloat(inv.dailyProfit).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-cgp-border rounded-full">
                            <div
                              className="h-full bg-cgp-gold rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-cgp-text">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cgp-text">
                        {new Date(inv.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-cgp-text">
                        {new Date(inv.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-cgp-text">
                    No investments found
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
              className="px-3 py-1.5 text-sm rounded-lg border border-cgp-border hover:bg-white/5 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-cgp-text">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-cgp-border hover:bg-white/5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}