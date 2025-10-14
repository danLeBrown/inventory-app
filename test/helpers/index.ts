import { StartedRedisContainer } from '@testcontainers/redis';

// a function that accepts a function that is asserted and a maximum no of retries
export async function tryAssert(
  functionToAssert: () => void | Promise<void>,
  maxRetries = 10,
) {
  let retries = 0;
  let lastError: unknown;

  while (retries < maxRetries) {
    try {
      // Await the result in case it's a Promise
      await functionToAssert();
      return; // Success - exit the function
    } catch (error) {
      retries++;
      lastError = error;
      console.error(`Attempt ${retries} failed:`, error);

      // Optional: add a small delay before retrying
      // This is often helpful in async scenarios
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}

export function setupRedis(exe: StartedRedisContainer) {
  // This function can be used to set up the Redis connection
  // or perform any necessary setup before running tests.
  // For example, you might want to reset the Redis state here.
  // console.info('Setting up Redis...');
  process.env.REDIS_URL = `redis://${exe.getHost()}:${exe.getMappedPort(6379)}`;
}
