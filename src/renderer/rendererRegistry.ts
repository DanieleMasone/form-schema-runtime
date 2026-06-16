import type { FieldRenderer } from "./renderField";

/** Custom renderer map keyed by schema field type. */
export type RendererMap = Record<string, FieldRenderer>;

export interface RendererRegistry {
  /** Return a renderer for the given field type, if one was registered. */
  get(type: string): FieldRenderer | undefined;
  /** Register or replace a renderer for a custom field type. */
  register(type: string, renderer: FieldRenderer): void;
}

/** Create the small renderer lookup used by built-in and custom fields. */
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
