import React, { useState, useCallback, useMemo } from 'react';
import { PostPopupMode } from './types';
import type { PopupPayload, PopupState } from './types';
import { PostPopupContext } from './context/PostPopupContext';
import { PostPopup } from './PostPopup';
import { PostPopupFactory } from './PostPopupFactory';

export const PostPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PopupState>({
    isOpen: false,
    mode: PostPopupMode.NONE,
    payload: undefined,
  });

  const open = useCallback(async (mode: PostPopupMode, payload?: PopupPayload) => {
    const definition = PostPopupFactory.create(mode);
    
    if (definition.lifecycle?.onOpen) {
      definition.lifecycle.onOpen(payload);
    }

    setState({ isOpen: true, mode, payload });
  }, []);

  const close = useCallback(async () => {
    const definition = PostPopupFactory.create(state.mode);
    
    if (definition.lifecycle?.beforeClose) {
      const canClose = await definition.lifecycle.beforeClose();
      if (!canClose) return;
    }

    if (definition.lifecycle?.onClose) {
      definition.lifecycle.onClose();
    }

    setState(prev => ({ ...prev, isOpen: false }));
    
    // Reset mode and payload after animation finishes (approx 300ms)
    setTimeout(() => {
      setState({ isOpen: false, mode: PostPopupMode.NONE, payload: undefined });
    }, 300);
  }, [state.mode]);

  const update = useCallback((newPayload: PopupPayload) => {
    setState(prev => ({
      ...prev,
      payload: { ...prev.payload, ...newPayload }
    }));
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    open,
    close,
    update
  }), [state, open, close, update]);

  return (
    <PostPopupContext.Provider value={contextValue}>
      {children}
      <PostPopup state={state} onClose={close} />
    </PostPopupContext.Provider>
  );
};
