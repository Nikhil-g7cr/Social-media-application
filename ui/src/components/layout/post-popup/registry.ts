import React from 'react';
import { PostPopupMode } from './types';
import type { PopupDefinition } from './types';

// The registry acts as the single source of truth for popup configurations.
class PopupRegistry {
  private definitions: Map<PostPopupMode, PopupDefinition> = new Map();

  register(definition: PopupDefinition) {
    this.definitions.set(definition.mode, definition);
  }

  get(mode: PostPopupMode): PopupDefinition | undefined {
    return this.definitions.get(mode);
  }

  getAll(): PopupDefinition[] {
    return Array.from(this.definitions.values());
  }
}

export const postPopupRegistry = new PopupRegistry();

// Initialize registry with empty/none state
postPopupRegistry.register({
  mode: PostPopupMode.NONE,
  component: null,
});

const ViewPostScreen = React.lazy(() => import('./screens/ViewPostScreen'));
const ReportPostScreen = React.lazy(() => import('./screens/ReportPostScreen'));
const SharePostScreen = React.lazy(() => import('./screens/SharePostScreen'));
const CreatePostScreen = React.lazy(() => import('./screens/CreatePostScreen'));
const EditPostScreen = React.lazy(() => import('./screens/EditPostScreen'));

postPopupRegistry.register({
  mode: PostPopupMode.VIEW,
  component: ViewPostScreen,
  size: 'lg',
  title: 'View Post',
  showCloseButton: false,
  closeOnBackdrop: true,
  closeOnEscape: true,
});

postPopupRegistry.register({
  mode: PostPopupMode.REPORT,
  component: ReportPostScreen,
  size: 'md',
  title: 'Report Post',
  showCloseButton: false,
  closeOnBackdrop: false,
  closeOnEscape: true,
});

postPopupRegistry.register({
  mode: PostPopupMode.SHARE,
  component: SharePostScreen,
  size: 'md',
  title: 'Share Post',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
});

postPopupRegistry.register({
  mode: PostPopupMode.CREATE,
  component: CreatePostScreen,
  size: 'lg',
  title: 'Create Post',
  showCloseButton: false,
  closeOnBackdrop: false,
  closeOnEscape: true,
});

postPopupRegistry.register({
  mode: PostPopupMode.EDIT,
  component: EditPostScreen,
  size: 'lg',
  title: 'Edit Post',
  showCloseButton: true,
  closeOnBackdrop: false,
  closeOnEscape: true,
});
