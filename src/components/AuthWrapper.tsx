import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

  useEffect(() => {
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
    setUser(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth UI if user wants to sign in
  if (showAuth && !user && supabase) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">CloudFlow</h1>
            <p className="text-gray-400">Sign in to access your cloud resources</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  },
                },
              },
            }}
            providers={['google', 'github']}
            redirectTo={window.location.origin}
          />
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAuth(false)}
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