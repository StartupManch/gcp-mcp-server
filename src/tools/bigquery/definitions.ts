/**
 * BigQuery Tool Definitions
 */

import { MCPTool } from '../../types';

export const bigqueryTools: MCPTool[] = [
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
];
