export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", name, params);
}
