/**
 * When true, enables the unified status bar + sequential preview during assistant streaming.
 * Default (unset or not "true") matches upstream/main chat UX (inline THINK/tool UI, thinking dot).
 */
export const showUnifiedStreamingUi = import.meta.env.VITE_UNIFIED_STREAMING_UI === 'true';
