/**
 * Entry point for GCP MCP Server
 */

import { GCPMCPServer } from './server';

async function main(): Promise<void> {
  const server = new GCPMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start GCP MCP Server:', error);
  process.exit(1);
});
