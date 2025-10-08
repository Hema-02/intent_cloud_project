import React, { useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, Zap, RefreshCw, Download } from 'lucide-react';

interface MonitoringProps {
  activeProvider: string;
}

export function Monitoring({ activeProvider }: MonitoringProps) {
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [timeRange, setTimeRange] = useState('1h');

  const metrics = [
    { id: 'cpu', label: 'CPU Usage', icon: Activity, color: 'text-blue-400', value: '67%' },
    { id: 'memory', label: 'Memory Usage', icon: Zap, color: 'text-green-400', value: '45%' },
    { id: 'network', label: 'Network I/O', icon: TrendingUp, color: 'text-purple-400', value: '2.3 GB/s' },
    { id: 'disk', label: 'Disk Usage', icon: Activity, color: 'text-yellow-400', value: '78%' },
  ];

  const alerts = [
    { severity: 'high', message: 'High CPU usage on instance i-1234567890abc', time: '2 min ago' },
    { severity: 'medium', message: 'Memory usage approaching threshold on db-server-01', time: '15 min ago' },
    { severity: 'low', message: 'Disk space warning on storage bucket', time: '1 hour ago' },
  ];

  const getAlertColor = (severity: string) => {
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
        <h2 className="text-3xl font-bold text-white">Monitoring Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer transition-all hover:border-gray-600 ${
                selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${metric.color}`} />
                <span className="text-2xl font-bold text-white">{metric.value}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{metric.label}</h3>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    metric.id === 'cpu' ? 'from-blue-500 to-blue-400' :
                    metric.id === 'memory' ? 'from-green-500 to-green-400' :
                    metric.id === 'network' ? 'from-purple-500 to-purple-400' :
                    'from-yellow-500 to-yellow-400'
                  }`}
                  style={{ width: metric.value }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {metrics.find(m => m.id === selectedMetric)?.label} Over Time
          </h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {Array.from({ length: 24 }, (_, i) => {
              const height = Math.random() * 80 + 10;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-4 rounded-t ${
                      selectedMetric === 'cpu' ? 'bg-blue-500' :
                      selectedMetric === 'memory' ? 'bg-green-500' :
                      selectedMetric === 'network' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-1">
                    {String(i).padStart(2, '0')}:00
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Active Alerts</span>
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`border-l-4 p-3 rounded ${getAlertColor(alert.severity)}`}
              >
                <div className="text-sm text-white font-medium">{alert.message}</div>
                <div className="text-xs text-gray-400 mt-1">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Health Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Resource Health Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Compute Instances</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-white">24/27</div>
            <div className="text-sm text-gray-400">Healthy</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Databases</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-white">2/2</div>
            <div className="text-sm text-gray-400">All Running</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Load Balancers</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-white">5/5</div>
            <div className="text-sm text-gray-400">Healthy</div>
          </div>
        </div>
      </div>
    </div>
  );
}