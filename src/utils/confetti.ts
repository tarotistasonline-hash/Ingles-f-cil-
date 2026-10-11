import confetti from 'canvas-confetti';

// Palette matching the app's aesthetic: warm gold, vibrant amber, emerald, violet, sky
const BRAND_COLORS = ['#F59E0B', '#FBBF24', '#10B981', '#38BDF8', '#A855F7', '#EC4899'];

/**
 * Trigger a lightweight celebratory confetti burst
 */
export function triggerConfetti(options?: confetti.Options) {
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.65 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
      zIndex: 9999,
      ...options,
    });
  } catch (err) {
    // Graceful fallback if canvas is restricted
  }
}

/**
 * Trigger a grand celebration effect with dual cannons (left & right)
 * Ideal for completing a full roleplay simulation session or mastering a module!
 */
export function triggerSuperConfetti() {
  try {
    const end = Date.now() + 1.2 * 1000;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
        zIndex: 9999,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Gentle star burst celebration
 */
export function triggerStarConfetti() {
  try {
    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.6 },
      colors: BRAND_COLORS,
      shapes: ['star', 'circle'],
      scalar: 1.2,
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  } catch (err) {
    // Graceful fallback
  }
}
