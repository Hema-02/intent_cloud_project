import React from 'react';
import { useState, useEffect } from 'react';
import { ResourceCards } from './ResourceCards';
import { ResourceChart } from './ResourceChart';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { cloudProviderService } from '../services/cloudProviders';

interface DashboardProps {
  activeProvider: string;
}

export function Dashboard({ activeProvider }: DashboardProps) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeProvider]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const resourceData = await cloudProviderService.getResources();
      setResources(resourceData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <ResourceCards activeProvider={activeProvider} resources={resources} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceChart activeProvider={activeProvider} resources={resources} />
        </div>
        <div>
          <QuickActions activeProvider={activeProvider} />
        </div>
      </div>

      <ActivityFeed activeProvider={activeProvider} resources={resources} />
    </div>
  );
}