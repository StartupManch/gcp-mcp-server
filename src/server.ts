/**
 * GCP MCP Server - Main entry point
 * 
 * This is a Model Context Protocol (MCP) server that enables AI assistants
 * to interact with Google Cloud Platform resources through natural language.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

import { gcpTools, GCPToolHandlers } from './tools';
import { logger, stateManager } from './utils';
import { CONFIG } from './config';
import { ToolCallArgs } from './types';

/**
 * Main GCP MCP Server class
 */
class GCPMCPServer {
  private server: Server;
  private toolHandlers: GCPToolHandlers;

  constructor() {
    this.server = new Server(
      {
        name: CONFIG.SERVER.NAME,
        version: CONFIG.SERVER.VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.toolHandlers = new GCPToolHandlers();
    this.setupHandlers();
    this.setupErrorHandlers();
  }

  /**
   * Setup request handlers for the MCP server
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Listing available tools');
      return {
        tools: gcpTools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.info(`Tool called: ${name}`);
      logger.debug('Tool arguments:', args);

      try {
        switch (name) {
          case "run-gcp-code":
            return await this.toolHandlers.executeGCPCode(args as ToolCallArgs);
          
          case "list-projects":
            return await this.toolHandlers.listProjects();
          
          case "select-project":
            return await this.toolHandlers.selectProject(args as ToolCallArgs);
          
          case "get-billing-info":
            return await this.toolHandlers.getBillingInfo(args as ToolCallArgs);
          
          case "get-cost-forecast":
            return await this.toolHandlers.getCostForecast(args as ToolCallArgs);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error as Error);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    });
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise as any, 'reason:', reason);
      process.exit(1);
    });

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    logger.info(`Starting ${CONFIG.SERVER.NAME} v${CONFIG.SERVER.VERSION}`);
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    logger.info('GCP MCP Server started successfully');
    logger.info(`Selected region: ${stateManager.getSelectedRegion()}`);
    
    if (stateManager.isProjectSelected()) {
      logger.info(`Selected project: ${stateManager.getSelectedProject()}`);
    } else {
      logger.info('No project selected. Use list-projects and select-project tools to get started.');
    }
  }

  /**
   * Shutdown the server gracefully
   */
  private shutdown(): void {
    logger.info('Shutting down GCP MCP Server...');
    stateManager.clearSelection();
    process.exit(0);
  }
}

/**
 * Initialize and start the server
 */
async function main(): Promise<void> {
  try {
    const server = new GCPMCPServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to start server:', error as Error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { GCPMCPServer };
