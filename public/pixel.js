(function() {
  const script = document.currentScript;
  const apiKey = script.getAttribute('data-key');
  const endpoint = script.getAttribute('data-endpoint') || 'http://localhost:3000/api/track';

  let startTime = Date.now();
  let duration = 0;
  let heartbeatInterval;
  let hasSentFinal = false;

  // Generate simple hash
  function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Get or create visitor ID
  function getVisitorId() {
    let id = localStorage.getItem('_jb_visitor');
    if (!id) {
      id = generateHash(navigator.userAgent + Math.random().toString());
      localStorage.setItem('_jb_visitor', id);
    }
    return id;
  }

  // Get or create session ID
  function getSessionId() {
    let id = sessionStorage.getItem('_jb_session');
    if (!id) {
      id = generateHash(Date.now().toString() + Math.random().toString());
      sessionStorage.setItem('_jb_session', id);
    }
    return id;
  }

  // Send tracking data
  function track(finalDuration) {
    const data = {
      visitor_hash: getVisitorId(),
      session_id: getSessionId(),
      referrer: document.referrer || null,
      page_url: window.location.pathname,
      duration: finalDuration !== undefined ? finalDuration : duration
    };

    fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(() => {});
  }

  // Update duration every 5 seconds
  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      duration = Math.round((Date.now() - startTime) / 1000);
    }, 5000);
  }

  // Send final duration
  function sendFinal() {
    if (hasSentFinal) return;
    hasSentFinal = true;
    duration = Math.round((Date.now() - startTime) / 1000);
    track(duration);
  }

  // Track on page visibility change (tab switch, minimize)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendFinal();
    }
  });

  // Track on page unload
  window.addEventListener('pagehide', sendFinal);

  // Initialize
  track(0); // Initial pageview
  startHeartbeat();
})();