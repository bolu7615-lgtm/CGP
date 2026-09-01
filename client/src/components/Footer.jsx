import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Shield, CheckCircle, Zap, ArrowRight } from 'lucide-react'

// ===== SOCIAL ICONS (inline SVG) =====
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const DiscordIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

// ===== NEW LOGO COMPONENT =====
function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-[30deg]"
      >
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          stroke="url(#footerGoldGrad)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z"
          fill="url(#footerGoldGrad)"
          opacity="0.15"
        />
        <circle cx="16" cy="16" r="3" fill="#F5A623" />
        <defs>
          <linearGradient id="footerGoldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
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
  )
}

export default function Footer() {
  const currentYear = 2026
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const footerLinks = {
    Platform: [
      { name: 'Investment Plans', path: '/plans' },
      { name: 'About Us', path: '/about' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Contact', path: '/contact' },
    ],
    Legal: [
      { name: 'Terms of Service', path: '#' },
      { name: 'Privacy Policy', path: '#' },
      { name: 'Risk Disclosure', path: '#' },
      { name: 'Cookie Policy', path: '#' },
    ],
    Support: [
      { name: 'Help Center', path: '/faq' },
      { name: 'KYC Guide', path: '/faq' },
      { name: 'Deposit Guide', path: '/faq' },
      { name: 'Withdrawal Guide', path: '/faq' },
    ],
  }

  const socialLinks = [
    { Icon: TwitterIcon, href: '#', label: 'Twitter / X', color: 'hover:text-white' },
    { Icon: FacebookIcon, href: '#', label: 'Facebook', color: 'hover:text-[#1877F2]' },
    { Icon: InstagramIcon, href: '#', label: 'Instagram', color: 'hover:text-[#E4405F]' },
    { Icon: LinkedinIcon, href: '#', label: 'LinkedIn', color: 'hover:text-[#0A66C2]' },
    { Icon: TelegramIcon, href: '#', label: 'Telegram', color: 'hover:text-[#26A5E4]' },
    { Icon: YoutubeIcon, href: '#', label: 'YouTube', color: 'hover:text-[#FF0000]' },
    { Icon: DiscordIcon, href: '#', label: 'Discord', color: 'hover:text-[#5865F2]' },
  ]

  const trustBadges = [
    { icon: Shield, label: 'SSL Secured' },
    { icon: CheckCircle, label: 'KYC Verified' },
    { icon: Zap, label: 'Instant Payouts' },
  ]

  return (
    <footer className="bg-[#0f1729] border-t border-cgp-border/30">
      {/* ===== MAIN FOOTER CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Logo className="mb-5" />
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Smart, secure and reliable platform to grow your crypto assets with confidence. 
              Join thousands of investors already growing with us.
            </p>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(({ Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:border-cgp-gold/20 hover:scale-110 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                {title}
                <span className="w-6 h-[2px] bg-cgp-gold/40 rounded-full" />
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="group text-sm text-slate-400 hover:text-cgp-gold transition-colors duration-200 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-cgp-gold transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              Stay Updated
              <span className="w-6 h-[2px] bg-cgp-gold/40 rounded-full" />
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Get the latest investment insights and platform updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:border-cgp-gold/50 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-[#0B0E14] bg-gradient-to-r from-cgp-gold to-amber-600 rounded-xl transition-all duration-200 hover:shadow-[0_4px_15px_rgba(245,166,35,0.3)] flex items-center justify-center gap-2"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                {!subscribed && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="border-t border-cgp-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-6 text-sm text-slate-400">
            <a href="mailto:support@capitalgrowthprogram.com" className="flex items-center gap-2 hover:text-cgp-gold transition-colors">
              <Mail className="w-4 h-4 text-cgp-gold" />
              support@capitalgrowthprogram.com
            </a>
            <a href="tel:+15551234567" className="flex items-center gap-2 hover:text-cgp-gold transition-colors">
              <Phone className="w-4 h-4 text-cgp-gold" />
              +1 (555) 123-4567
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cgp-gold" />
              New York, NY
            </span>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-slate-500"
              >
                <Icon className="w-3.5 h-3.5 text-cgp-gold/70" />
                {label}
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-slate-600">
              © {currentYear} Capital Growth Program. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}