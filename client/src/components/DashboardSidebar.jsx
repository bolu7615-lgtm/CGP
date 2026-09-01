import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Users,
  Settings,
  Receipt,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Deposit', path: '/deposit', icon: ArrowDownLeft },
    { name: 'Withdraw', path: '/withdraw', icon: ArrowUpRight },
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'KYC Verification', path: '/kyc', icon: Shield },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const isActive = (path) => location.pathname === path
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* ===== MOBILE HAMBURGER BUTTON (only shows on small screens) ===== */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-cgp-card border border-cgp-border text-cgp-text-light hover:bg-white/5"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="w-64 bg-cgp-card border-r border-cgp-border hidden lg:flex flex-col h-screen sticky top-0">
        <SidebarContent user={user} logout={logout} menuItems={menuItems} isActive={isActive} onNavigate={null} />
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-cgp-card border-r border-cgp-border flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-cgp-border flex items-center justify-between">
          <span className="text-sm font-semibold text-cgp-gold">Menu</span>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-text-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent user={user} logout={logout} menuItems={menuItems} isActive={isActive} onNavigate={closeSidebar} />
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  )
}

// Extracted shared content
function SidebarContent({ user, logout, menuItems, isActive, onNavigate }) {
  return (
    <>
      {/* User info */}
      <div className="p-6 border-b border-cgp-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cgp-gold to-cgp-gold-light flex items-center justify-center">
            <span className="text-cgp-dark font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-cgp-text truncate">{user?.email}</p>
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
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-cgp-gold/10 text-cgp-gold'
                  : 'text-cgp-text-light hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
              {item.path === '/kyc' && user?.kycStatus !== 'APPROVED' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-cgp-red"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-cgp-border">
        <button
          onClick={() => { onNavigate?.(); logout(); }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-cgp-red hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  )
}