# API Reference

## Overview

The GCP MCP Server exposes 25 tools across 8 major Google Cloud Platform service categories. All tools follow the Model Context Protocol (MCP) specification and return structured JSON responses.

## Tool Categories

### 🔧 Core Management Tools

#### `run-gcp-code`

Execute custom TypeScript code against Google Cloud APIs in a sandboxed environment.

**Parameters:**

```typescript
interface RunGCPCodeArgs {
  reasoning: string; // Explanation of what the code does
  code: string; // TypeScript code to execute
  projectId?: string; // GCP project ID (optional, uses selected project)
  region?: string; // GCP region (optional, uses selected region)
}
```

**Response:**

```typescript
interface CodeExecutionResult {
  success: boolean;
  result?: any; // Execution result
  error?: string; // Error message if execution failed
  logs?: string[]; // Execution logs
  executionTime?: number; // Execution time in milliseconds
}
```

**Example:**

```json
{
  "name": "run-gcp-code",
  "arguments": {
    "reasoning": "List all compute instances to check current infrastructure",
    "code": "const compute = new (require('@google-cloud/compute')).InstancesClient(); return await compute.aggregatedList({ project: projectId });"
  }
}
```

#### `list-projects`

List all GCP projects accessible with current credentials.

**Parameters:** None

**Response:**

```typescript
interface ProjectsResult {
  success: boolean;
  projects: Array<{
    projectId: string;
    name: string;
    projectNumber: string;
    lifecycleState: string;
    parent?: string;
  }>;
  totalCount: number;
}
```

#### `select-project`

Select a GCP project for subsequent operations.

**Parameters:**

```typescript
interface SelectProjectArgs {
  projectId: string; // GCP project ID to select
  region?: string; // Default region for operations (default: us-central1)
}
```

**Response:**

```typescript
interface SelectProjectResult {
  success: boolean;
  selectedProject: string;
  selectedRegion: string;
  message: string;
}
```

#### `get-billing-info`

Get billing information for a project.

**Parameters:**

```typescript
interface BillingInfoArgs {
  projectId?: string; // Project ID (optional, uses selected project)
}
```

**Response:**

```typescript
interface BillingInfoResult {
  success: boolean;
  billingAccount?: string;
  billingEnabled: boolean;
  budgets?: Array<{
    name: string;
    amount: number;
    currency: string;
    spent: number;
    remaining: number;
  }>;
}
```

#### `get-cost-forecast`

Get cost forecasting data for a project.

**Parameters:**

```typescript
interface CostForecastArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  months?: number; // Number of months to forecast (default: 3)
}
```

**Response:**

```typescript
interface CostForecastResult {
  success: boolean;
  forecast: Array<{
    month: string;
    estimatedCost: number;
    currency: string;
    confidence: number;
  }>;
  currentSpend: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}
```

### 💻 Compute Engine Tools

#### `list-compute-instances`

List virtual machine instances.

**Parameters:**

```typescript
interface ListInstancesArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone?: string; // Specific zone (optional, lists all zones if not provided)
  filter?: string; // Filter expression (optional)
}
```

**Response:**

```typescript
interface InstancesResult {
  success: boolean;
  instances: Array<{
    id: string;
    name: string;
    zone: string;
    machineType: string;
    status: string;
    internalIP?: string;
    externalIP?: string;
    disks: Array<{
      name: string;
      size: number;
      type: string;
    }>;
    labels?: Record<string, string>;
    creationTimestamp: string;
  }>;
  totalCount: number;
}
```

#### `get-compute-instance`

Get detailed information about a specific VM instance.

**Parameters:**

```typescript
interface GetInstanceArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone: string; // Zone where instance is located
  instanceName: string; // Name of the instance
}
```

**Response:**

```typescript
interface InstanceDetailsResult {
  success: boolean;
  instance: {
    id: string;
    name: string;
    zone: string;
    machineType: string;
    status: string;
    statusMessage?: string;
    networkInterfaces: Array<{
      name: string;
      internalIP: string;
      externalIP?: string;
      subnetwork: string;
    }>;
    disks: Array<{
      name: string;
      size: number;
      type: string;
      boot: boolean;
      autoDelete: boolean;
    }>;
    metadata: Record<string, string>;
    labels: Record<string, string>;
    tags: string[];
    serviceAccounts: Array<{
      email: string;
      scopes: string[];
    }>;
    creationTimestamp: string;
    lastStartTimestamp?: string;
    lastStopTimestamp?: string;
  };
}
```

