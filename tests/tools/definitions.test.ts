const { gcpTools } = require('../../src/tools/definitions');

describe('Tool Definitions', () => {
  describe('Tool structure', () => {
    it('should export tool definitions', () => {
      expect(gcpTools).toBeDefined();
      expect(Array.isArray(gcpTools)).toBe(true);
    });

    it('should have expected number of tools', () => {
      expect(gcpTools.length).toBeGreaterThan(20);
    });

    it('should have valid tool definitions', () => {
      gcpTools.forEach((tool: any) => {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      });
    });

    it('should have BigQuery tools', () => {
      const bigQueryTools = gcpTools.filter((tool: any) => tool.name.includes('bigquery'));
      expect(bigQueryTools.length).toBeGreaterThan(0);

      // Check specific BigQuery tools
      const toolNames = bigQueryTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-bigquery-datasets');
      expect(toolNames).toContain('list-bigquery-tables');
      expect(toolNames).toContain('query-bigquery');
    });

    it('should have Compute Engine tools', () => {
      const computeTools = gcpTools.filter((tool: any) => tool.name.includes('compute'));
      expect(computeTools.length).toBeGreaterThan(0);

      // Check specific compute tools
      const toolNames = computeTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-compute-instances');
      expect(toolNames).toContain('get-compute-instance');
      expect(toolNames).toContain('start-compute-instance');
      expect(toolNames).toContain('stop-compute-instance');
    });

    it('should have Cloud Storage tools', () => {
      const storageTools = gcpTools.filter((tool: any) => tool.name.includes('storage'));
      expect(storageTools.length).toBeGreaterThan(0);

      // Check specific storage tools
      const toolNames = storageTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-storage-buckets');
      expect(toolNames).toContain('list-storage-objects');
      expect(toolNames).toContain('get-storage-object-info');
    });

    it('should have Project management tools', () => {
      const projectTools = gcpTools.filter((tool: any) => tool.name.includes('project'));
      expect(projectTools.length).toBeGreaterThan(0);

      // Check specific project tools
      const toolNames = projectTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-projects');
      expect(toolNames).toContain('select-project');
    });

    it('should have Cloud Functions tools', () => {
      const functionTools = gcpTools.filter((tool: any) => tool.name.includes('function'));
      expect(functionTools.length).toBeGreaterThan(0);

      // Check specific function tools
      const toolNames = functionTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-cloud-functions');
      expect(toolNames).toContain('get-cloud-function');
    });

    it('should have Cloud Run tools', () => {
      const runTools = gcpTools.filter((tool: any) => tool.name.includes('run'));
      expect(runTools.length).toBeGreaterThan(0);

      // Check specific run tools
      const toolNames = runTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-cloud-run-services');
      expect(toolNames).toContain('get-cloud-run-service');
    });

    it('should have Kubernetes Engine tools', () => {
      const gkeTools = gcpTools.filter((tool: any) => tool.name.includes('gke'));
      expect(gkeTools.length).toBeGreaterThan(0);

      // Check specific GKE tools
      const toolNames = gkeTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-gke-clusters');
      expect(toolNames).toContain('get-gke-cluster');
    });

    it('should have Cloud SQL tools', () => {
      const sqlTools = gcpTools.filter((tool: any) => tool.name.includes('sql'));
      expect(sqlTools.length).toBeGreaterThan(0);

      // Check specific SQL tools
      const toolNames = sqlTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-sql-instances');
      expect(toolNames).toContain('get-sql-instance');
    });

    it('should have Cloud Logging tools', () => {
      const loggingTools = gcpTools.filter((tool: any) => tool.name.includes('log'));
      expect(loggingTools.length).toBeGreaterThan(0);

      // Check specific logging tools
      const toolNames = loggingTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list-log-entries');
      expect(toolNames).toContain('query-logs');
    });

    it('should have billing and cost tools', () => {
      const billingTools = gcpTools.filter(
        (tool: any) => tool.name.includes('billing') || tool.name.includes('cost')
      );
      expect(billingTools.length).toBeGreaterThan(0);

      // Check specific billing tools
      const toolNames = billingTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('get-billing-info');
      expect(toolNames).toContain('get-cost-forecast');
    });

    it('should have core GCP code execution tool', () => {
      const codeTools = gcpTools.filter((tool: any) => tool.name.includes('gcp-code'));
      expect(codeTools.length).toBeGreaterThan(0);

      // Check specific code execution tool
      const toolNames = codeTools.map((tool: any) => tool.name);
      expect(toolNames).toContain('run-gcp-code');
    });
  });

  describe('Tool validation', () => {
    it('should have unique tool names', () => {
      const names = gcpTools.map((tool: any) => tool.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have required properties for each tool', () => {
      gcpTools.forEach((tool: any) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema).toHaveProperty('properties');
      });
    });

    it('should have valid input schemas', () => {
      gcpTools.forEach((tool: any) => {
        const schema = tool.inputSchema;
        expect(schema.type).toBe('object');

        if (schema.properties) {
          Object.values(schema.properties).forEach((prop: any) => {
            expect(prop).toHaveProperty('type');
          });
        }
      });
    });

    it('should have meaningful descriptions', () => {
      gcpTools.forEach((tool: any) => {
        expect(tool.description.length).toBeGreaterThan(10);
        expect(tool.name.length).toBeGreaterThan(3);
      });
    });

    it('should have consistent naming convention', () => {
      gcpTools.forEach((tool: any) => {
        // Tool names should be kebab-case and descriptive
        expect(tool.name).toMatch(/^[a-z][a-z0-9-]*$/);
        expect(tool.name).not.toMatch(/^-|-$/); // No leading/trailing hyphens
      });
    });

    it('should have required fields in input schemas', () => {
      gcpTools.forEach((tool: any) => {
        const schema = tool.inputSchema;
        expect(schema).toHaveProperty('type');
        expect(schema).toHaveProperty('properties');

        // Some tools don't require projectId (like storage tools that work with bucket names directly)
        // and some tools like list-projects and run-gcp-code handle projects differently
        const toolsWithoutProjectId = [
          'list-projects',
          'run-gcp-code',
          'list-storage-objects',
          'get-storage-object-info',
        ];

        if (!toolsWithoutProjectId.includes(tool.name)) {
          expect(schema.properties).toHaveProperty('projectId');
        }
      });
    });
    it('should have proper descriptions for schema properties', () => {
      gcpTools.forEach((tool: any) => {
        const properties = tool.inputSchema.properties;
        Object.values(properties).forEach((prop: any) => {
          if (prop.description) {
            expect(typeof prop.description).toBe('string');
            expect(prop.description.length).toBeGreaterThan(5);
          }
        });
      });
    });
  });

  describe('Specific tool validation', () => {
    it('should have run-gcp-code with proper schema', () => {
      const gcpCodeTool = gcpTools.find((tool: any) => tool.name === 'run-gcp-code');
      expect(gcpCodeTool).toBeDefined();
      expect(gcpCodeTool.inputSchema.properties).toHaveProperty('code');
      expect(gcpCodeTool.inputSchema.properties).toHaveProperty('reasoning');
      expect(gcpCodeTool.inputSchema.properties).toHaveProperty('projectId');
      expect(gcpCodeTool.inputSchema.properties).toHaveProperty('region');
    });

    it('should have compute tools with proper schemas', () => {
      const startTool = gcpTools.find((tool: any) => tool.name === 'start-compute-instance');
      expect(startTool).toBeDefined();
      expect(startTool.inputSchema.properties).toHaveProperty('projectId');
      expect(startTool.inputSchema.properties).toHaveProperty('zone');
      expect(startTool.inputSchema.properties).toHaveProperty('instanceName');
    });

    it('should have BigQuery tools with proper schemas', () => {
      const queryTool = gcpTools.find((tool: any) => tool.name === 'query-bigquery');
      expect(queryTool).toBeDefined();
      expect(queryTool.inputSchema.properties).toHaveProperty('projectId');
      expect(queryTool.inputSchema.properties).toHaveProperty('query');
    });

    it('should have storage tools with proper schemas', () => {
      const listObjectsTool = gcpTools.find((tool: any) => tool.name === 'list-storage-objects');
      expect(listObjectsTool).toBeDefined();
      expect(listObjectsTool.inputSchema.properties).toHaveProperty('bucketName');

      const listBucketsTool = gcpTools.find((tool: any) => tool.name === 'list-storage-buckets');
      expect(listBucketsTool).toBeDefined();
      expect(listBucketsTool.inputSchema.properties).toHaveProperty('projectId');
    });
  });
});
