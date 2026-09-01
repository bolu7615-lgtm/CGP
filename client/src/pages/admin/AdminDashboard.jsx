import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Shield,
  DollarSign,
  Activity,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Wallet,
  Eye,
  Ban,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts'
import api from '../../lib/api'
import toast from 'react-hot-toast'

// ─── STAT CARD ────────────────────────────────────────────────────
function StatCard({ title, value, subtext, icon: Icon, color, link, alert }) {
  const colors = {
    blue:   { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/15',   glow: 'hover:border-blue-400/30' },
    green:  { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/15', glow: 'hover:border-emerald-400/30' },
    red:    { text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/15',     glow: 'hover:border-red-400/30' },
    gold:   { text: 'text-[#F5A623]',   bg: 'bg-[#F5A623]/10',   border: 'border-[#F5A623]/15',   glow: 'hover:border-[#F5A623]/40' },
    purple: { text: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/15',  glow: 'hover:border-purple-400/30' },
    slate:  { text: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/15',   glow: 'hover:border-slate-400/30' },
  }
  const c = colors[color] || colors.slate

  return (
    <Link
      to={link}
      className={`group bg-[#111827] border ${c.border} rounded-2xl p-5 ${c.glow} transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden`}
    >
      {alert && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {subtext && (
        <p className={`text-xs mt-2 font-medium ${c.text}`}>{subtext}</p>
      )}
    </Link>
  )
}

// ─── ACTIVITY ROW ─────────────────────────────────────────────────
function ActivityRow({ icon: Icon, text, time, status, amount }) {
  const statusColors = {
    completed: 'text-emerald-400 bg-emerald-400/10',
    pending: 'text-[#F5A623] bg-[#F5A623]/10',
    failed: 'text-red-400 bg-red-400/10',
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-[#0a0e1a] rounded-xl border border-[#1f2937]/50 hover:border-[#F5A623]/15 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{text}</p>
          <p className="text-[10px] text-slate-600">{time}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        {amount && <p className="text-sm font-semibold text-white">{amount}</p>}
        {status && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[status] || statusColors.pending}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [userGrowth, setUserGrowth] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAllData = async (showToast = false) => {
    setRefreshing(true)
    try {
      const [statsRes, weeklyRes, growthRes, activityRes] = await Promise.allSettled([
        api.get('/transactions/platform-stats'),
        api.get('/admin/weekly-stats'),
        api.get('/admin/user-growth'),
        api.get('/admin/recent-activity'),
      ])

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data)
      }
      if (weeklyRes.status === 'fulfilled') {
        setWeeklyData(weeklyRes.value.data.data || [])
      }
      if (growthRes.status === 'fulfilled') {
        setUserGrowth(growthRes.value.data.data || [])
      }
      if (activityRes.status === 'fulfilled') {
        setRecentActivity(activityRes.value.data.data || [])
      }

      if (showToast) toast.success('Dashboard refreshed')
    } catch (err) {
      console.error('Admin dashboard error:', err)
      if (showToast) toast.error('Failed to refresh')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchAllData(), 60000)
    return () => clearInterval(interval)
  }, [])

  const formatMoney = (val) => {
    const n = parseFloat(val) || 0
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
    return `$${n.toLocaleString()}`
  }

  const statCards = [
    {
      title: 'Total Users',
      value: (stats?.users?.total || 0).toLocaleString(),
      subtext: `+${stats?.users?.todayRegistrations || 0} registered today`,
      icon: Users,
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: 'Pending Deposits',
      value: stats?.deposits?.pending || 0,
      subtext: `${formatMoney(stats?.deposits?.pendingAmount || 0)} awaiting confirmation`,
      icon: ArrowDownLeft,
      color: 'gold',
      link: '/admin/deposits',
      alert: (stats?.deposits?.pending || 0) > 0,
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.withdrawals?.pending || 0,
      subtext: `${formatMoney(stats?.withdrawals?.pendingAmount || 0)} requested`,
      icon: ArrowUpRight,
      color: 'red',
      link: '/admin/withdrawals',
      alert: (stats?.withdrawals?.pending || 0) > 0,
    },
    {
      title: 'Pending KYC',
      value: stats?.kyc?.pending || 0,
      subtext: 'Documents awaiting review',
      icon: Shield,
      color: 'gold',
      link: '/admin/kyc',
      alert: (stats?.kyc?.pending || 0) > 0,
    },
    {
      title: 'Active Investments',
      value: (stats?.investments?.active || 0).toLocaleString(),
      subtext: `${stats?.investments?.today || 0} new today`,
      icon: TrendingUp,
      color: 'purple',
      link: '/admin/investments',
    },
    {
      title: 'Total Deposited',
      value: formatMoney(stats?.deposits?.total || 0),
      subtext: 'All-time platform deposits',
      icon: DollarSign,
      color: 'green',
      link: '/admin/transactions',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F5A623]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform overview and real-time analytics</p>
        </div>
        <button
          onClick={() => fetchAllData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-[#1f2937] rounded-xl text-sm text-slate-400 hover:text-white hover:border-[#F5A623]/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weekly Deposits vs Withdrawals */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F5A623]" />
              <h2 className="font-bold text-white text-sm">Weekly Deposits vs Withdrawals</h2>
            </div>
            <span className="text-xs text-slate-600">Last 7 days</span>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="deposits" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center text-slate-600 gap-2">
              <BarChart3 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No weekly data available</p>
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-white text-sm">User Growth</h2>
            </div>
            <span className="text-xs text-slate-600">Last 30 days</span>
          </div>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '10px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fill="url(#userGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center text-slate-600 gap-2">
              <Users className="w-8 h-8 opacity-30" />
              <p className="text-sm">No growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white text-sm">Recent Activity</h2>
            </div>
            <Link to="/admin/transactions" className="text-xs text-[#F5A623] hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((act, i) => (
                <ActivityRow key={i} {...act} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-600">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <h2 className="font-bold text-white text-sm mb-5">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { label: 'Review KYC Documents', link: '/admin/kyc', icon: Shield, count: stats?.kyc?.pending || 0, color: 'text-[#F5A623] bg-[#F5A623]/10 hover:bg-[#F5A623]/20' },
              { label: 'Process Deposits', link: '/admin/deposits', icon: ArrowDownLeft, count: stats?.deposits?.pending || 0, color: 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' },
              { label: 'Process Withdrawals', link: '/admin/withdrawals', icon: ArrowUpRight, count: stats?.withdrawals?.pending || 0, color: 'text-red-400 bg-red-400/10 hover:bg-red-400/20' },
              { label: 'Manage Users', link: '/admin/users', icon: Users, count: null, color: 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' },
              { label: 'View Investments', link: '/admin/investments', icon: TrendingUp, count: null, color: 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' },
              { label: 'Platform Settings', link: '/admin/settings', icon: Wallet, count: null, color: 'text-slate-400 bg-slate-400/10 hover:bg-slate-400/20' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.link}
                className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${action.color}`}
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
                {action.count > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-black/30 rounded-full">
                    {action.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}