#### `start-compute-instance`

Start a stopped VM instance.

**Parameters:**

```typescript
interface StartInstanceArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone: string; // Zone where instance is located
  instanceName: string; // Name of the instance
}
```

**Response:**

```typescript
interface InstanceOperationResult {
  success: boolean;
  operationId: string;
  status: string;
  message: string;
}
```

#### `stop-compute-instance`

Stop a running VM instance.

**Parameters:**

```typescript
interface StopInstanceArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone: string; // Zone where instance is located
  instanceName: string; // Name of the instance
}
```

**Response:**

```typescript
interface InstanceOperationResult {
  success: boolean;
  operationId: string;
  status: string;
  message: string;
}
```

### 🗄️ Cloud Storage Tools

#### `list-storage-buckets`

List all Cloud Storage buckets in a project.

**Parameters:**

```typescript
interface ListBucketsArgs {
  projectId?: string; // Project ID (optional, uses selected project)
}
```

**Response:**

```typescript
interface BucketsResult {
  success: boolean;
  buckets: Array<{
    name: string;
    location: string;
    storageClass: string;
    created: string;
    updated: string;
    size?: number; // Size in bytes
    objectCount?: number; // Number of objects
    encryption?: {
      type: string;
      keyName?: string;
    };
    lifecycle?: Array<{
      action: string;
      condition: any;
    }>;
    versioning: boolean;
    labels: Record<string, string>;
  }>;
  totalCount: number;
}
```

#### `list-storage-objects`

List objects in a specific storage bucket.

**Parameters:**

```typescript
interface ListObjectsArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  bucketName: string; // Name of the bucket
  prefix?: string; // Object name prefix filter (optional)
  maxResults?: number; // Maximum number of results (default: 100)
}
```

**Response:**

```typescript
interface ObjectsResult {
  success: boolean;
  objects: Array<{
    name: string;
    bucket: string;
    size: number;
    contentType: string;
    created: string;
    updated: string;
    etag: string;
    md5Hash: string;
    crc32c: string;
    storageClass: string;
    metadata?: Record<string, string>;
  }>;
  totalCount: number;
  nextPageToken?: string;
}
```

#### `get-storage-object-info`

Get detailed metadata for a specific storage object.

**Parameters:**

```typescript
interface GetObjectInfoArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  bucketName: string; // Name of the bucket
  objectName: string; // Name of the object
}
```

**Response:**

```typescript
interface ObjectInfoResult {
  success: boolean;
  object: {
    name: string;
    bucket: string;
    size: number;
    contentType: string;
    contentEncoding?: string;
    contentLanguage?: string;
    cacheControl?: string;
    contentDisposition?: string;
    created: string;
    updated: string;
    etag: string;
    generation: string;
    md5Hash: string;
    crc32c: string;
    storageClass: string;
    metadata: Record<string, string>;
    acl?: Array<{
      entity: string;
      role: string;
      email?: string;
    }>;
  };
}
```

### 📊 BigQuery Tools

#### `list-bigquery-datasets`

List all BigQuery datasets in a project.

**Parameters:**

```typescript
interface ListDatasetsArgs {
  projectId?: string; // Project ID (optional, uses selected project)
}
```

**Response:**

```typescript
interface DatasetsResult {
  success: boolean;
  datasets: Array<{
    id: string;
    friendlyName?: string;
    description?: string;
    location: string;
    created: string;
    lastModified: string;
    defaultTableExpiration?: number;
    defaultPartitionExpiration?: number;
    labels: Record<string, string>;
    access: Array<{
      role: string;
      userByEmail?: string;
      groupByEmail?: string;
      domain?: string;
    }>;
  }>;
  totalCount: number;
}
```

#### `list-bigquery-tables`

List tables in a BigQuery dataset.

**Parameters:**

```typescript
interface ListTablesArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  datasetId: string; // Dataset ID
}
```

**Response:**

```typescript
interface TablesResult {
  success: boolean;
  tables: Array<{
    id: string;
    friendlyName?: string;
    description?: string;
    type: 'TABLE' | 'VIEW' | 'EXTERNAL' | 'MATERIALIZED_VIEW';
    created: string;
    lastModified: string;
    numRows?: number;
    numBytes?: number;
    expirationTime?: string;
    labels: Record<string, string>;
    schema: Array<{
      name: string;
      type: string;
      mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED';
      description?: string;
    }>;
  }>;
  totalCount: number;
}
```

