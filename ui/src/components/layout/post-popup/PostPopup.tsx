import React, { Suspense } from 'react';
import { BasePopup } from '../popup/BasePopup';
import { PostPopupMode } from './types';
import type { PopupState } from './types';
import { PostPopupFactory } from './PostPopupFactory';
import { ErrorBoundary } from './components/ErrorBoundary';
import Spinner from '../../../shared/shared-components/Spinner';

interface PostPopupProps {
  state: PopupState;
  onClose: () => void;
}

export const PostPopup: React.FC<PostPopupProps> = ({ state, onClose }) => {
  // If mode is NONE, we still might be animating out, but if it's completely closed and mode is NONE, render nothing.
  if (!state.isOpen && state.mode === PostPopupMode.NONE) {
    return null;
  }

  const definition = PostPopupFactory.create(state.mode);
  const ScreenComponent = definition.component;

  if (!ScreenComponent) {
    return null;
  }

  return (
    <BasePopup
      isOpen={state.isOpen}
      onClose={onClose}
      size={definition.size}
      closeOnBackdrop={definition.closeOnBackdrop}
      closeOnEscape={definition.closeOnEscape}
      showCloseButton={definition.showCloseButton}
    >
      <ErrorBoundary>
        <Suspense fallback={
          <div className="p-8 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        }>
          <ScreenComponent payload={state.payload} onClose={onClose} />
        </Suspense>
      </ErrorBoundary>
    </BasePopup>
  );
};
