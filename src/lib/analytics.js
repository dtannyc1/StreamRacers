
export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else {
    console.warn("GTM/GA4 not initialized yet.");
  }
};