#### `query-bigquery`

Execute a SQL query on BigQuery.

**Parameters:**

```typescript
interface QueryBigQueryArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  query: string; // SQL query to execute
  maxResults?: number; // Maximum number of results (default: 1000)
  dryRun?: boolean; // Whether to perform a dry run (default: false)
}
```

**Response:**

```typescript
interface QueryResult {
  success: boolean;
  jobId?: string;
  totalRows?: number;
  totalBytesProcessed?: number;
  cacheHit?: boolean;
  errors?: Array<{
    message: string;
    location?: string;
    reason?: string;
  }>;
  schema?: Array<{
    name: string;
    type: string;
    mode: string;
  }>;
  rows?: Array<Record<string, any>>;
  dryRun?: boolean;
}
```

### 🗃️ Cloud SQL Tools

#### `list-sql-instances`

List all Cloud SQL instances in a project.

**Parameters:**

```typescript
interface ListSQLInstancesArgs {
  projectId?: string; // Project ID (optional, uses selected project)
}
```

**Response:**

```typescript
interface SQLInstancesResult {
  success: boolean;
  instances: Array<{
    name: string;
    databaseVersion: string;
    region: string;
    state: string;
    connectionName: string;
    ipAddresses: Array<{
      type: 'PRIMARY' | 'OUTGOING' | 'PRIVATE';
      ipAddress: string;
    }>;
    settings: {
      tier: string;
      diskSize: number;
      diskType: string;
      backupConfiguration: {
        enabled: boolean;
        startTime?: string;
        retainedBackups?: number;
      };
      maintenanceWindow?: {
        day: number;
        hour: number;
      };
    };
    created: string;
    masterInstanceName?: string;
    replicas?: string[];
  }>;
  totalCount: number;
}
```

#### `get-sql-instance`

Get detailed information about a Cloud SQL instance.

**Parameters:**

```typescript
interface GetSQLInstanceArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  instanceId: string; // Instance ID
}
```

**Response:**

```typescript
interface SQLInstanceDetailsResult {
  success: boolean;
  instance: {
    name: string;
    databaseVersion: string;
    region: string;
    state: string;
    connectionName: string;
    ipAddresses: Array<{
      type: string;
      ipAddress: string;
    }>;
    serverCaCert: {
      cert: string;
      commonName: string;
      createTime: string;
      expirationTime: string;
      sha1Fingerprint: string;
    };
    settings: {
      tier: string;
      diskSize: number;
      diskType: string;
      diskAutoResize: boolean;
      dataDiskSizeGb: number;
      storageAutoResizeLimit: number;
      backupConfiguration: {
        enabled: boolean;
        startTime?: string;
        retainedBackups?: number;
        transactionLogRetentionDays?: number;
      };
      ipConfiguration: {
        authorizedNetworks: Array<{
          value: string;
          name?: string;
        }>;
        ipv4Enabled: boolean;
        requireSsl?: boolean;
      };
      maintenanceWindow?: {
        day: number;
        hour: number;
        updateTrack: string;
      };
    };
    created: string;
    etag: string;
    masterInstanceName?: string;
    replicas?: string[];
  };
}
```

### ⚡ Cloud Functions Tools

#### `list-cloud-functions`

List all Cloud Functions in a project.

**Parameters:**

```typescript
interface ListFunctionsArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  region?: string; // Specific region (optional, lists all regions if not provided)
}
```

**Response:**

```typescript
interface FunctionsResult {
  success: boolean;
  functions: Array<{
    name: string;
    description?: string;
    status: string;
    entryPoint: string;
    runtime: string;
    timeout: string;
    availableMemoryMb: number;
    maxInstances?: number;
    vpcConnector?: string;
    httpsTrigger?: {
      url: string;
    };
    eventTrigger?: {
      eventType: string;
      resource: string;
    };
    environmentVariables?: Record<string, string>;
    labels: Record<string, string>;
    sourceArchiveUrl?: string;
    sourceRepository?: {
      url: string;
      deployedUrl: string;
    };
    updateTime: string;
    versionId: string;
  }>;
  totalCount: number;
}
```

#### `get-cloud-function`

Get detailed information about a specific Cloud Function.

**Parameters:**

```typescript
interface GetFunctionArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  region: string; // Region where function is located
  functionName: string; // Name of the function
}
```

