import type { FieldConfig } from "../types";
import { AUTH_FIELD_MAX_LENGTHS } from "../constants/authFieldLimits";

export const loginFields: FieldConfig[] = [
  {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      accept: undefined,
      rows: 0,
      required: true,
      maxLength: AUTH_FIELD_MAX_LENGTHS.email,
  },
  {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      accept: undefined,
      rows: 0,
      required: true,
      maxLength: AUTH_FIELD_MAX_LENGTHS.password,
  },
];
