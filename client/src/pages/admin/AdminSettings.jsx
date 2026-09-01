import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  Mail, 
  CreditCard, 
  Palette,
  Check,
  AlertCircle,
  Loader2,
  Key,
  UserCog,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const [settings, setSettings] = useState({
    general: {
      siteName: 'CGP Platform',
      siteTagline: 'Connect. Grow. Prosper.',
      supportEmail: 'support@cgp.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      maintenanceMode: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newUserAlerts: true,
      transactionAlerts: true,
      disputeAlerts: true,
      marketingEmails: false,
      dailyDigest: true,
      weeklyReport: true,
    },
    security: {
      twoFactorAuth: true,
      loginAttempts: 5,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireSpecialChar: true,
      ipWhitelist: '',
      autoLock: true,
    },
    payments: {
      currency: 'USD',
      platformFee: 2.5,
      minWithdrawal: 50,
      maxWithdrawal: 10000,
      processingTime: '1-3 business days',
      enableRefunds: true,
      autoPayout: false,
    },
    appearance: {
      primaryColor: '#3b82f6',
      darkMode: false,
      sidebarCollapsed: false,
      compactView: false,
      showTours: true,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleChange = (tab, field, value) => {
    setSettings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleChange('general', 'siteName', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Tagline
          </label>
          <input
            type="text"
            value={settings.general.siteTagline}
            onChange={(e) => handleChange('general', 'siteTagline', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={settings.general.supportEmail}
              onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleChange('general', 'timezone', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST (Eastern Standard Time)</option>
            <option value="CST">CST (Central Standard Time)</option>
            <option value="MST">MST (Mountain Standard Time)</option>
            <option value="PST">PST (Pacific Standard Time)</option>
            <option value="GMT">GMT (Greenwich Mean Time)</option>
            <option value="CET">CET (Central European Time)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MMM DD, YYYY">MMM DD, YYYY</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Maintenance Mode</p>
            <p className="text-sm text-amber-700">Temporarily disable the site for maintenance</p>
          </div>
        </div>
        <button
          onClick={() => handleChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            settings.general.maintenanceMode ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive all notifications via email' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts' },
        { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Get notified when a new user registers' },
        { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Alerts for payments, withdrawals, and refunds' },
        { key: 'disputeAlerts', label: 'Dispute Alerts', desc: 'Immediate notification when a dispute is filed' },
        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional content and feature updates' },
        { key: 'dailyDigest', label: 'Daily Digest', desc: 'Summary of daily platform activity' },
        { key: 'weeklyReport', label: 'Weekly Report', desc: 'Comprehensive weekly analytics report' },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
          <div>
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
          <button
            onClick={() => handleChange('notifications', item.key, !settings.notifications[item.key])}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.notifications[item.key] ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Require 2FA for admin logins</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.security.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Auto-Lock Account</p>
              <p className="text-sm text-gray-500">Lock after failed attempts</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('security', 'autoLock', !settings.security.autoLock)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.security.autoLock ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.security.autoLock ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.security.loginAttempts}
            onChange={(e) => handleChange('security', 'loginAttempts', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IP Whitelist (comma-separated)
          </label>
          <input
            type="text"
            placeholder="192.168.1.1, 10.0.0.1"
            value={settings.security.ipWhitelist}
            onChange={(e) => handleChange('security', 'ipWhitelist', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Password Requirements</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireSpecialChar}
                  onChange={(e) => handleChange('security', 'requireSpecialChar', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-blue-800">Require special characters (!@#$%^&*)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Currency
          </label>
          <select
            value={settings.payments.currency}
            onChange={(e) => handleChange('payments', 'currency', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="NGN">NGN - Nigerian Naira</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Fee (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={settings.payments.platformFee}
            onChange={(e) => handleChange('payments', 'platformFee', parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              min="0"
              value={settings.payments.minWithdrawal}
              onChange={(e) => handleChange('payments', 'minWithdrawal', parseFloat(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              min="0"
              value={settings.payments.maxWithdrawal}
              onChange={(e) => handleChange('payments', 'maxWithdrawal', parseFloat(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Time
          </label>
          <input
            type="text"
            value={settings.payments.processingTime}
            onChange={(e) => handleChange('payments', 'processingTime', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Enable Refunds</p>
              <p className="text-sm text-gray-500">Allow refund processing</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('payments', 'enableRefunds', !settings.payments.enableRefunds)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.payments.enableRefunds ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.payments.enableRefunds ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Auto Payout</p>
              <p className="text-sm text-gray-500">Automatic weekly payouts</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('payments', 'autoPayout', !settings.payments.autoPayout)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.payments.autoPayout ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.payments.autoPayout ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Color Theme
        </label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('appearance', 'primaryColor', color.value)}
              className={`group relative w-full aspect-square rounded-xl border-2 transition-all ${
                settings.appearance.primaryColor === color.value
                  ? 'border-gray-900 scale-110 shadow-lg'
                  : 'border-gray-200 hover:border-gray-400 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {settings.appearance.primaryColor === color.value && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-500">Switch to dark theme</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('appearance', 'darkMode', !settings.appearance.darkMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.appearance.darkMode ? 'bg-gray-900' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.appearance.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Compact View</p>
              <p className="text-sm text-gray-500">Reduce spacing in tables</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('appearance', 'compactView', !settings.appearance.compactView)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.appearance.compactView ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.appearance.compactView ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Show Tours</p>
              <p className="text-sm text-gray-500">Display onboarding guides</p>
            </div>
          </div>
          <button
            onClick={() => handleChange('appearance', 'showTours', !settings.appearance.showTours)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.appearance.showTours ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.appearance.showTours ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: settings.appearance.primaryColor }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:opacity-80"
            style={{ borderColor: settings.appearance.primaryColor, color: settings.appearance.primaryColor }}
          >
            Outline Button
          </button>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: settings.appearance.primaryColor }}
          />
          <div
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: settings.appearance.primaryColor }}
          >
            Badge
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'payments': return renderPaymentSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your platform configuration</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-in slide-in-from-top-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">All settings have been saved successfully!</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.label} Settings
                </h2>
              </div>
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;