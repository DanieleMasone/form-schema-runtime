# ADR 0001: Framework-Agnostic TypeScript Core

## Status

Accepted

## Context

Enterprise frontend systems often contain legacy server-rendered pages, micro-frontends, and multiple framework generations. A form runtime that depends on React, Angular, Vue, or another UI framework is difficult to embed consistently across those environments.

The project needs to demonstrate maintainable frontend engineering while staying useful in places where a framework runtime cannot be introduced.

## Decision

The core runtime is implemented as a strict TypeScript library that renders plain HTML into a caller-provided container element.

The core excludes React, Angular, Vue, Svelte, virtual DOM implementations, decorators, and framework-specific lifecycle concepts. It exposes a small public API through `src/index.ts` and keeps validation, state, conditions, DOM helpers, and rendering in separate modules.

## Rationale

Strict TypeScript gives consumers a stable schema and API contract while catching integration mistakes early. Direct DOM rendering keeps the package lightweight, portable, and friendly to legacy applications. Native controls also make baseline accessibility and keyboard behavior more reliable than custom widget abstractions.

## Trade-Offs

Direct DOM rendering means the runtime owns the portion of DOM it renders and cannot rely on framework reconciliation. Custom renderers must be written carefully to preserve accessibility behavior. Framework adapters may be useful later, but they should wrap the core rather than move framework assumptions into it.

The v1 design favors predictable behavior over feature breadth. Async validation, repeatable nested arrays, and a general rules engine are intentionally deferred.
