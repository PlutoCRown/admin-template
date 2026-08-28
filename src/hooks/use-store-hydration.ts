import { useSyncExternalStore } from "react";
import { useUserStore } from "#stores/user";

export function useStoreHydration() {
  return useSyncExternalStore(
    (onChange) => useUserStore.persist.onFinishHydration(onChange),
    () => useUserStore.persist.hasHydrated(),
    () => false,
  );
}
