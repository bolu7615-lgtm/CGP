import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Key,
  Settings,
  UserPlus,
  UserMinus,
  Edit3,
  DollarSign,
  Lock,
  Unlock
} from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 15;

  // Generate realistic mock audit logs
  const generateMockLogs = () => {
    const categories = [
      { name: 'auth', icon: Key, color: 'blue', label: 'Authentication' },
      { name: 'user', icon: User, color: 'green', label: 'User Management' },
      { name: 'transaction', icon: DollarSign, color: 'purple', label: 'Transaction' },
      { name: 'security', icon: Shield, color: 'red', label: 'Security' },
      { name: 'system', icon: Settings, color: 'gray', label: 'System' },
      { name: 'content', icon: FileText, color: 'orange', label: 'Content' },
    ];

    const actions = {
      auth: [
        'Admin login successful',
        'Admin login failed - Invalid credentials',
        'Password changed',
        'Two-factor authentication enabled',
        'Session expired',
        'Logout initiated',
        'API key regenerated',
        'Token refresh attempted'
      ],
      user: [
        'User account created',
        'User account suspended',
        'User account reactivated',
        'User role updated to Admin',
        'User profile updated',
        'Bulk user import completed',
        'User deleted permanently',
        'User email verified'
      ],
      transaction: [
        'Payment processed successfully',
        'Refund issued',
        'Withdrawal approved',
        'Withdrawal rejected',
        'Escrow released',
        'Platform fee adjusted',
        'Payment dispute opened',
        'Payment dispute resolved'
      ],
      security: [
        'IP whitelist updated',
        'Failed login attempt blocked',
        'Suspicious activity detected',
        'Security policy updated',
        'Data export initiated',
        'Backup completed',
        'Firewall rule modified',
        'Encryption key rotated'
      ],
      system: [
        'System settings updated',
        'Maintenance mode enabled',
        'Maintenance mode disabled',
        'Email template updated',
        'Notification settings changed',
        'Rate limit adjusted',
        'Cache cleared',
        'Database backup created'
      ],
      content: [
        'Page content updated',
        'FAQ article published',
        'Terms of service updated',
        'Privacy policy modified',
        'Banner image changed',
        'Blog post published',
        'Category structure updated',
        'SEO metadata updated'
      ]
    };

    const users = [
      { name: 'Admin User', email: 'admin@cgp.com' },
      { name: 'System', email: 'system@cgp.com' },
      { name: 'Sarah Johnson', email: 'sarah.j@example.com' },
      { name: 'Michael Chen', email: 'm.chen@example.com' },
      { name: 'Auto-Scheduler', email: 'scheduler@cgp.com' },
      { name: 'Security Bot', email: 'security@cgp.com' },
    ];

    const severities = ['info', 'success', 'warning', 'error'];
    const severityWeights = [0.4, 0.3, 0.2, 0.1];

    const generatedLogs = [];
    const now = new Date();

    for (let i = 0; i < 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const actionList = actions[category.name];
      const action = actionList[Math.floor(Math.random() * actionList.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      // Weighted random severity
      const rand = Math.random();
      let severity = 'info';
      let cumulative = 0;
      for (let j = 0; j < severities.length; j++) {
        cumulative += severityWeights[j];
        if (rand <= cumulative) {
          severity = severities[j];
          break;
        }
      }

      // Override severity based on action keywords
      if (action.includes('failed') || action.includes('blocked') || action.includes('rejected')) {
        severity = Math.random() > 0.5 ? 'error' : 'warning';
      } else if (action.includes('successful') || action.includes('completed') || action.includes('approved')) {
        severity = 'success';
      } else if (action.includes('suspicious') || action.includes('detected')) {
        severity = 'warning';
      }

      const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000 - Math.random() * 60 * 60 * 1000);

      const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      generatedLogs.push({
        id: `AUD-${Date.now()}-${i}`,
        timestamp,
        category: category.name,
        categoryLabel: category.label,
        categoryIcon: category.icon,
        categoryColor: category.color,
        action,
        user: user.name,
        userEmail: user.email,
        severity,
        ip,
        details: `Performed by ${user.name} (${user.email}) from IP ${ip}. Action completed at ${timestamp.toISOString()}.`,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: `sess_${Math.random().toString(36).substring(2, 15)}`,
          requestId: `req_${Math.random().toString(36).substring(2, 15)}`,
        }
      });
    }

    return generatedLogs.sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.action.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.userEmail.toLowerCase().includes(query) ||
        log.ip.includes(query) ||
        log.categoryLabel.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(log => log.category === selectedCategory);
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      result = result.filter(log => log.severity === selectedSeverity);
    }

    // Date range filter
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    result = result.filter(log => log.timestamp >= cutoffDate);

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSeverity, dateRange, logs]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'success':
        return { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
      case 'warning':
        return { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'error':
        return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      default:
        return { icon: Info, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    }
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'auth': return Key;
      case 'user': return User;
      case 'transaction': return DollarSign;
      case 'security': return Shield;
      case 'system': return Settings;
      case 'content': return FileText;
      default: return Info;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Category', 'Action', 'User', 'Email', 'Severity', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.categoryLabel,
        `"${log.action}"`,
        log.user,
        log.userEmail,
        log.severity,
        log.ip
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newLogs = generateMockLogs();
      setLogs(newLogs);
      setFilteredLogs(newLogs);
      setIsLoading(false);
    }, 800);
  };

  const severityCounts = {
    info: logs.filter(l => l.severity === 'info').length,
    success: logs.filter(l => l.severity === 'success').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    error: logs.filter(l => l.severity === 'error').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-sm text-gray-500">Track all platform activities and changes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Info', count: severityCounts.info, color: 'blue', icon: Info },
            { label: 'Success', count: severityCounts.success, color: 'green', icon: CheckCircle2 },
            { label: 'Warnings', count: severityCounts.warning, color: 'amber', icon: AlertTriangle },
            { label: 'Errors', count: severityCounts.error, color: 'red', icon: XCircle },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`bg-white rounded-xl border border-${stat.color}-200 p-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs by action, user, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm bg-white min-w-[140px]"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="user">User Management</option>
              <option value="transaction">Transaction</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="content">Content</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm bg-white min-w-[140px]"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm bg-white min-w-[140px]"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading audit logs...</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Shield className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedLogs.map((log) => {
                      const severityConfig = getSeverityConfig(log.severity);
                      const SeverityIcon = severityConfig.icon;
                      const CategoryIcon = getCategoryIcon(log.category);

                      return (
                        <tr 
                          key={log.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${severityConfig.bg} ${severityConfig.text} border ${severityConfig.border}`}>
                              <SeverityIcon className="w-3.5 h-3.5" />
                              {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span title={formatDate(log.timestamp)}>
                                {formatRelativeTime(log.timestamp)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg bg-${log.categoryColor}-100 flex items-center justify-center`}>
                                <CategoryIcon className={`w-3.5 h-3.5 text-${log.categoryColor}-600`} />
                              </div>
                              <span className="text-sm text-gray-700">{log.categoryLabel}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 font-medium max-w-xs truncate">{log.action}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                {log.user.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm text-gray-900">{log.user}</p>
                                <p className="text-xs text-gray-400">{log.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{log.ip}</code>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const severityConfig = getSeverityConfig(selectedLog.severity);
                    const SeverityIcon = severityConfig.icon;
                    return (
                      <div className={`w-10 h-10 rounded-xl ${severityConfig.bg} flex items-center justify-center`}>
                        <SeverityIcon className={`w-5 h-5 ${severityConfig.text}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                    <p className="text-sm text-gray-500">{selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(selectedLog.category);
                      return <CategoryIcon className="w-4 h-4 text-gray-600" />;
                    })()}
                    <span className="text-sm font-medium text-gray-900">{selectedLog.categoryLabel}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Severity</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium capitalize ${
                    selectedLog.severity === 'error' ? 'text-red-600' :
                    selectedLog.severity === 'warning' ? 'text-amber-600' :
                    selectedLog.severity === 'success' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {selectedLog.severity}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Action</p>
                <p className="text-sm text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                  {selectedLog.action}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {selectedLog.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedLog.user}</p>
                      <p className="text-xs text-gray-500">{selectedLog.userEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">IP Address</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">{selectedLog.ip}</code>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamp</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(selectedLog.timestamp)}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Details</p>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg leading-relaxed">
                  {selectedLog.details}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Metadata</p>
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">User Agent</span>
                    <span className="text-gray-700 truncate max-w-[200px]">{selectedLog.metadata.userAgent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Session ID</span>
                    <code className="text-xs bg-white px-2 py-0.5 rounded text-gray-600">{selectedLog.metadata.sessionId}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Request ID</span>
                    <code className="text-xs bg-white px-2 py-0.5 rounded text-gray-600">{selectedLog.metadata.requestId}</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;