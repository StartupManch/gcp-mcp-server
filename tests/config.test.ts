/**
 * Tests for configuration and zone utilities
 */

import { describe, it, expect } from '@jest/globals';
import { CONFIG, getZonesForRegion } from '../src/config';

describe('Configuration', () => {
  describe('CONFIG object', () => {
    it('should have required properties', () => {
      expect(CONFIG).toBeDefined();
      expect(CONFIG.GCP).toBeDefined();
      expect(CONFIG.MCP).toBeDefined();
      expect(CONFIG.REGIONS).toBeDefined();
    });

    it('should have valid GCP configuration', () => {
      expect(CONFIG.GCP.SCOPES).toBeInstanceOf(Array);
      expect(CONFIG.GCP.SCOPES.length).toBeGreaterThan(0);
      expect(CONFIG.GCP.REGIONS).toBeInstanceOf(Array);
      expect(CONFIG.GCP.REGIONS.length).toBeGreaterThan(0);
    });

    it('should have valid MCP configuration', () => {
      expect(CONFIG.MCP.TOOL_TIMEOUT).toBeGreaterThan(0);
      expect(CONFIG.MCP.MAX_RETRIES).toBeGreaterThan(0);
    });

    it('should have regions configuration', () => {
      expect(CONFIG.REGIONS.DEFAULT_REGION).toBeDefined();
      expect(CONFIG.REGIONS.COMMON_ZONES).toBeDefined();
    });
  });

  describe('Zone mappings', () => {
    it('should have zones for major US regions', () => {
      const regions = ['us-central1', 'us-west1', 'us-west2', 'us-east1', 'us-east4'];
      regions.forEach(region => {
        const zones = (CONFIG.REGIONS.COMMON_ZONES as any)[region];
        expect(zones).toBeDefined();
        expect(zones.length).toBeGreaterThan(0);
      });
    });

    it('should have zones for major European regions', () => {
      const regions = ['europe-west1', 'europe-west2', 'europe-west3', 'europe-central2'];
      regions.forEach(region => {
        const zones = (CONFIG.REGIONS.COMMON_ZONES as any)[region];
        expect(zones).toBeDefined();
        expect(zones.length).toBeGreaterThan(0);
      });
    });

    it('should have zones for major Asian regions', () => {
      const regions = ['asia-east1', 'asia-southeast1', 'asia-northeast1', 'asia-south1'];
      regions.forEach(region => {
        const zones = (CONFIG.REGIONS.COMMON_ZONES as any)[region];
        expect(zones).toBeDefined();
        expect(zones.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getZonesForRegion function', () => {
    it('should return zones for valid regions', () => {
      const zones = getZonesForRegion('us-central1');
      expect(zones).toBeInstanceOf(Array);
      expect(zones.length).toBeGreaterThan(0);
      expect(zones).toContain('us-central1-a');
    });

    it('should return empty array for invalid regions', () => {
      const zones = getZonesForRegion('invalid-region');
      expect(zones).toEqual([]);
    });

    it('should return zones for all defined regions', () => {
      const regionKeys = Object.keys(CONFIG.REGIONS.COMMON_ZONES);
      regionKeys.forEach(region => {
        const zones = getZonesForRegion(region);
        expect(zones.length).toBeGreaterThan(0);
      });
    });

    it('should return consistent results', () => {
      const zones1 = getZonesForRegion('us-west1');
      const zones2 = getZonesForRegion('us-west1');
      expect(zones1).toEqual(zones2);
    });

    it('should handle edge cases', () => {
      expect(getZonesForRegion('')).toEqual([]);
      expect(getZonesForRegion('null')).toEqual([]);
      expect(getZonesForRegion('undefined')).toEqual([]);
    });

    it('should work with all major regions', () => {
      const majorRegions = [
        'us-central1',
        'us-west1',
        'us-west2',
        'us-east1',
        'us-east4',
        'europe-west1',
        'europe-west2',
        'europe-west3',
        'europe-central2',
        'asia-east1',
        'asia-southeast1',
        'asia-northeast1',
        'asia-south1',
      ];

      majorRegions.forEach(region => {
        const zones = getZonesForRegion(region);
        expect(zones.length).toBeGreaterThan(0);
        zones.forEach(zone => {
          expect(zone).toMatch(new RegExp(`^${region}-[a-z]$`));
        });
      });
    });

    it('should return correct zone count for known regions', () => {
      expect(getZonesForRegion('us-central1').length).toBe(4); // a, b, c, f
      expect(getZonesForRegion('us-west1').length).toBe(3); // a, b, c
      expect(getZonesForRegion('us-west2').length).toBe(3); // a, b, c
    });

    it('should maintain zone order consistency', () => {
      const zones = getZonesForRegion('us-central1');
      expect(zones[0]).toBe('us-central1-a');
      expect(zones[1]).toBe('us-central1-b');
      expect(zones[2]).toBe('us-central1-c');
      expect(zones[3]).toBe('us-central1-f');
    });

    it('should handle case sensitivity', () => {
      expect(getZonesForRegion('US-CENTRAL1')).toEqual([]);
      expect(getZonesForRegion('Us-Central1')).toEqual([]);
    });

    it('should work with less common regions', () => {
      const uncommonRegions = [
        'australia-southeast1',
        'southamerica-east1',
        'northamerica-northeast1',
      ];

      uncommonRegions.forEach(region => {
        const zones = getZonesForRegion(region);
        if (zones.length > 0) {
          zones.forEach(zone => {
            expect(zone).toMatch(new RegExp(`^${region}-[a-z]$`));
          });
        }
      });
    });
  });

  describe('Default settings', () => {
    it('should have sensible default region', () => {
      expect(CONFIG.REGIONS.DEFAULT_REGION).toBe('us-central1');
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(CONFIG.MCP.TOOL_TIMEOUT).toBe(30000);
      expect(CONFIG.MCP.MAX_RETRIES).toBe(3);
    });

    it('should include required GCP scopes', () => {
      const requiredScopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/compute',
        'https://www.googleapis.com/auth/storage-full',
      ];

      requiredScopes.forEach(scope => {
        expect(CONFIG.GCP.SCOPES).toContain(scope);
      });
    });
  });
});

describe('Configuration', () => {
  describe('CONFIG object', () => {
    it('should have correct server configuration', () => {
      expect(CONFIG.SERVER.NAME).toBe('gcp-mcp-server');
      expect(CONFIG.SERVER.VERSION).toBe('1.0.1');
    });

    it('should have correct default values', () => {
      expect(CONFIG.DEFAULTS.REGION).toBe('us-central1');
      expect(CONFIG.DEFAULTS.MAX_RETRIES).toBe(3);
      expect(CONFIG.DEFAULTS.RETRY_DELAY).toBe(1000);
    });

    it('should have regional zone mappings', () => {
      expect(CONFIG.REGIONS.COMMON_ZONES).toBeDefined();
      expect(Object.keys(CONFIG.REGIONS.COMMON_ZONES).length).toBeGreaterThan(0);
    });

    it('should have us-central1 zones configured correctly', () => {
      expect(CONFIG.REGIONS.COMMON_ZONES['us-central1']).toEqual([
        'us-central1-a',
        'us-central1-b',
        'us-central1-c',
        'us-central1-f',
      ]);
    });

    it('should have fallback zones defined', () => {
      expect(CONFIG.REGIONS.FALLBACK_ZONES).toBeDefined();
      expect(CONFIG.REGIONS.FALLBACK_ZONES.length).toBeGreaterThan(0);
      expect(CONFIG.REGIONS.FALLBACK_ZONES).toContain('us-central1-a');
    });

    it('should have code execution prompt defined', () => {
      expect(CONFIG.PROMPTS.CODE_EXECUTION).toBeDefined();
      expect(typeof CONFIG.PROMPTS.CODE_EXECUTION).toBe('string');
      expect(CONFIG.PROMPTS.CODE_EXECUTION.length).toBeGreaterThan(0);
    });
  });

  describe('getZonesForRegion function', () => {
    it('should return predefined zones for known regions', () => {
      const zones = getZonesForRegion('us-central1');
      expect(zones).toEqual(['us-central1-a', 'us-central1-b', 'us-central1-c', 'us-central1-f']);
    });

    it('should return predefined zones for europe regions', () => {
      const zones = getZonesForRegion('europe-west1');
      expect(zones).toEqual(['europe-west1-b', 'europe-west1-c', 'europe-west1-d']);
    });

    it('should return predefined zones for asia regions', () => {
      const zones = getZonesForRegion('asia-east1');
      expect(zones).toEqual(['asia-east1-a', 'asia-east1-b', 'asia-east1-c']);
    });

    it('should generate zones for unknown regions with hyphens', () => {
      const zones = getZonesForRegion('custom-region-1');
      expect(zones).toEqual(['custom-region-1-a', 'custom-region-1-b', 'custom-region-1-c']);
    });

    it('should return fallback zones for invalid region names', () => {
      const zones = getZonesForRegion('invalid');
      expect(zones).toEqual(CONFIG.REGIONS.FALLBACK_ZONES);
    });

    it('should return fallback zones for empty region', () => {
      const zones = getZonesForRegion('');
      expect(zones).toEqual(CONFIG.REGIONS.FALLBACK_ZONES);
    });

    it('should return a new array (not reference to original)', () => {
      const zones1 = getZonesForRegion('us-central1');
      const zones2 = getZonesForRegion('us-central1');
      expect(zones1).not.toBe(zones2); // Different array instances
      expect(zones1).toEqual(zones2); // Same content
    });

    it('should handle all predefined regions correctly', () => {
      const regionKeys = Object.keys(CONFIG.REGIONS.COMMON_ZONES);

      for (const region of regionKeys) {
        const zones = getZonesForRegion(region);
        expect(zones.length).toBeGreaterThan(0);
        expect(zones.every(zone => zone.startsWith(region))).toBe(true);
      }
    });

    it('should generate consistent zones for unknown regions', () => {
      const region = 'test-region-xyz';
      const zones1 = getZonesForRegion(region);
      const zones2 = getZonesForRegion(region);
      expect(zones1).toEqual(zones2);
      expect(zones1).toEqual(['test-region-xyz-a', 'test-region-xyz-b', 'test-region-xyz-c']);
    });
  });

  describe('Zone Configuration Completeness', () => {
    it('should have zones for major US regions', () => {
      const usRegions = ['us-central1', 'us-west1', 'us-west2', 'us-east1', 'us-east4'];

      for (const region of usRegions) {
        expect(CONFIG.REGIONS.COMMON_ZONES[region]).toBeDefined();
        expect(CONFIG.REGIONS.COMMON_ZONES[region].length).toBeGreaterThan(0);
      }
    });

    it('should have zones for major European regions', () => {
      const euRegions = ['europe-west1', 'europe-west2', 'europe-west3', 'europe-west4'];

      for (const region of euRegions) {
        expect(CONFIG.REGIONS.COMMON_ZONES[region]).toBeDefined();
        expect(CONFIG.REGIONS.COMMON_ZONES[region].length).toBeGreaterThan(0);
      }
    });

    it('should have zones for major Asian regions', () => {
      const asiaRegions = ['asia-east1', 'asia-southeast1', 'asia-south1', 'asia-northeast1'];

      for (const region of asiaRegions) {
        expect(CONFIG.REGIONS.COMMON_ZONES[region]).toBeDefined();
        expect(CONFIG.REGIONS.COMMON_ZONES[region].length).toBeGreaterThan(0);
      }
    });

    it('should ensure all zones follow GCP naming conventions', () => {
      const allZones = Object.values(CONFIG.REGIONS.COMMON_ZONES).flat();

      for (const zone of allZones) {
        // Zone should be in format: region-letter
        expect(zone).toMatch(/^[a-z0-9-]+-[a-z]$/);
      }
    });

    it('should ensure fallback zones are diverse across regions', () => {
      const fallbackZones = CONFIG.REGIONS.FALLBACK_ZONES;
      const regions = new Set(fallbackZones.map(zone => zone.split('-').slice(0, -1).join('-')));

      // Should have zones from multiple regions for redundancy
      expect(regions.size).toBeGreaterThan(2);
    });
  });
});
