/**
 * Cloud SQL Tool Definitions
 */

import { MCPTool } from '../../types';

export const sqlTools: MCPTool[] = [
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
];
