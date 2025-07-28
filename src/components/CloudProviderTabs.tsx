import React from 'react';

interface CloudProviderTabsProps {
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
}

export function CloudProviderTabs({ activeProvider, setActiveProvider }: CloudProviderTabsProps) {
  const providers = [
    { id: 'aws', name: 'Amazon Web Services', color: 'bg-orange-500', shortName: 'AWS' },
    { id: 'gcp', name: 'Google Cloud Platform', color: 'bg-blue-500', shortName: 'GCP' },
    { id: 'azure', name: 'Microsoft Azure', color: 'bg-blue-600', shortName: 'Azure' },
  ];

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6">
      <div className="flex space-x-1">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeProvider === provider.id
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${provider.color} ${
                  activeProvider === provider.id ? 'opacity-100' : 'opacity-60'
                }`}
              ></div>
              <span>{provider.shortName}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}