/**
 * Tool definitions for GCP MCP Server
 */

import { MCPTool } from '../types';
import { CONFIG } from '../config';

export const gcpTools: MCPTool[] = [
  {
    name: 'run-gcp-code',
    description: 'Run GCP code to interact with Google Cloud resources',
    inputSchema: {
      type: 'object',
      properties: {
        reasoning: {
          type: 'string',
          description: 'The reasoning behind the code execution',
        },
        code: {
          type: 'string',
          description: CONFIG.PROMPTS.CODE_EXECUTION,
        },
        projectId: {
          type: 'string',
          description: 'GCP project ID to use for the operation',
        },
        region: {
          type: 'string',
          description: 'Region to use (defaults to us-central1 if not provided)',
        },
      },
      required: ['reasoning', 'code'],
    },
  },
  {
    name: 'list-projects',
    description: 'List all GCP projects accessible with current credentials',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'select-project',
    description: 'Select a GCP project to use for subsequent interactions',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID of the GCP project to select',
        },
        region: {
          type: 'string',
          description: 'Region to use (defaults to us-central1 if not provided)',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'get-billing-info',
    description: 'Get billing information for the specified or currently selected project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to get billing info for (defaults to selected project)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-cost-forecast',
    description: 'Get cost forecast for the specified or currently selected project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to get forecast for (defaults to selected project)',
        },
        months: {
          type: 'number',
          description: 'Number of months to forecast (defaults to 3)',
        },
      },
      required: [],
    },
  },

  // Compute Engine Tools
  {
    name: 'list-compute-instances',
    description: 'List all Compute Engine instances in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        zone: {
          type: 'string',
          description:
            'Zone to list instances from (optional, lists from all zones if not provided)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-compute-instance',
    description: 'Get detailed information about a specific Compute Engine instance',
    inputSchema: {
      type: 'object',
      properties: {
        instanceName: {
          type: 'string',
          description: 'Name of the instance to get details for',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['instanceName', 'zone'],
    },
  },
  {
    name: 'start-compute-instance',
    description: 'Start a stopped Compute Engine instance',
    inputSchema: {
      type: 'object',
      properties: {
        instanceName: {
          type: 'string',
          description: 'Name of the instance to start',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['instanceName', 'zone'],
    },
  },
  {
    name: 'stop-compute-instance',
    description: 'Stop a running Compute Engine instance',
    inputSchema: {
      type: 'object',
      properties: {
        instanceName: {
          type: 'string',
          description: 'Name of the instance to stop',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['instanceName', 'zone'],
    },
  },

  // Cloud Storage Tools
  {
    name: 'list-storage-buckets',
    description: 'List all Cloud Storage buckets in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: [],
    },
  },
  {
    name: 'list-storage-objects',
    description: 'List objects in a Cloud Storage bucket',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: {
          type: 'string',
          description: 'Name of the bucket to list objects from',
        },
        prefix: {
          type: 'string',
          description: 'Optional prefix to filter objects',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of objects to return (default: 100)',
        },
      },
      required: ['bucketName'],
    },
  },
  {
    name: 'get-storage-object-info',
    description: 'Get metadata information about a specific Cloud Storage object',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: {
          type: 'string',
          description: 'Name of the bucket containing the object',
        },
        objectName: {
          type: 'string',
          description: 'Name of the object to get info for',
        },
      },
      required: ['bucketName', 'objectName'],
    },
  },

  // BigQuery Tools
  {
    name: 'list-bigquery-datasets',
    description: 'List all BigQuery datasets in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: [],
    },
  },
  {
    name: 'list-bigquery-tables',
    description: 'List tables in a BigQuery dataset',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: {
          type: 'string',
          description: 'ID of the dataset to list tables from',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['datasetId'],
    },
  },
  {
    name: 'query-bigquery',
    description: 'Execute a BigQuery SQL query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100)',
        },
      },
      required: ['query'],
    },
  },

  // Cloud SQL Tools
  {
    name: 'list-sql-instances',
    description: 'List all Cloud SQL instances in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-sql-instance',
    description: 'Get detailed information about a Cloud SQL instance',
    inputSchema: {
      type: 'object',
      properties: {
        instanceId: {
          type: 'string',
          description: 'ID of the Cloud SQL instance',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['instanceId'],
    },
  },

  // Cloud Functions Tools
  {
    name: 'list-cloud-functions',
    description: 'List all Cloud Functions in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        region: {
          type: 'string',
          description:
            'Region to list functions from (optional, lists from all regions if not provided)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-cloud-function',
    description: 'Get detailed information about a specific Cloud Function',
    inputSchema: {
      type: 'object',
      properties: {
        functionName: {
          type: 'string',
          description: 'Name of the function to get details for',
        },
        region: {
          type: 'string',
          description: 'Region where the function is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['functionName', 'region'],
    },
  },

  // Cloud Run Tools
  {
    name: 'list-cloud-run-services',
    description: 'List all Cloud Run services in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        region: {
          type: 'string',
          description:
            'Region to list services from (optional, lists from all regions if not provided)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-cloud-run-service',
    description: 'Get detailed information about a specific Cloud Run service',
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: {
          type: 'string',
          description: 'Name of the Cloud Run service',
        },
        region: {
          type: 'string',
          description: 'Region where the service is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['serviceName', 'region'],
    },
  },

  // GKE Tools
  {
    name: 'list-gke-clusters',
    description: 'List all GKE clusters in the project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        zone: {
          type: 'string',
          description:
            'Zone to list clusters from (optional, lists from all zones if not provided)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-gke-cluster',
    description: 'Get detailed information about a specific GKE cluster',
    inputSchema: {
      type: 'object',
      properties: {
        clusterName: {
          type: 'string',
          description: 'Name of the GKE cluster',
        },
        zone: {
          type: 'string',
          description: 'Zone where the cluster is located',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: ['clusterName', 'zone'],
    },
  },

  // Cloud Logging Tools
  {
    name: 'query-logs',
    description: 'Query Cloud Logging for log entries',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Log filter query (Cloud Logging filter syntax)',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of log entries to return (default: 100)',
        },
        orderBy: {
          type: 'string',
          description: 'Order by field (default: timestamp desc)',
        },
      },
      required: ['filter'],
    },
  },
  {
    name: 'list-log-entries',
    description: 'List recent log entries for a resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          description: 'GCP resource type (e.g., gce_instance, cloud_function, gae_app)',
        },
        resourceName: {
          type: 'string',
          description: 'Name of the resource (optional)',
        },
        severity: {
          type: 'string',
          description:
            'Minimum log severity (DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY)',
        },
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of log entries to return (default: 50)',
        },
      },
      required: ['resourceType'],
    },
  },

  // IAM Management Tools
  {
    name: 'list-iam-policies',
    description: 'List IAM policies for projects, folders, or organizations',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource to list IAM policies for',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID (project ID, folder ID, or organization ID)',
        },
      },
      required: ['resourceType'],
    },
  },
  {
    name: 'get-iam-policy',
    description: 'Get IAM policy for a specific resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization', 'serviceAccount'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description:
            'Resource ID (project ID, folder ID, organization ID, or service account email)',
        },
      },
      required: ['resourceType', 'resourceId'],
    },
  },
  {
    name: 'set-iam-policy',
    description: 'Set IAM policy for a specific resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization', 'serviceAccount'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        policy: {
          type: 'object',
          description: 'IAM policy object with bindings',
        },
      },
      required: ['resourceType', 'resourceId', 'policy'],
    },
  },
  {
    name: 'add-iam-binding',
    description: 'Add a member to an IAM role binding',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        role: {
          type: 'string',
          description: 'IAM role (e.g., roles/viewer, roles/editor)',
        },
        member: {
          type: 'string',
          description:
            'Member to add (e.g., user:email@domain.com, serviceAccount:account@project.iam.gserviceaccount.com)',
        },
      },
      required: ['resourceType', 'resourceId', 'role', 'member'],
    },
  },
  {
    name: 'remove-iam-binding',
    description: 'Remove a member from an IAM role binding',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        role: {
          type: 'string',
          description: 'IAM role',
        },
        member: {
          type: 'string',
          description: 'Member to remove',
        },
      },
      required: ['resourceType', 'resourceId', 'role', 'member'],
    },
  },
  {
    name: 'list-service-accounts',
    description: 'List service accounts in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
      },
      required: [],
    },
  },
  {
    name: 'create-service-account',
    description: 'Create a new service account',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        accountId: {
          type: 'string',
          description: 'Service account ID (unique within project)',
        },
        displayName: {
          type: 'string',
          description: 'Display name for the service account',
        },
        description: {
          type: 'string',
          description: 'Description of the service account',
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'delete-service-account',
    description: 'Delete a service account',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        email: {
          type: 'string',
          description: 'Service account email address',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'list-custom-roles',
    description: 'List custom IAM roles in a project or organization',
    inputSchema: {
      type: 'object',
      properties: {
        parent: {
          type: 'string',
          description: 'Parent resource (projects/PROJECT_ID or organizations/ORG_ID)',
        },
      },
      required: ['parent'],
    },
  },
  {
    name: 'create-custom-role',
    description: 'Create a custom IAM role',
    inputSchema: {
      type: 'object',
      properties: {
        parent: {
          type: 'string',
          description: 'Parent resource (projects/PROJECT_ID or organizations/ORG_ID)',
        },
        roleId: {
          type: 'string',
          description: 'Unique ID for the custom role',
        },
        title: {
          type: 'string',
          description: 'Human-readable title for the role',
        },
        description: {
          type: 'string',
          description: 'Description of the role',
        },
        permissions: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of permissions to include in the role',
        },
        stage: {
          type: 'string',
          enum: ['ALPHA', 'BETA', 'GA'],
          description: 'Launch stage of the role (defaults to GA)',
        },
      },
      required: ['parent', 'roleId', 'title', 'permissions'],
    },
  },

  // FinOps & Cost Management Tools
  {
    name: 'get-billing-account',
    description: 'Get billing account information',
    inputSchema: {
      type: 'object',
      properties: {
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID (if not provided, lists all accessible accounts)',
        },
      },
      required: [],
    },
  },
  {
    name: 'list-billing-accounts',
    description: 'List all accessible billing accounts',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'set-project-billing',
    description: 'Set or change billing account for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID to associate with the project',
        },
      },
      required: ['billingAccountId'],
    },
  },
  {
    name: 'get-cost-breakdown',
    description: 'Get detailed cost breakdown for a project or billing account',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID (if not provided, uses project billing account)',
        },
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (defaults to 30 days ago)',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (defaults to today)',
        },
        groupBy: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['service', 'sku', 'project', 'location'],
          },
          description: 'Dimensions to group costs by',
        },
      },
      required: [],
    },
  },
  {
    name: 'create-budget',
    description: 'Create a budget for cost monitoring',
    inputSchema: {
      type: 'object',
      properties: {
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID',
        },
        displayName: {
          type: 'string',
          description: 'Display name for the budget',
        },
        amount: {
          type: 'number',
          description: 'Budget amount in the billing currency',
        },
        projectIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Project IDs to include in budget (optional)',
        },
        thresholdRules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              thresholdPercent: {
                type: 'number',
                description: 'Threshold percentage (e.g., 0.8 for 80%)',
              },
              spendBasis: {
                type: 'string',
                enum: ['CURRENT_SPEND', 'FORECASTED_SPEND'],
                description: 'Whether to base threshold on current or forecasted spend',
              },
            },
            required: ['thresholdPercent'],
          },
          description: 'Threshold rules for budget alerts',
        },
      },
      required: ['billingAccountId', 'displayName', 'amount'],
    },
  },
  {
    name: 'list-budgets',
    description: 'List budgets for a billing account',
    inputSchema: {
      type: 'object',
      properties: {
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID',
        },
      },
      required: ['billingAccountId'],
    },
  },
  {
    name: 'update-budget',
    description: 'Update an existing budget',
    inputSchema: {
      type: 'object',
      properties: {
        budgetId: {
          type: 'string',
          description: 'Budget ID',
        },
        displayName: {
          type: 'string',
          description: 'Updated display name',
        },
        amount: {
          type: 'number',
          description: 'Updated budget amount',
        },
        thresholdRules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              thresholdPercent: {
                type: 'number',
              },
              spendBasis: {
                type: 'string',
                enum: ['CURRENT_SPEND', 'FORECASTED_SPEND'],
              },
            },
            required: ['thresholdPercent'],
          },
          description: 'Updated threshold rules',
        },
      },
      required: ['budgetId'],
    },
  },
  {
    name: 'delete-budget',
    description: 'Delete a budget',
    inputSchema: {
      type: 'object',
      properties: {
        budgetId: {
          type: 'string',
          description: 'Budget ID to delete',
        },
      },
      required: ['budgetId'],
    },
  },
  {
    name: 'get-cost-anomalies',
    description: 'Detect cost anomalies and unusual spending patterns',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID',
        },
        lookbackDays: {
          type: 'number',
          description: 'Number of days to analyze (defaults to 30)',
        },
        anomalyThreshold: {
          type: 'number',
          description: 'Threshold for anomaly detection (defaults to 2.0 standard deviations)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get-rightsizing-recommendations',
    description: 'Get recommendations for rightsizing resources to optimize costs',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        resourceType: {
          type: 'string',
          enum: ['compute-instances', 'persistent-disks', 'all'],
          description: 'Type of resources to analyze (defaults to all)',
        },
        region: {
          type: 'string',
          description: 'Region to analyze (defaults to all regions)',
        },
      },
      required: [],
    },
  },
  {
    name: 'export-billing-data',
    description: 'Export billing data to BigQuery or Cloud Storage',
    inputSchema: {
      type: 'object',
      properties: {
        billingAccountId: {
          type: 'string',
          description: 'Billing account ID',
        },
        destination: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['bigquery', 'cloud-storage'],
              description: 'Destination type for export',
            },
            datasetId: {
              type: 'string',
              description: 'BigQuery dataset ID (required for BigQuery export)',
            },
            tableId: {
              type: 'string',
              description: 'BigQuery table ID (required for BigQuery export)',
            },
            bucketName: {
              type: 'string',
              description: 'Cloud Storage bucket name (required for Cloud Storage export)',
            },
            objectPrefix: {
              type: 'string',
              description: 'Object prefix for Cloud Storage export',
            },
          },
          required: ['type'],
        },
        startDate: {
          type: 'string',
          description: 'Start date for export in YYYY-MM-DD format',
        },
        endDate: {
          type: 'string',
          description: 'End date for export in YYYY-MM-DD format',
        },
      },
      required: ['billingAccountId', 'destination'],
    },
  },

  // Organization Policy Management Tools
  {
    name: 'list-organization-policies',
    description: 'List organization policies for a resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource to list policies for',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID (organization ID, folder ID, or project ID)',
        },
      },
      required: ['resourceType', 'resourceId'],
    },
  },
  {
    name: 'get-organization-policy',
    description: 'Get a specific organization policy',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name (e.g., constraints/compute.disableSerialPortAccess)',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint'],
    },
  },
  {
    name: 'set-organization-policy',
    description: 'Set or update an organization policy',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name',
        },
        policy: {
          type: 'object',
          properties: {
            booleanPolicy: {
              type: 'object',
              properties: {
                enforced: {
                  type: 'boolean',
                  description: 'Whether the policy is enforced',
                },
              },
            },
            listPolicy: {
              type: 'object',
              properties: {
                allowedValues: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of allowed values',
                },
                deniedValues: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of denied values',
                },
                allValues: {
                  type: 'string',
                  enum: ['ALLOW', 'DENY'],
                  description: 'Allow or deny all values',
                },
              },
            },
          },
          description: 'Policy specification',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint', 'policy'],
    },
  },
  {
    name: 'delete-organization-policy',
    description: 'Delete an organization policy (reset to default)',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name to delete',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint'],
    },
  },
];
