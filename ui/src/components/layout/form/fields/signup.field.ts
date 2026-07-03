import { AUTH_FIELD_MAX_LENGTHS } from "../constants/authFieldLimits";

export const signupFields = [
  {
    name: "FullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    required: true,
    maxLength: AUTH_FIELD_MAX_LENGTHS.fullName,
  },
  {
    name: "UserName",
    label: "Username",
    type: "text",
    placeholder: "Choose a username",
    asyncValidator:undefined,
    required: true,
    maxLength: AUTH_FIELD_MAX_LENGTHS.username,
  },
  {
    name: "EmailAddress",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email",
    required: true,
    maxLength: AUTH_FIELD_MAX_LENGTHS.email,
  },
  {
    name: "Password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "ConfirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm your password",
    required: true,
  },
  {
    name: "Bio",
    label: "Bio",
    type: "textarea",
    placeholder: "Tell us about yourself",
    maxLength: AUTH_FIELD_MAX_LENGTHS.bio,
  },
  {
    name: "Gender",
    label: "Gender",
    type: "select",
    options: [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Other", value: "Other" },
    ],
    required: true,
  },
];
