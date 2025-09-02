/**
 * Billing and FinOps Tool Handlers
 */

import { CloudBillingClient } from '@google-cloud/billing';
import { BudgetServiceClient } from '@google-cloud/billing-budgets';
import { BigQuery } from '@google-cloud/bigquery';

import { ToolCallArgs, ToolResponse, createTextResponse } from '../../types';
import { logger, withRetry, stateManager } from '../../utils';
import { CONFIG } from '../../config';
import { BaseResourceHandler } from '../base';

export class BillingHandlers extends BaseResourceHandler {
  protected readonly resourceName = 'billing';

  /**
   * Get billing information for a project
   */
  async getBillingInfo(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Getting billing info for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const client = new CloudBillingClient();
        const [billingInfo] = await client.getProjectBillingInfo({
          name: `projects/${currentProjectId}`,
        });

        if (!billingInfo.billingAccountName) {
          return {
            billingEnabled: false,
            message: 'No billing account associated with this project',
          };
        }

        // Get billing account details
        const [billingAccount] = await client.getBillingAccount({
          name: billingInfo.billingAccountName,
        });

        return {
          billingEnabled: billingInfo.billingEnabled,
          billingAccountName: billingInfo.billingAccountName,
          billingAccount: {
            name: billingAccount.name,
            displayName: billingAccount.displayName,
            open: billingAccount.open,
            masterBillingAccount: billingAccount.masterBillingAccount,
          },
        };
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Billing info retrieved for project: ${currentProjectId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            billingInfo: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get billing info', error);
    }
  }

