import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  Car,
  Plus,
  Eye,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const SupportTickets: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const tickets = [
    {
      id: 'T-001567',
      subject: 'Payment not processed correctly',
      description: 'My ride fare was charged twice on my credit card',
      user: 'Sarah Johnson',
      userType: 'rider',
      priority: 'high',
      status: 'open',
      category: 'billing',
      rideId: 'R-2024-001234',
      createdAt: '2024-01-20 09:15',
      lastUpdate: '2024-01-20 14:30',
      assignee: 'Support Agent 1',
      messages: 3
    },
    {
      id: 'T-001568',
      subject: 'Driver was rude and unprofessional',
      description: 'The driver was very rude during my trip and played loud music',
      user: 'Mike Wilson',
      userType: 'rider',
      priority: 'medium',
      status: 'in_progress',
      category: 'driver_behavior',
      rideId: 'R-2024-001235',
      createdAt: '2024-01-20 11:22',
      lastUpdate: '2024-01-20 13:45',
      assignee: 'Support Agent 2',
      messages: 5
    },
    {
      id: 'T-001569',
      subject: 'App keeps crashing during ride booking',
      description: 'The app crashes every time I try to book a ride',
      user: 'John Smith',
      userType: 'driver',
      priority: 'high',
      status: 'resolved',
      category: 'technical',
      rideId: null,
      createdAt: '2024-01-19 16:30',
      lastUpdate: '2024-01-20 10:15',
      assignee: 'Support Agent 3',
      messages: 7
    },
    {
      id: 'T-001570',
      subject: 'Unable to update vehicle information',
      description: 'I cannot update my car details in the driver profile',
      user: 'Emily Davis',
      userType: 'driver',
      priority: 'low',
      status: 'closed',
      category: 'account',
      rideId: null,
      createdAt: '2024-01-18 14:20',
      lastUpdate: '2024-01-19 09:30',
      assignee: 'Support Agent 1',
      messages: 4
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="status-badge bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="status-badge bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="status-badge bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="status-badge bg-slate-100 text-slate-800">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </span>
        );
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="status-badge bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="status-badge bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="status-badge bg-emerald-100 text-emerald-800">Low</span>;
      default:
        return <span className="status-badge status-inactive">{priority}</span>;
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    activeFilter === 'all' || ticket.status === activeFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved Today</p>
                <p className="text-2xl font-bold text-emerald-600">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-slate-900">2.5h</p>
              </div>
              <MessageSquare className="h-8 w-8 text-slate-600" />
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
                placeholder="Search tickets by ID, subject, or user..."
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
                <option value="all">All Tickets</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="table-row">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{ticket.id}</div>
                        <div className="text-sm text-slate-900 mt-1 font-medium">{ticket.subject}</div>
                        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {ticket.description}
                        </div>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                          {ticket.rideId && (
                            <span className="text-blue-600">Ride: {ticket.rideId}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {ticket.userType === 'driver' ? (
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 mr-2 text-emerald-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">{ticket.user}</div>
                          <div className="text-sm text-slate-500 capitalize">{ticket.userType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-900 capitalize">{ticket.category.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900">{ticket.assignee}</div>
                      <div className="flex items-center mt-1 text-sm text-slate-500">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {ticket.messages} messages
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;