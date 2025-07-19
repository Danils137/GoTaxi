import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Car,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Calendar,
  Activity,
  X,
  Upload,
  FileText,
  User,
  CreditCard,
  Building2,
  Settings
} from 'lucide-react';

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  rating: number;
  totalRides: number;
  completionRate: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
  licenseNumber: string;
  joinDate: string;
  lastActive: string;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  documents: {
    driverLicense: string;
    vehicleRegistration: string;
    insurance: string;
    backgroundCheck: string;
  };
}

interface NewDriverForm {
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
  
  // Driver Information
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseClass: string;
  yearsOfExperience: string;
  
  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
  vehicleType: string;
  
  // Company & Employment
  company: string;
  employmentType: string;
  commissionRate: string;
  
  // Account Settings
  status: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const DriverManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<NewDriverForm>({
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
    
    // Driver Information
    licenseNumber: '',
    licenseExpiryDate: '',
    licenseClass: 'B',
    yearsOfExperience: '',
    
    // Vehicle Information
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    vehicleType: 'sedan',
    
    // Company & Employment
    company: '',
    employmentType: 'full-time',
    commissionRate: '20',
    
    // Account Settings
    status: 'pending',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const drivers: Driver[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Metro Taxi Services',
      status: 'active',
      rating: 4.8,
      totalRides: 1247,
      completionRate: 98.5,
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC-123',
        color: 'White'
      },
      licenseNumber: 'DL-2023-001234',
      joinDate: '2023-08-15',
      lastActive: '2024-01-20 14:30',
      earnings: {
        today: 245.50,
        thisWeek: 1680.75,
        thisMonth: 6420.30
      },
      documents: {
        driverLicense: 'verified',
        vehicleRegistration: 'verified',
        insurance: 'verified',
        backgroundCheck: 'verified'
      }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      company: 'City Cab Corporation',
      status: 'active',
      rating: 4.9,
      totalRides: 892,
      completionRate: 99.2,
      vehicleInfo: {
        make: 'Honda',
        model: 'Accord',
        year: 2021,
        licensePlate: 'XYZ-789',
        color: 'Black'
      },
      licenseNumber: 'DL-2023-002345',
      joinDate: '2023-09-20',
      lastActive: '2024-01-20 15:45',
      earnings: {
        today: 189.25,
        thisWeek: 1420.50,
        thisMonth: 5680.90
      },
      documents: {
        driverLicense: 'verified',
        vehicleRegistration: 'verified',
        insurance: 'pending',
        backgroundCheck: 'verified'
      }
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 345-6789',
      company: 'Express Transport Ltd',
      status: 'suspended',
      rating: 3.2,
      totalRides: 567,
      completionRate: 85.4,
      vehicleInfo: {
        make: 'Ford',
        model: 'Focus',
        year: 2020,
        licensePlate: 'DEF-456',
        color: 'Blue'
      },
      licenseNumber: 'DL-2023-003456',
      joinDate: '2023-11-10',
      lastActive: '2024-01-18 10:20',
      earnings: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      documents: {
        driverLicense: 'verified',
        vehicleRegistration: 'expired',
        insurance: 'verified',
        backgroundCheck: 'verified'
      }
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      company: 'Green Ride Solutions',
      status: 'pending',
      rating: 0,
      totalRides: 0,
      completionRate: 0,
      vehicleInfo: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'GHI-789',
        color: 'Red'
      },
      licenseNumber: 'DL-2024-001111',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20 09:15',
      earnings: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      documents: {
        driverLicense: 'verified',
        vehicleRegistration: 'pending',
        insurance: 'pending',
        backgroundCheck: 'pending'
      }
    },
    {
      id: 5,
      name: 'David Chen',
      email: 'david.chen@email.com',
      phone: '+1 (555) 567-8901',
      company: 'Premium Taxi Group',
      status: 'offline',
      rating: 4.6,
      totalRides: 1834,
      completionRate: 96.8,
      vehicleInfo: {
        make: 'BMW',
        model: '3 Series',
        year: 2022,
        licensePlate: 'JKL-012',
        color: 'Silver'
      },
      licenseNumber: 'DL-2023-004567',
      joinDate: '2023-07-05',
      lastActive: '2024-01-19 22:30',
      earnings: {
        today: 0,
        thisWeek: 980.40,
        thisMonth: 4250.80
      },
      documents: {
        driverLicense: 'verified',
        vehicleRegistration: 'verified',
        insurance: 'verified',
        backgroundCheck: 'verified'
      }
    }
  ];

  const companies = [
    'Metro Taxi Services',
    'City Cab Corporation',
    'Express Transport Ltd',
    'Green Ride Solutions',
    'Premium Taxi Group'
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
      case 'offline':
        return (
          <span className="status-badge status-inactive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Offline
          </span>
        );
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesFilter = activeFilter === 'all' || driver.status === activeFilter;
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.vehicleInfo.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
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
    console.log('New driver data:', formData);
    
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
      
      // Driver Information
      licenseNumber: '',
      licenseExpiryDate: '',
      licenseClass: 'B',
      yearsOfExperience: '',
      
      // Vehicle Information
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      licensePlate: '',
      vehicleType: 'sedan',
      
      // Company & Employment
      company: '',
      employmentType: 'full-time',
      commissionRate: '20',
      
      // Account Settings
      status: 'pending',
      emergencyContactName: '',
      emergencyContactPhone: ''
    });
    setShowAddModal(false);
    
    // Show success message (you could use a toast notification here)
    alert('Driver added successfully!');
  };

  const AddDriverModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add New Driver</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                  placeholder="driver@email.com"
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

          {/* Driver License Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
              Driver License Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  placeholder="DL-2024-XXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Class *
                </label>
                <select
                  name="licenseClass"
                  value={formData.licenseClass}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="B">Class B (Standard)</option>
                  <option value="C">Class C (Commercial)</option>
                  <option value="D">Class D (Taxi/Rideshare)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="5"
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-600" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vehicle Make *
                </label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Toyota, Honda, BMW..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Camry, Accord, 3 Series..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vehicle Year *
                </label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="2022"
                  min="2010"
                  max="2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vehicle Color *
                </label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="White, Black, Silver..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="wagon">Wagon</option>
                  <option value="van">Van</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
          </div>

          {/* Company & Employment */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-amber-600" />
              Company & Employment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company *
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Employment Type *
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contractor">Independent Contractor</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
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
                  placeholder="20"
                  min="0"
                  max="50"
                  step="0.1"
                />
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
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Required Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Driver's License</p>
                <button type="button" className="btn btn-secondary text-xs">
                  Upload File
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Vehicle Registration</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Background Check</p>
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
              Add Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Driver Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Driver
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Drivers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{drivers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Drivers</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {drivers.filter(d => d.status === 'active').length}
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {drivers.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Rating</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.filter(d => d.rating > 0).length).toFixed(1)}
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
                  {drivers.reduce((sum, d) => sum + d.totalRides, 0).toLocaleString()}
                </p>
              </div>
              <Car className="h-8 w-8 text-slate-600 dark:text-slate-400" />
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
                placeholder="Search by name, email, company, or license plate..."
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
                <option value="all">All Drivers</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact & Company
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Documents
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
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{driver.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">ID: {driver.id.toString().padStart(6, '0')}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            License: {driver.licenseNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="h-3 w-3 mr-2 text-slate-400" />
                          {driver.email}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-3 w-3 mr-2 text-slate-400" />
                          {driver.phone}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{driver.company}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Last active: {new Date(driver.lastActive).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {driver.vehicleInfo.year} {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {driver.vehicleInfo.color} • {driver.vehicleInfo.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900 dark:text-slate-100">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          {driver.rating > 0 ? driver.rating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {driver.totalRides} rides
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {driver.completionRate}% completion
                        </div>
                        <div className="text-sm font-medium text-emerald-600">
                          €{driver.earnings.thisMonth.toFixed(2)}/month
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            {getDocumentStatus(driver.documents.driverLicense)}
                            <span className="text-xs text-slate-600 dark:text-slate-400">License</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getDocumentStatus(driver.documents.vehicleRegistration)}
                            <span className="text-xs text-slate-600 dark:text-slate-400">Vehicle</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getDocumentStatus(driver.documents.insurance)}
                            <span className="text-xs text-slate-600 dark:text-slate-400">Insurance</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getDocumentStatus(driver.documents.backgroundCheck)}
                            <span className="text-xs text-slate-600 dark:text-slate-400">Background</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(driver.status)}
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
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredDrivers.length}</span> of{' '}
          <span className="font-medium">{drivers.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary">Previous</button>
          <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">1</span>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && <AddDriverModal />}
    </div>
  );
};

export default DriverManagement;