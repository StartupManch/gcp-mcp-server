/**
 * Cloud Storage Tool Definitions
 */

import { MCPTool } from '../../types';

export const storageTools: MCPTool[] = [
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
];
