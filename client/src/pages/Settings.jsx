import { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, fetchUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  // Profile form
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
    address: '',
  })

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Notifications
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
      })
      setNotifications(user.emailNotifications !== false)
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', profile)
      await fetchUser()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    setSaving(true)
    try {
      await api.put('/users/settings', { emailNotifications: notifications })
      await fetchUser()
      toast.success('Notification preferences saved!')
    } catch (err) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-cgp-text">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cgp-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cgp-gold text-cgp-gold'
                  : 'border-transparent text-cgp-text hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-2xl">
          <h2 className="font-semibold mb-6">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={profile.country}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                placeholder="123 Main St"
              />
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-2xl">
          <h2 className="font-semibold mb-6">Change Password</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 pr-12 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cgp-text hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 pr-12 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cgp-text hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 pr-12 py-3 bg-cgp-dark border border-cgp-border rounded-xl text-white placeholder-cgp-text focus:border-cgp-gold focus:ring-1 focus:ring-cgp-gold transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cgp-text hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={savePassword}
            disabled={saving}
            className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-cgp-card border border-cgp-border rounded-xl p-6 max-w-2xl">
          <h2 className="font-semibold mb-6">Notification Preferences</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-cgp-dark rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-cgp-gold" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-cgp-text">Receive updates about deposits, withdrawals, and profits</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications ? 'bg-cgp-gold' : 'bg-cgp-border'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
          <button
            onClick={saveNotifications}
            disabled={saving}
            className="px-6 py-3 bg-cgp-gold text-cgp-dark font-semibold rounded-xl btn-gold disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  )
}