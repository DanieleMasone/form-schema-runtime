import "./styles/form-schema-runtime.css";

import { createEventRegistry } from "./dom/events";
import { createFieldDomId } from "./dom/ids";
import { collectVisibleFields, renderForm } from "./renderer/renderForm";
import { createRendererRegistry } from "./renderer/rendererRegistry";
import type { RendererMap } from "./renderer/rendererRegistry";
import { createFormState } from "./state/formState";
import { normalizeSchema } from "./schema/normalizeSchema";
import type {
  CustomValidatorMap,
  FieldErrors,
  FieldValue,
  FormSchema,
  FormStateSnapshot,
  FormValues
} from "./publicTypes";
import { validateForm } from "./validation/validateForm";

export type {
  BuiltInFieldType,
  CustomValidator,
  CustomValidatorContext,
  FieldError,
  FieldErrors,
  FieldOption,
  FieldRenderer,
  FieldRenderContext,
  FieldSchema,
  FieldType,
  FieldValue,
  FormSchema,
  FormStateSnapshot,
  FormValues,
  CustomValidatorMap,
  EventRegistry,
  RenderedFieldSchema,
  RendererMap,
  SchemaNode,
  SectionSchema,
  ValidationMessageKey,
  VisibilityCondition,
  VisibilityRule
} from "./publicTypes";

/** Options used to create and mount a form instance. */
export interface CreateFormOptions {
  /** Container element whose children are owned by this form instance. */
  container: HTMLElement;
  /** Declarative form schema to render. */
  schema: FormSchema;
  /** Optional values merged over field defaults during initialization and reset. */
  initialValues?: FormValues;
  /** CSS class prefix. Defaults to `fsr`. */
  classPrefix?: string;
  /** Custom synchronous validators keyed by the names used in field schemas. */
  validators?: CustomValidatorMap;
  /** Custom renderers keyed by field type. */
  renderers?: RendererMap;
  /** Called after values change through UI input or `setValues`. */
  onChange?: (values: FormValues, state: FormStateSnapshot) => void;
  /** Called after a valid submit. */
  onSubmit?: (values: FormValues, state: FormStateSnapshot) => void;
  /** Called when validation fails through submit or `validate`. */
  onValidationError?: (errors: FieldErrors, state: FormStateSnapshot) => void;
  /** Called after reset restores the initial state. */
  onReset?: (state: FormStateSnapshot) => void;
}

/** Public controller returned by `createForm`. */
export interface FormInstance {
  /** Return a defensive copy of current values. */
  getValues(): FormValues;
  /** Merge values into known schema fields and re-render. */
  setValues(values: FormValues): void;
  /** Validate visible fields and return whether the form is valid. */
  validate(): boolean;
  /** Restore initial values and clear touched, dirty, and error state. */
  reset(): void;
  /** Remove event listeners and DOM owned by the form. */
  destroy(): void;
}

function focusErrorSummary(container: HTMLElement, classPrefix: string): void {
  container.querySelector<HTMLElement>(`.${classPrefix}-error-summary`)?.focus();
}

/**
 * Render an accessible form into a container from a declarative schema.
 *
 * The runtime owns the container children until `destroy()` is called. Schema
 * text is rendered with DOM APIs and `textContent`; schema strings are never
 * executed as code.
 */
export function createForm(options: CreateFormOptions): FormInstance {
  const schema = normalizeSchema(options.schema);
  const classPrefix = options.classPrefix ?? "fsr";
  const state = createFormState(schema, options.initialValues);
  const registry = createRendererRegistry(options.renderers);
  let events = createEventRegistry();
  let destroyed = false;

  const getVisibleFields = () => collectVisibleFields(schema.fields, state.getSnapshot().values);
  const getSnapshot = () => state.getSnapshot(getVisibleFields());

  function ensureActive(): void {
    if (destroyed) {
      throw new Error("Cannot use a form instance after destroy() has been called.");
    }
  }

  function render(): void {
    events.cleanup();
    events = createEventRegistry();
    options.container.replaceChildren(
      renderForm({
        schema,
        state: getSnapshot(),
        classPrefix,
        events,
        registry,
        onSubmit: submit,
        onReset: reset,
        onValueChange,
        onTouched: (fieldName) => state.markTouched(fieldName)
      })
    );
  }

  function validateInternal(shouldNotify: boolean): boolean {
    const result = validateForm(schema, state.getValues(), options.validators, getVisibleFields());
    state.setErrors(result.errors);
    render();

    if (!result.valid && shouldNotify) {
      options.onValidationError?.(result.errors, getSnapshot());
      focusErrorSummary(options.container, classPrefix);
    }

    return result.valid;
  }

  function onValueChange(fieldName: string, value: FieldValue): void {
    state.setValue(fieldName, value);
    const currentErrors = getSnapshot().errors;

    if (Object.keys(currentErrors).length > 0) {
      validateInternal(false);
    } else {
      render();
    }

    options.onChange?.(state.getValues(), getSnapshot());
    const fieldElement = options.container.querySelector<HTMLElement>(
      `#${createFieldDomId(schema.id, fieldName, classPrefix)}`
    );
    fieldElement?.focus();
  }

  function submit(): void {
    const valid = validateInternal(true);

    if (valid) {
      options.onSubmit?.(state.getValues(), getSnapshot());
    }
  }

  function reset(): void {
    state.reset();
    render();
    options.onReset?.(getSnapshot());
  }

  render();

  return {
    getValues() {
      ensureActive();
      return state.getValues();
    },

    setValues(values) {
      ensureActive();
      state.setValues(values);
      render();
      options.onChange?.(state.getValues(), getSnapshot());
    },

    validate() {
      ensureActive();
      return validateInternal(true);
    },

    reset() {
      ensureActive();
      reset();
    },

    destroy() {
      if (destroyed) {
        return;
      }

      events.cleanup();
      options.container.replaceChildren();
      destroyed = true;
    }
  };
}
