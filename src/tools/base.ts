/**
 * Base interfaces for tool modules
 */

import { MCPTool } from '../types';
import { ToolCallArgs, ToolResponse } from '../types';

/**
 * Base interface for tool definition modules
 */
export interface ToolDefinitionModule {
  tools: MCPTool[];
}

/**
 * Base interface for tool handler modules
 */
export interface ToolHandlerModule {
  [key: string]: (args: ToolCallArgs) => Promise<ToolResponse>;
}

/**
 * Base class for resource-specific handlers
 */
export abstract class BaseResourceHandler {
  protected abstract readonly resourceName: string;

  protected handleError(operation: string, error: unknown): ToolResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: `Failed to ${operation} ${this.resourceName}: ${errorMessage}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
