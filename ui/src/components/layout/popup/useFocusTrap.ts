import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElementsString =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableElementsString)
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKeyPress = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Update elements dynamically in case content changed
      focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableElementsString)
      ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
      
      if (focusableElements.length === 0) return;

      const currentFirstElement = focusableElements[0];
      const currentLastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === currentFirstElement) {
          currentLastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === currentLastElement) {
          currentFirstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Auto-focus first element on mount
    firstElement.focus();

    container.addEventListener('keydown', handleTabKeyPress);

    return () => {
      container.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [isActive]);

  return containerRef;
};
