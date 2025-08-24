import { CONFIG, getZonesForRegion } from '../src/config';

describe('Configuration', () => {
  describe('CONFIG object', () => {
    it('should have required properties', () => {
      expect(CONFIG).toBeDefined();
      expect(CONFIG.SERVER).toBeDefined();
      expect(CONFIG.DEFAULTS).toBeDefined();
      expect(CONFIG.REGIONS).toBeDefined();
      expect(CONFIG.PROMPTS).toBeDefined();
    });

    it('should have valid server configuration', () => {
      expect(CONFIG.SERVER.NAME).toBe('gcp-mcp-server');
      expect(CONFIG.SERVER.VERSION).toBeDefined();
      expect(typeof CONFIG.SERVER.VERSION).toBe('string');
    });

    it('should have valid defaults configuration', () => {
      expect(CONFIG.DEFAULTS.REGION).toBe('us-central1');
      expect(CONFIG.DEFAULTS.MAX_RETRIES).toBe(3);
      expect(CONFIG.DEFAULTS.RETRY_DELAY).toBe(1000);
    });

    it('should have regions configuration', () => {
      expect(CONFIG.REGIONS.COMMON_ZONES).toBeDefined();
      expect(CONFIG.REGIONS.FALLBACK_ZONES).toBeDefined();
      expect(Array.isArray(CONFIG.REGIONS.FALLBACK_ZONES)).toBe(true);
    });

    it('should have prompts configuration', () => {
      expect(CONFIG.PROMPTS.CODE_EXECUTION).toBeDefined();
      expect(typeof CONFIG.PROMPTS.CODE_EXECUTION).toBe('string');
      expect(CONFIG.PROMPTS.CODE_EXECUTION.length).toBeGreaterThan(0);
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

    it('should return fallback zones for invalid regions without hyphens', () => {
      const zones = getZonesForRegion('invalid');
      expect(zones).toEqual([...CONFIG.REGIONS.FALLBACK_ZONES]);
    });

    it('should generate zones for unknown regions with hyphens', () => {
      const zones = getZonesForRegion('unknown-region1');
      expect(zones.length).toBe(3);
      expect(zones).toEqual(['unknown-region1-a', 'unknown-region1-b', 'unknown-region1-c']);
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
      expect(getZonesForRegion('')).toEqual([...CONFIG.REGIONS.FALLBACK_ZONES]);
      expect(getZonesForRegion('null')).toEqual([...CONFIG.REGIONS.FALLBACK_ZONES]);
      expect(getZonesForRegion('undefined')).toEqual([...CONFIG.REGIONS.FALLBACK_ZONES]);
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
      expect(getZonesForRegion('US-CENTRAL1')).toEqual([
        'US-CENTRAL1-a',
        'US-CENTRAL1-b',
        'US-CENTRAL1-c',
      ]);
      expect(getZonesForRegion('Us-Central1')).toEqual([
        'Us-Central1-a',
        'Us-Central1-b',
        'Us-Central1-c',
      ]);
    });

    it('should work with less common regions', () => {
      const uncommonRegions = [
        'australia-southeast1',
        'southamerica-east1',
        'northamerica-northeast1',
      ];

      uncommonRegions.forEach(region => {
        const zones = getZonesForRegion(region);
        expect(zones.length).toBeGreaterThan(0);
        zones.forEach(zone => {
          expect(zone).toMatch(new RegExp(`^${region}-[a-z]$`));
        });
      });
    });
  });

  describe('Default settings', () => {
    it('should have sensible default region', () => {
      expect(CONFIG.DEFAULTS.REGION).toBe('us-central1');
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(CONFIG.DEFAULTS.MAX_RETRIES).toBe(3);
      expect(CONFIG.DEFAULTS.RETRY_DELAY).toBe(1000);
    });

    it('should have fallback zones configured', () => {
      expect(CONFIG.REGIONS.FALLBACK_ZONES.length).toBeGreaterThan(0);
      expect(CONFIG.REGIONS.FALLBACK_ZONES).toContain('us-central1-a');
    });
  });
});
