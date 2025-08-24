/**
 * GCP MCP Server - Main entry point
 *
 * This is a Model Context Protocol (MCP) server that enables AI assistants
 * to interact with Google Cloud Platform resources through natural language.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { gcpTools, GCPToolHandlers } from './tools';
import { logger, stateManager } from './utils';
import { CONFIG } from './config';
import { ToolCallArgs, createTextResponse } from './types';

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
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      logger.info(`Tool called: ${name}`);
      logger.debug('Tool arguments:', args);

      try {
        let result: any;

        switch (name) {
          case 'run-gcp-code':
            result = await this.toolHandlers.executeGCPCode(args as ToolCallArgs);
            break;

          case 'list-projects':
            result = await this.toolHandlers.listProjects();
            break;

          case 'select-project':
            result = await this.toolHandlers.selectProject(args as ToolCallArgs);
            break;

          case 'get-billing-info':
            result = await this.toolHandlers.getBillingInfo(args as ToolCallArgs);
            break;

          case 'get-cost-forecast':
            result = await this.toolHandlers.getCostForecast(args as ToolCallArgs);
            break;

          // Compute Engine Tools
          case 'list-compute-instances':
            result = await this.toolHandlers.listComputeInstances(args as ToolCallArgs);
            break;

          case 'get-compute-instance':
            result = await this.toolHandlers.getComputeInstance(args as ToolCallArgs);
            break;

          case 'start-compute-instance':
            result = await this.toolHandlers.startComputeInstance(args as ToolCallArgs);
            break;

          case 'stop-compute-instance':
            result = await this.toolHandlers.stopComputeInstance(args as ToolCallArgs);
            break;

          // Cloud Storage Tools
          case 'list-storage-buckets':
            result = await this.toolHandlers.listStorageBuckets(args as ToolCallArgs);
            break;

          case 'list-storage-objects':
            result = await this.toolHandlers.listStorageObjects(args as ToolCallArgs);
            break;

          case 'get-storage-object-info':
            result = await this.toolHandlers.getStorageObjectInfo(args as ToolCallArgs);
            break;

          // BigQuery Tools
          case 'list-bigquery-datasets':
            result = await this.toolHandlers.listBigQueryDatasets(args as ToolCallArgs);
            break;

          case 'list-bigquery-tables':
            result = await this.toolHandlers.listBigQueryTables(args as ToolCallArgs);
            break;

          case 'query-bigquery':
            result = await this.toolHandlers.queryBigQuery(args as ToolCallArgs);
            break;

          // Cloud SQL Tools
          case 'list-sql-instances':
            result = await this.toolHandlers.listSqlInstances(args as ToolCallArgs);
            break;

          case 'get-sql-instance':
            result = await this.toolHandlers.getSqlInstance(args as ToolCallArgs);
            break;

          // Cloud Functions Tools
          case 'list-cloud-functions':
            result = await this.toolHandlers.listCloudFunctions(args as ToolCallArgs);
            break;

          case 'get-cloud-function':
            result = await this.toolHandlers.getCloudFunction(args as ToolCallArgs);
            break;

          // Cloud Run Tools
          case 'list-cloud-run-services':
            result = await this.toolHandlers.listCloudRunServices(args as ToolCallArgs);
            break;

          case 'get-cloud-run-service':
            result = await this.toolHandlers.getCloudRunService(args as ToolCallArgs);
            break;

          // GKE Tools
          case 'list-gke-clusters':
            result = await this.toolHandlers.listGkeClusters(args as ToolCallArgs);
            break;

          case 'get-gke-cluster':
            result = await this.toolHandlers.getGkeCluster(args as ToolCallArgs);
            break;

          // Cloud Logging Tools
          case 'query-logs':
            result = await this.toolHandlers.queryLogs(args as ToolCallArgs);
            break;

          case 'list-log-entries':
            result = await this.toolHandlers.listLogEntries(args as ToolCallArgs);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return result;
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error as Error);
        return createTextResponse(
          JSON.stringify(
            {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          )
        );
      }
    });
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    process.on('uncaughtException', error => {
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
      logger.info(
        'No project selected. Use list-projects and select-project tools to get started.'
      );
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
  main().catch(error => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { GCPMCPServer };
