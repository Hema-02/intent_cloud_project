import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Users, Key, Eye, EyeOff } from 'lucide-react';

interface SecurityProps {
  activeProvider: string;
}

export function Security({ activeProvider }: SecurityProps) {
  const [selectedTab, setSelectedTab] = useState('overview');

  const securityMetrics = [
    { label: 'Security Groups', value: '28', status: 'good', icon: Shield },
    { label: 'IAM Policies', value: '156', status: 'warning', icon: Lock },
    { label: 'Access Keys', value: '12', status: 'good', icon: Key },
    { label: 'Active Users', value: '45', status: 'good', icon: Users },
  ];

  const vulnerabilities = [
    { severity: 'high', title: 'Unrestricted SSH Access', resource: 'sg-1234567890abc', description: 'Security group allows SSH (port 22) from 0.0.0.0/0' },
    { severity: 'medium', title: 'Unused Access Key', resource: 'AKIA...XYZ123', description: 'Access key has not been used in 90+ days' },
    { severity: 'low', title: 'Weak Password Policy', resource: 'IAM Policy', description: 'Password policy does not require special characters' },
  ];

  const complianceChecks = [
    { name: 'SOC 2', status: 'compliant', score: 98 },
    { name: 'ISO 27001', status: 'compliant', score: 95 },
    { name: 'GDPR', status: 'warning', score: 87 },
    { name: 'HIPAA', status: 'non-compliant', score: 72 },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      good: 'text-green-400',
      warning: 'text-yellow-400',
      critical: 'text-red-400',
      compliant: 'text-green-400',
      'non-compliant': 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'border-red-500 bg-red-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10',
    };
    return colors[severity as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Security Center</h2>
        <div className="text-sm text-gray-400">
          Provider: {activeProvider.toUpperCase()}
        </div>
      </div>

      {/* Security Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'vulnerabilities', label: 'Vulnerabilities' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'access', label: 'Access Management' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {securityMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`w-8 h-8 ${getStatusColor(metric.status)}`} />
                        <div className={`w-3 h-3 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="text-2xl font-bold text-white">{metric.value}</div>
                      <div className="text-sm text-gray-300">{metric.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Security Score */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Overall Security Score</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Security Score</span>
                      <span>85/100</span>
                    </div>
                    <div className="bg-gray-600 rounded-full h-3">
                      <div className="bg-gradient-to-r from-yellow-500 to-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-400">85</div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'vulnerabilities' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Security Vulnerabilities</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Run Security Scan
                </button>
              </div>
              {vulnerabilities.map((vuln, index) => (
                <div key={index} className={`border-l-4 p-4 rounded ${getSeverityColor(vuln.severity)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">{vuln.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{vuln.description}</p>
                      <p className="text-gray-400 text-xs mt-2">Resource: {vuln.resource}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Fix
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors">
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceChecks.map((check, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-white">{check.name}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        check.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                        check.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {check.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              check.score >= 95 ? 'bg-green-500' :
                              check.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">{check.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'access' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Access Management</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Add User
                </button>
              </div>
              
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="text-left py-3 px-6 text-gray-300 font-medium">User</th>
                      <th className="text-left py-3 px-6 text-gray-300 font-medium">Role</th>
                      <th className="text-left py-3 px-6 text-gray-300 font-medium">Last Access</th>
                      <th className="text-left py-3 px-6 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-6 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'John Doe', email: 'john@company.com', role: 'Admin', lastAccess: '2 hours ago', status: 'active' },
                      { name: 'Jane Smith', email: 'jane@company.com', role: 'Developer', lastAccess: '1 day ago', status: 'active' },
                      { name: 'Bob Wilson', email: 'bob@company.com', role: 'Viewer', lastAccess: '1 week ago', status: 'inactive' },
                    ].map((user, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{user.role}</td>
                        <td className="py-4 px-6 text-gray-300">{user.lastAccess}</td>
                        <td className="py-4 px-6">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-300">
                              <Lock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}