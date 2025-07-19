import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  CreditCard,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  X,
  Upload,
  FileText,
  Calendar,
  Smartphone,
  Shield,
  Settings
} from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
  totalRides: number;
  totalSpent: number;
  joinDate: string;
  lastRide: string;
  preferredPayment: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  preferences: {
    vehicleType: string;
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicPreference: string;
  };
}

interface NewClientForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Payment Information
  preferredPayment: string;
  
  // Preferences
  vehicleType: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  musicPreference: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Account Settings
  status: string;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
}

const ClientManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<NewClientForm>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    
    // Payment Information
    preferredPayment: 'credit_card',
    
    // Preferences
    vehicleType: 'any',
    smokingAllowed: false,
    petsAllowed: false,
    musicPreference: 'no_preference',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Account Settings
    status: 'active',
    marketingConsent: false,
    dataProcessingConsent: true
  });

  const clients: Client[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      rating: 4.9,
      totalRides: 89,
      totalSpent: 1245.50,
      joinDate: '2024-02-03',
      lastRide: '2024-01-20 14:30',
      preferredPayment: 'Credit Card',
      address: '123 Oak Street, Downtown',
      emergencyContact: {
        name: 'John Johnson',
        phone: '+1 (555) 123-4568'
      },
      preferences: {
        vehicleType: 'sedan',
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'pop'
      }
    },
    {
      id: 2,
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      rating: 4.7,
      totalRides: 156,
      totalSpent: 2890.75,
      joinDate: '2023-11-20',
      lastRide: '2024-01-19 18:45',
      preferredPayment: 'PayPal',
      address: '456 Pine Avenue, Midtown',
      emergencyContact: {
        name: 'Lisa Wilson',
        phone: '+1 (555) 234-5679'
      },
      preferences: {
        vehicleType: 'suv',
        smokingAllowed: false,
        petsAllowed: false,
        musicPreference: 'rock'
      }
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 345-6789',
      status: 'suspended',
      rating: 3.2,
      totalRides: 23,
      totalSpent: 345.20,
      joinDate: '2024-03-10',
      lastRide: '2024-01-15 12:20',
      preferredPayment: 'Cash',
      address: '789 Elm Street, Uptown',
      emergencyContact: {
        name: 'Robert Davis',
        phone: '+1 (555) 345-6790'
      },
      preferences: {
        vehicleType: 'luxury',
        smokingAllowed: true,
        petsAllowed: false,
        musicPreference: 'classical'
      }
    },
    {
      id: 4,
      name: 'Tom Anderson',
      email: 'tom.anderson@email.com',
      phone: '+1 (555) 456-7890',
      status: 'active',
      rating: 4.8,
      totalRides: 234,
      totalSpent: 4567.80,
      joinDate: '2023-08-15',
      lastRide: '2024-01-20 16:15',
      preferredPayment: 'Credit Card',
      address: '321 Maple Drive, Westside',
      emergencyContact: {
        name: 'Mary Anderson',
        phone: '+1 (555) 456-7891'
      },
      preferences: {
        vehicleType: 'any',
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'jazz'
      }
    },
    {
      id: 5,
      name: 'Anna Brown',
      email: 'anna.brown@email.com',
      phone: '+1 (555) 567-8901',
      status: 'inactive',
      rating: 4.5,
      totalRides: 67,
      totalSpent: 890.30,
      joinDate: '2023-12-05',
      lastRide: '2023-12-28 09:30',
      preferredPayment: 'Apple Pay',
      address: '654 Cedar Lane, Eastside',
      emergencyContact: {
        name: 'James Brown',
        phone: '+1 (555) 567-8902'
      },
      preferences: {
        vehicleType: 'hatchback',
        smokingAllowed: false,
        petsAllowed: false,
        musicPreference: 'no_preference'
      }
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
      case 'inactive':
        return (
          <span className="status-badge status-inactive">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesFilter = activeFilter === 'all' || client.status === activeFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('New client data:', formData);
    
    // Reset form and close modal
    setFormData({
      // Personal Information
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      
      // Payment Information
      preferredPayment: 'credit_card',
      
      // Preferences
      vehicleType: 'any',
      smokingAllowed: false,
      petsAllowed: false,
      musicPreference: 'no_preference',
      
      // Emergency Contact
      emergencyContactName: '',
      emergencyContactPhone: '',
      
      // Account Settings
      status: 'active',
      marketingConsent: false,
      dataProcessingConsent: true
    });
    setShowAddModal(false);
    
    // Show success message (you could use a toast notification here)
    alert('Client added successfully!');
  };

  const AddClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add New Client</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="client@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number *
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
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="LV">Latvia</option>
                  <option value="LT">Lithuania</option>
                  <option value="EE">Estonia</option>
                  <option value="PL">Poland</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter full street address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter postal code"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Payment Method *
                </label>
                <select
                  name="preferredPayment"
                  value={formData.preferredPayment}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ride Preferences */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Ride Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="any">Any Vehicle</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="luxury">Luxury</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Music Preference
                </label>
                <select
                  name="musicPreference"
                  value={formData.musicPreference}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="no_preference">No Preference</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="country">Country</option>
                  <option value="electronic">Electronic</option>
                  <option value="silence">Prefer Silence</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="smokingAllowed"
                    checked={formData.smokingAllowed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Allow smoking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="petsAllowed"
                    checked={formData.petsAllowed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Allow pets</span>
                </label>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Full name of emergency contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="+1 (555) 987-6543"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-slate-600" />
              Account Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Consent to marketing communications
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="dataProcessingConsent"
                    checked={formData.dataProcessingConsent}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Consent to data processing (required) *
                  </span>
                </label>
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
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Client Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Clients</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{clients.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Clients</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Rating</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {(clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Rides</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {clients.reduce((sum, c) => sum + c.totalRides, 0).toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  €{clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-slate-600 dark:text-slate-400" />
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
                placeholder="Search by name, email, or phone..."
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
                <option value="all">All Clients</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact & Address
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Spending
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Preferences
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
                {filteredClients.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{client.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">ID: {client.id.toString().padStart(6, '0')}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            Joined: {new Date(client.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="h-3 w-3 mr-2 text-slate-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-3 w-3 mr-2 text-slate-400" />
                          {client.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-500">
                          <MapPin className="h-3 w-3 mr-2 text-slate-400" />
                          {client.address}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900 dark:text-slate-100">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          {client.rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {client.totalRides} rides
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Last ride: {new Date(client.lastRide).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          €{client.totalSpent.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {client.preferredPayment}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Avg: €{(client.totalSpent / client.totalRides).toFixed(2)}/ride
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm text-slate-900 dark:text-slate-100 capitalize">
                          {client.preferences.vehicleType}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {client.preferences.musicPreference.replace('_', ' ')}
                        </div>
                        <div className="flex space-x-1">
                          {client.preferences.smokingAllowed && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">Smoking</span>
                          )}
                          {client.preferences.petsAllowed && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Pets</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(client.status)}
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
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredClients.length}</span> of{' '}
          <span className="font-medium">{clients.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary">Previous</button>
          <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">1</span>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && <AddClientModal />}
    </div>
  );
};

export default ClientManagement;