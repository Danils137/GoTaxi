import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  Globe, 
  Settings, 
  Save,
  Plus,
  Edit,
  Trash2,
  Mail,
  Smartphone
} from 'lucide-react';
import MapComponent from './MapComponent';

const SystemConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('geofencing');

  const configTabs = [
    { id: 'geofencing', label: 'Geofencing', icon: MapPin },
    { id: 'surge', label: 'Surge Zones', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: MessageSquare },
    { id: 'localization', label: 'Localization', icon: Globe }
  ];

  const geofences = [
    {
      id: 1,
      name: 'Downtown Area',
      type: 'service_area',
      status: 'active',
      coordinates: '56.9496,24.1052',
      radius: '5km',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Airport Zone',
      type: 'restricted',
      status: 'active',
      coordinates: '56.9236,23.9713',
      radius: '2km',
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      name: 'University District',
      type: 'service_area',
      status: 'inactive',
      coordinates: '56.9505,24.0934',
      radius: '3km',
      createdAt: '2024-01-08'
    }
  ];

  const surgeZones = [
    {
      id: 1,
      name: 'Business District',
      multiplier: '1.5x',
      timeSlot: 'Mon-Fri 8-10 AM, 5-7 PM',
      status: 'active',
      minDemand: 15
    },
    {
      id: 2,
      name: 'Entertainment Area',
      multiplier: '2.0x',
      timeSlot: 'Fri-Sat 10 PM - 2 AM',
      status: 'active',
      minDemand: 20
    },
    {
      id: 3,
      name: 'Airport Pickup',
      multiplier: '1.3x',
      timeSlot: 'Daily 6-8 AM, 6-8 PM',
      status: 'inactive',
      minDemand: 10
    }
  ];

  const notificationTemplates = [
    {
      id: 1,
      name: 'Ride Confirmation',
      channel: 'sms',
      subject: 'Ride Confirmed',
      content: 'Hi {rider_name}, your ride is confirmed. Driver {driver_name} will arrive in {eta} minutes.',
      variables: ['rider_name', 'driver_name', 'eta'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Driver Arrival',
      channel: 'push',
      subject: 'Driver Arrived',
      content: 'Your driver {driver_name} has arrived at the pickup location.',
      variables: ['driver_name'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Ride Completed',
      channel: 'email',
      subject: 'Trip Receipt',
      content: 'Thank you for riding with us! Your trip from {pickup} to {dropoff} cost €{fare}.',
      variables: ['pickup', 'dropoff', 'fare'],
      status: 'active'
    }
  ];

  const languages = [
    { code: 'en', name: 'English', status: 'active', completeness: '100%' },
    { code: 'es', name: 'Spanish', status: 'active', completeness: '95%' },
    { code: 'fr', name: 'French', status: 'inactive', completeness: '80%' },
    { code: 'de', name: 'German', status: 'inactive', completeness: '70%' }
  ];

  // Geofence markers for the map
  const geofenceMarkers = geofences.map(fence => {
    const [lat, lng] = fence.coordinates.split(',').map(Number);
    return {
      id: fence.id.toString(),
      lat,
      lng,
      type: fence.type === 'service_area' ? 'pickup' : 'dropoff' as const,
      title: fence.name,
      info: `${fence.type.replace('_', ' ')} - ${fence.radius}`
    };
  });

  const renderGeofencing = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Service Areas & Restrictions</h3>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Geofence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Interactive Map</h4>
          </div>
          <div className="card-content">
            <MapComponent 
              height="300px"
              showControls={true}
              markers={geofenceMarkers}
              center={{ lat: 56.9496, lng: 24.1052 }}
              zoom={11}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Active Geofences</h4>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {geofences.map((fence) => (
                <div key={fence.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{fence.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {fence.type.replace('_', ' ')} • {fence.radius}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`status-badge ${fence.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {fence.status}
                    </span>
                    <button className="btn btn-ghost p-1 h-6 w-6">
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSurgeZones = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Surge Pricing Configuration</h3>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Surge Zone
        </button>
      </div>

      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Zone Name
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Multiplier
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Time Slot
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Min Demand
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
                {surgeZones.map((zone) => (
                  <tr key={zone.id} className="table-row">
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{zone.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-amber-600">{zone.multiplier}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-slate-100">{zone.timeSlot}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-slate-100">{zone.minDemand} rides</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`status-badge ${zone.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="btn btn-ghost p-2 h-8 w-8 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
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

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Templates</h3>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {notificationTemplates.map((template) => (
          <div key={template.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{template.name}</h4>
                <div className="flex items-center space-x-2">
                  {template.channel === 'sms' && <Smartphone className="h-4 w-4 text-emerald-600" />}
                  {template.channel === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                  {template.channel === 'push' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{template.channel}</span>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                  <div className="text-sm text-slate-900 dark:text-slate-100 mt-1">{template.subject}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    {template.content}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Variables</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.map((variable) => (
                      <span key={variable} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {'{' + variable + '}'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className={`status-badge ${template.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {template.status}
                  </span>
                  <button className="btn btn-ghost p-2 h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLocalization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Language Settings</h3>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </button>
      </div>

      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Completeness
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
                {languages.map((language) => (
                  <tr key={language.code} className="table-row">
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{language.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-slate-100 uppercase">{language.code}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-emerald-600 rounded-full h-2" 
                            style={{ width: language.completeness }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-slate-100">{language.completeness}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`status-badge ${language.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {language.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Edit className="h-4 w-4" />
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geofencing':
        return renderGeofencing();
      case 'surge':
        return renderSurgeZones();
      case 'notifications':
        return renderNotifications();
      case 'localization':
        return renderLocalization();
      default:
        return renderGeofencing();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">System Configuration</h1>
        <button className="btn btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </button>
      </div>

      {/* Config Tabs */}
      <div className="card">
        <div className="card-content p-0">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6">
              {configTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;