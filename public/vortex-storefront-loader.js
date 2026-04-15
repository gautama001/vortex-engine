(function () {
  "use strict";

  if (window.__VORTEX_STOREFRONT_LOADER_BOOTSTRAPPED__) {
    return;
  }

  window.__VORTEX_STOREFRONT_LOADER_BOOTSTRAPPED__ = true;
  window.__VORTEX_API_ORIGIN__ = "https://deepskyblue-eland-528684.hostingersite.com";

  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="vortex-storefront-loader.js"]');

  var loaderParams = new URLSearchParams();
  loaderParams.set("api_origin", window.__VORTEX_API_ORIGIN__);

  if (currentScript) {
    try {
      var currentScriptUrl = new URL(currentScript.src, window.location.href);

      ["store", "store_id", "debug"].forEach(function (key) {
        var value = currentScriptUrl.searchParams.get(key);

        if (value) {
          loaderParams.set(key, value);
        }
      });
    } catch (_error) {
      // Ignore malformed script URLs and continue with the default loader params.
    }
  }

  var injector = document.createElement("script");
  injector.async = true;
  injector.crossOrigin = "anonymous";
  injector.src =
    window.__VORTEX_API_ORIGIN__ + "/vortex-injector.js?" + loaderParams.toString();

  var target = document.head || document.body || document.documentElement;

  if (!target) {
    return;
  }

  target.appendChild(injector);
})();
