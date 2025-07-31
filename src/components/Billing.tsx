import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, CreditCard } from 'lucide-react';

interface BillingProps {
  activeProvider: string;
}

export function Billing({ activeProvider }: BillingProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const getBillingData = (provider: string) => {
    const data = {
      aws: {
        currentCost: '$2,847.32',
        lastMonth: '$2,654.18',
        trend: '+7.3%',
        services: [
          { name: 'EC2 Instances', cost: '$1,245.67', percentage: 44 },
          { name: 'S3 Storage', cost: '$567.89', percentage: 20 },
          { name: 'RDS Databases', cost: '$423.12', percentage: 15 },
          { name: 'CloudFront', cost: '$234.56', percentage: 8 },
          { name: 'Other Services', cost: '$376.08', percentage: 13 },
        ]
      },
      gcp: {
        currentCost: '$1,923.45',
        lastMonth: '$2,156.78',
        trend: '-10.8%',
        services: [
          { name: 'Compute Engine', cost: '$856.34', percentage: 45 },
          { name: 'Cloud Storage', cost: '$423.67', percentage: 22 },
          { name: 'Cloud SQL', cost: '$345.23', percentage: 18 },
          { name: 'Cloud CDN', cost: '$156.78', percentage: 8 },
          { name: 'Other Services', cost: '$141.43', percentage: 7 },
        ]
      },
      azure: {
        currentCost: '$3,156.78',
        lastMonth: '$2,987.45',
        trend: '+5.7%',
        services: [
          { name: 'Virtual Machines', cost: '$1,423.45', percentage: 45 },
          { name: 'Blob Storage', cost: '$634.56', percentage: 20 },
          { name: 'Azure SQL', cost: '$567.89', percentage: 18 },
          { name: 'Azure CDN', cost: '$234.67', percentage: 7 },
          { name: 'Other Services', cost: '$296.21', percentage: 10 },
        ]
      }
    };
    return data[provider as keyof typeof data];
  };

  const billingData = getBillingData(activeProvider);
  const isPositiveTrend = billingData.trend.startsWith('+');

  const costHistory = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
    cost: Math.random() * 1000 + 1500,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Billing & Cost Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div className={`flex items-center space-x-1 ${isPositiveTrend ? 'text-red-400' : 'text-green-400'}`}>
              {isPositiveTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{billingData.trend}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{billingData.currentCost}</div>
          <div className="text-sm text-gray-400">Current Month</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{billingData.lastMonth}</div>
          <div className="text-sm text-gray-400">Last Month</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            ${((parseFloat(billingData.currentCost.replace('$', '').replace(',', '')) * 12) / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-400">Projected Annual</div>
        </div>
      </div>

      {/* Cost Breakdown and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Cost by Service</h3>
          <div className="space-y-4">
            {billingData.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">{service.name}</span>
                    <span className="text-white font-medium">{service.cost}</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Trend Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Cost Trend (12 Months)</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {costHistory.map((data, index) => {
              const height = (data.cost / 3000) * 100;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2 transform -rotate-45">
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Budget Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-400 font-medium">Budget Warning</span>
            </div>
            <div className="text-white">85% of monthly budget used</div>
            <div className="text-sm text-gray-400">$2,550 / $3,000</div>
          </div>

          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">On Track</span>
            </div>
            <div className="text-white">Storage costs within budget</div>
            <div className="text-sm text-gray-400">$567 / $800</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 font-medium">Optimization</span>
            </div>
            <div className="text-white">Potential savings identified</div>
            <div className="text-sm text-gray-400">Save up to $234/month</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 text-gray-300 font-medium">Date</th>
                <th className="text-left py-3 px-6 text-gray-300 font-medium">Service</th>
                <th className="text-left py-3 px-6 text-gray-300 font-medium">Description</th>
                <th className="text-left py-3 px-6 text-gray-300 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-01-15', service: 'EC2', description: 'Instance usage - i-1234567890abc', amount: '$45.67' },
                { date: '2024-01-14', service: 'S3', description: 'Storage and requests', amount: '$23.45' },
                { date: '2024-01-13', service: 'RDS', description: 'Database instance - db-prod-01', amount: '$78.90' },
                { date: '2024-01-12', service: 'CloudFront', description: 'Data transfer', amount: '$12.34' },
              ].map((transaction, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="py-4 px-6 text-gray-300">{transaction.date}</td>
                  <td className="py-4 px-6 text-gray-300">{transaction.service}</td>
                  <td className="py-4 px-6 text-gray-300">{transaction.description}</td>
                  <td className="py-4 px-6 text-white font-medium">{transaction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}