  /**
   * Get cost forecast for a project
   */
  async getCostForecast(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, months = 3 } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId) {
        throw new Error('No project selected. Please select a project first.');
      }

      logger.info(`Getting cost forecast for project: ${currentProjectId} for ${months} months`);

      // For now, return a placeholder response as cost forecasting requires
      // complex calculations using BigQuery and historical billing data
      const result = {
        message: 'Cost forecasting requires setup of billing export to BigQuery',
        recommendations: [
          'Enable billing export to BigQuery',
          'Set up Cloud Billing Reports API',
          'Use Cloud Cost Management tools for detailed forecasting',
        ],
      };

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            forecastPeriodMonths: months,
            forecast: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get cost forecast', error);
    }
  }

  /**
   * Get billing account information
   */
  async getBillingAccount(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId } = args;

      logger.info(
        billingAccountId
          ? `Getting billing account: ${billingAccountId}`
          : 'Listing all billing accounts'
      );

      const result = await withRetry(async () => {
        const client = new CloudBillingClient();

        if (billingAccountId) {
          const [billingAccount] = await client.getBillingAccount({
            name: `billingAccounts/${billingAccountId}`,
          });
          return billingAccount;
        } else {
          const [billingAccounts] = await client.listBillingAccounts({});
          return billingAccounts;
        }
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            billingAccount: billingAccountId ? result : undefined,
            billingAccounts: !billingAccountId ? result : undefined,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get billing account', error);
    }
  }

  /**
   * List all accessible billing accounts
   */
  async listBillingAccounts(_args: ToolCallArgs): Promise<ToolResponse> {
    try {
      logger.info('Listing all accessible billing accounts');

      const result = await withRetry(async () => {
        const client = new CloudBillingClient();
        const [billingAccounts] = await client.listBillingAccounts({});

        return billingAccounts.map(account => ({
          name: account.name,
          displayName: account.displayName,
          open: account.open,
          masterBillingAccount: account.masterBillingAccount,
        }));
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Found ${result.length} billing accounts`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            billingAccounts: result,
            count: result.length,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('list billing accounts', error);
    }
  }

  /**
   * Set billing account for a project
   */
  async setProjectBilling(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      if (!currentProjectId || !billingAccountId) {
        throw new Error('Missing required parameters: billingAccountId');
      }

      logger.info(`Setting billing account: ${billingAccountId} for project: ${currentProjectId}`);

      const result = await withRetry(async () => {
        const client = new CloudBillingClient();
        const [response] = await client.updateProjectBillingInfo({
          name: `projects/${currentProjectId}`,
          projectBillingInfo: {
            billingAccountName: `billingAccounts/${billingAccountId}`,
          },
        });
        return response;
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Billing account set successfully for project: ${currentProjectId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            billingAccountId,
            billingInfo: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('set project billing', error);
    }
  }

  /**
   * Get detailed cost breakdown
   */
  async getCostBreakdown(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId, startDate, endDate, groupBy } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      logger.info(
        `Getting cost breakdown for project: ${currentProjectId || 'N/A'}, billing account: ${billingAccountId || 'N/A'}`
      );

      // This would require BigQuery setup with billing export
      const result = {
        message: 'Cost breakdown requires billing export to BigQuery to be enabled',
        instructions: [
          '1. Enable billing export to BigQuery in Cloud Console',
          '2. Wait for data to be exported (can take 24-48 hours)',
          '3. Use BigQuery queries to analyze cost data',
        ],
        sampleQuery: `
          SELECT
            service.description as service_name,
            location.location as location,
            SUM(cost) as total_cost,
            currency
          FROM \`[PROJECT_ID].[DATASET].[TABLE]\`
          WHERE _PARTITIONTIME >= TIMESTAMP('${startDate || 'YYYY-MM-DD'}')
            AND _PARTITIONTIME < TIMESTAMP('${endDate || 'YYYY-MM-DD'}')
          GROUP BY service_name, location, currency
          ORDER BY total_cost DESC
        `,
      };

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            projectId: currentProjectId,
            billingAccountId,
            startDate,
            endDate,
            groupBy,
            costBreakdown: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get cost breakdown', error);
    }
  }

  /**
   * Create a budget
   */
  async createBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId, displayName, amount, projectIds, thresholdRules } = args;

      if (!billingAccountId || !displayName || !amount) {
        throw new Error('Missing required parameters: billingAccountId, displayName, and amount');
      }

      logger.info(`Creating budget: ${displayName} for billing account: ${billingAccountId}`);

      const result = await withRetry(async () => {
        const client = new BudgetServiceClient();

        const budget = {
          displayName: displayName as string,
          budgetFilter: {
            projects: (projectIds as string[])?.map((id: string) => `projects/${id}`) || [],
          },
          amount: {
            specifiedAmount: {
              currencyCode: 'USD', // This should be configurable
              units: (amount as number).toString(),
            },
          },
          thresholdRules: (
            thresholdRules as Array<{ thresholdPercent: number; spendBasis?: string }>
          )?.map(rule => ({
            thresholdPercent: rule.thresholdPercent,
            spendBasis: (rule.spendBasis || 'CURRENT_SPEND') as
              | 'CURRENT_SPEND'
              | 'FORECASTED_SPEND',
          })) || [
            { thresholdPercent: 0.8, spendBasis: 'CURRENT_SPEND' as 'CURRENT_SPEND' },
            { thresholdPercent: 1.0, spendBasis: 'CURRENT_SPEND' as 'CURRENT_SPEND' },
          ],
        };

        const [response] = await client.createBudget({
          parent: `billingAccounts/${billingAccountId}`,
          budget,
        });

        return response;
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Budget created successfully: ${result.name}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            billingAccountId,
            budget: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('create budget', error);
    }
  }

  /**
   * List budgets for a billing account
   */
  async listBudgets(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId } = args;

      if (!billingAccountId) {
        throw new Error('Missing required parameter: billingAccountId');
      }

      logger.info(`Listing budgets for billing account: ${billingAccountId}`);

      const result = await withRetry(async () => {
        const client = new BudgetServiceClient();
        const [budgets] = await client.listBudgets({
          parent: `billingAccounts/${billingAccountId}`,
        });

        return budgets.map(budget => ({
          name: budget.name,
          displayName: budget.displayName,
          amount: budget.amount,
          budgetFilter: budget.budgetFilter,
          thresholdRules: budget.thresholdRules,
          etag: budget.etag,
        }));
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Found ${result.length} budgets`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            billingAccountId,
            budgets: result,
            count: result.length,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('list budgets', error);
    }
  }

  /**
   * Update an existing budget
   */
  async updateBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { budgetId, displayName, amount, thresholdRules } = args;

      if (!budgetId) {
        throw new Error('Missing required parameter: budgetId');
      }

      logger.info(`Updating budget: ${budgetId}`);

      const result = await withRetry(async () => {
        const client = new BudgetServiceClient();

        // First get the existing budget
        const [existingBudget] = await client.getBudget({ name: budgetId as string });

        // Update the budget with new values
        const updatedBudget = {
          ...existingBudget,
          displayName: (displayName as string) || existingBudget.displayName,
          amount: (amount as number)
            ? {
                specifiedAmount: {
                  currencyCode: 'USD',
                  units: (amount as number).toString(),
                },
              }
            : existingBudget.amount,
          thresholdRules:
            (thresholdRules as Array<{ thresholdPercent: number; spendBasis?: string }>)?.map(
              rule => ({
                thresholdPercent: rule.thresholdPercent,
                spendBasis: (rule.spendBasis || 'CURRENT_SPEND') as
                  | 'CURRENT_SPEND'
                  | 'FORECASTED_SPEND',
              })
            ) || existingBudget.thresholdRules,
        };

        const [response] = await client.updateBudget({
          budget: updatedBudget,
        });

        return response;
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Budget updated successfully: ${budgetId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            budgetId,
            budget: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('update budget', error);
    }
  }

  /**
   * Delete a budget
   */
  async deleteBudget(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { budgetId } = args;

      if (!budgetId) {
        throw new Error('Missing required parameter: budgetId');
      }

      logger.info(`Deleting budget: ${budgetId}`);

      await withRetry(async () => {
        const client = new BudgetServiceClient();
        await client.deleteBudget({ name: budgetId as string });
      }, CONFIG.DEFAULTS.MAX_RETRIES);

      logger.info(`Budget deleted successfully: ${budgetId}`);

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            budgetId,
            message: 'Budget deleted successfully',
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('delete budget', error);
    }
  }

  /**
   * Detect cost anomalies
   */
  async getCostAnomalies(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { projectId, billingAccountId, lookbackDays = 30, anomalyThreshold = 2.0 } = args;
      const currentProjectId = projectId || stateManager.getSelectedProject();

      logger.info(
        `Detecting cost anomalies for project: ${currentProjectId || 'N/A'}, billing account: ${billingAccountId || 'N/A'}`
      );

      // This would require historical billing data analysis
      const result = {
        message: 'Cost anomaly detection requires historical billing data in BigQuery',
        instructions: [
          '1. Enable billing export to BigQuery',
          '2. Collect at least 30 days of historical data',
          '3. Implement statistical analysis on daily costs',
          '4. Set up alerting based on anomaly detection',
        ],
        parameters: {
          lookbackDays,
          anomalyThreshold,
          projectId: currentProjectId,
          billingAccountId,
        },
      };

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            anomalies: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get cost anomalies', error);
    }
  }

  /**
   * Get rightsizing recommendations
   */
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

      // This would use the Recommender API
      const result = {
        message: 'Rightsizing recommendations require the Recommender API',
        instructions: [
          '1. Enable the Recommender API',
          '2. Grant appropriate IAM permissions',
          '3. Use the Cloud Asset Inventory for resource analysis',
          '4. Implement custom rightsizing logic based on usage metrics',
        ],
        parameters: {
          projectId: currentProjectId,
          resourceType,
          region,
        },
      };

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            recommendations: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('get rightsizing recommendations', error);
    }
  }

  /**
   * Export billing data
   */
  async exportBillingData(args: ToolCallArgs): Promise<ToolResponse> {
    try {
      const { billingAccountId, destination, startDate, endDate } = args;

      if (!billingAccountId || !destination) {
        throw new Error('Missing required parameters: billingAccountId and destination');
      }

      logger.info(
        `Exporting billing data for billing account: ${billingAccountId} to ${(destination as { type: string }).type}`
      );

      // This would implement actual export logic
      const result = {
        message: 'Billing data export setup instructions',
        instructions: [
          '1. Set up billing export in Cloud Console',
          '2. Configure destination (BigQuery or Cloud Storage)',
          '3. Wait for initial data export (24-48 hours)',
          '4. Use the exported data for analysis',
        ],
        parameters: {
          billingAccountId,
          destination,
          startDate,
          endDate,
        },
      };

      return createTextResponse(
        JSON.stringify(
          {
            success: true,
            export: result,
          },
          null,
          2
        )
      );
    } catch (error) {
      return this.handleError('export billing data', error);
    }
  }
}
