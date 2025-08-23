/**
 * Type definitions for GCP MCP Server
 */

export interface GCPProject {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
  parent?: {
    type: string;
    id: string;
  };
}

export interface GCPCredentials {
  projectId?: string;
  keyFilename?: string;
  // Add other auth-related properties as needed
}

export interface ServerState {
  selectedProject: string | null;
  selectedProjectCredentials: any;
  selectedRegion: string;
}

export interface ToolExecutionContext {
  projectId?: string;
  region?: string;
  credentials?: GCPCredentials;
}

export interface BillingInfo {
  name: string;
  projectId: string;
  billingAccountName: string;
  billingEnabled: boolean;
}

export interface CostForecast {
  amount: number;
  currency: string;
  period: string;
}

export interface GCPResource {
  id: string;
  name: string;
  type: string;
  region?: string;
  zone?: string;
  status?: string;
  creationTimestamp?: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}
