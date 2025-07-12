(function () {
  const TRACK_URL = 'https://publicizeanalytics.vercel.app/api/track';
  const domain = window.location.hostname;

  function getFingerprint() {
    const ua = navigator.userAgent || '';
    const browser = (() => {
      if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edg')) return 'Edge';
      if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
      return 'Other';
    })();

    const os = (() => {
      if (navigator.userAgentData?.platform) {
        return navigator.userAgentData.platform;
      }
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (/Android/.test(ua)) return 'Android';
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      return 'Other';
    })();

    const language = navigator.language || 'unknown';

    return { browser, os, location: language };
  }

  function sendEvent(eventType, eventName, extra = {}) {
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        eventName,
        domain,
        extra,
      }),
    }).catch((e) => {
      console.warn('Failed to send analytics event', e);
    });
  }

  function trackPageview() {
    const fp = getFingerprint();
    const extra = {
      ...fp,
      pagePath: window.location.pathname,
      referrer: document.referrer || null,
    };
    sendEvent('pageview', null, extra);
  }

  function publishClick(id, name) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      sendEvent('click', name, { pagePath: window.location.pathname });
    });
  }

  window.publishClick = publishClick;

  trackPageview();
})();
