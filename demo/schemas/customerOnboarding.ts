import type { FormSchema, FormValues } from "../../src";

export const customerOnboardingSchema: FormSchema = {
  id: "customer-onboarding",
  title: "Customer onboarding",
  description: "Customer profile data for account setup and compliance review.",
  submitLabel: "Create customer",
  resetLabel: "Clear",
  fields: [
    {
      type: "section",
      id: "personal-data",
      title: "Personal data",
      description: "Identity and contact details used by operations teams.",
      fields: [
        {
          type: "text",
          name: "firstName",
          label: "First name",
          required: true,
          minLength: 2,
          helpText: "Use the legal first name from the customer's identity document."
        },
        {
          type: "text",
          name: "lastName",
          label: "Last name",
          required: true,
          minLength: 2
        },
        {
          type: "email",
          name: "email",
          label: "Email address",
          required: true,
          helpText: "A work or account recovery email address."
        },
        {
          type: "text",
          name: "taxCode",
          label: "Tax code",
          validators: ["taxCode"],
          helpText: "Optional Italian tax code validation is supplied as a custom validator."
        }
      ]
    },
    {
      type: "section",
      id: "account-data",
      title: "Account data",
      fields: [
        {
          type: "select",
          name: "accountType",
          label: "Account type",
          required: true,
          options: [
            { label: "Consumer", value: "consumer" },
            { label: "Small business", value: "business" },
            { label: "Enterprise", value: "enterprise" }
          ]
        },
        {
          type: "text",
          name: "companyName",
          label: "Company name",
          required: true,
          visibleWhen: {
            field: "accountType",
            equals: "enterprise"
          }
        },
        {
          type: "textarea",
          name: "onboardingNotes",
          label: "Onboarding notes",
          maxLength: 240,
          helpText: "Internal notes visible to customer operations."
        }
      ]
    }
  ]
};

export const customerOnboardingInitialValues: FormValues = {
  accountType: "consumer"
};
