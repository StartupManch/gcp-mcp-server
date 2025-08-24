/**
 * Configuration and constants for GCP MCP Server
 */

export const CONFIG = {
  SERVER: {
    NAME: 'gcp-mcp-server',
    VERSION: '1.0.1',
  },
  DEFAULTS: {
    REGION: 'us-central1',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
  REGIONS: {
    COMMON_ZONES: {
      'us-central1': ['us-central1-a', 'us-central1-b', 'us-central1-c', 'us-central1-f'],
      'us-west1': ['us-west1-a', 'us-west1-b', 'us-west1-c'],
      'us-west2': ['us-west2-a', 'us-west2-b', 'us-west2-c'],
      'us-west3': ['us-west3-a', 'us-west3-b', 'us-west3-c'],
      'us-west4': ['us-west4-a', 'us-west4-b', 'us-west4-c'],
      'us-east1': ['us-east1-b', 'us-east1-c', 'us-east1-d'],
      'us-east4': ['us-east4-a', 'us-east4-b', 'us-east4-c'],
      'us-east5': ['us-east5-a', 'us-east5-b', 'us-east5-c'],
      'us-south1': ['us-south1-a', 'us-south1-b', 'us-south1-c'],
      'europe-west1': ['europe-west1-b', 'europe-west1-c', 'europe-west1-d'],
      'europe-west2': ['europe-west2-a', 'europe-west2-b', 'europe-west2-c'],
      'europe-west3': ['europe-west3-a', 'europe-west3-b', 'europe-west3-c'],
      'europe-west4': ['europe-west4-a', 'europe-west4-b', 'europe-west4-c'],
      'europe-west6': ['europe-west6-a', 'europe-west6-b', 'europe-west6-c'],
      'europe-central2': ['europe-central2-a', 'europe-central2-b', 'europe-central2-c'],
      'asia-east1': ['asia-east1-a', 'asia-east1-b', 'asia-east1-c'],
      'asia-east2': ['asia-east2-a', 'asia-east2-b', 'asia-east2-c'],
      'asia-northeast1': ['asia-northeast1-a', 'asia-northeast1-b', 'asia-northeast1-c'],
      'asia-northeast2': ['asia-northeast2-a', 'asia-northeast2-b', 'asia-northeast2-c'],
      'asia-northeast3': ['asia-northeast3-a', 'asia-northeast3-b', 'asia-northeast3-c'],
      'asia-southeast1': ['asia-southeast1-a', 'asia-southeast1-b', 'asia-southeast1-c'],
      'asia-southeast2': ['asia-southeast2-a', 'asia-southeast2-b', 'asia-southeast2-c'],
      'asia-south1': ['asia-south1-a', 'asia-south1-b', 'asia-south1-c'],
      'asia-south2': ['asia-south2-a', 'asia-south2-b', 'asia-south2-c'],
      'australia-southeast1': [
        'australia-southeast1-a',
        'australia-southeast1-b',
        'australia-southeast1-c',
      ],
      'australia-southeast2': [
        'australia-southeast2-a',
        'australia-southeast2-b',
        'australia-southeast2-c',
      ],
      'southamerica-east1': [
        'southamerica-east1-a',
        'southamerica-east1-b',
        'southamerica-east1-c',
      ],
      'southamerica-west1': [
        'southamerica-west1-a',
        'southamerica-west1-b',
        'southamerica-west1-c',
      ],
      'northamerica-northeast1': [
        'northamerica-northeast1-a',
        'northamerica-northeast1-b',
        'northamerica-northeast1-c',
      ],
      'northamerica-northeast2': [
        'northamerica-northeast2-a',
        'northamerica-northeast2-b',
        'northamerica-northeast2-c',
      ],
    },
    FALLBACK_ZONES: [
      'us-central1-a',
      'us-west1-a',
      'us-east1-b',
      'europe-west1-b',
      'asia-south1-a',
    ],
  },
  PROMPTS: {
    CODE_EXECUTION: `Your job is to answer questions about GCP environment by writing Javascript/TypeScript code using Google Cloud Client Libraries. The code must adhere to a few rules:
- Must use promises and async/await
- Think step-by-step before writing the code, approach it logically
- Must be written in TypeScript using official Google Cloud client libraries
- Avoid hardcoded values like project IDs
- Code written should be as parallel as possible enabling the fastest and most optimal execution
- Code should handle errors gracefully, especially when doing multiple API calls
- Each error should be handled and logged with a reason, script should continue to run despite errors
- Data returned from GCP APIs must be returned as JSON containing only the minimal amount of data needed to answer the question
- All extra data must be filtered out
- Code MUST "return" a value: string, number, boolean or JSON object
- If code does not return anything, it will be considered as FAILED
- Whenever tool/function call fails, retry it 3 times before giving up
- When listing resources, ensure pagination is handled correctly
- Do not include any comments in the code
- Try to write code that returns as few data as possible to answer without any additional processing required
Be concise, professional and to the point. Do not give generic advice, always reply with detailed & contextual data sourced from the current GCP environment.`,
  },
} as const;

/**
 * Get the zones for a specific region
 * @param region - The GCP region
 * @returns Array of zones for the region
 */
export function getZonesForRegion(region: string): string[] {
  const commonZones = CONFIG.REGIONS.COMMON_ZONES as Record<string, readonly string[]>;

  if (commonZones[region]) {
    return [...commonZones[region]];
  }

  // If region not found, try to generate zones based on common patterns
  const commonSuffixes = ['a', 'b', 'c'];
  const generatedZones = commonSuffixes.map(suffix => `${region}-${suffix}`);

  // Return generated zones if they seem valid, otherwise use fallback
  if (region.includes('-')) {
    return generatedZones;
  }

  return [...CONFIG.REGIONS.FALLBACK_ZONES];
}
