import React, { useState } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { RoleGuard } from './components/RoleGuard';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NaturalLanguageInterface } from './components/NaturalLanguageInterface';
import { CommandInterface } from './components/CommandInterface';
import { ResourceManager } from './components/ResourceManager';
import { CloudProviderTabs } from './components/CloudProviderTabs';
import { Monitoring } from './components/Monitoring';
import { Security } from './components/Security';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';

function App() {
  return (
    <AuthWrapper>
      {(user, signOut) => <AppContent user={user} signOut={signOut} />}
    </AuthWrapper>
  );
}

function AppContent({ user, signOut }: { user: any; signOut: () => void }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeProvider, setActiveProvider] = useState('aws');
  const [searchResults, setSearchResults] = useState<string>('');

  const handleSearch = (query: string) => {
    setSearchResults(`Searching for: ${query}`);
    // Implement actual search logic here
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        userRole={user?.role || 'guest'}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user}
          onSignOut={signOut}
          onSearch={handleSearch}
        />
        <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
          <CloudProviderTabs 
            activeProvider={activeProvider} 
            setActiveProvider={setActiveProvider} 
          />
        </RoleGuard>
        <main className="flex-1 overflow-auto p-6">
          {searchResults && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-blue-400">{searchResults}</p>
              <button 
                onClick={() => setSearchResults('')}
                className="text-blue-300 hover:text-blue-200 text-sm mt-2"
              >
                Clear search
              </button>
            </div>
          )}
          
          {activeView === 'dashboard' && (
            <Dashboard activeProvider={activeProvider} />
          )}
          {activeView === 'nlp' && (
            <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
              <NaturalLanguageInterface activeProvider={activeProvider} />
            </RoleGuard>
          )}
          {activeView === 'command' && (
            <RoleGuard requiredRole="admin" userRole={user?.role || 'guest'}>
              <CommandInterface activeProvider={activeProvider} />
            </RoleGuard>
          )}
          {activeView === 'resources' && (
            <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
              <ResourceManager activeProvider={activeProvider} />
            </RoleGuard>
          )}
          {activeView === 'monitoring' && (
            <Monitoring activeProvider={activeProvider} />
          )}
          {activeView === 'security' && (
            <RoleGuard requiredRole="admin" userRole={user?.role || 'guest'}>
              <Security activeProvider={activeProvider} />
            </RoleGuard>
          )}
          {activeView === 'billing' && (
            <RoleGuard requiredRole="user" userRole={user?.role || 'guest'}>
              <Billing activeProvider={activeProvider} />
            </RoleGuard>
          )}
          {activeView === 'settings' && (
            <Settings activeProvider={activeProvider} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
          activeProvider={activeProvider} 
          setActiveProvider={setActiveProvider} 
        />
        <main className="flex-1 overflow-auto p-6">
          {activeView === 'dashboard' && (
            <Dashboard activeProvider={activeProvider} />
          )}
          {activeView === 'nlp' && (
            <NaturalLanguageInterface activeProvider={activeProvider} />
          )}
          {activeView === 'command' && (
            <CommandInterface activeProvider={activeProvider} />
          )}
          {activeView === 'resources' && (
            <ResourceManager activeProvider={activeProvider} />
          )}
          {activeView === 'monitoring' && (
            <Monitoring activeProvider={activeProvider} />
          )}
          {activeView === 'security' && (
            <Security activeProvider={activeProvider} />
          )}
          {activeView === 'billing' && (
            <Billing activeProvider={activeProvider} />
          )}
          {activeView === 'settings' && (
            <Settings activeProvider={activeProvider} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;