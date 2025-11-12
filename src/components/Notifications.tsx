import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

interface NotificationsProps {
  activeProvider: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
  provider: string;
  actionRequired?: boolean;
}

export function Notifications({ activeProvider }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate mock notifications based on provider
  useEffect(() => {
    const generateNotifications = () => {
      const baseNotifications: Omit<Notification, 'id' | 'timestamp' | 'provider'>[] = [
        {
          type: 'warning',
          title: 'High CPU Usage Alert',
          message: 'Virtual server instance "web-server-01" is experiencing high CPU usage (87%). Consider scaling up or optimizing workloads.',
          read: false,
          category: 'Performance',
          actionRequired: true
        },
        {
          type: 'success',
          title: 'Instance Created Successfully',
          message: 'New virtual server instance "api-server-02" has been created and is now running in us-south-1.',
          read: false,
          category: 'Resources'
        },
        {
          type: 'info',
          title: 'Scheduled Maintenance',
          message: `${activeProvider.toUpperCase()} will perform scheduled maintenance on database services from 2:00 AM to 4:00 AM UTC on Sunday.`,
          read: true,
          category: 'Maintenance'
        },
        {
          type: 'error',
          title: 'Database Connection Failed',
          message: 'Unable to connect to database instance "prod-db-01". Please check network connectivity and credentials.',
          read: false,
          category: 'Database',
          actionRequired: true
        },
        {
          type: 'success',
          title: 'Backup Completed',
          message: 'Automated backup for storage bucket "app-data-backup" completed successfully. 2.1 TB backed up.',
          read: true,
          category: 'Backup'
        },
        {
          type: 'warning',
          title: 'Budget Alert',
          message: 'You have used 85% of your monthly budget ($2,550 of $3,000). Consider reviewing your resource usage.',
          read: false,
          category: 'Billing',
          actionRequired: true
        },
        {
          type: 'info',
          title: 'Security Scan Complete',
          message: 'Weekly security scan completed. 2 medium-priority vulnerabilities found. View security dashboard for details.',
          read: false,
          category: 'Security'
        },
        {
          type: 'success',
          title: 'Auto-scaling Triggered',
          message: 'Auto-scaling group "web-tier" scaled up from 3 to 5 instances due to increased traffic.',
          read: true,
          category: 'Auto-scaling'
        },
        {
          type: 'error',
          title: 'SSL Certificate Expiring',
          message: 'SSL certificate for "api.yourapp.com" will expire in 7 days. Please renew to avoid service disruption.',
          read: false,
          category: 'Security',
          actionRequired: true
        },
        {
          type: 'info',
          title: 'New Feature Available',
          message: `${activeProvider.toUpperCase()} has released new machine learning services in your region. Explore AI/ML capabilities.`,
          read: true,
          category: 'Features'
        }
      ];

      const notificationsWithIds = baseNotifications.map((notif, index) => ({
        ...notif,
        id: `notif-${index + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        provider: activeProvider
      }));

      setNotifications(notificationsWithIds);
    };

    generateNotifications();
  }, [activeProvider]);

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      info: 'border-blue-500 bg-blue-500/10',
      success: 'border-green-500 bg-green-500/10',
      warning: 'border-yellow-500 bg-yellow-500/10',
      error: 'border-red-500 bg-red-500/10'
    };
    return colors[type as keyof typeof colors];
  };

  const getIconColor = (type: string) => {
    const colors = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400'
    };
    return colors[type as keyof typeof colors];
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notif.read) || 
                         notif.type === filter;
    
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || notif.category === selectedCategory;
    
    return matchesFilter && matchesSearch && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const categories = ['all', ...Array.from(new Set(notifications.map(n => n.category)))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-white">Notifications</h2>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount} unread
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="unread">Unread Only</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications found</h3>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'All caught up! No new notifications at this time.'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`border-l-4 p-6 rounded-lg ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-opacity-20' : 'bg-opacity-10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Icon className={`w-6 h-6 ${getIconColor(notification.type)} mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {notification.actionRequired && (
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Action Required
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {notification.category}
                        </div>
                        <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {notification.provider.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Total</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{notifications.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300">Unread</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{unreadCount}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300">Errors</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {notifications.filter(n => n.type === 'error').length}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Action Required</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {notifications.filter(n => n.actionRequired).length}
          </div>
        </div>
      </div>
    </div>
  );
}