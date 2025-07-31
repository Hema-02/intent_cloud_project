import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      cloud_providers: {
        Row: {
          id: string;
          name: string;
          type: 'aws' | 'gcp' | 'azure';
          credentials: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'aws' | 'gcp' | 'azure';
          credentials: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'aws' | 'gcp' | 'azure';
          credentials?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          name: string;
          type: string;
          provider_id: string;
          resource_id: string;
          status: string;
          region: string;
          configuration: any;
          cost: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          provider_id: string;
          resource_id: string;
          status: string;
          region: string;
          configuration: any;
          cost?: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          provider_id?: string;
          resource_id?: string;
          status?: string;
          region?: string;
          configuration?: any;
          cost?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      monitoring_metrics: {
        Row: {
          id: string;
          resource_id: string;
          metric_type: string;
          value: number;
          unit: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          metric_type: string;
          value: number;
          unit: string;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          metric_type?: string;
          value?: number;
          unit?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
      billing_records: {
        Row: {
          id: string;
          provider_id: string;
          service_name: string;
          cost: number;
          currency: string;
          billing_period: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          service_name: string;
          cost: number;
          currency: string;
          billing_period: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          service_name?: string;
          cost?: number;
          currency?: string;
          billing_period?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      security_alerts: {
        Row: {
          id: string;
          resource_id: string;
          alert_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          title: string;
          description: string;
          status: 'open' | 'resolved' | 'ignored';
          created_at: string;
          resolved_at: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          alert_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          title: string;
          description: string;
          status?: 'open' | 'resolved' | 'ignored';
          created_at?: string;
          resolved_at?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          alert_type?: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          title?: string;
          description?: string;
          status?: 'open' | 'resolved' | 'ignored';
          created_at?: string;
          resolved_at?: string | null;
          user_id?: string;
        };
      };
    };
  };
};