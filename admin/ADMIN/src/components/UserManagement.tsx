import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle,
  Phone,
  Mail,
  Star,
  Car
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      type: 'driver',
      status: 'active',
      rating: 4.8,
      totalRides: 156,
      vehicleInfo: 'Toyota Camry - ABC123',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      type: 'rider',
      status: 'active',
      rating: 4.9,
      totalRides: 89,
      vehicleInfo: null,
      joinDate: '2024-02-03'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 345-6789',
      type: 'driver',
      status: 'suspended',
      rating: 3.2,
      totalRides: 234,
      vehicleInfo: 'Honda Accord - XYZ789',
      joinDate: '2023-11-20'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      type: 'rider',
      status: 'active',
      rating: 4.7,
      totalRides: 45,
      vehicleInfo: null,
      joinDate: '2024-03-10'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesFilter = activeFilter === 'all' || user.type === activeFilter || user.status === activeFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">Active</span>;
      case 'suspended':
        return <span className="status-badge status-suspended">Suspended</span>;
      case 'inactive':
        return <span className="status-badge status-inactive">Inactive</span>;
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <button className="btn btn-primary">Add New User</button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <select 
                className="input w-40"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="driver">Drivers</option>
                <option value="rider">Riders</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rides
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-700">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">ID: {user.id.toString().padStart(6, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900">
                          <Mail className="h-3 w-3 mr-2 text-slate-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Phone className="h-3 w-3 mr-2 text-slate-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {user.type === 'driver' ? (
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                        )}
                        <span className="text-sm text-slate-900 capitalize">{user.type}</span>
                      </div>
                      {user.vehicleInfo && (
                        <div className="text-xs text-slate-500 mt-1">{user.vehicleInfo}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-slate-900">{user.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-900">{user.totalRides}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8 text-red-600 hover:text-red-700">
                          <Ban className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
          <span className="font-medium">{users.length}</span> results
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

export default UserManagement;