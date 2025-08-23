/**
 * Unit tests for state management utilities
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock state management implementation
interface StateData {
  [key: string]: any;
}

class StateManager {
  private state: StateData = {};
  private listeners: Array<(state: StateData) => void> = [];

  get(key: string): any {
    return this.state[key];
  }

  set(key: string, value: any): void {
    this.state[key] = value;
    this.notifyListeners();
  }

  update(key: string, updater: (current: any) => any): void {
    const current = this.get(key);
    const newValue = updater(current);
    this.set(key, newValue);
  }

  delete(key: string): boolean {
    if (key in this.state) {
      delete this.state[key];
      this.notifyListeners();
      return true;
    }
    return false;
  }

  clear(): void {
    this.state = {};
    this.notifyListeners();
  }

  has(key: string): boolean {
    return key in this.state;
  }

  keys(): string[] {
    return Object.keys(this.state);
  }

  values(): any[] {
    return Object.values(this.state);
  }

  getAll(): StateData {
    return { ...this.state };
  }

  setAll(data: StateData): void {
    this.state = { ...data };
    this.notifyListeners();
  }

  subscribe(listener: (state: StateData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAll()));
  }
}

// Helper to create isolated state for GCP tools
const createGCPToolState = () => {
  const state = new StateManager();

  // Initialize default GCP state
  state.setAll({
    'gcp.auth.status': 'unauthenticated',
    'gcp.project.current': null,
    'gcp.project.list': [],
    'gcp.compute.instances': {},
    'gcp.storage.buckets': {},
    'gcp.bigquery.datasets': {},
    'gcp.config.region': 'us-central1',
    'gcp.config.zone': 'us-central1-a',
  });

  return state;
};

describe('State Management', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      stateManager.set('test-key', 'test-value');
      expect(stateManager.get('test-key')).toBe('test-value');
    });

    it('should return undefined for non-existent keys', () => {
      expect(stateManager.get('non-existent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      stateManager.set('existing-key', 'value');

      expect(stateManager.has('existing-key')).toBe(true);
      expect(stateManager.has('non-existent')).toBe(false);
    });

    it('should delete values', () => {
      stateManager.set('to-delete', 'value');
      expect(stateManager.has('to-delete')).toBe(true);

      const deleted = stateManager.delete('to-delete');
      expect(deleted).toBe(true);
      expect(stateManager.has('to-delete')).toBe(false);
    });

    it('should return false when deleting non-existent key', () => {
      const deleted = stateManager.delete('non-existent');
      expect(deleted).toBe(false);
    });

    it('should clear all state', () => {
      stateManager.set('key1', 'value1');
      stateManager.set('key2', 'value2');

      expect(stateManager.keys().length).toBe(2);

      stateManager.clear();
      expect(stateManager.keys().length).toBe(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should get all keys', () => {
      stateManager.set('key1', 'value1');
      stateManager.set('key2', 'value2');

      const keys = stateManager.keys();
      expect(keys).toEqual(['key1', 'key2']);
    });

    it('should get all values', () => {
      stateManager.set('key1', 'value1');
      stateManager.set('key2', 'value2');

      const values = stateManager.values();
      expect(values).toEqual(['value1', 'value2']);
    });

    it('should get all state as object', () => {
      stateManager.set('key1', 'value1');
      stateManager.set('key2', 'value2');

      const allState = stateManager.getAll();
      expect(allState).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should set all state from object', () => {
      const newState = { key1: 'value1', key2: 'value2' };
      stateManager.setAll(newState);

      expect(stateManager.get('key1')).toBe('value1');
      expect(stateManager.get('key2')).toBe('value2');
    });

    it('should replace existing state when setting all', () => {
      stateManager.set('old-key', 'old-value');

      const newState = { 'new-key': 'new-value' };
      stateManager.setAll(newState);

      expect(stateManager.has('old-key')).toBe(false);
      expect(stateManager.get('new-key')).toBe('new-value');
    });
  });

  describe('Update Operations', () => {
    it('should update existing values with function', () => {
      stateManager.set('counter', 0);

      stateManager.update('counter', current => current + 1);
      expect(stateManager.get('counter')).toBe(1);

      stateManager.update('counter', current => current * 2);
      expect(stateManager.get('counter')).toBe(2);
    });

    it('should handle updating non-existent keys', () => {
      stateManager.update('new-key', current => current || 'default-value');
      expect(stateManager.get('new-key')).toBe('default-value');
    });

    it('should update objects immutably', () => {
      const initialObject = { count: 1, name: 'test' };
      stateManager.set('object', initialObject);

      stateManager.update('object', current => ({
        ...current,
        count: current.count + 1,
      }));

      const updated = stateManager.get('object');
      expect(updated).toEqual({ count: 2, name: 'test' });
      expect(updated).not.toBe(initialObject); // Different reference
    });
  });

  describe('State Subscriptions', () => {
    it('should notify listeners on state changes', () => {
      let notificationCount = 0;
      let lastState: StateData | null = null;

      const unsubscribe = stateManager.subscribe(state => {
        notificationCount++;
        lastState = state;
      });

      stateManager.set('test', 'value');

      expect(notificationCount).toBe(1);
      expect(lastState).toEqual({ test: 'value' });

      unsubscribe();
    });

    it('should allow multiple listeners', () => {
      let listener1Called = false;
      let listener2Called = false;

      const unsubscribe1 = stateManager.subscribe(() => {
        listener1Called = true;
      });
      const unsubscribe2 = stateManager.subscribe(() => {
        listener2Called = true;
      });

      stateManager.set('test', 'value');

      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);

      unsubscribe1();
      unsubscribe2();
    });

    it('should allow unsubscribing', () => {
      let notificationCount = 0;

      const unsubscribe = stateManager.subscribe(() => {
        notificationCount++;
      });

      stateManager.set('test1', 'value1');
      expect(notificationCount).toBe(1);

      unsubscribe();

      stateManager.set('test2', 'value2');
      expect(notificationCount).toBe(1); // No additional notification
    });

    it('should notify on delete operations', () => {
      let notificationCount = 0;

      stateManager.set('test', 'value');

      const unsubscribe = stateManager.subscribe(() => {
        notificationCount++;
      });

      stateManager.delete('test');
      expect(notificationCount).toBe(1);

      unsubscribe();
    });

    it('should notify on clear operations', () => {
      let notificationCount = 0;

      stateManager.set('test', 'value');

      const unsubscribe = stateManager.subscribe(() => {
        notificationCount++;
      });

      stateManager.clear();
      expect(notificationCount).toBe(1);

      unsubscribe();
    });
  });

  describe('GCP Tool State', () => {
    let gcpState: StateManager;

    beforeEach(() => {
      gcpState = createGCPToolState();
    });

    it('should initialize with default GCP state', () => {
      expect(gcpState.get('gcp.auth.status')).toBe('unauthenticated');
      expect(gcpState.get('gcp.project.current')).toBeNull();
      expect(gcpState.get('gcp.project.list')).toEqual([]);
      expect(gcpState.get('gcp.config.region')).toBe('us-central1');
    });

    it('should manage authentication state', () => {
      gcpState.set('gcp.auth.status', 'authenticated');
      gcpState.set('gcp.auth.token', 'access-token-123');

      expect(gcpState.get('gcp.auth.status')).toBe('authenticated');
      expect(gcpState.get('gcp.auth.token')).toBe('access-token-123');
    });

    it('should manage current project', () => {
      const project = {
        projectId: 'my-project-123',
        name: 'My Project',
      };

      gcpState.set('gcp.project.current', project);
      expect(gcpState.get('gcp.project.current')).toEqual(project);
    });

    it('should manage project list', () => {
      const projects = [
        { projectId: 'project-1', name: 'Project 1' },
        { projectId: 'project-2', name: 'Project 2' },
      ];

      gcpState.set('gcp.project.list', projects);
      expect(gcpState.get('gcp.project.list')).toEqual(projects);
    });

    it('should manage compute instances cache', () => {
      gcpState.update('gcp.compute.instances', current => ({
        ...current,
        'us-central1-a': [
          { name: 'instance-1', status: 'RUNNING' },
          { name: 'instance-2', status: 'STOPPED' },
        ],
      }));

      const instances = gcpState.get('gcp.compute.instances');
      expect(instances['us-central1-a']).toHaveLength(2);
    });

    it('should manage storage buckets cache', () => {
      gcpState.update('gcp.storage.buckets', current => ({
        ...current,
        'my-bucket': { name: 'my-bucket', location: 'US' },
      }));

      const buckets = gcpState.get('gcp.storage.buckets');
      expect(buckets['my-bucket'].name).toBe('my-bucket');
    });
  });
});
