import { PostPopupMode } from './types';
import type { PopupDefinition } from './types';
import { postPopupRegistry } from './registry';

export class PostPopupFactory {
  static create(mode: PostPopupMode): PopupDefinition {
    const definition = postPopupRegistry.get(mode);
    
    if (!definition) {
      console.warn(`Popup definition not found for mode: ${mode}. Falling back to NONE.`);
      return postPopupRegistry.get(PostPopupMode.NONE)!;
    }

    return definition;
  }
}
