/**
 * Compute Engine Tool Definitions
 */

import { MCPTool } from '../../types';

export const computeTools: MCPTool[] = [
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
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
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
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
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
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        zone: {
          type: 'string',
          description: 'Zone where the instance is located',
        },
      },
      required: ['instanceName', 'zone'],
    },
  },
];
