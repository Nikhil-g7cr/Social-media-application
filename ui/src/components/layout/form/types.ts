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
  accept: string | undefined;
  rows: number;
  name: string;
  label: string;
  type: FieldType;

  placeholder?: string;
  required?: boolean;
  disabled?: boolean;

  options?: FieldOption[];
}