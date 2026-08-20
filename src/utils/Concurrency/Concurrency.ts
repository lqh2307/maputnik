/**
 * Execute async tasks with a concurrency limit.
 *
 * @param generator Generator yielding task functions.
 * @param limit Maximum concurrent tasks; values below one mean unlimited.
 * @returns A promise settled after every yielded task has settled.
 */
export async function runAllWithLimit(
  generator: Generator<() => void>,
  limit: number
): Promise<void> {
  const concurrency: number = limit >= 1 ? limit : Infinity;

  const executing: Set<Promise<void>> = new Set();

  for await (const task of generator) {
    const p: Promise<void> = Promise.resolve().then(task);

    executing.add(p);

    p.finally(() => {
      return executing.delete(p);
    });

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.allSettled(executing);
}
