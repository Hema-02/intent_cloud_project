import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  userRole?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  requiredRole = 'user', 
  userRole = 'guest',
  fallback 
}: RoleGuardProps) {
  const roleHierarchy = {
    guest: 0,
    user: 1,
    admin: 2,
    superadmin: 3
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 1;

  const hasAccess = userLevel >= requiredLevel;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
        <p className="text-gray-400 mb-4">
          You need {requiredRole} privileges to access this feature.
        </p>
        <p className="text-sm text-gray-500">
          Current role: {userRole}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}