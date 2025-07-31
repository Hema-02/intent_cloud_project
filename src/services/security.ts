import { supabase } from '../lib/supabase';

export interface SecurityAlert {
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
}

class SecurityService {
  async getSecurityAlerts(status?: string): Promise<SecurityAlert[]> {
    let query = supabase.from('security_alerts').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'created_at' | 'user_id'>): Promise<SecurityAlert> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        ...alert,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('security_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async ignoreAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('security_alerts')
      .update({ status: 'ignored' })
      .eq('id', alertId);

    if (error) throw error;
  }

  async getSecurityMetrics(): Promise<any> {
    const alerts = await this.getSecurityAlerts('open');
    const totalResources = await this.getTotalResources();

    return {
      securityGroups: { count: 28, status: 'good' },
      iamPolicies: { count: 156, status: 'warning' },
      accessKeys: { count: 12, status: 'good' },
      activeUsers: { count: 45, status: 'good' },
      openAlerts: alerts.length,
      securityScore: this.calculateSecurityScore(alerts, totalResources),
    };
  }

  async getComplianceStatus(): Promise<any[]> {
    // This would typically integrate with compliance scanning tools
    return [
      { name: 'SOC 2', status: 'compliant', score: 98 },
      { name: 'ISO 27001', status: 'compliant', score: 95 },
      { name: 'GDPR', status: 'warning', score: 87 },
      { name: 'HIPAA', status: 'non-compliant', score: 72 },
    ];
  }

  async getAccessManagement(): Promise<any[]> {
    // This would integrate with IAM systems
    return [
      { name: 'John Doe', email: 'john@company.com', role: 'Admin', lastAccess: '2 hours ago', status: 'active' },
      { name: 'Jane Smith', email: 'jane@company.com', role: 'Developer', lastAccess: '1 day ago', status: 'active' },
      { name: 'Bob Wilson', email: 'bob@company.com', role: 'Viewer', lastAccess: '1 week ago', status: 'inactive' },
    ];
  }

  private async getTotalResources(): Promise<number> {
    const { count, error } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  private calculateSecurityScore(alerts: SecurityAlert[], totalResources: number): number {
    if (totalResources === 0) return 100;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;

    const score = 100 - (criticalAlerts * 20 + highAlerts * 10 + mediumAlerts * 5);
    return Math.max(0, Math.min(100, score));
  }
}

export const securityService = new SecurityService();