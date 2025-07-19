import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import DriverManagement from './components/DriverManagement';
import ClientManagement from './components/ClientManagement';
import RideManagement from './components/RideManagement';
import SupportTickets from './components/SupportTickets';
import SystemConfig from './components/SystemConfig';
import AuditLogs from './components/AuditLogs';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'companies':
        return <CompanyManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'rides':
        return <RideManagement />;
      case 'support':
        return <SupportTickets />;
      case 'config':
        return <SystemConfig />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
          <div className="flex">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
            />
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              <Header 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="p-6">
                {renderContent()}
              </main>
            </div>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;