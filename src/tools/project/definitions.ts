/**
 * Project Management Tool Definitions
 */

import { MCPTool } from '../../types';
import { CONFIG } from '../../config';

export const projectTools: MCPTool[] = [
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
];
