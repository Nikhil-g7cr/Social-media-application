import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Additional CSS classes (use for color overrides like 'border-red-500') */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

// Static size-to-class mapping — avoids Tailwind JIT purge issues with dynamic strings
const SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-[2px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-10 w-10 border-4',
};

/**
 * Reusable Spinner component.
 *
 * Replaces all inline `animate-spin rounded-full border-*` patterns in the app.
 *
 * @example
 * // Inline button spinner (mutation loading)
 * <Spinner size="xs" />
 *
 * // Section loading spinner
 * <Spinner size="md" />
 *
 * // Page-level spinner
 * <Spinner size="lg" />
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-blue-500 border-t-transparent ${SIZE_CLASSES[size]} ${className}`}
    />
  );
};

/**
 * CenteredSpinner — wraps Spinner in a flex centering container.
 *
 * @example
 * <CenteredSpinner size="lg" minHeight="h-40" />
 */
export const CenteredSpinner: React.FC<SpinnerProps & { minHeight?: string }> = ({
  minHeight = 'h-40',
  label = 'Loading...',
  ...props
}) => (
  <div
    className={`flex items-center justify-center w-full ${minHeight}`}
    role="status"
    aria-label={label}
  >
    <Spinner {...props} label={label} />
  </div>
);

export default Spinner;
