import type { FieldRenderer } from "./renderField";

export type RendererMap = Record<string, FieldRenderer>;

export interface RendererRegistry {
  get(type: string): FieldRenderer | undefined;
  register(type: string, renderer: FieldRenderer): void;
}

export function createRendererRegistry(renderers: RendererMap = {}): RendererRegistry {
  const registry = new Map<string, FieldRenderer>();

  Object.entries(renderers).forEach(([type, renderer]) => {
    registry.set(type, renderer);
  });

  return {
    get(type) {
      return registry.get(type);
    },

    register(type, renderer) {
      registry.set(type, renderer);
    }
  };
}
