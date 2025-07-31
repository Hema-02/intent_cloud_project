import { supabase } from '../lib/supabase';
import axios from 'axios';

export interface CloudProvider {
  id: string;
  name: string;
  type: 'aws' | 'gcp' | 'azure';
  credentials: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Resource {
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
}

class CloudProviderService {
  async getProviders(): Promise<CloudProvider[]> {
    const { data, error } = await supabase
      .from('cloud_providers')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async addProvider(provider: Omit<CloudProvider, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CloudProvider> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cloud_providers')
      .insert({
        ...provider,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResources(providerId?: string): Promise<Resource[]> {
    let query = supabase.from('resources').select('*');
    
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Resource> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, create the resource in the cloud provider
    const createdResource = await this.createCloudResource(resource);

    // Then store it in our database
    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        resource_id: createdResource.id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteResource(resourceId: string): Promise<void> {
    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from cloud provider
    await this.deleteCloudResource(resource);

    // Delete from database
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;
  }

  private async createCloudResource(resource: any): Promise<any> {
    // This would integrate with actual cloud provider APIs
    // For demo purposes, we'll simulate the creation
    return {
      id: `${resource.type}-${Date.now()}`,
      status: 'creating',
    };
  }

  private async deleteCloudResource(resource: any): Promise<void> {
    // This would integrate with actual cloud provider APIs
    // For demo purposes, we'll simulate the deletion
    console.log(`Deleting resource ${resource.resource_id} from ${resource.provider_id}`);
  }

  async executeNaturalLanguageCommand(command: string, providerId: string): Promise<string> {
    try {
      // This would integrate with an NLP service like OpenAI or custom ML model
      const response = await axios.post('/api/nlp/process', {
        command,
        providerId,
      });

      return response.data.result;
    } catch (error) {
      // Fallback to simple command parsing
      return this.parseSimpleCommand(command, providerId);
    }
  }

  private parseSimpleCommand(command: string, providerId: string): string {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('create') && lowerCommand.includes('instance')) {
      return `I'll help you create a new compute instance on ${providerId.toUpperCase()}. Please specify the instance type and region.`;
    } else if (lowerCommand.includes('list') && lowerCommand.includes('instance')) {
      return `Here are your current instances on ${providerId.toUpperCase()}. You have 3 running instances and 1 stopped instance.`;
    } else if (lowerCommand.includes('delete') || lowerCommand.includes('terminate')) {
      return `I can help you delete resources. Please specify which resource you'd like to remove.`;
    } else if (lowerCommand.includes('cost') || lowerCommand.includes('billing')) {
      return `Your current monthly cost for ${providerId.toUpperCase()} is $2,847.32. Would you like to see a detailed breakdown?`;
    } else {
      return `I understand you want to: "${command}". Let me process this request for your ${providerId.toUpperCase()} environment.`;
    }
  }
}

export const cloudProviderService = new CloudProviderService();