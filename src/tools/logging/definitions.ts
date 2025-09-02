/**
 * Cloud Logging Tool Definitions
 */

import { MCPTool } from '../../types';

export const loggingTools: MCPTool[] = [
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
