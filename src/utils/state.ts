/**
 * Server state management for GCP MCP Server
 */

import { ServerState, GCPCredentials } from '../types';
import { CONFIG } from '../config';
import { logger } from '../utils';

class StateManager {
  private state: ServerState = {
    selectedProject: null,
    selectedProjectCredentials: null,
    selectedRegion: CONFIG.DEFAULTS.REGION,
  };

  getState(): ServerState {
    return { ...this.state };
  }

  getSelectedProject(): string | null {
    return this.state.selectedProject;
  }

  getSelectedRegion(): string {
    return this.state.selectedRegion;
  }

  getSelectedCredentials(): GCPCredentials | null {
    return this.state.selectedProjectCredentials;
  }

  selectProject(projectId: string, credentials?: GCPCredentials | null): void {
    logger.info(`Selecting project: ${projectId}`);
    this.state.selectedProject = projectId;
    this.state.selectedProjectCredentials = credentials || null;
  }

  setRegion(region: string): void {
    logger.info(`Setting region: ${region}`);
    this.state.selectedRegion = region;
  }

  clearSelection(): void {
    logger.info('Clearing project selection');
    this.state.selectedProject = null;
    this.state.selectedProjectCredentials = null;
    this.state.selectedRegion = CONFIG.DEFAULTS.REGION;
  }

  isProjectSelected(): boolean {
    return this.state.selectedProject !== null;
  }
}

export const stateManager = new StateManager();
