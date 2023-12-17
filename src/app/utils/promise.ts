export const promisify =
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
