import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'KYC Verifications', path: '/admin/kyc', icon: Shield },
    { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownLeft },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight },
    { name: 'Investments', path: '/admin/investments', icon: TrendingUp },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Logo component with UNIQUE gradient ID per instance
  const Logo = ({ onClick, gradientId }) => (
    <Link to="/admin" onClick={onClick} className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="flex-shrink-0"
      >
        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke={`url(#${gradientId})`} strokeWidth="1.5" fill="none" />
        <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill={`url(#${gradientId})`} opacity="0.15" />
        <circle cx="16" cy="16" r="3" fill="#F5A623" />
        <defs>
          <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5A623" />
            <stop offset="1" stopColor="#D4891A" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <span className="font-bold text-sm text-white">Admin Panel</span>
        <p className="text-xs text-cgp-text">Management</p>
      </div>
    </Link>
  )

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-cgp-card border-b border-cgp-border z-40 flex items-center px-4 gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-cgp-gold hover:bg-cgp-gold/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Logo gradientId="mobileLogoGrad" />
      </header>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="w-64 bg-cgp-card border-r border-cgp-border hidden lg:flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-cgp-border">
          <Logo gradientId="desktopLogoGrad" />
        </div>

        {/* Admin info */}
        <div className="p-4 border-b border-cgp-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cgp-gold to-cgp-gold-light flex items-center justify-center">
              <span className="text-cgp-dark font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-cgp-gold">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cgp-gold/10 text-cgp-gold'
                    : 'text-cgp-text-light hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Back to site & Logout */}
        <div className="p-4 border-t border-cgp-border space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cgp-text-light hover:bg-white/5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-cgp-red hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MOBILE OVERLAY ===== */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ===== MOBILE DRAWER (slides from LEFT) ===== */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 lg:hidden flex flex-col bg-cgp-card border-r border-cgp-border transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-cgp-border">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-lg bg-cgp-gold/10 flex items-center justify-center text-cgp-gold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin info in Drawer */}
        <div className="p-4 border-b border-cgp-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cgp-gold to-cgp-gold-light flex items-center justify-center">
              <span className="text-cgp-dark font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-cgp-gold">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cgp-gold/10 text-cgp-gold'
                    : 'text-cgp-text-light hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-cgp-border space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cgp-text-light hover:bg-white/5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => { setMobileOpen(false); logout() }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-cgp-red hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}