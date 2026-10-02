import { useEffect, useRef } from 'react';

interface ModalPhoneBackOptions {
  isOpen: boolean;
  onBack: () => void;
  modalKey: string;
}

/**
 * Universal Mobile Phone / Browser Back Button Interceptor for Modals & Drawers.
 * 
 * Prevents the browser from accidentally exiting the website or closing the tab
 * when a user taps the phone's back button or uses the back swipe gesture.
 * Instead, it closes the currently open modal/drawer in 1 step.
 */
export function useModalPhoneBack({ isOpen, onBack, modalKey }: ModalPhoneBackOptions) {
  const isPushedRef = useRef(false);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    // Push a distinct history state entry for this modal
    const historyState = { furnituraModal: modalKey, timestamp: Date.now() };
    window.history.pushState(historyState, '');
    isPushedRef.current = true;

    const handlePopState = (_e: PopStateEvent) => {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        onBackRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal is closed via UI button (X, backdrop click, or action)
      // gracefully pop our state if it's still at the top of history
      if (isPushedRef.current) {
        isPushedRef.current = false;
        if (window.history.state?.furnituraModal === modalKey) {
          window.history.back();
        }
      }
    };
  }, [isOpen, modalKey]);
}
