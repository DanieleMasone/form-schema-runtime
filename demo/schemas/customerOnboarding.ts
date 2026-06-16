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
          placeholder: "Ada",
          required: true,
          minLength: 2,
          maxLength: 40,
          helpText: "Use the legal first name from the customer's identity document."
        },
        {
          type: "text",
          name: "lastName",
          label: "Last name",
          placeholder: "Lovelace",
          required: true,
          minLength: 2,
          maxLength: 40
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
          placeholder: "RSSMRA80A01H501U",
          validators: ["taxCode"],
          helpText: "Optional Italian tax code validation is supplied as a custom validator."
        },
        {
          type: "number",
          name: "estimatedAnnualSpend",
          label: "Estimated annual spend",
          required: true,
          min: 100,
          max: 1000000,
          helpText: "Used by operations to select the onboarding review path."
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
  accountType: "consumer",
  estimatedAnnualSpend: 2500
};
