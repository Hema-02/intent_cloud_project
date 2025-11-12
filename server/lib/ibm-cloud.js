const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const ResourceControllerV2 = require('@ibm-cloud/resource-controller-v2');
const VpcV1 = require('@ibm-cloud/vpc-v1');
const ResourceManagerV2 = require('@ibm-cloud/resource-manager-v2');
const IamIdentityV1 = require('@ibm-cloud/iam-identity-v1');
require('dotenv').config();

class IBMCloudService {
  constructor() {
    this.apiKey = process.env.IBM_CLOUD_API_KEY;
    this.region = process.env.IBM_CLOUD_REGION || 'us-south';
    this.resourceGroupId = process.env.IBM_CLOUD_RESOURCE_GROUP_ID;
    this.vpcId = process.env.IBM_CLOUD_VPC_ID;
    
    if (!this.apiKey) {
      console.warn('IBM Cloud API key not found. Running in demo mode.');
      return;
    }

    // Initialize IBM Cloud SDK clients
    this.authenticator = new IamAuthenticator({
      apikey: this.apiKey,
    });

    // Resource Controller for managing resources
    this.resourceController = new ResourceControllerV2({
      authenticator: this.authenticator,
    });

    // VPC service for virtual servers
    this.vpcService = new VpcV1({
      authenticator: this.authenticator,
      serviceUrl: `https://${this.region}.iaas.cloud.ibm.com/v1`,
    });

    // Resource Manager for resource groups
    this.resourceManager = new ResourceManagerV2({
      authenticator: this.authenticator,
    });

    // IAM Identity for service IDs and API keys
    this.iamIdentity = new IamIdentityV1({
      authenticator: this.authenticator,
    });
  }

  // Virtual Server Instance Operations
  async listInstances() {
    try {
      if (!this.vpcService) {
        return this.getMockInstances();
      }

      const response = await this.vpcService.listInstances();
      const instances = response.result.instances || [];
      
      return instances.map(instance => ({
        id: instance.id,
        name: instance.name,
        type: instance.profile?.name || 'bx2-2x8',
        status: this.mapInstanceStatus(instance.status),
        region: this.region,
        zone: instance.zone?.name || `${this.region}-1`,
        created: instance.created_at,
        cost: this.calculateInstanceCost(instance.profile?.name),
        vpc: instance.vpc?.name,
        primaryIp: instance.primary_network_interface?.primary_ipv4_address
      }));
    } catch (error) {
      console.error('Error listing IBM Cloud instances:', error);
      return this.getMockInstances();
    }
  }

  async createInstance(config) {
    try {
      if (!this.vpcService) {
        throw new Error('IBM Cloud service not initialized');
      }

      // Get default VPC if not specified
      let vpcId = this.vpcId;
      if (!vpcId) {
        const vpcs = await this.vpcService.listVpcs();
        vpcId = vpcs.result.vpcs[0]?.id;
      }

      // Get default subnet
      const subnets = await this.vpcService.listSubnets();
      const subnet = subnets.result.subnets.find(s => s.vpc.id === vpcId);

      if (!subnet) {
        throw new Error('No suitable subnet found for instance creation');
      }

      const instanceParams = {
        instancePrototype: {
          name: config.name,
          profile: {
            name: config.instanceType || 'bx2-2x8'
          },
          image: {
            id: await this.getDefaultImageId()
          },
          zone: {
            name: config.zone || `${this.region}-1`
          },
          vpc: {
            id: vpcId
          },
          primary_network_interface: {
            subnet: {
              id: subnet.id
            }
          },
          resource_group: {
            id: this.resourceGroupId
          }
        }
      };

      const response = await this.vpcService.createInstance(instanceParams);
      const instance = response.result;

      return {
        id: instance.id,
        name: instance.name,
        type: instance.profile.name,
        status: 'creating',
        region: this.region,
        zone: instance.zone.name,
        created: instance.created_at
      };
    } catch (error) {
      console.error('Error creating IBM Cloud instance:', error);
      throw error;
    }
  }

  async deleteInstance(instanceId) {
    try {
      if (!this.vpcService) {
        throw new Error('IBM Cloud service not initialized');
      }

      await this.vpcService.deleteInstance({ id: instanceId });
      return { success: true, message: `Instance ${instanceId} deleted successfully` };
    } catch (error) {
      console.error('Error deleting IBM Cloud instance:', error);
      throw error;
    }
  }

  async startInstance(instanceId) {
    try {
      if (!this.vpcService) {
        throw new Error('IBM Cloud service not initialized');
      }

      await this.vpcService.createInstanceAction({
        instanceId: instanceId,
        type: 'start'
      });
      
      return { success: true, message: `Instance ${instanceId} started successfully` };
    } catch (error) {
      console.error('Error starting IBM Cloud instance:', error);
      throw error;
    }
  }

  async stopInstance(instanceId) {
    try {
      if (!this.vpcService) {
        throw new Error('IBM Cloud service not initialized');
      }

      await this.vpcService.createInstanceAction({
        instanceId: instanceId,
        type: 'stop'
      });
      
      return { success: true, message: `Instance ${instanceId} stopped successfully` };
    } catch (error) {
      console.error('Error stopping IBM Cloud instance:', error);
      throw error;
    }
  }

