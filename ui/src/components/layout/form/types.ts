// types.ts

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "date";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;

  placeholder?: string;
  disabled?: boolean;

  options?: FieldOption[];

  rows?: number;

  accept?: string;
}