import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  TrendingUp,
  Zap,
  Clock,
  ChevronRight,
  ChevronDown,
  Lock,
  Globe,
  CheckCircle2,
  Wallet,
  BarChart3,
  ArrowUpRight,
  Users,
  Award,
  Star,
  Quote,
  ChevronLeft,
  Play,
  ShieldCheck,
  Landmark,
  Eye,
  Headphones,
} from 'lucide-react'

// ─── REAL SVG COIN ICONS ──────────────────────────────────────────
function BtcIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path d="M22.5 14.2c.3-2-1.2-3-3.3-3.8l.7-2.7-1.6-.4-.6 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-.1-.1-2.2-.5-.4 1.6s1.2.3 1.2.3c.7.2.8.6.8.9l-.8 3.2c.1 0 .2 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.9.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.1.3l-.7 2.8 1.6.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.6.4.7-2.8c3.1.6 5.4-.3 6.4-2.4.8-1.7.4-3-1-3.9 1.4-.3 2.5-1.2 2.8-3.1zm-5 6.7c-.6 2.3-4.4 1-5.7.7l1-4.1c1.3.3 5.4 1 4.7 3.4zm.6-6.8c-.5 2.1-3.6 1-4.6.8l.9-3.8c1 .2 4.3.7 3.7 3z" fill="white" />
    </svg>
  )
}

function EthIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16 4l-.2.6v16.6l.2.2 7.8-4.6L16 4z" fill="white" fillOpacity="0.6" />
      <path d="M16 4L8.2 17l7.8 4.6V4z" fill="white" />
      <path d="M16 22.6l-.1.2v5.9l.1.3 7.8-11-7.8 4.6z" fill="white" fillOpacity="0.6" />
      <path d="M16 28.8v-6.2L8.2 17l7.8 11.8z" fill="white" />
      <path d="M16 20.6l7.8-4.6L16 12.2v8.4z" fill="white" fillOpacity="0.2" />
      <path d="M8.2 16l7.8 4.6V12.2L8.2 16z" fill="white" fillOpacity="0.6" />
    </svg>
  )
}

function UsdtIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path d="M17.2 17.5v-.1c3.1-.2 5.5-.7 5.5-1.4 0-.7-2.4-1.2-5.5-1.4v-3.5h5.5V8h-7.4v3.5c-3.5.2-6.1.9-6.1 1.7 0 .9 2.6 1.6 6.1 1.8v5.3c-2.6-.1-4.8-.5-6.3-1.1l-.9 2.3c1.9.7 4.5 1.2 7.2 1.2v3.3h2v-3.3c3.7-.2 6.2-.9 6.2-1.8 0-.8-2.5-1.5-6.2-1.7v-4.7zm0-2.7c2.6.1 4.5.5 4.5.9 0 .4-1.9.8-4.5.9v-1.8zm-2 4.4v1.9c-2.3-.1-3.9-.4-3.9-.8 0-.3 1.6-.6 3.9-.8v-.3z" fill="white" />
    </svg>
  )
}

function BnbIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path d="M12.6 14.4L16 11l3.4 3.4 2-2L16 7l-5.4 5.4 2 2zM7 16l2-2 2 2-2 2-2-2zm5.6 1.6L16 21l3.4-3.4 2 2L16 25l-5.4-5.4 2-2zM21 16l2-2 2 2-2 2-2-2zm-3.3-1.7L16 12.6l-1.7 1.7-.9-.9L16 10.8l2.6 2.6-.9.9z" fill="white" />
    </svg>
  )
}

function SolIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#000000" />
      <path d="M9.5 20.5c.3-.3.7-.5 1.1-.5h12.8c.7 0 1 .8.5 1.3l-2.6 2.6c-.3.3-.7.5-1.1.5H7.4c-.7 0-1-.8-.5-1.3l2.6-2.6z" fill="url(#solGrad1)" />
      <path d="M9.5 9.5c.3-.3.7-.5 1.1-.5h12.8c.7 0 1 .8.5 1.3l-2.6 2.6c-.3.3-.7.5-1.1.5H7.4c-.7 0-1-.8-.5-1.3l2.6-2.6z" fill="url(#solGrad2)" />
      <path d="M22.5 14.8c-.3.3-.7.5-1.1.5H8.6c-.7 0-1-.8-.5-1.3l2.6-2.6c.3-.3.7-.5 1.1-.5h12.8c.7 0 1 .8.5 1.3l-2.6 2.6z" fill="url(#solGrad3)" />
      <defs>
        <linearGradient id="solGrad1" x1="7" y1="21" x2="23" y2="21"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient>
        <linearGradient id="solGrad2" x1="7" y1="10" x2="23" y2="10"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient>
        <linearGradient id="solGrad3" x1="8" y1="15" x2="23" y2="15"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient>
      </defs>
    </svg>
  )
}

