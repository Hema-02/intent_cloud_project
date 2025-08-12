const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Mock security data
const mockSecurityData = {
  aws: {
    score: 85,
    metrics: [
      { label: 'Security Groups', value: 28, status: 'good' },
      { label: 'IAM Policies', value: 156, status: 'warning' },
      { label: 'Access Keys', value: 12, status: 'good' },
      { label: 'Active Users', value: 45, status: 'good' }
    ],
    vulnerabilities: [
      {
        id: 'vuln-001',
        severity: 'high',
        title: 'Unrestricted SSH Access',
        resource: 'sg-1234567890abc',
        description: 'Security group allows SSH (port 22) from 0.0.0.0/0',
        remediation: 'Restrict SSH access to specific IP ranges',
        cvss: 7.5
      },
      {
        id: 'vuln-002',
        severity: 'medium',
        title: 'Unused Access Key',
        resource: 'AKIA...XYZ123',
        description: 'Access key has not been used in 90+ days',
        remediation: 'Remove or rotate unused access keys',
        cvss: 5.3
      },
      {
        id: 'vuln-003',
        severity: 'low',
        title: 'Weak Password Policy',
        resource: 'IAM Policy',
        description: 'Password policy does not require special characters',
        remediation: 'Update password policy requirements',
        cvss: 3.1
      }
    ],
    compliance: [
      { name: 'SOC 2', status: 'compliant', score: 98 },
      { name: 'ISO 27001', status: 'compliant', score: 95 },
      { name: 'GDPR', status: 'warning', score: 87 },
      { name: 'HIPAA', status: 'non-compliant', score: 72 }
    ]
  },
  gcp: {
    score: 78,
    metrics: [
      { label: 'Firewall Rules', value: 22, status: 'good' },
      { label: 'IAM Bindings', value: 134, status: 'good' },
      { label: 'Service Accounts', value: 18, status: 'warning' },
      { label: 'Active Users', value: 32, status: 'good' }
    ],
    vulnerabilities: [
      {
        id: 'vuln-004',
        severity: 'high',
        title: 'Public Storage Bucket',
        resource: 'bucket-public-data',
        description: 'Storage bucket is publicly accessible',
        remediation: 'Configure proper access controls',
        cvss: 8.2
      }
    ],
    compliance: [
      { name: 'SOC 2', status: 'compliant', score: 92 },
      { name: 'ISO 27001', status: 'warning', score: 84 },
      { name: 'GDPR', status: 'compliant', score: 91 }
    ]
  },
  azure: {
    score: 82,
    metrics: [
      { label: 'Network Security Groups', value: 31, status: 'good' },
      { label: 'Azure AD Policies', value: 89, status: 'good' },
      { label: 'Key Vault Secrets', value: 24, status: 'good' },
      { label: 'Active Users', value: 38, status: 'good' }
    ],
    vulnerabilities: [
      {
        id: 'vuln-005',
        severity: 'medium',
        title: 'Outdated VM Extensions',
        resource: 'vm-web-server-01',
        description: 'Virtual machine has outdated security extensions',
        remediation: 'Update VM extensions to latest versions',
        cvss: 6.1
      }
    ],
    compliance: [
      { name: 'SOC 2', status: 'compliant', score: 96 },
      { name: 'ISO 27001', status: 'compliant', score: 89 },
      { name: 'GDPR', status: 'compliant', score: 93 }
    ]
  }
};

// Get security overview
router.get('/:provider', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    const { provider } = req.params;

    if (!mockSecurityData[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    const securityData = mockSecurityData[provider];

    // Generate access management data
    const accessManagement = [
      {
        id: 'user-001',
        name: 'John Doe',
        email: 'john@company.com',
        role: 'Admin',
        lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'user-002',
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'Developer',
        lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'user-003',
        name: 'Bob Wilson',
        email: 'bob@company.com',
        role: 'Viewer',
        lastAccess: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'inactive'
      }
    ];

    res.json({
      provider,
      security: {
        ...securityData,
        accessManagement,
        lastScan: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextScan: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get security data error:', error);
    res.status(500).json({
      error: 'Failed to fetch security data'
    });
  }
});

// Get vulnerabilities
router.get('/:provider/vulnerabilities', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    const { provider } = req.params;
    const { severity, status = 'open' } = req.query;

    if (!mockSecurityData[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    let vulnerabilities = mockSecurityData[provider].vulnerabilities;

    if (severity) {
      vulnerabilities = vulnerabilities.filter(vuln => vuln.severity === severity);
    }

    res.json({
      provider,
      vulnerabilities,
      count: vulnerabilities.length,
      summary: {
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get vulnerabilities error:', error);
    res.status(500).json({
      error: 'Failed to fetch vulnerabilities'
    });
  }
});

// Run security scan
router.post('/:provider/scan', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    const { provider } = req.params;
    const { scanType = 'full' } = req.body;

    // Simulate scan process
    setTimeout(() => {
      res.json({
        provider,
        scanType,
        status: 'completed',
        scanId: `scan-${Date.now()}`,
        results: {
          vulnerabilitiesFound: Math.floor(Math.random() * 10) + 1,
          newIssues: Math.floor(Math.random() * 3),
          resolvedIssues: Math.floor(Math.random() * 2),
          scanDuration: '2m 34s'
        },
        timestamp: new Date().toISOString()
      });
    }, 1000);

  } catch (error) {
    console.error('Security scan error:', error);
    res.status(500).json({
      error: 'Failed to run security scan'
    });
  }
});

// Get compliance status
router.get('/:provider/compliance', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    const { provider } = req.params;

    if (!mockSecurityData[provider]) {
      return res.status(404).json({
        error: 'Provider not found'
      });
    }

    const compliance = mockSecurityData[provider].compliance;

    res.json({
      provider,
      compliance,
      overallScore: compliance.reduce((sum, c) => sum + c.score, 0) / compliance.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get compliance data error:', error);
    res.status(500).json({
      error: 'Failed to fetch compliance data'
    });
  }
});

module.exports = router;