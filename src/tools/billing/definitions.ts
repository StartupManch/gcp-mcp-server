/**
 * Billing and FinOps Tool Definitions
 */

import { MCPTool } from '../../types';

export const billingTools: MCPTool[] = [
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
];