**Response:**

```typescript
interface FunctionDetailsResult {
  success: boolean;
  function: {
    name: string;
    description?: string;
    status: string;
    entryPoint: string;
    runtime: string;
    timeout: string;
    availableMemoryMb: number;
    maxInstances?: number;
    ingressSettings?: string;
    vpcConnector?: string;
    httpsTrigger?: {
      url: string;
      securityLevel: string;
    };
    eventTrigger?: {
      eventType: string;
      resource: string;
      service: string;
      failurePolicy?: {
        retry: boolean;
      };
    };
    environmentVariables: Record<string, string>;
    buildEnvironmentVariables: Record<string, string>;
    labels: Record<string, string>;
    sourceArchiveUrl?: string;
    sourceRepository?: {
      url: string;
      deployedUrl: string;
    };
    sourceUploadUrl?: string;
    updateTime: string;
    versionId: string;
    network?: string;
    serviceAccountEmail?: string;
  };
}
```

### 🏃 Cloud Run Tools

#### `list-cloud-run-services`

List all Cloud Run services in a project.

**Parameters:**

```typescript
interface ListCloudRunServicesArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  region?: string; // Specific region (optional, lists all regions if not provided)
}
```

**Response:**

```typescript
interface CloudRunServicesResult {
  success: boolean;
  services: Array<{
    name: string;
    region: string;
    url: string;
    status: {
      conditions: Array<{
        type: string;
        status: string;
        reason?: string;
        message?: string;
      }>;
      traffic: Array<{
        revisionName: string;
        percent: number;
        tag?: string;
        url?: string;
      }>;
    };
    spec: {
      template: {
        metadata: {
          name: string;
          labels: Record<string, string>;
          annotations: Record<string, string>;
        };
        spec: {
          containers: Array<{
            image: string;
            ports: Array<{
              containerPort: number;
              protocol: string;
            }>;
            env: Array<{
              name: string;
              value?: string;
            }>;
            resources: {
              limits: Record<string, string>;
              requests: Record<string, string>;
            };
          }>;
          serviceAccountName?: string;
          timeoutSeconds?: number;
        };
      };
    };
    creationTimestamp: string;
    updateTimestamp: string;
  }>;
  totalCount: number;
}
```

#### `get-cloud-run-service`

Get detailed information about a specific Cloud Run service.

**Parameters:**

```typescript
interface GetCloudRunServiceArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  region: string; // Region where service is located
  serviceName: string; // Name of the service
}
```

**Response:**

```typescript
interface CloudRunServiceDetailsResult {
  success: boolean;
  service: {
    name: string;
    region: string;
    url: string;
    status: {
      observedGeneration: number;
      conditions: Array<{
        type: string;
        status: string;
        lastTransitionTime: string;
        reason?: string;
        message?: string;
      }>;
      traffic: Array<{
        revisionName: string;
        percent: number;
        tag?: string;
        url?: string;
        latestRevision?: boolean;
      }>;
      url: string;
    };
    spec: {
      template: {
        metadata: {
          name: string;
          labels: Record<string, string>;
          annotations: Record<string, string>;
        };
        spec: {
          containers: Array<{
            image: string;
            ports: Array<{
              name?: string;
              containerPort: number;
              protocol: string;
            }>;
            env: Array<{
              name: string;
              value?: string;
              valueFrom?: {
                secretKeyRef?: {
                  name: string;
                  key: string;
                };
              };
            }>;
            resources: {
              limits: Record<string, string>;
              requests: Record<string, string>;
            };
            volumeMounts?: Array<{
              name: string;
              mountPath: string;
            }>;
          }>;
          volumes?: Array<{
            name: string;
            secret?: {
              secretName: string;
            };
          }>;
          serviceAccountName?: string;
          timeoutSeconds?: number;
          containerConcurrency?: number;
        };
      };
      traffic: Array<{
        configurationName?: string;
        revisionName?: string;
        percent?: number;
        tag?: string;
      }>;
    };
    metadata: {
      name: string;
      namespace: string;
      labels: Record<string, string>;
      annotations: Record<string, string>;
      creationTimestamp: string;
      generation: number;
    };
  };
}
```

### 🚢 Google Kubernetes Engine Tools

#### `list-gke-clusters`

List all GKE clusters in a project.

**Parameters:**