// ─── TESTIMONIAL CAROUSEL ─────────────────────────────────────────
const testimonials = [
  {
    name: 'Marcus Chen',
    role: 'Software Engineer, Austin TX',
    avatar: 'MC',
    stars: 5,
    text: "I was skeptical at first, but after 3 months on the Growth plan, I've consistently received my daily payouts. The principal return at maturity was seamless. Already reinvested for round two.",
    plan: 'Growth Plan',
    amount: '$25,000',
    since: 'Member since Mar 2025',
  },
  {
    name: 'Sarah Okafor',
    role: 'Business Owner, Lagos Nigeria',
    avatar: 'SO',
    stars: 5,
    text: "The KYC process was straightforward and I got verified within 24 hours. Deposited BTC and started earning the next day. Customer support actually replies to emails — that's rare in this space.",
    plan: 'Premium Plan',
    amount: '$75,000',
    since: 'Member since Jan 2025',
  },
  {
    name: 'James Whitfield',
    role: 'Retired Portfolio Manager, London UK',
    avatar: 'JW',
    stars: 5,
    text: "After 30 years in traditional finance, I wanted exposure to crypto without the volatility of trading. The fixed returns and principal protection here are exactly what I was looking for. Very satisfied.",
    plan: 'Starter Plan',
    amount: '$8,000',
    since: 'Member since Jun 2025',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Real Estate Investor, Miami FL',
    avatar: 'ER',
    stars: 5,
    text: "I compare this to my rental properties — except I don't have to deal with tenants or maintenance. The daily ROI hits my wallet like clockwork. Withdrawals to my bank account take under 4 hours.",
    plan: 'VIP Plan',
    amount: '$150,000',
    since: 'Member since Dec 2024',
  },
  {
    name: 'David Kim',
    role: 'Crypto Trader, Seoul South Korea',
    avatar: 'DK',
    stars: 4,
    text: "I keep a portion of my portfolio here for stable, predictable returns while I trade the rest. The compound interest option on the Premium plan is a nice touch. Interface is clean and mobile-friendly.",
    plan: 'Premium Plan',
    amount: '$60,000',
    since: 'Member since Feb 2025',
  },
]

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAuto, setIsAuto] = useState(true)

  useEffect(() => {
    if (!isAuto) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isAuto])

  const goTo = (idx) => {
    setCurrent(idx)
    setIsAuto(false)
    setTimeout(() => setIsAuto(true), 10000)
  }

  const t = testimonials[current]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 md:p-10 relative overflow-hidden">
        {/* Quote icon background */}
        <Quote className="absolute top-6 right-6 w-16 h-16 text-[#F5A623]/5" />

        <div className="relative z-10">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < t.stars ? 'text-[#F5A623] fill-[#F5A623]' : 'text-[#1f2937]'}`} />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 min-h-[120px]">
            "{t.text}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] font-bold text-sm">
              {t.avatar}
            </div>
            <div>
              <p className="font-semibold text-white">{t.name}</p>
              <p className="text-sm text-slate-500">{t.role}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                <span className="text-[#F5A623]">{t.plan}</span>
                <span>•</span>
                <span>{t.amount}</span>
                <span>•</span>
                <span>{t.since}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-[#F5A623]' : 'w-4 bg-[#1f2937] hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-lg bg-[#0a0e1a] border border-[#1f2937] text-slate-500 hover:text-white hover:border-[#F5A623]/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo((current + 1) % testimonials.length)}
              className="p-2 rounded-lg bg-[#0a0e1a] border border-[#1f2937] text-slate-500 hover:text-white hover:border-[#F5A623]/30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const features = [
    {
      icon: ShieldCheck,
      title: 'Bank-Grade Security',
      desc: 'Multi-signature cold wallets, 2FA, and real-time threat monitoring. Your funds are protected around the clock.',
    },
    {
      icon: TrendingUp,
      title: 'Fixed Daily Returns',
      desc: 'No guesswork. Your daily ROI is locked in from day one. Returns credit to your wallet automatically at 00:00 UTC.',
    },
    {
      icon: Zap,
      title: 'Fast Withdrawals',
      desc: 'Request a withdrawal and receive your funds within 2-4 hours during business days. No delays, no excuses.',
    },
    {
      icon: Eye,
      title: 'Full Transparency',
      desc: 'Track every transaction, every return, and every fee in real time. Your dashboard shows exactly where your money is.',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Create Your Account',
      desc: 'Sign up with your email in under 60 seconds. Verify your identity with a quick KYC process — approved within 24 hours.',
    },
    {
      num: '02',
      title: 'Deposit Crypto',
      desc: 'Send BTC, ETH, USDT, BNB, or SOL to your unique wallet address. Funds are secured in cold storage after confirmation.',
    },
    {
      num: '03',
      title: 'Choose Your Plan',
      desc: 'Pick a plan that matches your capital and goals. Lock in your rate. Your daily returns start the very next day.',
    },
    {
      num: '04',
      title: 'Earn & Withdraw',
      desc: 'Watch your balance grow daily. Withdraw earnings anytime or let them compound. Your principal returns in full at maturity.',
    },
  ]

  const faqs = [
    {
      q: 'What is the minimum investment amount?',
      a: 'The Starter plan requires a minimum deposit of $4,000. Each plan has its own minimum and maximum limits. You must meet the minimum to activate a plan.',
    },
    {
      q: 'How are daily returns calculated?',
      a: 'Returns are calculated as a fixed percentage of your principal investment. For example, a $10,000 investment in the Growth plan (1.8% daily) earns $180.00 every day for 60 days.',
    },
    {
      q: 'When can I withdraw my earnings?',
      a: 'You can withdraw your accumulated earnings at any time. Withdrawal requests are processed within 2-4 hours during business days. There is no minimum withdrawal amount.',
    },
    {
      q: 'Is my principal returned at the end of the plan?',
      a: 'Yes. Your original investment amount is returned in full at the end of the plan duration, provided you do not withdraw early. Early withdrawal carries a 20% fee.',
    },
    {
      q: 'Which cryptocurrencies do you accept?',
      a: 'We support Bitcoin (BTC), Ethereum (ETH), Tether (USDT on TRC20 and ERC20), Binance Coin (BNB), and Solana (SOL) for both deposits and withdrawals.',
    },
    {
      q: 'What happens if I want to withdraw early?',
      a: 'Early withdrawal is available but incurs a 20% fee on your principal. We recommend holding until maturity to receive your full principal back. Earnings are not affected by early withdrawal.',
    },
  ]

  const coins = [
    { icon: BtcIcon, symbol: 'BTC', name: 'Bitcoin', color: 'text-[#F7931A]', bg: 'bg-[#F7931A]/10' },
    { icon: EthIcon, symbol: 'ETH', name: 'Ethereum', color: 'text-[#627EEA]', bg: 'bg-[#627EEA]/10' },
    { icon: UsdtIcon, symbol: 'USDT', name: 'Tether', color: 'text-[#26A17B]', bg: 'bg-[#26A17B]/10' },
    { icon: BnbIcon, symbol: 'BNB', name: 'Binance Coin', color: 'text-[#F3BA2F]', bg: 'bg-[#F3BA2F]/10' },
    { icon: SolIcon, symbol: 'SOL', name: 'Solana', color: 'text-[#9945FF]', bg: 'bg-[#9945FF]/10' },
  ]

  const stats = [
    { value: '$47.2M', label: 'Total Assets Under Management', icon: Landmark },
    { value: '$3.8M', label: 'Paid to Investors This Year', icon: ArrowUpRight },
    { value: '12,400+', label: 'Active Investors Worldwide', icon: Users },
    { value: '99.9%', label: 'Platform Uptime', icon: Award },
  ]

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0e1a]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F5A623]/3 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-6 tracking-tight text-white">
                Earn Daily Returns on Your{' '}
                <span className="text-[#F5A623]">Crypto Assets</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                Lock in your investment for a fixed term and receive predictable daily returns. Your principal is returned in full at maturity. No hidden fees, no surprises.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-[#F5A623] text-[#0a0e1a] font-semibold rounded-xl hover:bg-amber-500 transition-all text-sm"
                >
                  Open Your Account
                </Link>
                <Link
                  to="/plans"
                  className="px-8 py-3.5 border border-[#1f2937] text-white font-semibold rounded-xl hover:border-[#F5A623]/30 hover:bg-[#F5A623]/5 transition-all text-sm flex items-center gap-2"
                >
                  Compare Plans <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {[
                  { icon: Lock, text: '256-bit Encryption' },
                  { icon: ShieldCheck, text: 'KYC Verified' },
                  { icon: Globe, text: 'Global Access' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <item.icon className="w-4 h-4 text-[#F5A623]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-white">Return Calculator</h3>
                  <span className="text-xs text-slate-500">Estimates only</span>
                </div>
                <div className="space-y-4">
                  {[
                    { plan: 'Starter', deposit: '$4,000', daily: '$48.00', total: '$5,440', roi: '1.2%', days: '30 days' },
                    { plan: 'Growth', deposit: '$10,000', daily: '$180.00', total: '$20,800', roi: '1.8%', days: '60 days' },
                    { plan: 'Premium', deposit: '$50,000', daily: '$1,250.00', total: '$112,500', roi: '2.5%', days: '90 days' },
                  ].map((row, i) => (
                    <div key={i} className="p-4 bg-[#0a0e1a] rounded-xl border border-[#1f2937] hover:border-[#F5A623]/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">{row.plan}</span>
                        <span className="text-xs text-[#F5A623] font-medium">{row.roi} daily</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-slate-600">Min Deposit</p>
                          <p className="text-slate-300 font-medium">{row.deposit}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Daily (min)</p>
                          <p className="text-[#F5A623] font-medium">{row.daily}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Total Return</p>
                          <p className="text-emerald-400 font-medium">{row.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-[#1f2937] bg-[#111827]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Four straightforward steps from signup to earning. No complicated setup or technical knowledge required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 h-full hover:border-[#F5A623]/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-[#F5A623]">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-[#1f2937]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORTED ASSETS */}
      <section className="py-16 border-y border-[#1f2937] bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Supported Digital Assets</h2>
            <p className="text-slate-500">Deposit and withdraw using any of these major cryptocurrencies</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {coins.map((coin, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 bg-[#111827] border border-[#1f2937] rounded-xl hover:border-[#F5A623]/20 transition-colors">
                <div className={`w-10 h-10 rounded-full ${coin.bg} flex items-center justify-center`}>
                  <coin.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                  <p className="text-xs text-slate-500">{coin.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Why Investors Choose Us</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Built by a team with decades of combined experience in traditional finance and blockchain technology.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 hover:border-[#F5A623]/20 transition-all hover:translate-y-[-2px]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#F5A623]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 border-y border-[#1f2937] bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">What Our Investors Say</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Real stories from real members who have grown their wealth with us.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* PLANS */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Investment Plans</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Choose a plan that fits your capital. All plans pay daily returns and return your principal at the end of the term.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Starter', roi: '1.2%', duration: '30 Days', min: '$4,000', max: '$9,999', daily: '$48.00', total: '$5,440', color: 'border-[#1f2937]' },
              { name: 'Growth', roi: '1.8%', duration: '60 Days', min: '$10,000', max: '$49,999', daily: '$180.00', total: '$20,800', color: 'border-[#F5A623]/30', popular: true },
              { name: 'Premium', roi: '2.5%', duration: '90 Days', min: '$50,000', max: '$249,999', daily: '$1,250.00', total: '$112,500', color: 'border-[#1f2937]' },
              { name: 'VIP', roi: '3.2%', duration: '180 Days', min: '$250,000', max: '$1,000,000', daily: '$8,000.00', total: '$1,440,000', color: 'border-[#1f2937]' },
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-[#111827] border ${plan.color} rounded-2xl p-6 transition-all hover:border-[#F5A623]/30 hover:translate-y-[-2px] relative flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F5A623] text-[#0a0e1a] text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.duration} term</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#F5A623]">{plan.roi}</span>
                  <span className="text-sm text-slate-500"> daily ROI</span>
                </div>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Range</span>
                    <span className="font-medium text-white">{plan.min} – {plan.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. daily (min)</span>
                    <span className="font-medium text-[#F5A623]">{plan.daily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total return (min)</span>
                    <span className="font-medium text-emerald-400">{plan.total}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {['Daily ROI credited', 'Principal returned', 'Email support', '2-4 hour withdrawals'].map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? 'bg-[#F5A623] text-[#0a0e1a] hover:bg-amber-500'
                      : 'border border-[#1f2937] text-white hover:bg-white/5'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RISK DISCLAIMER */}
      <section className="py-16 bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Investment Risk Disclosure</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                  All investments carry risk. Past performance does not guarantee future results. Crypto markets are volatile. Only invest capital you can afford to lose entirely. We are not a bank, and deposits are not insured by any government agency. Read our full <Link to="/terms" className="text-[#F5A623] hover:underline">Terms of Service</Link> and <Link to="/risk" className="text-[#F5A623] hover:underline">Risk Disclosure</Link> before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-y border-[#1f2937] bg-[#0a0e1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know before getting started</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#0a0e1a] transition-colors"
                >
                  <span className="font-medium text-sm text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-[#1f2937] rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Earning?</h2>
              <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
                Open an account in under two minutes. Complete KYC, deposit crypto, and start receiving daily returns.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-[#F5A623] text-[#0a0e1a] font-semibold rounded-xl hover:bg-amber-500 transition-all text-sm"
                >
                  Create Your Account
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3.5 border border-[#1f2937] text-white font-semibold rounded-xl hover:border-[#F5A623]/30 hover:bg-[#F5A623]/5 transition-all text-sm"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}