import {
  Target,
  Shield,
  Users,
  Globe,
  TrendingUp,
  Award,
} from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      desc: 'We prioritize the safety of your assets with bank-level encryption, cold storage, and multi-factor authentication.',
    },
    {
      icon: Target,
      title: 'Transparency',
      desc: 'Every transaction, profit, and fee is clearly displayed. No hidden charges, ever.',
    },
    {
      icon: TrendingUp,
      title: 'Proven Returns',
      desc: 'Our investment strategies have delivered consistent daily returns to thousands of investors worldwide.',
    },
    {
      icon: Users,
      title: 'Community',
      desc: 'Join a growing community of smart investors who trust CGP for their crypto wealth growth.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      desc: 'Invest from anywhere in the world. Our platform supports multiple currencies and cryptocurrencies.',
    },
    {
      icon: Award,
      title: 'Excellence',
      desc: 'We continuously improve our platform and services to deliver the best investment experience.',
    },
  ]

  const stats = [
    { value: '2021', label: 'Founded' },
    { value: '25K+', label: 'Active Investors' },
    { value: '$120M+', label: 'Total Invested' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          About <span className="gradient-text">Capital Growth Program</span>
        </h1>
        <p className="text-lg text-cgp-text max-w-3xl mx-auto">
          We are on a mission to make crypto investing accessible, secure, and profitable for everyone. 
          Since 2021, we've helped thousands of investors grow their wealth with confidence.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-cgp-card/30 border-y border-cgp-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl lg:text-4xl font-bold text-cgp-gold mb-2">{stat.value}</p>
                <p className="text-sm text-cgp-text">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-cgp-text mb-4 leading-relaxed">
              Capital Growth Program was founded with a simple belief: everyone deserves access to high-quality 
              crypto investment opportunities. We bridge the gap between traditional finance and the crypto 
              revolution, offering secure, transparent, and profitable investment solutions.
            </p>
            <p className="text-cgp-text mb-4 leading-relaxed">
              Our team of financial experts, blockchain developers, and security specialists work tirelessly 
              to ensure your investments are managed with the utmost care and professionalism.
            </p>
            <ul className="space-y-3">
              {[
                'Trusted by thousands of investors worldwide',
                'Bank-level security and encryption',
                'Transparent fee structure with no hidden costs',
                '24/7 dedicated support team',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-cgp-text-light">
                  <div className="w-5 h-5 rounded-full bg-cgp-gold/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cgp-gold"></div>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Daily ROI Range', value: '1.2% - 3.2%' },
                { label: 'Plan Durations', value: '30 - 180 Days' },
                { label: 'Min Investment', value: '$4,000' },
                { label: 'Supported Crypto', value: '6 Currencies' },
                { label: 'Withdrawal Time', value: '24 Hours' },
                { label: 'KYC Required', value: 'Yes' },
              ].map((item, i) => (
                <div key={i} className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-xs text-cgp-text mb-1">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-cgp-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-cgp-text max-w-2xl mx-auto">
              These principles guide everything we do at Capital Growth Program.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-cgp-card border border-cgp-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-cgp-gold/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-cgp-gold" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-cgp-text">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}