/**
 * Universal Haptic Feedback utility utilizing HTML5 Vibration API.
 * Gracefully degrades on unsupported browsers and non-mobile hardware.
 */
export const triggerHaptic = (pattern: number | number[] = 15) => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(pattern);
    } catch (err) {
      console.warn('Haptic feedback failed:', err);
    }
  }
};

/**
 * Custom Haptic Patterns for specific interactions
 */
export const HAPTIC_PATTERNS = {
  softClick: 12,       // Gentle tap feedback for standard buttons
  mediumClick: 25,     // Noticeable confirmation tap
  heavyConfirm: 40,    // Strong confirmation (e.g. initiating download)
  successBlast: [40, 50, 40], // Celebrate action success (e.g. finished assembling package)
  doubleTap: [15, 60, 15],   // Quick feedback sequence
  errorWarn: [80, 50, 80]     // Warning/Error alert feedback
};
