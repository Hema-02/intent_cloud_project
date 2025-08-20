import React from 'react';
import { Plus, Play, Square, RotateCcw } from 'lucide-react';

interface QuickActionsProps {
  activeProvider: string;
}

export function QuickActions({ activeProvider }: QuickActionsProps) {
  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'create':
        console.log(`Creating new instance on ${activeProvider}`);
        // In a real app, this would open a create modal or navigate to create page
        alert(`Creating new instance on ${activeProvider.toUpperCase()}`);
        break;
      case 'start':
        console.log(`Starting all instances on ${activeProvider}`);
        alert(`Starting all instances on ${activeProvider.toUpperCase()}`);
        break;
      case 'stop':
        console.log(`Stopping all instances on ${activeProvider}`);
        alert(`Stopping all instances on ${activeProvider.toUpperCase()}`);
        break;
      case 'refresh':
        console.log(`Refreshing data for ${activeProvider}`);
        window.location.reload();
        break;
      default:
        console.log(`Unknown action: ${actionType}`);
    }
  };

  const actions = [
    { icon: Plus, label: 'Create Instance', color: 'bg-green-600 hover:bg-green-700', action: 'create' },
    { icon: Play, label: 'Start All', color: 'bg-blue-600 hover:bg-blue-700', action: 'start' },
    { icon: Square, label: 'Stop All', color: 'bg-red-600 hover:bg-red-700', action: 'stop' },
    { icon: RotateCcw, label: 'Refresh', color: 'bg-purple-600 hover:bg-purple-700', action: 'refresh' },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`w-full ${action.color} text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-3`}
              onClick={() => handleAction(action.action)}
            >
              <Icon className="w-5 h-5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}