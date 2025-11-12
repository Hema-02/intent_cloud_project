import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Terminal, 
  Server, 
  Settings,
  BarChart3,
  Shield,
  DollarSign,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userRole: string;
}

export function Sidebar({ activeView, setActiveView, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredRole: 'guest' },
    { id: 'natural-language', label: 'Natural Language', icon: MessageSquare, requiredRole: 'user' },
    { id: 'command-line', label: 'Command Line', icon: Terminal, requiredRole: 'user' },
    { id: 'resources', label: 'Resources', icon: Server, requiredRole: 'guest' },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3, requiredRole: 'guest' },
    { id: 'security', label: 'Security', icon: Shield, requiredRole: 'admin' },
    { id: 'billing', label: 'Billing', icon: DollarSign, requiredRole: 'guest' },
    { id: 'notifications', label: 'Notifications', icon: Bell, requiredRole: 'guest' },
    { id: 'settings', label: 'Settings', icon: Settings, requiredRole: 'guest' },
  ];

  const roleHierarchy = {
    guest: 0,
    user: 1,
    admin: 2,
    superadmin: 3
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;

  const hasAccess = (requiredRole: string) => {
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 1;
    return userLevel >= requiredLevel;
  };

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
          <span className="text-xl font-bold">CloudFlow</span>
        </div>
        <div className="mb-4 px-3 py-2 bg-gray-700 rounded-lg">
          <div className="text-xs text-gray-400">Role</div>
          <div className="text-sm font-medium text-white capitalize">{userRole}</div>
        </div>
        <nav className="space-y-1">
          {menuItems.filter(item => hasAccess(item.requiredRole)).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}