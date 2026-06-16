export function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: {
    className?: string;
    text?: string;
    attributes?: Record<string, string | boolean | number | undefined>;
  } = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  Object.entries(options.attributes ?? {}).forEach(([name, value]) => {
    if (value === undefined || value === false) {
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

export function externalLink(label: string, href: string): HTMLAnchorElement {
  return el("a", {
    className: "demo-link",
    text: label,
    attributes: { href }
  });
}

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function renderList(items: string[], className: string): HTMLUListElement {
  const list = el("ul", { className });

  items.forEach((item) => {
    list.append(el("li", { text: item }));
  });

  return list;
}
