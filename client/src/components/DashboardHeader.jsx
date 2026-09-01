import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, X, ChevronDown, Wallet, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notifications = [
    { id: 1, text: 'Your deposit of $500.00 has been confirmed', time: '2 min ago', unread: true },
    { id: 2, text: 'New investment plan available: Gold Tier', time: '1 hr ago', unread: true },
    { id: 3, text: 'KYC verification approved', time: '3 hrs ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-16 bg-cgp-card/80 backdrop-blur-xl border-b border-cgp-border/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      
      {/* Left */}
      <div className="hidden lg:flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white tracking-tight">Dashboard</h1>
        <span className="text-[11px] text-cgp-text px-2.5 py-1 rounded-full bg-white/[0.03] border border-cgp-border/30">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 ml-auto">
        
        {/* Desktop Search - FIXED with flex container */}
        <div className="hidden md:flex items-center bg-cgp-dark/60 border border-cgp-border/50 rounded-xl px-3 py-2 focus-within:border-cgp-gold/50 focus-within:ring-1 focus-within:ring-cgp-gold/20 focus-within:bg-cgp-dark transition-all w-56 lg:w-72">
          <Search className="w-4 h-4 text-cgp-text flex-shrink-0" />
          <input
            type="text"
            placeholder="Search transactions, plans..."
            className="bg-transparent border-none text-sm text-white placeholder-cgp-text outline-none ml-2.5 w-full"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2.5 rounded-xl hover:bg-white/[0.04] text-cgp-text-light transition-colors"
        >
          {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>

        {/* Mobile Search Expand - FIXED with flex container */}
        {searchOpen && (
          <div className="absolute top-16 left-0 right-0 p-4 bg-cgp-card border-b border-cgp-border md:hidden z-50">
            <div className="flex items-center bg-cgp-dark border border-cgp-border rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-cgp-text flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none text-sm text-white placeholder-cgp-text outline-none ml-2.5 w-full"
              />
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative p-2.5 rounded-xl hover:bg-white/[0.04] text-cgp-text-light transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-cgp-red rounded-full ring-2 ring-cgp-card animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-cgp-card border border-cgp-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              <div className="p-4 border-b border-cgp-border/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-cgp-gold bg-cgp-gold/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 border-b border-cgp-border/30 hover:bg-white/[0.02] cursor-pointer ${n.unread ? 'bg-cgp-gold/[0.02]' : ''}`}>
                    <p className={`text-sm ${n.unread ? 'text-white font-medium' : 'text-slate-400'}`}>{n.text}</p>
                    <p className="text-xs text-cgp-text mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-xs font-medium text-cgp-gold hover:bg-cgp-gold/5 transition-colors">View all</button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-7 bg-cgp-border/40 mx-1" />

        {/* Balance */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-cgp-gold/5 rounded-xl border border-cgp-gold/10 h-9">
          <Wallet className="w-4 h-4 text-cgp-gold flex-shrink-0" />
          <span className="text-sm font-semibold text-cgp-gold leading-none">
            ${user?.wallet?.totalBalance ? parseFloat(user.wallet.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.04] transition-colors h-9"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cgp-gold to-amber-600 flex items-center justify-center ring-2 ring-cgp-gold/20 flex-shrink-0">
              <span className="text-cgp-dark font-bold text-[10px]">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm font-medium text-white">{user?.firstName}</span>
              <span className="text-[10px] text-cgp-text mt-0.5">Investor</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-cgp-text-light transition-transform duration-200 flex-shrink-0 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-cgp-card border border-cgp-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              <div className="p-4 border-b border-cgp-border/50">
                <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-cgp-text mt-0.5 truncate">{user?.email}</p>
              </div>
              <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors">
                <User className="w-4 h-4" /> Profile
              </Link>
              <div className="border-t border-cgp-border/50" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}