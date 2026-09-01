import { useState } from 'react'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is Capital Growth Program?',
          a: 'Capital Growth Program (CGP) is a premium crypto investment platform that allows you to invest in carefully curated plans with daily returns ranging from 1.2% to 3.2%. We combine advanced trading strategies with secure asset management to deliver consistent profits.',
        },
        {
          q: 'How do I create an account?',
          a: 'Simply click "Get Started" on our homepage, fill in your details, verify your email, and complete KYC verification. The entire process takes less than 10 minutes.',
        },
        {
          q: 'Is KYC verification required?',
          a: 'Yes, KYC (Know Your Customer) verification is mandatory for all users. This helps us comply with regulations and ensures the security of all investments. You will need to upload a valid ID and a selfie.',
        },
      ],
    },
    {
      category: 'Investments',
      questions: [
        {
          q: 'What is the minimum investment amount?',
          a: 'Our Starter Plan begins at $4,000. We cater to serious investors looking for substantial returns. Plans range from $4,000 to $1,000,000 depending on the tier.',
        },
        {
          q: 'How are profits calculated and paid?',
          a: 'Profits are calculated daily based on your plan\'s ROI percentage. They are automatically credited to your wallet every 24 hours. You can withdraw or reinvest at any time.',
        },
        {
          q: 'Can I withdraw my principal early?',
          a: 'Early withdrawal is available with a 20% fee. We recommend holding until maturity for maximum returns. Principal is automatically returned at the end of the plan term.',
        },
        {
          q: 'What happens when my plan matures?',
          a: 'Upon maturity, your principal investment is returned to your available balance, along with any remaining profits. You can then withdraw or reinvest in a new plan.',
        },
      ],
    },
    {
      category: 'Deposits & Withdrawals',
      questions: [
        {
          q: 'What cryptocurrencies do you support?',
          a: 'We support Bitcoin (BTC), Ethereum (ETH), USDT (TRC20 & ERC20), BNB (BEP20), and Solana (SOL) for both deposits and withdrawals.',
        },
        {
          q: 'What is the minimum deposit?',
          a: 'The minimum deposit is $50 USD equivalent in your chosen cryptocurrency.',
        },
        {
          q: 'How long do withdrawals take?',
          a: 'Withdrawals are processed within 24 hours after admin approval. You will receive an email notification once processed.',
        },
        {
          q: 'Is there a withdrawal fee?',
          a: 'Yes, there is a 2% withdrawal fee. The minimum withdrawal amount is $100.',
        },
      ],
    },
    {
      category: 'Security',
      questions: [
        {
          q: 'How secure is my investment?',
          a: 'We use bank-level encryption, cold storage for crypto assets, 2FA authentication, and regular security audits. Your funds are protected by industry-leading security measures.',
        },
        {
          q: 'What is two-factor authentication (2FA)?',
          a: '2FA adds an extra layer of security by requiring a verification code sent to your email every time you log in. This prevents unauthorized access even if your password is compromised.',
        },
        {
          q: 'How do I change my password?',
          a: 'Go to Settings > Security in your dashboard. Enter your current password and your new password to update it.',
        },
      ],
    },
    {
      category: 'Referrals',
      questions: [
        {
          q: 'How does the referral program work?',
          a: 'Share your unique referral link with friends. You earn 5% on Level 1, 2% on Level 2, and 1% on Level 3 referrals\' investments. Bonuses are credited instantly.',
        },
        {
          q: 'When do I receive referral bonuses?',
          a: 'Referral bonuses are credited to your wallet immediately when your referred user makes an investment.',
        },
      ],
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-cgp-text max-w-2xl mx-auto">
          Find answers to common questions about Capital Growth Program.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {faqs.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-cgp-gold">{section.category}</h2>
            <div className="space-y-3">
              {section.questions.map((faq, qIdx) => {
                const globalIdx = `${sectionIdx}-${qIdx}`
                const isOpen = openIndex === globalIdx
                return (
                  <div
                    key={qIdx}
                    className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-sm pr-4">{faq.q}</span>
                      <ChevronRight
                        className={`w-5 h-5 text-cgp-text flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-cgp-text leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-cgp-gold/10 to-cgp-blue/10 border border-cgp-gold/20 rounded-xl p-6 text-center">
          <MessageCircle className="w-8 h-8 text-cgp-gold mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Still have questions?</h3>
          <p className="text-sm text-cgp-text mb-4">
            Our support team is available 24/7 to help you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold text-sm"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  )
}