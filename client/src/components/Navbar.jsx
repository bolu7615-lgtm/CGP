import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const mobileMenuRef = useRef(null)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plans', path: '/plans' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll + handle escape key
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      const handleEscape = (e) => {
        if (e.key === 'Escape') setMobileOpen(false)
      }
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const toggleMobile = () => setMobileOpen(prev => !prev)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(10,14,26,0.95)] border-b border-[rgba(245,166,35,0.15)]'
            : 'bg-[rgba(10,14,26,0.85)] border-b border-[rgba(245,166,35,0.08)]'
        }`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-[30deg]"
              >
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#navGoldGrad)" strokeWidth="1.5" fill="none" />
                <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="url(#navGoldGrad)" opacity="0.15" />
                <circle cx="16" cy="16" r="3" fill="#F5A623" />
                <defs>
                  <linearGradient id="navGoldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5A623" />
                    <stop offset="1" stopColor="#D4891A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white tracking-tight">
                  Capital<span className="text-cgp-gold">Growth</span>
                </span>
                <span className="text-[9px] text-slate-500 tracking-[3px] uppercase font-medium mt-0.5">
                  P R O G R A M
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-cgp-gold bg-cgp-gold/10'
                      : 'text-slate-400 hover:text-cgp-gold hover:bg-cgp-gold/[0.06]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cgp-gold to-amber-600 flex items-center justify-center">
                      <span className="text-cgp-dark font-bold text-xs">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <span className="text-sm text-slate-300">{user.firstName}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0f1729] border border-cgp-border rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-3 border-b border-cgp-border">
                        <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04]">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { setDropdownOpen(false); logout() }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.04]">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-cgp-gold transition-colors">
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-semibold text-cgp-dark bg-gradient-to-r from-cgp-gold to-amber-600 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,166,35,0.35)] transition-all shadow-[0_4px_15px_rgba(245,166,35,0.25)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ===== MOBILE HAMBURGER ===== */}
            <button
              onClick={toggleMobile}
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-[5px] relative z-[60]"
              aria-label="Toggle menu"
              type="button"
            >
              <span className={`block h-[2px] bg-cgp-gold rounded-full transition-all duration-300 origin-center ${mobileOpen ? 'w-6 translate-y-[7px] rotate-45' : 'w-6'}`} />
              <span className={`block h-[2px] bg-cgp-gold rounded-full transition-all duration-300 ${mobileOpen ? 'w-6 opacity-0' : 'w-6'}`} />
              <span className={`block h-[2px] bg-cgp-gold rounded-full transition-all duration-300 origin-center ${mobileOpen ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-4 ml-auto'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-[72px]" />

      {/* ===== MOBILE OVERLAY ===== */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ===== MOBILE DRAWER ===== */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] z-[56] md:hidden flex flex-col bg-gradient-to-b from-[#0f1729] to-[#0a0e1a] border-l border-cgp-gold/10 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-cgp-border/50">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-[3px]">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-xl bg-cgp-gold/10 flex items-center justify-center text-cgp-gold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl mb-1 transition-all ${
                isActive(link.path)
                  ? 'bg-cgp-gold/10 text-cgp-gold'
                  : 'text-slate-300 hover:bg-cgp-gold/[0.06] hover:text-white'
              }`}
            >
              <span className={isActive(link.path) ? 'text-cgp-gold' : 'text-slate-500'}>
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[15px] font-medium">{link.name}</span>
            </Link>
          ))}

          {user && (
            <div className="mt-4 pt-4 border-t border-cgp-border/50">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-slate-300 hover:bg-cgp-gold/[0.06] hover:text-white mb-1">
                <LayoutDashboard className="w-5 h-5 text-slate-500" />
                <span className="text-[15px] font-medium">Dashboard</span>
              </Link>
              {isAdmin() && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-slate-300 hover:bg-cgp-gold/[0.06] hover:text-white mb-1">
                  <LayoutDashboard className="w-5 h-5 text-slate-500" />
                  <span className="text-[15px] font-medium">Admin Panel</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-cgp-border/50 flex flex-col gap-2.5">
          {user ? (
            <button
              onClick={() => { setMobileOpen(false); logout() }}
              className="w-full py-3 text-sm font-medium text-red-400 border border-red-400/20 rounded-xl hover:bg-red-400/5"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3 text-center text-sm font-medium text-slate-400 border border-slate-700 rounded-xl hover:border-slate-500">
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3 text-center text-sm font-semibold text-cgp-dark bg-gradient-to-r from-cgp-gold to-amber-600 rounded-xl">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}