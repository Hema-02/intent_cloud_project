const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Mock billing data
const mockBillingData = {
  aws: {
    currentCost: 2847.32,
    lastMonth: 2654.18,
    trend: 7.3,
    services: [
      { name: 'EC2 Instances', cost: 1245.67, percentage: 44 },
      { name: 'S3 Storage', cost: 567.89, percentage: 20 },
      { name: 'RDS Databases', cost: 423.12, percentage: 15 },
      { name: 'CloudFront', cost: 234.56, percentage: 8 },
      { name: 'Other Services', cost: 376.08, percentage: 13 }
    ]
  },
  gcp: {
    currentCost: 1923.45,
    lastMonth: 2156.78,
    trend: -10.8,
    services: [
      { name: 'Compute Engine', cost: 856.34, percentage: 45 },
      { name: 'Cloud Storage', cost: 423.67, percentage: 22 },
      { name: 'Cloud SQL', cost: 345.23, percentage: 18 },
      { name: 'Cloud CDN', cost: 156.78, percentage: 8 },
      { name: 'Other Services', cost: 141.43, percentage: 7 }
    ]
  },
  azure: {
    currentCost: 3156.78,
    lastMonth: 2987.45,
    trend: 5.7,
    services: [
      { name: 'Virtual Machines', cost: 1423.45, percentage: 45 },
      { name: 'Blob Storage', cost: 634.56, percentage: 20 },
      { name: 'Azure SQL', cost: 567.89, percentage: 18 },
      { name: 'Azure CDN', cost: 234.67, percentage: 7 },
      { name: 'Other Services', cost: 296.21, percentage: 10 }
    ]
  }
};

// Get billing data for a provider
router.get('/:provider', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider } = req.params;
    const { period = 'current' } = req.query;

    if (!mockBillingData[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    const billingData = mockBillingData[provider];

    // Generate cost history
    const costHistory = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
      cost: Math.random() * 1000 + 1500,
      date: new Date(2024, i, 1).toISOString()
    }));

    // Generate budget alerts
    const budgetAlerts = [
      {
        id: 'budget-001',
        type: 'warning',
        message: '85% of monthly budget used',
        current: billingData.currentCost * 0.85,
        limit: billingData.currentCost / 0.85,
        severity: 'medium'
      },
      {
        id: 'budget-002',
        type: 'info',
        message: 'Storage costs within budget',
        current: 567,
        limit: 800,
        severity: 'low'
      },
      {
        id: 'budget-003',
        type: 'optimization',
        message: 'Potential savings identified',
        savings: 234,
        severity: 'info'
      }
    ];

    // Generate recent transactions
    const recentTransactions = [
      {
        id: 'txn-001',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        service: 'EC2',
        description: 'Instance usage - i-1234567890abc',
        amount: 45.67
      },
      {
        id: 'txn-002',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        service: 'S3',
        description: 'Storage and requests',
        amount: 23.45
      },
      {
        id: 'txn-003',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        service: 'RDS',
        description: 'Database instance - db-prod-01',
        amount: 78.90
      }
    ];

    res.json({
      provider,
      period,
      billing: {
        ...billingData,
        projectedAnnual: billingData.currentCost * 12,
        costHistory,
        budgetAlerts,
        recentTransactions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get billing data error:', error);
    res.status(500).json({
      error: 'Failed to fetch billing data'
    });
  }
});

// Get cost breakdown
router.get('/:provider/breakdown', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider } = req.params;
    const { groupBy = 'service', period = 'month' } = req.query;

    if (!mockBillingData[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    const billingData = mockBillingData[provider];

    res.json({
      provider,
      groupBy,
      period,
      breakdown: billingData.services,
      total: billingData.currentCost,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get cost breakdown error:', error);
    res.status(500).json({
      error: 'Failed to fetch cost breakdown'
    });
  }
});

// Get budget alerts
router.get('/:provider/alerts', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { provider } = req.params;

    const budgetAlerts = [
      {
        id: 'budget-001',
        type: 'warning',
        message: '85% of monthly budget used',
        threshold: 85,
        current: 85,
        severity: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'budget-002',
        type: 'optimization',
        message: 'Potential savings identified',
        savings: 234,
        severity: 'info',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      provider,
      alerts: budgetAlerts,
      count: budgetAlerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch budget alerts'
    });
  }
});

module.exports = router;