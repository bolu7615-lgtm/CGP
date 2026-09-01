import { useState, useEffect } from 'react'
import {
  Users,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Award,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Referrals() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    try {
      const res = await api.get('/referrals/my-stats')
      setStats(res.data.data)
    } catch (err) {
      toast.error('Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Referral link copied!')
    }
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
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-cgp-text">Earn commissions by inviting friends</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-cgp-gold/10 to-cgp-blue/10 border border-cgp-gold/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold mb-1">Your Referral Link</h2>
            <p className="text-sm text-cgp-text">Share this link to earn commissions</p>
          </div>
          <div className="flex items-center gap-2 bg-cgp-dark rounded-xl p-2 border border-cgp-border">
            <input
              type="text"
              value={stats?.referralLink || ''}
              readOnly
              className="bg-transparent text-sm text-cgp-text flex-1 min-w-0 px-2"
            />
            <button
              onClick={copyLink}
              className="p-2 bg-cgp-gold text-cgp-dark rounded-lg hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Referrals',
            value: stats?.totalReferrals || 0,
            icon: Users,
            color: 'text-cgp-blue',
            bg: 'bg-cgp-blue/10',
          },
          {
            title: 'Total Earned',
            value: `$${(stats?.totalEarned || 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'text-cgp-green',
            bg: 'bg-cgp-green/10',
          },
          {
            title: 'Level 1 Rate',
            value: `${stats?.levelBreakdown?.level1?.rate || 5}%`,
            icon: TrendingUp,
            color: 'text-cgp-gold',
            bg: 'bg-cgp-gold/10',
          },
          {
            title: 'Level 2 Rate',
            value: `${stats?.levelBreakdown?.level2?.rate || 2}%`,
            icon: Award,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
        ].map((card, i) => (
          <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-cgp-text mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Commission Structure */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
        <h2 className="font-semibold mb-6">Commission Structure</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              level: 'Level 1',
              rate: stats?.levelBreakdown?.level1?.rate || 5,
              desc: 'Direct referrals',
              earnings: stats?.levelBreakdown?.level1?.earnings || 0,
            },
            {
              level: 'Level 2',
              rate: stats?.levelBreakdown?.level2?.rate || 2,
              desc: 'Referrals of your referrals',
              earnings: stats?.levelBreakdown?.level2?.earnings || 0,
            },
            {
              level: 'Level 3',
              rate: stats?.levelBreakdown?.level3?.rate || 1,
              desc: 'Third tier referrals',
              earnings: stats?.levelBreakdown?.level3?.earnings || 0,
            },
          ].map((level, i) => (
            <div key={i} className="bg-cgp-dark rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-cgp-gold/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-cgp-gold" />
              </div>
              <h3 className="font-semibold mb-1">{level.level}</h3>
              <p className="text-2xl font-bold text-cgp-gold mb-1">{level.rate}%</p>
              <p className="text-xs text-cgp-text mb-2">{level.desc}</p>
              <p className="text-sm">Earned: ${level.earnings.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      {stats?.referrals?.length > 0 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
          <h2 className="font-semibold mb-6">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-cgp-text uppercase">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">KYC Status</th>
                  <th className="pb-3 font-medium">Investments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cgp-border">
                {stats.referrals.map((ref) => (
                  <tr key={ref.id} className="text-sm">
                    <td className="py-3">{ref.firstName} {ref.lastName}</td>
                    <td className="py-3 text-cgp-text">{ref.email}</td>
                    <td className="py-3 text-cgp-text">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ref.kycStatus === 'APPROVED'
                          ? 'text-cgp-green bg-cgp-green/10'
                          : ref.kycStatus === 'SUBMITTED'
                          ? 'text-cgp-gold bg-cgp-gold/10'
                          : 'text-cgp-text bg-white/5'
                      }`}>
                        {ref.kycStatus}
                      </span>
                    </td>
                    <td className="py-3">{ref._count?.investments || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Earnings */}
      {stats?.recentEarnings?.length > 0 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
          <h2 className="font-semibold mb-6">Recent Earnings</h2>
          <div className="space-y-3">
            {stats.recentEarnings.slice(0, 10).map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-3 bg-cgp-dark rounded-lg">
                <div>
                  <p className="text-sm font-medium">Level {earning.level} Bonus</p>
                  <p className="text-xs text-cgp-text">{new Date(earning.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-medium text-cgp-green">+${parseFloat(earning.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}