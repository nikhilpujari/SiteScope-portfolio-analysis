(function () {
    const endpoint = window.__ANALYTICS_ENDPOINT__ || "http://localhost:3000/track";
    const data = {
      url: window.location.pathname,
      referrer: document.referrer,
      ua: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    };
  
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  })();