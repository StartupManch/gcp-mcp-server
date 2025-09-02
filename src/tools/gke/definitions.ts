/**
 * Google Kubernetes Engine (GKE) Tool Definitions
 */

import { MCPTool } from '../../types';

export const gkeTools: MCPTool[] = [
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
];
