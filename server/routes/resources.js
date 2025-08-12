const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Mock data for different cloud providers
const mockResources = {
  aws: {
    instances: [
      { id: 'i-1234567890abc', name: 'web-server-01', type: 't3.large', status: 'running', region: 'us-east-1', cost: 45.67 },
      { id: 'i-0987654321def', name: 'db-server-01', type: 't2.micro', status: 'stopped', region: 'us-west-2', cost: 8.76 },
      { id: 'i-abcdef123456', name: 'api-server-01', type: 'm5.xlarge', status: 'running', region: 'eu-west-1', cost: 192.00 }
    ],
    databases: [
      { id: 'db-1234567890', name: 'prod-database', engine: 'PostgreSQL', status: 'available', region: 'us-east-1', cost: 78.90 },
      { id: 'db-0987654321', name: 'test-database', engine: 'MySQL', status: 'maintenance', region: 'us-west-2', cost: 23.45 }
    ],
    storage: [
      { id: 'bucket-1234567', name: 'app-assets', size: '1.2TB', status: 'active', region: 'us-east-1', cost: 567.89 },
      { id: 'bucket-7654321', name: 'backup-data', size: '850GB', status: 'active', region: 'us-west-2', cost: 234.56 }
    ]
  },
  gcp: {
    instances: [
      { id: 'gcp-inst-001', name: 'web-vm-01', type: 'n1-standard-2', status: 'running', region: 'us-central1', cost: 52.34 },
      { id: 'gcp-inst-002', name: 'worker-vm-01', type: 'n1-standard-1', status: 'stopped', region: 'europe-west1', cost: 26.17 }
    ],
    databases: [
      { id: 'gcp-db-001', name: 'main-db', engine: 'PostgreSQL', status: 'available', region: 'us-central1', cost: 89.12 }
    ],
    storage: [
      { id: 'gcp-bucket-001', name: 'media-storage', size: '2.1TB', status: 'active', region: 'us-central1', cost: 423.67 }
    ]
  },
  azure: {
    instances: [
      { id: 'azure-vm-001', name: 'app-server', type: 'Standard_D2s_v3', status: 'running', region: 'eastus', cost: 73.45 },
      { id: 'azure-vm-002', name: 'test-server', type: 'Standard_B1s', status: 'deallocated', region: 'westus2', cost: 7.30 }
    ],
    databases: [
      { id: 'azure-sql-001', name: 'production-db', engine: 'SQL Server', status: 'online', region: 'eastus', cost: 156.78 }
    ],
    storage: [
      { id: 'azure-storage-001', name: 'blob-storage', size: '1.8TB', status: 'available', region: 'eastus', cost: 634.56 }
    ]
  }
};

// Get all resources for a provider
router.get('/:provider', authenticateToken, (req, res) => {
  try {
    const { provider } = req.params;
    const { type } = req.query;

    if (!mockResources[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    let resources = mockResources[provider];

    if (type && resources[type]) {
      resources = { [type]: resources[type] };
    }

    res.json({
      provider,
      resources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      error: 'Failed to fetch resources'
    });
  }
});

// Get specific resource
router.get('/:provider/:type/:id', authenticateToken, (req, res) => {
  try {
    const { provider, type, id } = req.params;

    if (!mockResources[provider] || !mockResources[provider][type]) {
      return res.status(404).json({
        error: 'Provider or resource type not found'
      });
    }

    const resource = mockResources[provider][type].find(r => r.id === id);

    if (!resource) {
      return res.status(404).json({
        error: 'Resource not found'
      });
    }

    res.json({
      provider,
      type,
      resource,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      error: 'Failed to fetch resource'
    });
  }
});

// Create new resource
router.post('/:provider/:type', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider, type } = req.params;
    const { name, instanceType, region } = req.body;

    if (!mockResources[provider] || !mockResources[provider][type]) {
      return res.status(404).json({
        error: 'Provider or resource type not found'
      });
    }

    const newResource = {
      id: `${provider}-${type}-${uuidv4().slice(0, 8)}`,
      name: name || `new-${type}`,
      type: instanceType || 't3.micro',
      status: 'launching',
      region: region || 'us-east-1',
      cost: Math.random() * 100,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    mockResources[provider][type].push(newResource);

    res.status(201).json({
      message: 'Resource created successfully',
      resource: newResource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      error: 'Failed to create resource'
    });
  }
});

// Update resource
router.put('/:provider/:type/:id', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider, type, id } = req.params;
    const updates = req.body;

    if (!mockResources[provider] || !mockResources[provider][type]) {
      return res.status(404).json({
        error: 'Provider or resource type not found'
      });
    }

    const resourceIndex = mockResources[provider][type].findIndex(r => r.id === id);

    if (resourceIndex === -1) {
      return res.status(404).json({
        error: 'Resource not found'
      });
    }

    mockResources[provider][type][resourceIndex] = {
      ...mockResources[provider][type][resourceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    res.json({
      message: 'Resource updated successfully',
      resource: mockResources[provider][type][resourceIndex]
    });

  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      error: 'Failed to update resource'
    });
  }
});

// Delete resource
router.delete('/:provider/:type/:id', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider, type, id } = req.params;

    if (!mockResources[provider] || !mockResources[provider][type]) {
      return res.status(404).json({
        error: 'Provider or resource type not found'
      });
    }

    const resourceIndex = mockResources[provider][type].findIndex(r => r.id === id);

    if (resourceIndex === -1) {
      return res.status(404).json({
        error: 'Resource not found'
      });
    }

    const deletedResource = mockResources[provider][type].splice(resourceIndex, 1)[0];

    res.json({
      message: 'Resource deleted successfully',
      resource: deletedResource
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      error: 'Failed to delete resource'
    });
  }
});

module.exports = router;