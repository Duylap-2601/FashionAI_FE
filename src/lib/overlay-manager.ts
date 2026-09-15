type OverlayCloseHandler = () => boolean | void;

interface OverlayEntry {
  id: string;
  close: OverlayCloseHandler;
}

const overlayStack: OverlayEntry[] = [];

export const overlayManager = {
  /**
   * Registers an overlay close callback.
   * If an overlay with the same id is already registered, it is updated.
   * Returns an unregister function for easy useEffect cleanup.
   */
  register(id: string, close: OverlayCloseHandler): () => void {
    this.unregister(id);
    overlayStack.push({ id, close });
    return () => this.unregister(id);
  },

  /**
   * Unregisters an overlay by id.
   */
  unregister(id: string): void {
    const index = overlayStack.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      overlayStack.splice(index, 1);
    }
  },

  /**
   * Dismisses the topmost registered overlay.
   * Returns true if an overlay was dismissed, false otherwise.
   */
  dismissTop(): boolean {
    const top = overlayStack.pop();
    if (top) {
      const result = top.close();
      return result !== false;
    }
    return false;
  },

  /**
   * Returns whether any overlays are currently registered.
   */
  hasOverlays(): boolean {
    return overlayStack.length > 0;
  },

  /**
   * Clears all registered overlays.
   */
  clear(): void {
    overlayStack.length = 0;
  },
};

/**
 * Dispatches an Escape key event to trigger dismissal of open Radix UI / Vaul / DOM dialogs.
 * Returns true if an open dialog/drawer was found and dispatched to.
 */
export function dispatchEscapeToDom(): boolean {
  if (typeof document === 'undefined') return false;

  const activeOverlay = document.querySelector(
    '[role="dialog"], [role="alertdialog"], [data-slot="dialog-content"], [data-vaul-drawer][data-state="open"]'
  );

  if (activeOverlay) {
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(escEvent);
    return true;
  }

  return false;
}
