import React from 'react';
import { Clock } from 'lucide-react';

interface ActivityFeedProps {
  activeProvider: string;
}

export function ActivityFeed({ activeProvider }: ActivityFeedProps) {
  const activities = [
    { type: 'create', message: 'Created new EC2 instance i-1234567890abc', time: '2 minutes ago' },
    { type: 'update', message: 'Updated security group sg-abcdef123456', time: '15 minutes ago' },
    { type: 'delete', message: 'Deleted S3 bucket old-backup-bucket', time: '1 hour ago' },
    { type: 'scale', message: 'Auto-scaled instance group to 5 instances', time: '2 hours ago' },
    { type: 'alert', message: 'High CPU usage detected on i-0987654321def', time: '3 hours ago' },
  ];

  const getActivityColor = (type: string) => {
    const colors = {
      create: 'bg-green-500',
      update: 'bg-blue-500',
      delete: 'bg-red-500',
      scale: 'bg-purple-500',
      alert: 'bg-yellow-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <Clock className="w-5 h-5" />
        <span>Recent Activity</span>
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2`}></div>
            <div className="flex-1">
              <div className="text-gray-300">{activity.message}</div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}