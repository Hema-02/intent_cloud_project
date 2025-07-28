import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { ResourceTable } from './ResourceTable';
import { CreateResourceModal } from './CreateResourceModal';

interface ResourceManagerProps {
  activeProvider: string;
}

export function ResourceManager({ activeProvider }: ResourceManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState('instances');
  const [searchTerm, setSearchTerm] = useState('');

  const resourceTypes = {
    instances: 'Compute Instances',
    databases: 'Databases',
    storage: 'Storage',
    networking: 'Networking',
    security: 'Security',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Resource Manager</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resource</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(resourceTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        <ResourceTable 
          activeProvider={activeProvider}
          resourceType={selectedResourceType}
          searchTerm={searchTerm}
        />
      </div>

      {showCreateModal && (
        <CreateResourceModal
          activeProvider={activeProvider}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}