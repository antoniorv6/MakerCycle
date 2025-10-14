// Cookie consent management utility
// Framework-agnostic implementation for GDPR/LOPDGDD compliance

export const usesNonEssentialCookies = false; // Single source of truth

export type CookieConsent = 'accepted' | 'rejected' | 'custom';

export interface CookiePreferences {
  analytics?: boolean;
  marketing?: boolean;
  functional?: boolean;
}

export interface CustomConsent {
  type: 'custom';
  prefs: CookiePreferences;
}

// Check if banner should be shown
export function shouldShowBanner(): boolean {
  if (!usesNonEssentialCookies) return false;
  return !localStorage.getItem('cookieConsent');
}

// Get current consent status
export function getCookieConsent(): CookieConsent | CustomConsent | null {
  if (!usesNonEssentialCookies) return null;
  
  const stored = localStorage.getItem('cookieConsent');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return stored as CookieConsent;
  }
}

// Accept all cookies
export function onAcceptAll(): void {
  if (!usesNonEssentialCookies) return;
  
  localStorage.setItem('cookieConsent', 'accepted');
  loadNonEssentialScripts();
}

// Reject all non-essential cookies
export function onRejectAll(): void {
  if (!usesNonEssentialCookies) return;
  
  localStorage.setItem('cookieConsent', 'rejected');
}

// Save custom preferences
export function onSaveCustom(prefs: CookiePreferences): void {
  if (!usesNonEssentialCookies) return;
  
  const customConsent: CustomConsent = {
    type: 'custom',
    prefs
  };
  
  localStorage.setItem('cookieConsent', JSON.stringify(customConsent));
  loadAllowedCategories(prefs);
}

// Load non-essential scripts (placeholder - implement based on your analytics/tracking)
function loadNonEssentialScripts(): void {
  // Only called when usesNonEssentialCookies is true
  // Add your analytics, marketing, or other non-essential scripts here
}

// Load only allowed categories (placeholder)
function loadAllowedCategories(prefs: CookiePreferences): void {
  // Only called when usesNonEssentialCookies is true
  // Load scripts based on user preferences
}

// Check if specific category is allowed
export function isCategoryAllowed(category: keyof CookiePreferences): boolean {
  if (!usesNonEssentialCookies) return false;
  
  const consent = getCookieConsent();
  if (consent === 'accepted') return true;
  if (consent === 'rejected') return false;
  if (consent && typeof consent === 'object' && consent.type === 'custom') {
    return consent.prefs[category] || false;
  }
  
  return false;
}

// Clear consent (for testing or user request)
export function clearCookieConsent(): void {
  localStorage.removeItem('cookieConsent');
}
