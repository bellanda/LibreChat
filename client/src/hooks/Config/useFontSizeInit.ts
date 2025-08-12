import { applyFontSize } from '@librechat/client';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import store from '~/store';

/**
 * Hook to initialize the CSS variable --markdown-font-size on app startup
 * This ensures that markdown headings have the correct font sizes from the beginning
 */
export default function useFontSizeInit() {
  const fontSize = useRecoilValue(store.fontSize);

  useEffect(() => {
    // Apply the font size CSS variable on mount
    applyFontSize(fontSize);
  }, [fontSize]);
}