```typescript
interface ListGKEClustersArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone?: string; // Specific zone (optional, lists all zones if not provided)
}
```

**Response:**

```typescript
interface GKEClustersResult {
  success: boolean;
  clusters: Array<{
    name: string;
    zone: string;
    status: string;
    currentMasterVersion: string;
    currentNodeVersion: string;
    initialNodeCount: number;
    currentNodeCount: number;
    endpoint: string;
    network: string;
    subnetwork: string;
    clusterIpv4Cidr: string;
    servicesIpv4Cidr: string;
    instanceGroupUrls: string[];
    nodePools: Array<{
      name: string;
      status: string;
      initialNodeCount: number;
      currentNodeCount: number;
      config: {
        machineType: string;
        diskSizeGb: number;
        diskType: string;
        imageType: string;
        oauthScopes: string[];
        serviceAccount: string;
        preemptible: boolean;
      };
      autoscaling?: {
        enabled: boolean;
        minNodeCount: number;
        maxNodeCount: number;
      };
    }>;
    addonsConfig: {
      httpLoadBalancing: {
        disabled: boolean;
      };
      horizontalPodAutoscaling: {
        disabled: boolean;
      };
      kubernetesDashboard: {
        disabled: boolean;
      };
      networkPolicyConfig: {
        disabled: boolean;
      };
    };
    createTime: string;
  }>;
  totalCount: number;
}
```

#### `get-gke-cluster`

Get detailed information about a specific GKE cluster.

**Parameters:**

```typescript
interface GetGKEClusterArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  zone: string; // Zone where cluster is located
  clusterName: string; // Name of the cluster
}
```

**Response:**

```typescript
interface GKEClusterDetailsResult {
  success: boolean;
  cluster: {
    name: string;
    description?: string;
    zone: string;
    status: string;
    statusMessage?: string;
    currentMasterVersion: string;
    currentNodeVersion: string;
    initialNodeCount: number;
    currentNodeCount: number;
    endpoint: string;
    network: string;
    subnetwork: string;
    clusterIpv4Cidr: string;
    servicesIpv4Cidr: string;
    instanceGroupUrls: string[];
    locations: string[];
    nodePools: Array<{
      name: string;
      status: string;
      statusMessage?: string;
      initialNodeCount: number;
      currentNodeCount: number;
      config: {
        machineType: string;
        diskSizeGb: number;
        diskType: string;
        imageType: string;
        oauthScopes: string[];
        serviceAccount: string;
        metadata: Record<string, string>;
        labels: Record<string, string>;
        tags: string[];
        preemptible: boolean;
        accelerators?: Array<{
          acceleratorCount: number;
          acceleratorType: string;
        }>;
        shieldedInstanceConfig?: {
          enableSecureBoot: boolean;
          enableIntegrityMonitoring: boolean;
        };
      };
      autoscaling?: {
        enabled: boolean;
        minNodeCount: number;
        maxNodeCount: number;
      };
      management?: {
        autoUpgrade: boolean;
        autoRepair: boolean;
      };
      upgradeSettings?: {
        maxSurge: number;
        maxUnavailable: number;
      };
    }>;
    masterAuth: {
      clusterCaCertificate: string;
      username?: string;
      password?: string;
      clientCertificateConfig?: {
        issueClientCertificate: boolean;
      };
    };
    loggingService: string;
    monitoringService: string;
    networkPolicy?: {
      provider: string;
      enabled: boolean;
    };
    ipAllocationPolicy?: {
      useIpAliases: boolean;
      clusterIpv4CidrBlock: string;
      servicesIpv4CidrBlock: string;
      clusterSecondaryRangeName: string;
      servicesSecondaryRangeName: string;
    };
    masterAuthorizedNetworksConfig?: {
      enabled: boolean;
      cidrBlocks: Array<{
        displayName: string;
        cidrBlock: string;
      }>;
    };
    addonsConfig: {
      httpLoadBalancing: {
        disabled: boolean;
      };
      horizontalPodAutoscaling: {
        disabled: boolean;
      };
      kubernetesDashboard: {
        disabled: boolean;
      };
      networkPolicyConfig: {
        disabled: boolean;
      };
    };
    createTime: string;
    expirationTime?: string;
    selfLink: string;
  };
}
```

### 📝 Cloud Logging Tools

#### `query-logs`

Query Cloud Logging with advanced filters.

**Parameters:**

