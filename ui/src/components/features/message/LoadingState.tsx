import { CenteredSpinner } from '../../../shared/shared-components/Spinner';

/**
 * Full-page loading state for the Messages page.
 * Shown while conversations are being fetched for the first time.
 */
const LoadingState = () => (
  <CenteredSpinner
    size="lg"
    minHeight="h-[calc(100vh-4rem)]"
    label="Loading messages..."
  />
);

export default LoadingState;
