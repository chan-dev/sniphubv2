/**
 * A utility function that wraps a function that returns a promise and catch any internal errors.
 *
 * @param fn: a function that returns a promise
 * @returns a callback that handles internal promise and any errors
 */
export const wrapPromiseWithErrorHandler =
  <T extends (...args: any[]) => any, R extends Awaited<ReturnType<T>>>(
    fn: T,
  ) =>
  (...args: any[]) =>
    new Promise<R>(async (resolve, reject) => {
      try {
        const result = await fn(...args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