```typescript
interface QueryLogsArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  filter?: string; // Advanced logging filter
  startTime?: string; // Start time (ISO 8601)
  endTime?: string; // End time (ISO 8601)
  orderBy?: string; // Sort order (timestamp desc/asc)
  pageSize?: number; // Number of entries per page (default: 50)
  pageToken?: string; // Page token for pagination
}
```

**Response:**

```typescript
interface LogsQueryResult {
  success: boolean;
  entries: Array<{
    logName: string;
    resource: {
      type: string;
      labels: Record<string, string>;
    };
    timestamp: string;
    receiveTimestamp: string;
    severity: string;
    insertId: string;
    httpRequest?: {
      requestMethod: string;
      requestUrl: string;
      status: number;
      responseSize: number;
      userAgent: string;
      remoteIp: string;
      latency: string;
    };
    labels: Record<string, string>;
    textPayload?: string;
    jsonPayload?: any;
    protoPayload?: any;
    operation?: {
      id: string;
      producer: string;
      first: boolean;
      last: boolean;
    };
    trace?: string;
    spanId?: string;
    sourceLocation?: {
      file: string;
      line: number;
      function: string;
    };
  }>;
  nextPageToken?: string;
  totalEstimatedMatches?: number;
}
```

#### `list-log-entries`

List recent log entries with basic filtering.

**Parameters:**

```typescript
interface ListLogEntriesArgs {
  projectId?: string; // Project ID (optional, uses selected project)
  resourceType?: string; // Resource type filter (e.g., 'gce_instance')
  logName?: string; // Log name filter (e.g., 'syslog')
  severity?: string; // Minimum severity level
  hours?: number; // Look back this many hours (default: 1)
  limit?: number; // Maximum number of entries (default: 100)
}
```

**Response:**

```typescript
interface LogEntriesResult {
  success: boolean;
  entries: Array<{
    timestamp: string;
    severity: string;
    resource: string;
    logName: string;
    message: string;
    labels?: Record<string, string>;
    insertId: string;
  }>;
  totalCount: number;
  timeRange: {
    start: string;
    end: string;
  };
}
```

## Error Handling

All tools return a consistent error structure when operations fail:

```typescript
interface ErrorResult {
  success: false;
  error: {
    code: string; // Error code (GCP_API_ERROR, VALIDATION_ERROR, etc.)
    message: string; // Human-readable error message
    details?: any; // Additional error details
    retryable?: boolean; // Whether the operation can be retried
  };
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR`: GCP credentials not configured or invalid
- `AUTHORIZATION_ERROR`: Insufficient permissions for the operation
- `PROJECT_NOT_SELECTED`: No project selected (use select-project first)
- `VALIDATION_ERROR`: Invalid parameters provided
- `GCP_API_ERROR`: Error from Google Cloud API
- `NETWORK_ERROR`: Network connectivity issues
- `QUOTA_EXCEEDED`: API quota limits exceeded
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `SERVICE_UNAVAILABLE`: GCP service temporarily unavailable

## Response Formats

### Success Response

```typescript
interface SuccessResult<T> {
  success: true;
  data: T; // Tool-specific response data
  metadata?: {
    requestId?: string; // Request correlation ID
    executionTime?: number; // Execution time in milliseconds
    cacheHit?: boolean; // Whether response was cached
  };
}
```

### Pagination Support

Tools that return large datasets support pagination:

```typescript
interface PaginatedResult<T> {
  success: true;
  data: T[];
  pagination: {
    nextPageToken?: string; // Token for next page
    totalCount?: number; // Total items available
    pageSize: number; // Items per page
    hasMore: boolean; // Whether more pages exist
  };
}
```

## Rate Limiting

The server implements intelligent rate limiting to respect GCP API quotas:

- **Exponential backoff** for retry operations
- **Circuit breaker** pattern for failing services
- **Request batching** where supported by GCP APIs
- **Quota monitoring** with automatic throttling

## Authentication Requirements

All tools require valid GCP authentication. Set up using:

```bash
# Application Default Credentials (recommended)
gcloud auth application-default login

# Or set service account key
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

## Performance Considerations

- **Concurrent Operations**: Tools execute multiple API calls in parallel where possible
- **Caching**: Frequently accessed metadata is cached with TTL
- **Lazy Loading**: GCP clients are instantiated only when needed
- **Connection Pooling**: HTTP connections are reused across requests
- **Efficient Querying**: Tools use server-side filtering to minimize data transfer
