/**
 * Tool handlers for GCP operations
 */

import { Project, SyntaxKind } from 'ts-morph';
import { createContext, runInContext } from 'vm';
import { GoogleAuth } from 'google-auth-library';
import { InstancesClient } from '@google-cloud/compute';
import { Storage } from '@google-cloud/storage';
import { CloudFunctionsServiceClient } from '@google-cloud/functions';
import { ServicesClient } from '@google-cloud/run';
import { BigQuery } from '@google-cloud/bigquery';
import { ProjectsClient } from '@google-cloud/resource-manager';
import { CloudBillingClient } from '@google-cloud/billing';
import { BudgetServiceClient } from '@google-cloud/billing-budgets';
import { ClusterManagerClient } from '@google-cloud/container';
import { Logging, Entry, Log } from '@google-cloud/logging';
import { SqlInstancesServiceClient } from '@google-cloud/sql';

import { ToolCallArgs, ToolResponse, createTextResponse } from '../types';
import { logger, withRetry, stateManager } from '../utils';
import { CONFIG } from '../config';

export class GCPToolHandlers {
  /**
   * Execute GCP code in a sandboxed environment
   */
  async executeGCPCode(args: ToolCallArgs): Promise<ToolResponse> {
    const { reasoning, code, projectId, region } = args;

    try {
      logger.info(`Executing GCP code with reasoning: ${reasoning}`);

      const currentProjectId = projectId || stateManager.getSelectedProject();
      const currentRegion = region || stateManager.getSelectedRegion();

      if (!currentProjectId) {
        throw new Error(
          'No project selected. Please select a project first using the select-project tool.'
        );
      }

      const result = await withRetry(async () => {
        return await this.runCodeInSandbox(code!, currentProjectId, currentRegion);
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Code execution completed successfully`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            reasoning,
            projectId: currentProjectId,
            region: currentRegion,
            result,
          },
          null,
          2
        )
      );
    } catch (error) {
      logger.error('Code execution failed:', error as Error);
      return createTextResponse(
        JSON.stringify(
          {
            success: false,
            reasoning,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2
        )
      );
    }
  }

  /**
   * List all accessible GCP projects
   */
  async listProjects(): Promise<ToolResponse> {
    try {
      logger.info('Listing GCP projects');

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const projectsClient = new ProjectsClient({ auth });
        const [projects] = await projectsClient.searchProjects();

        return projects.map(project => ({
          projectId: project.projectId || '',
          name: project.name || '',
          projectNumber: (project as any).projectNumber || '',
          lifecycleState: (project as any).lifecycleState || '',
          parent: (project as any).parent,
        }));
      });

      logger.info(`Found ${result.length} projects`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projects: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list projects', error);
    }
  }

  /**
   * Select a GCP project for subsequent operations
   */
  async selectProject(args: ToolCallArgs): Promise<ToolResponse> {
    const { projectId, region } = args;

    try {
      logger.info(`Selecting project: ${projectId}`);

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Verify project exists and is accessible
      await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const projectsClient = new ProjectsClient({ auth });
        const [project] = await projectsClient.getProject({ name: `projects/${projectId}` });

        if (!project) {
          throw new Error(`Project ${projectId} not found or not accessible`);
        }

        return project;
      });

      // Update state
      stateManager.selectProject(projectId);
      if (region) {
        stateManager.setRegion(region);
      }

      logger.info(`Successfully selected project: ${projectId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            selectedProject: projectId,
            selectedRegion: stateManager.getSelectedRegion(),
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('select project', error);
    }
  }

  /**
   * Get billing information for a project
   */
  async getBillingInfo(args: ToolCallArgs): Promise<ToolResponse> {
    const { projectId } = args;

    try {
      const targetProjectId = projectId || stateManager.getSelectedProject();

      if (!targetProjectId) {
        throw new Error('No project specified and no project selected');
      }

      logger.info(`Getting billing info for project: ${targetProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const billingClient = new CloudBillingClient({ auth });
        const [billingInfo] = await billingClient.getProjectBillingInfo({
          name: `projects/${targetProjectId}`,
        });

        return {
          name: billingInfo.name,
          projectId: targetProjectId,
          billingAccountName: billingInfo.billingAccountName,
          billingEnabled: billingInfo.billingEnabled,
        };
      });

      logger.info(`Retrieved billing info for project: ${targetProjectId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            billingInfo: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get billing info', error);
    }
  }

  /**
   * Get cost forecast for a project
   */
  async getCostForecast(args: ToolCallArgs): Promise<ToolResponse> {
    const { projectId, months = 3 } = args;

    try {
      const targetProjectId = projectId || stateManager.getSelectedProject();

      if (!targetProjectId) {
        throw new Error('No project specified and no project selected');
      }

      logger.info(`Getting cost forecast for project: ${targetProjectId} (${months} months)`);

      // Note: This is a simplified implementation. Real cost forecasting would require
      // more complex billing API usage and historical data analysis
      const result = await withRetry(async () => {
        // For now, return a placeholder response since budget API has complex auth requirements
        return {
          message: 'Cost forecasting requires historical billing data and budget configuration',
          forecastPeriod: `${months} months`,
          projectId: targetProjectId,
          note: 'This feature requires additional billing API configuration',
        };
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            forecast: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get cost forecast', error);
    }
  }

  /**
   * Run TypeScript code in a sandboxed VM context
   */
  private async runCodeInSandbox(code: string, projectId: string, region: string): Promise<any> {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 6, // ES2018
        module: 1, // CommonJS
        lib: ['es2018'],
        declaration: false,
        strict: false,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
    });

    const sourceFile = project.createSourceFile('temp.ts', code);

    // Transform the code
    const statements = sourceFile.getStatements();
    let hasReturn = false;

    statements.forEach(statement => {
      if (statement.getKind() === SyntaxKind.ReturnStatement) {
        hasReturn = true;
      }
    });

    if (!hasReturn) {
      throw new Error('Code must include a return statement');
    }

    const result = project.emitToMemory();
    const jsCode = result.getFiles()[0].text;

    // Create sandbox context with GCP clients
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const sandbox = {
      require: (moduleName: string) => {
        const moduleMap: Record<string, any> = {
          '@google-cloud/compute': { InstancesClient },
          '@google-cloud/storage': { Storage },
          '@google-cloud/functions': { CloudFunctionsServiceClient },
          '@google-cloud/run': { ServicesClient },
          '@google-cloud/bigquery': { BigQuery },
          '@google-cloud/resource-manager': { ProjectsClient },
          '@google-cloud/billing': { CloudBillingClient },
          '@google-cloud/billing-budgets': { BudgetServiceClient },
          '@google-cloud/container': { ClusterManagerClient },
          '@google-cloud/logging': { Logging, Entry, Log },
          '@google-cloud/sql': { SqlInstancesServiceClient },
          'google-auth-library': { GoogleAuth },
        };

        return (
          moduleMap[moduleName] ||
          (() => {
            throw new Error(`Module ${moduleName} not available in sandbox`);
          })()
        );
      },
      console,
      projectId,
      region,
      auth,
      Promise,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      process: { env: process.env },
    };

    const context = createContext(sandbox);

    try {
      const wrappedCode = `
        (async function() {
          ${jsCode}
        })();
      `;

      return await runInContext(wrappedCode, context, { timeout: 30000 });
    } catch (error) {
      logger.error('Sandbox execution error:', error as Error);
      throw error;
    }
  }

  /**
   * Handle tool execution errors consistently
   */
  private handleToolError(operation: string, error: unknown): ToolResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Tool error in ${operation}:`, error as Error);

    return createTextResponse(
      JSON.stringify(
        {
          success: false,
          error: `Failed to ${operation}: ${errorMessage}`,
        },
        null,
        2
      )
    );
  }
}
