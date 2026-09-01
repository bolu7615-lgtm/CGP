import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Activity,
  ChevronRight,
  Bitcoin,
  Zap,
  Clock,
  BarChart3,
  RefreshCw,
  TrendingDown,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ─── BITCOIN CANDLESTICK CHART ────────────────────────────────────
function BitcoinChart() {
  const [ohlcData, setOhlcData] = useState([])
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7')
  const [error, setError] = useState(false)

  const fetchData = async (days) => {
    setLoading(true)
    setError(false)
    try {
          const [ohlcRes, priceRes] = await Promise.all([
      api.get(`/btc/ohlc?days=${days}`),
      api.get('/btc/price'),
    ])

      if (ohlcRes.data.success) {
        setOhlcData(ohlcRes.data.data)
      }
      if (priceRes.data.success) {
        setPriceData(priceRes.data.data)
      }
    } catch (err) {
      console.error('BTC fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(timeRange)
    const interval = setInterval(() => fetchData(timeRange), 60000)
    return () => clearInterval(interval)
  }, [timeRange])

  const formatPrice = (price) => {
    if (!price) return '--'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const formatLarge = (num) => {
    if (!num) return '--'
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toFixed(0)}`
  }

  const isPositive = (priceData?.change24h || 0) >= 0
  const currentPrice = priceData?.price || 0

  // Chart calculations
  const chartHeight = 260
  const plotHeight = chartHeight - 40

  const allPrices = ohlcData.length > 0 
    ? ohlcData.flatMap(d => [d.high, d.low]) 
    : [60000, 70000]
  const minPrice = Math.min(...allPrices) * 0.995
  const maxPrice = Math.max(...allPrices) * 1.005
  const priceRange = maxPrice - minPrice || 1

  const scaleY = (price) => ((maxPrice - price) / priceRange) * plotHeight

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white">Bitcoin</h2>
              <span className="text-xs text-slate-500">BTC/USD</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-white">{formatPrice(currentPrice)}</span>
              {priceData?.change24h !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(priceData.change24h).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[{ k: '1', l: '1D' }, { k: '7', l: '7D' }, { k: '30', l: '1M' }, { k: '90', l: '3M' }].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setTimeRange(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === k
                  ? 'bg-[#F5A623] text-[#0a0e1a]'
                  : 'bg-[#0a0e1a] text-slate-500 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => fetchData(timeRange)}
            className="p-1.5 rounded-lg bg-[#0a0e1a] text-slate-500 hover:text-white transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Candlestick Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        {loading && ohlcData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Bitcoin className="w-8 h-8 opacity-30" />
            <p className="text-sm">Chart data unavailable</p>
            <button 
              onClick={() => fetchData(timeRange)}
              className="text-xs text-[#F5A623] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Y-axis */}
            <div className="absolute right-0 top-0 bottom-[30px] w-[50px] flex flex-col justify-between text-[10px] text-slate-600 text-right pr-1">
              <span>{formatPrice(maxPrice)}</span>
              <span>{formatPrice(minPrice + priceRange * 0.5)}</span>
              <span>{formatPrice(minPrice)}</span>
            </div>

            {/* Grid */}
            <div className="absolute left-0 right-[55px] top-0 bottom-[30px]">
              {[0, 0.5, 1].map((pct, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-[#1f2937]/50" style={{ top: `${pct * 100}%` }} />
              ))}
            </div>

            {/* Candles SVG */}
            <svg className="absolute left-0 right-[55px] top-0 bottom-[30px] w-full h-full">
              {ohlcData.map((c, i) => {
                const isGreen = c.close >= c.open
                const color = isGreen ? '#22C55E' : '#EF4444'
                const x = (i / (ohlcData.length - 1 || 1)) * 100
                const candleW = Math.max(1.5, 90 / ohlcData.length)

                const yHigh = scaleY(c.high)
                const yLow = scaleY(c.low)
                const yOpen = scaleY(c.open)
                const yClose = scaleY(c.close)
                const bodyTop = Math.min(yOpen, yClose)
                const bodyH = Math.max(1, Math.abs(yClose - yOpen))

                return (
                  <g key={i}>
                    <line x1={`${x}%`} y1={yHigh} x2={`${x}%`} y2={yLow} stroke={color} strokeWidth={0.5} />
                    <rect 
                      x={`${x - candleW / 2}%`} 
                      y={bodyTop} 
                      width={`${candleW}%`} 
                      height={bodyH} 
                      fill={color} 
                      rx={0.5}
                    />
                  </g>
                )
              })}
            </svg>

            {/* X-axis */}
            <div className="absolute left-0 right-[55px] bottom-0 h-[30px] flex items-end justify-between text-[10px] text-slate-600 px-1">
              {ohlcData.filter((_, i) => i % Math.max(1, Math.floor(ohlcData.length / 5)) === 0).map((c, i) => (
                <span key={i} className="truncate max-w-[50px]">{c.time}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1f2937]">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">24h High</p>
          <p className="text-sm font-semibold text-emerald-400">{formatPrice(priceData?.high24h)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">24h Low</p>
          <p className="text-sm font-semibold text-red-400">{formatPrice(priceData?.low24h)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">24h Volume</p>
          <p className="text-sm font-semibold text-white">{formatLarge(priceData?.volume24h)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Market Cap</p>
          <p className="text-sm font-semibold text-white">{formatLarge(priceData?.marketCap)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── STAT CARD COMPONENT ──────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, link }) {
  const colorMap = {
    gold: { text: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10', border: 'border-[#F5A623]/15', hover: 'hover:border-[#F5A623]/40' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/15', hover: 'hover:border-blue-400/40' },
    green: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/15', hover: 'hover:border-emerald-400/40' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/15', hover: 'hover:border-purple-400/40' },
  }
  const c = colorMap[color] || colorMap.gold

  return (
    <Link
      to={link}
      className={`group bg-[#111827] border ${c.border} rounded-2xl p-5 ${c.hover} transition-all duration-300 hover:translate-y-[-2px]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </Link>
  )
}

// ─── INVESTMENT ROW ───────────────────────────────────────────────
function InvestmentRow({ inv }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-[#0a0e1a] rounded-xl border border-[#1f2937]/50 hover:border-[#F5A623]/20 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#F5A623]/10 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[#F5A623]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{inv.plan?.name || 'Investment'}</p>
          <p className="text-xs text-slate-500">${parseFloat(inv.amount).toLocaleString()}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-sm font-semibold text-emerald-400">+${parseFloat(inv.dailyProfit).toFixed(2)}/d</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-16 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F5A623] to-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(inv.progress || 0, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500">{inv.progress || 0}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── TRANSACTION ROW ──────────────────────────────────────────────
function TransactionRow({ tx }) {
  const icons = {
    DEPOSIT: ArrowDownLeft,
    WITHDRAWAL: ArrowUpRight,
    INVESTMENT: TrendingUp,
    PROFIT: DollarSign,
    REFERRAL_BONUS: Users,
  }
  const colors = {
    DEPOSIT: 'text-emerald-400',
    WITHDRAWAL: 'text-red-400',
    INVESTMENT: 'text-blue-400',
    PROFIT: 'text-[#F5A623]',
    REFERRAL_BONUS: 'text-purple-400',
  }
  const TxIcon = icons[tx.type] || Activity
  const isOut = tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT'

  return (
    <div className="flex items-center justify-between p-3.5 bg-[#0a0e1a] rounded-xl border border-[#1f2937]/50 hover:border-[#F5A623]/20 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <TxIcon className={`w-4 h-4 ${colors[tx.type] || 'text-slate-500'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{tx.type.replace(/_/g, ' ')}</p>
          <p className="text-[10px] text-slate-500">
            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className={`text-sm font-bold ${isOut ? 'text-red-400' : 'text-emerald-400'}`}>
          {isOut ? '-' : '+'}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          tx.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-400/10' :
          tx.status === 'PENDING' ? 'text-[#F5A623] bg-[#F5A623]/10' :
          tx.status === 'PROCESSING' ? 'text-blue-400 bg-blue-400/10' :
          'text-red-400 bg-red-400/10'
        }`}>
          {tx.status}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [investments, setInvestments] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wRes, tRes, iRes] = await Promise.allSettled([
        api.get('/wallet'),
        api.get('/wallet/transactions?limit=5'),
        api.get('/investments/my?status=ACTIVE&limit=5'),
      ])

      if (wRes.status === 'fulfilled') setWallet(wRes.value.data.data?.wallet)
      if (tRes.status === 'fulfilled') setTransactions(tRes.value.data.data?.transactions || [])
      if (iRes.status === 'fulfilled') {
        const invs = iRes.value.data.data?.investments || []
        setInvestments(invs)

        const groups = invs.reduce((acc, inv) => {
          const name = inv.plan?.name || 'Other'
          acc[name] = (acc[name] || 0) + (parseFloat(inv.amount) || 0)
          return acc
        }, {})

        const colors = ['#F5A623', '#3B82F6', '#22C55E', '#A855F7', '#EF4444']
        setPortfolio(Object.entries(groups).map(([name, value], i) => ({
          name, value, color: colors[i % colors.length]
        })))
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v) => {
    const n = parseFloat(v) || 0
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F5A623]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            Here&apos;s your portfolio overview
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/investments"
            className="px-5 py-2.5 bg-[#F5A623] text-[#0a0e1a] font-semibold rounded-xl hover:bg-amber-500 transition-colors text-sm flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            Invest
          </Link>
          <Link
            to="/wallet"
            className="px-5 py-2.5 border border-[#1f2937] text-white font-medium rounded-xl hover:border-[#F5A623]/30 transition-colors text-sm flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Deposit
          </Link>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={fmt(wallet?.totalBalance)} icon={Wallet} color="gold" link="/wallet" />
        <StatCard title="Total Invested" value={fmt(wallet?.investedBalance)} icon={TrendingUp} color="blue" link="/investments" />
        <StatCard title="Total Earnings" value={fmt(wallet?.totalEarnings)} icon={DollarSign} color="green" link="/transactions" />
        <StatCard title="Active Investments" value={investments.length} icon={Activity} color="purple" link="/investments" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <BitcoinChart />
        </div>

        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F5A623]" />
              <h2 className="font-bold text-white">Portfolio</h2>
            </div>
            <Link to="/investments" className="text-xs text-[#F5A623] hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {portfolio.length > 0 ? (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {portfolio.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '10px',
                        padding: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 mt-2">
                {portfolio.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400 text-xs">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white text-xs">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-500 gap-3">
              <BarChart3 className="w-10 h-10 opacity-20" />
              <p className="text-sm">No active investments</p>
              <Link
                to="/investments"
                className="px-4 py-2 bg-[#F5A623] text-[#0a0e1a] text-xs font-semibold rounded-xl hover:bg-amber-500 transition-colors"
              >
                Start Investing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── INVESTMENTS & TRANSACTIONS ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Active Investments */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-white">Active Investments</h2>
            </div>
            <Link to="/investments" className="text-xs text-[#F5A623] hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {investments.length > 0 ? (
            <div className="space-y-2.5">
              {investments.map((inv) => (
                <InvestmentRow key={inv.id} inv={inv} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-[#0a0e1a] flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm mb-3">No active investments yet</p>
              <Link
                to="/investments"
                className="px-5 py-2.5 bg-[#F5A623] text-[#0a0e1a] text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Start Investing
              </Link>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white">Recent Transactions</h2>
            </div>
            <Link to="/transactions" className="text-xs text-[#F5A623] hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <div className="w-12 h-12 rounded-full bg-[#0a0e1a] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── SECURITY BANNER ── */}
      <div className="bg-gradient-to-r from-[#F5A623]/8 via-[#F5A623]/3 to-transparent border border-[#F5A623]/15 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623]/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Secure Your Account</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Enable two-factor authentication for enhanced security
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-5 py-2.5 bg-[#F5A623] text-[#0a0e1a] font-semibold rounded-xl hover:bg-amber-500 transition-colors text-sm whitespace-nowrap shrink-0"
          >
            Enable 2FA
          </Link>
        </div>
      </div>
    </div>
  )
}