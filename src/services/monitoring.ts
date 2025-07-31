import { supabase } from '../lib/supabase';

export interface MonitoringMetric {
  id: string;
  resource_id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  created_at: string;
}

class MonitoringService {
  async getMetrics(resourceId?: string, metricType?: string, timeRange?: string): Promise<MonitoringMetric[]> {
    let query = supabase.from('monitoring_metrics').select('*');

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (timeRange) {
      const now = new Date();
      let startTime = new Date();

      switch (timeRange) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
      }

      query = query.gte('timestamp', startTime.toISOString());
    }

    query = query.order('timestamp', { ascending: false }).limit(100);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async recordMetric(metric: Omit<MonitoringMetric, 'id' | 'created_at'>): Promise<MonitoringMetric> {
    const { data, error } = await supabase
      .from('monitoring_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResourceHealth(): Promise<any> {
    // Simulate resource health data
    return {
      compute: { healthy: 24, total: 27 },
      databases: { healthy: 7, total: 8 },
      loadBalancers: { healthy: 5, total: 5 },
    };
  }

  async getAlerts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}

export const monitoringService = new MonitoringService();