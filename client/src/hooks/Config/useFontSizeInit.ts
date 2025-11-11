import { applyFontSize } from '@librechat/client';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { fontSizeAtom } from '~/store/fontSize';

/**
 * Hook to initialize the CSS variable --markdown-font-size on app startup
 * This ensures that markdown headings have the correct font sizes from the beginning
 */
export default function useFontSizeInit() {
  const fontSize = useAtomValue(fontSizeAtom);

  useEffect(() => {
    // Apply the font size CSS variable on mount
    applyFontSize(fontSize);
  }, [fontSize]);
}
