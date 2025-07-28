import React from 'react';
import { Plus, Play, Square, RotateCcw } from 'lucide-react';

interface QuickActionsProps {
  activeProvider: string;
}

export function QuickActions({ activeProvider }: QuickActionsProps) {
  const actions = [
    { icon: Plus, label: 'Create Instance', color: 'bg-green-600 hover:bg-green-700' },
    { icon: Play, label: 'Start All', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Square, label: 'Stop All', color: 'bg-red-600 hover:bg-red-700' },
    { icon: RotateCcw, label: 'Refresh', color: 'bg-purple-600 hover:bg-purple-700' },
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