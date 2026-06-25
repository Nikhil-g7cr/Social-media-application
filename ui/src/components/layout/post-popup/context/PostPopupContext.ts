import { createContext } from 'react';
import { PostPopupMode } from '../types';
import type { PopupPayload, PopupState } from '../types';

export interface PostPopupContextType extends PopupState {
  open: (mode: PostPopupMode, payload?: PopupPayload) => void;
  close: () => void;
  update: (payload: PopupPayload) => void;
}

export const PostPopupContext = createContext<PostPopupContextType | undefined>(undefined);
