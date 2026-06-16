import type { FormSchema, FormValues } from "../../src";

export const paymentDetailsSchema: FormSchema = {
  id: "payment-details",
  title: "Payment details",
  description: "Mock payment capture workflow for invoice and card settlement paths.",
  submitLabel: "Save payment details",
  fields: [
    {
      type: "section",
      id: "billing",
      title: "Billing contact",
      fields: [
        {
          type: "text",
          name: "billingName",
          label: "Billing name",
          required: true,
          minLength: 3
        },
        {
          type: "email",
          name: "billingEmail",
          label: "Billing email",
          required: true
        },
        {
          type: "money",
          name: "amount",
          label: "Amount",
          required: true,
          min: 1,
          helpText: "Custom money renderer registered by the demo application."
        }
      ]
    },
    {
      type: "section",
      id: "settlement",
      title: "Settlement",
      fields: [
        {
          type: "radio",
          name: "paymentMethod",
          label: "Payment method",
          required: true,
          options: [
            { label: "Corporate card", value: "card" },
            { label: "Invoice", value: "invoice" }
          ]
        },
        {
          type: "text",
          name: "cardLast4",
          label: "Card last 4 digits",
          required: true,
          pattern: "^[0-9]{4}$",
          visibleWhen: {
            field: "paymentMethod",
            equals: "card"
          }
        },
        {
          type: "text",
          name: "purchaseOrder",
          label: "Purchase order",
          required: true,
          minLength: 6,
          visibleWhen: {
            field: "paymentMethod",
            equals: "invoice"
          }
        }
      ]
    }
  ]
};

export const paymentDetailsInitialValues: FormValues = {
  amount: 1200,
  paymentMethod: "invoice"
};
