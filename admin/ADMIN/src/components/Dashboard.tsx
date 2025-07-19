import React from 'react';
import { 
  Users, 
  Car, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Clock,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import MapComponent from './MapComponent';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  const stats = [
    {
      title: t('dashboard.activeUsers'),
      value: '12,543',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: t('dashboard.activeDrivers'),
      value: '2,847',
      change: '+8%',
      trend: 'up',
      icon: Car,
      color: 'text-emerald-600'
    },
    {
      title: t('dashboard.dailyRevenue'),
      value: '€45,678',
      change: '-3%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-amber-600'
    },
    {
      title: t('dashboard.openTickets'),
      value: '23',
      change: '+5',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-red-600'
    }
  ];

  const chartData = [
    { name: 'Mon', rides: 145, revenue: 2890 },
    { name: 'Tue', rides: 178, revenue: 3456 },
    { name: 'Wed', rides: 203, revenue: 4123 },
    { name: 'Thu', rides: 189, revenue: 3876 },
    { name: 'Fri', rides: 234, revenue: 4567 },
    { name: 'Sat', rides: 298, revenue: 5892 },
    { name: 'Sun', rides: 267, revenue: 5234 }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'ride_completed',
      message: 'Ride #R-2024-001234 completed successfully',
      timestamp: '2 minutes ago',
      icon: Car
    },
    {
      id: 2,
      type: 'driver_registered',
      message: 'New driver John Smith registered',
      timestamp: '5 minutes ago',
      icon: Users
    },
    {
      id: 3,
      type: 'support_ticket',
      message: 'New support ticket #T-001567 created',
      timestamp: '8 minutes ago',
      icon: MessageSquare
    },
    {
      id: 4,
      type: 'surge_activated',
      message: 'Surge pricing activated in Downtown area',
      timestamp: '12 minutes ago',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Clock className="h-4 w-4 mr-2" />
            Last 7 days
          </button>
          <button className="btn btn-primary">{t('common.export')} Report</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-slate-50 dark:bg-slate-800`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rides Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.weeklyPerformance')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Rides completed and revenue generated</p>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Line 
                  type="monotone" 
                  dataKey="rides" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900 dark:text-slate-100">{activity.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Map */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.liveTracking')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Real-time view of active rides and available drivers</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <MapComponent 
            height="400px"
            showControls={true}
            center={{ lat: 56.9496, lng: 24.1052 }}
            zoom={12}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;