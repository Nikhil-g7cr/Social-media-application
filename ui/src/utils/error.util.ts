const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred. Please try again later.";

const stringifyMessage = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyMessage(item))
      .filter(Boolean)
      .join(", ");
  }
  return undefined;
};

export const getErrorMessage = (
  error?: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string => {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object") {
    const candidate = error as any;
    const data = candidate.data;

    return (
      stringifyMessage(data?.description) ||
      stringifyMessage(data?.message) ||
      stringifyMessage(data?.error) ||
      stringifyMessage(data) ||
      stringifyMessage(candidate.description) ||
      stringifyMessage(candidate.message) ||
      stringifyMessage(candidate.error) ||
      fallback
    );
  }

  return fallback;
};
