import React from 'react';
import { ResourceCards } from './ResourceCards';
import { ResourceChart } from './ResourceChart';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';

interface DashboardProps {
  activeProvider: string;
}

export function Dashboard({ activeProvider }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Provider: {activeProvider.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <ResourceCards activeProvider={activeProvider} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceChart activeProvider={activeProvider} />
        </div>
        <div>
          <QuickActions activeProvider={activeProvider} />
        </div>
      </div>

      <ActivityFeed activeProvider={activeProvider} />
    </div>
  );
}