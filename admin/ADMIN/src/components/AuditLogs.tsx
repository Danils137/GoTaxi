import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Settings,
  Shield,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-20 14:35:22',
      user: 'admin@taxifinder.com',
      userRole: 'Super Admin',
      action: 'user_suspended',
      target: 'Mike Wilson (Driver)',
      targetId: 'U-003456',
      details: 'User suspended due to policy violation',
      ipAddress: '192.168.1.100',
      severity: 'high'
    },
    {
      id: 2,
      timestamp: '2024-01-20 14:20:15',
      user: 'support@taxifinder.com',
      userRole: 'Support Agent',
      action: 'ticket_resolved',
      target: 'Support Ticket #T-001567',
      targetId: 'T-001567',
      details: 'Billing issue resolved, refund processed',
      ipAddress: '192.168.1.101',
      severity: 'medium'
    },
    {
      id: 3,
      timestamp: '2024-01-20 13:45:30',
      user: 'ops@taxifinder.com',
      userRole: 'Operations Admin',
      action: 'ride_reassigned',
      target: 'Ride #R-2024-001234',
      targetId: 'R-2024-001234',
      details: 'Ride reassigned from John Smith to Sarah Johnson',
      ipAddress: '192.168.1.102',
      severity: 'medium'
    },
    {
      id: 4,
      timestamp: '2024-01-20 12:30:45',
      user: 'admin@taxifinder.com',
      userRole: 'Super Admin',
      action: 'config_updated',
      target: 'Surge Zone: Business District',
      targetId: 'SZ-001',
      details: 'Surge multiplier changed from 1.3x to 1.5x',
      ipAddress: '192.168.1.100',
      severity: 'low'
    },
    {
      id: 5,
      timestamp: '2024-01-20 11:15:12',
      user: 'system',
      userRole: 'System',
      action: 'login_failed',
      target: 'admin@taxifinder.com',
      targetId: 'U-000001',
      details: 'Failed login attempt - invalid password',
      ipAddress: '203.0.113.1',
      severity: 'high'
    },
    {
      id: 6,
      timestamp: '2024-01-20 10:22:30',
      user: 'support@taxifinder.com',
      userRole: 'Support Agent',
      action: 'user_profile_updated',
      target: 'Emily Davis (Driver)',
      targetId: 'U-004567',
      details: 'Vehicle information updated',
      ipAddress: '192.168.1.101',
      severity: 'low'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action.split('_')[0]) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'ride':
        return <Activity className="h-4 w-4" />;
      case 'config':
        return <Settings className="h-4 w-4" />;
      case 'login':
        return <Shield className="h-4 w-4" />;
      case 'ticket':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="status-badge bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </span>
        );
      case 'medium':
        return <span className="status-badge bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="status-badge bg-emerald-100 text-emerald-800">Low</span>;
      default:
        return <span className="status-badge status-inactive">{severity}</span>;
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    activeFilter === 'all' || log.action.includes(activeFilter) || log.severity === activeFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          <button className="btn btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Actions</p>
                <p className="text-2xl font-bold text-slate-900">156</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Severity</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed Logins</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Sessions</p>
                <p className="text-2xl font-bold text-emerald-600">12</p>
              </div>
              <User className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user, action, or target..."
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <select 
                className="input w-40"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="user">User Actions</option>
                <option value="ride">Ride Actions</option>
                <option value="config">Config Changes</option>
                <option value="login">Auth Events</option>
                <option value="high">High Severity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm text-slate-900">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{log.user}</div>
                        <div className="text-xs text-slate-500">{log.userRole}</div>
                        <div className="text-xs text-slate-400">{log.ipAddress}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-2 text-sm text-slate-900 capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm text-slate-900">{log.target}</div>
                        <div className="text-xs text-slate-500">{log.targetId}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {log.details}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getSeverityBadge(log.severity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
          <span className="font-medium">{auditLogs.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary">Previous</button>
          <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">1</span>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;