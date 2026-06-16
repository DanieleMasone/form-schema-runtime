import type { FormSchema, FormValues } from "../../src";
import {
  customerOnboardingInitialValues,
  customerOnboardingSchema
} from "./customerOnboarding";
import {
  enterpriseAccessRequestInitialValues,
  enterpriseAccessRequestSchema
} from "./enterpriseAccessRequest";
import { paymentDetailsInitialValues, paymentDetailsSchema } from "./paymentDetails";

export interface DemoExample {
  id: string;
  label: string;
  schema: FormSchema;
  initialValues?: FormValues;
  summary: string;
  guidance: string[];
  features: string[];
}

export const examples: DemoExample[] = [
  {
    id: "customer-onboarding",
    label: "Customer onboarding",
    schema: customerOnboardingSchema,
    initialValues: customerOnboardingInitialValues,
    summary: "A customer operations form demonstrating common text, email, number, textarea, custom validation, and initial value behavior.",
    guidance: [
      "Submit the empty form to see linked field-level errors and an accessible error summary.",
      "Change account type to Enterprise to reveal the conditional company field.",
      "Enter a short tax code to exercise the custom synchronous validator."
    ],
    features: ["text", "email", "number", "textarea", "required", "min/max", "custom validator", "conditional field"]
  },
  {
    id: "enterprise-access-request",
    label: "Enterprise access request",
    schema: enterpriseAccessRequestSchema,
    initialValues: enterpriseAccessRequestInitialValues,
    summary: "An internal access workflow showing select, radio, checkbox, readonly/disabled fields, and conditional admin justification.",
    guidance: [
      "Change access level to Administrator to reveal the justification textarea.",
      "The source system field is readonly and the access window is disabled to show native attributes.",
      "The approval checkbox demonstrates required boolean validation."
    ],
    features: ["select", "radio", "checkbox", "readonly", "disabled", "conditional field", "pattern"]
  },
  {
    id: "payment-details",
    label: "Payment details",
    schema: paymentDetailsSchema,
    initialValues: paymentDetailsInitialValues,
    summary: "A mock payment form demonstrating a custom money renderer, numeric validation, pattern validation, and security-safe schema text.",
    guidance: [
      "The amount field is rendered through the custom renderer registry.",
      "Set amount to 0 and submit to see numeric validation from a custom-rendered field.",
      "Switch payment method to Corporate card to reveal the card-last-four pattern field."
    ],
    features: ["custom renderer", "number validation", "pattern", "required", "help text", "conditional field"]
  }
];
