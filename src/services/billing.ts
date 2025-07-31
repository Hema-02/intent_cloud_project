import { supabase } from '../lib/supabase';

export interface BillingRecord {
  id: string;
  provider_id: string;
  service_name: string;
  cost: number;
  currency: string;
  billing_period: string;
  created_at: string;
  user_id: string;
}

class BillingService {
  async getBillingData(providerId: string, period?: string): Promise<any> {
    let query = supabase
      .from('billing_records')
      .select('*')
      .eq('provider_id', providerId);

    if (period) {
      query = query.eq('billing_period', period);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Process and aggregate the data
    const totalCost = data?.reduce((sum, record) => sum + record.cost, 0) || 0;
    const serviceBreakdown = this.aggregateByService(data || []);

    return {
      totalCost,
      serviceBreakdown,
      records: data || [],
    };
  }

  async getCostTrend(providerId: string, months: number = 12): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const { data, error } = await supabase
      .from('billing_records')
      .select('*')
      .eq('provider_id', providerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month and calculate totals
    const monthlyData = this.groupByMonth(data || []);
    return monthlyData;
  }

  async recordBilling(record: Omit<BillingRecord, 'id' | 'created_at' | 'user_id'>): Promise<BillingRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('billing_records')
      .insert({
        ...record,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBudgetAlerts(): Promise<any[]> {
    // This would typically come from cloud provider APIs or custom budget rules
    return [
      {
        type: 'warning',
        message: '85% of monthly budget used',
        current: 2550,
        limit: 3000,
        severity: 'medium',
      },
      {
        type: 'success',
        message: 'Storage costs within budget',
        current: 567,
        limit: 800,
        severity: 'low',
      },
      {
        type: 'info',
        message: 'Potential savings identified',
        savings: 234,
        severity: 'low',
      },
    ];
  }

  private aggregateByService(records: BillingRecord[]): any[] {
    const serviceMap = new Map();

    records.forEach(record => {
      if (serviceMap.has(record.service_name)) {
        serviceMap.set(record.service_name, serviceMap.get(record.service_name) + record.cost);
      } else {
        serviceMap.set(record.service_name, record.cost);
      }
    });

    const total = Array.from(serviceMap.values()).reduce((sum, cost) => sum + cost, 0);

    return Array.from(serviceMap.entries()).map(([name, cost]) => ({
      name,
      cost: `$${cost.toFixed(2)}`,
      percentage: Math.round((cost / total) * 100),
    }));
  }

  private groupByMonth(records: BillingRecord[]): any[] {
    const monthMap = new Map();

    records.forEach(record => {
      const date = new Date(record.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, monthMap.get(monthKey) + record.cost);
      } else {
        monthMap.set(monthKey, record.cost);
      }
    });

    return Array.from(monthMap.entries()).map(([month, cost]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      cost,
    }));
  }
}

export const billingService = new BillingService();