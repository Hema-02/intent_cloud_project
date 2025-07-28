import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NaturalLanguageInterface } from './components/NaturalLanguageInterface';
import { CommandInterface } from './components/CommandInterface';
import { ResourceManager } from './components/ResourceManager';
import { CloudProviderTabs } from './components/CloudProviderTabs';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeProvider, setActiveProvider] = useState('aws');

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <CloudProviderTabs 
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
        </main>
      </div>
    </div>
  );
}

export default App;