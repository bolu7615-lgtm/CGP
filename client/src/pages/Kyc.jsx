import { useState, useEffect } from 'react'
import {
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Camera,
  FileText,
  CreditCard,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Kyc() {
  const [kycStatus, setKycStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    documentType: 'PASSPORT',
    documentNumber: '',
    expiryDate: '',
  })
  const [files, setFiles] = useState({
    frontImage: null,
    backImage: null,
    selfieImage: null,
  })

  useEffect(() => {
    fetchKycStatus()
  }, [])

  const fetchKycStatus = async () => {
    try {
      const res = await api.get('/kyc/status')
      setKycStatus(res.data.data)
    } catch (err) {
      toast.error('Failed to load KYC status')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e, field) => {
    setFiles(prev => ({ ...prev, [field]: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!files.frontImage) {
      toast.error('Front image of ID is required')
      return
    }

    setSubmitting(true)
    const data = new FormData()
    data.append('documentType', formData.documentType)
    data.append('documentNumber', formData.documentNumber)
    data.append('expiryDate', formData.expiryDate)
    data.append('frontImage', files.frontImage)
    if (files.backImage) data.append('backImage', files.backImage)
    if (files.selfieImage) data.append('selfieImage', files.selfieImage)

    try {
      await api.post('/kyc/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('KYC documents submitted successfully!')
      fetchKycStatus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusDisplay = () => {
    switch (kycStatus?.kycStatus) {
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          color: 'text-cgp-green',
          bg: 'bg-cgp-green/10',
          title: 'Verification Approved',
          message: 'Your identity has been verified. You have full access to all platform features.',
        }
      case 'SUBMITTED':
        return {
          icon: Clock,
          color: 'text-cgp-gold',
          bg: 'bg-cgp-gold/10',
          title: 'Under Review',
          message: 'Your documents are being reviewed. This usually takes 24-48 hours.',
        }
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-cgp-red',
          bg: 'bg-cgp-red/10',
          title: 'Verification Rejected',
          message: kycStatus?.kycRejectionReason || 'Your verification was rejected. Please resubmit.',
        }
      default:
        return {
          icon: Shield,
          color: 'text-cgp-text',
          bg: 'bg-white/5',
          title: 'Verification Required',
          message: 'Complete KYC verification to unlock withdrawals and investments.',
        }
    }
  }

  const statusDisplay = getStatusDisplay()
  const StatusIcon = statusDisplay.icon

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cgp-gold"></div>
      </div>
    )
  }

  // Show status if already submitted or approved
  if (kycStatus?.kycStatus === 'APPROVED' || kycStatus?.kycStatus === 'SUBMITTED') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-cgp-text">Identity verification status</p>
        </div>

        <div className={`${statusDisplay.bg} border border-cgp-border rounded-xl p-8 text-center`}>
          <StatusIcon className={`w-16 h-16 ${statusDisplay.color} mx-auto mb-4`} />
          <h2 className="text-xl font-bold mb-2">{statusDisplay.title}</h2>
          <p className="text-cgp-text max-w-md mx-auto">{statusDisplay.message}</p>

          {kycStatus?.kycStatus === 'SUBMITTED' && kycStatus?.kycSubmittedAt && (
            <p className="text-xs text-cgp-text mt-4">
              Submitted on {new Date(kycStatus.kycSubmittedAt).toLocaleDateString()}
            </p>
          )}

          {kycStatus?.kycStatus === 'APPROVED' && kycStatus?.kycVerifiedAt && (
            <p className="text-xs text-cgp-text mt-4">
              Verified on {new Date(kycStatus.kycVerifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {kycStatus?.kycDocuments?.length > 0 && (
          <div className="bg-cgp-card border border-cgp-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Submitted Documents</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {kycStatus.kycDocuments.map((doc) => (
                <div key={doc.id} className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-sm font-medium mb-1">{doc.type}</p>
                  <p className="text-xs text-cgp-text mb-2">{doc.documentNumber || 'N/A'}</p>
                  <img
                    src={doc.frontImage}
                    alt="Document"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show form if pending or rejected
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-cgp-text">Verify your identity to unlock all features</p>
      </div>

      <div className={`${statusDisplay.bg} border border-cgp-border rounded-xl p-6 mb-6`}>
        <div className="flex items-start gap-4">
          <StatusIcon className={`w-8 h-8 ${statusDisplay.color} flex-shrink-0`} />
          <div>
            <h2 className="font-semibold mb-1">{statusDisplay.title}</h2>
            <p className="text-sm text-cgp-text">{statusDisplay.message}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
              className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
            >
              <option value="PASSPORT">Passport</option>
              <option value="DRIVERS_LICENSE">Driver's License</option>
              <option value="NATIONAL_ID">National ID</option>
              <option value="RESIDENCE_PERMIT">Residence Permit</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Number</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="Enter document number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Front of ID *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'frontImage')}
                  className="hidden"
                  id="frontImage"
                  required
                />
                <label
                  htmlFor="frontImage"
                  className="flex flex-col items-center justify-center w-full h-32 bg-cgp-dark border-2 border-dashed border-cgp-border rounded-xl cursor-pointer hover:border-cgp-gold transition-colors"
                >
                  {files.frontImage ? (
                    <CheckCircle2 className="w-8 h-8 text-cgp-green" />
                  ) : (
                    <>
                      <CreditCard className="w-8 h-8 text-cgp-text mb-2" />
                      <span className="text-xs text-cgp-text">Click to upload</span>
                    </>
                  )}
                </label>
              </div>
              {files.frontImage && (
                <p className="text-xs text-cgp-green mt-1">{files.frontImage.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Back of ID</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'backImage')}
                  className="hidden"
                  id="backImage"
                />
                <label
                  htmlFor="backImage"
                  className="flex flex-col items-center justify-center w-full h-32 bg-cgp-dark border-2 border-dashed border-cgp-border rounded-xl cursor-pointer hover:border-cgp-gold transition-colors"
                >
                  {files.backImage ? (
                    <CheckCircle2 className="w-8 h-8 text-cgp-green" />
                  ) : (
                    <>
                      <FileText className="w-8 h-8 text-cgp-text mb-2" />
                      <span className="text-xs text-cgp-text">Click to upload</span>
                    </>
                  )}
                </label>
              </div>
              {files.backImage && (
                <p className="text-xs text-cgp-green mt-1">{files.backImage.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Selfie with ID</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'selfieImage')}
                  className="hidden"
                  id="selfieImage"
                />
                <label
                  htmlFor="selfieImage"
                  className="flex flex-col items-center justify-center w-full h-32 bg-cgp-dark border-2 border-dashed border-cgp-border rounded-xl cursor-pointer hover:border-cgp-gold transition-colors"
                >
                  {files.selfieImage ? (
                    <CheckCircle2 className="w-8 h-8 text-cgp-green" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-cgp-text mb-2" />
                      <span className="text-xs text-cgp-text">Click to upload</span>
                    </>
                  )}
                </label>
              </div>
              {files.selfieImage && (
                <p className="text-xs text-cgp-green mt-1">{files.selfieImage.name}</p>
              )}
            </div>
          </div>

          <div className="bg-cgp-dark rounded-xl p-4 border border-cgp-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cgp-gold flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cgp-text">
                <p className="text-white font-medium mb-1">Requirements:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Documents must be clear and legible</li>
                  <li>All four corners must be visible</li>
                  <li>Selfie must clearly show your face and ID</li>
                  <li>Maximum file size: 5MB per image</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !files.frontImage}
            className="w-full py-3.5 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  )
}