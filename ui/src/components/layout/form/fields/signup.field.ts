import type { FieldConfig } from "../types";

export const signupFields: FieldConfig[] = [
  {
    name: "userName",
    label: "Username",
    type: "text",
    placeholder: "Enter username",
  },
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm password",
  },
];