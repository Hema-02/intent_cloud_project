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

export type ViewType = 'dashboard' | 'resources' | 'monitoring' | 'security' | 'billing' | 'settings' | 'natural-language' | 'command-line';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'resources':
        return (
          <RoleGuard requiredRole="user">
            <ResourceManager />
          </RoleGuard>
        );
      case 'monitoring':
        return <Monitoring />;
      case 'security':
        return (
          <RoleGuard requiredRole="admin">
            <Security />
          </RoleGuard>
        );
      case 'billing':
        return (
          <RoleGuard requiredRole="user">
            <Billing />
          </RoleGuard>
        );
      case 'settings':
        return <Settings />;
      case 'natural-language':
        return (
          <RoleGuard requiredRole="user">
            <NaturalLanguageInterface />
          </RoleGuard>
        );
      case 'command-line':
        return (
          <RoleGuard requiredRole="admin">
            <CommandInterface />
          </RoleGuard>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <Header 
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex">
          <Sidebar 
            activeView={activeView}
            setActiveView={setActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <main className="flex-1 lg:ml-64">
            <div className="p-6">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;