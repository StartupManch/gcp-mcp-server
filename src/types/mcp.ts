/**
 * MCP Tool definitions and schemas
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ToolCallArgs {
  reasoning?: string;
  code?: string;
  projectId?: string;
  region?: string;
  months?: number;
  [key: string]: unknown;
}

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export const createTextResponse = (text: string): ToolResponse => ({
  content: [{ type: 'text', text }],
});
