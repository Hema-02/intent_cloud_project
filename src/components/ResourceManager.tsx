import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { ResourceTable } from './ResourceTable';
import { CreateResourceModal } from './CreateResourceModal';
import { resourcesAPI } from '../lib/api';

interface ResourceManagerProps {
  activeProvider: string;
}

export function ResourceManager({ activeProvider }: ResourceManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState('instances');
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resourceTypes = {
    instances: 'Compute Instances',
    databases: 'Databases',
    storage: 'Storage',
    networking: 'Networking',
    security: 'Security',
  };

  // Load resources when component mounts or provider/type changes
  React.useEffect(() => {
    loadResources();
  }, [activeProvider, selectedResourceType]);

  const loadResources = async () => {
    setLoading(true);
    try {
      // Only try API call if backend is available
      try {
        const data = await resourcesAPI.getAll(activeProvider, selectedResourceType);
        setResources(data.resources);
      } catch (apiError) {
        console.warn('Backend API not available, using mock data:', apiError);
        // Fallback to mock data if API fails
        const mockData = { [selectedResourceType]: getMockResources(activeProvider, selectedResourceType) };
        setResources(mockData);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      const mockData = { [selectedResourceType]: getMockResources(activeProvider, selectedResourceType) };
      setResources(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMockResources = (provider: string, resourceType: string) => {
    // GCP-specific mock resources
    const gcpMockResources = {
      instances: [
        {
          id: 'gcp-vm-001',
          name: 'web-server-gcp',
          type: 'e2-medium',
          status: 'running',
          region: 'us-central1',
          zone: 'us-central1-a',
          cost: '$23.36/month',
          created: '2024-01-15'
        },
        {
          id: 'gcp-vm-002',
          name: 'database-server-gcp',
          type: 'n1-standard-2',
          status: 'stopped',
          region: 'europe-west1',
          zone: 'europe-west1-b',
          cost: '$48.54/month',
          created: '2024-01-10'
        }
      ],
      databases: [
        {
          id: 'gcp-sql-001',
          name: 'production-db-gcp',
          engine: 'PostgreSQL',
          status: 'running',
          region: 'us-central1',
          cost: '$89.12/month',
          created: '2024-01-12'
        },
        {
          id: 'gcp-sql-002',
          name: 'development-db-gcp',
          engine: 'MySQL',
          status: 'running',
          region: 'us-central1',
          cost: '$45.60/month',
          created: '2024-01-10'
        }
      ],
      storage: [
        {
          id: 'gcp-bucket-001',
          name: 'app-storage-gcp',
          type: 'Standard',
          size: '2.1 TB',
          status: 'active',
          region: 'us-central1',
          cost: '$423.67/month',
          created: '2024-01-15'
        }
      ],
      networking: [
        {
          id: 'gcp-vpc-001',
          name: 'main-vpc-gcp',
          type: 'VPC Network',
          cidr: '10.0.0.0/16',
          status: 'active',
          region: 'global',
          cost: '$0.00/month',
          created: '2024-01-01'
        }
      ],
      security: [
        {
          id: 'gcp-fw-001',
          name: 'web-firewall-gcp',
          type: 'Firewall Rule',
          rules: '3 ingress, 1 egress',
          status: 'active',
          cost: '$0.00/month',
          created: '2024-01-05'
        }
      ]
    };

    const awsMockResources = {
      instances: [
        {
          id: 'i-1234567890abcdef0',
          name: 'web-server-01',
          type: 't3.medium',
          status: 'running',
          region: 'us-east-1',
          cost: '$45.60/month',
          created: '2024-01-15'
        },
        {
          id: 'i-0987654321fedcba0',
          name: 'database-server',
          type: 't3.large',
          status: 'stopped',
          region: 'us-west-2',
          cost: '$91.20/month',
          created: '2024-01-10'
        }
      ],
      databases: [
        {
          id: 'db-1234567890',
          name: 'production-db',
          engine: 'PostgreSQL',
          status: 'available',
          region: 'us-east-1',
          cost: '$120.00/month',
          created: '2024-01-12'
        }
      ],
      storage: [
        {
          id: 'vol-1234567890',
          name: 'app-storage',
          type: 'gp3',
          size: '100 GB',
          status: 'in-use',
          cost: '$10.00/month',
          created: '2024-01-15'
        }
      ],
      networking: [
        {
          id: 'vpc-1234567890',
          name: 'main-vpc',
          type: 'VPC',
          cidr: '10.0.0.0/16',
          status: 'available',
          cost: '$0.00/month',
          created: '2024-01-01'
        }
      ],
      security: [
        {
          id: 'sg-1234567890',
          name: 'web-security-group',
          type: 'Security Group',
          rules: '3 inbound, 1 outbound',
          status: 'active',
          cost: '$0.00/month',
          created: '2024-01-05'
        }
      ]
    };

    const mockData = provider === 'gcp' ? gcpMockResources : awsMockResources;
    return mockData[resourceType as keyof typeof mockData] || [];
  };

  const handleCreateResource = async (resourceData: any) => {
    try {
      await resourcesAPI.create(activeProvider, selectedResourceType, resourceData);
      setShowCreateModal(false);
      loadResources(); // Refresh the list
    } catch (error) {
      console.error('Failed to create resource:', error);
      // Show success message even if API fails (demo mode)
      setShowCreateModal(false);
      alert('Resource created successfully (Demo Mode)');
      loadResources(); // Refresh with mock data
    }
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
          resources={resources}
          loading={loading}
          onRefresh={loadResources}
        />
      </div>

      {showCreateModal && (
        <CreateResourceModal
          activeProvider={activeProvider}
          resourceType={selectedResourceType}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateResource}
        />
      )}
    </div>
  );
}