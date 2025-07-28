import React from 'react';

interface ResourceChartProps {
  activeProvider: string;
}

export function ResourceChart({ activeProvider }: ResourceChartProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Resource Usage Trends</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {Array.from({ length: 12 }, (_, i) => {
          const height = Math.random() * 60 + 20;
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(2024, i).toLocaleDateString('en', { month: 'short' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}