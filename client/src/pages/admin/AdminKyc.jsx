import { useState, useEffect } from 'react'
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'SUBMITTED' })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      const res = await api.get(`/kyc/all?${params}`)
      setSubmissions(res.data.data.submissions)
    } catch (err) {
      toast.error('Failed to load KYC submissions')
    } finally {
      setLoading(false)
    }
  }

  const approveKyc = async (userId) => {
    try {
      await api.post(`/kyc/${userId}/approve`)
      toast.success('KYC approved successfully')
      fetchSubmissions()
    } catch (err) {
      toast.error('Failed to approve KYC')
    }
  }

  const rejectKyc = async () => {
    if (!rejectionReason.trim() || rejectionReason.length < 10) {
      toast.error('Please provide a detailed reason (min 10 chars)')
      return
    }
    try {
      await api.post(`/kyc/${selectedSubmission.id}/reject`, { reason: rejectionReason })
      toast.success('KYC rejected')
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch (err) {
      toast.error('Failed to reject KYC')
    }
  }

  const openRejectModal = (submission) => {
    setSelectedSubmission(submission)
    setShowRejectModal(true)
  }

  const getStatusBadge = (status) => {
    const colors = {
      APPROVED: 'text-cgp-green bg-cgp-green/10',
      SUBMITTED: 'text-cgp-gold bg-cgp-gold/10',
      REJECTED: 'text-cgp-red bg-cgp-red/10',
      PENDING: 'text-cgp-text bg-white/5',
    }
    return colors[status] || colors.PENDING
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
        <h1 className="text-2xl font-bold">KYC Verifications</h1>
        <p className="text-cgp-text">Review and manage identity verification submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: submissions.filter(s => s.kycStatus === 'PENDING').length, color: 'text-cgp-text' },
          { label: 'Submitted', value: submissions.filter(s => s.kycStatus === 'SUBMITTED').length, color: 'text-cgp-gold' },
          { label: 'Approved', value: submissions.filter(s => s.kycStatus === 'APPROVED').length, color: 'text-cgp-green' },
          { label: 'Rejected', value: submissions.filter(s => s.kycStatus === 'REJECTED').length, color: 'text-cgp-red' },
        ].map((stat, i) => (
          <div key={i} className="bg-cgp-card border border-cgp-border rounded-xl p-4">
            <p className="text-2xl font-bold {stat.color}">{stat.value}</p>
            <p className="text-sm text-cgp-text">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="px-3 py-2.5 bg-cgp-card border border-cgp-border rounded-xl text-sm text-white focus:border-cgp-gold"
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-cgp-card border border-cgp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-cgp-text uppercase bg-cgp-dark/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Documents</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cgp-border">
              {submissions.map((sub) => (
                <tr key={sub.id} className="text-sm hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{sub.firstName} {sub.lastName}</p>
                    <p className="text-xs text-cgp-text">{sub.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(sub.kycStatus)}`}>
                      {sub.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cgp-text">
                    {sub.kycSubmittedAt ? new Date(sub.kycSubmittedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-cgp-text">{sub.kycDocuments?.length || 0} documents</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-blue"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {sub.kycStatus === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => approveKyc(sub.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-green"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(sub)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-cgp-red"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-cgp-text">
                    No KYC submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">KYC Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-xs text-cgp-text mb-1">Name</p>
                  <p className="font-medium">{selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-xs text-cgp-text mb-1">Email</p>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-xs text-cgp-text mb-1">Phone</p>
                  <p className="font-medium">{selectedSubmission.phone || 'N/A'}</p>
                </div>
                <div className="bg-cgp-dark rounded-xl p-4">
                  <p className="text-xs text-cgp-text mb-1">Country</p>
                  <p className="font-medium">{selectedSubmission.country || 'N/A'}</p>
                </div>
              </div>

              {selectedSubmission.kycRejectionReason && (
                <div className="bg-cgp-red/10 border border-cgp-red/20 rounded-xl p-4">
                  <p className="text-xs text-cgp-red mb-1">Rejection Reason</p>
                  <p className="text-sm">{selectedSubmission.kycRejectionReason}</p>
                </div>
              )}

              {/* Documents */}
              {selectedSubmission.kycDocuments?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Documents</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedSubmission.kycDocuments.map((doc) => (
                      <div key={doc.id} className="bg-cgp-dark rounded-xl p-3">
                        <p className="text-xs text-cgp-text mb-2">{doc.type}</p>
                        {doc.frontImage && (
                          <img
                            src={doc.frontImage}
                            alt="Document"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        {doc.backImage && (
                          <img
                            src={doc.backImage}
                            alt="Back"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        {doc.selfieImage && (
                          <img
                            src={doc.selfieImage}
                            alt="Selfie"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.kycStatus === 'SUBMITTED' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { approveKyc(selectedSubmission.id); setSelectedSubmission(null) }}
                    className="flex-1 py-3 bg-cgp-green text-white font-semibold rounded-xl hover:bg-cgp-green/80"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 py-3 bg-cgp-red text-white font-semibold rounded-xl hover:bg-cgp-red/80"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cgp-card border border-cgp-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject KYC</h2>
            <p className="text-sm text-cgp-text mb-4">
              {selectedSubmission.firstName} {selectedSubmission.lastName}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold mb-4 resize-none"
              placeholder="Provide a detailed reason for rejection..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectionReason('') }}
                className="flex-1 py-3 border border-cgp-border text-white font-semibold rounded-xl hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={rejectKyc}
                className="flex-1 py-3 bg-cgp-red text-white font-semibold rounded-xl hover:bg-cgp-red/80"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}