import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Car,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  Upload,
  FileText,
  Calendar
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  totalDrivers: number;
  activeDrivers: number;
  totalRides: number;
  monthlyRevenue: number;
  joinDate: string;
  licenseNumber: string;
  contactPerson: string;
}

interface NewCompanyForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  licenseNumber: string;
  taxId: string;
  website: string;
  description: string;
  commissionRate: string;
  status: string;
}

const CompanyManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<NewCompanyForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    licenseNumber: '',
    taxId: '',
    website: '',
    description: '',
    commissionRate: '15',
    status: 'pending'
  });

  const companies: Company[] = [
    {
      id: 1,
      name: 'Metro Taxi Services',
      email: 'contact@metrotaxi.com',
      phone: '+1 (555) 100-2000',
      address: '123 Business District, Downtown',
      status: 'active',
      totalDrivers: 45,
      activeDrivers: 38,
      totalRides: 2847,
      monthlyRevenue: 28450,
      joinDate: '2023-08-15',
      licenseNumber: 'TC-2023-001',
      contactPerson: 'John Anderson'
    },
    {
      id: 2,
      name: 'City Cab Corporation',
      email: 'info@citycab.com',
      phone: '+1 (555) 200-3000',
      address: '456 Corporate Ave, Midtown',
      status: 'active',
      totalDrivers: 78,
      activeDrivers: 65,
      totalRides: 4521,
      monthlyRevenue: 52340,
      joinDate: '2023-06-20',
      licenseNumber: 'TC-2023-002',
      contactPerson: 'Sarah Mitchell'
    },
    {
      id: 3,
      name: 'Express Transport Ltd',
      email: 'admin@expresstransport.com',
      phone: '+1 (555) 300-4000',
      address: '789 Industrial Park, Eastside',
      status: 'suspended',
      totalDrivers: 23,
      activeDrivers: 0,
      totalRides: 1234,
      monthlyRevenue: 0,
      joinDate: '2023-11-10',
      licenseNumber: 'TC-2023-003',
      contactPerson: 'Mike Rodriguez'
    },
    {
      id: 4,
      name: 'Green Ride Solutions',
      email: 'hello@greenride.com',
      phone: '+1 (555) 400-5000',
      address: '321 Eco Street, Westside',
      status: 'pending',
      totalDrivers: 12,
      activeDrivers: 8,
      totalRides: 567,
      monthlyRevenue: 8920,
      joinDate: '2024-01-05',
      licenseNumber: 'TC-2024-001',
      contactPerson: 'Emma Thompson'
    },
    {
      id: 5,
      name: 'Premium Taxi Group',
      email: 'support@premiumtaxi.com',
      phone: '+1 (555) 500-6000',
      address: '654 Luxury Lane, Uptown',
      status: 'active',
      totalDrivers: 34,
      activeDrivers: 29,
      totalRides: 1876,
      monthlyRevenue: 34560,
      joinDate: '2023-09-12',
      licenseNumber: 'TC-2023-004',
      contactPerson: 'David Chen'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="status-badge status-active">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="status-badge status-suspended">
            <XCircle className="h-3 w-3 mr-1" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'inactive':
        return (
          <span className="status-badge status-inactive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesFilter = activeFilter === 'all' || company.status === activeFilter;
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('New company data:', formData);
    
    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
      licenseNumber: '',
      taxId: '',
      website: '',
      description: '',
      commissionRate: '15',
      status: 'pending'
    });
    setShowAddModal(false);
    
    // Show success message (you could use a toast notification here)
    alert('Company added successfully!');
  };

  const AddCompanyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add New Company</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="TC-2024-XXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter tax identification number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="https://company-website.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter full company address"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input w-full resize-none"
                  placeholder="Brief description of the company and services"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-emerald-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="contact@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Full name of primary contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Person Email
                </label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="person@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contact Person Phone
                </label>
                <input
                  type="tel"
                  name="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-600" />
              Business Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="15"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Initial Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="pending">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              Required Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Business License</p>
                <button type="button" className="btn btn-secondary text-xs">
                  Upload File
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Insurance Certificate</p>
                <button type="button" className="btn btn-secondary text-xs">
                  Upload File
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Tax Registration</p>
                <button type="button" className="btn btn-secondary text-xs">
                  Upload File
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Company Registration</p>
                <button type="button" className="btn btn-secondary text-xs">
                  Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-dark-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Company Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Company
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Companies</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Drivers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companies.reduce((sum, c) => sum + c.totalDrivers, 0)}
                </p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  €{companies.reduce((sum, c) => sum + c.monthlyRevenue, 0).toLocaleString()}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company name, email, or contact person..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <select 
                className="input w-40"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Companies</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Drivers
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-slate-200 dark:divide-slate-700">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{company.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">License: {company.licenseNumber}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            Joined: {new Date(company.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{company.contactPerson}</div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="h-3 w-3 mr-2 text-slate-400" />
                          {company.email}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-3 w-3 mr-2 text-slate-400" />
                          {company.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-500">
                          <MapPin className="h-3 w-3 mr-2 text-slate-400" />
                          {company.address}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900 dark:text-slate-100">
                          <Users className="h-3 w-3 mr-2 text-slate-400" />
                          Total: {company.totalDrivers}
                        </div>
                        <div className="flex items-center text-sm text-emerald-600">
                          <Car className="h-3 w-3 mr-2 text-emerald-400" />
                          Active: {company.activeDrivers}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {company.totalRides.toLocaleString()} rides
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          €{company.monthlyRevenue.toLocaleString()}/month
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Edit className="h-4 w-4" />
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
        <div className="text-sm text-slate-700 dark:text-slate-300">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCompanies.length}</span> of{' '}
          <span className="font-medium">{companies.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary">Previous</button>
          <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">1</span>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddModal && <AddCompanyModal />}
    </div>
  );
};

export default CompanyManagement;