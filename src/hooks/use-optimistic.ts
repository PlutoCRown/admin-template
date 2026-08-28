export async function runOptimistic<T>(options: {
  snapshot: T;
  next: T;
  commit: (value: T) => void;
  request: () => Promise<void>;
}): Promise<boolean> {
  const { snapshot, next, commit, request } = options;
  commit(next);
  try {
    await request();
    return true;
  } catch {
    commit(snapshot);
    return false;
  }
}
