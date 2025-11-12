const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const GCPService = require('../lib/gcp');

const router = express.Router();

// Initialize GCP service
const gcpService = new GCPService();

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

    if (provider === 'gcp') {
      return handleGCPResourceRequest(req, res, type);
    }
    
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

// Handle GCP resource requests
async function handleGCPResourceRequest(req, res, type) {
  try {
    let resources = {};
    
    if (!type || type === 'instances') {
      try {
        const instances = await gcpService.listInstances();
        resources.instances = instances;
      } catch (error) {
        console.error('Failed to fetch GCP instances:', error);
        resources.instances = mockResources.gcp.instances;
      }
    }
    
    if (!type || type === 'storage') {
      try {
        const buckets = await gcpService.listStorageBuckets();
        resources.storage = buckets;
      } catch (error) {
        console.error('Failed to fetch GCP storage:', error);
        resources.storage = mockResources.gcp.storage;
      }
    }
    
    if (!type || type === 'databases') {
      // For now, use mock data for databases
      resources.databases = mockResources.gcp.databases;
    }
    
    res.json({
      provider: 'gcp',
      resources,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('GCP resource request error:', error);
    res.status(500).json({
      error: 'Failed to fetch GCP resources',
      fallback: 'Using mock data'
    });
  }
}

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
    const { name, instanceType, region, zone } = req.body;

    if (provider === 'gcp') {
      return handleGCPResourceCreation(req, res, type);
    }
    
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

// Handle GCP resource creation
async function handleGCPResourceCreation(req, res, type) {
  try {
    const { name, instanceType, region, zone } = req.body;
    
    if (type === 'instances') {
      const newInstance = await gcpService.createInstance({
        name,
        instanceType: instanceType || 'e2-medium',
        region: region || process.env.GCP_REGION,
        zone: zone || process.env.GCP_ZONE
      });
      
      res.status(201).json({
        message: 'GCP instance created successfully',
        resource: newInstance
      });
    } else if (type === 'storage') {
      const newBucket = await gcpService.createStorageBucket({
        name,
        region: region || process.env.GCP_REGION,
        storageClass: instanceType || 'STANDARD'
      });
      
      res.status(201).json({
        message: 'GCP storage bucket created successfully',
        resource: newBucket
      });
    } else {
      res.status(400).json({
        error: 'Resource type not supported for GCP yet'
      });
    }
    
  } catch (error) {
    console.error('GCP resource creation error:', error);
    res.status(500).json({
      error: 'Failed to create GCP resource',
      details: error.message
    });
  }
}

// Update resource
router.put('/:provider/:type/:id', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider, type, id } = req.params;
    const updates = req.body;

    if (provider === 'gcp') {
      return handleGCPResourceUpdate(req, res, type, id, updates);
    }

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

// Handle GCP resource updates
async function handleGCPResourceUpdate(req, res, type, id, updates) {
  try {
    if (type === 'instances') {
      let result;
      
      if (updates.status === 'running') {
        result = await gcpService.startInstance(id, updates.zone);
      } else if (updates.status === 'stopped') {
        result = await gcpService.stopInstance(id, updates.zone);
      } else {
        return res.status(400).json({
          error: 'Invalid status update for GCP instance'
        });
      }
      
      res.json({
        message: result.message,
        resource: { id, ...updates, updatedAt: new Date().toISOString() }
      });
    } else {
      res.status(400).json({
        error: 'Resource type update not supported for GCP yet'
      });
    }
    
  } catch (error) {
    console.error('GCP resource update error:', error);
    res.status(500).json({
      error: 'Failed to update GCP resource',
      details: error.message
    });
  }
}

// Delete resource
router.delete('/:provider/:type/:id', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider, type, id } = req.params;

    if (provider === 'gcp') {
      return handleGCPResourceDeletion(req, res, type, id);
    }

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

// Handle GCP resource deletion
async function handleGCPResourceDeletion(req, res, type, id) {
  try {
    if (type === 'instances') {
      const result = await gcpService.deleteInstance(id, req.query.zone);
      
      res.json({
        message: result.message,
        resource: { id, deletedAt: new Date().toISOString() }
      });
    } else {
      res.status(400).json({
        error: 'Resource type deletion not supported for GCP yet'
      });
    }
    
  } catch (error) {
    console.error('GCP resource deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete GCP resource',
      details: error.message
    });
  }
}

// Handle IBM Cloud resource deletion
async function handleIBMResourceDeletion(req, res, type, id) {
  try {
    if (type === 'instances') {
      const result = await ibmCloudService.deleteInstance(id);
      
      res.json({
        message: result.message,
        resource: { id, deletedAt: new Date().toISOString() }
      });
    } else {
      res.status(400).json({
        error: 'Resource type deletion not supported for IBM Cloud yet'
      });
    }
    
  } catch (error) {
    console.error('IBM Cloud resource deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete IBM Cloud resource',
      details: error.message
    });
  }
}

module.exports = router;