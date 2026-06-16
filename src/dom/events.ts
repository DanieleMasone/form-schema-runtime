/** Tracks DOM event listeners so custom renderers can participate in cleanup. */
export interface EventRegistry {
  /** Register an event listener that will be removed when the form re-renders or is destroyed. */
  listen<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Document,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void
  ): void;
  /** Remove all listeners registered through this registry. */
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
