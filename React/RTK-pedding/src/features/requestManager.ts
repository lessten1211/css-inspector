// 简单的伪网络请求和去重管理器
// 支持 AbortSignal 的 fakeFetch
export function fakeFetch(key: string, delay = 800, signal?: AbortSignal): Promise<{ key: string; ts: number }>{
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timeout = setTimeout(() => {
      if (signal?.aborted) {
        reject(new Error('aborted'));
        return;
      }
      resolve({ key, ts: Date.now() });
      console.log(`[fakeFetch] resolved ${key} after ${Date.now() - start}ms`);
    }, delay);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('aborted'));
      });
    }
  });
}

// inFlight map for dedupe: stores { promise, controller }
type InFlightEntry = { promise: Promise<any>; controller?: AbortController };
const inFlight = new Map<string, InFlightEntry>();

export function fetchWithDedupe(key: string) {
  const existing = inFlight.get(key);
  if (existing) {
    console.log(`[dedupe] returning in-flight promise for ${key}`);
    return existing.promise;
  }
  const controller = new AbortController();
  const p = fakeFetch(key, 800, controller.signal)
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, { promise: p, controller });
  return p;
}

// 支持策略的 fetch：policy = 'dedupe' | 'cancelPrevious'
export function fetchWithPolicy(key: string, policy: 'dedupe' | 'cancelPrevious' = 'dedupe') {
  const existing = inFlight.get(key);
  if (existing) {
    if (policy === 'dedupe') {
      console.log(`[policy:dedupe] reuse in-flight for ${key}`);
      return existing.promise;
    }
    if (policy === 'cancelPrevious') {
      console.log(`[policy:cancelPrevious] abort previous for ${key}`);
      existing.controller?.abort();
      inFlight.delete(key);
      // fallthrough to create new
    }
  }
  const controller = new AbortController();
  const p = fakeFetch(key, 800, controller.signal)
    .finally(() => {
      // 只有当当前 entry 的 promise 完成时才删除（防止覆盖时误删）
      const cur = inFlight.get(key);
      if (cur && cur.promise === p) inFlight.delete(key);
    });
  inFlight.set(key, { promise: p, controller });
  return p;
}

export function clearDedupe() {
  inFlight.clear();
}
