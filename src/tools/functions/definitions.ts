/**
 * Cloud Functions Tool Definitions
 */

import { MCPTool } from '../../types';

export const functionsTools: MCPTool[] = [
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
];
