export interface EventRegistry {
  listen<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Document,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void
  ): void;
  cleanup(): void;
}

export function createEventRegistry(): EventRegistry {
  const cleanupCallbacks: Array<() => void> = [];

  return {
    listen(element, type, listener) {
      element.addEventListener(type, listener as EventListener);
      cleanupCallbacks.push(() => element.removeEventListener(type, listener as EventListener));
    },

    cleanup() {
      cleanupCallbacks.splice(0).forEach((callback) => callback());
    }
  };
}
