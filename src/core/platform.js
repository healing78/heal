import { Capacitor } from '@capacitor/core';

export const MOBILE_BREAKPOINT = 768;

/**
 * Returns runtime platform and viewport environment details.
 * Supports PC Web, Mobile Web (PWA), Android, and iOS.
 */
export const getPlatformInfo = () => {
  const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
  const isNative = Capacitor.isNativePlatform();
  const isMobileViewport =
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;

  return {
    platform,
    isNative,
    isMobileViewport
  };
};
