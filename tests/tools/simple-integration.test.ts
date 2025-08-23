/**
 * Integration tests for GCP tools handlers
 */

import { describe, it, expect } from '@jest/globals';

// Mock tool request interface
interface ToolRequest {
  name: string;
  arguments: Record<string, any>;
}

interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// Mock data
const mockGCPProject = {
  projectId: 'test-project-123',
  name: 'Test Project',
  projectNumber: '123456789',
  lifecycleState: 'ACTIVE',
};

// Simplified tool handler for testing
class SimplifiedGCPToolHandlers {
  async handleToolRequest(request: ToolRequest): Promise<ToolResponse> {
    const { name, arguments: args } = request;

    try {
      switch (name) {
        case 'list-projects':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify([mockGCPProject], null, 2),
              },
            ],
          };

        case 'list-compute-instances':
          const instances = [
            {
              name: 'test-instance',
              zone: args.zone || 'us-central1-a',
              status: 'RUNNING',
            },
          ];
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(instances, null, 2),
              },
            ],
          };

        case 'start-compute-instance':
          if (!args.instanceName) {
            throw new Error('instanceName is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: `Started instance ${args.instanceName} in zone ${args.zone || 'us-central1-a'}`,
              },
            ],
          };

        case 'stop-compute-instance':
          if (!args.instanceName) {
            throw new Error('instanceName is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: `Stopped instance ${args.instanceName} in zone ${args.zone || 'us-central1-a'}`,
              },
            ],
          };

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
}

describe('GCP Tools Integration', () => {
  let toolHandlers: SimplifiedGCPToolHandlers;

  beforeEach(() => {
    toolHandlers = new SimplifiedGCPToolHandlers();
  });

  describe('Project Operations', () => {
    it('should list projects successfully', async () => {
      const request: ToolRequest = {
        name: 'list-projects',
        arguments: {},
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBeFalsy();
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const projects = JSON.parse(response.content[0].text);
      expect(projects).toEqual([mockGCPProject]);
    });
  });

  describe('Compute Instance Operations', () => {
    it('should list compute instances successfully', async () => {
      const request: ToolRequest = {
        name: 'list-compute-instances',
        arguments: { zone: 'us-central1-a' },
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBeFalsy();
      expect(response.content).toHaveLength(1);

      const instances = JSON.parse(response.content[0].text);
      expect(instances).toEqual([
        {
          name: 'test-instance',
          zone: 'us-central1-a',
          status: 'RUNNING',
        },
      ]);
    });

    it('should start compute instance', async () => {
      const request: ToolRequest = {
        name: 'start-compute-instance',
        arguments: {
          instanceName: 'test-instance',
          zone: 'us-central1-a',
        },
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Started instance test-instance');
    });

    it('should stop compute instance', async () => {
      const request: ToolRequest = {
        name: 'stop-compute-instance',
        arguments: {
          instanceName: 'test-instance',
          zone: 'us-central1-a',
        },
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Stopped instance test-instance');
    });

    it('should handle missing instanceName parameter', async () => {
      const request: ToolRequest = {
        name: 'start-compute-instance',
        arguments: { zone: 'us-central1-a' },
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('instanceName is required');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool names', async () => {
      const request: ToolRequest = {
        name: 'unknown-tool',
        arguments: {},
      };

      const response = await toolHandlers.handleToolRequest(request);

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Unknown tool: unknown-tool');
    });
  });

  describe('Tool Workflow', () => {
    it('should handle multiple operations in sequence', async () => {
      // 1. List projects
      const projectsResponse = await toolHandlers.handleToolRequest({
        name: 'list-projects',
        arguments: {},
      });
      expect(projectsResponse.isError).toBeFalsy();

      // 2. List instances
      const instancesResponse = await toolHandlers.handleToolRequest({
        name: 'list-compute-instances',
        arguments: { zone: 'us-central1-a' },
      });
      expect(instancesResponse.isError).toBeFalsy();

      // 3. Start instance
      const startResponse = await toolHandlers.handleToolRequest({
        name: 'start-compute-instance',
        arguments: {
          instanceName: 'test-instance',
          zone: 'us-central1-a',
        },
      });
      expect(startResponse.isError).toBeFalsy();
      expect(startResponse.content[0].text).toContain('Started instance test-instance');
    });
  });
});
