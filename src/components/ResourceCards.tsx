import React from 'react';
import { Server, Database, Globe, Shield } from 'lucide-react';

interface ResourceCardsProps {
  activeProvider: string;
}

export function ResourceCards({ activeProvider }: ResourceCardsProps) {
  const getProviderData = (provider: string) => {
    const data = {
      aws: {
        instances: { count: 24, change: '+12%', service: 'EC2 Instances' },
        databases: { count: 8, change: '+4%', service: 'RDS Databases' },
        storage: { count: '2.4TB', change: '+18%', service: 'S3 Storage' },
        security: { count: 15, change: '0%', service: 'IAM Policies' },
      },
      gcp: {
        instances: { count: 18, change: '+8%', service: 'Compute Engine' },
        databases: { count: 6, change: '+2%', service: 'Cloud SQL' },
        storage: { count: '1.8TB', change: '+15%', service: 'Cloud Storage' },
        security: { count: 12, change: '+1%', service: 'IAM Policies' },
      },
      azure: {
        instances: { count: 21, change: '+10%', service: 'Virtual Machines' },
        databases: { count: 7, change: '+3%', service: 'Azure SQL' },
        storage: { count: '2.1TB', change: '+20%', service: 'Blob Storage' },
        security: { count: 18, change: '+2%', service: 'Azure AD' },
      },
    };
    return data[provider as keyof typeof data];
  };

  const providerData = getProviderData(activeProvider);
  
  const cards = [
    {
      title: 'Compute Instances',
      value: providerData.instances.count,
      change: providerData.instances.change,
      service: providerData.instances.service,
      icon: Server,
      color: 'bg-blue-500',
    },
    {
      title: 'Databases',
      value: providerData.databases.count,
      change: providerData.databases.change,
      service: providerData.databases.service,
      icon: Database,
      color: 'bg-green-500',
    },
    {
      title: 'Storage',
      value: providerData.storage.count,
      change: providerData.storage.change,
      service: providerData.storage.service,
      icon: Globe,
      color: 'bg-purple-500',
    },
    {
      title: 'Security',
      value: providerData.security.count,
      change: providerData.security.change,
      service: providerData.security.service,
      icon: Shield,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-green-400 font-medium">{card.change}</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-sm text-gray-400">{card.title}</div>
              <div className="text-xs text-gray-500">{card.service}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}