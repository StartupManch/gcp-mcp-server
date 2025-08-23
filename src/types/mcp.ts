/**
 * MCP Tool definitions and schemas
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ToolCallArgs {
  reasoning?: string;
  code?: string;
  projectId?: string;
  region?: string;
  months?: number;
  [key: string]: any;
}

export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}
