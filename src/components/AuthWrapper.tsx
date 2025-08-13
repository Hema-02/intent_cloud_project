import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../lib/api';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: (user: User | null, signOut: () => void) => React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check for stored auth token first
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    // Get initial session
    const getSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setShowAuth(false); // Reset auth modal state
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      let response;
      
      if (authMode === 'signin') {
        response = await authAPI.login(credentials.email, credentials.password);
      } else {
        response = await authAPI.register(credentials.email, credentials.password, credentials.name);
      }

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setShowAuth(false);
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      alert(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoLogin = async (role: string = 'user') => {
    setIsAuthenticating(true);
    
    try {
      const response = await authAPI.demoLogin(role);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setShowAuth(false);
      
    } catch (error: any) {
      console.error('Demo login error:', error);
      // Fallback to local demo user
      const demoUser = {
        id: 'demo-user',
        email: 'demo@cloudflow.com',
        name: 'Demo User',
        role: role
      };
      setUser(demoUser);
      setShowAuth(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getUserRole = (user: User | null): string => {
    if (!user) return 'guest';
    
    // Check user metadata for role
    const role = user.user_metadata?.role || user.app_metadata?.role;
    
    // Default roles based on email domain (example logic)
    if (user.email?.endsWith('@admin.com')) return 'admin';
    if (user.email?.endsWith('@company.com')) return 'user';
    
    return role || 'user';
  };

  const getDemoUserRole = (): string => {
    // Demo users get 'user' role by default to access most features
    return 'user';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth UI if user wants to sign in
  if (showAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">CloudFlow</h1>
            <p className="text-gray-400">
              {authMode === 'signin' ? 'Sign in to access your cloud resources' : 'Create your CloudFlow account'}
            </p>
          </div>
          
          {/* Custom Auth Form - Always show regardless of Supabase availability */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={credentials.name}
                  onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={authMode === 'signup'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isAuthenticating ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-gray-500 text-sm mb-2">or</div>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('user')}
                disabled={isAuthenticating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Demo User Access
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isAuthenticating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Demo Admin Access
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAuth(false)}
              disabled={isAuthenticating}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Continue as Demo User
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add role to user object
  const userWithRole = user ? { ...user, role: getUserRole(user) } : null;

  return (
    <>
      {children(userWithRole, signOut)}
      
      {/* Sign In Button for Demo Mode */}
      {!user && !showAuth && (
        <button
          onClick={() => setShowAuth(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Sign In
        </button>
      )}
    </>
  );
}