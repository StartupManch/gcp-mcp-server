/**
 * Project Management Tool Handlers
 */

import { Project, SyntaxKind } from 'ts-morph';
import { createContext, runInContext } from 'vm';
import { GoogleAuth } from 'google-auth-library';
import { ProjectsClient } from '@google-cloud/resource-manager';

import { ToolCallArgs, ToolResponse, createTextResponse } from '../../types';
import { logger, withRetry, stateManager } from '../../utils';
import { CONFIG } from '../../config';
import { BaseResourceHandler } from '../base';

export class ProjectHandlers extends BaseResourceHandler {
  protected readonly resourceName = 'project';

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
            projectId: currentProjectId,
            region: currentRegion,
            result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('execute GCP code', error);
    }
  }

  /**
   * List all GCP projects
   */
  async listProjects(): Promise<ToolResponse> {
    try {
      logger.info('Listing GCP projects');

      const result = await withRetry(async () => {
        const client = new ProjectsClient();
        const [projects] = await client.searchProjects();

        return projects.map(project => ({
          projectId: project.projectId,
          name: project.name,
          projectNumber: (project as any).projectNumber?.toString() || 'unknown',
          state: project.state,
          createTime: project.createTime,
        }));
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Found ${result.length} projects`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projects: result,
            count: result.length,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('list projects', error);
    }
  }

  /**
   * Select a project for subsequent operations
   */
  async selectProject(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, region } = args;

      if (!projectId) {
        throw new Error('Missing required parameter: projectId');
      }

      logger.info(`Selecting project: ${projectId}`);

      // Verify project exists and is accessible
      const result = await withRetry(async () => {
        const client = new ProjectsClient();
        const [project] = await client.getProject({ name: `projects/${projectId}` });
        return project;
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      if (!result) {
        throw new Error(`Project ${projectId} not found or not accessible`);
      }

      // Update state
      stateManager.selectProject(projectId);
      if (region) {
        stateManager.setRegion(region);
      }

      logger.info(`Project selected: ${projectId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            selectedProject: projectId,
            selectedRegion: region || stateManager.getSelectedRegion(),
            project: {
              projectId: result.projectId,
              name: result.name,
              projectNumber: (result as any).projectNumber?.toString() || 'unknown',
              state: result.state,
            },
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('select project', error);
    }
  }

  /**
   * Run TypeScript code in a sandboxed VM context
   */
  private async runCodeInSandbox(
    code: string,
    projectId: string,
    region: string
  ): Promise<unknown> {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 6, // ES2018
        module: 1, // CommonJS
        moduleResolution: 2, // Node
        declaration: false,
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    });

    // Add the code to compile
    const sourceFile = project.createSourceFile('temp.ts', code);

    // Get diagnostics and check for errors
    const diagnostics = sourceFile.getPreEmitDiagnostics();
    if (diagnostics.length > 0) {
      const errorMessages = diagnostics.map(diagnostic => diagnostic.getMessageText());
      throw new Error(`TypeScript compilation errors: ${errorMessages.join(', ')}`);
    }

    // Emit JavaScript
    const result = sourceFile.getEmitOutput();
    const jsCode = result.getOutputFiles()[0]?.getText();

    if (!jsCode) {
      throw new Error('Failed to compile TypeScript code');
    }

    // Create execution context with GCP modules
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const moduleMap: Record<string, unknown> = {
      '@google-cloud/compute': require('@google-cloud/compute'),
      '@google-cloud/storage': require('@google-cloud/storage'),
      '@google-cloud/bigquery': require('@google-cloud/bigquery'),
      '@google-cloud/resource-manager': require('@google-cloud/resource-manager'),
      '@google-cloud/logging': require('@google-cloud/logging'),
      '@google-cloud/billing': require('@google-cloud/billing'),
      '@google-cloud/functions': require('@google-cloud/functions'),
      '@google-cloud/run': require('@google-cloud/run'),
      '@google-cloud/container': require('@google-cloud/container'),
      '@google-cloud/sql': require('@google-cloud/sql'),
      'google-auth-library': require('google-auth-library'),
    };

    const sandbox = {
      require: (moduleName: string) => {
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

    // Execute the code
    return runInContext(jsCode, context, { timeout: 30000 });
  }
}
