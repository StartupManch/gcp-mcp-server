/**
 * Cloud Run Tool Definitions
 */

import { MCPTool } from '../../types';

export const runTools: MCPTool[] = [
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
];
