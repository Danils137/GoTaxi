import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Car,
  MoreHorizontal,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import MapComponent from './MapComponent';

const RideManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const rides = [
    {
      id: 'R-2024-001234',
      rider: 'Sarah Johnson',
      driver: 'John Smith',
      pickup: '123 Main St, Downtown',
      dropoff: '456 Oak Ave, Uptown',
      status: 'ongoing',
      fare: 24.50,
      distance: '5.2 km',
      duration: '18 min',
      requestTime: '2024-01-20 14:30',
      startTime: '2024-01-20 14:35',
      eta: '14:53',
      pickupCoords: { lat: 56.9496, lng: 24.1052 },
      dropoffCoords: { lat: 56.9556, lng: 24.1156 }
    },
    {
      id: 'R-2024-001235',
      rider: 'Mike Wilson',
      driver: 'Emily Davis',
      pickup: '789 Pine St, Midtown',
      dropoff: '321 Elm Dr, Westside',
      status: 'completed',
      fare: 18.75,
      distance: '3.8 km',
      duration: '15 min',
      requestTime: '2024-01-20 13:15',
      startTime: '2024-01-20 13:20',
      endTime: '2024-01-20 13:35',
      pickupCoords: { lat: 56.9436, lng: 24.0952 },
      dropoffCoords: { lat: 56.9576, lng: 24.1256 }
    },
    {
      id: 'R-2024-001236',
      rider: 'Anna Brown',
      driver: 'David Lee',
      pickup: '555 Broadway, Central',
      dropoff: '777 Park Ave, Northside',
      status: 'cancelled',
      fare: 0,
      distance: '2.3 km',
      duration: '0 min',
      requestTime: '2024-01-20 12:45',
      cancelTime: '2024-01-20 12:47',
      cancelReason: 'Driver unavailable',
      pickupCoords: { lat: 56.9396, lng: 24.0852 },
      dropoffCoords: { lat: 56.9616, lng: 24.1356 }
    },
    {
      id: 'R-2024-001237',
      rider: 'Tom Anderson',
      driver: 'Lisa White',
      pickup: '999 First St, East End',
      dropoff: '111 Last St, South Bay',
      status: 'pending',
      fare: 0,
      distance: '7.1 km',
      duration: 'Est. 22 min',
      requestTime: '2024-01-20 14:45',
      pickupCoords: { lat: 56.9336, lng: 24.0752 },
      dropoffCoords: { lat: 56.9656, lng: 24.1456 }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="status-badge status-ongoing">Ongoing</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      case 'pending':
        return <span className="status-badge bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="status-badge status-inactive">{status}</span>;
    }
  };

  const filteredRides = rides.filter(ride => 
    activeFilter === 'all' || ride.status === activeFilter
  );

  // Create markers for active rides
  const rideMarkers = filteredRides
    .filter(ride => ride.status === 'ongoing' || ride.status === 'pending')
    .flatMap(ride => [
      {
        id: `${ride.id}-pickup`,
        lat: ride.pickupCoords.lat,
        lng: ride.pickupCoords.lng,
        type: 'pickup' as const,
        title: `Pickup: ${ride.id}`,
        info: `${ride.rider} - ${ride.pickup}`
      },
      {
        id: `${ride.id}-dropoff`,
        lat: ride.dropoffCoords.lat,
        lng: ride.dropoffCoords.lng,
        type: 'dropoff' as const,
        title: `Dropoff: ${ride.id}`,
        info: `${ride.rider} - ${ride.dropoff}`
      }
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ride Management</h1>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="btn btn-primary">Live Map View</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Rides</p>
                <p className="text-2xl font-bold text-blue-600">47</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed Today</p>
                <p className="text-2xl font-bold text-emerald-600">342</p>
              </div>
              <MapPin className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">€8,450</p>
              </div>
              <DollarSign className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Map */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live Ride Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Real-time view of active rides and pickup/dropoff locations</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <MapComponent 
            height="400px"
            showControls={true}
            markers={rideMarkers}
            center={{ lat: 56.9496, lng: 24.1052 }}
            zoom={12}
          />
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
                placeholder="Search by ride ID, rider, or driver..."
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <select 
                className="input w-40"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Rides</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Ride Details
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Fare
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRides.map((ride) => (
                  <tr key={ride.id} className="table-row">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{ride.id}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {ride.rider}
                          </div>
                          <div className="flex items-center mt-1">
                            <Car className="h-3 w-3 mr-1" />
                            {ride.driver}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-2"></div>
                          <div className="text-sm text-slate-900 dark:text-slate-100">{ride.pickup}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2"></div>
                          <div className="text-sm text-slate-900 dark:text-slate-100">{ride.dropoff}</div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {ride.distance} • {ride.duration}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(ride.status)}
                      {ride.status === 'ongoing' && ride.eta && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">ETA: {ride.eta}</div>
                      )}
                      {ride.status === 'cancelled' && ride.cancelReason && (
                        <div className="text-xs text-red-600 mt-1">{ride.cancelReason}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {ride.fare > 0 ? `€${ride.fare.toFixed(2)}` : '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-slate-100">
                        Requested: {new Date(ride.requestTime).toLocaleTimeString()}
                      </div>
                      {ride.startTime && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Started: {new Date(ride.startTime).toLocaleTimeString()}
                        </div>
                      )}
                      {ride.endTime && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Ended: {new Date(ride.endTime).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="btn btn-ghost p-2 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </button>
                        {ride.status === 'ongoing' && (
                          <button className="btn btn-ghost p-2 h-8 w-8">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {(ride.status === 'ongoing' || ride.status === 'pending') && (
                          <button className="btn btn-ghost p-2 h-8 w-8 text-red-600 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        )}
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
    </div>
  );
};

export default RideManagement;