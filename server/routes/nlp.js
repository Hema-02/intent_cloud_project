const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Natural Language Processing for cloud commands
const processNaturalLanguage = (input, provider, user) => {
  const command = input.toLowerCase().trim();
  
  // Command patterns and responses
  const patterns = [
    {
      pattern: /create|launch|start.*(?:instance|vm|server|machine)/i,
      response: () => ({
        action: 'create_instance',
        message: `I'll help you create a new compute instance on ${provider.toUpperCase()}.`,
        details: {
          type: 'instance_creation',
          provider,
          suggestedConfig: {
            instanceType: 't3.medium',
            region: 'us-east-1',
            estimatedCost: '$0.0416/hour'
          },
          nextSteps: [
            'Choose instance type and size',
            'Select region and availability zone',
            'Configure security groups',
            'Review and launch'
          ]
        }
      })
    },
    {
      pattern: /list|show|display.*(?:instance|vm|server|resource)/i,
      response: () => ({
        action: 'list_resources',
        message: `Here are your current resources on ${provider.toUpperCase()}:`,
        details: {
          type: 'resource_listing',
          provider,
          resources: {
            instances: [
              { id: 'i-1234567890abc', name: 'web-server-01', status: 'running', type: 't3.large' },
              { id: 'i-0987654321def', name: 'db-server-01', status: 'stopped', type: 't2.micro' },
              { id: 'i-abcdef123456', name: 'api-server-01', status: 'running', type: 'm5.xlarge' }
            ],
            databases: [
              { id: 'db-1234567890', name: 'prod-database', status: 'available', engine: 'PostgreSQL' },
              { id: 'db-0987654321', name: 'test-database', status: 'maintenance', engine: 'MySQL' }
            ]
          }
        }
      })
    },
    {
      pattern: /delete|remove|terminate|destroy/i,
      response: () => ({
        action: 'delete_resource',
        message: '⚠️ I can help you safely delete resources.',
        details: {
          type: 'resource_deletion',
          provider,
          warning: 'This action cannot be undone',
          requirements: [
            'Specify the resource ID or name',
            'Confirm you have backed up important data',
            'Check for dependencies'
          ],
          safetyChecks: [
            'Backup verification',
            'Dependency analysis',
            'User confirmation required'
          ]
        }
      })
    },
    {
      pattern: /scale|resize|upgrade|expand/i,
      response: () => ({
        action: 'scale_resources',
        message: `I'll help you scale your ${provider.toUpperCase()} resources.`,
        details: {
          type: 'resource_scaling',
          provider,
          currentConfig: {
            autoScalingGroups: 2,
            currentCapacity: '3-8 instances',
            cpuTarget: '70%',
            scaleOutCooldown: '300 seconds'
          },
          scalingOptions: [
            'Vertical scaling (instance size)',
            'Horizontal scaling (instance count)',
            'Auto-scaling configuration',
            'Load balancer adjustment'
          ]
        }
      })
    },
    {
      pattern: /monitor|status|health|performance/i,
      response: () => ({
        action: 'show_monitoring',
        message: `Current monitoring data for ${provider.toUpperCase()}:`,
        details: {
          type: 'monitoring_data',
          provider,
          systemHealth: 'Good',
          metrics: {
            cpu: '67%',
            memory: '45%',
            network: '2.3 GB/s',
            disk: '78%'
          },
          alerts: [
            { severity: 'high', message: 'High CPU on i-1234567890abc', time: '2 min ago' },
            { severity: 'medium', message: 'Memory warning on db-server-01', time: '15 min ago' }
          ]
        }
      })
    },
    {
      pattern: /cost|billing|price|spend|budget/i,
      response: () => ({
        action: 'show_billing',
        message: `Billing information for ${provider.toUpperCase()}:`,
        details: {
          type: 'billing_data',
          provider,
          currentMonth: '$2,847.32',
          breakdown: {
            'EC2 Instances': '$1,245.67 (44%)',
            'S3 Storage': '$567.89 (20%)',
            'RDS Databases': '$423.12 (15%)',
            'Other Services': '$610.64 (21%)'
          },
          trend: '+7.3% from last month',
          projectedAnnual: '$34.2K'
        }
      })
    },
    {
      pattern: /security|access|permission|vulnerability/i,
      response: () => ({
        action: 'show_security',
        message: `Security overview for ${provider.toUpperCase()}:`,
        details: {
          type: 'security_data',
          provider,
          securityScore: '85/100',
          status: 'Warning',
          summary: {
            securityGroups: 28,
            iamPolicies: 156,
            accessKeys: 12,
            activeUsers: 45
          },
          vulnerabilities: [
            { severity: 'high', issue: 'Unrestricted SSH access' },
            { severity: 'medium', issue: 'Unused access key' },
            { severity: 'low', issue: 'Weak password policy' }
          ]
        }
      })
    }
  ];

  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.pattern.test(command)) {
      return pattern.response();
    }
  }

  // Default response for unmatched queries
  return {
    action: 'help',
    message: `I understand you want to: "${input}"`,
    details: {
      type: 'help',
      provider,
      availableCommands: [
        'Create - Launch new instances, databases, storage',
        'List/Show - Display your current resources',
        'Delete - Safely remove resources',
        'Scale - Resize or auto-scale resources',
        'Monitor - Check system health and metrics',
        'Cost - View billing and usage information',
        'Security - Review security settings and alerts'
      ],
      examples: [
        'Create a new virtual machine',
        'Show me my running instances',
        'What is my current spending?',
        'Scale up my web servers',
        'Check system health'
      ]
    }
  };
};

