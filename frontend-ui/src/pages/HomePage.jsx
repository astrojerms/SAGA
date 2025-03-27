import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LayoutDashboard, 
  UserCircle, 
  BarChart3,
  Bell,
  Search,
  LogOut,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Timeline from './Timeline';

const HomePage = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, description: 'Database connection error - Primary database cluster is unreachable', severity: 'high', timestamp: '2025-03-21T09:23:14' },
    { id: 2, description: 'API latency increased - Response time exceeded threshold of 500ms', severity: 'medium', timestamp: '2025-03-21T08:45:32' },
    { id: 3, description: 'Memory usage warning - Server memory utilization at 85%', severity: 'medium', timestamp: '2025-03-21T07:12:05' },
    { id: 4, description: 'Certificate expiration - TLS certificate will expire in 30 days', severity: 'low', timestamp: '2025-03-21T06:57:41' },
    { id: 5, description: 'User authentication failure - Multiple failed login attempts detected', severity: 'medium', timestamp: '2025-03-21T05:30:12' },
    { id: 6, description: 'Disk space alert - Storage volume at 92% capacity', severity: 'low', timestamp: '2025-03-21T04:15:38' }
  ]);

  // Dismiss an alert
  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Severity icon mapping
  const severityIcons = {
    high: <AlertOctagon className="h-6 w-6" />,
    medium: <AlertTriangle className="h-6 w-6" />,
    low: <AlertCircle className="h-6 w-6" />
  };

  // Hover effect state
  const [hoveredAlertId, setHoveredAlertId] = useState(null);

  // Severity color mapping for background
  const severityColors = {
    high: 'bg-red-600',
    medium: 'bg-white-500',
    low: 'bg-white-400'
  };

  // Severity hover color mapping for background
  const severityHoverColors = {
    high: 'bg-red-700',
    medium: 'bg-yellow-600',
    low: 'bg-blue-600'
  };

  // Severity text color mapping
  const severityTextColors = {
    high: 'text-white',
    medium: 'text-white',
    low: 'text-white'
  };

  // Severity icon colors
  const severityIconColors = {
    high: 'text-white',
    medium: 'text-white',
    low: 'text-white'
  };

  // Button hover colors
  const buttonHoverColors = {
    high: 'hover:bg-red-500',
    medium: 'hover:bg-yellow-400',
    low: 'hover:bg-blue-400'
  };

  const navigate = useNavigate();
  const username = "John Doe";
  const highSeverityCount = alerts.filter(alert => alert.severity === 'high' && !alert.read).length;
  const [showGlobalAlert, setShowGlobalAlert] = useState(true);
  const dismissGlobalAlert = () => {
    setShowGlobalAlert(false);
  };

  // Function to handle alert click - could be expanded for additional functionality
  const handleAlertClick = (id) => {
    navigate(`/dashboard`);
    // Additional functionality could be added here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="shadow-sm border-b border-[#e2e8f0]">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Search */}
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">
                <span className="text-[#ffffff]">Admin</span>
                <span className="text-[#ffffff]">Portal</span>
              </h1>
              <div className="hidden md:flex items-center space-x-2 bg-[#f8fafc] rounded-lg px-3 py-2">
                <Search className="h-5 w-5 text-[#64748b]" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent border-none focus:outline-none text-sm text-[#1e293b]"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <button className="p-2 rounded-full hover:bg-[#f1f5f9] transition-colors">
                <Bell className="h-5 w-5 text-[#64748b]" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-[#ffffff]">{username}</span>
                  <span className="text-xs text-[#ffffff]">Admin</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#e6efff] flex items-center justify-center">
                  <User className="h-6 w-6 text-[#1e293b]" />
                </div>
                <button className="p-2 rounded-full hover:bg-[#f1f5f9] transition-colors">
                  <LogOut className="h-5 w-5 text-[#64748b]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#ffffff] mb-4">Welcome back, {username}!</h2>
          <p className="text-[#ffffff] max-w-2xl mx-auto">
            Access all your tools and resources from this central dashboard. Choose from the options below to get started.
          </p>
        </div>

        <div className="max-w-7xl mx-auto p-4">

        <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            onClick={() => handleAlertClick(alert.id)}
            onMouseEnter={() => setHoveredAlertId(alert.id)}
            onMouseLeave={() => setHoveredAlertId(null)}
            className={`${hoveredAlertId === alert.id ? severityHoverColors[alert.severity] : severityColors[alert.severity]} 
              rounded-md shadow-md transform transition-all duration-300 ease-in-out border-1 border-purple-700
              ${hoveredAlertId === alert.id ? 'shadow-xl translate-y-[-2px] scale-105 ring-2 ring-white ring-opacity-50' : ''}
              cursor-pointer`}
          >
            <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="w-0 flex-1 flex items-center">
                  <span className={`flex p-2 rounded-lg ${severityIconColors[alert.severity]}`}>
                    {severityIcons[alert.severity]}
                  </span>
                  <p className={`ml-3 font-medium ${severityTextColors[alert.severity]} truncate`}>
                    <span>{alert.description}</span>
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <a
                    href="#"
                    className={`flex items-center justify-center w-[8rem] h-[40px] border border-transparent rounded-md shadow-sm text-s font-medium ${
                      alert.severity === 'high' ? 'text-red-800' : 
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    } bg-white hover:bg-gray-50`}
                  >
                    View Alert
                  </a>
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className={`flex p-1 rounded-md ${buttonHoverColors[alert.severity]} focus:outline-none focus:ring-2 focus:ring-white`}
                  >
                    <X className="w-[1rem] h-[24px] text-blue-800" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="bg-gray-100 rounded-md p-4 text-center text-gray-500">
            No alerts to display
          </div>
        )}
      </div>
    </div>
      </main>
    </div>
  );
};

export default HomePage;