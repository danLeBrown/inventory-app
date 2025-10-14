export async function ensureTransaction<T>(
  functionToAssert: () => Promise<T>,
  maxRetries = 10,
  waitTime = 500,
) {
  let retries = 0;
  let lastError: unknown;

  while (retries < maxRetries) {
    try {
      // Await the result in case it's a Promise
      return await functionToAssert();
    } catch (error) {
      retries++;
      lastError = error;
      console.error(`Attempt ${retries} failed:`, error);

      // Optional: add a small delay before retrying
      // This is often helpful in async scenarios
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}
