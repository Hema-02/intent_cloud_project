import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateResourceModalProps {
  activeProvider: string;
  resourceType?: string;
  onClose: () => void;
  onCreate?: (data: any) => void;
}

export function CreateResourceModal({ 
  activeProvider, 
  resourceType: initialResourceType = 'instances',
  onClose,
  onCreate
}: CreateResourceModalProps) {
  const [resourceType, setResourceType] = useState(initialResourceType);
  const [formData, setFormData] = useState({
    name: '',
    instanceType: '',
    region: 'us-east-1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.instanceType) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const resourceData = {
        name: formData.name,
        instanceType: formData.instanceType,
        region: formData.region,
        resourceType,
        provider: activeProvider
      };

      if (onCreate) {
        await onCreate(resourceData);
      } else {
        console.log('Creating resource:', resourceData);
        onClose();
      }
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create Resource</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              disabled={!!initialResourceType}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="instances">Compute Instance</option>
              <option value="databases">Database</option>
              <option value="storage">Storage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter resource name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type/Size
            </label>
            <select
              value={formData.instanceType}
              onChange={(e) => setFormData({ ...formData, instanceType: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              {activeProvider === 'gcp' ? (
                <>
                  <option value="e2-micro">e2-micro (1 vCPU, 1GB RAM)</option>
                  <option value="e2-small">e2-small (1 vCPU, 2GB RAM)</option>
                  <option value="e2-medium">e2-medium (1 vCPU, 4GB RAM)</option>
                  <option value="e2-standard-2">e2-standard-2 (2 vCPU, 8GB RAM)</option>
                  <option value="e2-standard-4">e2-standard-4 (4 vCPU, 16GB RAM)</option>
                  <option value="n1-standard-1">n1-standard-1 (1 vCPU, 3.75GB RAM)</option>
                  <option value="n1-standard-2">n1-standard-2 (2 vCPU, 7.5GB RAM)</option>
                </>
              ) : activeProvider === 'azure' ? (
                <>
                  <option value="Standard_B1s">Standard_B1s (1 vCPU, 1GB RAM)</option>
                  <option value="Standard_B2s">Standard_B2s (2 vCPU, 4GB RAM)</option>
                  <option value="Standard_D2s_v3">Standard_D2s_v3 (2 vCPU, 8GB RAM)</option>
                  <option value="Standard_D4s_v3">Standard_D4s_v3 (4 vCPU, 16GB RAM)</option>
                </>
              ) : (
                <>
                  <option value="t3.micro">t3.micro (2 vCPU, 1GB RAM)</option>
                  <option value="t3.small">t3.small (2 vCPU, 2GB RAM)</option>
                  <option value="t3.medium">t3.medium (2 vCPU, 4GB RAM)</option>
                  <option value="t3.large">t3.large (2 vCPU, 8GB RAM)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeProvider === 'gcp' ? (
                <>
                  <option value="us-central1">US Central (Iowa)</option>
                  <option value="us-east1">US East (South Carolina)</option>
                  <option value="us-west1">US West (Oregon)</option>
                  <option value="europe-west1">Europe West (Belgium)</option>
                  <option value="asia-southeast1">Asia Southeast (Singapore)</option>
                </>
              ) : activeProvider === 'azure' ? (
                <>
                  <option value="eastus">East US</option>
                  <option value="westus2">West US 2</option>
                  <option value="centralus">Central US</option>
                  <option value="westeurope">West Europe</option>
                  <option value="southeastasia">Southeast Asia</option>
                </>
              ) : (
                <>
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </>
              )}
            </select>
          </div>

          {activeProvider === 'gcp' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zone
              </label>
              <select
                value={formData.zone || ''}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-select zone</option>
                <option value={`${formData.region}-a`}>{formData.region}-a</option>
                <option value={`${formData.region}-b`}>{formData.region}-b</option>
                <option value={`${formData.region}-c`}>{formData.region}-c</option>
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}