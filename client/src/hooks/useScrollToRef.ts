import { RefObject, useCallback } from 'react';
import throttle from 'lodash/throttle';

type TUseScrollToRef = {
  targetRef: RefObject<HTMLDivElement>;
  callback: () => void;
  smoothCallback: () => void;
};

type ThrottledFunction = (() => void) & {
  cancel: () => void;
  flush: () => void;
};

type ScrollToRefReturn = {
  scrollToRef?: ThrottledFunction;
  /** Smooth scroll with short throttle for streaming (so the view doesn't jump). */
  scrollToRefSmoothStreaming?: ThrottledFunction;
  handleSmoothToRef: React.MouseEventHandler<HTMLButtonElement>;
};

const STREAMING_THROTTLE_MS = 220;

export default function useScrollToRef({
  targetRef,
  callback,
  smoothCallback,
}: TUseScrollToRef): ScrollToRefReturn {
  const logAndScroll = (behavior: 'instant' | 'smooth', callbackFn: () => void) => {
    targetRef.current?.scrollIntoView({ behavior });
    callbackFn();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollToRef = useCallback(
    throttle(() => logAndScroll('instant', callback), 145, { leading: true }),
    [targetRef],
  );

  // Smooth scroll with shorter throttle for use during streaming (less jumpy).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollToRefSmoothStreaming = useCallback(
    throttle(() => logAndScroll('smooth', callback), STREAMING_THROTTLE_MS, { leading: true }),
    [targetRef],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollToRefSmooth = useCallback(
    throttle(() => logAndScroll('smooth', smoothCallback), 750, { leading: true }),
    [targetRef],
  );

  const handleSmoothToRef: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    scrollToRefSmooth();
  };

  return {
    scrollToRef,
    scrollToRefSmoothStreaming,
    handleSmoothToRef,
  };
}
