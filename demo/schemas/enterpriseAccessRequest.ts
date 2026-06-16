import type { FormSchema, FormValues } from "../../src";

export const enterpriseAccessRequestSchema: FormSchema = {
  id: "enterprise-access-request",
  title: "Enterprise access request",
  description: "Access provisioning request for internal business systems.",
  submitLabel: "Submit request",
  fields: [
    {
      type: "section",
      id: "requester",
      title: "Requester",
      fields: [
        {
          type: "text",
          name: "employeeId",
          label: "Employee ID",
          required: true,
          pattern: "^[A-Z]{2}-[0-9]{5}$",
          validationMessages: {
            pattern: "Employee ID must look like IT-12345."
          }
        },
        {
          type: "email",
          name: "managerEmail",
          label: "Manager email",
          required: true
        },
        {
          type: "select",
          name: "department",
          label: "Department",
          required: true,
          options: [
            { label: "Finance", value: "finance" },
            { label: "Legal", value: "legal" },
            { label: "Security", value: "security" },
            { label: "Operations", value: "operations" }
          ]
        }
      ]
    },
    {
      type: "section",
      id: "access",
      title: "Access scope",
      fields: [
        {
          type: "radio",
          name: "accessLevel",
          label: "Access level",
          required: true,
          options: [
            { label: "Read only", value: "read" },
            { label: "Standard contributor", value: "write" },
            { label: "Administrator", value: "admin" }
          ]
        },
        {
          type: "textarea",
          name: "adminJustification",
          label: "Administrator access justification",
          required: true,
          minLength: 24,
          visibleWhen: {
            field: "accessLevel",
            equals: "admin"
          }
        },
        {
          type: "checkbox",
          name: "approvalConfirmed",
          label: "Manager approval is attached",
          required: true,
          helpText: "Required before privileged access can be reviewed."
        }
      ]
    }
  ]
};

export const enterpriseAccessRequestInitialValues: FormValues = {
  department: "operations",
  accessLevel: "read"
};
