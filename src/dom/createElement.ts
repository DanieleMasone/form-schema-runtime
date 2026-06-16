export interface CreateElementOptions {
  className?: string;
  text?: string;
  attributes?: Record<string, string | boolean | number | null | undefined>;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  Object.entries(options.attributes ?? {}).forEach(([name, value]) => {
    if (value === undefined || value === null || value === false) {
      return;
    }

    if (value === true) {
      element.setAttribute(name, "");
      return;
    }

    element.setAttribute(name, String(value));
  });

  return element;
}
