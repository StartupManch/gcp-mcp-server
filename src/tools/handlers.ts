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
import { CONFIG, getZonesForRegion } from '../config';

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
          projectNumber: (project as { projectNumber?: string }).projectNumber || '',
          lifecycleState: (project as { lifecycleState?: string }).lifecycleState || '',
          parent: (project as unknown as { parent?: { type: string; id: string } }).parent,
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

  // Compute Engine Tools
  async listComputeInstances(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, zone } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const zoneString = zone as string | undefined;

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing Compute Engine instances for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/compute.readonly'],
        });
        const computeClient = new InstancesClient({ auth });

        if (zoneString) {
          // List instances from specific zone
          const [instances] = await computeClient.list({
            project: currentProjectId,
            zone: zoneString,
          });
          return instances || [];
        } else {
          // For all zones, get zones dynamically based on the current region selection
          // This replaces the hardcoded zone list and makes the tool region-aware
          const allInstances: unknown[] = [];
          try {
            const currentRegion = stateManager.getSelectedRegion();
            const zonesToCheck = getZonesForRegion(currentRegion);

            for (const zoneToCheck of zonesToCheck) {
              try {
                const [instances] = await computeClient.list({
                  project: currentProjectId,
                  zone: zoneToCheck,
                });
                if (instances) {
                  allInstances.push(
                    ...instances.map(instance => ({
                      ...instance,
                      zone: zoneToCheck,
                    }))
                  );
                }
              } catch {
                // Zone might not exist or no instances, continue
                continue;
              }
            }
            return allInstances;
          } catch {
            // Fallback to empty array
            return [];
          }
        }
      });

      logger.info(`Found ${result.length} instances`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone: zone || 'all',
            instances: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list compute instances', error);
    }
  }

  async getComputeInstance(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { instanceName, zone, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const instanceNameString = instanceName as string;
      const zoneString = zone as string;

      if (!currentProjectId || !instanceNameString || !zoneString) {
        throw new Error('Missing required parameters: instanceName, zone');
      }

      logger.info(`Getting instance details: ${instanceNameString} in zone ${zoneString}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const computeClient = new InstancesClient({ auth });

        const [instance] = await computeClient.get({
          project: currentProjectId,
          zone: zoneString,
          instance: instanceNameString,
        });

        return instance;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone,
            instance: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get compute instance', error);
    }
  }

  async startComputeInstance(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { instanceName, zone, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const instanceNameString = instanceName as string;
      const zoneString = zone as string;

      if (!currentProjectId || !instanceNameString || !zoneString) {
        throw new Error('Missing required parameters: instanceName, zone');
      }

      logger.info(`Starting instance: ${instanceNameString} in zone ${zoneString}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const computeClient = new InstancesClient({ auth });

        const [operation] = await computeClient.start({
          project: currentProjectId,
          zone: zoneString,
          instance: instanceNameString,
        });

        return operation;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone,
            instanceName,
            operation: result,
            message: 'Instance start operation initiated',
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('start compute instance', error);
    }
  }

  async stopComputeInstance(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { instanceName, zone, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const instanceNameString = instanceName as string;
      const zoneString = zone as string;

      if (!currentProjectId || !instanceNameString || !zoneString) {
        throw new Error('Missing required parameters: instanceName, zone');
      }

      logger.info(`Stopping instance: ${instanceNameString} in zone ${zoneString}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const computeClient = new InstancesClient({ auth });

        const [operation] = await computeClient.stop({
          project: currentProjectId,
          zone: zoneString,
          instance: instanceNameString,
        });

        return operation;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone,
            instanceName,
            operation: result,
            message: 'Instance stop operation initiated',
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('stop compute instance', error);
    }
  }

  // Cloud Storage Tools
  async listStorageBuckets(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing Storage buckets for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const storage = new Storage({ projectId: currentProjectId });
        const [buckets] = await storage.getBuckets();
        return buckets.map(bucket => ({
          name: bucket.name,
          location: bucket.metadata.location,
          storageClass: bucket.metadata.storageClass,
          created: bucket.metadata.timeCreated,
          updated: bucket.metadata.updated,
        }));
      });

      logger.info(`Found ${result.length} buckets`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            buckets: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list storage buckets', error);
    }
  }

  async listStorageObjects(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { bucketName, prefix, maxResults = 100 } = args;
      const bucketNameString = bucketName as string;
      const prefixString = prefix as string | undefined;

      if (!bucketNameString) {
        throw new Error('Missing required parameter: bucketName');
      }

      logger.info(`Listing objects in bucket: ${bucketNameString}`);

      const result = await withRetry(async () => {
        const storage = new Storage();
        const bucket = storage.bucket(bucketNameString);

        const [files] = await bucket.getFiles({
          prefix: prefixString,
          maxResults: Number(maxResults),
        });

        return files.map(file => ({
          name: file.name,
          size: file.metadata.size,
          contentType: file.metadata.contentType,
          created: file.metadata.timeCreated,
          updated: file.metadata.updated,
        }));
      });

      logger.info(`Found ${result.length} objects`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            bucketName,
            prefix: prefix || '',
            objects: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list storage objects', error);
    }
  }

  async getStorageObjectInfo(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { bucketName, objectName } = args;
      const bucketNameString = bucketName as string;
      const objectNameString = objectName as string;

      if (!bucketNameString || !objectNameString) {
        throw new Error('Missing required parameters: bucketName, objectName');
      }

      logger.info(`Getting object info: ${objectNameString} in bucket ${bucketNameString}`);

      const result = await withRetry(async () => {
        const storage = new Storage();
        const file = storage.bucket(bucketNameString).file(objectNameString);

        const [metadata] = await file.getMetadata();
        return metadata;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            bucketName,
            objectName,
            metadata: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get storage object info', error);
    }
  }

  // BigQuery Tools
  async listBigQueryDatasets(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing BigQuery datasets for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const bigquery = new BigQuery({ projectId: currentProjectId });
        const [datasets] = await bigquery.getDatasets();

        return datasets.map(dataset => ({
          id: dataset.id,
          location: dataset.metadata.location,
          created: dataset.metadata.creationTime,
          modified: dataset.metadata.lastModifiedTime,
        }));
      });

      logger.info(`Found ${result.length} datasets`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            datasets: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list BigQuery datasets', error);
    }
  }

  async listBigQueryTables(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { datasetId, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const datasetIdString = datasetId as string;

      if (!currentProjectId || !datasetIdString) {
        throw new Error('Missing required parameter: datasetId');
      }

      logger.info(`Listing tables in dataset: ${datasetIdString}`);

      const result = await withRetry(async () => {
        const bigquery = new BigQuery({ projectId: currentProjectId });
        const dataset = bigquery.dataset(datasetIdString);
        const [tables] = await dataset.getTables();

        return tables.map(table => ({
          id: table.id,
          type: table.metadata.type,
          schema: table.metadata.schema,
          numRows: table.metadata.numRows,
          numBytes: table.metadata.numBytes,
          created: table.metadata.creationTime,
          modified: table.metadata.lastModifiedTime,
        }));
      });

      logger.info(`Found ${result.length} tables`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            datasetId,
            tables: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list BigQuery tables', error);
    }
  }

  async queryBigQuery(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { query, projectId, maxResults = 100 } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !query) {
        throw new Error('Missing required parameter: query');
      }

      logger.info(`Executing BigQuery query`);

      const result = await withRetry(async () => {
        const bigquery = new BigQuery({ projectId: currentProjectId });

        const options = {
          query: query as string,
          location: 'US',
          maxResults: Number(maxResults),
        };

        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();

        return {
          jobId: job.id,
          rows,
          totalRows: rows.length,
        };
      });

      logger.info(`Query executed successfully, returned ${result.rows.length} rows`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            query,
            result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('execute BigQuery query', error);
    }
  }

  // Cloud SQL Tools
  async listSqlInstances(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing Cloud SQL instances for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const sqlClient = new SqlInstancesServiceClient({ auth });

        const [instances] = await sqlClient.list({
          project: currentProjectId,
        });

        return instances.items || [];
      });

      logger.info(`Found ${result.length} SQL instances`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            instances: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list SQL instances', error);
    }
  }

  async getSqlInstance(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { instanceId, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const instanceIdString = instanceId as string;

      if (!currentProjectId || !instanceIdString) {
        throw new Error('Missing required parameter: instanceId');
      }

      logger.info(`Getting SQL instance details: ${instanceIdString}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const sqlClient = new SqlInstancesServiceClient({ auth });

        const [instance] = await sqlClient.get({
          project: currentProjectId,
          instance: instanceIdString,
        });

        return instance;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            instanceId,
            instance: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get SQL instance', error);
    }
  }

  // Cloud Functions Tools
  async listCloudFunctions(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, region } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const currentRegion = region || stateManager.getSelectedRegion();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing Cloud Functions for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const functionsClient = new CloudFunctionsServiceClient({ auth });

        const parent = `projects/${currentProjectId}/locations/${currentRegion}`;
        const [functions] = await functionsClient.listFunctions({ parent });

        return functions;
      });

      logger.info(`Found ${result.length} functions`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            region: currentRegion,
            functions: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list Cloud Functions', error);
    }
  }

  async getCloudFunction(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { functionName, region, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !functionName || !region) {
        throw new Error('Missing required parameters: functionName, region');
      }

      logger.info(`Getting function details: ${functionName} in region ${region}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const functionsClient = new CloudFunctionsServiceClient({ auth });

        const name = `projects/${currentProjectId}/locations/${region}/functions/${functionName}`;
        const [functionDetails] = await functionsClient.getFunction({ name });

        return functionDetails;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            region,
            functionName,
            function: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get Cloud Function', error);
    }
  }

  // Cloud Run Tools
  async listCloudRunServices(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, region } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();
      const currentRegion = region || stateManager.getSelectedRegion();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing Cloud Run services for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const runClient = new ServicesClient({ auth });

        const parent = `projects/${currentProjectId}/locations/${currentRegion}`;
        const [services] = await runClient.listServices({ parent });

        return services;
      });

      logger.info(`Found ${result.length} Cloud Run services`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            region: currentRegion,
            services: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list Cloud Run services', error);
    }
  }

  async getCloudRunService(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { serviceName, region, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !serviceName || !region) {
        throw new Error('Missing required parameters: serviceName, region');
      }

      logger.info(`Getting Cloud Run service details: ${serviceName} in region ${region}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const runClient = new ServicesClient({ auth });

        const name = `projects/${currentProjectId}/locations/${region}/services/${serviceName}`;
        const [service] = await runClient.getService({ name });

        return service;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            region,
            serviceName,
            service: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get Cloud Run service', error);
    }
  }

  // GKE Tools
  async listGkeClusters(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, zone } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing GKE clusters for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const containerClient = new ClusterManagerClient({ auth });

        const parent = zone
          ? `projects/${currentProjectId}/locations/${zone}`
          : `projects/${currentProjectId}/locations/-`;

        const [response] = await containerClient.listClusters({ parent });
        return response.clusters || [];
      });

      logger.info(`Found ${result.length} GKE clusters`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone: zone || 'all',
            clusters: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list GKE clusters', error);
    }
  }

  async getGkeCluster(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { clusterName, zone, projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !clusterName || !zone) {
        throw new Error('Missing required parameters: clusterName, zone');
      }

      logger.info(`Getting GKE cluster details: ${clusterName} in zone ${zone}`);

      const result = await withRetry(async () => {
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const containerClient = new ClusterManagerClient({ auth });

        const name = `projects/${currentProjectId}/locations/${zone}/clusters/${clusterName}`;
        const [cluster] = await containerClient.getCluster({ name });

        return cluster;
      });

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            zone,
            clusterName,
            cluster: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get GKE cluster', error);
    }
  }

  // Cloud Logging Tools
  async queryLogs(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { filter, projectId, maxResults = 100, orderBy = 'timestamp desc' } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !filter) {
        throw new Error('Missing required parameter: filter');
      }

      logger.info(`Querying logs with filter: ${filter}`);

      const result = await withRetry(async () => {
        const logging = new Logging({ projectId: currentProjectId });

        const entries = await logging.getEntries({
          filter: filter as string,
          pageSize: Number(maxResults),
          orderBy: orderBy as string,
        });

        return entries[0].map(entry => ({
          timestamp: entry.metadata.timestamp,
          severity: entry.metadata.severity,
          resource: entry.metadata.resource,
          jsonPayload: entry.metadata.jsonPayload,
          textPayload: entry.metadata.textPayload,
        }));
      });

      logger.info(`Found ${result.length} log entries`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            filter,
            entries: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('query logs', error);
    }
  }

  async listLogEntries(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceName, severity, projectId, maxResults = 50 } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !resourceType) {
        throw new Error('Missing required parameter: resourceType');
      }

      logger.info(`Listing log entries for resource type: ${resourceType}`);

      const result = await withRetry(async () => {
        const logging = new Logging({ projectId: currentProjectId });

        let filter = `resource.type="${resourceType}"`;
        if (resourceName) {
          filter += ` AND resource.labels.instance_name="${resourceName}"`;
        }
        if (severity) {
          filter += ` AND severity>="${severity}"`;
        }

        const entries = await logging.getEntries({
          filter,
          pageSize: Number(maxResults),
          orderBy: 'timestamp desc',
        });

        return entries[0].map(entry => ({
          timestamp: entry.metadata.timestamp,
          severity: entry.metadata.severity,
          resource: entry.metadata.resource,
          jsonPayload: entry.metadata.jsonPayload,
          textPayload: entry.metadata.textPayload,
        }));
      });

      logger.info(`Found ${result.length} log entries`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            resourceType,
            resourceName: resourceName || 'all',
            severity: severity || 'all',
            entries: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list log entries', error);
    }
  }

  // IAM Management Handlers
  async listIamPolicies(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId } = args;

      if (!resourceType) {
        throw new Error('Missing required parameter: resourceType');
      }

      logger.info(`Listing IAM policies for ${resourceType}: ${resourceId || 'all'}`);

      // TODO: Implement IAM policies listing using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'IAM policies listing not yet implemented',
            resourceType,
            resourceId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list IAM policies', error);
    }
  }

  async getIamPolicy(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId } = args;

      if (!resourceType || !resourceId) {
        throw new Error('Missing required parameters: resourceType and resourceId');
      }

      logger.info(`Getting IAM policy for ${resourceType}: ${resourceId}`);

      // TODO: Implement IAM policy retrieval using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'IAM policy retrieval not yet implemented',
            resourceType,
            resourceId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get IAM policy', error);
    }
  }

  async setIamPolicy(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, policy } = args;

      if (!resourceType || !resourceId || !policy) {
        throw new Error('Missing required parameters: resourceType, resourceId, and policy');
      }

      logger.info(`Setting IAM policy for ${resourceType}: ${resourceId}`);

      // TODO: Implement IAM policy setting using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'IAM policy setting not yet implemented',
            resourceType,
            resourceId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('set IAM policy', error);
    }
  }

  async addIamBinding(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, role, member } = args;

      if (!resourceType || !resourceId || !role || !member) {
        throw new Error('Missing required parameters: resourceType, resourceId, role, and member');
      }

      logger.info(`Adding IAM binding: ${member} to ${role} for ${resourceType}: ${resourceId}`);

      // TODO: Implement IAM binding addition using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'IAM binding addition not yet implemented',
            resourceType,
            resourceId,
            role,
            member,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('add IAM binding', error);
    }
  }

  async removeIamBinding(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, role, member } = args;

      if (!resourceType || !resourceId || !role || !member) {
        throw new Error('Missing required parameters: resourceType, resourceId, role, and member');
      }

      logger.info(
        `Removing IAM binding: ${member} from ${role} for ${resourceType}: ${resourceId}`
      );

      // TODO: Implement IAM binding removal using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'IAM binding removal not yet implemented',
            resourceType,
            resourceId,
            role,
            member,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('remove IAM binding', error);
    }
  }

  async listServiceAccounts(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Listing service accounts for project: ${currentProjectId}`);

      // TODO: Implement service accounts listing using IAM client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Service accounts listing not yet implemented',
            projectId: currentProjectId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list service accounts', error);
    }
  }

  async createServiceAccount(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, accountId, displayName, description } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !accountId) {
        throw new Error('Missing required parameters: accountId');
      }

      logger.info(`Creating service account: ${accountId} in project: ${currentProjectId}`);

      // TODO: Implement service account creation using IAM client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Service account creation not yet implemented',
            projectId: currentProjectId,
            accountId,
            displayName,
            description,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('create service account', error);
    }
  }

  async deleteServiceAccount(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, email } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !email) {
        throw new Error('Missing required parameters: email');
      }

      logger.info(`Deleting service account: ${email} from project: ${currentProjectId}`);

      // TODO: Implement service account deletion using IAM client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Service account deletion not yet implemented',
            projectId: currentProjectId,
            email,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('delete service account', error);
    }
  }

  async listCustomRoles(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { parent } = args;

      if (!parent) {
        throw new Error('Missing required parameter: parent');
      }

      logger.info(`Listing custom roles for parent: ${parent}`);

      // TODO: Implement custom roles listing using IAM client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Custom roles listing not yet implemented',
            parent,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list custom roles', error);
    }
  }

  async createCustomRole(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { parent, roleId, title, description, permissions, stage = 'GA' } = args;

      if (!parent || !roleId || !title || !permissions) {
        throw new Error('Missing required parameters: parent, roleId, title, and permissions');
      }

      logger.info(`Creating custom role: ${roleId} for parent: ${parent}`);

      // TODO: Implement custom role creation using IAM client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Custom role creation not yet implemented',
            parent,
            roleId,
            title,
            description,
            permissions,
            stage,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('create custom role', error);
    }
  }

  // FinOps & Cost Management Handlers
  async getBillingAccount(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId } = args;

      logger.info(
        billingAccountId
          ? `Getting billing account: ${billingAccountId}`
          : 'Listing all billing accounts'
      );

      // TODO: Implement billing account retrieval using Cloud Billing client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Billing account retrieval not yet implemented',
            billingAccountId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get billing account', error);
    }
  }

  async listBillingAccounts(_args: ToolCallArgs): Promise<ToolResponse> {
    try {
      logger.info('Listing all accessible billing accounts');

      // TODO: Implement billing accounts listing using Cloud Billing client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Billing accounts listing not yet implemented',
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list billing accounts', error);
    }
  }

  async setProjectBilling(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !billingAccountId) {
        throw new Error('Missing required parameters: billingAccountId');
      }

      logger.info(`Setting billing account: ${billingAccountId} for project: ${currentProjectId}`);

      // TODO: Implement project billing setting using Cloud Billing client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Project billing setting not yet implemented',
            projectId: currentProjectId,
            billingAccountId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('set project billing', error);
    }
  }

  async getCostBreakdown(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId, startDate, endDate, groupBy } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      logger.info(
        `Getting cost breakdown for project: ${currentProjectId || 'N/A'}, billing account: ${billingAccountId || 'N/A'}`
      );

      // TODO: Implement cost breakdown using Cloud Billing client and BigQuery
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Cost breakdown retrieval not yet implemented',
            projectId: currentProjectId,
            billingAccountId,
            startDate,
            endDate,
            groupBy,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get cost breakdown', error);
    }
  }

  async createBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId, displayName, amount, projectIds, thresholdRules } = args;

      if (!billingAccountId || !displayName || !amount) {
        throw new Error('Missing required parameters: billingAccountId, displayName, and amount');
      }

      logger.info(`Creating budget: ${displayName} for billing account: ${billingAccountId}`);

      // TODO: Implement budget creation using Cloud Billing Budgets client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Budget creation not yet implemented',
            billingAccountId,
            displayName,
            amount,
            projectIds,
            thresholdRules,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('create budget', error);
    }
  }

  async listBudgets(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId } = args;

      if (!billingAccountId) {
        throw new Error('Missing required parameter: billingAccountId');
      }

      logger.info(`Listing budgets for billing account: ${billingAccountId}`);

      // TODO: Implement budgets listing using Cloud Billing Budgets client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Budgets listing not yet implemented',
            billingAccountId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list budgets', error);
    }
  }

  async updateBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { budgetId, displayName, amount, thresholdRules } = args;

      if (!budgetId) {
        throw new Error('Missing required parameter: budgetId');
      }

      logger.info(`Updating budget: ${budgetId}`);

      // TODO: Implement budget update using Cloud Billing Budgets client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Budget update not yet implemented',
            budgetId,
            displayName,
            amount,
            thresholdRules,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('update budget', error);
    }
  }

  async deleteBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { budgetId } = args;

      if (!budgetId) {
        throw new Error('Missing required parameter: budgetId');
      }

      logger.info(`Deleting budget: ${budgetId}`);

      // TODO: Implement budget deletion using Cloud Billing Budgets client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Budget deletion not yet implemented',
            budgetId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('delete budget', error);
    }
  }

  async getCostAnomalies(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId, lookbackDays = 30, anomalyThreshold = 2.0 } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      logger.info(
        `Detecting cost anomalies for project: ${currentProjectId || 'N/A'}, billing account: ${billingAccountId || 'N/A'}`
      );

      // TODO: Implement cost anomaly detection using BigQuery and statistical analysis
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Cost anomaly detection not yet implemented',
            projectId: currentProjectId,
            billingAccountId,
            lookbackDays,
            anomalyThreshold,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get cost anomalies', error);
    }
  }

  async getRightsizingRecommendations(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, resourceType = 'all', region } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(
        `Getting rightsizing recommendations for project: ${currentProjectId}, resource type: ${resourceType}`
      );

      // TODO: Implement rightsizing recommendations using Recommender API
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Rightsizing recommendations not yet implemented',
            projectId: currentProjectId,
            resourceType,
            region,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get rightsizing recommendations', error);
    }
  }

  async exportBillingData(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId, destination, startDate, endDate } = args;

      if (!billingAccountId || !destination) {
        throw new Error('Missing required parameters: billingAccountId and destination');
      }

      logger.info(
        `Exporting billing data for billing account: ${billingAccountId} to ${(destination as { type: string }).type}`
      );

      // TODO: Implement billing data export using Cloud Billing and BigQuery/Cloud Storage
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Billing data export not yet implemented',
            billingAccountId,
            destination,
            startDate,
            endDate,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('export billing data', error);
    }
  }

  // Organization Policy Management Handlers
  async listOrganizationPolicies(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId } = args;

      if (!resourceType || !resourceId) {
        throw new Error('Missing required parameters: resourceType and resourceId');
      }

      logger.info(`Listing organization policies for ${resourceType}: ${resourceId}`);

      // TODO: Implement organization policies listing using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Organization policies listing not yet implemented',
            resourceType,
            resourceId,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('list organization policies', error);
    }
  }

  async getOrganizationPolicy(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, constraint } = args;

      if (!resourceType || !resourceId || !constraint) {
        throw new Error('Missing required parameters: resourceType, resourceId, and constraint');
      }

      logger.info(
        `Getting organization policy for ${resourceType}: ${resourceId}, constraint: ${constraint}`
      );

      // TODO: Implement organization policy retrieval using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Organization policy retrieval not yet implemented',
            resourceType,
            resourceId,
            constraint,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('get organization policy', error);
    }
  }

  async setOrganizationPolicy(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, constraint, policy } = args;

      if (!resourceType || !resourceId || !constraint || !policy) {
        throw new Error(
          'Missing required parameters: resourceType, resourceId, constraint, and policy'
        );
      }

      logger.info(
        `Setting organization policy for ${resourceType}: ${resourceId}, constraint: ${constraint}`
      );

      // TODO: Implement organization policy setting using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Organization policy setting not yet implemented',
            resourceType,
            resourceId,
            constraint,
            policy,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('set organization policy', error);
    }
  }

  async deleteOrganizationPolicy(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { resourceType, resourceId, constraint } = args;

      if (!resourceType || !resourceId || !constraint) {
        throw new Error('Missing required parameters: resourceType, resourceId, and constraint');
      }

      logger.info(
        `Deleting organization policy for ${resourceType}: ${resourceId}, constraint: ${constraint}`
      );

      // TODO: Implement organization policy deletion using Resource Manager client
      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            message: 'Organization policy deletion not yet implemented',
            resourceType,
            resourceId,
            constraint,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleToolError('delete organization policy', error);
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
        const moduleMap: Record<string, unknown> = {
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
