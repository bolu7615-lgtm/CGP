import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Calculator,
  Sparkles,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Plans() {
  const [loading, setLoading] = useState(true)
  const [calculator, setCalculator] = useState({ tier: null, amount: 4000 })
  const [walletData, setWalletData] = useState(null)

  // Fixed investment tiers matching your image exactly
  const allPlans = [
    {
      id: 'tier-1',
      name: 'Starter Plan',
      deposit: 4000,
      percentOfPlan: 10,
      dailyRoi: 2.5,
      dailyProfit: 100,
      durationDays: 60,
      totalProfit: 6000,
      totalReturn: 10000,
      roi: 150,
      minAmount: 4000,
      maxAmount: 7999,
      popular: false,
      principalReturn: true,
      compoundInterest: false,
    },
    {
      id: 'tier-2',
      name: 'Growth Plan',
      deposit: 8000,
      percentOfPlan: 20,
      dailyRoi: 2.5,
      dailyProfit: 200,
      durationDays: 60,
      totalProfit: 12000,
      totalReturn: 20000,
      roi: 150,
      minAmount: 8000,
      maxAmount: 11999,
      popular: false,
      principalReturn: true,
      compoundInterest: false,
    },
    {
      id: 'tier-3',
      name: 'Advanced Plan',
      deposit: 12000,
      percentOfPlan: 30,
      dailyRoi: 2.5,
      dailyProfit: 300,
      durationDays: 60,
      totalProfit: 18000,
      totalReturn: 30000,
      roi: 150,
      minAmount: 12000,
      maxAmount: 19999,
      popular: true,
      principalReturn: true,
      compoundInterest: false,
    },
    {
      id: 'tier-4',
      name: 'Pro Plan',
      deposit: 20000,
      percentOfPlan: 50,
      dailyRoi: 2.5,
      dailyProfit: 500,
      durationDays: 60,
      totalProfit: 30000,
      totalReturn: 50000,
      roi: 150,
      minAmount: 20000,
      maxAmount: 39999,
      popular: false,
      principalReturn: true,
      compoundInterest: false,
    },
    {
      id: 'tier-5',
      name: 'Elite Plan',
      deposit: 40000,
      percentOfPlan: 100,
      dailyRoi: 2.5,
      dailyProfit: 1000,
      durationDays: 60,
      totalProfit: 60000,
      totalReturn: 100000,
      roi: 150,
      minAmount: 40000,
      maxAmount: 40000,
      popular: false,
      principalReturn: true,
      compoundInterest: false,
    },
  ]

  // Check if user has deposited $4,000 or more
  const hasMinDeposit = (walletData?.wallet?.totalDeposited || 0) >= 4000

  // Filter plans: if user has deposited $4k+, only show tier-5 (Elite). Otherwise show all.
  const plans = hasMinDeposit
    ? allPlans.filter((p) => p.id === 'tier-5')
    : allPlans

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/wallet')
        setWalletData(res.data.data)
      } catch (err) {
        // User might not be logged in, that's ok for this page
        setWalletData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (plans.length > 0 && !plans.find((p) => p.id === calculator.tier?.id)) {
      setCalculator((prev) => ({ ...prev, tier: plans[0], amount: plans[0].deposit }))
    }
  }, [plans, calculator.tier])

  const calculateReturns = () => {
    if (!calculator.tier || !calculator.amount) return null
    const daily = (calculator.amount * calculator.tier.dailyRoi) / 100
    const totalProfit = daily * calculator.tier.durationDays
    const totalReturn = calculator.tier.principalReturn
      ? calculator.amount + totalProfit
      : totalProfit
    const breakEvenDay = Math.ceil(calculator.amount / daily)
    return { daily, totalProfit, totalReturn, breakEvenDay }
  }

  const returns = calculateReturns()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cgp-gold"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Investment Plans</h1>
        <p className="text-cgp-text max-w-2xl mx-auto">
          Choose from our carefully designed 60-day investment plans. Earn 2.5% daily ROI with full principal return.
        </p>
        {hasMinDeposit && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cgp-gold/10 border border-cgp-gold/30 rounded-full text-sm text-cgp-gold">
            <Lock className="w-4 h-4" />
            $4,000+ deposited. Elite Plan is now unlocked.
          </div>
        )}
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-cgp-card border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                plan.popular ? 'border-cgp-gold' : 'border-cgp-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cgp-gold text-cgp-dark text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-cgp-gold">
                  ${plan.dailyProfit.toLocaleString()}
                </span>
                <span className="text-sm text-cgp-text"> / day</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-cgp-gold font-medium">
                  {plan.dailyRoi}% Daily ROI
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-cgp-text">Deposit:</span>
                  <span className="font-medium">
                    ${plan.deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cgp-text">% of Plan:</span>
                  <span className="font-medium">{plan.percentOfPlan}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cgp-text">Duration:</span>
                  <span className="font-medium">
                    {plan.durationDays} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cgp-text">Total Profit:</span>
                  <span className="font-medium text-cgp-green">
                    ${plan.totalProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cgp-text">Total Return:</span>
                  <span className="font-medium text-cgp-gold">
                    ${plan.totalReturn.toLocaleString()}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  `${plan.dailyRoi}% Daily ROI`,
                  'Principal Return',
                  `${plan.durationDays}-Day Duration`,
                  'Instant Withdrawals',
                  '24/7 Support',
                ].map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-cgp-text-light"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cgp-green" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-cgp-gold text-cgp-dark btn-gold'
                    : 'border border-cgp-border hover:bg-white/5'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-cgp-card/30 border-y border-cgp-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Calculator className="w-10 h-10 text-cgp-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profit Calculator</h2>
            <p className="text-cgp-text">
              See how much you could earn with our 60-day plans
            </p>
          </div>

          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Plan
                </label>
                <select
                  value={calculator.tier?.id || ''}
                  onChange={(e) => {
                    const tier = plans.find((p) => p.id === e.target.value)
                    if (tier) {
                      setCalculator((prev) => ({
                        ...prev,
                        tier,
                        amount: tier.deposit,
                      }))
                    }
                  }}
                  className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.deposit.toLocaleString()} ({p.percentOfPlan}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  value={calculator.amount}
                  onChange={(e) =>
                    setCalculator((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min={calculator.tier?.minAmount || 4000}
                  max={calculator.tier?.maxAmount || 40000}
                  className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold"
                />
              </div>
            </div>

            {returns && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-cgp-dark rounded-xl p-4 text-center">
                    <p className="text-xs text-cgp-text mb-1">Daily Profit</p>
                    <p className="text-xl font-bold text-cgp-green">
                      +${returns.daily.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-cgp-dark rounded-xl p-4 text-center">
                    <p className="text-xs text-cgp-text mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-cgp-gold">
                      ${returns.totalProfit.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-cgp-dark rounded-xl p-4 text-center">
                    <p className="text-xs text-cgp-text mb-1">Total Return</p>
                    <p className="text-xl font-bold text-white">
                      ${returns.totalReturn.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-cgp-dark rounded-xl p-4 text-center">
                    <p className="text-xs text-cgp-text mb-1">Break Even</p>
                    <p className="text-xl font-bold text-cgp-blue">
                      Day {returns.breakEvenDay}
                    </p>
                  </div>
                </div>
                <div className="bg-cgp-dark/50 rounded-xl p-4 text-center">
                  <p className="text-sm text-cgp-text">
                    At <span className="text-cgp-gold font-bold">Day {calculator.tier?.durationDays}</span>, your{' '}
                    <span className="text-white font-bold">
                      ${calculator.amount.toLocaleString()}
                    </span>{' '}
                    becomes{' '}
                    <span className="text-cgp-green font-bold">
                      ${returns.totalReturn.toLocaleString()}
                    </span>{' '}
                    — that's a{' '}
                    <span className="text-cgp-gold font-bold">150% ROI</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Our Plans Stand Out</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Principal Protection',
              desc: 'Your initial deposit is fully returned at the end of the 60-day term.',
            },
            {
              icon: TrendingUp,
              title: '2.5% Daily ROI',
              desc: 'Consistent daily returns across all tiers. No surprises, no hidden fees.',
            },
            {
              icon: Clock,
              title: 'Fixed 60-Day Duration',
              desc: 'Clear timeline. Know exactly when your investment matures.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-cgp-card border border-cgp-border rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-cgp-gold/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-cgp-gold" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-cgp-text">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold text-lg"
        >
          Start Investing Now <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  )
}