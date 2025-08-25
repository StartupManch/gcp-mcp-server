/**
 * IAM Management Tool Definitions
 */

import { MCPTool } from '../../types';

export const iamTools: MCPTool[] = [
  {
    name: 'list-iam-policies',
    description: 'List IAM policies for projects, folders, or organizations',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource to list IAM policies for',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID (project ID, folder ID, or organization ID)',
        },
      },
      required: ['resourceType'],
    },
  },
  {
    name: 'get-iam-policy',
    description: 'Get IAM policy for a specific resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization', 'serviceAccount'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description:
            'Resource ID (project ID, folder ID, organization ID, or service account email)',
        },
      },
      required: ['resourceType', 'resourceId'],
    },
  },
  {
    name: 'set-iam-policy',
    description: 'Set IAM policy for a specific resource',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization', 'serviceAccount'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        policy: {
          type: 'object',
          description: 'IAM policy object with bindings',
        },
      },
      required: ['resourceType', 'resourceId', 'policy'],
    },
  },
  {
    name: 'add-iam-binding',
    description: 'Add a member to an IAM role binding',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        role: {
          type: 'string',
          description: 'IAM role (e.g., roles/viewer, roles/editor)',
        },
        member: {
          type: 'string',
          description:
            'Member to add (e.g., user:email@domain.com, serviceAccount:account@project.iam.gserviceaccount.com)',
        },
      },
      required: ['resourceType', 'resourceId', 'role', 'member'],
    },
  },
  {
    name: 'remove-iam-binding',
    description: 'Remove a member from an IAM role binding',
    inputSchema: {
      type: 'object',
      properties: {
        resourceType: {
          type: 'string',
          enum: ['project', 'folder', 'organization'],
          description: 'Type of resource',
        },
        resourceId: {
          type: 'string',
          description: 'Resource ID',
        },
        role: {
          type: 'string',
          description: 'IAM role',
        },
        member: {
          type: 'string',
          description: 'Member to remove',
        },
      },
      required: ['resourceType', 'resourceId', 'role', 'member'],
    },
  },
  {
    name: 'list-service-accounts',
    description: 'List service accounts in a project',
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
    name: 'create-service-account',
    description: 'Create a new service account',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        accountId: {
          type: 'string',
          description: 'Service account ID (unique within project)',
        },
        displayName: {
          type: 'string',
          description: 'Display name for the service account',
        },
        description: {
          type: 'string',
          description: 'Description of the service account',
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'delete-service-account',
    description: 'Delete a service account',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID (defaults to selected project)',
        },
        email: {
          type: 'string',
          description: 'Service account email address',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'list-custom-roles',
    description: 'List custom IAM roles in a project or organization',
    inputSchema: {
      type: 'object',
      properties: {
        parent: {
          type: 'string',
          description: 'Parent resource (projects/PROJECT_ID or organizations/ORG_ID)',
        },
      },
      required: ['parent'],
    },
  },
  {
    name: 'create-custom-role',
    description: 'Create a custom IAM role',
    inputSchema: {
      type: 'object',
      properties: {
        parent: {
          type: 'string',
          description: 'Parent resource (projects/PROJECT_ID or organizations/ORG_ID)',
        },
        roleId: {
          type: 'string',
          description: 'Unique ID for the custom role',
        },
        title: {
          type: 'string',
          description: 'Human-readable title for the role',
        },
        description: {
          type: 'string',
          description: 'Description of the role',
        },
        permissions: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of permissions to include in the role',
        },
        stage: {
          type: 'string',
          enum: ['ALPHA', 'BETA', 'GA'],
          description: 'Launch stage of the role (defaults to GA)',
        },
      },
      required: ['parent', 'roleId', 'title', 'permissions'],
    },
  },
];
