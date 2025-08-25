/**
 * Organization Policy Management Tool Definitions
 */

import { MCPTool } from '../../types';

export const policyTools: MCPTool[] = [
  {
    name: 'list-organization-policies',
    description: 'List organization policies for a resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource to list policies for',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID (organization ID, folder ID, or project ID)',
        },
      },
      required: ['resourceType', 'resourceId'],
    },
  },
  {
    name: 'get-organization-policy',
    description: 'Get a specific organization policy',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name (e.g., constraints/compute.disableSerialPortAccess)',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint'],
    },
  },
  {
    name: 'set-organization-policy',
    description: 'Set or update an organization policy',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name',
        },
        policy: {
          type: 'object',
          properties: {
            booleanPolicy: {
              type: 'object',
              properties: {
                enforced: {
                  type: 'boolean',
                  description: 'Whether the policy is enforced',
                },
              },
            },
            listPolicy: {
              type: 'object',
              properties: {
                allowedValues: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of allowed values',
                },
                deniedValues: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of denied values',
                },
                allValues: {
                  type: 'string',
                  enum: ['ALLOW', 'DENY'],
                  description: 'Allow or deny all values',
                },
              },
            },
          },
          description: 'Policy specification',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint', 'policy'],
    },
  },
  {
    name: 'delete-organization-policy',
    description: 'Delete an organization policy (reset to default)',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['organization', 'folder', 'project'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        constraint: {
          type: 'string',
          description: 'Policy constraint name to delete',
        },
      },
      required: ['resourceType', 'resourceId', 'constraint'],
    },
  },
];
