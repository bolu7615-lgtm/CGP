import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)

    // Simulate sending - in production, connect to API
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      toast.success('Message sent! We will respond within 24 hours.')
    }, 1500)
  }

  if (sent) {
    return (
      <div className="animate-fade-in py-20 text-center">
        <div className="w-16 h-16 bg-cgp-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-cgp-green" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Message Sent!</h1>
        <p className="text-cgp-text max-w-md mx-auto mb-8">
          Thank you for reaching out. Our support team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-cgp-text max-w-2xl mx-auto">
          Have questions? We're here to help. Reach out to our support team anytime.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: 'Email',
                value: 'support@capitalgrowthprogram.com',
                desc: 'For general inquiries',
              },
              {
                icon: Phone,
                title: 'Phone',
                value: '+1 (555) 123-4567',
                desc: 'Mon-Fri, 9AM-6PM EST',
              },
              {
                icon: MapPin,
                title: 'Address',
                value: 'New York, NY 10001',
                desc: 'United States',
              },
              {
                icon: Clock,
                title: 'Response Time',
                value: 'Within 24 Hours',
                desc: 'For all inquiries',
              },
            ].map((item, i) => (
              <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cgp-gold/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cgp-gold" />
                  </div>
                  <h3 className="font-medium">{item.title}</h3>
                </div>
                <p className="text-sm font-medium">{item.value}</p>
                <p className="text-xs text-cgp-text">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-cgp-card border border-cgp-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-cgp-gold" />
                <h2 className="text-xl font-semibold">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="deposit">Deposit Issue</option>
                    <option value="withdrawal">Withdrawal Issue</option>
                    <option value="kyc">KYC Verification</option>
                    <option value="account">Account Access</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors resize-none"
                    placeholder="Describe your issue or question..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}