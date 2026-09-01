import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  DollarSign,
  Shield,
  Eye,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ kycStatus: '', role: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [balanceData, setBalanceData] = useState({ amount: '', type: 'ADD', reason: '' })

  useEffect(() => {
    fetchUsers()
  }, [search, filter, page])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filter.kycStatus) params.append('kycStatus', filter.kycStatus)
      if (filter.role) params.append('role', filter.role)
      params.append('page', page)
      params.append('limit', 20)

      const res = await api.get(`/admin/users?${params}`)
      setUsers(res.data.data.users)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleBan = async (userId, isBanned) => {
    try {
      await api.put(`/admin/users/${userId}`, { isBanned: !isBanned })
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`)
      fetchUsers()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const adjustBalance = async () => {
    if (!balanceData.amount || !balanceData.reason) {
      toast.error('Amount and reason required')
      return
    }

    try {
      await api.post(`/admin/users/${selectedUser.id}/balance`, balanceData)
      toast.success('Balance adjusted successfully')
      setShowBalanceModal(false)
      setBalanceData({ amount: '', type: 'ADD', reason: '' })
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust balance')
    }
  }

  const getKycBadge = (status) => {
    const colors = {
      APPROVED: 'text-cgp-green bg-cgp-green/10',
      SUBMITTED: 'text-cgp-gold bg-cgp-gold/10',
      REJECTED: 'text-cgp-red bg-cgp-red/10',
      PENDING: 'text-cgp-text bg-white/5',
    }
    return colors[status] || colors.PENDING
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-cgp-text">Manage platform users and their accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cgp-text" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white placeholder-cgp-text focus:border-cgp-gold"
          />
        </div>
        <select
          value={filter.kycStatus}
          onChange={(e) => setFilter(prev => ({ ...prev, kycStatus: e.target.value }))}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All KYC</option>
          <option value="APPROVED">Approved</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="REJECTED">Rejected</option>
          <option value="PENDING">Pending</option>
        </select>
        <select
          value={filter.role}
          onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {users.map((user) => (
                <tr key={user.id} className="text-sm hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-cgp-text">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">${parseFloat(user.wallet?.totalBalance || 0).toLocaleString()}</p>
                    <p className="text-xs text-cgp-text">Avail: ${parseFloat(user.wallet?.availableBalance || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getKycBadge(user.kycStatus)}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'SUPER_ADMIN' ? 'text-purple-400 bg-purple-400/10' :
                      user.role === 'ADMIN' ? 'text-cgp-blue bg-cgp-blue/10' :
                      'text-cgp-text bg-white/5'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="text-xs px-2 py-1 rounded-full text-cgp-red bg-cgp-red/10">Banned</span>
                    ) : user.isActive ? (
                      <span className="text-xs px-2 py-1 rounded-full text-cgp-green bg-cgp-green/10">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full text-cgp-text bg-white/5">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cgp-text">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedUser(user); setShowBalanceModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-gold"
                        title="Adjust Balance"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBan(user.id, user.isBanned)}
                        className={`p-1.5 rounded-lg hover:bg-white/5 ${user.isBanned ? 'text-cgp-green' : 'text-cgp-red'}`}
                        title={user.isBanned ? 'Unban' : 'Ban'}
                      >
                        {user.isBanned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Adjust Balance</h2>
            <p className="text-sm text-cgp-text mb-6">
              {selectedUser.firstName} {selectedUser.lastName} — Current: ${parseFloat(selectedUser.wallet?.totalBalance || 0).toLocaleString()}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select
                  value={balanceData.type}
                  onChange={(e) => setBalanceData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                >
                  <option value="ADD">Add Credit</option>
                  <option value="SUBTRACT">Deduct</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={balanceData.amount}
                  onChange={(e) => setBalanceData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <input
                  type="text"
                  value={balanceData.reason}
                  onChange={(e) => setBalanceData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={adjustBalance}
                  className="flex-1 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}