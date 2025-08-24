/**
 * Modular Tool Definitions and Handlers Export
 */

// Import all tool definitions
import { projectTools } from './project/definitions';
import { billingTools } from './billing/definitions';
import { iamTools } from './iam/definitions';
import { computeTools } from './compute/definitions';

// Import all handlers
import { ProjectHandlers } from './project/handlers';
import { BillingHandlers } from './billing/handlers';

// Import types
import { ToolResponse } from '../types';
import { ToolCallArgs, MCPTool } from '../types/mcp';

// Combine all tool definitions
export const gcpTools: MCPTool[] = [...projectTools, ...billingTools, ...iamTools, ...computeTools];

// Create handler instances
const projectHandlers = new ProjectHandlers();
const billingHandlers = new BillingHandlers();

// Export combined handlers class (compatible with existing server.ts)
export class GCPToolHandlers {
  // Project handlers
  executeGCPCode = projectHandlers.executeGCPCode.bind(projectHandlers);
  listProjects = projectHandlers.listProjects.bind(projectHandlers);
  selectProject = projectHandlers.selectProject.bind(projectHandlers);

  // Billing handlers
  getBillingInfo = billingHandlers.getBillingInfo.bind(billingHandlers);
  getCostForecast = billingHandlers.getCostForecast.bind(billingHandlers);
  getBillingAccount = billingHandlers.getBillingAccount.bind(billingHandlers);
  listBillingAccounts = billingHandlers.listBillingAccounts.bind(billingHandlers);
  setProjectBilling = billingHandlers.setProjectBilling.bind(billingHandlers);
  getCostBreakdown = billingHandlers.getCostBreakdown.bind(billingHandlers);
  createBudget = billingHandlers.createBudget.bind(billingHandlers);
  listBudgets = billingHandlers.listBudgets.bind(billingHandlers);
  updateBudget = billingHandlers.updateBudget.bind(billingHandlers);
  deleteBudget = billingHandlers.deleteBudget.bind(billingHandlers);
  getCostAnomalies = billingHandlers.getCostAnomalies.bind(billingHandlers);
  getRightsizingRecommendations =
    billingHandlers.getRightsizingRecommendations.bind(billingHandlers);
  exportBillingData = billingHandlers.exportBillingData.bind(billingHandlers);

  // TODO: Add other handlers as they are implemented
  // IAM handlers
  async listIamPolicies(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async getIamPolicy(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async setIamPolicy(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async addIamBinding(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async removeIamBinding(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async listServiceAccounts(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async createServiceAccount(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async deleteServiceAccount(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async listCustomRoles(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }
  async createCustomRole(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('IAM handlers not yet implemented');
  }

  // Compute handlers
  async listComputeInstances(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Compute handlers not yet implemented');
  }
  async getComputeInstance(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Compute handlers not yet implemented');
  }
  async startComputeInstance(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Compute handlers not yet implemented');
  }
  async stopComputeInstance(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Compute handlers not yet implemented');
  }

  // Placeholder for other handlers from the original file
  async listStorageBuckets(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Storage handlers not yet implemented');
  }
  async listStorageObjects(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Storage handlers not yet implemented');
  }
  async getStorageObjectInfo(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Storage handlers not yet implemented');
  }
  async listBigQueryDatasets(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('BigQuery handlers not yet implemented');
  }
  async listBigQueryTables(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('BigQuery handlers not yet implemented');
  }
  async queryBigQuery(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('BigQuery handlers not yet implemented');
  }
  async listSqlInstances(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('SQL handlers not yet implemented');
  }
  async getSqlInstance(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('SQL handlers not yet implemented');
  }
  async listCloudFunctions(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Functions handlers not yet implemented');
  }
  async getCloudFunction(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Functions handlers not yet implemented');
  }
  async listCloudRunServices(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Cloud Run handlers not yet implemented');
  }
  async getCloudRunService(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Cloud Run handlers not yet implemented');
  }
  async listGkeClusters(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('GKE handlers not yet implemented');
  }
  async getGkeCluster(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('GKE handlers not yet implemented');
  }
  async queryLogs(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Logging handlers not yet implemented');
  }
  async listLogEntries(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Logging handlers not yet implemented');
  }
  async listOrganizationPolicies(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Policy handlers not yet implemented');
  }
  async getOrganizationPolicy(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Policy handlers not yet implemented');
  }
  async setOrganizationPolicy(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Policy handlers not yet implemented');
  }
  async deleteOrganizationPolicy(_args: ToolCallArgs): Promise<ToolResponse> {
    throw new Error('Policy handlers not yet implemented');
  }
}
