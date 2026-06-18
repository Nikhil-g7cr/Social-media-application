import type { FieldConfig } from "../types";

export const loginFields: FieldConfig[] = [
  {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      accept: undefined,
      rows: 0
  },
  {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      accept: undefined,
      rows: 0
  },
];