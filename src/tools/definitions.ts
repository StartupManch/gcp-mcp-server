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
];