// Process natural language command
router.post('/process', authenticateToken, authorizeRole('user'), (req, res) => {
  try {
    const { input, provider = 'aws' } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Input text is required'
      });
    }

    const response = processNaturalLanguage(input, provider, req.user);

    res.json({
      input,
      provider,
      response,
      timestamp: new Date().toISOString(),
      user: req.user.id
    });

  } catch (error) {
    console.error('NLP processing error:', error);
    res.status(500).json({
      error: 'Failed to process natural language command'
    });
  }
});

// Get command suggestions
router.get('/suggestions', authenticateToken, (req, res) => {
  try {
    const { provider = 'aws', category } = req.query;

    const suggestions = {
      create: [
        'Create a new web server instance',
        'Launch a database for my application',
        'Set up a load balancer',
        'Create a storage bucket for backups'
      ],
      manage: [
        'Show me all my running instances',
        'List my databases and their status',
        'Display storage usage across regions',
        'Check which resources are costing the most'
      ],
      monitor: [
        'What is the current system health?',
        'Show me CPU usage for the last hour',
        'Are there any active alerts?',
        'How is my application performing?'
      ],
      optimize: [
        'How can I reduce my cloud costs?',
        'Which instances are underutilized?',
        'Suggest auto-scaling configurations',
        'Identify unused resources'
      ]
    };

    const filteredSuggestions = category && suggestions[category] 
      ? suggestions[category] 
      : Object.values(suggestions).flat();

    res.json({
      provider,
      category: category || 'all',
      suggestions: filteredSuggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      error: 'Failed to fetch suggestions'
    });
  }
});

// Get command history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Mock command history (in production, store in database)
    const history = [
      {
        id: 'cmd-001',
        input: 'Show me my running instances',
        provider: 'aws',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        action: 'list_resources'
      },
      {
        id: 'cmd-002',
        input: 'Create a new web server',
        provider: 'aws',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: 'create_instance'
      },
      {
        id: 'cmd-003',
        input: 'What is my current spending?',
        provider: 'aws',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        action: 'show_billing'
      }
    ];

    res.json({
      history: history.slice(0, parseInt(limit)),
      total: history.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get command history error:', error);
    res.status(500).json({
      error: 'Failed to fetch command history'
    });
  }
});

module.exports = router;