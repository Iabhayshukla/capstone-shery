import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

// Re-export the command so other modules don't need to import from AWS SDK directly
export { InvokeModelWithResponseStreamCommand };

export const DEFAULT_MODEL_ID = process.env.MODEL_ID ?? 'amazon.nova-pro-v1:0';
const REGION = process.env.AWS_REGION ?? 'ap-southeast-2';

let _client: BedrockRuntimeClient | null = null;

/**
 * Returns a singleton BedrockRuntimeClient.
 * Credentials are loaded automatically from environment variables:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
 */
export function getBedrockClient(): BedrockRuntimeClient {
  if (!_client) {
    _client = new BedrockRuntimeClient({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }
  return _client;
}
