import React from 'react';
import { MoreVertical, Play, Square, Trash2, RefreshCw } from 'lucide-react';
import { resourcesAPI } from '../lib/api';

interface ResourceTableProps {
  activeProvider: string;
  resourceType: string;
  searchTerm: string;
  resources?: any;
  loading?: boolean;
  onRefresh?: () => void;
}

export function ResourceTable({ 
  activeProvider, 
  resourceType, 
  searchTerm, 
  resources: apiResources,
  loading = false,
  onRefresh
}: ResourceTableProps) {
  const getResourceData = () => {
    // Use API data if available, otherwise fall back to mock data
    if (apiResources && apiResources[resourceType]) {
      return apiResources[resourceType];
    }

    // Fallback mock data
    const data = {
      instances: [
        { id: 'i-1234567890abc', name: 'web-server-01', type: 't3.large', status: 'running', region: 'us-east-1' },
        { id: 'i-0987654321def', name: 'db-server-01', type: 't2.micro', status: 'stopped', region: 'us-west-2' },
        { id: 'i-abcdef123456', name: 'api-server-01', type: 'm5.xlarge', status: 'running', region: 'eu-west-1' },
      ],
      databases: [
        { id: 'db-1234567890', name: 'prod-database', engine: 'PostgreSQL', status: 'available', region: 'us-east-1' },
        { id: 'db-0987654321', name: 'test-database', engine: 'MySQL', status: 'maintenance', region: 'us-west-2' },
      ],
      storage: [
        { id: 'bucket-1234567', name: 'app-assets', size: '1.2TB', status: 'active', region: 'us-east-1' },
        { id: 'bucket-7654321', name: 'backup-data', size: '850GB', status: 'active', region: 'us-west-2' },
      ],
    };
    return data[resourceType as keyof typeof data] || [];
  };

  const handleAction = async (action: string, resourceId: string) => {
    try {
      switch (action) {
        case 'start':
          await resourcesAPI.update(activeProvider, resourceType, resourceId, { status: 'running' });
          break;
        case 'stop':
          await resourcesAPI.update(activeProvider, resourceType, resourceId, { status: 'stopped' });
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this resource?')) {
            await resourcesAPI.delete(activeProvider, resourceType, resourceId);
          }
          break;
      }
      onRefresh?.();
    } catch (error) {
      console.error(`Failed to ${action} resource:`, error);
      alert(`Failed to ${action} resource. Please try again.`);
    }
  };

  const resources = getResourceData().filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'bg-green-500',
      available: 'bg-green-500',
      active: 'bg-green-500',
      stopped: 'bg-red-500',
      maintenance: 'bg-yellow-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {onRefresh && (
        <div className="flex justify-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading resources...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400">No resources found</div>
          </div>
        ) : (
      <table className="w-full">
        <thead className="bg-gray-750">
          <tr>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">Name</th>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">ID</th>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">
              {resourceType === 'instances' ? 'Type' : resourceType === 'databases' ? 'Engine' : 'Size'}
            </th>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">Status</th>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">Region</th>
            <th className="text-left py-3 px-6 text-gray-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, index) => (
            <tr key={resource.id} className="border-t border-gray-700 hover:bg-gray-750">
              <td className="py-4 px-6">
                <div className="font-medium text-white">{resource.name}</div>
              </td>
              <td className="py-4 px-6 text-gray-400 font-mono text-sm">{resource.id}</td>
              <td className="py-4 px-6 text-gray-300">
                {(resource as any).type || (resource as any).engine || (resource as any).size}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(resource.status)}`}></div>
                  <span className="text-gray-300 capitalize">{resource.status}</span>
                </div>
              </td>
              <td className="py-4 px-6 text-gray-300">{resource.region}</td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  {resourceType === 'instances' && (
                    <>
                      <button 
                        onClick={() => handleAction('start', resource.id)}
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        title="Start"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAction('stop', resource.id)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleAction('delete', resource.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        )}
      </div>
    </div>
  );
}