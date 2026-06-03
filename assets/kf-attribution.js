/* Kinetic — acquisition attribution forwarder.
 * Captures first-touch UTM params on kineticfam.com and forwards them onto
 * app.kineticfam.com links, so the app can attribute the signup. First-touch
 * wins (persisted in localStorage across pages/visits). Strictly best-effort:
 * wrapped so it can never break a page.
 *
 * To use on a page: <script src="/assets/kf-attribution.js" defer></script>
 */
(function () {
  try {
    var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var STORE_KEY = 'kf_acq';

    var store = {};
    try { store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { store = {}; }

    // First-touch capture: only fill keys we don't already have.
    var qs = new URLSearchParams(location.search || '');
    var changed = false;
    KEYS.forEach(function (k) {
      var v = qs.get(k);
      if (v && !store[k]) { store[k] = String(v).slice(0, 200); changed = true; }
    });
    if (changed && !store.landing_path) {
      store.landing_path = String(location.pathname || '/').slice(0, 200);
    }
    if (changed) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
    }

    // Forward whatever we have onto app-bound links.
    var present = KEYS.filter(function (k) { return store[k]; });
    if (!present.length) return;

    function decorate() {
      var links = document.querySelectorAll('a[href*="app.kineticfam.com"]');
      for (var i = 0; i < links.length; i++) {
        try {
          var u = new URL(links[i].href);
          present.forEach(function (k) {
            if (!u.searchParams.has(k)) u.searchParams.set(k, store[k]);
          });
          links[i].href = u.toString();
        } catch (e) {}
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', decorate);
    } else {
      decorate();
    }
  } catch (e) { /* never break the page */ }
})();
