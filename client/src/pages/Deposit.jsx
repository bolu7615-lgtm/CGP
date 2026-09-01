import { useState } from 'react'
import {
  Copy,
  Check,
  ArrowDownLeft,
  Upload,
  Bitcoin,
  AlertCircle,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Hardcoded BTC address and QR code for ALL users
const BTC_ADDRESS = 'bc1qpsxjwdjlh5jssgy8qd7cmm69n50nvh94sxuq56'
const BTC_QR_IMAGE = '/btc-qr.png' // Save your QR code image as public/btc-qr.png

export default function Deposit() {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [btcAmount, setBtcAmount] = useState('')
  const [depositData, setDepositData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [proofFile, setProofFile] = useState(null)

  const copyAddress = () => {
    navigator.clipboard.writeText(BTC_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('BTC address copied!')
  }

  const handleCreateDeposit = async () => {
    if (!amount || parseFloat(amount) < 50) {
      toast.error('Minimum deposit is $50')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/deposits', {
        amount: parseFloat(amount),
        cryptoCurrency: 'BTC',
      })
      setDepositData(res.data.data)
      setStep(2)
      toast.success('Deposit initiated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create deposit')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadProof = async () => {
    if (!proofFile) {
      toast.error('Please select a proof image')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('proof', proofFile)

    try {
      await api.post(`/deposits/${depositData.depositId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Proof uploaded! Awaiting confirmation.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload proof')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Deposit Funds</h1>
        <p className="text-cgp-text">Add funds via Bitcoin (BTC)</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-6">
        {[
          { num: 1, label: 'Amount' },
          { num: 2, label: 'Send BTC' },
          { num: 3, label: 'Confirm' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.num ? 'bg-cgp-gold text-cgp-dark' : 'bg-cgp-border text-cgp-text'
            }`}>
              {s.num}
            </div>
            <span className={`text-sm ${step >= s.num ? 'text-white' : 'text-cgp-text'}`}>{s.label}</span>
            {s.num < 3 && <div className="w-8 h-px bg-cgp-border mx-2"></div>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl">
          <div className="space-y-5">
            {/* BTC Badge */}
            <div className="flex items-center gap-3 bg-cgp-dark rounded-xl p-4 border border-cgp-border">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium">Bitcoin (BTC)</p>
                <p className="text-xs text-cgp-text">Only BTC deposits accepted</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cgp-text">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="50"
                  className="w-full pl-8 pr-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  placeholder="Minimum $50"
                />
              </div>
            </div>

            <div className="bg-cgp-dark rounded-xl p-4 border border-cgp-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cgp-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm text-cgp-text">
                  <p className="text-white font-medium mb-1">Important Notes:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Send only <strong>Bitcoin (BTC)</strong> to this address</li>
                    <li>Minimum deposit: <strong>$50 USD</strong></li>
                    <li>Use <strong>Bitcoin network only</strong></li>
                    <li>Deposits are confirmed after 3 network confirmations</li>
                    <li>Upload payment proof after sending</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateDeposit}
              disabled={loading || !amount}
              className="w-full py-3.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-5 h-5" />
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && depositData && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Send Bitcoin (BTC)</h2>
            <p className="text-sm text-cgp-text">Send BTC to the address below</p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-4 mb-6 flex justify-center">
            <img src={BTC_QR_IMAGE} alt="BTC QR Code" className="w-48 h-48" />
          </div>

          {/* BTC Address */}
          <div className="bg-cgp-dark rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-cgp-text">Bitcoin Address</span>
              <button
                onClick={copyAddress}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-cgp-green" /> : <Copy className="w-4 h-4 text-cgp-text" />}
              </button>
            </div>
            <p className="text-sm font-mono break-all">{BTC_ADDRESS}</p>
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-cgp-dark rounded-xl p-3">
              <p className="text-cgp-text text-xs">Amount (USD)</p>
              <p className="font-semibold">${parseFloat(amount || 0).toFixed(2)}</p>
            </div>
            <div className="bg-cgp-dark rounded-xl p-3">
              <p className="text-cgp-text text-xs">Deposit ID</p>
              <p className="font-mono text-xs">{depositData?.depositId}</p>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="border-t border-cgp-border pt-6">
            <p className="text-sm font-medium mb-3">Upload Payment Proof</p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="flex-1 text-sm text-cgp-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cgp-dark file:text-white hover:file:bg-white/5"
              />
              <button
                onClick={handleUploadProof}
                disabled={loading || !proofFile}
                className="px-4 py-2.5 bg-cgp-gold text-cgp-dark text-sm font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full mt-4 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
          >
            I've Sent the BTC
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-xl text-center">
          <div className="w-16 h-16 bg-cgp-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowDownLeft className="w-8 h-8 text-cgp-gold" />
          </div>
          <h2 className="text-xl font-bold mb-2">Deposit Submitted!</h2>
          <p className="text-cgp-text mb-6">
            Your BTC deposit is being processed. You'll receive an email confirmation once confirmed.
          </p>
          <div className="bg-cgp-dark rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-cgp-text mb-1">Deposit ID</p>
            <p className="text-sm font-mono">{depositData?.depositId}</p>
          </div>
          <button
            onClick={() => {
              setStep(1)
              setAmount('')
              setDepositData(null)
              setProofFile(null)
            }}
            className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold"
          >
            Make Another Deposit
          </button>
        </div>
      )}
    </div>
  )
}