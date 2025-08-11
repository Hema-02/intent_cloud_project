import React, { useState, useEffect } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ResourceManager } from './components/ResourceManager';
import { Monitoring } from './components/Monitoring';
import { Security } from './components/Security';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { NaturalLanguageInterface } from './components/NaturalLanguageInterface';
import { CommandInterface } from './components/CommandInterface';
import { RoleGuard } from './components/RoleGuard';
import { CloudProviderTabs } from './components/CloudProviderTabs';

export type ViewType = 'dashboard' | 'resources' | 'monitoring' | 'security' | 'billing' | 'settings' | 'natural-language' | 'command-line';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'aws' | 'azure' | 'gcp'>('aws');

  const getDemoUserRole = (): string => {
    // Demo users get 'user' role by default to access most features
    return 'user';
  }

  const renderView = (user: any) => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard activeProvider={activeProvider} />;
      case 'resources':
        return (
          <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
            <ResourceManager activeProvider={activeProvider} />
          </RoleGuard>
        );
      case 'monitoring':
        return <Monitoring activeProvider={activeProvider} />;
      case 'security':
        return (
          <RoleGuard requiredRole="admin" userRole={user?.role || 'guest'}>
            <Security activeProvider={activeProvider} />
          </RoleGuard>
        );
      case 'billing':
        return (
          <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
            <Billing activeProvider={activeProvider} />
          </RoleGuard>
        );
      case 'settings':
        return <Settings activeProvider={activeProvider} />;
      case 'natural-language':
        return (
          <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
            <NaturalLanguageInterface activeProvider={activeProvider} />
          </RoleGuard>
        );
      case 'command-line':
        return (
          <RoleGuard requiredRole="user" userRole={user?.role || getDemoUserRole()}>
            <CommandInterface activeProvider={activeProvider} />
          </RoleGuard>
        );
      default:
        return <Dashboard activeProvider={activeProvider} />;
    }
  };

  return (
    <AuthWrapper>
      {(user, signOut) => (
        <div className="min-h-screen bg-gray-50">
          <Header 
            activeView={activeView}
            setActiveView={setActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
            onSignOut={signOut}
          />
          
          <div className="flex">
            <Sidebar 
              activeView={activeView}
              setActiveView={setActiveView}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userRole={user?.role || getDemoUserRole()}
            />
            
            <main className="flex-1 lg:ml-64">
              <div className="p-6">
                <CloudProviderTabs 
                  activeProvider={activeProvider}
                  setActiveProvider={setActiveProvider}
                />
                {renderView(user || { role: getDemoUserRole() })}
              </div>
            </main>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}

export default App;