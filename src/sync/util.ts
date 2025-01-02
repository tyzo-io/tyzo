import { managementApiClient } from "../apiClient";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export async function withRetry<T>(
  operation: () => Promise<T>,
  onRetry: (delay: number, attempt: number, maxRetries: number) => void
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        onRetry(delay, attempt, MAX_RETRIES);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export function getRemoteConfig(stage: string | undefined) {
  const remoteBaseUrl = process.env.REMOTE_TYZO_URL ?? "https://cd.tyzo.io";
  const space = process.env.TYZO_SPACE as string;

  return {
    remoteBaseUrl,
    space,
    stage: stage ?? "main",
  };
}

export function getRemoteApiClient({
  remoteBaseUrl,
  space,
  stage,
  token,
}: {
  remoteBaseUrl: string;
  space: string;
  stage: string;
  token: string;
}) {
  const remoteUrl = `${remoteBaseUrl}/content/${space}:${stage}`;
  console.log("Remote API URL:", remoteUrl);
  const remoteApi = managementApiClient({
    API_URL: remoteUrl,
    token: () => token,
  });
  return remoteApi;
}