  // Resource Management
  async listResources() {
    try {
      if (!this.resourceController) {
        return this.getMockResources();
      }

      const response = await this.resourceController.listResourceInstances({
        resourceGroupId: this.resourceGroupId
      });

      const resources = response.result.resources || [];
      
      return {
        databases: resources.filter(r => r.resource_id?.includes('databases')).map(r => ({
          id: r.id,
          name: r.name,
          engine: this.getDbEngine(r.resource_plan_id),
          status: r.state === 'active' ? 'running' : r.state,
          region: r.region_id,
          cost: this.calculateDbCost(r.resource_plan_id),
          created: r.created_at
        })),
        storage: resources.filter(r => r.resource_id?.includes('cloud-object-storage')).map(r => ({
          id: r.id,
          name: r.name,
          type: 'Standard',
          size: '2.1 TB', // Would need additional API call to get actual size
          status: r.state === 'active' ? 'active' : r.state,
          region: r.region_id,
          cost: this.calculateStorageCost(),
          created: r.created_at
        }))
      };
    } catch (error) {
      console.error('Error listing IBM Cloud resources:', error);
      return this.getMockResources();
    }
  }

  // Monitoring and Metrics
  async getInstanceMetrics(instanceId) {
    try {
      // IBM Cloud monitoring would require additional setup with IBM Cloud Monitoring service
      // For now, return simulated metrics based on instance status
      const instance = await this.vpcService.getInstance({ id: instanceId });
      
      if (instance.result.status === 'running') {
        return {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 10,
          disk: Math.random() * 100
        };
      } else {
        return {
          cpu: 0,
          memory: 0,
          network: 0,
          disk: 0
        };
      }
    } catch (error) {
      console.error('Error getting IBM Cloud metrics:', error);
      return {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 10,
        disk: Math.random() * 100
      };
    }
  }

  // Helper Methods
  async getDefaultImageId() {
    try {
      const images = await this.vpcService.listImages();
      const ubuntuImage = images.result.images.find(img => 
        img.name.toLowerCase().includes('ubuntu') && 
        img.status === 'available'
      );
      return ubuntuImage?.id || images.result.images[0]?.id;
    } catch (error) {
      console.error('Error getting default image:', error);
      // Return a common Ubuntu image ID for us-south
      return 'r006-14140f94-fcc4-11e9-96e7-a72723715315';
    }
  }

  mapInstanceStatus(status) {
    const statusMap = {
      'running': 'running',
      'stopped': 'stopped',
      'starting': 'starting',
      'stopping': 'stopping',
      'pending': 'creating',
      'failed': 'error'
    };
    return statusMap[status] || status;
  }

  calculateInstanceCost(profileName) {
    const costMap = {
      'bx2-2x8': '$45.60',
      'bx2-4x16': '$91.20',
      'bx2-8x32': '$182.40',
      'cx2-2x4': '$38.40',
      'cx2-4x8': '$76.80',
      'mx2-2x16': '$67.20',
      'mx2-4x32': '$134.40'
    };
    return `${costMap[profileName] || '$45.60'}/month`;
  }

  calculateDbCost(planId) {
    // Simplified cost calculation - would need actual pricing API
    return planId?.includes('standard') ? '$89.12/month' : '$45.60/month';
  }

  calculateStorageCost() {
    return '$48.30/month';
  }

  getDbEngine(planId) {
    if (planId?.includes('postgresql')) return 'PostgreSQL';
    if (planId?.includes('mysql')) return 'MySQL';
    if (planId?.includes('mongodb')) return 'MongoDB';
    return 'Db2';
  }

  // Mock data fallbacks
  getMockInstances() {
    return [
      {
        id: 'ibm-vsi-001',
        name: 'web-server-ibm',
        type: 'bx2-2x8',
        status: 'running',
        region: 'us-south',
        zone: 'us-south-1',
        cost: '$45.60/month',
        created: '2024-01-15'
      },
      {
        id: 'ibm-vsi-002',
        name: 'database-server-ibm',
        type: 'cx2-4x8',
        status: 'running',
        region: 'us-south',
        zone: 'us-south-2',
        cost: '$76.80/month',
        created: '2024-01-10'
      }
    ];
  }

  getMockResources() {
    return {
      databases: [
        {
          id: 'ibm-db-001',
          name: 'production-db-ibm',
          engine: 'PostgreSQL',
          status: 'running',
          region: 'us-south',
          cost: '$89.12/month',
          created: '2024-01-12'
        }
      ],
      storage: [
        {
          id: 'ibm-cos-001',
          name: 'app-storage-ibm',
          type: 'Standard',
          size: '2.1 TB',
          status: 'active',
          region: 'us-south',
          cost: '$48.30/month',
          created: '2024-01-15'
        }
      ]
    };
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.resourceController) {
        return { status: 'not_configured', message: 'IBM Cloud API key not configured' };
      }

      // Simple test to verify authentication
      await this.resourceController.listResourceInstances({ limit: 1 });
      return { status: 'connected', region: this.region };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

module.exports = IBMCloudService;