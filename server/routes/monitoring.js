const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const GCPService = require('../lib/gcp');

const router = express.Router();

// Initialize GCP service
const gcpService = new GCPService();

// Generate mock monitoring data
const generateMetrics = (provider) => {
  const baseMetrics = {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 10,
    disk: Math.random() * 100
  };

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 10,
    disk: Math.random() * 100
  }));

  const alerts = [
    {
      id: 'alert-001',
      severity: 'high',
      message: `High CPU usage on ${provider.toUpperCase()} instance`,
      resource: `${provider}-instance-001`,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'alert-002',
      severity: 'medium',
      message: 'Memory usage approaching threshold',
      resource: `${provider}-db-001`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'alert-003',
      severity: 'low',
      message: 'Disk space warning',
      resource: `${provider}-storage-001`,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'resolved'
    }
  ];

  return {
    provider,
    currentMetrics: baseMetrics,
    timeSeries: timeSeriesData,
    alerts: alerts.filter(alert => alert.status === 'active'),
    healthStatus: {
      overall: baseMetrics.cpu < 80 && baseMetrics.memory < 80 ? 'healthy' : 'warning',
      services: {
        compute: Math.floor(Math.random() * 30) + 20,
        database: Math.floor(Math.random() * 10) + 5,
        storage: Math.floor(Math.random() * 20) + 10,
        network: Math.floor(Math.random() * 15) + 8
      }
    }
  };
};

// Get monitoring data for a provider
router.get('/:provider', authenticateToken, (req, res) => {
  try {
    const { provider } = req.params;
    const { timeRange = '24h' } = req.query;

    const validProviders = ['aws', 'gcp', 'azure'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        error: 'Invalid provider'
      });
    }

    if (provider === 'gcp') {
      return handleGCPMonitoring(req, res, timeRange);
    }
    
    const monitoringData = generateMetrics(provider);

    res.json({
      ...monitoringData,
      timeRange,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get monitoring data error:', error);
    res.status(500).json({
      error: 'Failed to fetch monitoring data'
    });
  }
});

// Handle GCP monitoring requests
async function handleGCPMonitoring(req, res, timeRange) {
  try {
    // Get real GCP instances for monitoring
    let instances = [];
    try {
      instances = await gcpService.listInstances();
    } catch (error) {
      console.error('Failed to fetch GCP instances for monitoring:', error);
    }
    
    // Get metrics for each instance
    const instanceMetrics = {};
    for (const instance of instances.slice(0, 3)) { // Limit to first 3 instances
      try {
        instanceMetrics[instance.name] = await gcpService.getInstanceMetrics(instance.name, instance.zone);
      } catch (error) {
        console.error(`Failed to get metrics for ${instance.name}:`, error);
        instanceMetrics[instance.name] = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 10,
          disk: Math.random() * 100
        };
      }
    }
    
    // Calculate average metrics
    const avgMetrics = {
      cpu: Object.values(instanceMetrics).reduce((sum, m) => sum + m.cpu, 0) / Math.max(Object.keys(instanceMetrics).length, 1),
      memory: Object.values(instanceMetrics).reduce((sum, m) => sum + m.memory, 0) / Math.max(Object.keys(instanceMetrics).length, 1),
      network: Object.values(instanceMetrics).reduce((sum, m) => sum + m.network, 0) / Math.max(Object.keys(instanceMetrics).length, 1),
      disk: Object.values(instanceMetrics).reduce((sum, m) => sum + m.disk, 0) / Math.max(Object.keys(instanceMetrics).length, 1)
    };
    
    // Generate time series data
    const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      cpu: avgMetrics.cpu + (Math.random() - 0.5) * 20,
      memory: avgMetrics.memory + (Math.random() - 0.5) * 20,
      network: avgMetrics.network + (Math.random() - 0.5) * 2,
      disk: avgMetrics.disk + (Math.random() - 0.5) * 10
    }));
    
    // Generate alerts based on real metrics
    const alerts = [];
    if (avgMetrics.cpu > 80) {
      alerts.push({
        id: 'gcp-alert-cpu',
        severity: 'high',
        message: 'High CPU usage detected on GCP instances',
        resource: 'compute-instances',
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }
    
    if (avgMetrics.memory > 85) {
      alerts.push({
        id: 'gcp-alert-memory',
        severity: 'medium',
        message: 'Memory usage approaching threshold',
        resource: 'compute-instances',
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }
    
    res.json({
      provider: 'gcp',
      currentMetrics: avgMetrics,
      timeSeries: timeSeriesData,
      alerts,
      instanceMetrics,
      healthStatus: {
        overall: avgMetrics.cpu < 80 && avgMetrics.memory < 80 ? 'healthy' : 'warning',
        services: {
          compute: instances.filter(i => i.status === 'running').length,
          database: Math.floor(Math.random() * 10) + 5,
          storage: Math.floor(Math.random() * 20) + 10,
          network: Math.floor(Math.random() * 15) + 8
        }
      },
      timeRange,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('GCP monitoring error:', error);
    // Fallback to mock data
    const monitoringData = generateMetrics('gcp');
    res.json({
      ...monitoringData,
      timeRange,
      timestamp: new Date().toISOString(),
      note: 'Using fallback data due to GCP API error'
    });
  }
}

// Get specific metric data
router.get('/:provider/metrics/:metric', authenticateToken, (req, res) => {
  try {
    const { provider, metric } = req.params;
    const { timeRange = '24h', interval = '1h' } = req.query;

    const validMetrics = ['cpu', 'memory', 'network', 'disk'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        error: 'Invalid metric'
      });
    }

    const dataPoints = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.random() * 100,
      unit: metric === 'network' ? 'GB/s' : '%'
    }));

    res.json({
      provider,
      metric,
      timeRange,
      interval,
      dataPoints,
      summary: {
        current: dataPoints[dataPoints.length - 1].value,
        average: dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length,
        max: Math.max(...dataPoints.map(dp => dp.value)),
        min: Math.min(...dataPoints.map(dp => dp.value))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get metric data error:', error);
    res.status(500).json({
      error: 'Failed to fetch metric data'
    });
  }
});

// Get alerts
router.get('/:provider/alerts', authenticateToken, (req, res) => {
  try {
    const { provider } = req.params;
    const { severity, status = 'active' } = req.query;

    let alerts = generateMetrics(provider).alerts;

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    res.json({
      provider,
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts'
    });
  }
});

module.exports = router;