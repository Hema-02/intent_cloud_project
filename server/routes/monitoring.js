const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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