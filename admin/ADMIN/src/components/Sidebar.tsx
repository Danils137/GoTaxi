import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MessageSquare, 
  Settings, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  UserCheck,
  User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('nav.users'), icon: Users },
    { id: 'companies', label: t('nav.companies'), icon: Building2 },
    { id: 'drivers', label: t('nav.drivers'), icon: UserCheck },
    { id: 'clients', label: t('nav.clients'), icon: User },
    { id: 'rides', label: t('nav.rides'), icon: Car },
    { id: 'support', label: t('nav.support'), icon: MessageSquare },
    { id: 'config', label: t('nav.config'), icon: Settings },
    { id: 'audit', label: t('nav.audit'), icon: FileText },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-700 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">TaxiFinder</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item group w-full ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
              }`} />
              {!collapsed && (
                <span className={isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors`}>
          <div className="w-8 h-8 bg-blue-700 dark:bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">SA</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t('footer.superAdmin')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('footer.adminEmail')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;