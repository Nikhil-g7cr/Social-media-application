import React from 'react';
import type { BasePopupProps } from '../popup/BasePopup';

export enum PostPopupMode {
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
  SHARE = "SHARE",
  REPORT = "REPORT",
  NONE = "NONE"
}

export interface PopupPayload {
  postId?: string;
  commentId?: string;
  highlightComment?: string;
  source?: string;
  initialMediaIndex?: number;
  [key: string]: any; // Future-proofing
}

export interface PopupState {
  isOpen: boolean;
  mode: PostPopupMode;
  payload?: PopupPayload;
}

export interface PopupLifecycle {
  onOpen?: (payload?: PopupPayload) => void;
  beforeClose?: () => boolean | Promise<boolean>;
  onClose?: () => void;
}

export interface PopupDefinition {
  mode: PostPopupMode;
  component: React.LazyExoticComponent<React.FC<any>> | React.FC<any> | null;
  size?: BasePopupProps['size'];
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preload?: () => void;
  lifecycle?: PopupLifecycle;
}
